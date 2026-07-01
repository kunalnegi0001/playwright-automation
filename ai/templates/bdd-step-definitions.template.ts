import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { test } from '@fixtures/test.fixtures';
import { logger } from '@utils/core';

// Import page objects
// import [PageName]Page from '../pages/[page-name].page';

// Import services if needed for API steps
// import [Entity]Service from '@services/[entity].service';

/**
 * @fileoverview Step definitions for [Feature Name]
 * Implements Gherkin steps for [brief description]
 */

// Create BDD DSL from test fixture
const { Given, When, Then, Before, After } = createBdd(test);

// ==================== HOOKS ====================

/**
 * Hook: Runs before each scenario
 */
Before(async ({ page }) => {
  logger.info('BDD Hook: Before scenario');
  // Setup logic before each scenario
  test.startTime = Date.now();
});

/**
 * Hook: Runs after each scenario
 */
After(async ({ page }, testInfo) => {
  const duration = Date.now() - test.startTime;
  logger.info('BDD Hook: After scenario', {
    title: testInfo.title,
    status: testInfo.status,
    duration,
  });
});

/**
 * Hook: Runs before scenarios with specific tag
 */
Before({ tags: '@tag-name' }, async ({ page }) => {
  logger.info('BDD Hook: Tag-specific setup for @tag-name');
  // Tag-specific setup
});

// ==================== GIVEN STEPS (Preconditions) ====================

/**
 * Given step: Navigate to a specific page
 * @example Given I am on the "login" page
 */
Given('I am on the {string} page', async ({ page }, pageName: string) => {
  logger.info('Step: Navigating to page', { pageName });
  await page.goto(`/${pageName.toLowerCase()}`);
  await page.waitForLoadState('networkidle');
});

/**
 * Given step: User is logged in
 * @example Given I am logged in as an admin
 */
Given('I am logged in as an admin', async ({ page }) => {
  logger.info('Step: Verifying admin login');
  // Assumes auth state is loaded or perform login
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/dashboard/);
});

/**
 * Given step: Setup test data
 * @example Given I have a user with email "test@example.com"
 */
Given('I have a user with email {string}', async ({ request }, email: string) => {
  logger.info('Step: Creating test user', { email });

  // Create user via API
  const response = await request.post('/api/users', {
    data: {
      email,
      name: 'Test User',
      password: 'password123',
    },
  });

  const user = await response.json();
  test.createdUser = user; // Store for later steps

  logger.info('Test user created', { userId: user.id, email });
});

/**
 * Given step: Precondition with state
 * @example Given I have 5 items in my cart
 */
Given('I have {int} items in my cart', async ({ page }, itemCount: number) => {
  logger.info('Step: Adding items to cart', { itemCount });

  for (let i = 0; i < itemCount; i++) {
    // Add items logic
    await page.click('[data-testid="add-to-cart"]');
  }

  logger.info('Items added to cart', { itemCount });
});

// ==================== WHEN STEPS (Actions) ====================

/**
 * When step: Click a button by name
 * @example When I click the "Submit" button
 */
When('I click the {string} button', async ({ page }, buttonName: string) => {
  logger.info('Step: Clicking button', { buttonName });
  await page.getByRole('button', { name: buttonName }).click();
});

/**
 * When step: Fill a form field
 * @example When I enter "test@example.com" in the "Email" field
 */
When(
  'I enter {string} in the {string} field',
  async ({ page }, value: string, fieldName: string) => {
    logger.info('Step: Entering value in field', { fieldName, value });
    await page.getByLabel(fieldName).fill(value);
  }
);

/**
 * When step: Submit a form with data table
 * @example
 * When I submit the form with:
 *   | field1 | value1 |
 *   | field2 | value2 |
 */
When('I submit the form with:', async ({ page }, dataTable) => {
  const data = dataTable.rowsHash();
  logger.info('Step: Submitting form with data', data);

  for (const [field, value] of Object.entries(data)) {
    await page.fill(`[name="${field}"]`, value as string);
  }

  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
});

/**
 * When step: API request
 * @example When I send a GET request to "/api/users"
 */
When('I send a GET request to {string}', async ({ request }, endpoint: string) => {
  logger.info('Step: Sending GET request', { endpoint });

  const startTime = Date.now();
  const response = await request.get(endpoint);
  const endTime = Date.now();

  test.lastResponse = response;
  test.responseTime = endTime - startTime;

  logger.info('GET request completed', {
    endpoint,
    status: response.status(),
    responseTime: test.responseTime,
  });
});

/**
 * When step: Select from dropdown
 * @example When I select "Option 1" from the "Dropdown" dropdown
 */
When(
  'I select {string} from the {string} dropdown',
  async ({ page }, option: string, dropdownName: string) => {
    logger.info('Step: Selecting dropdown option', { dropdownName, option });
    await page.selectOption(`select[name="${dropdownName.toLowerCase()}"]`, option);
  }
);

/**
 * When step: Wait for duration
 * @example When I wait for 2 seconds
 */
When('I wait for {int} seconds', async ({ page }, seconds: number) => {
  logger.info('Step: Waiting', { seconds });
  await page.waitForTimeout(seconds * 1000);
});

// ==================== THEN STEPS (Assertions) ====================

/**
 * Then step: Verify text visibility
 * @example Then I should see "Welcome"
 */
Then('I should see {string}', async ({ page }, text: string) => {
  logger.info('Step: Verifying text is visible', { text });
  await expect(page.getByText(text)).toBeVisible();
});

/**
 * Then step: Verify text not visible
 * @example Then I should not see "Error"
 */
Then('I should not see {string}', async ({ page }, text: string) => {
  logger.info('Step: Verifying text is not visible', { text });
  await expect(page.getByText(text)).not.toBeVisible();
});

/**
 * Then step: Verify URL
 * @example Then I should be redirected to "/dashboard"
 */
Then('I should be redirected to {string}', async ({ page }, path: string) => {
  logger.info('Step: Verifying URL', { path });
  await expect(page).toHaveURL(new RegExp(path));
});

/**
 * Then step: Verify element count
 * @example Then I should see 5 items in the list
 */
Then('I should see {int} items in the list', async ({ page }, expectedCount: number) => {
  logger.info('Step: Verifying item count', { expectedCount });
  const items = page.locator('.list-item');
  await expect(items).toHaveCount(expectedCount);
});

/**
 * Then step: Verify API response status
 * @example Then the response status should be 200
 */
Then('the response status should be {int}', async ({}, expectedStatus: number) => {
  logger.info('Step: Verifying response status', { expectedStatus });
  expect(test.lastResponse.status()).toBe(expectedStatus);
});

/**
 * Then step: Verify API response body
 * @example Then the response should contain "id"
 */
Then('the response should contain {string}', async ({}, field: string) => {
  logger.info('Step: Verifying response contains field', { field });
  const body = await test.lastResponse.json();
  expect(body).toHaveProperty(field);
});

/**
 * Then step: Verify multiple items in table
 * @example
 * Then I should see the following users:
 *   | name | email |
 *   | John | john@example.com |
 *   | Jane | jane@example.com |
 */
Then('I should see the following users:', async ({ page }, dataTable) => {
  const users = dataTable.hashes();
  logger.info('Step: Verifying users in table', { count: users.length });

  for (const user of users) {
    await expect(page.getByText(user.name)).toBeVisible();
    await expect(page.getByText(user.email)).toBeVisible();
  }
});

/**
 * Then step: Verify element state
 * @example Then the "Submit" button should be disabled
 */
Then('the {string} button should be disabled', async ({ page }, buttonName: string) => {
  logger.info('Step: Verifying button is disabled', { buttonName });
  const button = page.getByRole('button', { name: buttonName });
  await expect(button).toBeDisabled();
});

/**
 * Then step: Verify checkbox state
 * @example Then the "Terms" checkbox should be checked
 */
Then('the {string} checkbox should be checked', async ({ page }, checkboxName: string) => {
  logger.info('Step: Verifying checkbox is checked', { checkboxName });
  const checkbox = page.getByRole('checkbox', { name: checkboxName });
  await expect(checkbox).toBeChecked();
});

// ==================== AND STEPS ====================
// And steps typically reuse Given/When/Then steps
// No need to define separate And steps - they use the same step definitions

// ==================== CUSTOM PARAMETER TYPES ====================
// Define custom parameter types if needed

// Example: Custom date parameter
// defineParameterType({
//   name: 'date',
//   regexp: /\d{4}-\d{2}-\d{2}/,
//   transformer: (s: string) => new Date(s),
// });

// Usage in step:
// When('I select date {date}', async ({ page }, date: Date) => {
//   // Use date object
// });
