import type {
  ApiErrorCode as SharedApiErrorCode,
  ApiErrorDetails as SharedApiErrorDetails,
  ApiErrorResponse as SharedApiErrorResponse,
  ApiListResponse as SharedApiListResponse,
  ApiValidationIssue as SharedApiValidationIssue,
  CareerSaveSeasonShape,
  CareerSaveSummaryShape,
  CreatePlayerPayloadShape,
  CreateTeamPayloadShape,
  MatchStatus,
  MatchSummaryShape,
  MatchTeamSummary,
  PlayerPosition,
  PlayerSummaryShape,
  SeasonFullSimulationResponseShape,
  SeasonNextRoundResponseShape,
  SeasonRoundSimulationResponseShape,
  SeasonScheduleRoundShape,
  SeasonStandingsResponseShape,
  SeasonStatus,
  SeasonSummaryShape,
  TeamDetailsShape,
  TeamPlayerShape,
  TeamRosterResponseShape,
  TeamSummaryShape,
} from '@basketball-manager/shared';

export type {
  CareerSaveStatus,
  MatchStatus,
  PlayerPosition,
  SeasonStatus,
} from '@basketball-manager/shared';

export type ApiValidationIssue = SharedApiValidationIssue;
export type ApiErrorCode = SharedApiErrorCode;
export type ApiErrorDetails = SharedApiErrorDetails;
export type ApiErrorResponse = SharedApiErrorResponse;
export type ApiListResponse<TItem> = SharedApiListResponse<TItem>;

export type TeamSummary = TeamSummaryShape;

export type CreateTeamPayload = CreateTeamPayloadShape;

export type TeamPlayer = TeamPlayerShape;

export type CreatePlayerPayload = CreatePlayerPayloadShape;

export type PlayerSummary = PlayerSummaryShape;

export type TeamDetails = TeamDetailsShape;

export type TeamRosterResponse = TeamRosterResponseShape;

export type MatchTeam = MatchTeamSummary & {
  rating?: number;
};

export type MatchSummary = MatchSummaryShape<MatchTeam>;

export type SeasonSummary = SeasonSummaryShape;

export type SeasonScheduleRound = SeasonScheduleRoundShape<MatchSummary>;

export type SeasonScheduleResponse = {
  seasonId: string;
  rounds: SeasonScheduleRound[];
  totalRounds: number;
  totalMatches: number;
};

export type SeasonRoundSimulationResponse = SeasonRoundSimulationResponseShape<MatchSummary>;

export type SeasonNextRoundResponse = SeasonNextRoundResponseShape;

export type SeasonFullSimulationResponse = SeasonFullSimulationResponseShape;

export type SeasonStandingRow = SeasonStandingsResponseShape['items'][number];

export type SeasonChampion = NonNullable<SeasonStandingsResponseShape['champion']>;

export type SeasonStandingsResponse = SeasonStandingsResponseShape;

export type CareerSaveSummary = CareerSaveSummaryShape;

export type CareerSaveSeason = CareerSaveSeasonShape;

export type CareerSaveState = {
  save: CareerSaveSummary;
  season: CareerSaveSeason;
  schedule: SeasonScheduleResponse;
  standings: SeasonStandingsResponse;
};

export type CreateSavePayload = {
  name: string;
  teamId: string;
};
