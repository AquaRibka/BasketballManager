export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE_ENTITY'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

export type ApiValidationIssue = {
  field: string;
  messages: string[];
};

export type ApiErrorDetails = {
  errors?: ApiValidationIssue[];
} & Record<string, unknown>;

export type ApiErrorResponse = {
  statusCode: number;
  code: ApiErrorCode | string;
  message: string;
  details: ApiErrorDetails | null;
  path: string;
  timestamp: string;
};

export type ApiListResponse<TItem> = {
  items: TItem[];
  total: number;
};

export type TeamSummary = {
  id: string;
  name: string;
  city: string;
  shortName: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
};

export type TeamPlayer = {
  id: string;
  name: string;
  age: number;
  position: string;
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
};

export type TeamDetails = TeamSummary & {
  players: TeamPlayer[];
};

export type TeamRosterResponse = {
  teamId: string;
  items: TeamPlayer[];
  total: number;
};

export type MatchTeam = {
  id: string;
  name: string;
  shortName: string;
  rating?: number;
};

export type MatchSummary = {
  id: string;
  seasonId: string | null;
  round: number | null;
  status: string;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  date: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerTeamId: string | null;
  playedAt: string | null;
};

export type SeasonSummary = {
  id: string;
  name: string;
  year: number;
  status: string;
  currentRound: number;
  startedAt: string;
  createdAt: string;
  updatedAt: string;
  finishedAt: string | null;
};

export type SeasonScheduleRound = {
  round: number;
  status: string;
  matches: MatchSummary[];
};

export type SeasonScheduleResponse = {
  seasonId: string;
  rounds: SeasonScheduleRound[];
  totalRounds: number;
  totalMatches: number;
};

export type SeasonRoundSimulationResponse = {
  seasonId: string;
  round: number;
  status: string;
  matches: MatchSummary[];
  standingsUpdated: boolean;
  currentRound: number;
  seasonStatus: string;
  finishedAt: string | null;
};

export type SeasonStandingRow = {
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
};

export type SeasonChampion = {
  teamId: string;
  teamName: string;
  shortName: string;
};

export type SeasonStandingsResponse = {
  seasonId: string;
  seasonStatus: string;
  isFinal: boolean;
  updatedAt: string | null;
  champion: SeasonChampion | null;
  items: SeasonStandingRow[];
};
