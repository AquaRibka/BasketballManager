import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import { formatValidationErrors } from '../errors/format-validation-errors';

export function createApiValidationPipe() {
  return new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors: ValidationError[]) =>
      new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: formatValidationErrors(errors),
      }),
  });
}
