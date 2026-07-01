import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { env } from './src/resources/config/env.config';
import { createReporters, playwrightRuntime } from './src/resources/config/playwright-runtime.config';

const createBddOutputDir = (projectName: string): string => {
  const suffix = playwrightRuntime.includeExamples ? 'examples' : 'core';
  return `.features-gen/${projectName}-${suffix}`;
};

// Report toggles
const ENABLE_UI = process.env.ENABLE_UI_PROJECT !== 'false';
const ENABLE_API = process.env.ENABLE_API_PROJECT !== 'false';
const ENABLE_GRAPHQL = process.env.ENABLE_GRAPHQL_PROJECT !== 'false';
const ENABLE_VISUAL = process.env.ENABLE_VISUAL_PROJECT !== 'false';
const ENABLE_A11Y = process.env.ENABLE_A11Y_PROJECT !== 'false';
const ENABLE_PERF = process.env.ENABLE_PERFORMANCE_PROJECT !== 'false';
const ENABLE_SMOKE = process.env.ENABLE_SMOKE_PROJECT !== 'false';
const ENABLE_BDD = process.env.ENABLE_BDD_PROJECT !== 'false';

const bddTestDir = defineBddConfig({
  features: env.bdd.ui.features,
  steps: env.bdd.ui.steps,
  outputDir: createBddOutputDir('ui'),
});

const apiBddTestDir = defineBddConfig({
  features: env.bdd.api.features,
  steps: env.bdd.api.steps,
  outputDir: createBddOutputDir('api'),
});

// Shared browser settings
const sharedUse = {
  baseURL: playwrightRuntime.baseURL,
  headless: playwrightRuntime.headless,
  trace: playwrightRuntime.trace,
  screenshot: playwrightRuntime.screenshot,
  video: playwrightRuntime.video,
  locale: playwrightRuntime.locale,
  timezoneId: playwrightRuntime.timezoneId,
  navigationTimeout: playwrightRuntime.navigationTimeout,
  actionTimeout: playwrightRuntime.actionTimeout,
  extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
};

const projects = [
  // Auth setup project - runs first to create .auth/user.json
  {
    name: 'setup',
    testMatch: '**/auth.setup.ts',
    use: { ...devices['Desktop Chrome'] },
  },

  ENABLE_UI && {
    name: 'UI Automation',
    testMatch: /src\/tests\/UI\/.*\.spec\.ts/,
    grep: /@ui/,
    use: { ...sharedUse, ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    dependencies: ['setup'],
  },

  ENABLE_API && {
    name: 'API Testing',
    testMatch: /src\/tests\/API\/.*\.spec\.ts/,
    use: {
      baseURL: playwrightRuntime.apiBaseURL,
      extraHTTPHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  },

  ENABLE_GRAPHQL && {
    name: 'graphql',
    testMatch: /src\/tests\/GraphQL\/.*\.spec\.ts/,
    grep: /@graphql/,
    use: {
      baseURL: process.env.GRAPHQL_BASE_URL || 'https://graphql-api.example.com',
      extraHTTPHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  },

  ENABLE_VISUAL && {
    name: 'visual Comparison',
    testMatch: /src\/tests\/visual\/.*\.spec\.ts/,
    grep: /@visual/,
    use: {
      ...sharedUse,
      ...devices['Desktop Chrome'],
      viewport: { width: 1920, height: 1080 },
      screenshot: 'on' as const,
    },
  },

  ENABLE_A11Y && {
    name: 'accessibility',
    testMatch: /src\/tests\/accessibility-technical\/.*\.spec\.ts/,
    grep: /@a11y/,
    use: { ...sharedUse, ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
  },

  ENABLE_PERF && {
    name: 'performance',
    testMatch: /src\/tests\/performance\/.*\.spec\.ts/,
    grep: /@performance/,
    use: { ...sharedUse, ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    dependencies: ['setup'],
  },

  ENABLE_SMOKE && {
    name: 'smoke',
    testMatch: /src\/tests\/.+\/.*\.spec\.ts/,
    grep: /@smoke/,
    use: { ...sharedUse, ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
  },

  ENABLE_BDD && {
    name: 'bdd',
    testDir: bddTestDir,
    testMatch: '**/*.spec.js',
    use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    dependencies: ['setup'],
  },

  ENABLE_BDD && {
    name: 'api-bdd',
    testDir: apiBddTestDir,
    testMatch: '**/*.spec.js',
    use: {
      baseURL: playwrightRuntime.apiBaseURL,
      extraHTTPHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  },
].filter(Boolean) as Parameters<typeof defineConfig>[0]['projects'];

export default defineConfig({
  testDir: './src/tests',
  timeout: playwrightRuntime.timeout,
  expect: { timeout: playwrightRuntime.actionTimeout },
  workers: playwrightRuntime.workers,
  retries: playwrightRuntime.retries,
  failOnFlakyTests: playwrightRuntime.failOnFlakyTests,
  forbidOnly: playwrightRuntime.isCI,
  grepInvert: undefined,
  reporter: createReporters(),
  outputDir: 'test-results',

  globalSetup: './src/resources/fixtures/global-setup.ts',
  globalTeardown: './src/resources/fixtures/global-teardown.ts',

  use: sharedUse,
  projects,

  webServer:
    process.env.START_LOCAL_SERVER === 'true'
      ? {
          command: 'pnpm run start:test',
          port: 3000,
          timeout: 120000,
          reuseExistingServer: !playwrightRuntime.isCI,
        }
      : undefined,
});
