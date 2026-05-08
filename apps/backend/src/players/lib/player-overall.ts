import {
  OVERALL_V1_MAX,
  OVERALL_V1_MIN,
  PLAYER_POSITIONS,
  PLAYER_RANGE_PRESETS,
  type PlayerPosition,
} from '@basketball-manager/shared';

const PLAYER_OVERALL_MIN = 1;
const PLAYER_OVERALL_MAX = 100;
export const PLAYER_OVERALL_POSITIONS = PLAYER_POSITIONS;

export type PlayerOverallPosition = PlayerPosition;

export interface PlayerOverallWeights {
  shooting: number;
  passing: number;
  defense: number;
  rebounding: number;
  stamina: number;
}

export interface PlayerOverallInput {
  position: PlayerOverallPosition;
  shooting: number;
  passing: number;
  defense: number;
  rebounding: number;
  stamina?: number;
  athleticism?: number;
  role?: string | null;
}

export interface PlayerOverallWeightsContext {
  player: PlayerOverallInput;
  position: PlayerOverallPosition;
  role?: string | null;
  defaultWeights: PlayerOverallWeights;
}

export interface CalculatePlayerOverallOptions {
  positionWeights?: Partial<Record<PlayerOverallPosition, PlayerOverallWeights>>;
  resolveWeights?: (context: PlayerOverallWeightsContext) => PlayerOverallWeights;
}

export const DEFAULT_PLAYER_OVERALL_WEIGHTS: Record<PlayerOverallPosition, PlayerOverallWeights> = {
  PG: {
    shooting: 0.3,
    passing: 0.3,
    defense: 0.15,
    rebounding: 0.05,
    stamina: 0.2,
  },
  SG: {
    shooting: 0.32,
    passing: 0.22,
    defense: 0.16,
    rebounding: 0.08,
    stamina: 0.22,
  },
  SF: {
    shooting: 0.24,
    passing: 0.18,
    defense: 0.22,
    rebounding: 0.14,
    stamina: 0.22,
  },
  PF: {
    shooting: 0.16,
    passing: 0.12,
    defense: 0.28,
    rebounding: 0.24,
    stamina: 0.2,
  },
  C: {
    shooting: 0.1,
    passing: 0.1,
    defense: 0.3,
    rebounding: 0.3,
    stamina: 0.2,
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function assertFiniteAttribute(name: string, value: number) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }

  if (value < PLAYER_RANGE_PRESETS.attribute.min || value > PLAYER_RANGE_PRESETS.attribute.max) {
    throw new RangeError(
      `${name} must be between ${PLAYER_RANGE_PRESETS.attribute.min} and ${PLAYER_RANGE_PRESETS.attribute.max}`,
    );
  }
}

function resolveStamina(player: PlayerOverallInput) {
  if (typeof player.stamina === 'number') {
    return player.stamina;
  }

  if (typeof player.athleticism === 'number') {
    return player.athleticism;
  }

  throw new TypeError('player.stamina is required');
}

function resolveDefaultWeights(
  position: PlayerOverallPosition,
  overrides?: CalculatePlayerOverallOptions['positionWeights'],
) {
  const defaultWeights = DEFAULT_PLAYER_OVERALL_WEIGHTS[position];

  if (!defaultWeights) {
    throw new RangeError(`position must be one of: ${PLAYER_OVERALL_POSITIONS.join(', ')}`);
  }

  const overrideWeights = overrides?.[position];

  return overrideWeights ? { ...defaultWeights, ...overrideWeights } : defaultWeights;
}

export function calculatePlayerOverall(
  player: PlayerOverallInput,
  options: CalculatePlayerOverallOptions = {},
) {
  if (!player || typeof player !== 'object') {
    throw new TypeError('player must be an object');
  }

  if (!PLAYER_OVERALL_POSITIONS.includes(player.position)) {
    throw new RangeError(`position must be one of: ${PLAYER_OVERALL_POSITIONS.join(', ')}`);
  }

  const defaultWeights = resolveDefaultWeights(player.position, options.positionWeights);
  const weights = options.resolveWeights
    ? options.resolveWeights({
        player,
        position: player.position,
        role: player.role,
        defaultWeights,
      })
    : defaultWeights;
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
