import { API_BASE_URL, DEFAULT_JSON_HEADERS } from './config';
import { apiEndpoints } from './endpoints';
import { ApiClientError, ApiNetworkError, isApiErrorResponse } from './errors';
import type {
  ApiErrorResponse,
  ApiListResponse,
  CareerSaveState,
  CreatePlayerPayload,
  CreateSavePayload,
  CreateTeamPayload,
  PlayerSummary,
  SeasonFullSimulationResponse,
  SeasonNextRoundResponse,
  SeasonRoundSimulationResponse,
  SeasonScheduleResponse,
  SeasonStandingsResponse,
  SeasonSummary,
  TeamDetails,
  TeamRosterResponse,
  TeamSummary,
} from './types';

type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type RequestOptions = {
  body?: unknown;
  headers?: HeadersInit;
  method?: RequestMethod;
  signal?: AbortSignal;
};

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return null;
  }

  return response.json() as Promise<unknown>;
}

function buildRequestInit(options: RequestOptions): RequestInit {
  const headers =
    options.body === undefined
      ? {
          Accept: DEFAULT_JSON_HEADERS.Accept,
          ...options.headers,
        }
      : {
          ...DEFAULT_JSON_HEADERS,
          ...options.headers,
        };

  return {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  };
}

async function request<TResponse>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, buildRequestInit(options));
  } catch (error) {
    throw new ApiNetworkError(error instanceof Error ? error.message : undefined);
  }

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    if (isApiErrorResponse(payload)) {
      throw new ApiClientError(payload);
    }

    const fallbackError: ApiErrorResponse = {
      statusCode: response.status,
      code: 'HTTP_ERROR',
      message: `API request failed with status ${response.status}`,
      details: null,
      path: endpoint,
      timestamp: new Date().toISOString(),
    };

    throw new ApiClientError(fallbackError);
  }

  return payload as TResponse;
}

export const apiClient = {
  get<TResponse>(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return request<TResponse>(endpoint, { ...options, method: 'GET' });
  },
  post<TResponse>(
    endpoint: string,
    body?: unknown,
    options: Omit<RequestOptions, 'method' | 'body'> = {},
  ) {
    return request<TResponse>(endpoint, { ...options, method: 'POST', body });
  },
  patch<TResponse>(
    endpoint: string,
    body?: unknown,
    options: Omit<RequestOptions, 'method' | 'body'> = {},
  ) {
    return request<TResponse>(endpoint, { ...options, method: 'PATCH', body });
  },
  delete<TResponse>(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return request<TResponse>(endpoint, { ...options, method: 'DELETE' });
  },
};

export const teamsApi = {
  async list(signal?: AbortSignal) {
    const response = await apiClient.get<ApiListResponse<TeamSummary>>(apiEndpoints.teams.list, {
      signal,
    });
    return response.items;
  },
  create(payload: CreateTeamPayload, signal?: AbortSignal) {
    return apiClient.post<TeamSummary>(apiEndpoints.teams.create, payload, { signal });
  },
  getById(teamId: string, signal?: AbortSignal) {
    return apiClient.get<TeamDetails>(apiEndpoints.teams.details(teamId), { signal });
  },
  getRoster(teamId: string, signal?: AbortSignal) {
    return apiClient.get<TeamRosterResponse>(apiEndpoints.teams.roster(teamId), { signal });
  },
};

export const playersApi = {
  create(payload: CreatePlayerPayload, signal?: AbortSignal) {
    return apiClient.post<PlayerSummary>(apiEndpoints.players.create, payload, { signal });
  },
};

export const savesApi = {
  create(payload: CreateSavePayload, signal?: AbortSignal) {
    return apiClient.post<CareerSaveState>(apiEndpoints.saves.create, payload, { signal });
  },
  getById(saveId: string, signal?: AbortSignal) {
    return apiClient.get<CareerSaveState>(apiEndpoints.saves.details(saveId), { signal });
  },
  startNextSeason(saveId: string, signal?: AbortSignal) {
    return apiClient.post<CareerSaveState>(apiEndpoints.saves.nextSeason(saveId), undefined, {
      signal,
    });
  },
  remove(saveId: string, signal?: AbortSignal) {
    return apiClient.delete<void>(apiEndpoints.saves.details(saveId), { signal });
  },
};

export const seasonsApi = {
  create(payload: { name: string; year: number }, signal?: AbortSignal) {
    return apiClient.post<SeasonSummary>(apiEndpoints.seasons.create, payload, {
      signal,
    });
  },
  getCurrent(signal?: AbortSignal) {
    return apiClient.get<SeasonSummary>(apiEndpoints.seasons.current, { signal });
  },
  generateSchedule(seasonId: string, signal?: AbortSignal) {
    return apiClient.post<SeasonScheduleResponse>(apiEndpoints.seasons.schedule(seasonId), undefined, {
      signal,
    });
  },
  getSchedule(seasonId: string, signal?: AbortSignal) {
    return apiClient.get<SeasonScheduleResponse>(apiEndpoints.seasons.schedule(seasonId), {
      signal,
    });
  },
  getStandings(seasonId: string, signal?: AbortSignal) {
    return apiClient.get<SeasonStandingsResponse>(apiEndpoints.seasons.standings(seasonId), {
      signal,
    });
  },
  simulateCurrentRound(seasonId: string, signal?: AbortSignal) {
    return apiClient.post<SeasonRoundSimulationResponse>(
      apiEndpoints.seasons.simulateCurrentRound(seasonId),
      undefined,
      {
        signal,
      },
    );
  },
  simulateRemainingSeason(seasonId: string, signal?: AbortSignal) {
    return apiClient.post<SeasonFullSimulationResponse>(
      apiEndpoints.seasons.simulateRemaining(seasonId),
      undefined,
      {
        signal,
      },
    );
  },
  advanceToNextRound(seasonId: string, signal?: AbortSignal) {
    return apiClient.post<SeasonNextRoundResponse>(apiEndpoints.seasons.nextRound(seasonId), undefined, {
      signal,
    });
  },
};

export type {
  ApiErrorResponse,
  ApiListResponse,
  CareerSaveSeason,
  CareerSaveState,
  CareerSaveSummary,
  CreatePlayerPayload,
  CreateSavePayload,
  CreateTeamPayload,
  MatchSummary,
  MatchTeam,
  PlayerBodyType,
  PlayerDominantHand,
  PlayerPosition,
  PlayerSummary,
  SeasonChampion,
  SeasonFullSimulationResponse,
  SeasonNextRoundResponse,
  SeasonRoundSimulationResponse,
  SeasonScheduleResponse,
  SeasonStandingRow,
  SeasonStandingsResponse,
  SeasonSummary,
  TeamDetails,
  TeamPlayer,
  TeamRosterResponse,
  TeamSummary,
} from './types';

export { apiEndpoints } from './endpoints';
export { ApiClientError, ApiNetworkError, getErrorMessage } from './errors';
