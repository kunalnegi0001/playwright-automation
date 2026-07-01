/**
 * Custom error classes barrel export
 *
 * Usage:
 * ```typescript
 * import { TestError, APIError, AuthError } from '@/resources/errors';
 *
 * throw new TestError('Test failed', 'TEST_001', { severity: 'high' });
 * throw new APIError('API request failed', 500, '/api/users');
 * throw new AuthError('Login failed', 'AUTH_001');
 * ```
 */

// Base error
import { BaseError as BaseErrorClass } from './base-error';
export { BaseError } from './base-error';
export type {
  ErrorSeverity,
  ErrorClassification,
  ErrorContext,
  BaseErrorOptions,
} from './base-error';

// Test errors
export {
  TestError,
  TestSetupError,
  TestTeardownError,
  TestTimeoutError,
  AssertionError,
  TestDataError,
  ElementError,
  NavigationError,
} from './test-error';

// API errors
export {
  APIError,
  APITimeoutError,
  APIAuthenticationError,
  APIAuthorizationError,
  APINotFoundError,
  APIRateLimitError,
  APIValidationError,
  APIResponseError,
  NetworkError,
} from './api-error';
export type { HttpStatusCode } from './api-error';

// Auth errors
export {
  AuthError,
  LoginError,
  LogoutError,
  TokenError,
  SessionError,
  MultiFactorAuthError,
  OAuthError,
  PermissionDeniedError,
} from './auth-error';

// Configuration errors
export { ConfigurationError, EnvironmentError, DependencyError } from './configuration-error';

/**
 * Type guard to check if error is one of our custom errors
 * @param error - Error to check
 * @returns True if error is a BaseError instance
 * @example
 * if (isFrameworkError(error)) {
 *   console.log(error.code, error.severity);
 * }
 */
export const isFrameworkError = (error: unknown): error is BaseErrorClass => {
  return error instanceof BaseErrorClass;
};

/**
 * Type guard to check if error is retryable
 * @param error - Error to check
 * @returns True if error should be retried
 * @example
 * if (isRetryableError(error)) {
 *   await retryOperation();
 * }
 */
export const isRetryableError = (error: unknown): boolean => {
  if (isFrameworkError(error)) {
    return error.isRetryable;
  }
  return false;
};

/**
 * Get error code from any error
 * @param error - Error to get code from
 * @returns Error code or 'UNKNOWN_ERROR'
 * @example
 * const code = getErrorCode(error); // 'API_ERROR_500'
 */
export const getErrorCode = (error: unknown): string => {
  if (isFrameworkError(error)) {
    return error.code;
  }
  return 'UNKNOWN_ERROR';
};

/**
 * Convert any error to framework error
 * @param error - Error to convert
 * @param defaultMessage - Default message if error has no message
 * @returns BaseError instance
 * @example
 * try {
 *   // some operation
 * } catch (error) {
 *   throw toFrameworkError(error, 'Operation failed');
 * }
 */
export const toFrameworkError = (
  error: unknown,
  defaultMessage: string = 'An error occurred'
): BaseErrorClass => {
  if (isFrameworkError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new BaseErrorClass(error.message || defaultMessage, 'WRAPPED_ERROR', {
      cause: error,
      autoLog: false,
    });
  }

  return new BaseErrorClass(defaultMessage, 'UNKNOWN_ERROR', {
    context: {
      metadata: { originalError: error },
    },
    autoLog: false,
  });
};
