import { useEffect, useState } from 'react';
import { fetchTeams, type TeamSummary } from '../../shared/api/client';

type LoadState =
  | { status: 'loading' }
  | { status: 'success'; teams: TeamSummary[] }
  | { status: 'error'; message: string };

export function HomePage() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function loadTeams() {
      try {
        const teams = await fetchTeams();

        if (!cancelled) {
          setState({ status: 'success', teams });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Не удалось подключиться к backend API.',
          });
        }
      }
    }

    void loadTeams();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className="panel status-panel">
        <h2>Состояние frontend</h2>
        <ul className="status-list">
          <li>React + TypeScript настроены</li>
          <li>Vite dev-server готов к локальной разработке</li>
          <li>Прокси на backend API включён через `/api/*`</li>
        </ul>
      </section>

      <section className="panel">
        <h2>Backend API</h2>
        {state.status === 'loading' ? <p>Загружаем команды из backend...</p> : null}

        {state.status === 'error' ? (
          <div className="message error">
            <strong>Подключение не удалось.</strong>
            <p>{state.message}</p>
            <p>
              Проверь, что backend запущен на `FRONTEND_API_URL` и Vite proxy может до него
              достучаться.
            </p>
          </div>
        ) : null}

        {state.status === 'success' ? (
          <>
            <p className="message success">
              Backend доступен. Команды загружены через frontend API-клиент.
            </p>
            <div className="team-grid">
              {state.teams.map((team) => (
                <article className="team-card" key={team.id}>
                  <div className="team-card-top">
                    <span className="team-short-name">{team.shortName}</span>
                    <span className="team-rating">RTG {team.rating}</span>
                  </div>
                  <h3>{team.name}</h3>
                  <p>{team.city}</p>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </section>
    </>
  );
}
