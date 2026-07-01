import { BaseAuthProvider } from '@utils/auth/base-auth.provider';
import path from 'path';
import fs from 'fs/promises';
import { Page } from '@playwright/test';

/**
 * Basic/Form Authentication Provider
 * Handles standard username/password login forms
 */
class BasicAuthProvider extends BaseAuthProvider {
  storageStatePath: string;
  [key: string]: unknown;

  constructor(config: Record<string, unknown>) {
    super(config);
    this.storageStatePath = '.auth';
  }

  /**
   * Authenticate user via standard login form
   * @param {Object} credentials - { email, password }
   * @param {Object} page - Playwright page object
   * @param {Object} options - { mfaSecret, saveState, stateFile }
   * @returns {Promise<Object>} - Authentication state
   */
  async authenticate(
    credentials: { email: string; password: string },
    page: Page,
    options: { mfaSecret?: string; saveState?: boolean; stateFile?: string } = {}
  ): Promise<Record<string, unknown>> {
    const { email, password } = credentials;
    const { mfaSecret, saveState = true, stateFile } = options;

    // Check if we have cached state
    const cachedState = await this.loadAuthState(email);
    if (cachedState && saveState) {
      const state = cachedState as Record<string, unknown>;
      if (state.cookies && Array.isArray(state.cookies)) {
        await page.context().addCookies(state.cookies);
      }
      return state;
    }

    // Navigate to login page
    const loginUrl = (this.config.loginUrl as string) || '/login';
    await page.goto(loginUrl);

    // Fill login form
    await this.fillLoginForm(page, email, password);

    // Handle MFA if required
    if (mfaSecret) {
      await this.handleMFA(page, mfaSecret);
    }

    // Wait for successful login
    const successUrl = this.config.successUrl || /dashboard|home/;
    await this.waitForAuthComplete(
      page as unknown as {
        waitForURL: (url: string | RegExp, options: { timeout: number }) => Promise<void>;
      },
      successUrl as string
    );

    // Extract authentication state
    const authState = await this.extractTokens(
      page as unknown as {
        evaluate: (fn: () => string) => Promise<string>;
        context: () => { cookies: () => Promise<unknown[]> };
      }
    );

    // Save state for reuse
    if (saveState) {
      await this.saveAuthState(email, authState);

      // Save to file if specified
      if (stateFile) {
        await this.saveStateToFile(stateFile, page);
      }
    }

    return authState;
  }

  /**
   * Fill login form with credentials
   * @param {Object} page - Playwright page object
   * @param {string} email - User email
   * @param {string} password - User password
   */
  async fillLoginForm(page: Page, email: string, password: string): Promise<void> {
    // Common selectors for email/username fields
    const emailSelectors = [
      'input[name="email"]',
      'input[name="username"]',
      'input[type="email"]',
      'input[id="email"]',
      'input[id="username"]',
      '[data-test="email"]',
      '[data-test="username"]',
    ];

    // Common selectors for password fields
    const passwordSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      'input[id="password"]',
      '[data-test="password"]',
    ];

    // Fill email
    for (const selector of emailSelectors) {
      try {
        await page.locator(selector).waitFor({ timeout: 5000 });
        await page.fill(selector, email);
        break;
      } catch (error) {
        continue;
      }
    }

    // Fill password
    for (const selector of passwordSelectors) {
      try {
        await page.locator(selector).waitFor({ timeout: 5000 });
        await page.fill(selector, password);
        break;
      } catch (error) {
        continue;
      }
    }

    // Submit form
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Log in")',
      'button:has-text("Sign in")',
      '[data-test="login-button"]',
    ];

    for (const selector of submitSelectors) {
      try {
        await page.click(selector);
        break;
      } catch (error) {
        continue;
      }
    }
  }

  /**
   * Save authentication state to file
   * @param {string} fileName - File name for state storage
   * @param {Object} page - Playwright page object
   */
  async saveStateToFile(fileName: string, page: Page): Promise<void> {
    const filePath = path.join(this.storageStatePath, `${fileName}.json`);

    // Ensure directory exists
    await fs.mkdir(this.storageStatePath, { recursive: true });

    // Save storage state
    await page.context().storageState({ path: filePath });

    console.log(`Auth state saved to: ${filePath}`);
  }

  /**
   * Load authentication state from file
   * @param {string} fileName - File name of saved state
   * @returns {Promise<Object>} - Storage state
   */
  async loadStateFromFile(fileName: string): Promise<Record<string, unknown> | null> {
    const filePath = path.join(this.storageStatePath, `${fileName}.json`);

    try {
      const state = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(state) as Record<string, unknown>;
    } catch (error) {
      console.log(`No saved state found at: ${filePath}`);
      return null;
    }
  }

  /**
   * Logout user
   * @param {Object} page - Playwright page object
   */
  async logout(page: Page): Promise<void> {
    const logoutSelectors = [
      'a:has-text("Logout")',
      'a:has-text("Sign out")',
      'button:has-text("Logout")',
      'button:has-text("Sign out")',
      '[data-test="logout"]',
    ];

    for (const selector of logoutSelectors) {
      try {
        await page.click(selector);
        break;
      } catch (error) {
        continue;
      }
    }

    // Clear cookies
    await page.context().clearCookies();
  }
}

export { BasicAuthProvider };
