/**
 * @fileoverview Authentication provider factory.
 * Creates appropriate auth provider instances based on configuration.
 * @module utils/auth/auth-factory
 */

import { OktaAuthProvider, type OktaConfig } from './providers/okta.provider';
import { Auth0Provider } from './providers/auth0.provider';
import { AzureADProvider } from './providers/azure-ad.provider';
import { SAMLProvider } from './providers/saml.provider';
import { BasicAuthProvider } from './providers/basic-auth.provider';
import { BaseAuthProvider } from './base-auth.provider';
import { configManager } from '@config/config.manager';

// Type for auth provider with authenticate method
export type AuthProvider = BaseAuthProvider;

/**
 * Authentication Factory
 * Creates appropriate auth provider based on configuration
 * Supports Okta, Auth0, Azure AD, SAML, and Basic authentication
 * @class
 * @example
 * const provider = AuthFactory.createProvider('okta');
 * await provider.authenticate(user, page);
 */
class AuthFactory {
  /**
   * Create auth provider instance
   * @static
   * @param {string} providerType - Type of auth provider (okta, auth0, azure, saml, basic)
   * @param {Object} [config=null] - Provider-specific configuration (uses config manager if null)
   * @returns {AuthProvider} Auth provider instance
   * @throws {Error} If provider type is unsupported
   * @example
   * const provider = AuthFactory.createProvider('basic');
   * const oktaProvider = AuthFactory.createProvider('okta', { domain: 'example.okta.com' });
   */
  static createProvider(
    providerType: string,
    config: Record<string, unknown> | null = null
  ): AuthProvider {
    const authConfig: Record<string, unknown> = config || configManager.getConfigAuth(providerType);

    switch (providerType.toLowerCase()) {
      case 'okta':
        return new OktaAuthProvider(authConfig as OktaConfig & Record<string, unknown>);

      case 'auth0':
        return new Auth0Provider(authConfig);

      case 'azure':
      case 'azuread':
        return new AzureADProvider(authConfig);

      case 'saml':
        return new SAMLProvider(authConfig);

      case 'basic':
      case 'form':
        return new BasicAuthProvider(authConfig);

      default:
        throw new Error(`Unsupported auth provider: ${providerType}`);
    }
  }

  /**
   * Get provider and credentials for specific user role
   * @static
   * @param {string} role - User role (admin, standard, etc.)
   * @param {string} [providerType='basic'] - Auth provider type
   * @returns {Object} Object containing user credentials and provider instance
   * @returns {Object} .user - User credentials from config
   * @returns {AuthProvider} .provider - Auth provider instance
   * @example
   * const { user, provider } = AuthFactory.getCredentialsForRole('admin');
   * await provider.authenticate(user, page);
   */
  static getCredentialsForRole(
    role: string,
    providerType = 'basic'
  ): { user: unknown; provider: AuthProvider } {
    const user = configManager.getConfigTestUser(role);
    const provider = this.createProvider(providerType);

    return {
      user,
      provider,
    };
  }
}

export { AuthFactory };
