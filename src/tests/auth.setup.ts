import { test as setup } from '@playwright/test';
import * as path from 'path';
import { logger } from '@utils/core/logger';
import { env } from '@config/env.config';

const authFile = path.join('.auth', 'user.json');

setup('authenticate', async ({ page }) => {
  // Navigate to login page (environment-driven with OrangeHRM demo default)
  await page.goto(env.orangehrm.loginUrl);

  // Fill in credentials from environment variables
  await page.getByRole('textbox', { name: 'Username' }).fill(env.orangehrm.username);
  await page.getByRole('textbox', { name: 'Password' }).fill(env.orangehrm.password);

  // Click login button
  await page.getByRole('button', { name: 'Login' }).click({ timeout: 30000 });

  // Wait for successful login - check for Dashboard
  const dashboardHeading = page.getByRole('heading', { name: 'Dashboard' });
  await dashboardHeading.waitFor({ state: 'visible', timeout: 30000 });

  // Save signed-in state
  await page.context().storageState({ path: authFile });

  logger.info(`✅ Authentication state saved to ${authFile}`);
});
