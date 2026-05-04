export const PLAYER_ATTRIBUTE_MIN: number;
export const PLAYER_ATTRIBUTE_MAX: number;
export const OVERALL_V1_MIN: number;
export const OVERALL_V1_MAX: number;

export const PLAYER_POSITIONS: readonly ['PG', 'SG', 'SF', 'PF', 'C'];

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
  seed: string;
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
