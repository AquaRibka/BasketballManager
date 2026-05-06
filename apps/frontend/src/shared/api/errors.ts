import type { ApiErrorResponse } from './types';

const DEFAULT_NETWORK_ERROR_MESSAGE = 'Не удалось выполнить запрос к API.';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    isObject(value) &&
    typeof value.statusCode === 'number' &&
    typeof value.code === 'string' &&
    typeof value.message === 'string' &&
    typeof value.path === 'string' &&
    typeof value.timestamp === 'string' &&
    'details' in value
  );
}

export class ApiClientError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details: ApiErrorResponse['details'];
  readonly path: string;
  readonly timestamp: string;

  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.name = 'ApiClientError';
    this.statusCode = response.statusCode;
    this.code = response.code;
    this.details = response.details;
    this.path = response.path;
    this.timestamp = response.timestamp;
  }
}

export class ApiNetworkError extends Error {
  constructor(message = DEFAULT_NETWORK_ERROR_MESSAGE) {
    super(message);
    this.name = 'ApiNetworkError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError || error instanceof ApiNetworkError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return DEFAULT_NETWORK_ERROR_MESSAGE;
}
