import dotenv from 'dotenv';

dotenv.config();

const ORANGEHRM_RAW_BASE_URL =
  process.env.ORANGEHRM_BASE_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php';
const ORANGEHRM_BASE_URL = ORANGEHRM_RAW_BASE_URL.includes('/web/index.php')
  ? ORANGEHRM_RAW_BASE_URL.replace(/\/$/, '')
  : `${ORANGEHRM_RAW_BASE_URL.replace(/\/$/, '')}/web/index.php`;

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  baseUrl: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php',
  apiBaseUrl: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
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
export const isDevelopment = (): boolean => !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

export const validateEnv = (required: string[]): void => {
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};
