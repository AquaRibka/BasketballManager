import { useEffect, useState } from 'react';
import { StateNotice } from '../../components/state/StateNotice';
import { getErrorMessage, teamsApi, type TeamSummary } from '../../shared/api/client';

type TeamsPageProps = {
  onNavigate: (path: string) => void;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'success'; teams: TeamSummary[] }
  | { status: 'error'; message: string };

export function TeamsPage({ onNavigate }: TeamsPageProps) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadTeams() {
      try {
        const teams = await teamsApi.list(abortController.signal);
        setState({ status: 'success', teams });
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

    void loadTeams();

    return () => {
      abortController.abort();
    };
  }, [requestKey]);

  function retryLoadTeams() {
    setRequestKey((current) => current + 1);
  }

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
        {state.status === 'loading' ? (
          <StateNotice
            title="Загружаем команды"
            description="Подтягиваем список клубов из backend API и готовим переходы к деталям команды."
          />
        ) : null}

        {state.status === 'error' ? (
          <StateNotice
            tone="error"
            title="Команды загрузить не удалось"
            description={`${state.message} Проверь backend и повтори запрос.`}
            actionLabel="Повторить загрузку"
            onAction={retryLoadTeams}
          />
        ) : null}

        {state.status === 'success' ? (
          <>
            {state.teams.length === 0 ? (
              <StateNotice
                title="Команды пока отсутствуют"
                description="Backend ответил успешно, но список команд пуст. Можно повторить запрос после наполнения базы."
                actionLabel="Обновить список"
                onAction={retryLoadTeams}
              />
            ) : (
              <p className="message success">
                Backend доступен. Команды загружены через frontend API-клиент.
              </p>
            )}
            <div className="team-grid">
              {state.teams.map((team) => (
                <article className="team-card" key={team.id}>
                  <a
                    className="team-card-link"
                    href={`/teams/${team.id}`}
                    onClick={(event) => {
                      event.preventDefault();
                      onNavigate(`/teams/${team.id}`);
                    }}
                  >
                    <div className="team-card-top">
                      <span className="team-short-name">{team.shortName}</span>
                      <span className="team-rating">RTG {team.rating}</span>
                    </div>
                    <h3>{team.name}</h3>
                    <p>{team.city}</p>
                  </a>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </section>
    </>
  );
}
