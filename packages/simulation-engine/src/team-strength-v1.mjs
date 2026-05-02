import { PLAYER_POSITIONS } from '@basketball-manager/shared';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function averageBy(players, getValue, fallback = 60) {
  if (players.length === 0) {
    return fallback;
  }

  const total = players.reduce((sum, player) => sum + getValue(player), 0);
  return total / players.length;
}

function resolveStamina(player) {
  if (typeof player.stamina === 'number') {
    return player.stamina;
  }

  if (typeof player.athleticism === 'number') {
    return player.athleticism;
  }

  return 60;
}

function buildPlayerRoleScore(player) {
  const stamina = resolveStamina(player);
  const positionWeights = {
    PG: { shooting: 0.28, passing: 0.32, defense: 0.14, rebounding: 0.06, stamina: 0.2 },
    SG: { shooting: 0.31, passing: 0.2, defense: 0.15, rebounding: 0.1, stamina: 0.24 },
    SF: { shooting: 0.22, passing: 0.16, defense: 0.2, rebounding: 0.16, stamina: 0.26 },
    PF: { shooting: 0.14, passing: 0.11, defense: 0.24, rebounding: 0.24, stamina: 0.27 },
    C: { shooting: 0.08, passing: 0.08, defense: 0.28, rebounding: 0.31, stamina: 0.25 },
  };
  const weights = positionWeights[player.position];

  if (!weights) {
    return player.overall;
  }

  return (
    player.shooting * weights.shooting +
    player.passing * weights.passing +
    player.defense * weights.defense +
    player.rebounding * weights.rebounding +
    stamina * weights.stamina
  );
}

function buildPositionStrength(players, averageOverall) {
  const lineupWeights = {
    PG: 0.19,
    SG: 0.19,
    SF: 0.2,
    PF: 0.2,
    C: 0.22,
  };

  return PLAYER_POSITIONS.reduce((sum, position) => {
    const candidates = players.filter((player) => player.position === position);
    const bestPlayerScore =
      candidates.length > 0
        ? Math.max(...candidates.map((player) => buildPlayerRoleScore(player)))
        : averageOverall * 0.9;

    return sum + bestPlayerScore * lineupWeights[position];
  }, 0);
}

function buildAttributeStrength(players) {
  const shooting = averageBy(players, (player) => player.shooting);
  const passing = averageBy(players, (player) => player.passing);
  const defense = averageBy(players, (player) => player.defense);
  const rebounding = averageBy(players, (player) => player.rebounding);
  const athleticism = averageBy(players, (player) => player.athleticism ?? resolveStamina(player));

  return shooting * 0.26 + passing * 0.18 + defense * 0.24 + rebounding * 0.16 + athleticism * 0.16;
}

function buildStaminaFactor(players) {
  const averageStamina = averageBy(players, (player) => resolveStamina(player));
  const depthStamina = averageBy(
    [...players].sort((left, right) => right.overall - left.overall).slice(0, 8),
    (player) => resolveStamina(player),
    averageStamina,
  );

  return averageStamina * 0.65 + depthStamina * 0.35;
}

export function calculateTeamStrengthV1(team, options = {}) {
  if (!team || typeof team !== 'object') {
    throw new TypeError('team must be an object');
  }

  const players = team.players ?? [];
  const averageOverall = averageBy(players, (player) => player.overall);
  const positionStrength = buildPositionStrength(players, averageOverall);
  const attributeStrength = buildAttributeStrength(players);
  const staminaFactor = buildStaminaFactor(players);
  const randomValue =
    typeof options.randomValue === 'number' && Number.isFinite(options.randomValue)
      ? clamp(options.randomValue, 0, 1)
      : 0.5;
  const randomFactor = (randomValue - 0.5) * 5;

  const rawStrength =
    team.rating * 0.24 +
    averageOverall * 0.34 +
    positionStrength * 0.22 +
    attributeStrength * 0.12 +
    staminaFactor * 0.08 +
    randomFactor;

  return clamp(Number(rawStrength.toFixed(2)), 1, 100);
}
