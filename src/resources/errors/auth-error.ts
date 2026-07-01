/**
 * Authentication and authorization related errors
 */

import { BaseError, BaseErrorOptions } from './base-error';

/**
 * Base authentication error
 */
export class AuthError extends BaseError {
  constructor(message: string, code: string = 'AUTH_ERROR', options: BaseErrorOptions = {}) {
    super(message, code, {
      severity: 'high',
      classification: 'configuration',
      ...options,
    });
  }
}

/**
 * Error thrown when login fails
 */
export class LoginError extends AuthError {
  constructor(message: string, username?: string, options: BaseErrorOptions = {}) {
    super(message, 'LOGIN_ERROR', {
      context: {
        ...options.context,
        metadata: {
          ...options.context?.metadata,
          username,
        },
      },
      ...options,
    });
  }
}

/**
 * Error thrown when logout fails
 */
export class LogoutError extends AuthError {
  constructor(message: string, options: BaseErrorOptions = {}) {
    super(message, 'LOGOUT_ERROR', options);
  }
}

/**
 * Error thrown when token is invalid or expired
 */
export class TokenError extends AuthError {
  constructor(message: string, tokenType?: string, options: BaseErrorOptions = {}) {
    super(message, 'TOKEN_ERROR', {
      context: {
        ...options.context,
        metadata: {
          ...options.context?.metadata,
          tokenType,
        },
      },
      ...options,
    });
  }
}

/**
 * Error thrown when session expires or is invalid
 */
export class SessionError extends AuthError {
  constructor(message: string, options: BaseErrorOptions = {}) {
    super(message, 'SESSION_ERROR', {
      classification: 'retryable',
      ...options,
    });
  }
}

/**
 * Error thrown when MFA/2FA fails
 */
export class MultiFactorAuthError extends AuthError {
  constructor(message: string, options: BaseErrorOptions = {}) {
    super(message, 'MFA_ERROR', options);
  }
}

/**
 * Error thrown when OAuth flow fails
 */
export class OAuthError extends AuthError {
  constructor(message: string, provider?: string, options: BaseErrorOptions = {}) {
    super(message, 'OAUTH_ERROR', {
      context: {
        ...options.context,
        metadata: {
          ...options.context?.metadata,
          provider,
        },
      },
      ...options,
    });
  }
}

/**
 * Error thrown when permission is denied
 */
export class PermissionDeniedError extends AuthError {
  constructor(message: string, resource?: string, action?: string, options: BaseErrorOptions = {}) {
    super(message, 'PERMISSION_DENIED', {
      context: {
        ...options.context,
        metadata: {
          ...options.context?.metadata,
          resource,
          action,
        },
      },
      ...options,
    });
  }
}
