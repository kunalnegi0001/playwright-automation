import { logger } from '@utils/core';
import { validateJSON, validateJoi } from '@utils/validators/schema.validator';

export type ValidationErrorItem = string | { message?: string } | null | undefined;

export const formatValidationMessage = (
  type: string,
  errors: ValidationErrorItem[] | undefined,
  fallbackMessage: string
): string => {
  const details = errors
    ?.map(error => {
      if (typeof error === 'string') {
        return error;
      }
      if (error?.message) {
        return error.message;
      }
      return null;
    })
    .filter(Boolean)
    .join(', ');

  return details ? `${type} validation failed: ${details}` : fallbackMessage;
};

export const getTargetPayload = (
  args: unknown[],
  options: { argumentIndex?: number } = {}
): unknown => {
  const { argumentIndex = 0 } = options;
  return args[argumentIndex];
};

export const replaceTargetPayload = (
  args: unknown[],
  updatedValue: unknown,
  options: { argumentIndex?: number } = {}
): unknown[] => {
  const { argumentIndex = 0 } = options;
  const nextArgs = [...args];
  nextArgs[argumentIndex] = updatedValue;
  return nextArgs;
};

/**
 * Validate function input before execution.
 */
export const withInputValidation = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  validatorFn: (...args: unknown[]) => Promise<boolean> | boolean,
  errorMessage = 'Input validation failed'
): T => {
  return (async (...args: unknown[]) => {
    const valid = await validatorFn(...args);
    if (!valid) {
      throw new Error(errorMessage);
    }
    return fn(...args);
  }) as T;
};

/**
 * Validate function output after execution.
 */
export const withOutputValidation = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  validatorFn: (result: unknown, ...args: unknown[]) => Promise<boolean> | boolean,
  errorMessage = 'Output validation failed'
): T => {
  return (async (...args: unknown[]) => {
    const result = await fn(...args);
    const valid = await validatorFn(result, ...args);
    if (!valid) {
      throw new Error(errorMessage);
    }
    return result;
  }) as T;
};

/**
 * Validate output against JSON schema.
 */
export const withJSONSchemaValidation = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  schema: Record<string, unknown>
): T => {
  return (async (...args: unknown[]) => {
    const result = await fn(...args);
    const validation = validateJSON(result, schema);

    if (!validation.valid) {
      const message = formatValidationMessage(
        'JSON schema',
        validation.errors,
        'JSON schema validation failed'
      );
      logger.error(message);
      throw new Error(message);
    }

    return result;
  }) as T;
};

/**
 * Validate output against Joi schema.
 */
export const withJoiSchemaValidation = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  schema: Record<string, unknown>
): T => {
  return (async (...args: unknown[]) => {
    const result = await fn(...args);
    const validation = validateJoi(result, schema as never);

    if (!validation.valid) {
      const message = formatValidationMessage('Joi', validation.errors, 'Joi validation failed');
      logger.error(message);
      throw new Error(message);
    }

    return validation.value;
  }) as T;
};

/**
 * Validate a specific input argument against JSON schema before execution.
 */
export const withJSONInputSchemaValidation = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  schema: Record<string, unknown>,
  options: { argumentIndex?: number } = {}
): T => {
  return (async (...args: unknown[]) => {
    const payload = getTargetPayload(args, options);
    const validation = validateJSON(payload, schema);

    if (!validation.valid) {
      const message = formatValidationMessage(
        'JSON schema',
        validation.errors,
        'JSON schema input validation failed'
      );
      logger.error(message);
      throw new Error(message);
    }

    return fn(...args);
  }) as T;
};

/**
 * Validate a specific input argument against Joi schema before execution.
 */
export const withJoiInputSchemaValidation = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  schema: Record<string, unknown>,
  options: { argumentIndex?: number } = {}
): T => {
  return (async (...args: unknown[]) => {
    const payload = getTargetPayload(args, options);
    const validation = validateJoi(payload, schema as never);

    if (!validation.valid) {
      const message = formatValidationMessage(
        'Joi',
        validation.errors,
        'Joi input validation failed'
      );
      logger.error(message);
      throw new Error(message);
    }

    const nextArgs = replaceTargetPayload(args, validation.value, options);
    return fn(...nextArgs);
  }) as T;
};
