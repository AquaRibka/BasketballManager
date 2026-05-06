import { startTransition, useEffect, useMemo, useState } from 'react';
import {
  ApiClientError,
  getErrorMessage,
  seasonsApi,
  type MatchSummary,
  type SeasonScheduleResponse,
  type SeasonSummary,
} from '../../shared/api/client';

type PageState =
  | { status: 'loading' }
  | { status: 'no-season' }
  | { status: 'no-schedule'; season: SeasonSummary }
  | {
      status: 'success';
      schedule: SeasonScheduleResponse;
      season: SeasonSummary;
    }
  | { status: 'error'; message: string };

function formatMatchDate(value: string | null) {
  if (!value) {
    return 'Дата уточняется';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getMatchStatusLabel(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'Завершен';
    case 'LIVE':
      return 'Идёт матч';
    case 'SCHEDULED':
    default:
      return 'Запланирован';
  }
}

function getRoundStatusLabel(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'Раунд завершен';
    case 'LIVE':
      return 'Раунд в процессе';
    case 'SCHEDULED':
    default:
      return 'Раунд ожидает симуляции';
  }
}

function getMatchScore(match: MatchSummary) {
  if (match.homeScore === null || match.awayScore === null) {
    return 'vs';
  }

  return `${match.homeScore}:${match.awayScore}`;
}

export function CalendarPage() {
  const [state, setState] = useState<PageState>({ status: 'loading' });
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  async function loadCalendar(signal?: AbortSignal) {
    try {
      const season = await seasonsApi.getCurrent(signal);

      try {
        const schedule = await seasonsApi.getSchedule(season.id, signal);

        setState({
          status: 'success',
          season,
          schedule,
        });
        return;
      } catch (error) {
        if (signal?.aborted) {
          return;
        }

        if (
          error instanceof ApiClientError &&
          error.statusCode === 404 &&
          error.message === 'Schedule not found'
        ) {
          setState({
            status: 'no-schedule',
            season,
          });
          return;
        }

        throw error;
      }
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      if (
        error instanceof ApiClientError &&
        error.statusCode === 404 &&
        error.message === 'Current season not found'
      ) {
        setState({ status: 'no-season' });
        return;
      }

      setState({
        status: 'error',
        message: getErrorMessage(error),
      });
    }
  }

  useEffect(() => {
    const abortController = new AbortController();

    void loadCalendar(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, []);

  const currentRoundGroup =
    state.status === 'success'
      ? state.schedule.rounds.find((round) => round.round === state.season.currentRound) ?? null
      : null;

  const allMatches = useMemo(
    () => (state.status === 'success' ? state.schedule.rounds.flatMap((round) => round.matches) : []),
    [state],
  );

  const selectedMatch =
    allMatches.find((match) => match.id === selectedMatchId) ??
    currentRoundGroup?.matches[0] ??
    allMatches[0] ??
    null;

  useEffect(() => {
    if (!selectedMatch) {
      setSelectedMatchId(null);
      return;
    }

    setSelectedMatchId((currentId) => currentId ?? selectedMatch.id);
  }, [selectedMatch]);

  async function handleSimulateCurrentRound() {
    if (state.status !== 'success' || isSimulating) {
      return;
    }

    setIsSimulating(true);

    try {
      const simulation = await seasonsApi.simulateCurrentRound(state.season.id);

      startTransition(() => {
        setState((currentState) => {
          if (currentState.status !== 'success') {
            return currentState;
          }

          return {
            status: 'success',
            season: {
              ...currentState.season,
              currentRound: simulation.currentRound,
              status: simulation.seasonStatus,
              finishedAt: simulation.finishedAt,
            },
            schedule: {
              ...currentState.schedule,
              rounds: currentState.schedule.rounds.map((round) =>
                round.round === simulation.round
                  ? {
                      ...round,
                      status: simulation.status,
                      matches: simulation.matches,
                    }
                  : round,
              ),
            },
          };
        });
        setSelectedMatchId(simulation.matches[0]?.id ?? null);
      });
    } catch (error) {
      setState({
        status: 'error',
        message: getErrorMessage(error),
      });
    } finally {
      setIsSimulating(false);
    }
  }

  async function handleCreateSeason() {
    if (isRecovering) {
      return;
    }

    setIsRecovering(true);

    try {
      const year = new Date().getFullYear();
      await seasonsApi.create({
        name: `VTB League MVP ${year}`,
        year,
      });
      await loadCalendar();
    } catch (error) {
      setState({
        status: 'error',
        message: getErrorMessage(error),
      });
    } finally {
      setIsRecovering(false);
    }
  }

  async function handleGenerateSchedule() {
    if (state.status !== 'no-schedule' || isRecovering) {
      return;
    }

    setIsRecovering(true);

    try {
      await seasonsApi.generateSchedule(state.season.id);
      await loadCalendar();
    } catch (error) {
      setState({
        status: 'error',
        message: getErrorMessage(error),
      });
    } finally {
      setIsRecovering(false);
    }
  }

  if (state.status === 'loading') {
    return (
      <section className="panel">
        <p className="section-kicker">Календарь</p>
        <h2>Загружаем сезон и расписание</h2>
        <p className="section-copy">Подтягиваем текущий сезон и матчи по раундам из backend API.</p>
      </section>
    );
  }

  if (state.status === 'no-season') {
    return (
      <section className="panel empty-state-panel">
        <div className="empty-state-card">
          <p className="empty-state-kicker">Schedule</p>
          <h3>Текущий сезон ещё не создан</h3>
          <p>
            В обычном demo seed есть команды и игроки, но может не быть активного сезона. Создай
            его отсюда, и календарь сразу сможет загрузить матчи по раундам.
          </p>
        </div>
        <div className="action-row">
          <button
            className="hero-home-link schedule-action-button"
            type="button"
            disabled={isRecovering}
            onClick={() => {
              void handleCreateSeason();
            }}
          >
            {isRecovering ? 'Создаём сезон...' : 'Создать текущий сезон'}
          </button>
        </div>
      </section>
    );
  }

  if (state.status === 'no-schedule') {
    return (
      <>
        <section className="panel schedule-hero">
          <div className="schedule-hero-header">
            <div>
              <p className="section-kicker">Schedule</p>
              <h2>{state.season.name}</h2>
              <p className="section-copy">
                Сезон уже есть, но матчи по раундам ещё не сгенерированы.
              </p>
            </div>
            <button
              className="hero-home-link schedule-action-button"
              type="button"
              disabled={isRecovering}
              onClick={() => {
                void handleGenerateSchedule();
              }}
            >
              {isRecovering ? 'Генерируем...' : 'Сгенерировать календарь'}
            </button>
          </div>
        </section>
        <section className="panel empty-state-panel">
          <div className="empty-state-card">
            <p className="empty-state-kicker">Round Groups</p>
            <h3>Расписание пока отсутствует</h3>
            <p>
              После генерации появятся раунды, карточки матчей, статусы и действие симуляции для
              текущего тура.
            </p>
          </div>
        </section>
      </>
    );
  }

  if (state.status === 'error') {
    return (
      <section className="panel">
        <p className="section-kicker">Календарь</p>
        <h2>Календарь загрузить не удалось</h2>
        <div className="message error">
          <strong>Backend не вернул расписание сезона.</strong>
          <p>{state.message}</p>
          <p>Если это dev-база без сезона, попробуй создать сезон на странице календаря.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="panel schedule-hero">
        <div className="schedule-hero-header">
          <div>
            <p className="section-kicker">Schedule</p>
            <h2>{state.season.name}</h2>
            <p className="section-copy">
              Текущий раунд: {state.season.currentRound} · Всего раундов: {state.schedule.totalRounds}
            </p>
          </div>
          <button
            className="hero-home-link schedule-action-button"
            type="button"
            disabled={!currentRoundGroup || isSimulating || currentRoundGroup.status === 'COMPLETED'}
            onClick={() => {
              void handleSimulateCurrentRound();
            }}
          >
            {isSimulating ? 'Симулируем раунд...' : 'Симулировать текущий раунд'}
          </button>
        </div>

        <div className="team-summary-grid">
          <article className="summary-card">
            <span>Статус сезона</span>
            <strong>{state.season.status}</strong>
          </article>
          <article className="summary-card">
            <span>Матчей в календаре</span>
            <strong>{state.schedule.totalMatches}</strong>
          </article>
          <article className="summary-card">
            <span>Статус текущего раунда</span>
            <strong>{currentRoundGroup ? getRoundStatusLabel(currentRoundGroup.status) : 'Нет данных'}</strong>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="roster-toolbar-copy">
          <p className="section-kicker">Round Groups</p>
          <h2>Матчи сезона по турам</h2>
          <p className="section-copy">
            Открывай карточки матчей, следи за статусом и симулируй текущий раунд.
          </p>
        </div>

        <div className="round-list">
          {state.schedule.rounds.map((round) => {
            const isCurrentRound = round.round === state.season.currentRound;

            return (
              <section
                className={`round-group${isCurrentRound ? ' is-current' : ''}`}
                key={round.round}
              >
                <div className="round-header">
                  <div>
                    <h3>Раунд {round.round}</h3>
                    <p>{getRoundStatusLabel(round.status)}</p>
                  </div>
                  <span className={`round-status-badge status-${round.status.toLowerCase()}`}>
                    {round.status}
                  </span>
                </div>

                <div className="match-card-grid">
                  {round.matches.map((match) => {
                    const isSelected = selectedMatch?.id === match.id;

                    return (
                      <article
                        className={`match-card${isSelected ? ' is-selected' : ''}`}
                        key={match.id}
                      >
                        <button
                          className="match-card-button"
                          type="button"
                          onClick={() => {
                            setSelectedMatchId(match.id);
                          }}
                        >
                          <div className="match-card-top">
                            <span className="match-date">{formatMatchDate(match.date)}</span>
                            <span className={`match-status status-${match.status.toLowerCase()}`}>
                              {getMatchStatusLabel(match.status)}
                            </span>
                          </div>
                          <div className="match-teams">
                            <div className="match-team-row">
                              <strong>{match.homeTeam.shortName}</strong>
                              <span>{match.homeTeam.name}</span>
                            </div>
                            <div className="match-score">{getMatchScore(match)}</div>
                            <div className="match-team-row">
                              <strong>{match.awayTeam.shortName}</strong>
                              <span>{match.awayTeam.name}</span>
                            </div>
                          </div>
                          <div className="match-card-footer">
                            <span>Раунд {match.round ?? round.round}</span>
                            <span className="match-link">К матчу</span>
                          </div>
                        </button>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <p className="section-kicker">Match Card</p>
        <h2>Выбранный матч</h2>
        {selectedMatch ? (
          <div className="selected-match-card">
            <div className="selected-match-header">
              <div>
                <strong>
                  {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}
                </strong>
                <p>
                  Раунд {selectedMatch.round ?? state.season.currentRound} ·{' '}
                  {formatMatchDate(selectedMatch.date)}
                </p>
              </div>
              <span className={`round-status-badge status-${selectedMatch.status.toLowerCase()}`}>
                {getMatchStatusLabel(selectedMatch.status)}
              </span>
            </div>

            <div className="selected-match-score">
              <div>
                <span>{selectedMatch.homeTeam.shortName}</span>
                <strong>{selectedMatch.homeScore ?? '-'}</strong>
              </div>
              <div className="selected-match-divider">:</div>
              <div>
                <span>{selectedMatch.awayTeam.shortName}</span>
                <strong>{selectedMatch.awayScore ?? '-'}</strong>
              </div>
            </div>

            <div className="selected-match-meta">
              <span>ID матча: {selectedMatch.id}</span>
              <span>
                Победитель:{' '}
                {selectedMatch.winnerTeamId
                  ? selectedMatch.winnerTeamId === selectedMatch.homeTeam.id
                    ? selectedMatch.homeTeam.shortName
                    : selectedMatch.awayTeam.shortName
                  : 'еще не определен'}
              </span>
            </div>
          </div>
        ) : (
          <p>Матчи пока недоступны для просмотра.</p>
        )}
      </section>
    </>
  );
}
