/**
 * Sanity Test Suite
 * Quick validation of basic functionality
 * Runs after builds, before deployment
 */

export const sanityTests = {
  name: 'Sanity Tests',
  description: 'Basic functionality validation',
  tags: ['@sanity'],
  timeout: 600000, // 10 minutes
  retries: 1,
  projects: ['ui-chromium', 'api'],
  tests: [
    // Technical validation tests
    'src/tests/visual/**/*.spec.js',
    'src/tests/performance/**/*.spec.js',
  ],
  parallel: true,
  workers: 4,
};
