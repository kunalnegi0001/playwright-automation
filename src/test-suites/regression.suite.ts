/**
 * Regression Test Suite
 * Comprehensive tests covering all features
 * Longer execution time, full coverage
 */

export const regressionTests = {
  name: 'Regression Tests',
  description: 'Full test coverage across all features',
  tags: ['@regression'],
  timeout: 1800000, // 30 minutes
  retries: 0,
  projects: ['ui-chromium', 'ui-firefox', 'api', 'graphql'],
  tests: [
    // Technical validation tests (non-BDD)
    'src/tests/visual/**/*.spec.js',
    'src/tests/performance/**/*.spec.js',
    'src/tests/accessibility/**/*.spec.js',
  ],
  parallel: true,
  workers: 8,
};
