import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { env } from './src/resources/config/env.config';
import { createReporters, playwrightRuntime } from './src/resources/config/playwright-runtime.config';

const testDir = defineBddConfig({
  features: env.bdd.api.features,
  steps: env.bdd.api.steps,
  outputDir: `.features-gen/api-${playwrightRuntime.includeExamples ? 'examples' : 'core'}`,
});

export default defineConfig({
  testDir,
  timeout: playwrightRuntime.timeout,
  expect: { timeout: playwrightRuntime.actionTimeout },
  workers: playwrightRuntime.workers,
  retries: playwrightRuntime.retries,
  reporter: createReporters(),

  use: {
    baseURL: playwrightRuntime.apiBaseURL,
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    trace: playwrightRuntime.trace,
    screenshot: playwrightRuntime.screenshot,
    video: playwrightRuntime.video,
  },

  projects: [
    {
      name: 'jsonplaceholder-api-bdd',
      testDir,
      use: {
        baseURL: playwrightRuntime.apiBaseURL,
        extraHTTPHeaders: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },
  ],
});
