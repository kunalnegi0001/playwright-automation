/**
 * Static Test Data
 *
 * Pre-configured test data for use across test suites.
 * Includes test users, credit cards, countries, and other reference data.
 *
 * @example
 * ```typescript
 * import { TEST_USERS, TEST_CREDIT_CARDS, COUNTRIES } from '@resources/test-data/static';
 *
 * // Use static test user
 * await login(TEST_USERS.admin.username, TEST_USERS.admin.password);
 *
 * // Use test credit card
 * await fillCreditCard(TEST_CREDIT_CARDS.visa);
 *
 * // Use country data
 * await selectCountry(COUNTRIES.find(c => c.code === 'US'));
 * ```
 *
 * @module test-data/static
 */

export {
  TEST_USERS,
  TEST_CREDIT_CARDS,
  validateTestCredentials,
  type TestUserCredentials,
} from './test-users';
export { COUNTRIES, US_STATES, CANADIAN_PROVINCES, type Country } from './countries';
