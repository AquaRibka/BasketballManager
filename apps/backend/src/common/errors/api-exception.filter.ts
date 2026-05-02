import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ApiErrorResponse } from './api-error.types';

const DEFAULT_ERROR_CODES: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_ERROR',
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload = this.buildPayload(exception, statusCode, request.url);

    if (statusCode >= 500) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(
        `${request.method} ${request.url} -> ${statusCode} ${payload.code}: ${payload.message}`,
        stack,
      );
    }

    response.status(statusCode).json(payload);
  }

  private buildPayload(exception: unknown, statusCode: number, path: string): ApiErrorResponse {
    if (!(exception instanceof HttpException)) {
      return {
        statusCode,
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        details: null,
        path,
        timestamp: new Date().toISOString(),
      };
    }

    const response = exception.getResponse();
    const normalized = this.normalizeHttpExceptionResponse(response, statusCode);

    return {
      statusCode,
      code: normalized.code,
      message: normalized.message,
      details: normalized.details,
      path,
      timestamp: new Date().toISOString(),
    };
  }

  private normalizeHttpExceptionResponse(response: string | object, statusCode: number) {
    if (typeof response === 'string') {
      return {
        code: DEFAULT_ERROR_CODES[statusCode] ?? 'HTTP_ERROR',
        message: response,
        details: null,
      };
    }

    const body = response as Record<string, unknown>;
    const bodyCode = typeof body.code === 'string' ? body.code : null;
    const bodyMessage = body.message;
    const bodyDetails =
      body.details && typeof body.details === 'object'
        ? (body.details as Record<string, unknown>)
        : null;

    if (Array.isArray(bodyMessage)) {
      return {
        code: bodyCode ?? 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: {
          errors: bodyMessage,
        },
      };
    }

    return {
      code: bodyCode ?? DEFAULT_ERROR_CODES[statusCode] ?? 'HTTP_ERROR',
      message:
        typeof bodyMessage === 'string'
          ? bodyMessage
          : ((body.error as string | undefined) ?? 'Request failed'),
      details: bodyDetails,
    };
  }
}
