export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const DEFAULT_JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
} as const;
