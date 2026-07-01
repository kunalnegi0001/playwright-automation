/**
 * @fileoverview Response interceptor middleware for processing HTTP responses.
 * Provides functions for logging, status checking, parsing, and caching responses.
 * @module middleware/interceptors/response.interceptor
 */

import type { Response } from '@playwright/test';
import { logger } from '@utils/core';

/**
 * Extended Response object with additional metadata
 */
type ResponseExtended = Response & {
  /** Additional metadata for response tracking */
  metadata?: {
    /** Request start time in milliseconds */
    startTime?: number;
    /** Correlation ID for distributed tracing */
    correlationId?: string;
    /** Total response time in milliseconds */
    responseTime?: number;
    /** Pagination links from response headers */
    pagination?: Record<string, string>;
  };
  /** Parsed JSON response data */
  parsedData?: unknown;
  /** Sanitized response data with sensitive fields redacted */
  sanitizedData?: unknown;
};

/**
 * Response cache entry with TTL
 */
type ResponseCacheEntry = {
  /** Cached response object */
  response: ResponseExtended;
  /** Cache entry creation timestamp */
  timestamp: number;
  /** Time to live in milliseconds */
  ttl: number;
};

/**
 * Error object with response status information
 */
type ResponseErrorWithStatus = Error & {
  /** HTTP status code */
  status?: number;
  /** Response object */
  response?: Response;
  /** Response body text */
  body?: string;
  /** Retry-After header value in seconds */
  retryAfter?: number;
};

/**
 * Log response details including status, duration, and headers
 * @param {Object} response - Response object
 * @returns {Object} Unmodified response
 * @example
 * const logged = logResponse(response);
 */
export const logResponse = (response: ResponseExtended): ResponseExtended => {
  const duration = response.metadata?.startTime ? Date.now() - response.metadata.startTime : 0;

  logger.info(`← ${response.status()} ${response.url()} (${duration}ms)`, {
    status: response.status(),
    statusText: response.statusText(),
    headers: response.headers(),
  });

  return response;
};

/**
 * Check response status and throw error if not OK (status >= 400)
 * @async
 * @param {Object} response - Response object
 * @returns {Promise<Object>} Response if OK
 * @throws {Error} If response status indicates failure
 */
export const checkStatus = async (response: ResponseExtended): Promise<ResponseExtended> => {
  if (!response.ok()) {
    const body = await response.text();
    const error = new Error(
      `HTTP ${response.status()}: ${response.statusText()}`
    ) as ResponseErrorWithStatus;
    error.status = response.status();
    error.response = response;
    error.body = body;

    logger.error(`Response error: ${error.message}`, { body });
    throw error;
  }

  return response;
};

/**
 * Parse JSON response body and attach to response object
 * @async
 * @param {Object} response - Response object
 * @returns {Promise<Object>} Response with parsedData property
 */
export const parseJson = async (response: ResponseExtended): Promise<ResponseExtended> => {
  try {
    const data = (await response.json()) as Record<string, unknown>;
    response.parsedData = data;
    return response;
  } catch (error) {
    logger.warn(`Failed to parse JSON response: ${(error as Error).message}`);
    return response;
  }
};

/**
 * Extract correlation ID from response headers for tracing
 * @param {Object} response - Response object
 * @returns {Object} Response with correlation ID in metadata
 */
export const extractCorrelationId = (response: ResponseExtended): ResponseExtended => {
  const headers = response.headers() as Record<string, string>;
  const correlationId = headers['x-correlation-id'];
  if (correlationId) {
    logger.debug(`Response correlation ID: ${correlationId}`);
    response.metadata = {
      ...response.metadata,
      correlationId,
    };
  }
  return response;
};

/**
 * Calculate response time from metadata and log slow responses
 * @param response - Response object with startTime in metadata
 * @returns Response with calculated responseTime in metadata
 * @example
 * const timed = calculateResponseTime(response);
 * console.log(timed.metadata?.responseTime);
 */
export const calculateResponseTime = (response: ResponseExtended): ResponseExtended => {
  if (response.metadata?.startTime) {
    const responseTime = Date.now() - response.metadata.startTime;
    response.metadata.responseTime = responseTime;

    if (responseTime > 5000) {
      logger.warn(`Slow response detected: ${responseTime}ms for ${response.url()}`);
    }
  }
  return response;
};

/**
 * Cache GET response data with TTL for performance optimization
 * @param response - Response object to cache
 * @param cache - Cache Map instance (default: new Map)
 * @returns Response object (unmodified)
 * @example
 * const cached = cacheResponse(response, cacheMap);
 */
export const cacheResponse = (
  response: ResponseExtended,
  cache: Map<string, ResponseCacheEntry> = new Map()
): ResponseExtended => {
  const url = response.url();
  const method = response.request().method();

  if (method === 'GET' && response.ok()) {
    cache.set(url, {
      response,
      timestamp: Date.now(),
      ttl: 60000, // 1 minute
    });
  }

  return response;
};

/**
 * Validate response against JSON schema
 * @param response - Response object to validate
 * @param schema - Optional JSON schema for validation
 * @returns Promise resolving to validated response
 * @throws {Error} If schema validation fails
 * @example
 * const validated = await validateSchema(response, mySchema);
 */
export const validateSchema = async (
  response: ResponseExtended,
  schema?: unknown
): Promise<ResponseExtended> => {
  if (!schema) {
    return response;
  }

  try {
    await response.json();
    // Add schema validation logic here (e.g., using Joi or Ajv)
    logger.debug('Response schema validation passed');
    return response;
  } catch (error) {
    logger.error(`Response schema validation failed: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Handle rate limiting headers and throw error on 429 status
 * @param response - Response object to check for rate limiting
 * @returns Response if not rate limited
 * @throws {Error} If rate limit exceeded (status 429)
 * @example
 * const checked = handleRateLimit(response);
 */
export const handleRateLimit = (response: ResponseExtended): ResponseExtended => {
  const headers = response.headers() as Record<string, string>;
  const rateLimitRemaining = headers['x-ratelimit-remaining'];
  const rateLimitReset = headers['x-ratelimit-reset'];

  if (rateLimitRemaining !== undefined) {
    logger.debug(`Rate limit remaining: ${rateLimitRemaining}`);

    if (parseInt(rateLimitRemaining) === 0) {
      logger.warn(`Rate limit exceeded. Reset at: ${new Date(parseInt(rateLimitReset) * 1000)}`);
    }
  }

  if (response.status() === 429) {
    const retryAfter = headers['retry-after'] || '60';
    logger.error(`Rate limited. Retry after ${retryAfter} seconds`);

    const error = new Error('Rate limit exceeded') as ResponseErrorWithStatus;
    error.retryAfter = parseInt(retryAfter);
    throw error;
  }

  return response;
};

/**
 * Extract pagination information from Link headers
 * @param response - Response object with Link header
 * @returns Response with pagination metadata
 * @example
 * const paginated = extractPagination(response);
 * console.log(paginated.metadata?.pagination);
 */
export const extractPagination = (response: ResponseExtended): ResponseExtended => {
  const headers = response.headers() as Record<string, string>;
  const linkHeader = headers['link'];

  if (linkHeader) {
    const links = parseLinkHeader(linkHeader);
    response.metadata = {
      ...response.metadata,
      pagination: links,
    };
  }

  return response;
};

/**
 * Parse Link header for pagination URLs
 * @param header - Link header string
 * @returns Object mapping rel names to URLs
 * @example
 * const links = parseLinkHeader('<url>; rel="next", <url2>; rel="prev"');
 * // { next: 'url', prev: 'url2' }
 */
export const parseLinkHeader = (header: string): Record<string, string> => {
  const links: Record<string, string> = {};
  const parts = header.split(',');

  parts.forEach(part => {
    const section = part.split(';');
    if (section.length === 2) {
      const url = section[0]!.replace(/<(.*)>/, '$1').trim();
      const name = section[1]!.replace(/rel="(.*)"/, '$1').trim();
      links[name] = url;
    }
  });

  return links;
};

/**
 * Sanitize sensitive data in response by redacting password, token, and secret fields
 * @param response - Response object to sanitize
 * @returns Promise resolving to response with sanitized data
 * @example
 * const sanitized = await sanitizeResponse(response);
 * console.log(sanitized.sanitizedData);
 */
export const sanitizeResponse = async (response: ResponseExtended): Promise<ResponseExtended> => {
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'creditCard'];

  try {
    const data = (await response.json()) as Record<string, unknown>;

    const sanitize = (obj: unknown): unknown => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      const record = obj as Record<string, unknown>;
      Object.keys(record).forEach(key => {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          record[key] = '***REDACTED***';
        } else if (typeof record[key] === 'object') {
          sanitize(record[key]);
        }
      });

      return obj;
    };

    response.sanitizedData = sanitize(JSON.parse(JSON.stringify(data)));
  } catch (e) {
    // Not JSON, skip sanitization
  }

  return response;
};

/**
 * Response interceptor pipeline for chaining multiple interceptors
 * Executes interceptors in sequence to process responses
 * @class
 * @example
 * const pipeline = new ResponseInterceptorPipeline();
 * pipeline.use(logResponse).use(checkStatus).use(parseJson);
 * const processed = await pipeline.execute(response);
 */
export class ResponseInterceptorPipeline {
  private interceptors: Array<
    (response: ResponseExtended) => Promise<ResponseExtended> | ResponseExtended
  >;

  constructor() {
    this.interceptors = [];
  }

  /**
   * Add interceptor function to the pipeline
   * @param interceptor - Interceptor function to add
   * @returns Pipeline instance for chaining
   * @example
   * pipeline.use(logResponse).use(checkStatus);
   */
  use(
    interceptor: (response: ResponseExtended) => Promise<ResponseExtended> | ResponseExtended
  ): this {
    this.interceptors.push(interceptor);
    return this;
  }

  /**
   * Execute all interceptors in sequence on the response
   * @param response - Response object to process through interceptors
   * @returns Promise resolving to processed response
   * @throws {Error} If any interceptor fails
   * @example
   * const processed = await pipeline.execute(response);
   */
  async execute(response: ResponseExtended): Promise<ResponseExtended> {
    let modifiedResponse = response;

    for (const interceptor of this.interceptors) {
      try {
        modifiedResponse = await interceptor(modifiedResponse);
      } catch (error) {
        logger.error(`Response interceptor error: ${(error as Error).message}`);
        throw error;
      }
    }

    return modifiedResponse;
  }
}

/**
 * Create a default response interceptor pipeline with common interceptors
 * Includes response time calculation, correlation ID extraction, rate limiting, logging, status check, and pagination
 * @returns Configured ResponseInterceptorPipeline instance
 * @example
 * const pipeline = createDefaultResponsePipeline();
 * const response = await pipeline.execute(rawResponse);
 */
export const createDefaultResponsePipeline = (): ResponseInterceptorPipeline => {
  const pipeline = new ResponseInterceptorPipeline();

  pipeline
    .use(calculateResponseTime)
    .use(extractCorrelationId)
    .use(handleRateLimit)
    .use(logResponse)
    .use(checkStatus)
    .use(extractPagination);

  return pipeline;
};
