export const PLAYER_ATTRIBUTE_MIN: number;
export const PLAYER_ATTRIBUTE_MAX: number;
export const OVERALL_V1_MIN: number;
export const OVERALL_V1_MAX: number;

export const PLAYER_POSITIONS: readonly ['PG', 'SG', 'SF', 'PF', 'C'];
export const MATCH_STATUSES: readonly ['SCHEDULED', 'COMPLETED'];
export const SEASON_STATUSES: readonly ['IN_PROGRESS', 'COMPLETED'];
export const CAREER_SAVE_STATUSES: readonly ['ACTIVE'];
export const API_ERROR_CODES: readonly [
  'VALIDATION_ERROR',
  'NOT_FOUND',
  'CONFLICT',
  'UNPROCESSABLE_ENTITY',
  'INTERNAL_ERROR',
  'SERVICE_UNAVAILABLE',
];
export const PLAYER_ATTRIBUTE_GROUPS: readonly [
  'technical',
  'physical',
  'mental',
  'tactical',
  'hidden',
  'health',
  'potential',
  'reputation',
];
export const PLAYER_SOCIAL_PROFILE_FIELDS: readonly [
  'socialMediaPopularity',
  'publicImage',
  'controversyLevel',
  'brandValue',
  'communityPresence',
  'pressHandling',
  'fanAppeal',
  'starPower',
];
export const PLAYER_SEASON_STAT_FIELDS: readonly [
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

export interface NumericRange {
  min: number;
  max: number;
}

export interface PlayerRangePresets {
  attribute: NumericRange;
  status: NumericRange;
  overall: NumericRange;
  potential: NumericRange;
  age: NumericRange;
  heightCm: NumericRange;
  weightKg: NumericRange;
  wingspanCm: NumericRange;
  standingReachCm: NumericRange;
}

export const PLAYER_RANGE_PRESETS: PlayerRangePresets;

export interface OverallV1PositionWeights {
  shooting: number;
  passing: number;
  defense: number;
  rebounding: number;
  stamina: number;
}

export const OVERALL_V1_POSITION_WEIGHTS: Record<
  'PG' | 'SG' | 'SF' | 'PF' | 'C',
  OverallV1PositionWeights
>;

export const SIMULATION_CONTRACT_VERSION: 'v1';

export type PlayerPosition = 'PG' | 'SG' | 'SF' | 'PF' | 'C';
export type MatchStatus = 'SCHEDULED' | 'COMPLETED';
export type SeasonStatus = 'IN_PROGRESS' | 'COMPLETED';
export type CareerSaveStatus = 'ACTIVE';
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE_ENTITY'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';
export type PlayerAttributeGroup =
  | 'technical'
  | 'physical'
  | 'mental'
  | 'tactical'
  | 'hidden'
  | 'health'
  | 'potential'
  | 'reputation';
export type PlayerSocialProfileField =
  | 'socialMediaPopularity'
  | 'publicImage'
  | 'controversyLevel'
  | 'brandValue'
  | 'communityPresence'
  | 'pressHandling'
  | 'fanAppeal'
  | 'starPower';
export type PlayerSeasonStatField =
  | 'gamesPlayed'
  | 'gamesStarted'
  | 'minutesPerGame'
  | 'pointsPerGame'
  | 'reboundsPerGame'
  | 'assistsPerGame'
  | 'stealsPerGame'
  | 'blocksPerGame'
  | 'turnoversPerGame'
  | 'foulsPerGame'
  | 'fgPct'
  | 'threePct'
  | 'ftPct'
  | 'usageRate'
  | 'assistRate'
  | 'reboundRate'
  | 'plusMinus'
  | 'efficiencyRating';

export interface PlayerSocialProfile {
  socialMediaPopularity: number;
  publicImage: number;
  controversyLevel: number;
  brandValue: number;
  communityPresence: number;
  pressHandling: number;
  fanAppeal: number;
  starPower: number;
}

export interface PlayerSeasonStatLine {
  gamesPlayed: number;
  gamesStarted: number;
  minutesPerGame: number;
  pointsPerGame: number;
  reboundsPerGame: number;
  assistsPerGame: number;
  stealsPerGame: number;
  blocksPerGame: number;
  turnoversPerGame: number;
  foulsPerGame: number;
  fgPct: number;
  threePct: number;
  ftPct: number;
  usageRate?: number;
  assistRate?: number;
  reboundRate?: number;
  plusMinus?: number;
  efficiencyRating?: number;
}

export interface ApiValidationIssue {
  field: string;
  messages: string[];
}

export interface ApiErrorDetails extends Record<string, unknown> {
  errors?: ApiValidationIssue[];
}

export interface ApiErrorResponse {
  statusCode: number;
  code: ApiErrorCode | string;
  message: string;
  details: ApiErrorDetails | null;
  path: string;
  timestamp: string;
}

export interface ApiListResponse<TItem> {
  items: TItem[];
  total: number;
}

export interface TeamSummaryShape {
  id: string;
  name: string;
  city: string;
  shortName: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamPayloadShape {
  name: string;
  city: string;
  shortName: string;
  rating: number;
}

export interface TeamPlayerShape {
  id: string;
  name: string;
  age: number;
  position: PlayerPosition;
  shooting: number;
  passing: number;
  defense: number;
  rebounding: number;
  athleticism: number;
  potential: number;
  overall: number;
  teamId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlayerPayloadShape {
  name: string;
  age: number;
  position: PlayerPosition;
  shooting: number;
  passing: number;
  defense: number;
  rebounding: number;
  athleticism: number;
  potential: number;
  teamId?: string;
}

export interface PlayerTeamSummaryShape {
  id: string;
  name: string;
  shortName: string;
}

export interface PlayerSummaryShape extends TeamPlayerShape {
  team?: PlayerTeamSummaryShape | null;
}

export interface TeamDetailsShape extends TeamSummaryShape {
  players: TeamPlayerShape[];
}

export interface TeamRosterResponseShape {
  teamId: string;
  items: TeamPlayerShape[];
  total: number;
}

export interface MatchTeamSummary {
  id: string;
  name: string;
  shortName: string;
}

export interface MatchSummaryShape<TTeam extends MatchTeamSummary = MatchTeamSummary> {
  id: string;
  seasonId: string | null;
  round: number | null;
  status: MatchStatus;
  homeTeam: TTeam;
  awayTeam: TTeam;
  date: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerTeamId: string | null;
  playedAt: string | null;
}

export interface SeasonSummaryShape {
  id: string;
  name: string;
  year: number;
  status: SeasonStatus;
  currentRound: number;
  startedAt: string;
  createdAt: string;
  updatedAt: string;
  finishedAt: string | null;
}

export interface SeasonScheduleRoundShape<TMatch = MatchSummaryShape> {
  round: number;
  status: MatchStatus;
  matches: TMatch[];
}

export interface SeasonRoundSimulationResponseShape<TMatch = MatchSummaryShape> {
  seasonId: string;
  round: number;
  status: MatchStatus;
  matches: TMatch[];
  standingsUpdated: boolean;
  currentRound: number;
  seasonStatus: SeasonStatus;
  finishedAt: string | null;
}

export interface SeasonNextRoundResponseShape {
  seasonId: string;
  previousRound: number;
  currentRound: number;
  seasonStatus: SeasonStatus;
}

export interface SeasonFullSimulationResponseShape {
  seasonId: string;
  startedFromRound: number;
  completedAtRound: number;
  simulatedMatches: number;
  simulatedRoundCount: number;
  seasonStatus: SeasonStatus;
  simulatedRounds: Array<{
    round: number;
    matchesSimulated: number;
  }>;
  finishedAt: string | null;
}

export interface SeasonStandingRowShape {
  position: number;
  teamId: string;
  teamName: string;
  shortName: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  winPercentage: number;
}

export interface SeasonChampionSummary {
  teamId: string;
  teamName: string;
  shortName: string;
}

export interface SeasonStandingsResponseShape {
  seasonId: string;
  seasonStatus: SeasonStatus;
  isFinal: boolean;
  updatedAt: string | null;
  champion: SeasonChampionSummary | null;
  items: SeasonStandingRowShape[];
}

export interface CareerSaveSummaryShape {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  seasonId: string;
  currentRound: number;
  status: CareerSaveStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CareerSaveSeasonShape {
  id: string;
  name: string;
  year: number;
  status: SeasonStatus;
  currentRound: number;
  totalRounds: number;
  teamCount: number;
  startedAt: string;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MatchSimulationPlayerSnapshot {
  id: string;
  name: string;
  position: PlayerPosition;
  overall: number;
  shooting: number;
  passing: number;
  defense: number;
  rebounding: number;
  athleticism: number;
}

export interface MatchSimulationTeamSnapshot {
  id: string;
  name: string;
  shortName: string;
  rating: number;
  players: MatchSimulationPlayerSnapshot[];
}

export interface MatchSimulationInput {
  matchId: string;
  seed?: string;
  homeTeam: MatchSimulationTeamSnapshot;
  awayTeam: MatchSimulationTeamSnapshot;
}

export interface MatchSimulationScore {
  home: number;
  away: number;
}

export interface MatchSimulationTeamStatistics {
  points: number;
  possessions: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  fieldGoalPercentage: number;
  threePointsMade: number;
  threePointsAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  assists: number;
  rebounds: number;
  turnovers: number;
  steals: number;
  blocks: number;
  fouls: number;
}

export interface MatchSimulationStatistics {
  homeTeam: MatchSimulationTeamStatistics;
  awayTeam: MatchSimulationTeamStatistics;
}

export interface MatchSimulationResult {
  matchId: string;
  seed: string;
  winnerTeamId: string;
  loserTeamId: string;
  homeScore: number;
  awayScore: number;
  overtimeCount: number;
  score: MatchSimulationScore;
  statistics: MatchSimulationStatistics;
}
