export const PLAYER_ATTRIBUTE_MIN = 0;
export const PLAYER_ATTRIBUTE_MAX = 100;
export const OVERALL_V1_MIN = 1;
export const OVERALL_V1_MAX = 100;

export const PLAYER_POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];
export const MATCH_STATUSES = ['SCHEDULED', 'COMPLETED'];
export const SEASON_STATUSES = ['IN_PROGRESS', 'COMPLETED'];
export const CAREER_SAVE_STATUSES = ['ACTIVE'];
export const API_ERROR_CODES = [
  'VALIDATION_ERROR',
  'NOT_FOUND',
  'CONFLICT',
  'UNPROCESSABLE_ENTITY',
  'INTERNAL_ERROR',
  'SERVICE_UNAVAILABLE',
];

export const PLAYER_ATTRIBUTE_GROUPS = [
  'technical',
  'physical',
  'mental',
  'tactical',
  'hidden',
  'health',
  'potential',
  'reputation',
];

export const PLAYER_SOCIAL_PROFILE_FIELDS = [
  'socialMediaPopularity',
  'publicImage',
  'controversyLevel',
  'brandValue',
  'communityPresence',
  'pressHandling',
  'fanAppeal',
  'starPower',
];

export const PLAYER_SEASON_STAT_FIELDS = [
  'gamesPlayed',
  'gamesStarted',
  'minutesPerGame',
  'pointsPerGame',
  'reboundsPerGame',
  'assistsPerGame',
  'stealsPerGame',
  'blocksPerGame',
  'turnoversPerGame',
  'foulsPerGame',
  'fgPct',
  'threePct',
  'ftPct',
  'usageRate',
  'assistRate',
  'reboundRate',
  'plusMinus',
  'efficiencyRating',
];

export const PLAYER_RANGE_PRESETS = {
  attribute: { min: 1, max: 100 },
  status: { min: 0, max: 100 },
  overall: { min: 1, max: 100 },
  potential: { min: 1, max: 100 },
  age: { min: 16, max: 50 },
  heightCm: { min: 165, max: 230 },
  weightKg: { min: 65, max: 160 },
  wingspanCm: { min: 170, max: 245 },
  standingReachCm: { min: 210, max: 310 },
};

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
