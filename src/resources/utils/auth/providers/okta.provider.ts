import { BaseAuthProvider } from '@utils/auth/base-auth.provider';
import { Page } from '@playwright/test';

export type OktaConfig = {
  domain: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export type OktaTokens = {
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
};

/**
 * Okta Authentication Provider
 * Handles Okta SSO authentication
 */
class OktaAuthProvider extends BaseAuthProvider {
  domain: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  [key: string]: unknown;

  constructor(config: OktaConfig & Record<string, unknown>) {
    super(config);
    this.domain = config.domain;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
  }

  /**
   * Authenticate via Okta
   * @param {Object} credentials - { email, password }
   * @param {Object} page - Playwright page object
   * @param {Object} options - { mfaSecret, saveState }
   * @returns {Promise<Object>} - Authentication tokens
   */
  async authenticate(
    credentials: { email: string; password: string },
    page: Page,
    options: { mfaSecret?: string; saveState?: boolean } = {}
  ): Promise<OktaTokens> {
    const { email, password } = credentials;
    const { mfaSecret, saveState = true } = options;

    // Check cached state
    const cachedState = await this.loadAuthState(email);
    if (cachedState && saveState) {
      return cachedState as OktaTokens;
    }

    // Navigate to Okta login
    const loginUrl =
      `https://${this.domain}/oauth2/v1/authorize?` +
      `client_id=${this.clientId}&` +
      `response_type=code&` +
      `scope=openid profile email&` +
      `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
      `state=${this.generateState()}`;

    await page.goto(loginUrl);

    // Fill Okta login form
    await page.locator('#okta-signin-username').waitFor({ timeout: 10000 });
    await page.fill('#okta-signin-username', email);
    await page.fill('#okta-signin-password', password);
    await page.click('#okta-signin-submit');

    // Handle MFA if required
    if (mfaSecret) {
      await page.locator('input[name="answer"]').waitFor({ timeout: 10000 });
      await this.handleMFA(page, mfaSecret);
    }

    // Wait for redirect
    await page.waitForURL(this.redirectUri, { timeout: 30000 });

    // Extract tokens from URL or storage
    const tokens = await this.extractOktaTokens(page);

    if (saveState) {
      await this.saveAuthState(email, tokens);
    }

    return tokens;
  }

  /**
   * Extract Okta tokens from page
   * @param {Object} page - Playwright page object
   * @returns {Promise<Object>} - Tokens
   */
  async extractOktaTokens(page: Page): Promise<OktaTokens> {
    // Try to get tokens from localStorage
    const tokens = await page.evaluate(() => {
      const oktaTokenStorage = localStorage.getItem('okta-token-storage');
      if (oktaTokenStorage) {
        return JSON.parse(oktaTokenStorage) as Record<string, unknown>;
      }
      return null;
    });

    if (tokens) {
      return tokens as OktaTokens;
    }

    // If not in localStorage, get from URL
    const url = page.url();
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const code = urlParams.get('code');

    if (code) {
      // Exchange code for tokens
      return await this.exchangeCodeForTokens(code);
    }

    throw new Error('Failed to extract Okta tokens');
  }

  /**
   * Exchange authorization code for tokens
   * @param {string} code - Authorization code
   * @returns {Promise<Object>} - Access and ID tokens
   */
  async exchangeCodeForTokens(code: string): Promise<OktaTokens> {
    const axios = (await import('axios')).default;

    const tokenUrl = `https://${this.domain}/oauth2/v1/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('code', code);
    params.append('redirect_uri', this.redirectUri);

    const response = (await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })) as { data: OktaTokens };

    return response.data;
  }

  /**
   * Generate random state for CSRF protection
   * @returns {string} - Random state string
   */
  generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} - New tokens
   */
  async refreshAccessToken(refreshToken: string): Promise<OktaTokens> {
    const axios = (await import('axios')).default;

    const tokenUrl = `https://${this.domain}/oauth2/v1/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('refresh_token', refreshToken);

    const response = (await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })) as { data: OktaTokens };

    return response.data;
  }
}

export { OktaAuthProvider };
