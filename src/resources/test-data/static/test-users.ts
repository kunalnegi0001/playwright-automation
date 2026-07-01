/**
 * Static test data for authentication and authorization testing
 *
 * ⚠️ SECURITY WARNING:
 * - Never commit real credentials to version control
 * - All credentials must be stored in environment variables
 * - Use .env.local for local development (git-ignored)
 *
 * @module test-data/static/test-users
 */

/**
 * Test user credentials structure
 */
export type TestUserCredentials = {
  /** Username or email */
  username: string;
  /** Password (from environment variable) */
  password: string;
  /** User role */
  role: string;
  /** Display name */
  displayName: string;
};

/**
 * Pre-configured test users for different roles and scenarios
 *
 * @example
 * ```typescript
 * import { TEST_USERS } from '@resources/test-data/static';
 *
 * test('admin can access dashboard', async ({ page }) => {
 *   await page.goto('/login');
 *   await page.fill('#username', TEST_USERS.admin.username);
 *   await page.fill('#password', TEST_USERS.admin.password);
 *   await page.click('button[type="submit"]');
 * });
 * ```
 */
export const TEST_USERS: Record<string, TestUserCredentials> = {
  /**
   * Administrator user with full system access
   */
  admin: {
    username: process.env.TEST_ADMIN_USERNAME || 'admin@test.com',
    password: process.env.TEST_ADMIN_PASSWORD || '',
    role: 'admin',
    displayName: 'Test Admin',
  },

  /**
   * Standard user with basic access
   */
  user: {
    username: process.env.TEST_USER_USERNAME || 'user@test.com',
    password: process.env.TEST_USER_PASSWORD || '',
    role: 'user',
    displayName: 'Test User',
  },

  /**
   * Manager user with elevated permissions
   */
  manager: {
    username: process.env.TEST_MANAGER_USERNAME || 'manager@test.com',
    password: process.env.TEST_MANAGER_PASSWORD || '',
    role: 'manager',
    displayName: 'Test Manager',
  },

  /**
   * Viewer/read-only user
   */
  viewer: {
    username: process.env.TEST_VIEWER_USERNAME || 'viewer@test.com',
    password: process.env.TEST_VIEWER_PASSWORD || '',
    role: 'viewer',
    displayName: 'Test Viewer',
  },

  /**
   * Inactive/disabled user (for negative testing)
   */
  inactive: {
    username: process.env.TEST_INACTIVE_USERNAME || 'inactive@test.com',
    password: process.env.TEST_INACTIVE_PASSWORD || '',
    role: 'user',
    displayName: 'Inactive User',
  },
};

/**
 * Test credit card numbers (always use test cards, never real cards)
 *
 * Source: https://stripe.com/docs/testing
 */
export const TEST_CREDIT_CARDS = {
  visa: {
    number: '4111111111111111',
    cvv: '123',
    expiry: '12/25',
    name: 'Test Visa User',
  },
  visaDebit: {
    number: '4000056655665556',
    cvv: '123',
    expiry: '12/25',
    name: 'Test Visa Debit User',
  },
  mastercard: {
    number: '5555555555554444',
    cvv: '123',
    expiry: '12/25',
    name: 'Test Mastercard User',
  },
  amex: {
    number: '378282246310005',
    cvv: '1234', // Amex uses 4-digit CVV
    expiry: '12/25',
    name: 'Test Amex User',
  },
  discover: {
    number: '6011111111111117',
    cvv: '123',
    expiry: '12/25',
    name: 'Test Discover User',
  },
  // Declined card for negative testing
  declined: {
    number: '4000000000000002',
    cvv: '123',
    expiry: '12/25',
    name: 'Test Declined Card',
  },
  // Card that requires authentication (3D Secure)
  requiresAuth: {
    number: '4000002500003155',
    cvv: '123',
    expiry: '12/25',
    name: 'Test 3DS Card',
  },
};

/**
 * Validate that required environment variables are set
 * @throws Error if required credentials are missing
 */
export const validateTestCredentials = (): void => {
  const missingVars: string[] = [];

  if (!process.env.TEST_ADMIN_PASSWORD) {
    missingVars.push('TEST_ADMIN_PASSWORD');
  }
  if (!process.env.TEST_USER_PASSWORD) {
    missingVars.push('TEST_USER_PASSWORD');
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please set them in your .env.local file or environment.'
    );
  }
};
