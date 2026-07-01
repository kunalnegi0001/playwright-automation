/**
 * @fileoverview Base configuration for the test framework.
 * Defines environment variables, timeouts, feature flags, and validation schemas.
 * @module config/base.config
 */

import dotenv from 'dotenv';
import Joi from 'joi';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

/**
 * Base Configuration Schema
 * Validates all configuration values using Joi
 * Ensures type safety and provides defaults for optional values
 */
const configSchema = Joi.object({
  env: Joi.string().valid('development', 'staging', 'production', 'qa').default('development'),

  // Application URLs
  baseURL: Joi.string().uri().required(),
  apiBaseURL: Joi.string().uri().required(),

  // Timeouts
  defaultTimeout: Joi.number().integer().min(5000).max(120000).default(30000),
  navigationTimeout: Joi.number().integer().min(5000).max(120000).default(30000),
  actionTimeout: Joi.number().integer().min(1000).max(60000).default(10000),

  // Execution
  parallelWorkers: Joi.number().integer().min(1).max(20).default(4),
  maxTestRetries: Joi.number().integer().min(0).max(5).default(2),
  flakyTestRetries: Joi.number().integer().min(0).max(10).default(3),

  // Browser
  browserHeadless: Joi.boolean().default(true),

  // Feature Flags
  features: Joi.object({
    apiMocking: Joi.boolean().default(false),
    videoRecording: Joi.boolean().default(false),
    screenshotOnFailure: Joi.boolean().default(true),
    tracing: Joi.boolean().default(false),
    auditLogging: Joi.boolean().default(true),
  }).default(),

  // Reporting
  reporting: Joi.object({
    allureResultsDir: Joi.string().default('allure-results'),
    allureReportDir: Joi.string().default('allure-report'),
  }).default(),

  // Compliance
  compliance: Joi.object({
    artifactRetentionDays: Joi.number().integer().min(1).max(365).default(90),
    auditLogPath: Joi.string().default('logs/audit.log'),
  }).default(),
}).unknown(true);

/**
 * Base Configuration Object
 */
const baseConfig = {
  env: process.env.NODE_ENV || 'development',

  // URLs
  baseURL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php',
  apiBaseURL: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',

  // Timeouts
  defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000') || 30000,
  navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT || '30000') || 30000,
  actionTimeout: parseInt(process.env.ACTION_TIMEOUT || '10000') || 10000,

  // Execution
  parallelWorkers: parseInt(process.env.PARALLEL_WORKERS || '4') || 4,
  maxTestRetries: parseInt(process.env.MAX_TEST_RETRIES || '0') || 0,
  flakyTestRetries: parseInt(process.env.FLAKY_TEST_RETRIES || '3') || 3,

  // Browser
  browserHeadless: process.env.BROWSER_HEADLESS !== 'false',

  // Feature Flags
  features: {
    apiMocking: process.env.ENABLE_API_MOCKING === 'true',
    videoRecording: process.env.ENABLE_VIDEO_RECORDING === 'true',
    screenshotOnFailure: process.env.ENABLE_SCREENSHOT_ON_FAILURE !== 'false',
    tracing: process.env.ENABLE_TRACING === 'true',
    auditLogging: process.env.ENABLE_AUDIT_LOGGING !== 'false',
  },

  // Reporting
  reporting: {
    allureResultsDir: process.env.ALLURE_RESULTS_DIR || 'allure-results',
    allureReportDir: process.env.ALLURE_REPORT_DIR || 'allure-report',
  },

  // Compliance
  compliance: {
    artifactRetentionDays: parseInt(process.env.ARTIFACT_RETENTION_DAYS || '90') || 90,
    auditLogPath: process.env.AUDIT_LOG_PATH || 'logs/audit.log',
  },

  // Authentication (loaded but not validated here for security)
  auth: {
    okta: {
      domain: process.env.OKTA_DOMAIN,
      clientId: process.env.OKTA_CLIENT_ID,
      clientSecret: process.env.OKTA_CLIENT_SECRET,
      redirectUri: process.env.OKTA_REDIRECT_URI,
    },
    auth0: {
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      audience: process.env.AUTH0_AUDIENCE,
    },
    azure: {
      tenantId: process.env.AZURE_TENANT_ID,
      clientId: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
    },
  },

  // Test Users
  testUsers: {
    admin: {
      username: process.env.TEST_USER_ADMIN_USERNAME || process.env.TEST_USER_ADMIN_EMAIL,
      email: process.env.TEST_USER_ADMIN_EMAIL,
      password: process.env.TEST_USER_ADMIN_PASSWORD,
    },
    standard: {
      username: process.env.TEST_USER_STANDARD_USERNAME || process.env.TEST_USER_STANDARD_EMAIL,
      email: process.env.TEST_USER_STANDARD_EMAIL,
      password: process.env.TEST_USER_STANDARD_PASSWORD,
    },
  },

  // Database
  database: {
    postgres: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432') || 5432,
      database: process.env.DB_NAME || 'test_db',
      user: process.env.DB_USER || 'test_user',
      password: process.env.DB_PASSWORD || '',
    },
    mysql: {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306') || 3306,
      database: process.env.MYSQL_DATABASE || 'test_db',
      user: process.env.MYSQL_USER || 'test_user',
      password: process.env.MYSQL_PASSWORD || '',
    },
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/test_db',
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379') || 6379,
      password: process.env.REDIS_PASSWORD || '',
    },
  },

  // Cloud Storage
  cloud: {
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
      s3Bucket: process.env.AWS_S3_BUCKET,
    },
    azure: {
      connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
      container: process.env.AZURE_STORAGE_CONTAINER,
    },
  },

  // Security
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY,
    mfaSecret: process.env.MFA_SECRET,
  },
};

/**
 * Validate configuration object against schema
 * @param config - Configuration object to validate
 * @returns Validated configuration object
 * @throws {Error} If validation fails with detailed error messages
 * @example
 * const validated = validateConfig(myConfig);
 */
export const validateConfig = (config: Record<string, unknown>): Record<string, unknown> => {
  const { error, value } = configSchema.validate(config, {
    abortEarly: false,
    allowUnknown: true,
  }) as { error?: { details: Array<{ message: string }> }; value: Record<string, unknown> };

  if (error) {
    const errors = (error.details as Array<{ message: string }>)
      .map(detail => detail.message)
      .join(', ');
    throw new Error(`Configuration validation failed: ${errors}`);
  }

  return value as Record<string, unknown>;
};

/**
 * Load environment-specific configuration file
 * Attempts to load config from environments/ directory based on NODE_ENV
 * @returns Promise resolving to environment config object or empty object if not found
 * @example
 * const envConfig = await loadEnvironmentConfig();
 */
export const loadEnvironmentConfig = async (): Promise<Record<string, unknown>> => {
  const env = process.env.NODE_ENV || 'development';
  const envConfigPath = path.join(__dirname, 'environments', `${env}.config.js`);

  try {
    const envConfig = (await import(envConfigPath)) as { default?: Record<string, unknown> };
    return (envConfig.default || envConfig) as Record<string, unknown>;
  } catch {
    // Environment config is optional
    console.log(`No environment config found for ${env}, using base config`);
    return {};
  }
};

/**
 * Merge multiple configuration objects with priority from left to right
 * Later configs override earlier ones. Uses deep merge for nested objects.
 * @param configs - Variable number of configuration objects to merge
 * @returns Merged configuration object
 * @example
 * const merged = mergeConfigs(baseConfig, envConfig, projectConfig);
 */
export const mergeConfigs = (...configs: Record<string, unknown>[]): Record<string, unknown> => {
  return configs.reduce((merged, config) => {
    return deepMerge(merged, config);
  }, {});
};

/**
 * Deep merge two objects recursively
 * @param target - Target object
 * @param source - Source object to merge into target
 * @returns Merged object
 * @example
 * const merged = deepMerge({ a: 1 }, { b: 2 });
 */
export const deepMerge = (
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> => {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(
            target[key] as Record<string, unknown>,
            source[key] as Record<string, unknown>
          );
        }
      } else {
        output[key] = source[key];
      }
    });
  }

  return output;
};

/**
 * Check if value is a plain object (not null, not array)
 * @param item - Value to check
 * @returns True if item is a plain object, false otherwise
 * @example
 * isObject({}) // true
 * isObject([]) // false
 * isObject(null) // false
 */
export const isObject = (item: unknown): item is Record<string, unknown> => {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
};

// Validate and export config
const validatedConfig = validateConfig(baseConfig);

export { validatedConfig };
