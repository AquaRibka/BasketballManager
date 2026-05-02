import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

const CUID_REGEX = /^c[a-z0-9]{24}$/;

export function IsCuidString(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isCuidString',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && CUID_REGEX.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid cuid`;
        },
      },
    });
  };
}
