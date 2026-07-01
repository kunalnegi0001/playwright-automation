/**
 * @fileoverview Base authentication provider abstract class.
 * Defines common authentication interface and session management for all auth providers.
 * @module utils/auth/base-auth.provider
 */

/**
 * Base Auth Provider
 * Abstract class that all auth providers must extend
 * Provides session caching, state management, and MFA handling
 * @class
 * @abstract
 * @example
 * class MyAuthProvider extends BaseAuthProvider {
 *   async authenticate(credentials, page) {
 *     // Implementation
 *   }
 * }
 */
class BaseAuthProvider {
  config: Record<string, unknown>;
  sessionCache: Map<string, { state: unknown; timestamp: number }>;

  constructor(config: Record<string, unknown>) {
    this.config = config;
    this.sessionCache = new Map();
  }

  /**
   * Authenticate user and return session data
   * Must be implemented by child classes
   * @abstract
   * @async
   * @param {Object} credentials - User credentials (username, password, etc.)
   * @param {Object} page - Playwright page object
   * @param {Object} [options] - Additional authentication options
   * @returns {Promise<Object>} Session data including cookies, tokens, etc.
   * @throws {Error} If not implemented by child class
   */
  async authenticate(
    _credentials: unknown,
    _page: unknown,
    _options?: unknown
  ): Promise<Record<string, unknown>> {
    throw new Error('authenticate() must be implemented by child class');
  }

  /**
   * Save authentication state for session reuse
   * @async
   * @param {string} userId - Unique user identifier
   * @param {Object} state - Authentication state (cookies, tokens, storage)
   * @returns {Promise<void>}
   */
  async saveAuthState(userId: string, state: unknown): Promise<void> {
    this.sessionCache.set(userId, {
      state,
      timestamp: Date.now(),
    });
  }

  /**
   * Load previously saved authentication state
   * @async
   * @param {string} userId - Unique user identifier
   * @returns {Promise<Object|null>} Saved state or null if expired/not found
   */
  async loadAuthState(userId: string): Promise<unknown> {
    const cached = this.sessionCache.get(userId);

    if (!cached) {
      return null;
    }

    // Check if session is still valid (default 1 hour)
    const maxAge = (this.config.sessionMaxAge as number) || 3600000;
    if (Date.now() - cached.timestamp > maxAge) {
      this.sessionCache.delete(userId);
      return null;
    }

    return cached.state;
  }

  /**
   * Clear authentication state for specific user
   * @async
   * @param {string} userId - Unique user identifier
   * @returns {Promise<void>}
   */
  async clearAuthState(userId: string): Promise<void> {
    this.sessionCache.delete(userId);
  }

  /**
   * Clear all cached sessions
   * @async
   * @returns {Promise<void>}
   */
  async clearAllSessions(): Promise<void> {
    this.sessionCache.clear();
  }

  /**
   * Handle Multi-Factor Authentication (MFA/2FA)
   * Automatically detects MFA input fields and enters TOTP code
   * @async
   * @param {Object} page - Playwright page object
   * @param {string} mfaSecret - MFA secret key for TOTP generation
   * @returns {Promise<void>}
   * @throws {Error} If MFA input field not found
   */
  async handleMFA(
    page: {
      locator: (sel: string) => { waitFor: (opts: { timeout: number }) => Promise<void> };
      fill: (sel: string, val: string) => Promise<void>;
      click: (sel: string) => Promise<void>;
    },
    mfaSecret: string
  ): Promise<void> {
    // Default implementation - can be overridden
    const { authenticator } = await import('otplib');
    const token = authenticator.generate(mfaSecret);

    // Try to find MFA input field and enter code
    const mfaSelectors = [
      'input[name="code"]',
      'input[name="token"]',
      'input[name="otp"]',
      'input[type="tel"]',
      '#mfa-code',
      '[data-test="mfa-input"]',
    ];

    for (const selector of mfaSelectors) {
      try {
        await page.locator(selector).waitFor({ timeout: 5000 });
        await page.fill(selector, token);
        await page.click('button[type="submit"]');
        return;
      } catch (error) {
        continue;
      }
    }

    throw new Error('Could not find MFA input field');
  }

  /**
   * Wait for authentication to complete
   * @param {Object} page - Playwright page object
   * @param {string} successUrl - URL pattern indicating successful auth
   * @returns {Promise<void>}
   */
  async waitForAuthComplete(
    page: { waitForURL: (url: string, options: { timeout: number }) => Promise<void> },
    successUrl: string
  ): Promise<void> {
    await page.waitForURL(successUrl, { timeout: 30000 });
  }

  /**
   * Extract tokens from page
   * @param {Object} page - Playwright page object
   * @returns {Promise<Object>} - Extracted tokens
   */
  async extractTokens(page: {
    evaluate: (fn: () => string) => Promise<string>;
    context: () => { cookies: () => Promise<unknown[]> };
  }): Promise<{
    localStorage: Record<string, unknown>;
    sessionStorage: Record<string, unknown>;
    cookies: unknown[];
  }> {
    // Try localStorage
    const localStorage = await page.evaluate(() => {
      return JSON.stringify(window.localStorage);
    });

    // Try sessionStorage
    const sessionStorage = await page.evaluate(() => {
      return JSON.stringify(window.sessionStorage);
    });

    return {
      localStorage: JSON.parse(localStorage) as Record<string, unknown>,
      sessionStorage: JSON.parse(sessionStorage) as Record<string, unknown>,
      cookies: await page.context().cookies(),
    };
  }
}

export { BaseAuthProvider };
