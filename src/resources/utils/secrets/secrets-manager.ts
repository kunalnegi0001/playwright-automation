/**
 * Secrets Manager - Centralized secrets management utility
 *
 * Supports multiple secret providers:
 * - Environment variables (default)
 * - HashiCorp Vault
 * - AWS Secrets Manager
 * - Azure Key Vault
 * - CI-hosted secrets (GitHub Actions / Azure DevOps)
 */

import { logger } from '@utils/core';
import { configManager } from '@config/config.manager';

/**
 * Supported secret provider types
 */
export type SecretProvider =
  | 'env'
  | 'vault'
  | 'aws'
  | 'azure'
  | 'ci'
  | 'github'
  | 'ado'
  | 'azure-devops';

/**
 * Secret metadata
 */
type SecretMetadata = {
  /** Secret name/key */
  name: string;
  /** Provider where secret is stored */
  provider: SecretProvider;
  /** When secret was last fetched */
  lastFetched?: Date;
  /** TTL for cached secrets (milliseconds) */
  ttl?: number;
};

/**
 * Secret cache entry
 */
type CachedSecret = {
  /** Secret value */
  value: string;
  /** When secret was cached */
  cachedAt: Date;
  /** Metadata */
  metadata: SecretMetadata;
};

/**
 * Secrets Manager class for centralized secret handling
 */
export class SecretsManager {
  private static instance: SecretsManager;
  private cache: Map<string, CachedSecret> = new Map();
  private azureTokenCache: { accessToken: string; expiresAt: number } | null = null;
  private defaultProvider: SecretProvider;
  private defaultTTL: number = 300000; // 5 minutes

  private constructor() {
    this.defaultProvider = (configManager.get('secrets.provider') as SecretProvider) || 'env';
    const ttl = configManager.get('secrets.cacheTTL');
    if (ttl && typeof ttl === 'number') {
      this.defaultTTL = ttl;
    }
    logger.info('Secrets manager initialized', { provider: this.defaultProvider });
  }

  /**
   * Get singleton instance of SecretsManager
   * @returns SecretsManager instance
   */
  public static getInstance = (): SecretsManager => {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  };

  /**
   * Get a secret value by name
   * @param secretName - Name of the secret to retrieve
   * @param provider - Optional provider override
   * @param options - Optional configuration
   * @returns Secret value
   * @throws {Error} When secret is not found or cannot be retrieved
   * @example
   * const apiKey = await secretsManager.getSecret('API_KEY');
   * const dbPassword = await secretsManager.getSecret('DB_PASSWORD', 'vault');
   */
  public getSecret = async (
    secretName: string,
    provider?: SecretProvider,
    options?: { ttl?: number; required?: boolean }
  ): Promise<string> => {
    const targetProvider = provider || this.defaultProvider;
    const cacheKey = `${targetProvider}:${secretName}`;

    // Check cache first
    const cached = this.getCachedSecret(cacheKey, options?.ttl);
    if (cached) {
      logger.debug('Secret retrieved from cache', { secretName, provider: targetProvider });
      return cached;
    }

    // Fetch from provider
    try {
      const secret = await this.fetchSecretFromProvider(secretName, targetProvider);

      if (!secret) {
        if (options?.required !== false) {
          throw new Error(`Secret '${secretName}' not found in provider '${targetProvider}'`);
        }
        logger.warn('Optional secret not found', { secretName, provider: targetProvider });
        return '';
      }

      // Cache the secret
      this.cacheSecret(cacheKey, secret, {
        name: secretName,
        provider: targetProvider,
        lastFetched: new Date(),
        ttl: options?.ttl || this.defaultTTL,
      });

      logger.info('Secret retrieved successfully', {
        secretName,
        provider: targetProvider,
        cached: true,
      });

      return secret;
    } catch (error) {
      logger.error('Failed to retrieve secret', { secretName, provider: targetProvider, error });
      throw error;
    }
  };

  /**
   * Get multiple secrets at once
   * @param secretNames - Array of secret names to retrieve
   * @param provider - Optional provider override
   * @returns Object with secret name as key and value as secret
   * @example
   * const secrets = await secretsManager.getSecrets(['API_KEY', 'DB_PASSWORD']);
   * console.log(secrets.API_KEY, secrets.DB_PASSWORD);
   */
  public getSecrets = async (
    secretNames: string[],
    provider?: SecretProvider
  ): Promise<Record<string, string>> => {
    const secrets: Record<string, string> = {};

    await Promise.all(
      secretNames.map(async name => {
        try {
          secrets[name] = await this.getSecret(name, provider, { required: false });
        } catch (error) {
          logger.warn('Failed to retrieve secret in batch', { secretName: name, error });
          secrets[name] = '';
        }
      })
    );

    return secrets;
  };

  /**
   * Clear cached secret
   * @param secretName - Name of the secret to clear from cache
   * @param provider - Optional provider override
   */
  public clearCache = (secretName?: string, provider?: SecretProvider): void => {
    if (!secretName) {
      this.cache.clear();
      logger.info('All secrets cleared from cache');
      return;
    }

    const targetProvider = provider || this.defaultProvider;
    const cacheKey = `${targetProvider}:${secretName}`;
    this.cache.delete(cacheKey);
    logger.debug('Secret cleared from cache', { secretName, provider: targetProvider });
  };

  /**
   * Rotate a secret (clear from cache to force fresh fetch)
   * @param secretName - Name of the secret to rotate
   * @param provider - Optional provider override
   */
  public rotateSecret = (secretName: string, provider?: SecretProvider): void => {
    this.clearCache(secretName, provider);
    logger.info('Secret rotated (cache cleared)', { secretName, provider });
  };

  /**
   * Fetch secret from the specified provider
   * @param secretName - Name of the secret
   * @param provider - Provider to fetch from
   * @returns Secret value or null if not found
   */
  private fetchSecretFromProvider = async (
    secretName: string,
    provider: SecretProvider
  ): Promise<string | null> => {
    switch (provider) {
      case 'env':
        return this.fetchFromEnvironment(secretName);
      case 'vault':
        return await this.fetchFromVault(secretName);
      case 'aws':
        return await this.fetchFromAWS(secretName);
      case 'azure':
        return await this.fetchFromAzure(secretName);
      case 'ci':
      case 'ado':
      case 'azure-devops':
      case 'github':
        return this.fetchFromCI(secretName, provider);
      default:
        throw new Error(`Unsupported secret provider: ${provider}`);
    }
  };

  /**
   * Fetch secret from environment variables
   * @param secretName - Environment variable name
   * @returns Secret value or null
   */
  private fetchFromEnvironment = (secretName: string): string | null => {
    const value = process.env[secretName];
    return value || null;
  };

  /**
   * Fetch secret from HashiCorp Vault
   * @param secretName - Secret path in Vault
   * @returns Secret value or null
   */
  private fetchFromVault = async (secretName: string): Promise<string | null> => {
    // TODO: Implement Vault integration
    // This requires installing 'node-vault' package
    // Example implementation:
    // const vault = require('node-vault')({ endpoint: vaultUrl, token: vaultToken });
    // const result = await vault.read(`secret/data/${secretName}`);
    // return result.data.data.value;

    logger.warn('Vault integration not yet implemented, falling back to environment', {
      secretName,
    });
    return this.fetchFromEnvironment(secretName);
  };

  /**
   * Fetch secret from AWS Secrets Manager
   * @param secretName - Secret name in AWS
   * @returns Secret value or null
   */
  private fetchFromAWS = async (secretName: string): Promise<string | null> => {
    // TODO: Implement AWS Secrets Manager integration
    // This requires installing '@aws-sdk/client-secrets-manager' package
    // Example implementation:
    // const client = new SecretsManagerClient({ region: 'us-east-1' });
    // const response = await client.send(new GetSecretValueCommand({ SecretId: secretName }));
    // return response.SecretString || null;

    logger.warn(
      'AWS Secrets Manager integration not yet implemented, falling back to environment',
      {
        secretName,
      }
    );
    return this.fetchFromEnvironment(secretName);
  };

  /**
   * Fetch secret from Azure Key Vault
   * @param secretName - Secret name in Azure Key Vault
   * @returns Secret value or null
   */
  private fetchFromAzure = async (secretName: string): Promise<string | null> => {
    const vaultUrl =
      this.getEnvironmentValue(['AZURE_KEY_VAULT_URL', 'AZURE_VAULT_URL']) ||
      (configManager.get('secrets.azure.keyVaultUrl', '') as string);
    const tenantId =
      this.getEnvironmentValue(['AZURE_TENANT_ID']) ||
      (configManager.get('secrets.azure.tenantId', '') as string);
    const clientId =
      this.getEnvironmentValue(['AZURE_CLIENT_ID']) ||
      (configManager.get('secrets.azure.clientId', '') as string);
    const clientSecret =
      this.getEnvironmentValue(['AZURE_CLIENT_SECRET']) ||
      (configManager.get('secrets.azure.clientSecret', '') as string);

    if (!vaultUrl || !tenantId || !clientId || !clientSecret) {
      logger.warn('Azure Key Vault configuration incomplete, falling back to environment', {
        secretName,
      });
      return this.fetchFromEnvironment(secretName);
    }

    try {
      const accessToken = await this.getAzureAccessToken({ tenantId, clientId, clientSecret });
      const normalizedVaultUrl = vaultUrl.replace(/\/$/, '');
      const response = await fetch(
        `${normalizedVaultUrl}/secrets/${encodeURIComponent(secretName)}?api-version=7.4`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        logger.warn('Azure Key Vault secret fetch failed, falling back to environment', {
          secretName,
          status: response.status,
        });
        return this.fetchFromEnvironment(secretName);
      }

      const payload = (await response.json()) as { value?: string };
      return payload.value || null;
    } catch (error) {
      logger.error('Azure Key Vault integration failed, falling back to environment', {
        secretName,
        error,
      });
      return this.fetchFromEnvironment(secretName);
    }
  };

  /**
   * Fetch secret from CI-hosted secret stores
   * @param secretName - Secret name exposed to the pipeline runtime
   * @param provider - Requested CI provider
   * @returns Secret value or null
   */
  private fetchFromCI = (secretName: string, provider: SecretProvider): string | null => {
    const resolvedProvider =
      provider === 'ci' ? this.detectCIProvider() : provider;

    logger.debug('Fetching secret from CI environment', {
      secretName,
      provider: resolvedProvider,
    });

    // GitHub Actions and Azure DevOps both expose mapped secrets as environment variables
    return this.fetchFromEnvironment(secretName);
  };

  /**
   * Detect the active CI provider from environment variables
   * @returns CI provider name for logging purposes
   */
  private detectCIProvider = (): 'github' | 'azure-devops' | 'ci' => {
    if (process.env.GITHUB_ACTIONS === 'true') {
      return 'github';
    }

    if (process.env.TF_BUILD === 'True' || process.env.TF_BUILD === 'true') {
      return 'azure-devops';
    }

    return 'ci';
  };

  /**
   * Reads the first populated environment variable from a list of names.
   * @param names - Candidate environment variable names
   * @returns Environment value or empty string
   */
  private getEnvironmentValue = (names: string[]): string => {
    for (const name of names) {
      const value = process.env[name];
      if (value) {
        return value;
      }
    }

    return '';
  };

  /**
   * Retrieves an Azure AD access token for Key Vault access.
   * @param credentials - Azure service principal credentials
   * @returns Access token string
   */
  private getAzureAccessToken = async (credentials: {
    tenantId: string;
    clientId: string;
    clientSecret: string;
  }): Promise<string> => {
    if (this.azureTokenCache && this.azureTokenCache.expiresAt > Date.now() + 60000) {
      return this.azureTokenCache.accessToken;
    }

    const tokenEndpoint = `https://login.microsoftonline.com/${credentials.tenantId}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      scope: 'https://vault.azure.net/.default',
      grant_type: 'client_credentials',
    });

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`Azure token request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
    };

    if (!payload.access_token) {
      throw new Error('Azure token response did not include an access token');
    }

    this.azureTokenCache = {
      accessToken: payload.access_token,
      expiresAt: Date.now() + (payload.expires_in || 3600) * 1000,
    };

    return payload.access_token;
  };

  /**
   * Get cached secret if valid
   * @param cacheKey - Cache key
   * @param ttl - Optional TTL override
   * @returns Cached secret value or null
   */
  private getCachedSecret = (cacheKey: string, ttl?: number): string | null => {
    const cached = this.cache.get(cacheKey);
    if (!cached) {
      return null;
    }

    const effectiveTTL = ttl || cached.metadata.ttl || this.defaultTTL;
    const age = Date.now() - cached.cachedAt.getTime();

    if (age > effectiveTTL) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.value;
  };

  /**
   * Cache a secret
   * @param cacheKey - Cache key
   * @param value - Secret value
   * @param metadata - Secret metadata
   */
  private cacheSecret = (cacheKey: string, value: string, metadata: SecretMetadata): void => {
    this.cache.set(cacheKey, {
      value,
      cachedAt: new Date(),
      metadata,
    });
  };
}

// Export singleton instance
export const secretsManager = SecretsManager.getInstance();

/**
 * Convenience function to get a secret
 * @param secretName - Name of the secret
 * @param provider - Optional provider override
 * @returns Secret value
 * @example
 * const apiKey = await getSecret('API_KEY');
 */
export const getSecret = async (secretName: string, provider?: SecretProvider): Promise<string> => {
  return await secretsManager.getSecret(secretName, provider);
};

/**
 * Convenience function to get multiple secrets
 * @param secretNames - Array of secret names
 * @param provider - Optional provider override
 * @returns Object with secret values
 * @example
 * const { API_KEY, DB_PASSWORD } = await getSecrets(['API_KEY', 'DB_PASSWORD']);
 */
export const getSecrets = async (
  secretNames: string[],
  provider?: SecretProvider
): Promise<Record<string, string>> => {
  return await secretsManager.getSecrets(secretNames, provider);
};
