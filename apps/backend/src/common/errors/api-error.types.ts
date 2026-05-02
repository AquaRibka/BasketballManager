export type ApiFieldValidationError = {
  field: string;
  messages: string[];
};

export type ApiErrorResponse = {
  statusCode: number;
  code: string;
  message: string;
  details: Record<string, unknown> | null;
  path: string;
  timestamp: string;
};
