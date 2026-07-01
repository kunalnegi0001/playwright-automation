import dotenv from 'dotenv';

dotenv.config();

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }

  return value === 'true';
};

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toGlobList = (value: string | undefined, fallback: string[]): string[] => {
  if (!value) {
    return fallback;
  }

  const globs = value
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean);

  return globs.length > 0 ? globs : fallback;
};

const ORANGEHRM_RAW_BASE_URL =
  process.env.ORANGEHRM_BASE_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php';
const ORANGEHRM_BASE_URL = ORANGEHRM_RAW_BASE_URL.includes('/web/index.php')
  ? ORANGEHRM_RAW_BASE_URL.replace(/\/$/, '')
  : `${ORANGEHRM_RAW_BASE_URL.replace(/\/$/, '')}/web/index.php`;

const projectProfile = process.env.PROJECT_PROFILE || 'core';
const includeExamples =
  toBoolean(process.env.INCLUDE_EXAMPLES, false) ||
  projectProfile === 'example' ||
  projectProfile === 'examples';

const exampleUiFeatureGlobs = [
  'src/tests/UI/__examples-orangehrm__/authentication/features/**/*.feature',
];
const exampleUiStepGlobs = [
  'src/tests/UI/__examples-orangehrm__/authentication/step_definitions/**/*.ts',
  'src/tests/UI/__examples-orangehrm__/common/fixtures/**/*.ts',
];
const exampleApiFeatureGlobs = [
  'src/tests/API/__examples-jsonplaceholder__/users/features/**/*.feature',
];
const exampleApiStepGlobs = [
  'src/tests/API/__examples-jsonplaceholder__/step_definitions/common-api.steps.ts',
  'src/tests/API/__examples-jsonplaceholder__/step_definitions/data-setup.steps.ts',
];

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  baseUrl: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php',
  apiBaseUrl: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
  ci: {
    isCI: toBoolean(process.env.CI, false),
    provider: process.env.CI_PROVIDER || (process.env.TF_BUILD ? 'azure-devops' : 'local'),
    workers: toNumber(process.env.PARALLEL_WORKERS, 1),
  },
  retry: {
    maxTestRetries: toNumber(process.env.MAX_TEST_RETRIES, 0),
    failOnFlakyTests: toBoolean(process.env.FAIL_ON_FLAKY_TESTS, false),
  },
  timeouts: {
    default: toNumber(process.env.DEFAULT_TIMEOUT, 90000),
    action: toNumber(process.env.ACTION_TIMEOUT, 60000),
    navigation: toNumber(process.env.NAVIGATION_TIMEOUT, 90000),
  },
  browser: {
    headless: toBoolean(process.env.BROWSER_HEADLESS, true),
  },
  reporting: {
    allureResultsDir: process.env.ALLURE_RESULTS_DIR || 'allure-results',
    allureReportDir: process.env.ALLURE_REPORT_DIR || 'allure-report',
  },
  profiles: {
    projectProfile,
    includeExamples,
  },
  bdd: {
    ui: {
      features: toGlobList(
        process.env.UI_BDD_FEATURES_GLOB,
        includeExamples ? exampleUiFeatureGlobs : ['src/tests/UI/features/**/*.feature']
      ),
      steps: toGlobList(
        process.env.UI_BDD_STEPS_GLOBS,
        includeExamples ? exampleUiStepGlobs : ['src/tests/UI/**/step_definitions/**/*.ts']
      ),
    },
    api: {
      features: toGlobList(
        process.env.API_BDD_FEATURES_GLOB,
        includeExamples ? exampleApiFeatureGlobs : ['src/tests/API/features/**/*.feature']
      ),
      steps: toGlobList(
        process.env.API_BDD_STEPS_GLOBS,
        includeExamples ? exampleApiStepGlobs : ['src/tests/API/**/step_definitions/**/*.ts']
      ),
    },
  },
  orangehrm: {
    baseUrl: ORANGEHRM_BASE_URL,
    loginUrl: process.env.ORANGEHRM_LOGIN_URL || `${ORANGEHRM_BASE_URL}/auth/login`,
    username: process.env.ORANGEHRM_USERNAME || process.env.TEST_USERNAME || 'Admin',
    password: process.env.ORANGEHRM_PASSWORD || process.env.TEST_PASSWORD || 'admin123',
  },
} as const;

export const getEnv = (key: string, defaultValue: string = ''): string => {
  return process.env[key] || defaultValue;
};

export const isCI = (): boolean => process.env.CI === 'true';
export const isProduction = (): boolean => process.env.NODE_ENV === 'production';
export const isDevelopment = (): boolean =>
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

export const validateEnv = (required: string[]): void => {
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};
