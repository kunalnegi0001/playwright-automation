/**
 * @fileoverview Staging environment configuration.
 * Pre-production testing with full feature enablement and video recording.
 * @module config/environments/staging.config
 */

/**
 * Staging Environment Configuration
 * Mirrors production setup with enhanced debugging features
 * Features: Visual testing, performance testing, video recording
 * @example
 * import stagingConfig from './staging.config';
 */
export const stagingConfig = {
  baseURL: 'https://staging.example.com',
  apiBaseURL: 'https://api-staging.example.com',
  graphqlEndpoint: 'https://api-staging.example.com/graphql',

  features: {
    visualTesting: true,
    accessibilityTesting: true,
    performanceTesting: true,
    videoRecording: true,
    screenshotOnFailure: true,
    tracing: true,
  },

  parallelWorkers: 4,
  maxTestRetries: 2,
};
