import { useEffect, useMemo, useState } from 'react';
import { StatePanel } from '../../components/state/StatePanel';
import { StateNotice } from '../../components/state/StateNotice';
import {
  ApiClientError,
  getErrorMessage,
  savesApi,
  seasonsApi,
  type CareerSaveState,
  type SeasonStandingRow,
  type SeasonStandingsResponse,
  type SeasonSummary,
} from '../../shared/api/client';
import {
  clearActiveSaveId,
  readActiveSaveId,
} from '../../shared/career/active-save-storage';

type PageState =
  | { status: 'loading' }
  | { status: 'no-season' }
  | {
      status: 'success';
      season: CareerSaveState['season'] | SeasonSummary;
      standings: SeasonStandingsResponse;
    }
  | { status: 'error'; message: string };

function isMissingActiveSave(error: unknown) {
  return error instanceof ApiClientError && error.statusCode === 404;
}

function formatWinRate(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatRecord(row: SeasonStandingRow) {
  return `${row.wins}-${row.losses}`;
}

function formatPointsPair(row: SeasonStandingRow) {
  return `${row.pointsFor}/${row.pointsAgainst}`;
}

function formatPointDiff(value: number) {
  return value > 0 ? `+${value}` : String(value);
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

export function StandingsPage() {
  const [state, setState] = useState<PageState>({ status: 'loading' });
  const [requestKey, setRequestKey] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);

  async function loadStandings(signal?: AbortSignal) {
    const activeSaveId = readActiveSaveId();

    if (activeSaveId) {
      try {
        const saveState = await savesApi.getById(activeSaveId, signal);

        setState({
          status: 'success',
          season: saveState.season,
          standings: saveState.standings,
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
      const standings = await seasonsApi.getStandings(season.id, signal);

      setState({
        status: 'success',
        season,
        standings,
      });
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
    void loadStandings(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [requestKey]);

  function retryLoadStandings() {
    setRequestKey((current) => current + 1);
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
      await loadStandings();
    } catch (error) {
      setState({
        status: 'error',
        message: getErrorMessage(error),
      });
    } finally {
      setIsRecovering(false);
    }
  }

  const leader = useMemo(
    () => (state.status === 'success' ? state.standings.items[0] ?? null : null),
    [state],
  );

  if (state.status === 'loading') {
    return (
      <StatePanel
        eyebrow="Loading"
        title="Загружаем standings сезона"
        description="Подтягиваем текущий сезон и турнирную таблицу из backend API."
      />
    );
  }

  if (state.status === 'no-season') {
    return (
      <StatePanel
        eyebrow="Empty"
        title="Текущий сезон ещё не создан"
        description="Чтобы увидеть таблицу, сначала нужен активный сезон. После создания появятся команды, позиции и базовые показатели."
        actionLabel={isRecovering ? 'Создаём сезон...' : 'Создать текущий сезон'}
        actionDisabled={isRecovering}
        onAction={() => {
          void handleCreateSeason();
        }}
      />
    );
  }

  if (state.status === 'error') {
    return (
      <StatePanel
        eyebrow="Error"
        title="Standings загрузить не удалось"
        description={state.message}
        actionLabel="Повторить загрузку"
        onAction={retryLoadStandings}
      />
    );
  }

  return (
    <>
      <section className="panel standings-hero">
        <div className="schedule-hero-header">
          <div>
            <p className="section-kicker">Standings</p>
            <h2>{state.season.name}</h2>
            <p className="section-copy">
              Текущий раунд: {state.season.currentRound} · Статус сезона:{' '}
              {getSeasonStatusLabel(state.standings.seasonStatus)}
            </p>
          </div>
          {state.standings.champion ? (
            <div className="team-badge standings-badge">
              <span>Champion</span>
              <strong>{state.standings.champion.shortName}</strong>
            </div>
          ) : (
            <div className="team-badge standings-badge">
              <span>Leader</span>
              <strong>{leader?.shortName ?? 'N/A'}</strong>
            </div>
          )}
        </div>

        <div className="team-summary-grid">
          <article className="summary-card">
            <span>Команд в таблице</span>
            <strong>{state.standings.items.length}</strong>
          </article>
          <article className="summary-card">
            <span>Лидер</span>
            <strong>{leader ? leader.teamName : 'Нет данных'}</strong>
          </article>
          <article className="summary-card">
            <span>Статус таблицы</span>
            <strong>{state.standings.isFinal ? 'Финальная' : 'Обновляется по матчам'}</strong>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="roster-toolbar-copy">
          <p className="section-kicker">Season Table</p>
          <h2>Турнирная таблица сезона</h2>
          <p className="section-copy">
            Позиции, баланс побед и поражений, очки за/против и разница читаются без дополнительных
            пояснений.
          </p>
        </div>

        {state.standings.items.length === 0 ? (
          <StateNotice
            title="Таблица пока пуста"
            description="Сыграй матчи сезона или проверь, что standings были инициализированы на backend."
            actionLabel="Обновить таблицу"
            onAction={retryLoadStandings}
          />
        ) : (
          <div className="table-scroll">
            <table className="standings-table">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Team</th>
                  <th>W-L</th>
                  <th>Win%</th>
                  <th>PF/PA</th>
                  <th>Diff</th>
                </tr>
              </thead>
              <tbody>
                {state.standings.items.map((row) => (
                  <tr
                    className={row.position === 1 ? 'is-leading' : undefined}
                    key={row.teamId}
                  >
                    <td className="standings-position">{row.position}</td>
                    <td>
                      <div className="standings-team">
                        <strong>{row.shortName}</strong>
                        <span>{row.teamName}</span>
                      </div>
                    </td>
                    <td>{formatRecord(row)}</td>
                    <td>{formatWinRate(row.winPercentage)}</td>
                    <td>{formatPointsPair(row)}</td>
                    <td
                      className={
                        row.pointDiff > 0
                          ? 'stat-positive'
                          : row.pointDiff < 0
                            ? 'stat-negative'
                            : undefined
                      }
                    >
                      {formatPointDiff(row.pointDiff)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
