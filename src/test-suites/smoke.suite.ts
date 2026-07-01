/**
 * @fileoverview Smoke test suite configuration.
 * Defines critical path tests that must pass before deployment.
 * @module test-suites/smoke.suite
 */

/**
 * Smoke Test Suite
 * Critical path tests that must pass before deployment
 * Fast execution, covers core functionality
 */
export type SmokeTestSuite = {
  /** Suite name */
  name: string;
  /** Suite description */
  description: string;
  /** Test tags for filtering */
  tags: string[];
  /** Maximum suite execution time in ms */
  timeout: number;
  /** Number of test retries on failure */
  retries: number;
  /** Playwright projects to run */
  projects: string[];
  /** Test file paths to include */
  tests: string[];
  /** Enable parallel execution */
  parallel: boolean;
  /** Number of parallel workers */
  workers: number;
};

/**
 * Smoke test configuration
 */
export const smokeTests: SmokeTestSuite = {
  name: 'Smoke Tests',
  description: 'Critical path tests for quick validation',
  tags: ['@smoke'],
  timeout: 300000, // 5 minutes
  retries: 0,
  projects: ['ui-chromium', 'api'],
  tests: [
    // Critical visual regression tests
    'src/tests/visual/dashboard-visual-comprehensive.spec.js',
  ],
  parallel: true,
  workers: 4,
};
