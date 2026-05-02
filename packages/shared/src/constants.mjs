export const PLAYER_ATTRIBUTE_MIN = 0;
export const PLAYER_ATTRIBUTE_MAX = 100;
export const OVERALL_V1_MIN = 1;
export const OVERALL_V1_MAX = 100;

export const PLAYER_POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];

export const OVERALL_V1_POSITION_WEIGHTS = {
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
