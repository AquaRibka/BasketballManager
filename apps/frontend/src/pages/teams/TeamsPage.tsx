import { useEffect, useState } from 'react';
import { fetchTeams, type TeamSummary } from '../../shared/api/client';

type LoadState =
  | { status: 'loading' }
  | { status: 'success'; teams: TeamSummary[] }
  | { status: 'error'; message: string };

export function TeamsPage() {
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
      <section className="panel section-intro">
        <p className="section-kicker">Команды</p>
        <h2>Обзор клубов для карьерного режима</h2>
        <p className="section-copy">
          Страница показывает, что основной маршрут уже связан с backend API и готов к
          дальнейшему развитию состава, ростеров и карточек команды.
        </p>
      </section>

      <section className="panel status-panel">
        <h2>Состояние frontend</h2>
        <ul className="status-list">
          <li>Layout и маршруты подключены в приложении</li>
          <li>Активный раздел подсвечивается в верхнем и боковом меню</li>
          <li>Страница команд уже получает данные через frontend API-клиент</li>
        </ul>
      </section>

      <section className="panel">
        <h2>Список команд</h2>
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
