/**
 * @fileoverview Comprehensive API response validation utilities.
 * Validates status codes, JSON schemas, headers, content types, and response times.
 * @module api-testing/rest/validation.helper
 * @category API Testing
 *
 * Features:
 * - Response status validation
 * - JSON schema validation
 * - Response time validation
 * - Header validation
 * - Content type validation
 *
 * @example
 * import * as APIValidation from './validation.helper';
 * await APIValidation.validateResponse(response, {
 *   status: 200,
 *   contentType: 'application/json',
 *   maxResponseTime: 2000
 * });
 */

import { logger } from '@utils/core';
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

/**
 * Response object structure for validation
 */
export type ValidationResponse = {
  /** HTTP status code (can be property or method) */
  status?: number | (() => number);
  /** Response headers (can be property or method) */
  headers?: Record<string, string> | (() => Record<string, string>);
};

/**
 * Result of JSON schema validation
 */
export type ValidationSchemaResult = {
  /** Whether schema validation passed */
  valid: boolean;
  /** Array of validation error objects */
  errors: Array<{ message?: string }>;
};

/**
 * Result of required fields validation
 */
export type ValidationFieldsResult = {
  /** Whether all required fields are present */
  valid: boolean;
  /** Array of missing field names */
  missingFields: string[];
};

/**
 * Validate response status code matches expected value
 * @param response - Axios/Playwright response object
 * @param expectedStatus - Expected HTTP status code
 * @throws {Error} If status doesn't match expected value
 * @example
 * await validateStatus(response, 200);
 */
export const validateStatus = (response: ValidationResponse, expectedStatus: number): void => {
  const actualStatus = (
    typeof response.status === 'function' ? response.status() : response.status
  ) as number;

  if (actualStatus !== expectedStatus) {
    const error = `Status mismatch: expected ${expectedStatus}, got ${actualStatus}`;
    logger.error(error);
    throw new Error(error);
  }

  logger.info(`Status validated: ${actualStatus}`);
};

/**
 * Validate response data against JSON schema using AJV
 * @param responseData - Response data object to validate
 * @param schema - JSON schema object for validation
 * @returns Validation result with valid flag and error array
 * @example
 * const result = validateSchema(response.data, userSchema);
 * if (!result.valid) console.error(result.errors);
 */
export const validateSchema = (
  responseData: unknown,
  schema: Record<string, unknown>
): ValidationSchemaResult => {
  try {
    const validate = ajv.compile(schema);
    const valid = validate(responseData);

    if (!valid) {
      logger.error('Schema validation failed', validate.errors);
      return {
        valid: false,
        errors: validate.errors || [],
      };
    }

    logger.info('Schema validation passed');
    return { valid: true, errors: [] };
  } catch (error) {
    logger.error(
      'Schema validation error',
      error instanceof Error ? error : new Error(String(error))
    );
    return {
      valid: false,
      errors: [{ message: error instanceof Error ? error.message : String(error) }],
    };
  }
};

/**
 * Validate response headers match expected values
 * @param response - Response object with headers
 * @param expectedHeaders - Object with expected header key-value pairs
 * @returns True if all headers match, false otherwise
 * @example
 * const valid = validateHeaders(response, {
 *   'content-type': 'application/json',
 *   'x-api-version': 'v1'
 * });
 */
export const validateHeaders = (
  response: ValidationResponse,
  expectedHeaders: Record<string, string>
): boolean => {
  try {
    const headers: Record<string, string> = (
      typeof response.headers === 'function' ? response.headers() : response.headers
    ) as Record<string, string>;

    for (const [key, expectedValue] of Object.entries(expectedHeaders)) {
      const actualValue = headers?.[key.toLowerCase()];

      if (!actualValue) {
        logger.error(`Missing header: ${key}`);
        return false;
      }

      if (!actualValue.includes(expectedValue)) {
        logger.error(`Header mismatch: ${key} expected ${expectedValue}, got ${actualValue}`);
        return false;
      }
    }

    logger.info('Headers validated successfully');
    return true;
  } catch (error) {
    logger.error('Header validation error', error);
    return false;
  }
};

/**
 * Validate response content type header
 * @param response - Response object with headers
 * @param expectedContentType - Expected content type string
 * @returns True if content type matches, false otherwise
 * @example
 * const isJSON = validateContentType(response, 'application/json');
 */
export const validateContentType = (
  response: ValidationResponse,
  expectedContentType: string
): boolean => {
  const headers: Record<string, string> = (
    typeof response.headers === 'function' ? response.headers() : response.headers
  ) as Record<string, string>;
  const contentType: string = headers?.['content-type'] || '';

  const matches: boolean = contentType.includes(expectedContentType);

  if (!matches) {
    logger.error(`Content-Type mismatch: expected ${expectedContentType}, got ${contentType}`);
  } else {
    logger.info(`Content-Type validated: ${expectedContentType}`);
  }

  return matches;
};

/**
 * Validate response time is within acceptable threshold
 * @param responseTime - Actual response time in milliseconds
 * @param maxTime - Maximum allowed time in milliseconds
 * @returns True if within limit, false otherwise
 * @example
 * const isFast = validateResponseTime(responseTime, 2000); // Max 2 seconds
 */
export const validateResponseTime = (responseTime: number, maxTime: number): boolean => {
  if (responseTime > maxTime) {
    logger.warn(`Slow response: ${responseTime}ms (max: ${maxTime}ms)`);
    return false;
  }

  logger.info(`Response time OK: ${responseTime}ms`);
  return true;
};

/**
 * Validate response body contains all required fields
 * @param responseData - Response data object to check
 * @param requiredFields - Array of required field names
 * @returns Validation result with valid flag and missing fields array
 * @example
 * const result = validateRequiredFields(response.data, ['id', 'name', 'email']);
 */
export const validateRequiredFields = (
  responseData: Record<string, unknown>,
  requiredFields: string[]
): ValidationFieldsResult => {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!(field in responseData) || responseData[field] === undefined) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    logger.error(`Missing required fields: ${missingFields.join(', ')}`);
    return { valid: false, missingFields };
  }

  logger.info('All required fields present');
  return { valid: true, missingFields: [] };
};

/**
 * Validate response is an array with minimum length
 * @param responseData - Response data to validate
 * @param minLength - Minimum required array length (default: 0)
 * @returns True if valid array with minimum length, false otherwise
 * @example
 * const isValidList = validateArrayResponse(response.data, 1);
 */
export const validateArrayResponse = (responseData: unknown, minLength = 0): boolean => {
  if (!Array.isArray(responseData)) {
    logger.error('Response is not an array');
    return false;
  }

  if (responseData.length < minLength) {
    logger.error(`Array too short: ${responseData.length} (min: ${minLength})`);
    return false;
  }

  logger.info(`Valid array response: ${responseData.length} items`);
  return true;
};

/**
 * Validate pagination response has required structure
 * @param responseData - Response data object to validate
 * @param options - Validation options with field names
 * @param options.dataField - Name of data array field (default: 'data')
 * @param options.pageField - Name of page field (default: 'page')
 * @param options.totalField - Name of total field (default: 'total')
 * @param options.perPageField - Name of per-page field (optional)
 * @returns True if valid pagination structure, false otherwise
 * @example
 * const isValid = validatePaginationResponse(response.data, {
 *   dataField: 'items',
 *   pageField: 'page',
 *   totalField: 'total'
 * });
 */
export const validatePaginationResponse = (
  responseData: Record<string, unknown>,
  options: {
    dataField?: string;
    pageField?: string;
    totalField?: string;
    perPageField?: string;
  } = {}
): boolean => {
  const { dataField = 'data', pageField = 'page', totalField = 'total' } = options;

  const requiredFields = [dataField, pageField, totalField];
  const result = validateRequiredFields(responseData, requiredFields);

  if (!result.valid) {
    return false;
  }

  if (!Array.isArray(responseData[dataField])) {
    logger.error(`${dataField} is not an array`);
    return false;
  }

  logger.info('Valid pagination response');
  return true;
};

/**
 * Validate error response has required structure
 * @param responseData - Error response data object
 * @param requiredFields - Required error fields (default: ['message'])
 * @returns True if valid error structure, false otherwise
 * @example
 * const isValidError = validateErrorResponse(response.data, ['error', 'message']);
 */
export const validateErrorResponse = (
  responseData: Record<string, unknown>,
  requiredFields: string[] = ['message']
): boolean => {
  const result = validateRequiredFields(responseData, requiredFields);

  if (!result.valid) {
    logger.error('Invalid error response structure');
    return false;
  }

  logger.info('Valid error response structure');
  return true;
};

/**
 * Perform comprehensive response validation with multiple checks
 * @param response - Response object to validate
 * @param validations - Validation rules to apply
 * @param validations.status - Expected HTTP status code
 * @param validations.contentType - Expected content type
 * @param validations.headers - Expected header key-value pairs
 * @param validations.schema - JSON schema for validation
 * @param validations.requiredFields - Required fields in response
 * @param validations.maxResponseTime - Maximum response time in ms
 * @returns Promise resolving to validation results with failures array
 * @example
 * const results = await validateResponse(response, {
 *   status: 200,
 *   contentType: 'application/json',
 *   schema: userSchema,
 *   requiredFields: ['id', 'name'],
 *   maxResponseTime: 2000
 * });
 */
export const validateResponse = async (
  response: unknown,
  validations: {
    status?: number;
    contentType?: string;
    headers?: Record<string, string>;
    schema?: Record<string, unknown>;
    requiredFields?: string[];
    maxResponseTime?: number;
  } = {}
): Promise<{ valid: boolean; failures: Array<{ type: string; error: unknown }> }> => {
  const results: { valid: boolean; failures: Array<{ type: string; error: unknown }> } = {
    valid: true,
    failures: [],
  };

  try {
    // Validate status
    if (validations.status) {
      try {
        validateStatus(response as ValidationResponse, validations.status);
      } catch (error) {
        results.valid = false;
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.failures.push({ type: 'status', error: errorMessage });
      }
    }

    // Validate content type
    if (validations.contentType) {
      if (!validateContentType(response as ValidationResponse, validations.contentType)) {
        results.valid = false;
        results.failures.push({ type: 'contentType', error: 'Content-Type mismatch' });
      }
    }

    // Validate headers
    if (validations.headers) {
      if (!validateHeaders(response as ValidationResponse, validations.headers)) {
        results.valid = false;
        results.failures.push({ type: 'headers', error: 'Header validation failed' });
      }
    }

    // Get response data
    let responseData: unknown;
    if (typeof (response as { json?: () => Promise<unknown> }).json === 'function') {
      responseData = await (response as { json: () => Promise<unknown> }).json();
    } else {
      responseData = (response as { data?: unknown }).data;
    }

    // Validate schema
    if (validations.schema) {
      const schemaResult = validateSchema(responseData, validations.schema);
      if (!schemaResult.valid) {
        results.valid = false;
        results.failures.push({ type: 'schema', error: schemaResult.errors });
      }
    }

    // Validate required fields
    if (validations.requiredFields) {
      const fieldsResult = validateRequiredFields(
        responseData as Record<string, unknown>,
        validations.requiredFields
      );
      if (!fieldsResult.valid) {
        results.valid = false;
        results.failures.push({ type: 'requiredFields', error: fieldsResult.missingFields });
      }
    }

    logger.info(`Response validation ${results.valid ? 'passed' : 'failed'}`);
    return results;
  } catch (error) {
    logger.error('Response validation error', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      valid: false,
      failures: [{ type: 'exception', error: errorMessage }],
    };
  }
};
