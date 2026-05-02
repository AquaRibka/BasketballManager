import type { ValidationError } from 'class-validator';
import type { ApiFieldValidationError } from './api-error.types';

function collectValidationErrors(
  errors: ValidationError[],
  parentPath?: string,
): ApiFieldValidationError[] {
  return errors.flatMap((error) => {
    const field = parentPath ? `${parentPath}.${error.property}` : error.property;
    const messages = error.constraints ? Object.values(error.constraints) : [];
    const currentLevel = messages.length > 0 ? [{ field, messages }] : [];
    const children = error.children?.length ? collectValidationErrors(error.children, field) : [];

    return [...currentLevel, ...children];
  });
}

export function formatValidationErrors(errors: ValidationError[]) {
  return {
    errors: collectValidationErrors(errors),
  };
}
