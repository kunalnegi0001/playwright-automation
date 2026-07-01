/**
 * @fileoverview Configuration manager for centralized application configuration.
 * Provides runtime config access, feature flags, and environment-specific settings.
 * @module config/config.manager
 */

import { validatedConfig } from './base.config';
const baseConfig = validatedConfig as Record<string, unknown>;

/**
 * Database configuration structure
 */
type ConfigDatabase = {
  /** Database host */
  host?: string;
  /** Database port */
  port?: number;
  /** Database name */
  database?: string;
  /** Database user */
  user?: string;
  /** Database password */
  password?: string;
  /** Additional database config properties */
  [key: string]: unknown;
};

/**
 * Authentication provider configuration
 */
type ConfigAuth = {
  /** OAuth/OIDC client ID */
  clientId?: string;
  /** OAuth/OIDC client secret */
  clientSecret?: string;
  /** Authorization server URL */
  authUrl?: string;
  /** Additional auth config properties */
  [key: string]: unknown;
};

/**
 * Test user credentials
 */
type ConfigTestUser = {
  /** Email address */
  email?: string;
  /** Username or email */
  username?: string;
  /** User password */
  password?: string;
  /** Additional user properties */
  [key: string]: unknown;
};

/**
 * Timeout configuration values
 */
type ConfigTimeout = {
  /** Default timeout in milliseconds */
  default: number | undefined;
  /** Navigation timeout in milliseconds */
  navigation: number | undefined;
  /** Action timeout in milliseconds */
  action: number | undefined;
};

/**
 * Configuration Manager
 * Centralized access to all configuration values
 * Supports runtime config updates, feature flag checks, and environment management
 * @class
 * @example
 * const url = configManager.get('baseURL');
 * if (configManager.isFeatureEnabled('visualTesting')) { ... }
 */
class ConfigManager {
  config: Record<string, unknown>;
  projectConfig: Record<string, unknown> | null;
  environment: string | undefined;
  constructor() {
    this.config = { ...baseConfig };
    this.projectConfig = null;
  }

  /**
   * Get entire configuration object
   * @returns {Object} Complete configuration object (shallow copy)
   * @example
   * const config = configManager.getAll();
   * console.log(config.baseURL);
   */
  getAll(): Record<string, unknown> {
    return { ...this.config };
  }

  /**
   * Get specific configuration value using dot notation
   * @param {string} key - Configuration key (supports dot notation)
   * @param {*} [defaultValue=undefined] - Default value if key not found
   * @returns {*} Configuration value or default value
   * @example
   * const url = configManager.get('baseURL');
   * const host = configManager.get('database.postgres.host', 'localhost');
   * const timeout = configManager.get('timeouts.navigation', 30000);
   */
  get<T = unknown>(key: string, defaultValue: T | undefined = undefined): T | undefined {
    const keys = key.split('.');
    let value: unknown = this.config;

    for (const k of keys) {
      if (value && typeof value === 'object' && !Array.isArray(value) && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return defaultValue;
      }
    }

    return value !== undefined ? (value as T) : defaultValue;
  }

  /**
   * Set configuration value at runtime using dot notation
   * @param {string} key - Configuration key (supports dot notation)
   * @param {*} value - Value to set
   * @returns {void}
   * @example
   * configManager.set('features.visualTesting', false);
   * configManager.set('timeouts.action', 5000);
   * configManager.set('database.postgres.host', 'localhost');
   */
  set(key: string, value: unknown): void {
    const keys = key.split('.');
    const lastKey = keys.pop();
    if (!lastKey) {
      return;
    }

    let target: Record<string, unknown> = this.config;

    for (const k of keys) {
      if (!(k in target)) {
        target[k] = {};
      }
      target = target[k] as Record<string, unknown>;
    }

    target[lastKey] = value;
  }

  /**
   * Check if a feature flag is enabled
   * @param {string} featureName - Feature name to check
   * @returns {boolean} True if feature is enabled, false otherwise
   * @example
   * if (configManager.isFeatureEnabled('visualTesting')) {
   *   await runVisualTests();
   * }
   */
  isFeatureEnabled(featureName: string): boolean {
    return this.get<boolean>(`features.${featureName}`, false) ?? false;
  }

  /**
   * Get current environment name
   * @returns {string} Environment name (e.g., 'development', 'staging', 'production')
   * @example
   * const env = configManager.getEnvironment();
   */
  getEnvironment(): string {
    return this.get<string>('env', 'development') ?? 'development';
  }

  /**
   * Check if running in CI/CD environment
   * @returns {boolean} True if running in CI, false otherwise
   * @example
   * if (configManager.isCI()) {
   *   console.log('Running in CI pipeline');
   * }
   */
  isCI(): boolean {
    return process.env.CI === 'true';
  }

  /**
   * Get base URL for web application
   * @returns {string} Base URL
   * @example
   * const baseUrl = configManager.getBaseURL();
   * await page.goto(`${baseUrl}/login`);
   */
  getBaseURL(): string | undefined {
    return this.get<string>('baseURL');
  }

  /**
   * Get API base URL for backend services
   * @returns {string} API base URL
   * @example
   * const apiUrl = configManager.getAPIBaseURL();
   * await fetch(`${apiUrl}/users`);
   */
  getAPIBaseURL(): string | undefined {
    return this.get<string>('apiBaseURL');
  }

  /**
   * Get GraphQL endpoint URL
   * @returns {string} GraphQL endpoint
   * @example
   * const endpoint = configManager.getGraphQLEndpoint();
   */
  getGraphQLEndpoint(): string | undefined {
    return this.get<string>('graphqlEndpoint');
  }

  /**
   * Get all timeout values
   * @returns {Object} Object containing timeout values
   * @returns {number} returns.default - Default timeout in milliseconds
   * @returns {number} returns.navigation - Navigation timeout in milliseconds
   * @returns {number} returns.action - Action timeout in milliseconds
   * @example
   * const timeouts = configManager.getTimeouts();
   * await page.goto(url, { timeout: timeouts.navigation });
   */
  getTimeouts(): ConfigTimeout {
    return {
      default: this.get<number>('defaultTimeout'),
      navigation: this.get<number>('navigationTimeout'),
      action: this.get<number>('actionTimeout'),
    };
  }

  /**
   * Get database configuration for specific database type
   * @param {string} [type='postgres'] - Database type ('postgres', 'mysql', 'mongodb', etc.)
   * @returns {Object} Database configuration object
   * @example
   * const pgConfig = configManager.getDatabase('postgres');
   * const client = new Client(pgConfig);
   */
  getDatabase(type = 'postgres'): ConfigDatabase {
    return this.get<ConfigDatabase>(`database.${type}`, {}) ?? {};
  }

  /**
   * Get authentication configuration for specific provider
   * @param {string} provider - Auth provider name (e.g., 'oauth', 'saml', 'local')
   * @returns {Object} Authentication configuration
   * @example
   * const oauthConfig = configManager.getConfigAuth('oauth');
   */
  getConfigAuth(provider: string): ConfigAuth {
    return this.get<ConfigAuth>(`auth.${provider}`, {}) ?? {};
  }

  /**
   * Get test user credentials by role
   * @param {string} [role='standard'] - User role ('admin', 'standard', 'readonly', etc.)
   * @returns {Object} Test user credentials object
   * @returns {string} returns.username - Username
   * @returns {string} returns.password - Password
   * @example
   * const admin = configManager.getConfigTestUser('admin');
   * await loginPage.login(admin.username, admin.password);
   */
  getConfigTestUser(role = 'standard'): ConfigTestUser {
    return this.get<ConfigTestUser>(`testUsers.${role}`, {}) ?? {};
  }

  /**
   * Get reporting configuration
   * @returns {Object} Reporting configuration object
   * @example
   * const reporting = configManager.getReportingConfig();
   * if (reporting.allure.enabled) { ... }
   */
  getReportingConfig(): Record<string, unknown> {
    return this.get<Record<string, unknown>>('reporting', {}) ?? {};
  }

  /**
   * Get performance budget thresholds
   * @returns {Object} Performance budgets and thresholds
   * @example
   * const budgets = configManager.getPerformanceBudgets();
   * expect(loadTime).toBeLessThan(budgets.pageLoad);
   */
  getPerformanceBudgets(): Record<string, unknown> {
    return this.get<Record<string, unknown>>('performance', {}) ?? {};
  }

  /**
   * Get compliance and security settings
   * @returns {Object} Compliance configuration
   * @example
   * const compliance = configManager.getComplianceConfig();
   */
  getComplianceConfig(): Record<string, unknown> {
    return this.get<Record<string, unknown>>('compliance', {}) ?? {};
  }

  /**
   * Load project-specific configuration and merge with base config
   * @param {string} projectName - Project name matching config file name
   * @returns {Promise<void>}
   * @throws {Error} If config file cannot be loaded
   * @example
   * await configManager.loadProjectConfig('ecommerce');
   * // Loads ./projects/ecommerce.config.js
   */
  async loadProjectConfig(projectName: string): Promise<void> {
    try {
      const projectConfigModule = (await import(`./projects/${projectName}.config.js`)) as {
        default?: Record<string, unknown>;
      };
      this.projectConfig = (projectConfigModule.default || projectConfigModule) as Record<
        string,
        unknown
      >;

      // Merge project config with base config
      this.config = this.mergeConfigs(this.config, this.projectConfig);

      console.log(`Loaded project configuration: ${projectName}`);
    } catch {
      console.log(`No project-specific config found for ${projectName}, using base config`);
    }
  }

  /**
   * Deep merge two configuration objects
   * @param {Object} target - Target configuration object
   * @param {Object} source - Source configuration to merge
   * @returns {Object} Merged configuration object
   * @example
   * const merged = configManager.mergeConfigs(baseConfig, projectConfig);
   */
  mergeConfigs(
    target: Record<string, unknown>,
    source: Record<string, unknown>
  ): Record<string, unknown> {
    const output = { ...target };

    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = this.mergeConfigs(
              target[key] as Record<string, unknown>,
              source[key] as Record<string, unknown>
            );
          }
        } else {
          output[key] = source[key];
        }
      });
    }

    return output;
  }

  /**
   * Check if value is a plain object
   * @param {*} item - Value to check
   * @returns {boolean} True if item is a plain object
   * @private
   */
  isObject(item: unknown): item is Record<string, unknown> {
    return item !== null && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Get all feature flags
   * @returns {Object} Object containing all feature flags
   * @example
   * const features = configManager.getFeatures();
   * console.log(features.visualTesting); // true/false
   */
  getFeatures(): Record<string, unknown> {
    return this.get<Record<string, unknown>>('features', {}) ?? {};
  }

  /**
   * Print configuration to console (with sensitive data redacted)
   * @returns {void}
   * @example
   * configManager.printConfig();
   * // Outputs sanitized configuration to console
   */
  printConfig(): void {
    const sanitized = this.sanitizeConfig(this.config);
    console.log('Current Configuration:');
    console.log(JSON.stringify(sanitized, null, 2));
  }

  /**
   * Remove sensitive data from configuration object
   * @param {Object} config - Configuration object to sanitize
   * @returns {Object} Sanitized configuration with secrets redacted
   * @private
   * @example
   * const safe = configManager.sanitizeConfig(config);
   * // Replaces password, secret, key, token fields with '***REDACTED***'
   */
  sanitizeConfig(config: Record<string, unknown>): Record<string, unknown> {
    const sensitive = ['password', 'secret', 'key', 'token', 'clientSecret'];
    const sanitized = JSON.parse(JSON.stringify(config)) as Record<string, unknown>;

    const recursiveSanitize = (obj: Record<string, unknown>): void => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          recursiveSanitize(obj[key] as Record<string, unknown>);
        } else if (sensitive.some(s => key.toLowerCase().includes(s))) {
          obj[key] = '***REDACTED***';
        }
      }
    };

    recursiveSanitize(sanitized);
    return sanitized;
  }
}

/**
 * Singleton instance of ConfigManager
 * Provides centralized access to application configuration
 * @example
 * import configManager from '@config/config.manager';
 * const baseUrl = configManager.getBaseURL();
 */
const configManager = new ConfigManager();

export { ConfigManager, configManager };
