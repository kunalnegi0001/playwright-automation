/**
 * @fileoverview Authentication and login step definitions for OrangeHRM.
 * Provides BDD steps for login functionality, credential validation, and dashboard verification.
 * @module tests/UI/authentication/step_definitions/authentication.steps
 */

import { createBdd } from 'playwright-bdd';
import { test, expect } from '../../common/fixtures/orangehrm.fixtures';

const { Given, When, Then } = createBdd(test);

// ── Background / Setup Steps ──

Given('I am on the OrangeHRM login page', async ({ loginPage }) => {
  await loginPage.navigate();
});

// ── Login Page Element Verification ──

Then('I should see the OrangeHRM logo', async ({ loginPage }) => {
  await expect(loginPage.logo).toBeVisible();
});

Then('I should see the {string} heading', async ({ page }, heading: string) => {
  await expect(
    page.locator(`h5:has-text("${heading}"), h6:has-text("${heading}")`).first()
  ).toBeVisible();
});

Then('I should see the Username and Password input fields', async ({ loginPage }) => {
  await expect(loginPage.usernameInput).toBeVisible();
  await expect(loginPage.passwordInput).toBeVisible();
});

Then('I should see the Login button', async ({ loginPage }) => {
  await expect(loginPage.loginButton).toBeVisible();
});

Then('I should see the "Forgot your password?" link', async ({ loginPage }) => {
  await expect(loginPage.forgotPasswordLink).toBeVisible();
});

Then(
  'I should see credential hints showing {string} and {string}',
  async ({ loginPage }, _hint1: string, _hint2: string) => {
    const hintsText = await loginPage.getCredentialHintsText();
    expect(hintsText).toContain('Username');
    expect(hintsText).toContain('Password');
  }
);

Then('I should see social media links', async ({ loginPage }) => {
  const count = await loginPage.getSocialLinksCount();
  expect(count).toBeGreaterThanOrEqual(4);
});

Then(
  'I should see the footer with {string} and copyright text',
  async ({ loginPage }, _text: string) => {
    const footerText = await loginPage.getFooterText();
    expect(footerText).toContain('OrangeHRM');
  }
);

// ── Login Actions ──

When(
  'I enter username {string} and password {string}',
  async ({ loginPage }, username: string, password: string) => {
    await loginPage.enterUsername(username);
    await loginPage.enterPassword(password);
  }
);

When('I click the Login button', async ({ loginPage }) => {
  await loginPage.clickLogin();
});

// ── Login Result Assertions ──

Then('I should be redirected to the dashboard page', async ({ page }) => {
  await page.waitForURL(/.*dashboard.*/, { timeout: 15000 });
  expect(page.url()).toContain('/dashboard');
});

Then('I should see the Dashboard heading', async ({ dashboardPage }) => {
  await expect(dashboardPage.dashboardHeading).toBeVisible();
});

Then('I should see 12 sidebar menu items', async ({ dashboardPage }) => {
  await dashboardPage.page.waitForLoadState('domcontentloaded');
  const count = await dashboardPage.getSidebarMenuItemCount();
  expect(count).toBe(12);
});

Then('I should see user profile name in the top-right corner', async ({ dashboardPage }) => {
  await expect(dashboardPage.userDropdown).toBeVisible();
});
