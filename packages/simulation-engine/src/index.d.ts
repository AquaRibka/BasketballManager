export interface SimulateMatchPlayerInput {
  overall: number;
}

export interface SimulateMatchTeamInput {
  id: string;
  rating: number;
  players?: SimulateMatchPlayerInput[];
}

export interface SimulateMatchInput {
  matchId: string;
  homeTeam: SimulateMatchTeamInput;
  awayTeam: SimulateMatchTeamInput;
}

export interface SimulateMatchResult {
  homeScore: number;
  awayScore: number;
  winnerTeamId: string;
}

export function simulateMatch(input: SimulateMatchInput): SimulateMatchResult;
