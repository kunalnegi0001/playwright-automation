/**
 * @fileoverview Production environment configuration.
 * Read-only tests with strict compliance and audit logging.
 * @module config/environments/production.config
 */

/**
 * Production Environment Configuration
 * Optimized for production testing with retries and compliance
 * Features: Read-only tests, artifact retention, audit logging
 * @example
 * import prodConfig from './production.config';
 */
export const productionConfig = {
  baseURL: 'https://example.com',
  apiBaseURL: 'https://jsonplaceholder.typicode.com',
  graphqlEndpoint: 'https://jsonplaceholder.typicode.com/graphql',

  features: {
    visualTesting: false,
    accessibilityTesting: true,
    performanceTesting: true,
    videoRecording: false,
    screenshotOnFailure: true,
    tracing: false,
  },

  parallelWorkers: 6,
  maxTestRetries: 3,

  // Production compliance requirements
  compliance: {
    artifactRetentionDays: 180,
    auditLogging: true,
  },
};
