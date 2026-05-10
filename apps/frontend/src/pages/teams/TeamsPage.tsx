import { useEffect, useState, type FormEvent } from 'react';
import { StateNotice } from '../../components/state/StateNotice';
import {
  ApiClientError,
  getErrorMessage,
  playersApi,
  teamsApi,
  type CreatePlayerPayload,
  type CreateTeamPayload,
  type PlayerBodyType,
  type PlayerDominantHand,
  type PlayerPosition,
  type TeamSummary,
} from '../../shared/api/client';

type TeamsPageProps = {
  onNavigate: (path: string) => void;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'success'; teams: TeamSummary[] }
  | { status: 'error'; message: string };

type SubmissionState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

type ValidationErrors = Partial<Record<string, string[]>>;

type TeamFormState = {
  name: string;
  city: string;
  shortName: string;
  rating: string;
};

type PlayerFormState = {
  name: string;
  age: string;
  dateOfBirth: string;
  dominantHand: '' | PlayerDominantHand;
  position: PlayerPosition;
  secondaryPositionOne: '' | PlayerPosition;
  secondaryPositionTwo: '' | PlayerPosition;
  heightCm: string;
  weightKg: string;
  wingspanCm: string;
  bodyType: '' | PlayerBodyType;
  shooting: string;
  passing: string;
  defense: string;
  rebounding: string;
  athleticism: string;
  potential: string;
  teamId: string;
};

const isDevAdminMode = import.meta.env.DEV;

const PLAYER_POSITION_OPTIONS: Array<{ value: PlayerPosition; label: string }> = [
  { value: 'PG', label: 'PG' },
  { value: 'SG', label: 'SG' },
  { value: 'SF', label: 'SF' },
  { value: 'PF', label: 'PF' },
  { value: 'C', label: 'C' },
];

const DOMINANT_HAND_OPTIONS: Array<{ value: PlayerDominantHand; label: string }> = [
  { value: 'RIGHT', label: 'Правая' },
  { value: 'LEFT', label: 'Левая' },
  { value: 'AMBIDEXTROUS', label: 'Обе' },
];

const BODY_TYPE_OPTIONS: Array<{ value: PlayerBodyType; label: string }> = [
  { value: 'SLIM', label: 'Стройный' },
  { value: 'ATHLETIC', label: 'Атлетичный' },
  { value: 'STRONG', label: 'Силовой' },
  { value: 'HEAVY', label: 'Массивный' },
];

const INITIAL_TEAM_FORM: TeamFormState = {
  name: '',
  city: '',
  shortName: '',
  rating: '60',
};

const INITIAL_PLAYER_FORM: PlayerFormState = {
  name: '',
  age: '20',
  dateOfBirth: '',
  dominantHand: 'RIGHT',
  position: 'PG',
  secondaryPositionOne: '',
  secondaryPositionTwo: '',
  heightCm: '185',
  weightKg: '82',
  wingspanCm: '192',
  bodyType: 'SLIM',
  shooting: '60',
  passing: '60',
  defense: '60',
  rebounding: '60',
  athleticism: '60',
  potential: '70',
  teamId: '',
};

function toValidationErrors(error: unknown): ValidationErrors {
  if (!(error instanceof ApiClientError) || !error.details?.errors) {
    return {};
  }

  return error.details.errors.reduce<ValidationErrors>((accumulator, issue) => {
    accumulator[issue.field] = issue.messages;
    return accumulator;
  }, {});
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="form-field-error">{errors.join(' ')}</p>;
}

export function TeamsPage({ onNavigate }: TeamsPageProps) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [requestKey, setRequestKey] = useState(0);
  const [teamForm, setTeamForm] = useState<TeamFormState>(INITIAL_TEAM_FORM);
  const [playerForm, setPlayerForm] = useState<PlayerFormState>(INITIAL_PLAYER_FORM);
  const [teamSubmissionState, setTeamSubmissionState] = useState<SubmissionState>({
    status: 'idle',
  });
  const [playerSubmissionState, setPlayerSubmissionState] = useState<SubmissionState>({
    status: 'idle',
  });
  const [teamValidationErrors, setTeamValidationErrors] = useState<ValidationErrors>({});
  const [playerValidationErrors, setPlayerValidationErrors] = useState<ValidationErrors>({});

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

  function handleTeamFieldChange(field: keyof TeamFormState, value: string) {
    setTeamForm((current) => ({ ...current, [field]: value }));
    setTeamValidationErrors((current) => ({ ...current, [field]: undefined }));

    if (teamSubmissionState.status !== 'idle') {
      setTeamSubmissionState({ status: 'idle' });
    }
  }

  function handlePlayerFieldChange(field: keyof PlayerFormState, value: string) {
    setPlayerForm((current) => ({ ...current, [field]: value }));
    setPlayerValidationErrors((current) => ({ ...current, [field]: undefined }));

    if (playerSubmissionState.status !== 'idle') {
      setPlayerSubmissionState({ status: 'idle' });
    }
  }

  async function handleTeamSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setTeamSubmissionState({ status: 'submitting' });
    setTeamValidationErrors({});

    const payload: CreateTeamPayload = {
      name: teamForm.name,
      city: teamForm.city,
      shortName: teamForm.shortName,
      rating: Number(teamForm.rating),
    };

    try {
      const createdTeam = await teamsApi.create(payload);
      setTeamForm(INITIAL_TEAM_FORM);
      setTeamSubmissionState({
        status: 'success',
        message: `Команда ${createdTeam.name} создана и отправлена в API.`,
      });
      retryLoadTeams();
    } catch (error) {
      setTeamValidationErrors(toValidationErrors(error));
      setTeamSubmissionState({
        status: 'error',
        message: getErrorMessage(error),
      });
    }
  }

  async function handlePlayerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPlayerSubmissionState({ status: 'submitting' });
    setPlayerValidationErrors({});

    const payload: CreatePlayerPayload = {
      name: playerForm.name,
      age: Number(playerForm.age),
      dateOfBirth: playerForm.dateOfBirth
        ? new Date(playerForm.dateOfBirth).toISOString()
        : undefined,
      dominantHand: playerForm.dominantHand || undefined,
      position: playerForm.position,
      secondaryPositions: [playerForm.secondaryPositionOne, playerForm.secondaryPositionTwo].filter(
        (position): position is PlayerPosition => Boolean(position),
      ),
      heightCm: Number(playerForm.heightCm),
      weightKg: Number(playerForm.weightKg),
      wingspanCm: playerForm.wingspanCm ? Number(playerForm.wingspanCm) : undefined,
      bodyType: playerForm.bodyType || undefined,
      shooting: Number(playerForm.shooting),
      passing: Number(playerForm.passing),
      defense: Number(playerForm.defense),
      rebounding: Number(playerForm.rebounding),
      athleticism: Number(playerForm.athleticism),
      potential: Number(playerForm.potential),
      teamId: playerForm.teamId || undefined,
    };

    try {
      const createdPlayer = await playersApi.create(payload);
      setPlayerForm(INITIAL_PLAYER_FORM);
      setPlayerSubmissionState({
        status: 'success',
        message: `Игрок ${createdPlayer.name} создан и отправлен в API.`,
      });
      retryLoadTeams();
    } catch (error) {
      setPlayerValidationErrors(toValidationErrors(error));
      setPlayerSubmissionState({
        status: 'error',
        message: getErrorMessage(error),
      });
    }
  }

  const availableTeams = state.status === 'success' ? state.teams : [];

  return (
    <>
      <section className="panel section-intro">
        <p className="section-kicker">Команды</p>
        <h2>Обзор клубов для карьерного режима</h2>
        <p className="section-copy">
          Страница показывает, что основной маршрут уже связан с backend API и готов к дальнейшему
          развитию состава, ростеров и карточек команды.
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

      {isDevAdminMode ? (
        <section className="panel dev-admin-panel">
          <div className="dev-admin-header">
            <div>
              <p className="section-kicker">Dev/Admin</p>
              <h2>Ручное создание данных</h2>
            </div>
            <p className="section-copy">
              Простые формы для локального наполнения базы через API в dev-режиме.
            </p>
          </div>

          <div className="admin-form-grid">
            <form className="admin-form-card" onSubmit={handleTeamSubmit}>
              <div className="admin-form-header">
                <h3>Team form</h3>
                <p>Создаёт новую команду и после успеха обновляет список клубов.</p>
              </div>

              {teamSubmissionState.status === 'success' ? (
                <p className="message success">{teamSubmissionState.message}</p>
              ) : null}

              {teamSubmissionState.status === 'error' ? (
                <div className="message error">
                  <p>{teamSubmissionState.message}</p>
                </div>
              ) : null}

              <label className="form-field">
                <span>Название</span>
                <input
                  name="name"
                  value={teamForm.name}
                  onChange={(event) => handleTeamFieldChange('name', event.target.value)}
                />
                <FieldError errors={teamValidationErrors.name} />
              </label>

              <label className="form-field">
                <span>Город</span>
                <input
                  name="city"
                  value={teamForm.city}
                  onChange={(event) => handleTeamFieldChange('city', event.target.value)}
                />
                <FieldError errors={teamValidationErrors.city} />
              </label>

              <label className="form-field">
                <span>Short name</span>
                <input
                  name="shortName"
                  maxLength={10}
                  value={teamForm.shortName}
                  onChange={(event) => handleTeamFieldChange('shortName', event.target.value)}
                />
                <FieldError errors={teamValidationErrors.shortName} />
              </label>

              <label className="form-field">
                <span>Рейтинг</span>
                <input
                  name="rating"
                  type="number"
                  min={0}
                  max={100}
                  value={teamForm.rating}
                  onChange={(event) => handleTeamFieldChange('rating', event.target.value)}
                />
                <FieldError errors={teamValidationErrors.rating} />
              </label>

              <button
                className="ghost-button admin-submit-button"
                type="submit"
                disabled={teamSubmissionState.status === 'submitting'}
              >
                {teamSubmissionState.status === 'submitting'
                  ? 'Создаём команду...'
                  : 'Создать команду'}
              </button>
            </form>

            <form className="admin-form-card" onSubmit={handlePlayerSubmit}>
              <div className="admin-form-header">
                <h3>Player form</h3>
                <p>Создаёт игрока и по желанию сразу привязывает его к выбранной команде.</p>
              </div>

              {playerSubmissionState.status === 'success' ? (
                <p className="message success">{playerSubmissionState.message}</p>
              ) : null}

              {playerSubmissionState.status === 'error' ? (
                <div className="message error">
                  <p>{playerSubmissionState.message}</p>
                </div>
              ) : null}

              <label className="form-field">
                <span>Имя игрока</span>
                <input
                  name="name"
                  value={playerForm.name}
                  onChange={(event) => handlePlayerFieldChange('name', event.target.value)}
                />
                <FieldError errors={playerValidationErrors.name} />
              </label>

              <div className="form-inline-grid">
                <label className="form-field">
                  <span>Возраст</span>
                  <input
                    name="age"
                    type="number"
                    min={16}
                    max={50}
                    value={playerForm.age}
                    onChange={(event) => handlePlayerFieldChange('age', event.target.value)}
                  />
                  <FieldError errors={playerValidationErrors.age} />
                </label>

                <label className="form-field">
                  <span>Позиция</span>
                  <select
                    name="position"
                    value={playerForm.position}
                    onChange={(event) =>
                      handlePlayerFieldChange('position', event.target.value as PlayerPosition)
                    }
                  >
                    {PLAYER_POSITION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FieldError errors={playerValidationErrors.position} />
                </label>
              </div>

              <div className="form-inline-grid">
                <label className="form-field">
                  <span>Дата рождения</span>
                  <input
                    name="dateOfBirth"
                    type="date"
                    value={playerForm.dateOfBirth}
                    onChange={(event) => handlePlayerFieldChange('dateOfBirth', event.target.value)}
                  />
                  <FieldError errors={playerValidationErrors.dateOfBirth} />
                </label>

                <label className="form-field">
                  <span>Рабочая рука</span>
                  <select
                    name="dominantHand"
                    value={playerForm.dominantHand}
                    onChange={(event) =>
                      handlePlayerFieldChange(
                        'dominantHand',
                        event.target.value as PlayerFormState['dominantHand'],
                      )
                    }
                  >
                    {DOMINANT_HAND_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FieldError errors={playerValidationErrors.dominantHand} />
                </label>
              </div>

              <div className="form-inline-grid">
                <label className="form-field">
                  <span>Вторичная позиция 1</span>
                  <select
                    name="secondaryPositionOne"
                    value={playerForm.secondaryPositionOne}
                    onChange={(event) =>
                      handlePlayerFieldChange(
                        'secondaryPositionOne',
                        event.target.value as PlayerFormState['secondaryPositionOne'],
                      )
                    }
                  >
                    <option value="">Нет</option>
                    {PLAYER_POSITION_OPTIONS.map((option) => (
                      <option key={`secondary-one-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>Вторичная позиция 2</span>
                  <select
                    name="secondaryPositionTwo"
                    value={playerForm.secondaryPositionTwo}
                    onChange={(event) =>
                      handlePlayerFieldChange(
                        'secondaryPositionTwo',
                        event.target.value as PlayerFormState['secondaryPositionTwo'],
                      )
                    }
                  >
                    <option value="">Нет</option>
                    {PLAYER_POSITION_OPTIONS.map((option) => (
                      <option key={`secondary-two-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <FieldError errors={playerValidationErrors.secondaryPositions} />

              <div className="form-inline-grid">
                <label className="form-field">
                  <span>Телосложение</span>
                  <select
                    name="bodyType"
                    value={playerForm.bodyType}
                    onChange={(event) =>
                      handlePlayerFieldChange(
                        'bodyType',
                        event.target.value as PlayerFormState['bodyType'],
                      )
                    }
                  >
                    {BODY_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FieldError errors={playerValidationErrors.bodyType} />
                </label>

                <label className="form-field">
                  <span>Рост (см)</span>
                  <input
                    name="heightCm"
                    type="number"
                    min={165}
                    max={230}
                    value={playerForm.heightCm}
                    onChange={(event) => handlePlayerFieldChange('heightCm', event.target.value)}
                  />
                  <FieldError errors={playerValidationErrors.heightCm} />
                </label>
              </div>

              <div className="form-inline-grid">
                <label className="form-field">
                  <span>Вес (кг)</span>
                  <input
                    name="weightKg"
                    type="number"
                    min={65}
                    max={160}
                    value={playerForm.weightKg}
                    onChange={(event) => handlePlayerFieldChange('weightKg', event.target.value)}
                  />
                  <FieldError errors={playerValidationErrors.weightKg} />
                </label>

                <label className="form-field">
                  <span>Размах рук (см)</span>
                  <input
                    name="wingspanCm"
                    type="number"
                    min={170}
                    max={245}
                    value={playerForm.wingspanCm}
                    onChange={(event) => handlePlayerFieldChange('wingspanCm', event.target.value)}
                  />
                  <FieldError errors={playerValidationErrors.wingspanCm} />
                </label>
              </div>

              <label className="form-field">
                <span>Команда</span>
                <select
                  name="teamId"
                  value={playerForm.teamId}
                  onChange={(event) => handlePlayerFieldChange('teamId', event.target.value)}
                >
                  <option value="">Без команды</option>
                  {availableTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.shortName} - {team.name}
                    </option>
                  ))}
                </select>
                <FieldError errors={playerValidationErrors.teamId} />
              </label>

              <div className="form-inline-grid">
                <label className="form-field">
                  <span>Shooting</span>
                  <input
                    name="shooting"
                    type="number"
                    min={1}
                    max={100}
                    value={playerForm.shooting}
                    onChange={(event) => handlePlayerFieldChange('shooting', event.target.value)}
                  />
                  <FieldError errors={playerValidationErrors.shooting} />
                </label>

                <label className="form-field">
                  <span>Passing</span>
                  <input
                    name="passing"
                    type="number"
                    min={1}
                    max={100}
                    value={playerForm.passing}
                    onChange={(event) => handlePlayerFieldChange('passing', event.target.value)}
                  />
                  <FieldError errors={playerValidationErrors.passing} />
                </label>
              </div>

              <div className="form-inline-grid">
                <label className="form-field">
                  <span>Defense</span>
                  <input
                    name="defense"
                    type="number"
                    min={1}
                    max={100}
                    value={playerForm.defense}
                    onChange={(event) => handlePlayerFieldChange('defense', event.target.value)}
                  />
                  <FieldError errors={playerValidationErrors.defense} />
                </label>

                <label className="form-field">
                  <span>Rebounding</span>
                  <input
                    name="rebounding"
                    type="number"
                    min={1}
                    max={100}
                    value={playerForm.rebounding}
                    onChange={(event) => handlePlayerFieldChange('rebounding', event.target.value)}
                  />
                  <FieldError errors={playerValidationErrors.rebounding} />
                </label>
              </div>

              <div className="form-inline-grid">
                <label className="form-field">
                  <span>Athleticism</span>
                  <input
                    name="athleticism"
                    type="number"
                    min={1}
                    max={100}
                    value={playerForm.athleticism}
                    onChange={(event) => handlePlayerFieldChange('athleticism', event.target.value)}
                  />
                  <FieldError errors={playerValidationErrors.athleticism} />
                </label>

                <label className="form-field">
                  <span>Potential</span>
                  <input
                    name="potential"
                    type="number"
                    min={1}
                    max={100}
                    value={playerForm.potential}
                    onChange={(event) => handlePlayerFieldChange('potential', event.target.value)}
                  />
                  <FieldError errors={playerValidationErrors.potential} />
                </label>
              </div>

              <button
                className="ghost-button admin-submit-button"
                type="submit"
                disabled={playerSubmissionState.status === 'submitting'}
              >
                {playerSubmissionState.status === 'submitting'
                  ? 'Создаём игрока...'
                  : 'Создать игрока'}
              </button>
            </form>
          </div>
        </section>
      ) : null}

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
