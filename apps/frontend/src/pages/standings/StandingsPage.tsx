import { useEffect, useMemo, useState } from 'react';
import {
  ApiClientError,
  getErrorMessage,
  seasonsApi,
  type SeasonStandingRow,
  type SeasonStandingsResponse,
  type SeasonSummary,
} from '../../shared/api/client';

type PageState =
  | { status: 'loading' }
  | { status: 'no-season' }
  | {
      status: 'success';
      season: SeasonSummary;
      standings: SeasonStandingsResponse;
    }
  | { status: 'error'; message: string };

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

export function StandingsPage() {
  const [state, setState] = useState<PageState>({ status: 'loading' });
  const [isRecovering, setIsRecovering] = useState(false);

  async function loadStandings(signal?: AbortSignal) {
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
  }, []);

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
      <section className="panel">
        <p className="section-kicker">Таблица</p>
        <h2>Загружаем standings сезона</h2>
        <p className="section-copy">
          Подтягиваем текущий сезон и турнирную таблицу из backend API.
        </p>
      </section>
    );
  }

  if (state.status === 'no-season') {
    return (
      <section className="panel empty-state-panel">
        <div className="empty-state-card">
          <p className="empty-state-kicker">Standings</p>
          <h3>Текущий сезон ещё не создан</h3>
          <p>
            Чтобы увидеть таблицу, сначала нужен активный сезон. После создания появятся команды,
            позиции и базовые показатели без дополнительных действий.
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

  if (state.status === 'error') {
    return (
      <section className="panel">
        <p className="section-kicker">Таблица</p>
        <h2>Standings загрузить не удалось</h2>
        <div className="message error">
          <strong>Backend не вернул турнирную таблицу сезона.</strong>
          <p>{state.message}</p>
        </div>
      </section>
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
              Текущий раунд: {state.season.currentRound} · Статус сезона: {state.standings.seasonStatus}
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
          <div className="message error">
            <strong>Таблица пока пуста.</strong>
            <p>Сыграй матчи сезона или проверь, что standings были инициализированы на backend.</p>
          </div>
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
