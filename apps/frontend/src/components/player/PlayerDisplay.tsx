import { Fragment } from 'react';
import type { TeamPlayer } from '../../shared/api/client';

type PlayerDisplayVariant = 'inline' | 'card';

type PlayerDisplayProps = {
  player: TeamPlayer;
  teamShortName?: string;
  variant?: PlayerDisplayVariant;
};

const coreAttributeItems = [
  { key: 'shooting', label: 'Бросок' },
  { key: 'passing', label: 'Пас' },
  { key: 'defense', label: 'Защита' },
  { key: 'rebounding', label: 'Подбор' },
  { key: 'athleticism', label: 'Атлетизм' },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<TeamPlayer, 'shooting' | 'passing' | 'defense' | 'rebounding' | 'athleticism'>;
  label: string;
}>;

const physicalAttributeItems = [
  { key: 'speed', label: 'Скорость' },
  { key: 'acceleration', label: 'Ускорение' },
  { key: 'vertical', label: 'Прыжок' },
  { key: 'strength', label: 'Сила' },
  { key: 'endurance', label: 'Выносливость' },
  { key: 'balance', label: 'Баланс' },
  { key: 'agility', label: 'Ловкость' },
  { key: 'coordination', label: 'Координация' },
  { key: 'reaction', label: 'Реакция' },
  { key: 'recovery', label: 'Восстановление' },
  { key: 'explosiveness', label: 'Взрыв' },
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
  { key: 'basketballIQ', label: 'Basketball IQ' },
  { key: 'shotSelection', label: 'Выбор броска' },
  { key: 'courtVision', label: 'Видение площадки' },
  { key: 'defenseReading', label: 'Чтение защиты' },
  { key: 'offenseReading', label: 'Чтение нападения' },
  { key: 'decisionMaking', label: 'Решения' },
  { key: 'offBallMovement', label: 'Off-ball' },
  { key: 'spacing', label: 'Spacing' },
  { key: 'pickAndRollOffense', label: 'PnR нападение' },
  { key: 'pickAndRollDefense', label: 'PnR защита' },
  { key: 'helpDefense', label: 'Help defense' },
  { key: 'discipline', label: 'Дисциплина' },
] as const;

function chunkAttributes<TItem>(items: readonly TItem[], size: number) {
  const rows: TItem[][] = [];

  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size) as TItem[]);
  }

  return rows;
}

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

function formatPercentValue(value: number) {
  return `${value}%`;
}

function getHealthStatusText(healthProfile: NonNullable<TeamPlayer['healthProfile']>) {
  if (healthProfile.overallCondition <= 40) {
    return 'Травмирован';
  }

  if (healthProfile.postInjuryCondition < 95) {
    return 'Восстанавливается';
  }

  return 'Здоров';
}

function formatBodyType(
  value: TeamPlayer['physicalProfile'] extends infer TProfile
    ? TProfile extends { bodyType: infer TBodyType }
      ? TBodyType
      : never
    : never,
) {
  if (value === 'SLIM') {
    return 'Стройный';
  }

  if (value === 'STRONG') {
    return 'Силовой';
  }

  if (value === 'HEAVY') {
    return 'Массивный';
  }

  if (value === 'ATHLETIC') {
    return 'Атлетичный';
  }

  return 'N/A';
}

export function PlayerDisplay({ player, teamShortName, variant = 'card' }: PlayerDisplayProps) {
  const physicalProfile = player.physicalProfile;
  const healthProfile = player.healthProfile;
  const psychologyProfile = player.psychologyProfile;
  const tacticalProfile = player.tacticalProfile;

  const coreRows = chunkAttributes(coreAttributeItems, 1);
  const physicalRows = chunkAttributes(physicalAttributeItems, 2);
  const psychologyRows = chunkAttributes(psychologyAttributeItems, 2);
  const tacticalRows = chunkAttributes(tacticalAttributeItems, 2);

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
    <div className="player-display-card player-display-card-fm">
      <header className="player-fm-header">
        <div className="player-fm-header-top">
          <div className="player-identity">
            <strong>{player.name}</strong>
            <span>
              {player.position} · {player.age} года · {teamShortName ?? 'Свободный агент'}
            </span>
          </div>
          <div className="player-fm-rating-stack">
            <div className="player-fm-rating-box is-primary">
              <span>OVR</span>
              <strong>{player.overall}</strong>
            </div>
            {healthProfile ? (
              <div className="player-fm-rating-box">
                <span>Форма</span>
                <strong>{healthProfile.overallCondition}</strong>
              </div>
            ) : null}
            {healthProfile ? (
              <div className="player-fm-rating-box">
                <span>Усталость</span>
                <strong>{healthProfile.fatigue}</strong>
              </div>
            ) : null}
          </div>
        </div>

        <div className="player-fm-header-table">
          <div className="player-fm-header-row">
            <div className="player-fm-header-cell">
              <span>Рука</span>
              <strong>{formatDominantHand(player.dominantHand)}</strong>
            </div>
            <div className="player-fm-header-cell">
              <span>Рост / вес</span>
              <strong>
                {physicalProfile
                  ? `${physicalProfile.heightCm} см / ${physicalProfile.weightKg} кг`
                  : 'N/A'}
              </strong>
            </div>
            <div className="player-fm-header-cell">
              <span>Вторичные позиции</span>
              <strong>{formatSecondaryPositions(player.secondaryPositions)}</strong>
            </div>
            <div className="player-fm-header-cell">
              <span>Дата рождения</span>
              <strong>{formatDateOfBirth(player.dateOfBirth)}</strong>
            </div>
          </div>
        </div>
      </header>

      <div className="player-fm-layout">
        <section className="player-fm-panel player-fm-panel-overview">
          <div className="player-fm-panel-header">
            <span>Профиль и статус</span>
          </div>
          <div className="player-fm-table player-fm-table-overview">
            <div className="player-fm-row">
              <span>Позиция</span>
              <strong>{player.position}</strong>
              <span>Возраст</span>
              <strong>{player.age}</strong>
            </div>
            <div className="player-fm-row">
              <span>Дата рождения</span>
              <strong>{formatDateOfBirth(player.dateOfBirth)}</strong>
              <span>Рабочая рука</span>
              <strong>{formatDominantHand(player.dominantHand)}</strong>
            </div>
            <div className="player-fm-row">
              <span>Рост</span>
              <strong>{physicalProfile ? `${physicalProfile.heightCm} см` : 'N/A'}</strong>
              <span>Вес</span>
              <strong>{physicalProfile ? `${physicalProfile.weightKg} кг` : 'N/A'}</strong>
            </div>
            <div className="player-fm-row">
              <span>Размах рук</span>
              <strong>
                {physicalProfile?.wingspanCm ? `${physicalProfile.wingspanCm} см` : 'N/A'}
              </strong>
              <span>Телосложение</span>
              <strong>{formatBodyType(physicalProfile?.bodyType ?? null)}</strong>
            </div>
            <div className="player-fm-row">
              <span>Вторичные позиции</span>
              <strong>{formatSecondaryPositions(player.secondaryPositions)}</strong>
              <span>Команда</span>
              <strong>{teamShortName ?? 'Свободный агент'}</strong>
            </div>
            {healthProfile ? (
              <div className="player-fm-row">
                <span>Риск травмы</span>
                <strong>{formatPercentValue(healthProfile.injuryRisk)}</strong>
                <span>Состояние здоровья</span>
                <strong>{getHealthStatusText(healthProfile)}</strong>
              </div>
            ) : null}
          </div>
        </section>

        <section className="player-fm-panel player-fm-panel-core">
          <div className="player-fm-panel-header">
            <span>Базовые навыки</span>
          </div>
          <div className="player-fm-bars">
            {coreRows.map((row) =>
              row.map((attribute) => {
                const value = player[attribute.key];

                return (
                  <div className="player-fm-bar-row" key={attribute.key}>
                    <span>{attribute.label}</span>
                    <div className="player-fm-bar-track">
                      <div className="player-fm-bar-fill" style={{ width: `${value}%` }} />
                    </div>
                    <strong>{value}</strong>
                  </div>
                );
              }),
            )}
          </div>
        </section>

        {physicalProfile ? (
          <section className="player-fm-panel player-fm-panel-physical">
            <div className="player-fm-panel-header">
              <span>Физика</span>
            </div>
            <div className="player-fm-table">
              {physicalRows.map((row, rowIndex) => (
                <div className="player-fm-row" key={`physical-${rowIndex}`}>
                  {row.map((attribute) => (
                    <Fragment key={attribute.key}>
                      <span>{attribute.label}</span>
                      <strong>{physicalProfile[attribute.key]}</strong>
                    </Fragment>
                  ))}
                  {row.length < 2
                    ? Array.from({ length: 2 - row.length }).map((_, fillerIndex) => (
                        <Fragment key={`physical-filler-${rowIndex}-${fillerIndex}`}>
                          <span className="player-fm-empty">-</span>
                          <strong className="player-fm-empty">-</strong>
                        </Fragment>
                      ))
                    : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {psychologyProfile ? (
          <section className="player-fm-panel player-fm-panel-psychology">
            <div className="player-fm-panel-header">
              <span>Психология</span>
            </div>
            <div className="player-fm-table">
              {psychologyRows.map((row, rowIndex) => (
                <div className="player-fm-row" key={`psychology-${rowIndex}`}>
                  {row.map((attribute) => (
                    <Fragment key={attribute.key}>
                      <span>{attribute.label}</span>
                      <strong>{psychologyProfile[attribute.key]}</strong>
                    </Fragment>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {tacticalProfile ? (
          <section className="player-fm-panel player-fm-panel-tactical">
            <div className="player-fm-panel-header">
              <span>Тактика и IQ</span>
            </div>
            <div className="player-fm-table">
              {tacticalRows.map((row, rowIndex) => (
                <div className="player-fm-row" key={`tactical-${rowIndex}`}>
                  {row.map((attribute) => (
                    <Fragment key={attribute.key}>
                      <span>{attribute.label}</span>
                      <strong>{tacticalProfile[attribute.key]}</strong>
                    </Fragment>
                  ))}
                  {row.length < 2
                    ? Array.from({ length: 2 - row.length }).map((_, fillerIndex) => (
                        <Fragment key={`tactical-filler-${rowIndex}-${fillerIndex}`}>
                          <span className="player-fm-empty">-</span>
                          <strong className="player-fm-empty">-</strong>
                        </Fragment>
                      ))
                    : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
