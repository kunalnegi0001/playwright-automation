/**
 * @fileoverview Request interceptor middleware for modifying outgoing HTTP requests.
 * Provides functions to add headers, correlation IDs, timestamps, and logging.
 * @module middleware/interceptors/request.interceptor
 */

import { logger } from '@utils/core';

/**
 * Request object for interceptor middleware
 */
export type RequestInterceptorRequest = {
  /** Request URL */
  url: string;
  /** HTTP method (GET, POST, PUT, DELETE, etc.) */
  method: string;
  /** Request headers */
  headers?: Record<string, string>;
  /** Request body data */
  postData?: string;
  /** Additional metadata for request tracking */
  metadata?: Record<string, unknown>;
};

/**
 * Function signature for request interceptors
 */
export type RequestInterceptorFunction = (
  request: RequestInterceptorRequest
) => RequestInterceptorRequest | Promise<RequestInterceptorRequest>;

/**
 * Add authentication bearer token to request headers
 * @param {Object} request - Request object
 * @param {string} token - Authentication token
 * @returns {Object} Modified request with auth header
 * @example
 * const authedRequest = addAuthHeader(request, 'eyJhbGciOi...');
 */
export const addAuthHeader = (
  request: RequestInterceptorRequest,
  token: string | null
): RequestInterceptorRequest => {
  if (token) {
    request.headers = {
      ...request.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return request;
};

/**
 * Add correlation ID to request for distributed tracing
 * @param {Object} request - Request object
 * @returns {Object} Modified request with correlation ID header
 * @example
 * const trackedRequest = addCorrelationId(request);
 */
export const addCorrelationId = (request: RequestInterceptorRequest): RequestInterceptorRequest => {
  const correlationId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  request.headers = {
    ...request.headers,
    'X-Correlation-ID': correlationId,
  };
  logger.debug(`Request correlation ID: ${correlationId}`);
  return request;
};

/**
 * Add timestamp metadata to request for performance tracking
 * @param {Object} request - Request object
 * @returns {Object} Modified request with timestamp metadata
 */
export const addTimestamp = (request: RequestInterceptorRequest): RequestInterceptorRequest => {
  request.metadata = {
    ...request.metadata,
    startTime: Date.now(),
    timestamp: new Date().toISOString(),
  };
  return request;
};

/**
 * Log outgoing request details
 * @param {Object} request - Request object
 * @returns {Object} Unmodified request
 */
export const logRequest = (request: RequestInterceptorRequest): RequestInterceptorRequest => {
  logger.info(`→ ${request.method} ${request.url}`, {
    headers: request.headers,
    body: request.postData,
  });
  return request;
};

/**
 * Add custom headers to request
 * @param {Object} request - Request object
 * @param {Object} [headers={}] - Custom headers to add
 * @returns {Object} Modified request with custom headers
 */
export const addCustomHeaders = (
  request: RequestInterceptorRequest,
  headers: Record<string, string> = {}
): RequestInterceptorRequest => {
  request.headers = {
    ...request.headers,
    ...headers,
  };
  return request;
};

/**
 * Sanitize sensitive data in request by redacting password, token, apiKey, and secret fields
 * @param request - Request object to sanitize
 * @returns Request with sensitive fields redacted
 * @example
 * const sanitized = sanitizeRequest(request);
 * // password, token fields will be '***REDACTED***'
 */
export const sanitizeRequest = (request: RequestInterceptorRequest): RequestInterceptorRequest => {
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];

  if (request.postData) {
    try {
      const body = JSON.parse(request.postData) as Record<string, unknown>;
      sensitiveFields.forEach(field => {
        if (body[field]) {
          body[field] = '***REDACTED***';
        }
      });
      request.postData = JSON.stringify(body);
    } catch (e) {
      // Not JSON, skip sanitization
    }
  }

  return request;
};

/**
 * Add request timeout metadata to track request timeout duration
 * @param request - Request object
 * @param timeout - Timeout duration in milliseconds (default: 30000)
 * @returns Request with timeout metadata
 * @example
 * const timedRequest = addTimeout(request, 5000);
 */
export const addTimeout = (
  request: RequestInterceptorRequest,
  timeout = 30000
): RequestInterceptorRequest => {
  request.metadata = {
    ...request.metadata,
    timeout,
  };
  return request;
};

/**
 * Validate request has required fields before sending
 * @param request - Request object to validate
 * @returns Validated request object
 * @throws {Error} When URL or method is missing
 * @example
 * const validated = validateRequest(request);
 */
export const validateRequest = (request: RequestInterceptorRequest): RequestInterceptorRequest => {
  if (!request.url) {
    throw new Error('Request URL is required');
  }

  if (!request.method) {
    throw new Error('Request method is required');
  }

  return request;
};

/**
 * Add retry metadata to request for retry logic tracking
 * @param request - Request object
 * @param maxRetries - Maximum number of retries (default: 3)
 * @returns Request with retry metadata
 * @example
 * const retryableRequest = addRetryMetadata(request, 5);
 */
export const addRetryMetadata = (
  request: RequestInterceptorRequest,
  maxRetries = 3
): RequestInterceptorRequest => {
  request.metadata = {
    ...request.metadata,
    maxRetries,
    currentRetry: 0,
  };
  return request;
};

/**
 * Request interceptor pipeline for chaining multiple interceptors
 * Executes interceptors in sequence to modify requests before sending
 * @class
 * @example
 * const pipeline = new RequestInterceptorPipeline();
 * pipeline.use(addAuth).use(addTimestamp).use(logRequest);
 * const modified = await pipeline.execute(request);
 */
export class RequestInterceptorPipeline {
  interceptors: RequestInterceptorFunction[];

  constructor() {
    this.interceptors = [];
  }

  /**
   * Add interceptor function to the pipeline
   * @param interceptor - Interceptor function to add
   * @returns Pipeline instance for chaining
   * @example
   * pipeline.use(addAuthHeader).use(addTimestamp);
   */
  use(interceptor: RequestInterceptorFunction): RequestInterceptorPipeline {
    this.interceptors.push(interceptor);
    return this;
  }

  /**
   * Execute all interceptors in sequence on the request
   * @param request - Request object to process through interceptors
   * @returns Promise resolving to modified request
   * @throws {Error} If any interceptor fails
   * @example
   * const modifiedRequest = await pipeline.execute(originalRequest);
   */
  async execute(request: RequestInterceptorRequest): Promise<RequestInterceptorRequest> {
    let modifiedRequest = request;

    for (const interceptor of this.interceptors) {
      try {
        modifiedRequest = await interceptor(modifiedRequest);
      } catch (error) {
        logger.error(
          `Request interceptor error: ${error instanceof Error ? error.message : String(error)}`
        );
        throw error;
      }
    }

    return modifiedRequest;
  }
}

/**
 * Create a default request interceptor pipeline with common interceptors
 * Includes validation, timestamp, correlation ID, auth, retry metadata, and logging
 * @param token - Optional authentication token
 * @returns Configured RequestInterceptorPipeline instance
 * @example
 * const pipeline = createDefaultRequestPipeline('bearer-token');
 * const request = await pipeline.execute(originalRequest);
 */
export const createDefaultRequestPipeline = (
  token: string | null = null
): RequestInterceptorPipeline => {
  const pipeline = new RequestInterceptorPipeline();

  pipeline
    .use(validateRequest)
    .use(addTimestamp)
    .use(addCorrelationId)
    .use(req => addAuthHeader(req, token))
    .use(addRetryMetadata)
    .use(logRequest);

  return pipeline;
};
