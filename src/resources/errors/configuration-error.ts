/**
 * Configuration related errors
 */

import { BaseError, BaseErrorOptions } from './base-error';

/**
 * Error thrown when configuration is invalid or missing
 */
export class ConfigurationError extends BaseError {
  /** Configuration key that caused the error */
  public readonly configKey?: string;

  constructor(message: string, configKey?: string, options: BaseErrorOptions = {}) {
    super(message, 'CONFIGURATION_ERROR', {
      severity: 'critical',
      classification: 'configuration',
      context: {
        ...options.context,
        metadata: {
          ...options.context?.metadata,
          configKey,
        },
      },
      ...options,
    });

    this.configKey = configKey;
  }
}

/**
 * Error thrown when environment variable is missing or invalid
 */
export class EnvironmentError extends ConfigurationError {
  constructor(message: string, envVar?: string, options: BaseErrorOptions = {}) {
    super(message, envVar, {
      context: {
        ...options.context,
        metadata: {
          ...options.context?.metadata,
          envVar,
        },
      },
      ...options,
    });
    this.name = 'EnvironmentError';
  }
}

/**
 * Error thrown when required dependency is missing
 */
export class DependencyError extends ConfigurationError {
  constructor(message: string, dependency?: string, options: BaseErrorOptions = {}) {
    super(message, dependency, {
      context: {
        ...options.context,
        metadata: {
          ...options.context?.metadata,
          dependency,
        },
      },
      ...options,
    });
    this.name = 'DependencyError';
  }
}
