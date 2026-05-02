import { ValidationPipe } from '@nestjs/common';

export function createApiValidationPipe() {
  return new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  });
}
