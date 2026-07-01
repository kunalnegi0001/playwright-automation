/**
 * @fileoverview Development environment configuration.
 * Optimized for local development with minimal retries and detailed debugging.
 * @module config/environments/development.config
 */

/**
 * Development Environment Configuration
 * Overrides base config for local development environment
 * Features: Non-headless mode, no retries, full tracing enabled
 * @example
 * import devConfig from './development.config';
 */
export const developmentConfig = {
  baseURL: 'http://localhost:3000',
  apiBaseURL: 'http://localhost:4000/api',
  graphqlEndpoint: 'http://localhost:4000/graphql',

  browserHeadless: false,

  features: {
    visualTesting: true,
    accessibilityTesting: true,
    performanceTesting: true,
    apiMocking: true,
    videoRecording: false,
    screenshotOnFailure: true,
    tracing: true,
    auditLogging: false,
  },

  parallelWorkers: 2,
  maxTestRetries: 0, // No retries in development for faster feedback

  database: {
    postgres: {
      host: 'localhost',
      port: 5432,
      database: 'test_db_dev',
      user: 'dev_user',
      password: 'dev_password',
    },
  },
};
