import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { SeasonStatus } from '@basketball-manager/shared';
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
import {
  clearActiveSaveId,
  readActiveSaveId,
  writeActiveSaveId,
} from '../../shared/career/active-save-storage';

const isDevAdminMode = import.meta.env.DEV;

type PageState =
  | { status: 'loading' }
  | { status: 'create-save'; teams: TeamSummary[]; message?: string }
  | { status: 'success'; saveState: CareerSaveState }
  | { status: 'error'; message: string };

type CreateSaveFormState = {
  name: string;
  teamId: string;
};

type AutosaveState = {
  status: 'saved' | 'saving' | 'error';
  timestamp: string | null;
  message?: string;
};

type DashboardMessage = {
  tone: 'success' | 'error';
  text: string;
};

const INITIAL_FORM_STATE: CreateSaveFormState = {
  name: 'My Career',
  teamId: '',
};

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

function formatAutosaveTime(value: string | null) {
  if (!value) {
    return 'время уточняется';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getAutosaveCopy(autosave: AutosaveState) {
  switch (autosave.status) {
    case 'saving':
      return {
        label: 'Сохраняется',
        detail: 'записываем прогресс',
      };
    case 'error':
      return {
        label: 'Ошибка сохранения',
        detail: autosave.message ?? 'попробуй ещё раз',
      };
    case 'saved':
    default:
      return {
        label: 'Сохранено',
        detail: formatAutosaveTime(autosave.timestamp),
      };
  }
}

function getSeasonStatusLabel(status: SeasonStatus) {
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

type TeamPositionPoint = {
  round: number;
  position: number;
};

type TeamFormEntry = {
  round: number;
  result: 'W' | 'L';
};

function buildTeamPositionHistory(saveState: CareerSaveState): TeamPositionPoint[] {
  const selectedTeamId = saveState.save.teamId;
  const teams = saveState.standings.items.map((item) => ({
    teamId: item.teamId,
    teamName: item.teamName,
  }));

  const table = new Map(
    teams.map((team) => [
      team.teamId,
      {
        teamId: team.teamId,
        teamName: team.teamName,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      },
    ]),
  );

  const history: TeamPositionPoint[] = [];

  for (const round of saveState.schedule.rounds
    .filter((item) => item.status === 'COMPLETED')
    .sort((left, right) => left.round - right.round)) {
    for (const match of round.matches) {
      if (match.status !== 'COMPLETED' || match.homeScore === null || match.awayScore === null) {
        continue;
      }

      const home = table.get(match.homeTeam.id);
      const away = table.get(match.awayTeam.id);

      if (!home || !away) {
        continue;
      }

      home.pointsFor += match.homeScore;
      home.pointsAgainst += match.awayScore;
      away.pointsFor += match.awayScore;
      away.pointsAgainst += match.homeScore;

      if (match.homeScore > match.awayScore) {
        home.wins += 1;
        away.losses += 1;
      } else if (match.awayScore > match.homeScore) {
        away.wins += 1;
        home.losses += 1;
      }
    }

    const standings = Array.from(table.values()).sort((left, right) => {
      if (right.wins !== left.wins) {
        return right.wins - left.wins;
      }

      const leftDiff = left.pointsFor - left.pointsAgainst;
      const rightDiff = right.pointsFor - right.pointsAgainst;

      if (rightDiff !== leftDiff) {
        return rightDiff - leftDiff;
      }

      if (right.pointsFor !== left.pointsFor) {
        return right.pointsFor - left.pointsFor;
      }

      return left.teamName.localeCompare(right.teamName, 'ru');
    });

    const position = standings.findIndex((item) => item.teamId === selectedTeamId);

    if (position >= 0) {
      history.push({
        round: round.round,
        position: position + 1,
      });
    }
  }

  return history;
}

function formatPerGame(value: number, gamesPlayed: number) {
  if (gamesPlayed <= 0) {
    return '0.0';
  }

  return (value / gamesPlayed).toFixed(1);
}

function buildRecentForm(saveState: CareerSaveState): TeamFormEntry[] {
  const teamId = saveState.save.teamId;

  return saveState.schedule.rounds
    .flatMap((round) =>
      round.matches
        .filter(
          (match) =>
            match.status === 'COMPLETED' &&
            match.winnerTeamId !== null &&
            (match.homeTeam.id === teamId || match.awayTeam.id === teamId),
        )
        .map((match) => ({
          round: round.round,
          result: (match.winnerTeamId === teamId ? 'W' : 'L') as 'W' | 'L',
        })),
    )
    .sort((left, right) => left.round - right.round);
}

export function SeasonPage() {
  const [state, setState] = useState<PageState>({ status: 'loading' });
  const [requestKey, setRequestKey] = useState(0);
  const [createSaveForm, setCreateSaveForm] = useState<CreateSaveFormState>(INITIAL_FORM_STATE);
  const [isCreatingSave, setIsCreatingSave] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSimulatingSeason, setIsSimulatingSeason] = useState(false);
  const [isStartingNextSeason, setIsStartingNextSeason] = useState(false);
  const [isDeletingSave, setIsDeletingSave] = useState(false);
  const [simulationMessage, setSimulationMessage] = useState<DashboardMessage | null>(null);
  const [autosave, setAutosave] = useState<AutosaveState>({
    status: 'saved',
    timestamp: null,
  });

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
        setAutosave({
          status: 'saved',
          timestamp: saveState.save.updatedAt,
        });
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        if (error instanceof ApiClientError && error.statusCode === 404) {
          clearActiveSaveId();
          await loadTeamsForSaveCreation(
            abortController.signal,
            'Активное сохранение не найдено. Создай карьеру заново.',
          );
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
    setAutosave({
      status: 'saved',
      timestamp: new Date().toISOString(),
    });

    return saveState;
  }

  async function handleCreateSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isCreatingSave || !createSaveForm.teamId) {
      return;
    }

    setIsCreatingSave(true);
    setAutosave({
      status: 'saving',
      timestamp: autosave.timestamp,
    });

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
      setAutosave({
        status: 'saved',
        timestamp: saveState.save.updatedAt,
      });
    } catch (error) {
      setAutosave({
        status: 'error',
        timestamp: new Date().toISOString(),
        message: getErrorMessage(error),
      });
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
    setAutosave({
      status: 'saving',
      timestamp: autosave.timestamp,
    });

    try {
      const simulation = await seasonsApi.simulateCurrentRound(state.saveState.season.id);

      if (simulation.seasonStatus !== 'COMPLETED') {
        await seasonsApi.advanceToNextRound(state.saveState.season.id);
      }

      const refreshedSave = await refreshActiveSave(state.saveState.save.id);
      setSimulationMessage(
        refreshedSave.season.status === 'COMPLETED'
          ? {
              tone: 'success',
              text: `Сезон завершён. Симулирован последний раунд ${simulation.round}.`,
            }
          : {
              tone: 'success',
              text: `Раунд ${simulation.round} симулирован. Переход выполнен к раунду ${refreshedSave.season.currentRound}.`,
            },
      );
    } catch (error) {
      const message = getErrorMessage(error);
      setAutosave({
        status: 'error',
        timestamp: new Date().toISOString(),
        message,
      });
      setSimulationMessage({
        tone: 'error',
        text: message,
      });
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
    setAutosave({
      status: 'saving',
      timestamp: autosave.timestamp,
    });

    try {
      const simulation = await seasonsApi.simulateRemainingSeason(state.saveState.season.id);
      await refreshActiveSave(state.saveState.save.id);
      setSimulationMessage({
        tone: 'success',
        text: `Быстрая симуляция завершена. Раундов: ${simulation.simulatedRoundCount}, матчей: ${simulation.simulatedMatches}.`,
      });
    } catch (error) {
      const message = getErrorMessage(error);
      setAutosave({
        status: 'error',
        timestamp: new Date().toISOString(),
        message,
      });
      setSimulationMessage({
        tone: 'error',
        text: message,
      });
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
    setAutosave({
      status: 'saving',
      timestamp: autosave.timestamp,
    });

    try {
      const nextSeasonSave = await savesApi.startNextSeason(state.saveState.save.id);
      setState({
        status: 'success',
        saveState: nextSeasonSave,
      });
      setAutosave({
        status: 'saved',
        timestamp: nextSeasonSave.save.updatedAt,
      });
      setSimulationMessage({
        tone: 'success',
        text: `Новый сезон ${nextSeasonSave.season.year} создан. Карьера переведена к раунду ${nextSeasonSave.season.currentRound}.`,
      });
    } catch (error) {
      const message = getErrorMessage(error);
      setAutosave({
        status: 'error',
        timestamp: new Date().toISOString(),
        message,
      });
      setSimulationMessage({
        tone: 'error',
        text: message,
      });
    } finally {
      setIsStartingNextSeason(false);
    }
  }

  async function handleDeleteSave() {
    if (
      state.status !== 'success' ||
      isDeletingSave ||
      isSimulating ||
      isSimulatingSeason ||
      isStartingNextSeason
    ) {
      return;
    }

    const isConfirmed = window.confirm(
      'Удалить текущее сохранение? Связанный сезон, календарь и таблица тоже будут очищены, если это сохранение единственное для сезона.',
    );

    if (!isConfirmed) {
      return;
    }

    setIsDeletingSave(true);
    setSimulationMessage(null);
    setAutosave({
      status: 'saving',
      timestamp: autosave.timestamp,
    });

    try {
      await savesApi.remove(state.saveState.save.id);
      clearActiveSaveId();
      setCreateSaveForm(INITIAL_FORM_STATE);
      setRequestKey((current) => current + 1);
    } catch (error) {
      const message = getErrorMessage(error);
      setAutosave({
        status: 'error',
        timestamp: new Date().toISOString(),
        message,
      });
      setSimulationMessage({
        tone: 'error',
        text: message,
      });
    } finally {
      setIsDeletingSave(false);
    }
  }

  const dashboardData = useMemo(() => {
    if (state.status !== 'success') {
      return null;
    }

    const nextMatch = getNextMatch(state.saveState);
    const standing = getSelectedTeamStanding(state.saveState);
    const completedMatches = state.saveState.schedule.rounds.reduce(
      (count, round) =>
        count + round.matches.filter((match) => match.status === 'COMPLETED').length,
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
    const positionHistory = buildTeamPositionHistory(state.saveState);

    return {
      nextMatch,
      standing,
      completedMatches,
      completedRounds,
      roundProgress,
      matchProgress,
      positionHistory,
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
  const {
    nextMatch,
    standing,
    completedMatches,
    completedRounds,
    roundProgress,
    matchProgress,
    positionHistory,
  } = dashboardData ?? {};
  const nextMatchDetails = nextMatch ? getTeamOpponent(nextMatch, saveState.save.teamId) : null;
  const canSimulateSeason = saveState.season.status !== 'COMPLETED' && nextMatch !== null;
  const canStartNextSeason = saveState.season.status === 'COMPLETED';
  const autosaveCopy = getAutosaveCopy(autosave);
  const currentPerGameFor = standing
    ? formatPerGame(standing.pointsFor, standing.gamesPlayed)
    : '0.0';
  const currentPerGameAgainst = standing
    ? formatPerGame(standing.pointsAgainst, standing.gamesPlayed)
    : '0.0';
  const recentForm = buildRecentForm(saveState);
  const recentFormTail = recentForm.slice(-5);
  const formStreak = recentForm.length
    ? (() => {
        const latest = recentForm[recentForm.length - 1]?.result;
        let streak = 0;

        for (let index = recentForm.length - 1; index >= 0; index -= 1) {
          if (recentForm[index]?.result !== latest) {
            break;
          }

          streak += 1;
        }

        return `${latest}${streak}`;
      })()
    : 'N/A';
  const offenseRank = standing
    ? [...saveState.standings.items]
        .sort(
          (left, right) =>
            right.pointsFor / Math.max(right.gamesPlayed, 1) -
            left.pointsFor / Math.max(left.gamesPlayed, 1),
        )
        .findIndex((item) => item.teamId === standing.teamId) + 1
    : null;
  const defenseRank = standing
    ? [...saveState.standings.items]
        .sort(
          (left, right) =>
            left.pointsAgainst / Math.max(left.gamesPlayed, 1) -
            right.pointsAgainst / Math.max(right.gamesPlayed, 1),
        )
        .findIndex((item) => item.teamId === standing.teamId) + 1
    : null;
  const seasonZoneLabel = standing
    ? standing.position <= 4
      ? 'Зона лидеров'
      : standing.position <= 8
        ? 'Зона плей-офф'
        : 'Вне плей-офф'
    : 'Нет данных';

  const chartWidth = 520;
  const chartHeight = 168;
  const chartPaddingX = 18;
  const chartPaddingY = 14;
  const chartInnerWidth = chartWidth - chartPaddingX * 2;
  const chartInnerHeight = chartHeight - chartPaddingY * 2;
  const maxRounds = Math.max(positionHistory?.length ?? 0, 1);
  const maxTeams = Math.max(saveState.season.teamCount, 1);
  const chartPoints =
    positionHistory?.map((point, index) => {
      const x =
        positionHistory.length <= 1
          ? chartWidth / 2
          : chartPaddingX + (index / (positionHistory.length - 1)) * chartInnerWidth;
      const y =
        chartPaddingY + ((point.position - 1) / Math.max(maxTeams - 1, 1)) * chartInnerHeight;

      return { ...point, x, y };
    }) ?? [];
  const chartLinePath = chartPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  const chartAreaPath = chartPoints.length
    ? [
        `M ${chartPoints[0]?.x} ${chartHeight - chartPaddingY}`,
        ...chartPoints.map((point) => `L ${point.x} ${point.y}`),
        `L ${chartPoints[chartPoints.length - 1]?.x} ${chartHeight - chartPaddingY}`,
        'Z',
      ].join(' ')
    : '';
  const chartBestPosition = chartPoints.length
    ? Math.min(...chartPoints.map((point) => point.position))
    : null;
  const chartStartPosition = chartPoints[0]?.position ?? null;
  const chartEndPosition = chartPoints[chartPoints.length - 1]?.position ?? null;
  const chartRoundLabelStep =
    chartPoints.length <= 12 ? 1 : chartPoints.length <= 24 ? 2 : chartPoints.length <= 36 ? 3 : 4;
  const chartLabelPoints = chartPoints.filter((point, index) => {
    const isFirst = index === 0;
    const isLast = index === chartPoints.length - 1;
    const isStep = point.round % chartRoundLabelStep === 0;

    return isFirst || isLast || isStep;
  });

  return (
    <>
      <section className="panel season-fm-screen">
        <header className="season-fm-screen-header">
          <div className="season-fm-screen-top">
            <div className="player-identity season-fm-identity">
              <p className="section-kicker">Career Dashboard</p>
              <h2>{saveState.save.name}</h2>
              <p className="section-copy">
                {saveState.season.name} · {getSeasonStatusLabel(saveState.season.status)} ·
                сохранение от {formatSaveDate(saveState.save.updatedAt)}
              </p>
              <div className={`autosave-indicator is-${autosave.status}`} role="status">
                <span className="autosave-dot" aria-hidden="true" />
                <div>
                  <strong>{autosaveCopy.label}</strong>
                  <span>{autosaveCopy.detail}</span>
                </div>
              </div>
            </div>

            <div className="player-fm-rating-stack season-fm-rating-stack">
              <div className="player-fm-rating-box is-primary">
                <span>Раунд</span>
                <strong>R{saveState.season.currentRound}</strong>
              </div>
              <div className="player-fm-rating-box">
                <span>Позиция</span>
                <strong>{standing ? `#${standing.position}` : 'N/A'}</strong>
              </div>
              <div className="player-fm-rating-box">
                <span>Win%</span>
                <strong>{standing ? (standing.winPercentage * 100).toFixed(1) : '0.0'}</strong>
              </div>
            </div>
          </div>

          <div className="player-fm-header-table season-fm-meta-table">
            <div className="player-fm-header-row season-fm-meta-row">
              <div className="player-fm-header-cell">
                <span>Команда</span>
                <strong>{saveState.save.teamName}</strong>
              </div>
              <div className="player-fm-header-cell">
                <span>Сезон</span>
                <strong>{saveState.season.name}</strong>
              </div>
              <div className="player-fm-header-cell">
                <span>Статус</span>
                <strong>{getSeasonStatusLabel(saveState.season.status)}</strong>
              </div>
              <div className="player-fm-header-cell">
                <span>Прогресс</span>
                <strong>
                  {completedRounds}/{saveState.season.totalRounds} R · {completedMatches}/
                  {saveState.schedule.totalMatches} G
                </strong>
              </div>
            </div>
            <div className="player-fm-header-row season-fm-meta-row">
              <div className="player-fm-header-cell">
                <span>Баланс</span>
                <strong>{standing ? `${standing.wins}-${standing.losses}` : '0-0'}</strong>
              </div>
              <div className="player-fm-header-cell">
                <span>Разница</span>
                <strong>
                  {standing
                    ? standing.pointDiff > 0
                      ? `+${standing.pointDiff}`
                      : String(standing.pointDiff)
                    : '0'}
                </strong>
              </div>
              <div className="player-fm-header-cell">
                <span>Лидер</span>
                <strong>{saveState.standings.items[0]?.shortName ?? 'N/A'}</strong>
              </div>
              <div className="player-fm-header-cell">
                <span>Лига</span>
                <strong>{saveState.season.teamCount} клубов</strong>
              </div>
            </div>
          </div>

          <div className="season-fm-toolbar">
            <button
              className="hero-home-link schedule-action-button schedule-action-button-primary"
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
            {isDevAdminMode ? (
              <button
                className="ghost-button schedule-action-button schedule-action-button-danger"
                type="button"
                disabled={
                  isDeletingSave || isSimulating || isSimulatingSeason || isStartingNextSeason
                }
                onClick={() => {
                  void handleDeleteSave();
                }}
              >
                {isDeletingSave ? 'Удаляем сохранение...' : 'Удалить сохранение'}
              </button>
            ) : null}
          </div>
        </header>

        {simulationMessage ? (
          <div className={`message ${simulationMessage.tone}`}>
            <p>{simulationMessage.text}</p>
          </div>
        ) : null}

        <div className="season-fm-layout">
          <article className="player-fm-panel season-fm-panel season-fm-panel-selected">
            <p className="section-kicker">Selected Team</p>
            <h2>{standing ? `${standing.position} место в таблице` : saveState.save.teamName}</h2>
            {standing ? (
              <>
                <div className="dashboard-panel-lead">
                  <strong>{saveState.save.teamName}</strong>
                  <span>
                    {standing.position === 1
                      ? 'Ваша команда сейчас лидирует в лиге'
                      : `До вершины таблицы: ${standing.position - 1} поз.`}
                  </span>
                </div>
                <div className="season-fm-highlight-grid">
                  <div className="season-fm-highlight-card">
                    <span>Позиция</span>
                    <strong>#{standing.position}</strong>
                  </div>
                  <div className="season-fm-highlight-card">
                    <span>Баланс</span>
                    <strong>
                      {standing.wins}-{standing.losses}
                    </strong>
                  </div>
                  <div className="season-fm-highlight-card">
                    <span>Форма</span>
                    <strong>
                      {recentFormTail.length
                        ? recentFormTail.map((entry) => entry.result).join(' ')
                        : 'N/A'}
                    </strong>
                  </div>
                </div>
                <div className="player-fm-table season-fm-table">
                  <div className="player-fm-row season-fm-row">
                    <span>Клуб</span>
                    <strong>{standing.shortName}</strong>
                    <span>Зона</span>
                    <strong>{seasonZoneLabel}</strong>
                  </div>
                  <div className="player-fm-row season-fm-row">
                    <span>Win%</span>
                    <strong>{(standing.winPercentage * 100).toFixed(1)}%</strong>
                    <span>Серия</span>
                    <strong>{formStreak}</strong>
                  </div>
                  <div className="player-fm-row season-fm-row">
                    <span>Атака</span>
                    <strong>{currentPerGameFor} очка</strong>
                    <span>Защита</span>
                    <strong>{currentPerGameAgainst} проп.</strong>
                  </div>
                  <div className="player-fm-row season-fm-row">
                    <span>Матчей</span>
                    <strong>{standing.gamesPlayed}</strong>
                    <span>Разница</span>
                    <strong>
                      {standing.pointDiff > 0 ? `+${standing.pointDiff}` : standing.pointDiff}
                    </strong>
                  </div>
                  <div className="player-fm-row season-fm-row">
                    <span>Лидер</span>
                    <strong>{saveState.standings.items[0]?.shortName ?? 'N/A'}</strong>
                    <span>Win%</span>
                    <strong>
                      {((saveState.standings.items[0]?.winPercentage ?? 0) * 100).toFixed(1)}%
                    </strong>
                  </div>
                  <div className="player-fm-row season-fm-row">
                    <span>Топ-4 отрыв</span>
                    <strong>{Math.max(standing.position - 4, 0)} поз.</strong>
                    <span>До вершины</span>
                    <strong>{Math.max(standing.position - 1, 0)} поз.</strong>
                  </div>
                </div>
              </>
            ) : (
              <StateNotice
                title="Позиция команды пока недоступна"
                description="Standings ещё не вернулись для выбранного save или сезон только что был создан."
              />
            )}
          </article>

          <article className="player-fm-panel season-fm-panel dashboard-next-match">
            <p className="section-kicker">Next Match</p>
            <h2>
              {nextMatch
                ? `Раунд ${nextMatch.round ?? saveState.season.currentRound}`
                : 'Матчи закончились'}
            </h2>
            {nextMatch && nextMatchDetails ? (
              <>
                <div className="next-match-banner">
                  <div>
                    <span>{nextMatchDetails.venue}</span>
                    <strong>
                      {saveState.save.teamName} {nextMatchDetails.teamLabel}{' '}
                      {nextMatchDetails.opponent.name}
                    </strong>
                  </div>
                  <em>{nextMatch.status === 'COMPLETED' ? 'Завершён' : 'Ожидает'}</em>
                </div>
                <div className="player-fm-table season-fm-table">
                  <div className="player-fm-row season-fm-row">
                    <span>Дата</span>
                    <strong>{formatDashboardDate(nextMatch.date)}</strong>
                    <span>Соперник</span>
                    <strong>{nextMatchDetails.opponent.name}</strong>
                  </div>
                  <div className="player-fm-row season-fm-row">
                    <span>Статус</span>
                    <strong>{nextMatch.status === 'COMPLETED' ? 'Завершён' : 'Ожидает'}</strong>
                    <span>Раунд</span>
                    <strong>{nextMatch.round ?? saveState.season.currentRound}</strong>
                  </div>
                </div>
              </>
            ) : (
              <>
                <StateNotice
                  title="Следующий матч не найден"
                  description="Похоже, сезон уже завершён или для выбранной команды не осталось запланированных игр."
                />
              </>
            )}
          </article>

          {chartPoints.length > 1 ? (
            <article className="player-fm-panel season-fm-panel season-position-panel">
              <p className="section-kicker">Position Trend</p>
              <h2>Динамика позиции команды</h2>
              <div className="season-position-chart-card">
                <div className="season-position-chart-header">
                  <span>Позиция по турам</span>
                  <strong>{`#${chartStartPosition} -> #${chartEndPosition}`}</strong>
                </div>
                <svg
                  className="season-position-chart"
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  role="img"
                  aria-label="График позиции команды по турам"
                >
                  <defs>
                    <linearGradient id="season-position-chart-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255, 74, 180, 0.22)" />
                      <stop offset="100%" stopColor="rgba(255, 74, 180, 0)" />
                    </linearGradient>
                  </defs>
                  {[1, Math.ceil(maxTeams / 2), maxTeams].map((marker) => {
                    const y =
                      chartPaddingY + ((marker - 1) / Math.max(maxTeams - 1, 1)) * chartInnerHeight;

                    return (
                      <g key={marker}>
                        <line x1={chartPaddingX} y1={y} x2={chartWidth - chartPaddingX} y2={y} />
                        <text className="season-position-chart-axis-label" x={6} y={y + 4}>
                          #{marker}
                        </text>
                      </g>
                    );
                  })}
                  <path className="season-position-chart-area" d={chartAreaPath} />
                  <path d={chartLinePath} />
                  {chartPoints.map((point, index) => (
                    <g key={point.round}>
                      <circle
                        className={
                          index === chartPoints.length - 1
                            ? 'season-position-chart-point is-current'
                            : 'season-position-chart-point'
                        }
                        cx={point.x}
                        cy={point.y}
                        r={index === chartPoints.length - 1 ? 5 : 4}
                      />
                    </g>
                  ))}
                  {chartLabelPoints.map((point) => (
                    <text
                      key={`round-${point.round}`}
                      className="season-position-chart-round-label"
                      x={point.x}
                      y={chartHeight - 4}
                    >
                      {point.round}
                    </text>
                  ))}
                </svg>
                <div className="season-position-chart-footer">
                  <span>Лучшее место: #{chartBestPosition}</span>
                  <span>Туров в истории: {chartPoints.length}</span>
                </div>
              </div>
            </article>
          ) : null}

          <article className="player-fm-panel season-fm-panel season-fm-panel-snapshot">
            <p className="section-kicker">League Snapshot</p>
            <h2>Срез таблицы и контекст сезона</h2>
            {standing ? (
              <>
                <div className="dashboard-panel-lead">
                  <strong>{saveState.standings.items[0]?.teamName ?? 'Нет лидера'}</strong>
                  <span>Лидер чемпионата на текущий момент</span>
                </div>
                <div className="player-fm-table season-fm-table">
                  <div className="player-fm-row season-fm-row">
                    <span>Лидер</span>
                    <strong>{saveState.standings.items[0]?.shortName ?? 'N/A'}</strong>
                    <span>Место вашей команды</span>
                    <strong>#{standing.position}</strong>
                  </div>
                  <div className="player-fm-row season-fm-row">
                    <span>Баланс лидера</span>
                    <strong>
                      {saveState.standings.items[0]?.wins ?? 0}-
                      {saveState.standings.items[0]?.losses ?? 0}
                    </strong>
                    <span>Отставание</span>
                    <strong>{Math.max(standing.position - 1, 0)} поз.</strong>
                  </div>
                  <div className="player-fm-row season-fm-row">
                    <span>Атака в лиге</span>
                    <strong>{offenseRank ? `#${offenseRank}` : 'N/A'}</strong>
                    <span>Защита в лиге</span>
                    <strong>{defenseRank ? `#${defenseRank}` : 'N/A'}</strong>
                  </div>
                  <div className="player-fm-row season-fm-row">
                    <span>Статус сезона</span>
                    <strong>{getSeasonStatusLabel(saveState.season.status)}</strong>
                    <span>Ход сезона</span>
                    <strong>
                      {completedRounds}/{saveState.season.totalRounds} R
                    </strong>
                  </div>
                </div>
              </>
            ) : (
              <StateNotice
                title="Позиция команды пока недоступна"
                description="Standings ещё не вернулись для выбранного save или сезон только что был создан."
              />
            )}
          </article>

          <article className="player-fm-panel season-fm-panel season-fm-panel-wide dashboard-progress">
            <p className="section-kicker">Season Progress</p>
            <h2>{roundProgress}% раундов пройдено</h2>
            <div className="dashboard-panel-lead">
              <strong>{getSeasonStatusLabel(saveState.season.status)}</strong>
              <span>
                {completedRounds}/{saveState.season.totalRounds} раундов · {completedMatches}/
                {saveState.schedule.totalMatches} матчей
              </span>
            </div>
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
                  <div
                    className="progress-fill is-secondary"
                    style={{ width: `${matchProgress}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="player-fm-table season-fm-table">
              <div className="player-fm-row season-fm-row">
                <span>Раунды</span>
                <strong>
                  {completedRounds}/{saveState.season.totalRounds}
                </strong>
                <span>Матчи</span>
                <strong>
                  {completedMatches}/{saveState.schedule.totalMatches}
                </strong>
              </div>
              <div className="player-fm-row season-fm-row">
                <span>Статус сезона</span>
                <strong>{getSeasonStatusLabel(saveState.season.status)}</strong>
                <span>Клубов</span>
                <strong>{saveState.season.teamCount}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
