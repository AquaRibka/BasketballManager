export const PLAYER_ATTRIBUTE_MIN: number;
export const PLAYER_ATTRIBUTE_MAX: number;
export const OVERALL_V1_MIN: number;
export const OVERALL_V1_MAX: number;

export const PLAYER_POSITIONS: readonly ['PG', 'SG', 'SF', 'PF', 'C'];
export const PLAYER_DOMINANT_HANDS: readonly ['LEFT', 'RIGHT', 'AMBIDEXTROUS'];
export const PLAYER_BODY_TYPES: readonly ['SLIM', 'ATHLETIC', 'STRONG', 'HEAVY'];
export const PLAYER_DEVELOPMENT_FOCUS: readonly [
  'BALANCED',
  'SCORING',
  'PLAYMAKING',
  'DEFENSE',
  'ATHLETICISM',
  'REBOUNDING',
];
export const PLAYER_CAREER_STATUSES: readonly ['ACTIVE', 'FORMER', 'FREE_AGENT'];
export const PLAYER_SOCIAL_PLATFORMS: readonly [
  'INSTAGRAM',
  'TIKTOK',
  'X',
  'YOUTUBE',
  'TELEGRAM',
  'VK',
];
export const PLAYER_AUDIENCE_SENTIMENTS: readonly [
  'NEGATIVE',
  'MIXED',
  'POSITIVE',
  'SUPPORTIVE',
];
export const PLAYER_MEDIA_STATUSES: readonly [
  'LOW_PROFILE',
  'LOCAL_BUZZ',
  'NATIONAL_NAME',
  'LEAGUE_STAR',
  'ICON',
];
export const PLAYER_INJURY_SEVERITIES: readonly ['MINOR', 'MODERATE', 'MAJOR', 'SEVERE'];
export const PLAYER_INJURY_STATUSES: readonly ['ACTIVE', 'RECOVERING', 'RECOVERED'];
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
  'social',
];
export const PLAYER_SOCIAL_PROFILE_FIELDS: readonly [
  'platform',
  'nickname',
  'followersCount',
  'followerGrowthWeekly',
  'engagementRate',
  'audienceSentiment',
  'mediaStatus',
  'hypeScore',
  'controversyScore',
  'marketabilityScore',
  'lastUpdatedAt',
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
export type PlayerDominantHand = 'LEFT' | 'RIGHT' | 'AMBIDEXTROUS';
export type PlayerBodyType = 'SLIM' | 'ATHLETIC' | 'STRONG' | 'HEAVY';
export type PlayerDevelopmentFocus =
  | 'BALANCED'
  | 'SCORING'
  | 'PLAYMAKING'
  | 'DEFENSE'
  | 'ATHLETICISM'
  | 'REBOUNDING';
export type PlayerCareerStatus = 'ACTIVE' | 'FORMER' | 'FREE_AGENT';
export type PlayerSocialPlatform =
  | 'INSTAGRAM'
  | 'TIKTOK'
  | 'X'
  | 'YOUTUBE'
  | 'TELEGRAM'
  | 'VK';
export type PlayerAudienceSentiment = 'NEGATIVE' | 'MIXED' | 'POSITIVE' | 'SUPPORTIVE';
export type PlayerMediaStatus =
  | 'LOW_PROFILE'
  | 'LOCAL_BUZZ'
  | 'NATIONAL_NAME'
  | 'LEAGUE_STAR'
  | 'ICON';
export type PlayerInjurySeverity = 'MINOR' | 'MODERATE' | 'MAJOR' | 'SEVERE';
export type PlayerInjuryStatus = 'ACTIVE' | 'RECOVERING' | 'RECOVERED';
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
  | 'reputation'
  | 'social';
export type PlayerSocialProfileField =
  | 'platform'
  | 'nickname'
  | 'followersCount'
  | 'followerGrowthWeekly'
  | 'engagementRate'
  | 'audienceSentiment'
  | 'mediaStatus'
  | 'hypeScore'
  | 'controversyScore'
  | 'marketabilityScore'
  | 'lastUpdatedAt';
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
  platform: PlayerSocialPlatform;
  nickname: string;
  followersCount: number;
  followerGrowthWeekly: number;
  engagementRate: number;
  audienceSentiment: PlayerAudienceSentiment;
  mediaStatus: PlayerMediaStatus;
  hypeScore: number;
  controversyScore: number;
  marketabilityScore: number;
  lastUpdatedAt: string;
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

export interface PlayerSeasonStatEntryShape extends PlayerSeasonStatLine {
  id: string;
  season: string;
  league: string;
  team: PlayerTeamSummaryShape | null;
}

export interface PlayerCareerTotalsShape {
  seasonsCount: number;
  gamesPlayed: number;
  gamesStarted: number;
  totalMinutes: number;
  totalPoints: number;
  totalRebounds: number;
  totalAssists: number;
  totalSteals: number;
  totalBlocks: number;
  totalTurnovers: number;
  totalFouls: number;
  averageMinutesPerGame: number;
  averagePointsPerGame: number;
  averageReboundsPerGame: number;
  averageAssistsPerGame: number;
  averageStealsPerGame: number;
  averageBlocksPerGame: number;
  averageTurnoversPerGame: number;
  averageFoulsPerGame: number;
  fgPct: number;
  threePct: number;
  ftPct: number;
  efficiencyRating: number;
}

export interface PlayerAwardShape {
  id: string;
  season: string;
  awardType: string;
  league: string;
  description: string | null;
  team: PlayerTeamSummaryShape | null;
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
  dateOfBirth: string | null;
  dominantHand: PlayerDominantHand | null;
  secondaryPositions: PlayerPosition[];
  shooting: number;
  passing: number;
  defense: number;
  rebounding: number;
  athleticism: number;
  overall: number;
  physicalProfile: PlayerPhysicalSummaryShape | null;
  healthProfile: PlayerHealthSummaryShape | null;
  psychologyProfile: PlayerPsychologySummaryShape | null;
  tacticalProfile: PlayerTacticalSummaryShape | null;
  socialProfile: PlayerSocialProfile | null;
  teamId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerPhysicalSummaryShape {
  heightCm: number;
  weightKg: number;
  wingspanCm: number | null;
  bodyType: PlayerBodyType | null;
  speed: number;
  acceleration: number;
  vertical: number;
  strength: number;
  endurance: number;
  balance: number;
  agility: number;
  coordination: number;
  reaction: number;
  recovery: number;
  explosiveness: number;
}

export interface PlayerPsychologySummaryShape {
  selfControl: number;
  concentration: number;
  determination: number;
  leadership: number;
  workEthic: number;
  aggressiveness: number;
  teamwork: number;
  confidence: number;
}

export interface PlayerHealthSummaryShape {
  overallCondition: number;
  fatigue: number;
  postInjuryCondition: number;
  injuryRisk: number;
  durability: number;
  recoveryRate: number;
  painTolerance: number;
  medicalOutlook: number;
}

export interface PlayerInjuryHistoryEntryShape {
  id: string;
  title: string;
  bodyPart: string;
  severity: PlayerInjurySeverity;
  status: PlayerInjuryStatus;
  occurredAt: string;
  expectedReturnAt: string | null;
  returnedAt: string | null;
  gamesMissed: number;
  notes: string | null;
}

export interface PlayerHealthDetailsShape {
  playerId: string;
  playerName: string;
  healthProfile: PlayerHealthSummaryShape | null;
  injuryHistory: PlayerInjuryHistoryEntryShape[];
}

export interface PlayerSocialDetailsShape {
  playerId: string;
  playerName: string;
  socialProfile: PlayerSocialProfile | null;
}

export interface PlayerCareerHistoryEntryShape {
  id: string;
  season: string;
  league: string;
  role: string;
  jerseyNumber: number | null;
  status: PlayerCareerStatus;
  transferDate: string | null;
  transferReason: string | null;
  achievements: string[];
  team: PlayerTeamSummaryShape | null;
}

export interface PlayerTacticalSummaryShape {
  basketballIQ: number;
  shotSelection: number;
  courtVision: number;
  defenseReading: number;
  offenseReading: number;
  decisionMaking: number;
  offBallMovement: number;
  spacing: number;
  pickAndRollOffense: number;
  pickAndRollDefense: number;
  helpDefense: number;
  discipline: number;
}

export interface PlayerHiddenSummaryShape {
  potential: number;
  potentialAbility: number;
  currentAbility: number;
  growthRate: number;
  developmentFocus: PlayerDevelopmentFocus;
  peakStartAge: number;
  peakEndAge: number;
  declineStartAge: number;
  professionalism: number;
  loyalty: number;
  consistency: number;
  injuryProneness: number;
  importantMatches: number;
  mediaAppeal: number;
  ego: number;
  wantsToLeave: number;
  agentInfluence: number;
  learningAbility: number;
  hiddenReputation: number;
}

export interface CreatePlayerPayloadShape {
  name: string;
  age: number;
  position: PlayerPosition;
  dateOfBirth?: string;
  dominantHand?: PlayerDominantHand;
  secondaryPositions?: PlayerPosition[];
  heightCm?: number;
  weightKg?: number;
  wingspanCm?: number;
  bodyType?: PlayerBodyType;
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
  careerHistory?: PlayerCareerHistoryEntryShape[];
  seasonStats?: PlayerSeasonStatEntryShape[];
  careerTotals?: PlayerCareerTotalsShape | null;
  awards?: PlayerAwardShape[];
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
