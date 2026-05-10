import type { TeamPlayer } from '../../shared/api/client';

type PlayerDisplayVariant = 'inline' | 'card';

type PlayerDisplayProps = {
  player: TeamPlayer;
  teamShortName?: string;
  variant?: PlayerDisplayVariant;
};

const attributeItems = [
  { key: 'shooting', label: 'Shooting' },
  { key: 'passing', label: 'Passing' },
  { key: 'defense', label: 'Defense' },
  { key: 'rebounding', label: 'Rebounding' },
  { key: 'athleticism', label: 'Athleticism' },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<TeamPlayer, 'shooting' | 'passing' | 'defense' | 'rebounding' | 'athleticism'>;
  label: string;
}>;

function formatDateOfBirth(value: TeamPlayer['dateOfBirth']) {
  if (!value) {
    return 'Не указана';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDominantHand(value: TeamPlayer['dominantHand']) {
  if (value === 'LEFT') {
    return 'Левая';
  }

  if (value === 'AMBIDEXTROUS') {
    return 'Обе';
  }

  return 'Правая';
}

function formatSecondaryPositions(value: TeamPlayer['secondaryPositions']) {
  return value.length ? value.join(' / ') : 'Нет';
}

const physicalAttributeItems = [
  { key: 'speed', label: 'Скорость' },
  { key: 'acceleration', label: 'Ускорение' },
  { key: 'vertical', label: 'Вертикальный прыжок' },
  { key: 'strength', label: 'Сила' },
  { key: 'endurance', label: 'Выносливость' },
  { key: 'balance', label: 'Баланс' },
  { key: 'agility', label: 'Ловкость' },
  { key: 'coordination', label: 'Координация' },
  { key: 'reaction', label: 'Реакция' },
  { key: 'recovery', label: 'Восстановление' },
  { key: 'explosiveness', label: 'Взрывная сила' },
] as const;

const psychologyAttributeItems = [
  { key: 'selfControl', label: 'Самообладание' },
  { key: 'concentration', label: 'Концентрация' },
  { key: 'determination', label: 'Решительность' },
  { key: 'leadership', label: 'Лидерство' },
  { key: 'workEthic', label: 'Трудолюбие' },
  { key: 'aggressiveness', label: 'Агрессивность' },
  { key: 'teamwork', label: 'Командность' },
  { key: 'confidence', label: 'Уверенность' },
] as const;

const tacticalAttributeItems = [
  { key: 'basketballIQ', label: 'Баскетбольный IQ' },
  { key: 'shotSelection', label: 'Выбор броска' },
  { key: 'courtVision', label: 'Видение площадки' },
  { key: 'defenseReading', label: 'Чтение защиты' },
  { key: 'offenseReading', label: 'Чтение нападения' },
  { key: 'decisionMaking', label: 'Принятие решений' },
  { key: 'offBallMovement', label: 'Off-ball движение' },
  { key: 'spacing', label: 'Spacing' },
  { key: 'pickAndRollOffense', label: 'Pick-and-roll offense' },
  { key: 'pickAndRollDefense', label: 'Pick-and-roll defense' },
  { key: 'helpDefense', label: 'Help defense' },
  { key: 'discipline', label: 'Дисциплина' },
] as const;

export function PlayerDisplay({ player, teamShortName, variant = 'card' }: PlayerDisplayProps) {
  const physicalProfile = player.physicalProfile;
  const psychologyProfile = player.psychologyProfile;
  const tacticalProfile = player.tacticalProfile;

  if (variant === 'inline') {
    return (
      <div className="player-inline">
        <div className="player-inline-copy">
          <strong>{player.name}</strong>
          <span>
            {player.position} · {player.age} года
          </span>
        </div>
        <span className="player-inline-overall">OVR {player.overall}</span>
      </div>
    );
  }

  return (
    <div className="player-display-card">
      <div className="player-detail-main">
        <div className="player-identity">
          <strong>{player.name}</strong>
          <span>
            {player.position} · {player.age} года
          </span>
        </div>
        <div className="player-pill-row">
          <span className="player-pill">Overall {player.overall}</span>
          {teamShortName ? <span className="player-pill">Team {teamShortName}</span> : null}
        </div>
      </div>

      <div className="player-profile-grid">
        <article className="attribute-card">
          <span>Рост</span>
          <strong>{physicalProfile ? `${physicalProfile.heightCm} см` : 'N/A'}</strong>
        </article>
        <article className="attribute-card">
          <span>Вес</span>
          <strong>{physicalProfile ? `${physicalProfile.weightKg} кг` : 'N/A'}</strong>
        </article>
        <article className="attribute-card">
          <span>Размах рук</span>
          <strong>
            {physicalProfile?.wingspanCm ? `${physicalProfile.wingspanCm} см` : 'N/A'}
          </strong>
        </article>
        <article className="attribute-card">
          <span>Телосложение</span>
          <strong>
            {physicalProfile?.bodyType === 'SLIM'
              ? 'Стройный'
              : physicalProfile?.bodyType === 'STRONG'
                ? 'Силовой'
                : physicalProfile?.bodyType === 'HEAVY'
                  ? 'Массивный'
                  : physicalProfile?.bodyType === 'ATHLETIC'
                    ? 'Атлетичный'
                    : 'N/A'}
          </strong>
        </article>
        <article className="attribute-card">
          <span>Дата рождения</span>
          <strong>{formatDateOfBirth(player.dateOfBirth)}</strong>
        </article>
        <article className="attribute-card">
          <span>Рабочая рука</span>
          <strong>{formatDominantHand(player.dominantHand)}</strong>
        </article>
        <article className="attribute-card">
          <span>Вторичные позиции</span>
          <strong>{formatSecondaryPositions(player.secondaryPositions)}</strong>
        </article>
      </div>

      {physicalProfile ? (
        <div className="attributes-grid">
          {physicalAttributeItems.map((attribute) => (
            <article className="attribute-card" key={attribute.key}>
              <span>{attribute.label}</span>
              <strong>{physicalProfile[attribute.key]}</strong>
            </article>
          ))}
        </div>
      ) : null}

      {psychologyProfile ? (
        <div className="attributes-grid">
          {psychologyAttributeItems.map((attribute) => (
            <article className="attribute-card" key={attribute.key}>
              <span>{attribute.label}</span>
              <strong>{psychologyProfile[attribute.key]}</strong>
            </article>
          ))}
        </div>
      ) : null}

      {tacticalProfile ? (
        <div className="attributes-grid">
          {tacticalAttributeItems.map((attribute) => (
            <article className="attribute-card" key={attribute.key}>
              <span>{attribute.label}</span>
              <strong>{tacticalProfile[attribute.key]}</strong>
            </article>
          ))}
        </div>
      ) : null}

      <div className="attributes-grid">
        {attributeItems.map((attribute) => (
          <article className="attribute-card" key={attribute.key}>
            <span>{attribute.label}</span>
            <strong>{player[attribute.key]}</strong>
          </article>
        ))}
      </div>
    </div>
  );
}
