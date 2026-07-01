/**
 * @fileoverview Shared Playwright runtime configuration.
 * Centralizes environment-backed execution and reporting settings.
 * @module config/playwright-runtime.config
 */

import type { ReporterDescription } from '@playwright/test';
import { env } from './env.config';

/**
 * Converts an environment value to a positive integer fallback.
 * @param value - Raw environment value.
 * @param fallback - Value used when input is invalid.
 * @returns Parsed positive integer.
 */
export const toPositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

/**
 * Shared Playwright runtime values.
 */
export const playwrightRuntime = {
  isCI: env.ci.isCI,
  workers: toPositiveInt(process.env.PARALLEL_WORKERS, env.ci.workers),
  retries: toPositiveInt(process.env.MAX_TEST_RETRIES, env.retry.maxTestRetries),
  failOnFlakyTests: process.env.FAIL_ON_FLAKY_TESTS === 'true',
  timeout: toPositiveInt(process.env.DEFAULT_TIMEOUT, env.timeouts.default),
  actionTimeout: toPositiveInt(process.env.ACTION_TIMEOUT, env.timeouts.action),
  navigationTimeout: toPositiveInt(process.env.NAVIGATION_TIMEOUT, env.timeouts.navigation),
  headless: process.env.BROWSER_HEADLESS !== 'false',
  trace: (process.env.PW_TRACE || (env.ci.isCI ? 'retain-on-failure' : 'on-first-retry')) as
    | 'on'
    | 'off'
    | 'retain-on-failure'
    | 'on-first-retry',
  screenshot: (process.env.PW_SCREENSHOT || 'only-on-failure') as
    | 'on'
    | 'off'
    | 'only-on-failure',
  video: (process.env.PW_VIDEO || (env.ci.isCI ? 'retain-on-failure' : 'off')) as
    | 'on'
    | 'off'
    | 'retain-on-failure'
    | 'on-first-retry',
  baseURL: process.env.BASE_URL || env.baseUrl,
  apiBaseURL: process.env.API_BASE_URL || env.apiBaseUrl,
  locale: 'en-US',
  timezoneId: 'America/New_York',
} as const;

/**
 * Builds reporter configuration list from environment toggles.
 * @returns Playwright reporter configuration.
 */
export const createReporters = (): ReporterDescription[] => {
  const reporters: ReporterDescription[] = [];

  const enableHtml = process.env.PW_REPORTER_HTML !== 'false';
  const enableJson = process.env.PW_REPORTER_JSON !== 'false';
  const enableJunit = process.env.PW_REPORTER_JUNIT !== 'false';
  const enableAllure = process.env.PW_REPORTER_ALLURE !== 'false';
  const enableList = process.env.PW_REPORTER_LIST !== 'false';
  const enableBlob = process.env.PW_REPORTER_BLOB === 'true' || playwrightRuntime.isCI;

  if (enableHtml) {
    reporters.push(['html', { outputFolder: 'playwright-report', open: 'never' }]);
  }
  if (enableJson) {
    reporters.push(['json', { outputFile: 'test-results/results.json' }]);
  }
  if (enableJunit) {
    reporters.push(['junit', { outputFile: 'test-results/junit.xml' }]);
  }
  if (enableAllure) {
    reporters.push(['allure-playwright', { outputFolder: env.reporting.allureResultsDir }]);
  }
  if (enableBlob) {
    reporters.push(['blob', { outputDir: 'test-results/blob-report' }]);
  }
  if (enableList) {
    reporters.push(['list', { printSteps: true }]);
  }

  return reporters;
};
