/**
 * Base Error class for all custom framework errors
 * Provides structured error handling with context and classification
 */

import { logger } from '@utils/core';

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Error classification
 */
export type ErrorClassification = 'retryable' | 'fatal' | 'transient' | 'configuration';

/**
 * Error context information
 */
export type ErrorContext = {
  /** Timestamp when error occurred */
  timestamp?: Date;
  /** Test name or identifier */
  testName?: string;
  /** Browser/environment info */
  environment?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Stack trace from original error */
  originalStack?: string;
};

/**
 * Base error options
 */
export type BaseErrorOptions = {
  /** Error severity */
  severity?: ErrorSeverity;
  /** Error classification */
  classification?: ErrorClassification;
  /** Additional context */
  context?: ErrorContext;
  /** Original error that caused this */
  cause?: Error;
  /** Whether to log this error automatically */
  autoLog?: boolean;
};

/**
 * Base Error class for all framework errors
 * Extends native Error with additional context and classification
 */
export class BaseError extends Error {
  /** Error severity level */
  public readonly severity: ErrorSeverity;

  /** Error classification */
  public readonly classification: ErrorClassification;

  /** Additional error context */
  public readonly context: ErrorContext;

  /** Original error that caused this error */
  public readonly cause?: Error;

  /** Error code for programmatic handling */
  public readonly code: string;

  /** Whether this error should be retried */
  public readonly isRetryable: boolean;

  /**
   * Create a new BaseError
   * @param message - Error message
   * @param code - Error code for classification
   * @param options - Error options
   */
  constructor(message: string, code: string = 'UNKNOWN_ERROR', options: BaseErrorOptions = {}) {
    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.severity = options.severity || 'medium';
    this.classification = options.classification || 'fatal';
    this.context = {
      timestamp: new Date(),
      ...options.context,
    };
    this.cause = options.cause;
    this.isRetryable = this.classification === 'retryable' || this.classification === 'transient';

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Store original stack if cause exists
    if (this.cause) {
      this.context.originalStack = this.cause.stack;
    }

    // Auto-log if enabled (default: true)
    if (options.autoLog !== false) {
      this.logError();
    }
  }

  /**
   * Log this error with appropriate level based on severity
   */
  private logError = (): void => {
    const logData = {
      code: this.code,
      severity: this.severity,
      classification: this.classification,
      isRetryable: this.isRetryable,
      context: this.context,
      cause: this.cause?.message,
    };

    switch (this.severity) {
      case 'critical':
        logger.error(`[${this.code}] ${this.message}`, logData);
        break;
      case 'high':
        logger.error(`[${this.code}] ${this.message}`, logData);
        break;
      case 'medium':
        logger.warn(`[${this.code}] ${this.message}`, logData);
        break;
      case 'low':
        logger.info(`[${this.code}] ${this.message}`, logData);
        break;
    }
  };

  /**
   * Convert error to JSON for serialization
   * @returns JSON representation of error
   */
  public toJSON = (): Record<string, unknown> => {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      classification: this.classification,
      isRetryable: this.isRetryable,
      context: this.context,
      stack: this.stack,
      cause: this.cause?.message,
    };
  };

  /**
   * Get a user-friendly error message
   * @returns Formatted error message
   */
  public getUserMessage = (): string => {
    return `${this.message}${this.isRetryable ? ' (retryable)' : ''}`;
  };
}
