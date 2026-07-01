/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
/**
 * @fileoverview Environment variable validator
 * Validates required environment variables and their formats at startup
 * @module config/env.validator
 */

import Joi from 'joi';
import { logger } from '@utils/core';

/**
 * Validation schema for environment variables
 * Defines required and optional environment variables with their constraints
 */
const envSchema = Joi.object({
  // ==================== Application Environment ====================
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production', 'test')
    .default('development')
    .description('Application environment'),

  // ==================== Base URLs ====================
  BASE_URL: Joi.string().uri().required().description('Base URL for the application under test'),

  API_BASE_URL: Joi.string().uri().optional().description('Base URL for API endpoints'),

  // ==================== Timeouts ====================
  DEFAULT_TIMEOUT: Joi.number()
    .integer()
    .min(1000)
    .max(300000)
    .default(30000)
    .description('Default timeout in milliseconds'),

  NAVIGATION_TIMEOUT: Joi.number()
    .integer()
    .min(1000)
    .max(300000)
    .default(30000)
    .description('Navigation timeout in milliseconds'),

  ACTION_TIMEOUT: Joi.number()
    .integer()
    .min(1000)
    .max(60000)
    .default(10000)
    .description('Action timeout in milliseconds'),

  // ==================== Authentication ====================
  TEST_USERNAME: Joi.string().optional().description('Test user username'),

  TEST_PASSWORD: Joi.string().optional().description('Test user password'),

  ADMIN_USERNAME: Joi.string().optional().description('Admin user username'),

  ADMIN_PASSWORD: Joi.string().optional().description('Admin user password'),

  // ==================== API Keys & Secrets ====================
  API_KEY: Joi.string().optional().description('API key for external services'),

  ENCRYPTION_KEY: Joi.string()
    .optional()
    .min(32)
    .description('Encryption key (minimum 32 characters)'),

  // ==================== Database Configuration ====================
  DB_HOST: Joi.string().optional().description('Database host'),

  DB_PORT: Joi.number().integer().min(1).max(65535).optional().description('Database port'),

  DB_NAME: Joi.string().optional().description('Database name'),

  DB_USER: Joi.string().optional().description('Database user'),

  DB_PASSWORD: Joi.string().optional().description('Database password'),

  // ==================== CI/CD ====================
  CI: Joi.boolean().optional().description('Running in CI environment'),

  CI_PROVIDER: Joi.string()
    .valid('github', 'azure-devops', 'ado', 'local', 'other')
    .optional()
    .description('CI platform identifier'),

  GITHUB_ACTIONS: Joi.boolean().optional().description('Running in GitHub Actions'),

  TF_BUILD: Joi.boolean().optional().description('Running in Azure DevOps Pipelines'),

  SYSTEM_COLLECTIONURI: Joi.string()
    .uri()
    .optional()
    .description('Azure DevOps organization collection URI'),

  SYSTEM_TEAMPROJECT: Joi.string().optional().description('Azure DevOps team project name'),

  BUILD_BUILDID: Joi.string().optional().description('Azure DevOps build identifier'),

  BUILD_SOURCEBRANCH: Joi.string().optional().description('Source branch for the current CI run'),

  BUILD_REASON: Joi.string().optional().description('Reason the current pipeline run was triggered'),

  PROJECT_PROFILE: Joi.string()
    .valid('core', 'example', 'examples', 'client')
    .optional()
    .description('Framework project profile'),

  INCLUDE_EXAMPLES: Joi.boolean().optional().description('Include bundled example suites'),

  UI_BDD_FEATURES_GLOB: Joi.string().optional().description('Comma-separated UI feature globs'),

  UI_BDD_STEPS_GLOBS: Joi.string().optional().description('Comma-separated UI step globs'),

  API_BDD_FEATURES_GLOB: Joi.string().optional().description('Comma-separated API feature globs'),

  API_BDD_STEPS_GLOBS: Joi.string().optional().description('Comma-separated API step globs'),

  AZURE_KEY_VAULT_URL: Joi.string().uri().optional().description('Azure Key Vault URL'),

  AZURE_TENANT_ID: Joi.string().optional().description('Azure AD tenant identifier'),

  AZURE_CLIENT_ID: Joi.string().optional().description('Azure AD client identifier'),

  AZURE_CLIENT_SECRET: Joi.string().optional().description('Azure AD client secret'),

  // ==================== Reporting ====================
  ENABLE_ALLURE: Joi.boolean().default(true).description('Enable Allure reporting'),

  ENABLE_VIDEO: Joi.boolean().default(false).description('Enable video recording'),

  ENABLE_TRACE: Joi.boolean().default(false).description('Enable trace recording'),

  // ==================== Misc ====================
  HEADLESS: Joi.boolean().default(true).description('Run tests in headless mode'),

  WORKERS: Joi.number()
    .integer()
    .min(1)
    .max(32)
    .optional()
    .description('Number of parallel workers'),

  RETRY_COUNT: Joi.number()
    .integer()
    .min(0)
    .max(5)
    .default(0)
    .description('Number of test retries'),
}).unknown(true); // Allow additional environment variables

/**
 * Validation result type
 */
export type EnvValidationResult = {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation errors if any */
  errors: string[];
  /** Validated and sanitized environment variables */
  env: Record<string, unknown>;
};

/**
 * Validates environment variables against the schema
 * @returns {EnvValidationResult} Validation result with errors and validated values
 * @throws {Error} If validation fails in strict mode
 * @example
 * const result = validateEnv();
 * if (!result.isValid) {
 *   console.error('Environment validation failed:', result.errors);
 * }
 */
export const validateEnv = (): EnvValidationResult => {
  logger.info('Validating environment variables');

  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false, // Collect all errors
    stripUnknown: false, // Keep unknown variables
    convert: true, // Convert types (e.g., string "true" to boolean)
  });

  if (error) {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const errors = error.details.map(detail => {
      return `${detail.path.join('.')}: ${detail.message}`;
    });
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    logger.error('Environment validation failed', {
      errors,
      details: error.details,
    });

    return {
      isValid: false,
      errors,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      env: value || {},
    };
  }

  logger.info('Environment validation passed', {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    environment: value.NODE_ENV,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    baseUrl: value.BASE_URL,
  });

  return {
    isValid: true,
    errors: [],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    env: value,
  };
};

/**
 * Validates environment variables and throws if validation fails
 * Use this for critical validation that should halt execution
 * @throws {Error} If validation fails
 * @example
 * // At application startup:
 * validateEnvOrThrow();
 */
export const validateEnvOrThrow = (): void => {
  const result = validateEnv();

  if (!result.isValid) {
    const errorMessage = `Environment validation failed:\n${result.errors.join('\n')}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Gets a validated environment variable value
 * @param {string} key - Environment variable key
 * @param {T} defaultValue - Default value if not found
 * @returns {T} Environment variable value or default
 * @example
 * const timeout = getEnvVar('DEFAULT_TIMEOUT', 30000);
 * const apiUrl = getEnvVar('API_BASE_URL', 'https://api.example.com');
 */
export const getEnvVar = <T = string>(key: string, defaultValue?: T): T => {
  const result = validateEnv();
  const value = result.env[key];

  if (value !== undefined && value !== null) {
    return value as T;
  }

  if (defaultValue !== undefined) {
    return defaultValue;
  }

  logger.warn(`Environment variable ${key} not found and no default provided`);
  return undefined as unknown as T;
};

/**
 * Checks if required environment variables are set
 * @param {string[]} requiredVars - List of required variable names
 * @returns {boolean} True if all required variables are set
 * @example
 * if (!hasRequiredEnvVars(['BASE_URL', 'API_KEY'])) {
 *   throw new Error('Missing required environment variables');
 * }
 */
export const hasRequiredEnvVars = (requiredVars: string[]): boolean => {
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    logger.error('Missing required environment variables', { missing });
    return false;
  }

  return true;
};
