import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { StateNotice } from '../../components/state/StateNotice';
import { StatePanel } from '../../components/state/StatePanel';
import {
  ApiClientError,
  getErrorMessage,
  savesApi,
  seasonsApi,
  teamsApi,
  type CareerSaveState,
  type MatchSummary,
  type TeamSummary,
} from '../../shared/api/client';

const ACTIVE_SAVE_STORAGE_KEY = 'bm-active-save-id';

type PageState =
  | { status: 'loading' }
  | { status: 'create-save'; teams: TeamSummary[]; message?: string }
  | { status: 'success'; saveState: CareerSaveState }
  | { status: 'error'; message: string };

type CreateSaveFormState = {
  name: string;
  teamId: string;
};

const INITIAL_FORM_STATE: CreateSaveFormState = {
  name: 'My Career',
  teamId: '',
};

function readActiveSaveId() {
  return window.localStorage.getItem(ACTIVE_SAVE_STORAGE_KEY);
}

function writeActiveSaveId(saveId: string) {
  window.localStorage.setItem(ACTIVE_SAVE_STORAGE_KEY, saveId);
}

function clearActiveSaveId() {
  window.localStorage.removeItem(ACTIVE_SAVE_STORAGE_KEY);
}

function formatDashboardDate(value: string | null) {
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

function formatSaveDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
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

function getNextMatch(saveState: CareerSaveState) {
  const selectedTeamId = saveState.save.teamId;
  const roundsFromCurrent = saveState.schedule.rounds
    .filter((round) => round.round >= saveState.season.currentRound)
    .sort((left, right) => left.round - right.round);

  for (const round of roundsFromCurrent) {
    const nextMatch = round.matches.find((match) => {
      const isSelectedTeamMatch =
        match.homeTeam.id === selectedTeamId || match.awayTeam.id === selectedTeamId;

      return isSelectedTeamMatch && match.status !== 'COMPLETED';
    });

    if (nextMatch) {
      return nextMatch;
    }
  }

  return null;
}

function getSelectedTeamStanding(saveState: CareerSaveState) {
  return saveState.standings.items.find((item) => item.teamId === saveState.save.teamId) ?? null;
}

function getTeamOpponent(match: MatchSummary, teamId: string) {
  if (match.homeTeam.id === teamId) {
    return {
      venue: 'Домашний матч',
      opponent: match.awayTeam,
      teamLabel: 'vs',
    };
  }

  return {
    venue: 'Выездной матч',
    opponent: match.homeTeam,
    teamLabel: '@',
  };
}

export function SeasonPage() {
  const [state, setState] = useState<PageState>({ status: 'loading' });
  const [requestKey, setRequestKey] = useState(0);
  const [createSaveForm, setCreateSaveForm] = useState<CreateSaveFormState>(INITIAL_FORM_STATE);
  const [isCreatingSave, setIsCreatingSave] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSimulatingSeason, setIsSimulatingSeason] = useState(false);
  const [isStartingNextSeason, setIsStartingNextSeason] = useState(false);
  const [simulationMessage, setSimulationMessage] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadDashboard() {
      const activeSaveId = readActiveSaveId();

      if (!activeSaveId) {
        await loadTeamsForSaveCreation(abortController.signal);
        return;
      }

      try {
        const saveState = await savesApi.getById(activeSaveId, abortController.signal);
        setState({
          status: 'success',
          saveState,
        });
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        if (error instanceof ApiClientError && error.statusCode === 404) {
          clearActiveSaveId();
          await loadTeamsForSaveCreation(abortController.signal, 'Активное сохранение не найдено. Создай карьеру заново.');
          return;
        }

        setState({
          status: 'error',
          message: getErrorMessage(error),
        });
      }
    }

    async function loadTeamsForSaveCreation(signal?: AbortSignal, message?: string) {
      try {
        const teams = await teamsApi.list(signal);
        setCreateSaveForm((current) => ({
          ...current,
          teamId: current.teamId || teams[0]?.id || '',
        }));
        setState({
          status: 'create-save',
          teams,
          message,
        });
      } catch (error) {
        if (signal?.aborted) {
          return;
        }

        setState({
          status: 'error',
          message: getErrorMessage(error),
        });
      }
    }

    void loadDashboard();

    return () => {
      abortController.abort();
    };
  }, [requestKey]);

  function retryLoadDashboard() {
    setRequestKey((current) => current + 1);
  }

  function handleCreateSaveFieldChange(field: keyof CreateSaveFormState, value: string) {
    setCreateSaveForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function refreshActiveSave(saveId: string, signal?: AbortSignal) {
    const saveState = await savesApi.getById(saveId, signal);
    setState({
      status: 'success',
      saveState,
    });

    return saveState;
  }

  async function handleCreateSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isCreatingSave || !createSaveForm.teamId) {
      return;
    }

    setIsCreatingSave(true);

    try {
      const saveState = await savesApi.create({
        name: createSaveForm.name,
        teamId: createSaveForm.teamId,
      });
      writeActiveSaveId(saveState.save.id);
      setState({
        status: 'success',
        saveState,
      });
    } catch (error) {
      setState((current) =>
        current.status === 'create-save'
          ? {
              ...current,
              message: getErrorMessage(error),
            }
          : current,
      );
    } finally {
      setIsCreatingSave(false);
    }
  }

  async function handleSimulateCurrentRound() {
    if (
      state.status !== 'success' ||
      isSimulating ||
      isSimulatingSeason ||
      state.saveState.season.status === 'COMPLETED'
    ) {
      return;
    }

    setIsSimulating(true);
    setSimulationMessage(null);

    try {
      const simulation = await seasonsApi.simulateCurrentRound(state.saveState.season.id);

      if (simulation.seasonStatus !== 'COMPLETED') {
        await seasonsApi.advanceToNextRound(state.saveState.season.id);
      }

      const refreshedSave = await refreshActiveSave(state.saveState.save.id);
      setSimulationMessage(
        refreshedSave.season.status === 'COMPLETED'
          ? `Сезон завершён. Симулирован последний раунд ${simulation.round}.`
          : `Раунд ${simulation.round} симулирован. Переход выполнен к раунду ${refreshedSave.season.currentRound}.`,
      );
    } catch (error) {
      setSimulationMessage(getErrorMessage(error));
    } finally {
      setIsSimulating(false);
    }
  }

  async function handleSimulateWholeSeason() {
    if (
      state.status !== 'success' ||
      isSimulatingSeason ||
      isSimulating ||
      state.saveState.season.status === 'COMPLETED'
    ) {
      return;
    }

    setIsSimulatingSeason(true);
    setSimulationMessage(null);

    try {
      const simulation = await seasonsApi.simulateRemainingSeason(state.saveState.season.id);
      await refreshActiveSave(state.saveState.save.id);
      setSimulationMessage(
        `Быстрая симуляция завершена. Раундов: ${simulation.simulatedRoundCount}, матчей: ${simulation.simulatedMatches}.`,
      );
    } catch (error) {
      setSimulationMessage(getErrorMessage(error));
    } finally {
      setIsSimulatingSeason(false);
    }
  }

  async function handleStartNextSeason() {
    if (
      state.status !== 'success' ||
      isStartingNextSeason ||
      isSimulating ||
      isSimulatingSeason ||
      state.saveState.season.status !== 'COMPLETED'
    ) {
      return;
    }

    setIsStartingNextSeason(true);
    setSimulationMessage(null);

    try {
      const nextSeasonSave = await savesApi.startNextSeason(state.saveState.save.id);
      setState({
        status: 'success',
        saveState: nextSeasonSave,
      });
      setSimulationMessage(
        `Новый сезон ${nextSeasonSave.season.year} создан. Карьера переведена к раунду ${nextSeasonSave.season.currentRound}.`,
      );
    } catch (error) {
      setSimulationMessage(getErrorMessage(error));
    } finally {
      setIsStartingNextSeason(false);
    }
  }

  const dashboardData = useMemo(() => {
    if (state.status !== 'success') {
      return null;
    }

    const nextMatch = getNextMatch(state.saveState);
    const standing = getSelectedTeamStanding(state.saveState);
    const completedMatches = state.saveState.schedule.rounds.reduce(
      (count, round) => count + round.matches.filter((match) => match.status === 'COMPLETED').length,
      0,
    );
    const totalMatches = state.saveState.schedule.totalMatches;
    const completedRounds = state.saveState.schedule.rounds.filter(
      (round) => round.status === 'COMPLETED',
    ).length;
    const roundProgress =
      state.saveState.season.totalRounds === 0
        ? 0
        : Math.round((completedRounds / state.saveState.season.totalRounds) * 100);
    const matchProgress =
      totalMatches === 0 ? 0 : Math.round((completedMatches / totalMatches) * 100);

    return {
      nextMatch,
      standing,
      completedMatches,
      completedRounds,
      roundProgress,
      matchProgress,
    };
  }, [state]);

  if (state.status === 'loading') {
    return (
      <StatePanel
        eyebrow="Loading"
        title="Загружаем карьеру"
        description="Поднимаем активное сохранение, календарь сезона и текущую таблицу."
      />
    );
  }

  if (state.status === 'error') {
    return (
      <StatePanel
        eyebrow="Error"
        title="Season Dashboard загрузить не удалось"
        description={state.message}
        actionLabel="Повторить загрузку"
        onAction={retryLoadDashboard}
      />
    );
  }

  if (state.status === 'create-save') {
    return (
      <>
        <section className="panel season-dashboard-hero">
          <p className="section-kicker">Career</p>
          <h2>Season Dashboard</h2>
          <p className="section-copy">
            Для главной страницы карьеры нужно активное сохранение. После создания сразу появятся
            выбранная команда, следующий матч, позиция в таблице и прогресс сезона.
          </p>
        </section>

        <section className="panel">
          <div className="dashboard-create-header">
            <div>
              <p className="section-kicker">New Save</p>
              <h2>Создать карьеру</h2>
            </div>
            <p className="section-copy">
              Выбери клуб и зафиксируй стартовую точку карьеры прямо из frontend.
            </p>
          </div>

          {state.message ? (
            <div className="message error">
              <p>{state.message}</p>
            </div>
          ) : null}

          {state.teams.length === 0 ? (
            <StateNotice
              title="Команды пока недоступны"
              description="Сначала создай команды или проверь, что backend и база данных доступны."
              actionLabel="Обновить список"
              onAction={retryLoadDashboard}
            />
          ) : (
            <form className="career-save-form" onSubmit={handleCreateSave}>
              <label className="form-field">
                <span>Название карьеры</span>
                <input
                  name="name"
                  value={createSaveForm.name}
                  onChange={(event) => handleCreateSaveFieldChange('name', event.target.value)}
                />
              </label>

              <label className="form-field">
                <span>Выбранная команда</span>
                <select
                  name="teamId"
                  value={createSaveForm.teamId}
                  onChange={(event) => handleCreateSaveFieldChange('teamId', event.target.value)}
                >
                  {state.teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.shortName} - {team.name}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="hero-home-link schedule-action-button"
                type="submit"
                disabled={isCreatingSave}
              >
                {isCreatingSave ? 'Создаём карьеру...' : 'Создать карьеру'}
              </button>
            </form>
          )}
        </section>
      </>
    );
  }

  const { saveState } = state;
  const { nextMatch, standing, completedMatches, completedRounds, roundProgress, matchProgress } =
    dashboardData ?? {};
  const nextMatchDetails = nextMatch ? getTeamOpponent(nextMatch, saveState.save.teamId) : null;
  const canSimulateSeason = saveState.season.status !== 'COMPLETED' && nextMatch !== null;
  const canStartNextSeason = saveState.season.status === 'COMPLETED';

  return (
    <>
      <section className="panel season-dashboard-hero">
        <div className="dashboard-hero-header">
          <div>
            <p className="section-kicker">Career Dashboard</p>
            <h2>{saveState.save.name}</h2>
            <p className="section-copy">
              {saveState.season.name} · {getSeasonStatusLabel(saveState.season.status)} · сохранение от{' '}
              {formatSaveDate(saveState.save.updatedAt)}
            </p>
          </div>
          <div className="dashboard-hero-actions">
            <button
              className="hero-home-link schedule-action-button"
              type="button"
              disabled={!canSimulateSeason || isSimulating || isSimulatingSeason}
              onClick={() => {
                void handleSimulateCurrentRound();
              }}
            >
              {isSimulating ? 'Симулируем раунд...' : 'Симулировать текущий раунд'}
            </button>
            <button
              className="ghost-button schedule-action-button"
              type="button"
              disabled={!canSimulateSeason || isSimulatingSeason || isSimulating}
              onClick={() => {
                void handleSimulateWholeSeason();
              }}
            >
              {isSimulatingSeason ? 'Симулируем сезон...' : 'Быстрая симуляция сезона'}
            </button>
            {canStartNextSeason ? (
              <button
                className="hero-home-link schedule-action-button"
                type="button"
                disabled={isStartingNextSeason || isSimulating || isSimulatingSeason}
                onClick={() => {
                  void handleStartNextSeason();
                }}
              >
                {isStartingNextSeason ? 'Создаём новый сезон...' : 'Перейти к следующему сезону'}
              </button>
            ) : null}
            <div className="team-badge standings-badge">
              <span>Current Round</span>
              <strong>R{saveState.season.currentRound}</strong>
            </div>
          </div>
        </div>

        {simulationMessage ? (
          <div className={`message ${simulationMessage.includes('симулирован') ? 'success' : 'error'}`}>
            <p>{simulationMessage}</p>
          </div>
        ) : null}

        <div className="dashboard-summary-grid">
          <article className="summary-card summary-card-accent">
            <span>Selected team</span>
            <strong>{saveState.save.teamName}</strong>
            <p>{saveState.standings.items.length} клубов в лиге · текущий save активен локально</p>
          </article>
          <article className="summary-card">
            <span>Current standing</span>
            <strong>{standing ? `${standing.position} место` : 'Нет данных'}</strong>
            <p>{standing ? `${standing.wins}-${standing.losses} · Win% ${(standing.winPercentage * 100).toFixed(1)}` : 'Standings ещё не инициализированы'}</p>
          </article>
          <article className="summary-card">
            <span>Season progress</span>
            <strong>{matchProgress}% матчей завершено</strong>
            <p>
              {completedRounds}/{saveState.season.totalRounds} раундов · {completedMatches}/
              {saveState.schedule.totalMatches} матчей
            </p>
          </article>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="panel dashboard-card dashboard-selected-team">
          <p className="section-kicker">Selected Team</p>
          <h2>{saveState.save.teamName}</h2>
          <div className="dashboard-metric-list">
            <div className="dashboard-metric">
              <span>Команда пользователя</span>
              <strong>{saveState.save.teamName}</strong>
            </div>
            <div className="dashboard-metric">
              <span>Текущая позиция</span>
              <strong>{standing ? `#${standing.position}` : 'N/A'}</strong>
            </div>
            <div className="dashboard-metric">
              <span>Баланс</span>
              <strong>{standing ? `${standing.wins}-${standing.losses}` : '0-0'}</strong>
            </div>
            <div className="dashboard-metric">
              <span>Разница очков</span>
              <strong>{standing ? (standing.pointDiff > 0 ? `+${standing.pointDiff}` : String(standing.pointDiff)) : '0'}</strong>
            </div>
          </div>
        </article>

        <article className="panel dashboard-card dashboard-next-match">
          <p className="section-kicker">Next Match</p>
          <h2>{nextMatch ? `Раунд ${nextMatch.round ?? saveState.season.currentRound}` : 'Матчи закончились'}</h2>
          {nextMatch && nextMatchDetails ? (
            <>
              <div className="next-match-banner">
                <span>{nextMatchDetails.venue}</span>
                <strong>
                  {saveState.save.teamName} {nextMatchDetails.teamLabel} {nextMatchDetails.opponent.name}
                </strong>
              </div>
              <div className="dashboard-metric-list">
                <div className="dashboard-metric">
                  <span>Дата</span>
                  <strong>{formatDashboardDate(nextMatch.date)}</strong>
                </div>
                <div className="dashboard-metric">
                  <span>Соперник</span>
                  <strong>{nextMatchDetails.opponent.shortName}</strong>
                </div>
                <div className="dashboard-metric">
                  <span>Статус</span>
                  <strong>{nextMatch.status === 'COMPLETED' ? 'Завершён' : 'Ожидает'}</strong>
                </div>
              </div>
            </>
          ) : (
            <StateNotice
              title="Следующий матч не найден"
              description="Похоже, сезон уже завершён или для выбранной команды не осталось запланированных игр."
            />
          )}
        </article>

        <article className="panel dashboard-card dashboard-standing">
          <p className="section-kicker">Current Standing</p>
          <h2>{standing ? `${standing.position} место в таблице` : 'Позиция не определена'}</h2>
          {standing ? (
            <div className="dashboard-metric-list">
              <div className="dashboard-metric">
                <span>Победы / поражения</span>
                <strong>{standing.wins}-{standing.losses}</strong>
              </div>
              <div className="dashboard-metric">
                <span>Очки за / против</span>
                <strong>{standing.pointsFor}/{standing.pointsAgainst}</strong>
              </div>
              <div className="dashboard-metric">
                <span>Процент побед</span>
                <strong>{(standing.winPercentage * 100).toFixed(1)}%</strong>
              </div>
              <div className="dashboard-metric">
                <span>Лидер таблицы</span>
                <strong>{saveState.standings.items[0]?.shortName ?? 'N/A'}</strong>
              </div>
            </div>
          ) : (
            <StateNotice
              title="Позиция команды пока недоступна"
              description="Standings ещё не вернулись для выбранного save или сезон только что был создан."
            />
          )}
        </article>

        <article className="panel dashboard-card dashboard-progress">
          <p className="section-kicker">Season Progress</p>
          <h2>{roundProgress}% раундов пройдено</h2>
          <div className="progress-stack">
            <div className="progress-block">
              <div className="progress-copy">
                <span>Прогресс раундов</span>
                <strong>
                  {completedRounds}/{saveState.season.totalRounds}
                </strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${roundProgress}%` }} />
              </div>
            </div>
            <div className="progress-block">
              <div className="progress-copy">
                <span>Прогресс матчей</span>
                <strong>
                  {completedMatches}/{saveState.schedule.totalMatches}
                </strong>
              </div>
              <div className="progress-track is-secondary">
                <div className="progress-fill is-secondary" style={{ width: `${matchProgress}%` }} />
              </div>
            </div>
          </div>
          <div className="dashboard-metric-list compact">
            <div className="dashboard-metric">
              <span>Статус сезона</span>
              <strong>{getSeasonStatusLabel(saveState.season.status)}</strong>
            </div>
            <div className="dashboard-metric">
              <span>Команд в сезоне</span>
              <strong>{saveState.season.teamCount}</strong>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
