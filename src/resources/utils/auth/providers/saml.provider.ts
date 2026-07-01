import { BaseAuthProvider } from '@utils/auth/base-auth.provider';

/**
 * SAML Authentication Provider
 * Handles SAML-based SSO authentication
 */
class SAMLProvider extends BaseAuthProvider {
  idpUrl: string;
  entityId: string;
  [key: string]: unknown;

  constructor(config: Record<string, unknown>) {
    super(config);
    this.idpUrl = config.idpUrl as string;
    this.entityId = config.entityId as string;
  }

  async authenticate(
    credentials: { email: string; password: string },
    page: {
      goto: (url: string) => Promise<unknown>;
      waitForURL: (pattern: RegExp | string, opts?: { timeout?: number }) => Promise<void>;
      fill: (selector: string, value: string) => Promise<void>;
      click: (selector: string) => Promise<void>;
    },
    options: { saveState?: boolean } = {}
  ): Promise<Record<string, unknown>> {
    const { email, password } = credentials;
    const { saveState = true } = options;

    const cachedState = await this.loadAuthState(email);
    if (cachedState && saveState) {
      return cachedState as Record<string, unknown>;
    }

    // Navigate to SP-initiated SSO
    await page.goto((this.config.loginUrl as string) || '');

    // Wait for redirect to IdP
    await page.waitForURL(/.*saml.*/i, { timeout: 10000 });

    // Fill IdP login form (varies by provider)
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for SAML response and redirect back to SP
    await page.waitForURL((this.config.assertionConsumerUrl as string) || '', { timeout: 30000 });

    // Extract session
    const authState = await this.extractTokens(
      page as unknown as {
        evaluate: (fn: () => string) => Promise<string>;
        context: () => { cookies: () => Promise<unknown[]> };
      }
    );

    if (saveState) {
      await this.saveAuthState(email, authState);
    }

    return authState as Record<string, unknown>;
  }
}

export { SAMLProvider };
