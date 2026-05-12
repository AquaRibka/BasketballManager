const PLAYER_ATTRIBUTE_MIN = 0;
const PLAYER_ATTRIBUTE_MAX = 100;
const OVERALL_V1_MIN = 1;
const OVERALL_V1_MAX = 100;

const PLAYER_POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];
const PLAYER_DOMINANT_HANDS = ['LEFT', 'RIGHT', 'AMBIDEXTROUS'];
const PLAYER_BODY_TYPES = ['SLIM', 'ATHLETIC', 'STRONG', 'HEAVY'];
const PLAYER_DEVELOPMENT_FOCUS = [
  'BALANCED',
  'SCORING',
  'PLAYMAKING',
  'DEFENSE',
  'ATHLETICISM',
  'REBOUNDING',
];
const PLAYER_CAREER_STATUSES = ['ACTIVE', 'FORMER', 'FREE_AGENT'];
const PLAYER_SOCIAL_PLATFORMS = ['INSTAGRAM', 'TIKTOK', 'X', 'YOUTUBE', 'TELEGRAM', 'VK'];
const PLAYER_AUDIENCE_SENTIMENTS = ['NEGATIVE', 'MIXED', 'POSITIVE', 'SUPPORTIVE'];
const PLAYER_MEDIA_STATUSES = ['LOW_PROFILE', 'LOCAL_BUZZ', 'NATIONAL_NAME', 'LEAGUE_STAR', 'ICON'];
const PLAYER_INJURY_SEVERITIES = ['MINOR', 'MODERATE', 'MAJOR', 'SEVERE'];
const PLAYER_INJURY_STATUSES = ['ACTIVE', 'RECOVERING', 'RECOVERED'];
const MATCH_STATUSES = ['SCHEDULED', 'COMPLETED'];
const SEASON_STATUSES = ['IN_PROGRESS', 'COMPLETED'];
const CAREER_SAVE_STATUSES = ['ACTIVE'];
const API_ERROR_CODES = [
  'VALIDATION_ERROR',
  'NOT_FOUND',
  'CONFLICT',
  'UNPROCESSABLE_ENTITY',
  'INTERNAL_ERROR',
  'SERVICE_UNAVAILABLE',
];
const PLAYER_RANGE_PRESETS = {
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
const OVERALL_V1_POSITION_WEIGHTS = {
  PG: { shooting: 0.3, passing: 0.3, defense: 0.15, rebounding: 0.05, stamina: 0.2 },
  SG: { shooting: 0.32, passing: 0.22, defense: 0.16, rebounding: 0.08, stamina: 0.22 },
  SF: { shooting: 0.24, passing: 0.18, defense: 0.22, rebounding: 0.14, stamina: 0.22 },
  PF: { shooting: 0.16, passing: 0.12, defense: 0.28, rebounding: 0.24, stamina: 0.2 },
  C: { shooting: 0.1, passing: 0.1, defense: 0.3, rebounding: 0.3, stamina: 0.2 },
};

module.exports = {
  API_ERROR_CODES,
  CAREER_SAVE_STATUSES,
  MATCH_STATUSES,
  OVERALL_V1_MAX,
  OVERALL_V1_MIN,
  OVERALL_V1_POSITION_WEIGHTS,
  PLAYER_ATTRIBUTE_MAX,
  PLAYER_ATTRIBUTE_MIN,
  PLAYER_AUDIENCE_SENTIMENTS,
  PLAYER_BODY_TYPES,
  PLAYER_CAREER_STATUSES,
  PLAYER_DEVELOPMENT_FOCUS,
  PLAYER_DOMINANT_HANDS,
  PLAYER_INJURY_SEVERITIES,
  PLAYER_INJURY_STATUSES,
  PLAYER_MEDIA_STATUSES,
  PLAYER_POSITIONS,
  PLAYER_RANGE_PRESETS,
  PLAYER_SOCIAL_PLATFORMS,
  SEASON_STATUSES,
};
