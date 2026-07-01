/**
 * API and service related errors
 */

import { BaseError, BaseErrorOptions } from './base-error';

/**
 * HTTP status code ranges
 */
export type HttpStatusCode =
  | 400 // Bad Request
  | 401 // Unauthorized
  | 403 // Forbidden
  | 404 // Not Found
  | 409 // Conflict
  | 422 // Unprocessable Entity
  | 429 // Too Many Requests
  | 500 // Internal Server Error
  | 502 // Bad Gateway
  | 503 // Service Unavailable
  | 504; // Gateway Timeout

/**
 * Error thrown during API/service operations
 */
export class APIError extends BaseError {
  /** HTTP status code if applicable */
  public readonly statusCode?: number;

  /** API endpoint that failed */
  public readonly endpoint?: string;

  /** HTTP method used */
  public readonly method?: string;

  /** Response body if available */
  public readonly responseBody?: unknown;

  constructor(
    message: string,
    statusCode?: number,
    endpoint?: string,
    options: BaseErrorOptions & {
      method?: string;
      responseBody?: unknown;
    } = {}
  ) {
    // Determine if error is retryable based on status code
    const isRetryable = statusCode ? [408, 429, 500, 502, 503, 504].includes(statusCode) : false;

    super(message, `API_ERROR_${statusCode || 'UNKNOWN'}`, {
      severity: statusCode && statusCode >= 500 ? 'high' : 'medium',
      classification: isRetryable ? 'retryable' : 'fatal',
      context: {
        ...options.context,
        metadata: {
          ...options.context?.metadata,
          statusCode,
          endpoint,
          method: options.method,
        },
      },
      ...options,
    });

    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.method = options.method;
    this.responseBody = options.responseBody;
  }
}

/**
 * Error thrown when API request times out
 */
export class APITimeoutError extends APIError {
  constructor(
    message: string,
    endpoint?: string,
    timeoutMs?: number,
    options: BaseErrorOptions = {}
  ) {
    super(`${message} (timeout: ${timeoutMs}ms)`, 504, endpoint, {
      severity: 'high',
      classification: 'retryable',
      context: {
        ...options.context,
        metadata: {
          ...options.context?.metadata,
          timeoutMs,
        },
      },
      ...options,
    });
  }
}

/**
 * Error thrown when API authentication fails
 */
export class APIAuthenticationError extends APIError {
  constructor(message: string, endpoint?: string, options: BaseErrorOptions = {}) {
    super(message, 401, endpoint, {
      severity: 'high',
      classification: 'configuration',
      ...options,
    });
  }
}

/**
 * Error thrown when API authorization fails
 */
export class APIAuthorizationError extends APIError {
  constructor(message: string, endpoint?: string, options: BaseErrorOptions = {}) {
    super(message, 403, endpoint, {
      severity: 'high',
      classification: 'configuration',
      ...options,
    });
  }
}

/**
 * Error thrown when API resource is not found
 */
export class APINotFoundError extends APIError {
  constructor(message: string, endpoint?: string, options: BaseErrorOptions = {}) {
    super(message, 404, endpoint, {
      severity: 'medium',
      classification: 'fatal',
      ...options,
    });
  }
}

/**
 * Error thrown when API rate limit is exceeded
 */
export class APIRateLimitError extends APIError {
  /** Time to wait before retrying (seconds) */
  public readonly retryAfter?: number;

  constructor(
    message: string,
    endpoint?: string,
    retryAfter?: number,
    options: BaseErrorOptions = {}
  ) {
    super(message, 429, endpoint, {
      severity: 'medium',
      classification: 'retryable',
      context: {
        ...options.context,
        metadata: {
          ...options.context?.metadata,
          retryAfter,
        },
      },
      ...options,
    });

    this.retryAfter = retryAfter;
  }
}

/**
 * Error thrown when API validation fails
 */
export class APIValidationError extends APIError {
  /** Validation errors from API */
  public readonly validationErrors?: Record<string, string[]>;

  constructor(
    message: string,
    endpoint?: string,
    validationErrors?: Record<string, string[]>,
    options: BaseErrorOptions = {}
  ) {
    super(message, 422, endpoint, {
      severity: 'medium',
      classification: 'configuration',
      context: {
        ...options.context,
        metadata: {
          ...options.context?.metadata,
          validationErrors,
        },
      },
      ...options,
    });

    this.validationErrors = validationErrors;
  }
}

/**
 * Error thrown when API response is invalid
 */
export class APIResponseError extends APIError {
  constructor(
    message: string,
    endpoint?: string,
    responseBody?: unknown,
    options: BaseErrorOptions = {}
  ) {
    super(message, undefined, endpoint, {
      severity: 'high',
      classification: 'fatal',
      responseBody,
      ...options,
    });
  }
}

/**
 * Error thrown for network connectivity issues
 */
export class NetworkError extends BaseError {
  constructor(message: string, options: BaseErrorOptions = {}) {
    super(message, 'NETWORK_ERROR', {
      severity: 'high',
      classification: 'retryable',
      ...options,
    });
  }
}
