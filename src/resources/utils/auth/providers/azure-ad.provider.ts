import { BaseAuthProvider } from '@utils/auth/base-auth.provider';
import { ConfidentialClientApplication, type Configuration } from '@azure/msal-node';

/**
 * Azure AD Authentication Provider
 */
class AzureADProvider extends BaseAuthProvider {
  msalConfig: Record<string, unknown>;
  cca: ConfidentialClientApplication;
  [key: string]: unknown;

  constructor(config: Record<string, unknown>) {
    super(config);
    this.msalConfig = {
      auth: {
        clientId: config.clientId as string,
        authority: `https://login.microsoftonline.com/${config.tenantId as string}`,
        clientSecret: config.clientSecret as string,
      },
    };
    this.cca = new ConfidentialClientApplication(this.msalConfig as Configuration);
  }

  async authenticate(
    credentials: { email: string; password: string },
    _page: unknown,
    options: { saveState?: boolean } = {}
  ): Promise<Record<string, unknown>> {
    const { email, password } = credentials;
    const { saveState = true } = options;

    const cachedState = await this.loadAuthState(email);
    if (cachedState && saveState) {
      return cachedState as Record<string, unknown>;
    }

    // Using Resource Owner Password Credentials (ROPC) flow for testing
    const tokenRequest = {
      scopes: ['user.read'],
      username: email,
      password,
    };

    try {
      const response = await this.cca.acquireTokenByUsernamePassword(tokenRequest);

      if (saveState) {
        await this.saveAuthState(email, response);
      }

      return response as Record<string, unknown>;
    } catch (error) {
      throw new Error(
        `Azure AD authentication failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<unknown> {
    const response = await this.cca.acquireTokenByRefreshToken({
      refreshToken,
      scopes: ['user.read'],
    });

    return response;
  }
}

export { AzureADProvider };
