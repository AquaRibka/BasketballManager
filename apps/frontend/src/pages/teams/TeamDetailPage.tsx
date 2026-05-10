import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { PlayerDisplay } from '../../components/player/PlayerDisplay';
import { StateNotice } from '../../components/state/StateNotice';
import {
  getErrorMessage,
  teamsApi,
  type TeamDetails,
  type TeamPlayer,
} from '../../shared/api/client';

type TeamDetailPageProps = {
  teamId: string;
  onNavigate: (path: string) => void;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'success'; team: TeamDetails }
  | { status: 'error'; message: string };

type SortField = 'overall' | 'age' | 'name' | 'position';

const positionOptions = ['ALL', 'PG', 'SG', 'SF', 'PF', 'C'] as const;

function getSortValue(player: TeamPlayer, sortField: SortField): number | string {
  switch (sortField) {
    case 'age':
      return player.age;
    case 'name':
      return player.name;
    case 'position':
      return player.position;
    case 'overall':
    default:
      return player.overall;
  }
}

function comparePlayers(a: TeamPlayer, b: TeamPlayer, sortField: SortField) {
  const left = getSortValue(a, sortField);
  const right = getSortValue(b, sortField);

  if (typeof left === 'number' && typeof right === 'number') {
    return right - left;
  }

  return String(left).localeCompare(String(right), 'ru');
}

function formatAverage(value: number) {
  return Number.isFinite(value) ? value.toFixed(1) : '0.0';
}

export function TeamDetailPage({ teamId, onNavigate }: TeamDetailPageProps) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [requestKey, setRequestKey] = useState(0);
  const [sortField, setSortField] = useState<SortField>('overall');
  const [positionFilter, setPositionFilter] = useState<(typeof positionOptions)[number]>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    const abortController = new AbortController();

    setState({ status: 'loading' });

    async function loadTeam() {
      try {
        const team = await teamsApi.getById(teamId, abortController.signal);
        setState({ status: 'success', team });
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        setState({
          status: 'error',
          message: getErrorMessage(error),
        });
      }
    }

    void loadTeam();

    return () => {
      abortController.abort();
    };
  }, [requestKey, teamId]);

  function retryLoadTeam() {
    setRequestKey((current) => current + 1);
  }

  const players = state.status === 'success' ? state.team.players : [];
  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

  const filteredPlayers = useMemo(() => {
    return players
      .filter((player) => {
        const matchesPosition =
          positionFilter === 'ALL' ? true : player.position === positionFilter;
        const matchesSearch =
          normalizedQuery.length === 0
            ? true
            : `${player.name} ${player.position}`.toLowerCase().includes(normalizedQuery);

        return matchesPosition && matchesSearch;
      })
      .slice()
      .sort((left, right) => comparePlayers(left, right, sortField));
  }, [normalizedQuery, players, positionFilter, sortField]);

  useEffect(() => {
    if (filteredPlayers.length === 0) {
      setSelectedPlayerId(null);
      return;
    }

    const hasSelectedPlayer = filteredPlayers.some((player) => player.id === selectedPlayerId);

    if (!hasSelectedPlayer) {
      setSelectedPlayerId(filteredPlayers[0].id);
    }
  }, [filteredPlayers, selectedPlayerId]);

  const selectedPlayer =
    filteredPlayers.find((player) => player.id === selectedPlayerId) ?? filteredPlayers[0] ?? null;

  const summary = useMemo(() => {
    if (players.length === 0) {
      return {
        averageAge: '0.0',
        averageOverall: '0.0',
        topPlayer: null as TeamPlayer | null,
      };
    }

    const totals = players.reduce(
      (accumulator, player) => {
        accumulator.age += player.age;
        accumulator.overall += player.overall;
        return accumulator;
      },
      { age: 0, overall: 0 },
    );

    const topPlayer = players.slice().sort((left, right) => right.overall - left.overall)[0];

    return {
      averageAge: formatAverage(totals.age / players.length),
      averageOverall: formatAverage(totals.overall / players.length),
      topPlayer,
    };
  }, [players]);

  return (
    <>
      <section className="panel team-detail-hero">
        <button className="ghost-button" type="button" onClick={() => onNavigate('/teams')}>
          Назад к списку команд
        </button>

        {state.status === 'loading' ? (
          <StateNotice
            title="Загружаем состав команды"
            description="Подтягиваем карточку клуба и ростер игроков из backend API."
          />
        ) : null}

        {state.status === 'error' ? (
          <StateNotice
            tone="error"
            title="Команду загрузить не удалось"
            description={state.message}
            actionLabel="Повторить загрузку"
            onAction={retryLoadTeam}
          />
        ) : null}

        {state.status === 'success' ? (
          <>
            <div className="team-detail-header">
              <div>
                <p className="section-kicker">Team Header</p>
                <h2>{state.team.name}</h2>
                <p className="section-copy">
                  {state.team.city} · {state.team.shortName} · {players.length} игроков в ростере
                </p>
              </div>
              <div className="team-badge">
                <span>RTG</span>
                <strong>{state.team.rating}</strong>
              </div>
            </div>

            <div className="team-summary-grid">
              <article className="summary-card">
                <span>Средний overall</span>
                <strong>{summary.averageOverall}</strong>
              </article>
              <article className="summary-card">
                <span>Средний возраст</span>
                <strong>{summary.averageAge}</strong>
              </article>
              <article className="summary-card">
                <span>Лидер состава</span>
                <strong>
                  {summary.topPlayer
                    ? `${summary.topPlayer.name} (${summary.topPlayer.overall})`
                    : 'N/A'}
                </strong>
              </article>
            </div>
          </>
        ) : null}
      </section>

      {state.status === 'success' ? (
        <>
          <section className="panel">
            <div className="roster-toolbar">
              <div className="roster-toolbar-copy">
                <p className="section-kicker">Roster Table</p>
                <h2>Состав и ключевые характеристики</h2>
              </div>
              <div className="roster-controls">
                <label className="field">
                  <span>Поиск игрока</span>
                  <input
                    type="search"
                    value={searchQuery}
                    placeholder="Имя или позиция"
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                    }}
                  />
                </label>
                <label className="field">
                  <span>Позиция</span>
                  <select
                    value={positionFilter}
                    onChange={(event) => {
                      setPositionFilter(event.target.value as (typeof positionOptions)[number]);
                    }}
                  >
                    {positionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === 'ALL' ? 'Все позиции' : option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Сортировка</span>
                  <select
                    value={sortField}
                    onChange={(event) => {
                      setSortField(event.target.value as SortField);
                    }}
                  >
                    <option value="overall">Overall</option>
                    <option value="age">Возраст</option>
                    <option value="position">Позиция</option>
                    <option value="name">Имя</option>
                  </select>
                </label>
              </div>
            </div>

            {filteredPlayers.length === 0 ? (
              <StateNotice
                title="Игроки не найдены"
                description="Измени фильтр или поисковый запрос, чтобы снова увидеть состав."
              />
            ) : (
              <div className="table-scroll">
                <table className="roster-table">
                  <thead>
                    <tr>
                      <th>Игрок</th>
                      <th>Поз.</th>
                      <th>Возраст</th>
                      <th>OVR</th>
                      <th>SHO</th>
                      <th>PAS</th>
                      <th>DEF</th>
                      <th>REB</th>
                      <th>ATH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((player) => {
                      const isSelected = player.id === selectedPlayer?.id;

                      return (
                        <tr
                          key={player.id}
                          className={isSelected ? 'is-selected' : undefined}
                          onClick={() => {
                            setSelectedPlayerId(player.id);
                          }}
                        >
                          <td>
                            <PlayerDisplay player={player} variant="inline" />
                          </td>
                          <td>{player.position}</td>
                          <td>{player.age}</td>
                          <td>{player.overall}</td>
                          <td>{player.shooting}</td>
                          <td>{player.passing}</td>
                          <td>{player.defense}</td>
                          <td>{player.rebounding}</td>
                          <td>{player.athleticism}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="panel">
            <p className="section-kicker">Player Details</p>
            <h2>Детали выбранного игрока</h2>

            {selectedPlayer ? (
              <div className="player-detail-grid">
                <PlayerDisplay player={selectedPlayer} teamShortName={state.team.shortName} />
              </div>
            ) : (
              <StateNotice
                title="Нет выбранного игрока"
                description="Выбери игрока в таблице, чтобы посмотреть его профиль и атрибуты."
              />
            )}
          </section>
        </>
      ) : null}
    </>
  );
}
