/**
 * @fileoverview OrangeHRM BDD test fixtures.
 * Provides page object instances as Playwright fixtures for all OrangeHRM modules.
 * @module tests/UI/__examples-orangehrm__/common/fixtures/orangehrm.fixtures
 */

import { test as base } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { LoginPage } from '../../authentication/pages/login.page';
import { DashboardPage } from '../../authentication/pages/dashboard.page';

/**
 * OrangeHRM BDD Test Fixtures
 * Extends Playwright BDD test with page object instances for all modules
 */
type OrangeHRMFixtures = {
  /** Login/authentication page */
  loginPage: LoginPage;
  /** Main dashboard page */
  dashboardPage: DashboardPage;
};

export const test = base.extend<OrangeHRMFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect };
