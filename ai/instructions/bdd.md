# BDD Patterns

## Feature File

```gherkin
Feature: User Login
  As a user
  I want to log in to the system
  So that I can access my account

  Background:
    Given I am on the login page

  @smoke @ui
  Scenario: Successful login
    When I login with "admin" and "password123"
    Then I should see the dashboard
    And I should see "Welcome, Admin"

  @regression
  Scenario: Invalid credentials
    When I login with "admin" and "wrongpassword"
    Then I should see an error message
    And I should remain on the login page

  Scenario Outline: Multiple login attempts
    When I login with "<username>" and "<password>"
    Then I should see "<message>"

    Examples:
      | username | password    | message           |
      | admin    | password123 | Welcome, Admin    |
      | user     | wrongpass   | Invalid credentials |
```

## Step Definitions

```typescript
import { createBdd } from 'playwright-bdd';
import { test } from '@fixtures/test.fixtures';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

const { Given, When, Then } = createBdd(test);

Given('I am on the login page', async ({ page }) => {
  await page.goto('/login');
});

When(
  'I login with {string} and {string}',
  async ({ page }, username, password) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(username, password);
  }
);

Then('I should see the dashboard', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

Then('I should see {string}', async ({ page }, text) => {
  await expect(page.getByText(text)).toBeVisible();
});

Then('I should see an error message', async ({ page }) => {
  await expect(page.getByRole('alert')).toBeVisible();
});
```

## Data Tables

```gherkin
Scenario: Create user with details
  When I create a user with the following details:
    | Field     | Value           |
    | Username  | john.doe        |
    | Email     | john@example.com|
    | Role      | Admin           |
  Then the user should be created
```

```typescript
When('I create a user with the following details:', async ({ page }, table) => {
  const data = table.rowsHash(); // { Field: Value }
  await page.fill('[name="username"]', data['Username']);
  await page.fill('[name="email"]', data['Email']);
  await page.selectOption('[name="role"]', data['Role']);
  await page.click('[type="submit"]');
});
```

## Best Practices

1. **Given**: Setup/preconditions
2. **When**: Actions
3. **Then**: Assertions
4. **Use Background**: For common setup steps
5. **Tags**: `@smoke`, `@regression`, `@api`, `@ui`, `@slow`
6. **Scenario Outline**: For data-driven tests
7. **Keep Steps Reusable**: Write generic steps
