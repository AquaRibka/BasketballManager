import {
  OVERALL_V1_MAX,
  OVERALL_V1_MIN,
  OVERALL_V1_POSITION_WEIGHTS,
  PLAYER_ATTRIBUTE_MAX,
  PLAYER_ATTRIBUTE_MIN,
  PLAYER_POSITIONS,
} from '@basketball-manager/shared';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function assertFiniteAttribute(name, value) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }

  if (value < PLAYER_ATTRIBUTE_MIN || value > PLAYER_ATTRIBUTE_MAX) {
    throw new RangeError(
      `${name} must be between ${PLAYER_ATTRIBUTE_MIN} and ${PLAYER_ATTRIBUTE_MAX}`,
    );
  }
}

function resolveStamina(player) {
  if (typeof player.stamina === 'number') {
    return player.stamina;
  }

  if (typeof player.athleticism === 'number') {
    return player.athleticism;
  }

  throw new TypeError('player.stamina is required');
}

export function calculateOverallV1(player) {
  if (!player || typeof player !== 'object') {
    throw new TypeError('player must be an object');
  }

  if (!PLAYER_POSITIONS.includes(player.position)) {
    throw new RangeError(`position must be one of: ${PLAYER_POSITIONS.join(', ')}`);
  }

  const weights = OVERALL_V1_POSITION_WEIGHTS[player.position];
  const stamina = resolveStamina(player);

  assertFiniteAttribute('shooting', player.shooting);
  assertFiniteAttribute('passing', player.passing);
  assertFiniteAttribute('defense', player.defense);
  assertFiniteAttribute('rebounding', player.rebounding);
  assertFiniteAttribute('stamina', stamina);

  const rawOverall =
    player.shooting * weights.shooting +
    player.passing * weights.passing +
    player.defense * weights.defense +
    player.rebounding * weights.rebounding +
    stamina * weights.stamina;

  return clamp(Math.round(rawOverall), OVERALL_V1_MIN, OVERALL_V1_MAX);
}
