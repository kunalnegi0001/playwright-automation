import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'src/tests/API/__examples-jsonplaceholder__/users/features/**/*.feature',
  steps: [
    'src/tests/API/__examples-jsonplaceholder__/step_definitions/common-api.steps.ts',
    'src/tests/API/__examples-jsonplaceholder__/step_definitions/data-setup.steps.ts',
  ],
  outputDir: '.features-gen/api',
});

export default defineConfig({
  testDir,
  timeout: Number(process.env.DEFAULT_TIMEOUT || 90000),
  expect: { timeout: Number(process.env.ACTION_TIMEOUT || 60000) },
  workers: Number(process.env.PARALLEL_WORKERS || 1),
  retries: Number(process.env.MAX_TEST_RETRIES || 0),
  reporter: [['list', { printSteps: true }]],

  use: {
    baseURL: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'jsonplaceholder-api-bdd',
      testDir,
      use: {
        baseURL: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
        extraHTTPHeaders: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },
  ],
});
