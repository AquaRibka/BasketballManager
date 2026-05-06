import { startTransition, useEffect, useMemo, useState } from 'react';
import { StateNotice } from '../../components/state/StateNotice';
import { StatePanel } from '../../components/state/StatePanel';
import {
  ApiClientError,
  getErrorMessage,
  savesApi,
  seasonsApi,
  type CareerSaveState,
  type MatchSummary,
  type SeasonScheduleResponse,
  type SeasonSummary,
} from '../../shared/api/client';
import {
  clearActiveSaveId,
  readActiveSaveId,
} from '../../shared/career/active-save-storage';

type CalendarPageProps = {
  matchId: string | null;
  onNavigate: (path: string) => void;
};

type PageState =
  | { status: 'loading' }
  | { status: 'no-season' }
  | { status: 'no-schedule'; season: SeasonSummary }
  | {
      status: 'success';
      source: 'save' | 'season';
      saveId?: string;
      schedule: SeasonScheduleResponse;
      season: CareerSaveState['season'] | SeasonSummary;
    }
  | { status: 'error'; message: string };

function isMissingActiveSave(error: unknown) {
  return error instanceof ApiClientError && error.statusCode === 404;
}

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

function getSeasonStatusLabel(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'Сезон завершён';
    case 'IN_PROGRESS':
    default:
      return 'Сезон в процессе';
  }
}

function getMatchScore(match: MatchSummary) {
  if (match.homeScore === null || match.awayScore === null) {
    return 'vs';
  }

  return `${match.homeScore}:${match.awayScore}`;
}

export function CalendarPage({ matchId, onNavigate }: CalendarPageProps) {
  const [state, setState] = useState<PageState>({ status: 'loading' });
  const [requestKey, setRequestKey] = useState(0);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  function handleBackToCalendar() {
    setSelectedMatchId(null);
    onNavigate('/calendar');

    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }

  async function loadCalendar(signal?: AbortSignal) {
    const activeSaveId = readActiveSaveId();

    if (activeSaveId) {
      try {
        const saveState = await savesApi.getById(activeSaveId, signal);

        setState({
          status: 'success',
          source: 'save',
          saveId: saveState.save.id,
          season: saveState.season,
          schedule: saveState.schedule,
        });
        return;
      } catch (error) {
        if (signal?.aborted) {
          return;
        }

        if (!isMissingActiveSave(error)) {
          setState({
            status: 'error',
            message: getErrorMessage(error),
          });
          return;
        }

        clearActiveSaveId();
      }
    }

    try {
      const season = await seasonsApi.getCurrent(signal);

      try {
        const schedule = await seasonsApi.getSchedule(season.id, signal);

        setState({
          status: 'success',
          source: 'season',
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
  }, [requestKey]);

  function retryLoadCalendar() {
    setRequestKey((current) => current + 1);
  }

  const currentRoundGroup =
    state.status === 'success'
      ? state.schedule.rounds.find((round) => round.round === state.season.currentRound) ?? null
      : null;

  const allMatches = useMemo(
    () => (state.status === 'success' ? state.schedule.rounds.flatMap((round) => round.matches) : []),
    [state],
  );

  useEffect(() => {
    if (matchId) {
      setSelectedMatchId(matchId);
    }
  }, [matchId]);

  const selectedMatch =
    matchId || selectedMatchId
      ? allMatches.find((match) => match.id === (matchId ?? selectedMatchId)) ?? null
      : null;

  useEffect(() => {
    if (!selectedMatch) {
      setSelectedMatchId(null);
      return;
    }

    if (matchId) {
      setSelectedMatchId(matchId);
    }
  }, [matchId, selectedMatch]);

  async function handleSimulateCurrentRound() {
    if (state.status !== 'success' || isSimulating) {
      return;
    }

    setIsSimulating(true);

    try {
      const simulation = await seasonsApi.simulateCurrentRound(state.season.id);

      if (state.source === 'save' && state.saveId) {
        if (simulation.seasonStatus !== 'COMPLETED') {
          await seasonsApi.advanceToNextRound(state.season.id);
        }

        const saveState = await savesApi.getById(state.saveId);
        const nextCurrentRound = saveState.schedule.rounds.find(
          (round) => round.round === saveState.season.currentRound,
        );

        setState({
          status: 'success',
          source: 'save',
          saveId: saveState.save.id,
          season: saveState.season,
          schedule: saveState.schedule,
        });
        setSelectedMatchId(nextCurrentRound?.matches[0]?.id ?? simulation.matches[0]?.id ?? null);
        return;
      }

      startTransition(() => {
        setState((currentState) => {
          if (currentState.status !== 'success') {
            return currentState;
          }

          return {
            status: 'success',
            source: currentState.source,
            saveId: currentState.saveId,
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

  const selectedMatchWinner =
    selectedMatch && selectedMatch.winnerTeamId
      ? selectedMatch.winnerTeamId === selectedMatch.homeTeam.id
        ? selectedMatch.homeTeam
        : selectedMatch.awayTeam
      : null;

  const selectedMatchStats = selectedMatch
    ? [
        {
          label: 'Статус матча',
          value: getMatchStatusLabel(selectedMatch.status),
        },
        {
          label: 'Дата игры',
          value: formatMatchDate(selectedMatch.date),
        },
        {
          label: 'Победитель',
          value: selectedMatchWinner?.name ?? 'Пока не определён',
        },
        {
          label: 'Сыгран',
          value: selectedMatch.playedAt ? formatMatchDate(selectedMatch.playedAt) : 'Еще нет',
        },
        {
          label: 'Рейтинг хозяев',
          value:
            selectedMatch.homeTeam.rating !== undefined
              ? String(selectedMatch.homeTeam.rating)
              : 'Нет данных',
        },
        {
          label: 'Рейтинг гостей',
          value:
            selectedMatch.awayTeam.rating !== undefined
              ? String(selectedMatch.awayTeam.rating)
              : 'Нет данных',
        },
      ]
    : [];

  if (state.status === 'loading') {
    return (
      <StatePanel
        eyebrow="Loading"
        title="Загружаем сезон и расписание"
        description="Подтягиваем текущий сезон, матчи по раундам и готовим действия симуляции."
      />
    );
  }

  if (state.status === 'no-season') {
    return (
      <StatePanel
        eyebrow="Empty"
        title="Текущий сезон ещё не создан"
        description="В demo seed могут быть команды и игроки, но без активного сезона календарь ещё пуст. Создай сезон, и расписание можно будет подготовить отсюда же."
        actionLabel={isRecovering ? 'Создаём сезон...' : 'Создать текущий сезон'}
        actionDisabled={isRecovering}
        onAction={() => {
          void handleCreateSeason();
        }}
      />
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
        <StatePanel
          eyebrow="Empty"
          title="Расписание пока отсутствует"
          description="После генерации появятся раунды, карточки матчей, статусы и действие симуляции для текущего тура."
        />
      </>
    );
  }

  if (state.status === 'error') {
    return (
      <StatePanel
        eyebrow="Error"
        title="Календарь загрузить не удалось"
        description={`${state.message} Если это dev-база без сезона, сначала создай сезон и повтори загрузку.`}
        actionLabel="Повторить загрузку"
        onAction={retryLoadCalendar}
      />
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
            <strong>{getSeasonStatusLabel(state.season.status)}</strong>
          </article>
          <article className="summary-card">
            <span>Матчей в календаре</span>
            <strong>{state.schedule.totalMatches}</strong>
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
                          aria-label={`${match.homeTeam.name} vs ${match.awayTeam.name}, ${getMatchStatusLabel(match.status)}`}
                          onClick={() => {
                            setSelectedMatchId(match.id);
                            onNavigate(`/calendar/matches/${match.id}`);
                          }}
                        >
                          <div className="match-card-top">
                            <span className="match-date">{formatMatchDate(match.date)}</span>
                          </div>
                          <div className="match-team-row">
                            <strong>{match.homeTeam.shortName}</strong>
                            <span>{match.homeTeam.name}</span>
                          </div>
                          <div className="match-score">{getMatchScore(match)}</div>
                          <div className="match-team-row">
                            <strong>{match.awayTeam.shortName}</strong>
                            <span>{match.awayTeam.name}</span>
                          </div>
                          <div className="match-card-footer">
                            <span className={`match-status status-${match.status.toLowerCase()}`}>
                              {getMatchStatusLabel(match.status)}
                            </span>
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
        <div className="match-detail-heading">
          <div>
            <p className="section-kicker">Match Detail</p>
            <h2>Подробности матча</h2>
          </div>
          {matchId ? (
            <button className="ghost-button" type="button" onClick={handleBackToCalendar}>
              Назад к календарю
            </button>
          ) : null}
        </div>
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

            <div className="match-detail-teams">
              <article
                className={`match-side-card${
                  selectedMatchWinner?.id === selectedMatch.homeTeam.id ? ' is-winner' : ''
                }`}
              >
                <span className="match-side-label">Home</span>
                <strong>{selectedMatch.homeTeam.shortName}</strong>
                <p>{selectedMatch.homeTeam.name}</p>
              </article>
              <div className="selected-match-divider selected-match-divider-large">vs</div>
              <article
                className={`match-side-card${
                  selectedMatchWinner?.id === selectedMatch.awayTeam.id ? ' is-winner' : ''
                }`}
              >
                <span className="match-side-label">Away</span>
                <strong>{selectedMatch.awayTeam.shortName}</strong>
                <p>{selectedMatch.awayTeam.name}</p>
              </article>
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

            <div className="match-basic-stats">
              {selectedMatchStats.map((item) => (
                <article className="attribute-card" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
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
          <StateNotice
            title="Матчи пока недоступны"
            description="Когда в расписании появятся встречи, здесь можно будет открыть подробности выбранного матча."
          />
        )}
      </section>
    </>
  );
}
