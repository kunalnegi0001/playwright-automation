import { BaseAuthProvider } from '@utils/auth/base-auth.provider';
import { Page } from '@playwright/test';

/**
 * Auth0 Authentication Provider
 */
class Auth0Provider extends BaseAuthProvider {
  domain: string;
  clientId: string;
  clientSecret: string;
  audience: string;
  [key: string]: unknown;

  constructor(config: Record<string, unknown>) {
    super(config);
    this.domain = (config.domain as string) || '';
    this.clientId = (config.clientId as string) || '';
    this.clientSecret = (config.clientSecret as string) || '';
    this.audience = (config.audience as string) || '';
  }

  async authenticate(
    credentials: Record<string, unknown>,
    page: Page,
    options: { saveState?: boolean } = {}
  ): Promise<Record<string, unknown>> {
    const { email, password } = credentials as { email: string; password: string };
    const { saveState = true } = options;

    const cachedState = await this.loadAuthState(email);
    if (cachedState && saveState) {
      return cachedState as Record<string, unknown>;
    }

    const loginUrl =
      `https://${this.domain}/authorize?` +
      `response_type=code&` +
      `client_id=${this.clientId}&` +
      `redirect_uri=${encodeURIComponent((this.config.redirectUri as string) || '')}&` +
      `scope=openid profile email&` +
      `audience=${this.audience}`;

    await page.goto(loginUrl);
    await page.locator('input[name="email"]').waitFor({ timeout: 10000 });
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await page.waitForURL((this.config.redirectUri as string) || '', { timeout: 30000 });
    const tokens = await this.extractTokens(page);

    if (saveState) {
      await this.saveAuthState(email, tokens);
    }

    return tokens as Record<string, unknown>;
  }
}

export { Auth0Provider };
