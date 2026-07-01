import { test, expect } from '@playwright/test';
import { env } from '@config/env.config';

test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    await page.goto(env.orangehrm.loginUrl);
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill(env.orangehrm.username);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(env.orangehrm.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
