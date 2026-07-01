/**
 * @fileoverview JSON Schema and Joi validation utilities.
 * Provides schema validation using AJV and Joi with custom validators.
 * @module validators/schema.validator
 * @category Validators
 *
 * Features:
 * - JSON Schema validation (AJV)
 * - Joi schema validation
 * - Custom validators
 * - Schema generation
 * - Validation error formatting
 *
 * @example
 * import * as SchemaValidator from './schema.validator';
 * const result = SchemaValidator.validateJSON(data, userSchema);
 */

import { logger } from '@utils/core';
import Ajv, { type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import Joi, { type ValidationErrorItem } from 'joi';

/**
 * Schema validation result
 */
export type SchemaValidationResult = {
  /** Whether validation passed */
  valid: boolean;
  /** Validation errors */
  errors: Array<Record<string, unknown>>;
  /** Validated/transformed value (Joi only) */
  value?: unknown;
};

/**
 * Formatted validation error
 */
export type SchemaFormattedError = {
  /** Error location path */
  path: string;
  /** Error message */
  message: string;
  /** Error keyword (AJV) */
  keyword?: string;
  /** Error type (Joi) */
  type?: string;
  /** Error parameters */
  params?: Record<string, unknown>;
  /** Schema path where error occurred */
  schemaPath?: string;
  /** Error context information */
  context?: Record<string, unknown>;
};

/**
 * Batch validation result
 */
export type SchemaBatchValidationResult = {
  /** Number of valid items */
  validCount: number;
  /** Number of invalid items */
  invalidCount: number;
  /** Invalid items with errors */
  errors: Array<{
    /** Item index in array */
    index: number;
    /** Invalid item data */
    item: unknown;
    /** Validation errors for item */
    errors: Array<Record<string, unknown>>;
  }>;
};

// Initialize AJV with formats
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

/**
 * Validate data against JSON Schema (AJV)
 * @param data - Data to validate
 * @param schema - JSON Schema object
 * @returns Validation result with errors
 * @throws {Error} When schema compilation or validation fails
 * @example
 * const schema = {
 *   type: 'object',
 *   required: ['name', 'email'],
 *   properties: {
 *     name: { type: 'string', minLength: 1 },
 *     email: { type: 'string', format: 'email' }
 *   }
 * };
 * const result = validateJSON(userData, schema);
 */
export const validateJSON = (
  data: unknown,
  schema: Record<string, unknown>
): SchemaValidationResult => {
  try {
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      const errors = formatAJVErrors(validate.errors ?? []);
      logger.error('JSON Schema validation failed', errors);
      return { valid: false, errors };
    }

    logger.info('JSON Schema validation passed');
    return { valid: true, errors: [] };
  } catch (error) {
    logger.error('JSON Schema validation error', error);
    return {
      valid: false,
      errors: [{ message: (error as Error).message, path: '' }],
    };
  }
};

/**
 * Validate data against Joi schema
 * @param data - Data to validate
 * @param schema - Joi schema object
 * @returns Validation result with transformed value
 * @throws {Error} When schema validation fails
 * @example
 * const schema = Joi.object({
 *   name: Joi.string().min(1).required(),
 *   age: Joi.number().integer().min(0).max(120)
 * });
 * const result = validateJoi(userData, schema);
 */
export const validateJoi = (data: unknown, schema: Joi.Schema): SchemaValidationResult => {
  try {
    const result = schema.validate(data, { abortEarly: false });

    if (result.error) {
      const errors = formatJoiErrors(result.error.details);
      logger.error('Joi validation failed', errors);
      return { valid: false, errors, value: null };
    }

    logger.info('Joi validation passed');
    return { valid: true, errors: [], value: result.value };
  } catch (error) {
    logger.error('Joi validation error', error);
    return {
      valid: false,
      errors: [{ message: (error as Error).message, path: '' }],
      value: null,
    };
  }
};

/**
 * Format AJV validation errors into readable format
 * @param ajvErrors - AJV error array
 * @returns Formatted error objects
 * @example
 * const formatted = formatAJVErrors(validate.errors);
 * console.log(formatted[0].path, formatted[0].message);
 */
export const formatAJVErrors = (ajvErrors: ErrorObject[]): SchemaFormattedError[] => {
  if (!ajvErrors || ajvErrors.length === 0) {
    return [];
  }

  return ajvErrors.map(error => ({
    path: error.instancePath || (error as unknown as { dataPath?: string }).dataPath || '',
    message: error.message ?? '',
    keyword: error.keyword,
    params: error.params as Record<string, unknown>,
    schemaPath: error.schemaPath,
  }));
};

/**
 * Format Joi validation errors into readable format
 * @param joiDetails - Joi error details array
 * @returns Formatted error objects
 * @example
 * const formatted = formatJoiErrors(error.details);
 * console.log(formatted[0].path, formatted[0].message);
 */
export const formatJoiErrors = (joiDetails: ValidationErrorItem[]): SchemaFormattedError[] => {
  if (!joiDetails || joiDetails.length === 0) {
    return [];
  }

  return joiDetails.map(detail => ({
    path: detail.path.join('.'),
    message: detail.message,
    type: detail.type,
    context: detail.context as Record<string, unknown>,
  }));
};

/**
 * Create common JSON Schema templates
 * @param type - Schema type: 'user', 'product', 'order', 'apiResponse'
 * @returns JSON Schema object or null if type unknown
 * @example
 * const userSchema = createCommonSchema('user');
 * const result = validateJSON(userData, userSchema);
 */
export const createCommonSchema = (type: string): Record<string, unknown> | null => {
  const schemas: Record<string, Record<string, unknown>> = {
    user: {
      type: 'object',
      required: ['id', 'email'],
      properties: {
        id: { type: ['string', 'number'] },
        email: { type: 'string', format: 'email' },
        name: { type: 'string', minLength: 1 },
        age: { type: 'number', minimum: 0 },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
    product: {
      type: 'object',
      required: ['id', 'name', 'price'],
      properties: {
        id: { type: ['string', 'number'] },
        name: { type: 'string', minLength: 1 },
        price: { type: 'number', minimum: 0 },
        currency: { type: 'string', pattern: '^[A-Z]{3}$' },
        inStock: { type: 'boolean' },
      },
    },
    apiResponse: {
      type: 'object',
      required: ['status', 'data'],
      properties: {
        status: { type: 'string', enum: ['success', 'error'] },
        data: { type: ['object', 'array', 'null'] },
        message: { type: 'string' },
        errors: { type: 'array' },
      },
    },
  };

  return schemas[type] || null;
};

/**
 * Create common Joi Schema templates
 * @param type - Schema type: 'user', 'product', 'credentials'
 * @returns Joi Schema object or null if type unknown
 * @example
 * const userSchema = createCommonJoiSchema('user');
 * const result = validateJoi(userData, userSchema);
 */
export const createCommonJoiSchema = (type: string): Joi.Schema | null => {
  const schemas: Record<string, Joi.Schema> = {
    user: Joi.object({
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      email: Joi.string().email().required(),
      name: Joi.string().min(1).optional(),
      age: Joi.number().integer().min(0).max(150).optional(),
      createdAt: Joi.date().iso().optional(),
    }),
    product: Joi.object({
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      name: Joi.string().min(1).required(),
      price: Joi.number().positive().required(),
      currency: Joi.string().length(3).uppercase().optional(),
      inStock: Joi.boolean().optional(),
    }),
    credentials: Joi.object({
      username: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string().min(8).required(),
      email: Joi.string().email().optional(),
    }),
  };

  return schemas[type] || null;
};

/**
 * Validate URL format
 * @param url - URL string to validate
 * @returns True if valid URL format
 * @throws {TypeError} When URL constructor fails
 * @example
 * const isValid = validateURL('https://example.com');
 * console.log(isValid); // true
 */
export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    logger.info(`URL validation: ${url} - valid`);
    return true;
  } catch {
    logger.warn(`URL validation: ${url} - invalid`);
    return false;
  }
};

/**
 * Validate UUID format
 * @param uuid - UUID string to validate
 * @param version - UUID version: 'v4', 'v1', 'any' (default: 'v4')
 * @returns True if valid UUID format
 * @example
 * const isValid = validateUUID('550e8400-e29b-41d4-a716-446655440000');
 * console.log(isValid); // true
 */
export const validateUUID = (uuid: string, version = 'v4'): boolean => {
  const patterns: Record<string, RegExp> = {
    v1: /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    v4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    any: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  };

  const pattern = patterns[version] || patterns.any;
  const isValid = pattern.test(uuid);

  logger.info(`UUID validation (${version}): ${isValid ? 'valid' : 'invalid'}`);
  return isValid;
};

/**
 * Validate date format (ISO 8601)
 * @param dateString - Date string to validate
 * @returns True if valid ISO 8601 date format
 * @example
 * const isValid = validateDateISO('2024-01-15T10:30:00Z');
 * console.log(isValid); // true
 */
export const validateDateISO = (dateString: string): boolean => {
  const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

  if (!isoPattern.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  const isValid = !isNaN(date.getTime());

  logger.info(`Date validation: ${dateString} - ${isValid ? 'valid' : 'invalid'}`);
  return isValid;
};

/**
 * Batch validate multiple items against schema
 * @param items - Array of items to validate
 * @param schema - JSON Schema or Joi schema object
 * @param validatorType - Validator to use: 'json' or 'joi' (default: 'json')
 * @returns Validation statistics with error details
 * @example
 * const results = batchValidate(users, userSchema, 'json');
 * console.log(`${results.validCount} valid, ${results.invalidCount} invalid`);
 */
export const batchValidate = (
  items: unknown[],
  schema: Record<string, unknown> | Joi.Schema,
  validatorType = 'json'
): SchemaBatchValidationResult => {
  const results: SchemaBatchValidationResult = {
    validCount: 0,
    invalidCount: 0,
    errors: [],
  };

  items.forEach((item, index) => {
    let result: SchemaValidationResult;

    if (validatorType === 'joi') {
      result = validateJoi(item, schema as Joi.Schema);
    } else {
      result = validateJSON(item, schema as Record<string, unknown>);
    }

    if (result.valid) {
      results.validCount++;
    } else {
      results.invalidCount++;
      results.errors.push({
        index,
        item,
        errors: result.errors,
      });
    }
  });

  logger.info(`Batch validation: ${results.validCount} valid, ${results.invalidCount} invalid`);
  return results;
};
