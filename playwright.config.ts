import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

// ==========================
// Quick Controls (most used)
// ==========================
const IS_CI = process.env.CI === 'true';
const WORKERS = Number(process.env.PARALLEL_WORKERS || (IS_CI ? 1 : 1));
const RETRIES = Number(process.env.MAX_TEST_RETRIES || (IS_CI ? 0 : 0));

const DEFAULT_TIMEOUT = Number(process.env.DEFAULT_TIMEOUT || 90000);
const ACTION_TIMEOUT = Number(process.env.ACTION_TIMEOUT || 60000);
const NAV_TIMEOUT = Number(process.env.NAVIGATION_TIMEOUT || 90000);

const HEADLESS = process.env.BROWSER_HEADLESS === 'true';
const TRACE = process.env.PW_TRACE || 'on';
const SCREENSHOT = process.env.PW_SCREENSHOT || 'only-on-failure';
const VIDEO = process.env.PW_VIDEO || 'retain-on-failure';

// Report toggles
const ENABLE_HTML = process.env.PW_REPORTER_HTML !== 'false';
const ENABLE_JSON = process.env.PW_REPORTER_JSON !== 'false';
const ENABLE_JUNIT = process.env.PW_REPORTER_JUNIT !== 'false';
const ENABLE_ALLURE = process.env.PW_REPORTER_ALLURE !== 'false';
const ENABLE_LIST = process.env.PW_REPORTER_LIST !== 'false';

// Project toggles
const ENABLE_UI = process.env.ENABLE_UI_PROJECT !== 'false';
const ENABLE_API = process.env.ENABLE_API_PROJECT !== 'false';
const ENABLE_GRAPHQL = process.env.ENABLE_GRAPHQL_PROJECT !== 'false';
const ENABLE_VISUAL = process.env.ENABLE_VISUAL_PROJECT !== 'false';
const ENABLE_A11Y = process.env.ENABLE_A11Y_PROJECT !== 'false';
const ENABLE_PERF = process.env.ENABLE_PERFORMANCE_PROJECT !== 'false';
const ENABLE_SMOKE = process.env.ENABLE_SMOKE_PROJECT !== 'false';
const ENABLE_BDD = process.env.ENABLE_BDD_PROJECT !== 'false';

const bddTestDir = defineBddConfig({
  features: 'src/tests/UI/__examples-orangehrm__/authentication/features/**/*.feature',
  steps: [
    'src/tests/UI/__examples-orangehrm__/authentication/step_definitions/**/*.ts',
    'src/tests/UI/__examples-orangehrm__/common/fixtures/**/*.ts',
  ],
  outputDir: '.features-gen/ui',
});

const apiBddTestDir = defineBddConfig({
  features: 'src/tests/API/__examples-jsonplaceholder__/users/features/**/*.feature',
  steps: [
    'src/tests/API/__examples-jsonplaceholder__/step_definitions/common-api.steps.ts',
    'src/tests/API/__examples-jsonplaceholder__/step_definitions/data-setup.steps.ts',
  ],
  outputDir: '.features-gen/api',
});

const reporters: Array<[string, Record<string, unknown>]> = [];
if (ENABLE_HTML) {
  reporters.push(['html', { outputFolder: 'playwright-report', open: 'never' }]);
}
if (ENABLE_JSON) {
  reporters.push(['json', { outputFile: 'test-results/results.json' }]);
}
if (ENABLE_JUNIT) {
  reporters.push(['junit', { outputFile: 'test-results/junit.xml' }]);
}
if (ENABLE_ALLURE) {
  reporters.push([
    'allure-playwright',
    { outputFolder: process.env.ALLURE_RESULTS_DIR || 'allure-results' },
  ]);
}
if (ENABLE_LIST) {
  reporters.push(['list', { printSteps: true }]);
}

// Shared browser settings
const sharedUse = {
  baseURL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php',
  headless: HEADLESS,
  trace: TRACE as 'on' | 'off' | 'retain-on-failure' | 'on-first-retry',
  screenshot: SCREENSHOT as 'on' | 'off' | 'only-on-failure',
  video: VIDEO as 'on' | 'off' | 'retain-on-failure' | 'on-first-retry',
  locale: 'en-US',
  timezoneId: 'America/New_York',
  navigationTimeout: NAV_TIMEOUT,
  actionTimeout: ACTION_TIMEOUT,
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
      baseURL: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
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
      baseURL: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
      extraHTTPHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  },
].filter(Boolean) as Parameters<typeof defineConfig>[0]['projects'];

export default defineConfig({
  testDir: './src/tests',
  timeout: DEFAULT_TIMEOUT,
  expect: { timeout: ACTION_TIMEOUT },
  workers: WORKERS,
  retries: RETRIES,
  forbidOnly: IS_CI,
  grepInvert: undefined,
  reporter: reporters,
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
          reuseExistingServer: !IS_CI,
        }
      : undefined,
});
