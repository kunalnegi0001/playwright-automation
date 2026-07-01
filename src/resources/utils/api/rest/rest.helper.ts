/**
 * @fileoverview Advanced REST API testing utilities.
 * Provides parallel execution, batch processing, rate limiting, retries, and polling.
 * @module api-testing/rest/rest.helper
 */

import { logger } from '@utils/core';

/**
 * Options for parallel request execution
 */
export type RESTParallelOptions = {
  /** Maximum number of concurrent requests */
  maxConcurrent?: number;
  /** Whether to continue execution if a request fails */
  continueOnError?: boolean;
  /** Timeout per request in milliseconds */
  timeout?: number;
};

/**
 * Result of parallel request execution
 */
export type RESTParallelResult = {
  /** Successfully completed requests with their results */
  successful: Array<{ index: number; result: unknown }>;
  /** Failed requests with error messages */
  failed: Array<{ index: number; error: string }>;
  /** Total number of requests executed */
  total: number;
};

/**
 * Options for batch request execution
 */
export type RESTBatchOptions = {
  /** Number of requests per batch */
  batchSize?: number;
  /** Delay between batches in milliseconds */
  delayBetweenBatches?: number;
  /** Stop execution if entire batch fails */
  stopOnBatchError?: boolean;
};

/**
 * Result of batch request execution
 */
export type RESTBatchResult = {
  /** Successfully completed requests with their results */
  successful: Array<{ index: number; result: unknown }>;
  /** Failed requests with error messages */
  failed: Array<{ index: number; error: string | undefined }>;
  /** Number of batches executed */
  batches: number;
};

/**
 * Options for request retry logic
 */
export type RESTRetryOptions = {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Base delay between retries in milliseconds */
  retryDelay?: number;
  /** Backoff strategy: 'fixed', 'exponential', or 'linear' */
  backoffStrategy?: string;
  /** HTTP status codes that trigger retry */
  retryOnStatus?: number[];
  /** Custom function to determine if retry should occur */
  shouldRetry?: ((result: unknown, attempt: number) => boolean) | null;
};

/**
 * Options for rate limiting requests
 */
export type RESTRateLimitOptions = {
  /** Maximum requests per second */
  requestsPerSecond?: number;
  /** Maximum requests per minute */
  requestsPerMinute?: number;
};

/**
 * Options for API polling operations
 */
export type RESTPollOptions = {
  /** Polling interval in milliseconds */
  interval?: number;
  /** Maximum polling time in milliseconds */
  timeout?: number;
  /** Maximum number of polling attempts */
  maxAttempts?: number;
};

/**
 * Result containing request timing information
 */
export type RESTTimeResult = {
  /** Request result data */
  result: unknown;
  /** Request duration in milliseconds */
  duration: number;
  /** Request start timestamp */
  startTime: number;
  /** Request end timestamp */
  endTime: number;
};

/**
 * Options for circuit breaker pattern
 */
export type RESTCircuitBreakerOptions = {
  /** Number of failures before opening circuit */
  failureThreshold?: number;
  /** Number of successes to close circuit */
  successThreshold?: number;
  /** Timeout before attempting reset in milliseconds */
  timeout?: number;
  /** Unique identifier for circuit breaker instance */
  breakerId?: string;
};

/**
 * Current state of circuit breaker
 */
export type RESTCircuitBreakerState = {
  /** Circuit state: 'OPEN', 'CLOSED', or 'HALF_OPEN' */
  state: string;
  /** Number of consecutive failures */
  failures: number;
  /** Number of consecutive successes */
  successes: number;
  /** Timestamp for next attempt when circuit is open */
  nextAttempt: number;
};

/**
 * Options for request caching
 */
export type RESTCacheOptions = {
  /** Unique cache key identifier */
  cacheKey?: string;
  /** Time to live in milliseconds */
  ttl?: number;
  /** Force cache refresh */
  forceRefresh?: boolean;
};

/**
 * Cache entry structure
 */
export type RESTCacheEntry = {
  /** Cached data */
  data: unknown;
  /** Expiry timestamp */
  expiry: number;
};

/**
 * Options for aggregating multiple requests
 */
export type RESTAggregateOptions = {
  /** Execute requests in parallel */
  parallel?: boolean;
  /** Continue execution on error */
  continueOnError?: boolean;
};

type RequestFunction = () => Promise<unknown>;
type ChainFunction = (previousResult: unknown) => Promise<unknown>;

/**
 * @fileoverview Advanced REST API helper functions for testing
 * Provides utilities for batch requests, parallel execution, rate limiting, retries
 * @module rest.helper
 */

/**
 * Execute multiple API requests in parallel
 * @param {Array<Function>} requests - Array of functions that return promises
 * @param {Object} options - Parallel execution options
 * @param {number} options.maxConcurrent - Maximum concurrent requests (default: 5)
 * @param {boolean} options.continueOnError - Continue if a request fails (default: true)
 * @param {number} options.timeout - Timeout per request in ms (default: 30000)
 * @returns {Promise<Object>} Results with successful and failed requests
 * @example
 * const requests = [
 *   () => fetch('/api/users/1'),
 *   () => fetch('/api/users/2'),
 *   () => fetch('/api/users/3')
 * ];
 * const results = await executeParallel(requests, { maxConcurrent: 2 });
 * console.log(results.successful.length); // Number of successful requests
 */
export const executeParallel = async (
  requests: RequestFunction[],
  options: RESTParallelOptions = {}
): Promise<RESTParallelResult> => {
  const { maxConcurrent = 5, continueOnError = true, timeout = 30000 } = options;

  try {
    const results: RESTParallelResult = { successful: [], failed: [], total: requests.length };
    const executing: Promise<void>[] = [];

    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];

      const promise = (async () => {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          );
          const result = await Promise.race([request(), timeoutPromise]);
          results.successful.push({ index: i, result });
        } catch (error) {
          results.failed.push({ index: i, error: (error as Error).message });
          if (!continueOnError) {
            throw error;
          }
        }
      })();

      executing.push(promise);

      if (executing.length >= maxConcurrent) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex(p => p === promise),
          1
        );
      }
    }

    await Promise.all(executing);
    logger.info(
      `Parallel execution completed: ${results.successful.length}/${results.total} successful`
    );
    return results;
  } catch (error) {
    logger.error(`Parallel execution failed: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Execute API requests in batches
 * @param {Array<Function>} requests - Array of functions that return promises
 * @param {Object} options - Batch execution options
 * @param {number} options.batchSize - Number of requests per batch (default: 10)
 * @param {number} options.delayBetweenBatches - Delay between batches in ms (default: 1000)
 * @param {boolean} options.stopOnBatchError - Stop if entire batch fails (default: false)
 * @returns {Promise<Object>} Results with batch details
 * @example
 * const requests = Array(50).fill(null).map((_, i) => () => fetch(`/api/items/${i}`));
 * const results = await executeBatch(requests, { batchSize: 10, delayBetweenBatches: 500 });
 * console.log(`Completed ${results.batches} batches`);
 */
export const executeBatch = async (
  requests: RequestFunction[],
  options: RESTBatchOptions = {}
): Promise<RESTBatchResult> => {
  const { batchSize = 10, delayBetweenBatches = 1000, stopOnBatchError = false } = options;

  try {
    const results: RESTBatchResult = { successful: [], failed: [], batches: 0 };

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      results.batches++;

      try {
        const batchResults = await Promise.allSettled(batch.map(req => req()));

        batchResults.forEach((result, idx) => {
          if (result.status === 'fulfilled') {
            results.successful.push({ index: i + idx, result: result.value });
          } else {
            results.failed.push({ index: i + idx, error: (result.reason as Error)?.message });
          }
        });

        if (i + batchSize < requests.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      } catch (error) {
        logger.error(`Batch ${results.batches} failed: ${(error as Error).message}`);
        if (stopOnBatchError) {
          throw error;
        }
      }
    }

    logger.info(
      `Batch execution completed: ${results.batches} batches, ${results.successful.length} successful`
    );
    return results;
  } catch (error) {
    logger.error(`Batch execution failed: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Execute API request with retry logic
 * @param {Function} requestFn - Function that returns a promise
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @param {number} options.retryDelay - Delay between retries in ms (default: 1000)
 * @param {string} options.backoffStrategy - Backoff strategy: 'fixed', 'exponential', 'linear' (default: 'exponential')
 * @param {Array<number>} options.retryOnStatus - HTTP status codes to retry on (default: [429, 500, 502, 503, 504])
 * @param {Function} options.shouldRetry - Custom retry condition function
 * @returns {Promise<any>} Request result
 * @example
 * const response = await retryRequest(
 *   () => fetch('/api/data'),
 *   { maxRetries: 5, backoffStrategy: 'exponential', retryOnStatus: [429, 503] }
 * );
 */
export const retryRequest = async (
  requestFn: RequestFunction,
  options: RESTRetryOptions = {}
): Promise<unknown> => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffStrategy = 'exponential',
    retryOnStatus = [429, 500, 502, 503, 504],
    shouldRetry = null,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await requestFn();

      // Check if custom retry condition is met
      if (shouldRetry && shouldRetry(result, attempt)) {
        throw new Error('Custom retry condition met');
      }

      // Check HTTP status for retry
      const resultObj = result as Record<string, unknown>;
      if (resultObj?.status && retryOnStatus.includes(resultObj.status as number)) {
        throw new Error(`HTTP ${resultObj.status} - retrying`);
      }

      if (attempt > 0) {
        logger.info(`Request succeeded on attempt ${attempt + 1}`);
      }
      return result;
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        let delay = retryDelay;

        if (backoffStrategy === 'exponential') {
          delay = retryDelay * Math.pow(2, attempt);
        } else if (backoffStrategy === 'linear') {
          delay = retryDelay * (attempt + 1);
        }

        logger.warn(
          `Request failed (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  logger.error(`Request failed after ${maxRetries + 1} attempts: ${lastError?.message}`);
  throw lastError;
};

/**
 * Rate limiter for API requests
 * @param {Array<Function>} requests - Array of functions that return promises
 * @param {Object} options - Rate limiting options
 * @param {number} options.requestsPerSecond - Maximum requests per second (default: 10)
 * @param {number} options.requestsPerMinute - Maximum requests per minute (default: 600)
 * @returns {Promise<Array>} Array of results
 * @example
 * const requests = Array(100).fill(null).map((_, i) => () => fetch(`/api/items/${i}`));
 * const results = await rateLimitRequests(requests, { requestsPerSecond: 5 });
 */
export const rateLimitRequests = async (
  requests: RequestFunction[],
  options: RESTRateLimitOptions = {}
): Promise<unknown[]> => {
  const { requestsPerSecond = 10, requestsPerMinute = 600 } = options;

  try {
    const results: unknown[] = [];
    const delayBetweenRequests = 1000 / requestsPerSecond;
    const startTime = Date.now();
    let requestCount = 0;

    for (const request of requests) {
      // Check if we've exceeded per-minute limit
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      if (requestCount >= requestsPerMinute * Math.ceil(elapsedMinutes)) {
        const waitTime = Math.ceil(elapsedMinutes) * 60000 - (Date.now() - startTime);
        logger.info(`Rate limit reached. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      const result = await request();
      results.push(result);
      requestCount++;

      // Delay between requests to maintain rate
      await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
    }

    logger.info(`Rate-limited execution completed: ${results.length} requests`);
    return results;
  } catch (error) {
    logger.error(`Rate-limited execution failed: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Chain multiple API requests where each depends on the previous
 * @param {Array<Function>} requests - Array of functions that take previous result
 * @param {any} initialValue - Initial value to pass to first request
 * @returns {Promise<Array>} Array of all results
 * @example
 * const results = await chainRequests([
 *   () => fetch('/api/user'),
 *   (user) => fetch(`/api/user/${user.id}/orders`),
 *   (orders) => fetch(`/api/orders/${orders[0].id}/details`)
 * ]);
 */
export const chainRequests = async (
  requests: ChainFunction[],
  initialValue: unknown = null
): Promise<unknown[]> => {
  try {
    const results: unknown[] = [];
    let currentValue: unknown = initialValue;

    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      const result = await request(currentValue);
      results.push(result);
      currentValue = result;
    }

    logger.info(`Chained requests completed: ${results.length} requests`);
    return results;
  } catch (error) {
    logger.error(`Chained requests failed: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Poll an API endpoint until a condition is met
 * @param {Function} requestFn - Function that returns a promise
 * @param {Function} conditionFn - Function that checks if condition is met
 * @param {Object} options - Polling options
 * @param {number} options.interval - Polling interval in ms (default: 1000)
 * @param {number} options.timeout - Maximum polling time in ms (default: 30000)
 * @param {number} options.maxAttempts - Maximum polling attempts (default: 30)
 * @returns {Promise<any>} Result when condition is met
 * @example
 * const result = await pollUntil(
 *   () => fetch('/api/job/123'),
 *   (response) => response.status === 'completed',
 *   { interval: 2000, timeout: 60000 }
 * );
 */
export const pollUntil = async (
  requestFn: RequestFunction,
  conditionFn: (result: unknown) => boolean,
  options: RESTPollOptions = {}
): Promise<unknown> => {
  const { interval = 1000, timeout = 30000, maxAttempts = 30 } = options;

  const startTime = Date.now();
  let attempts = 0;

  try {
    while (attempts < maxAttempts) {
      if (Date.now() - startTime > timeout) {
        throw new Error(`Polling timeout after ${timeout}ms`);
      }

      const result = await requestFn();
      attempts++;

      if (conditionFn(result)) {
        logger.info(`Polling condition met after ${attempts} attempts`);
        return result;
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error(`Polling exceeded max attempts: ${maxAttempts}`);
  } catch (error) {
    logger.error(`Polling failed: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Measure request execution time
 * @param {Function} requestFn - Function that returns a promise
 * @returns {Promise<Object>} Result with timing information
 * @example
 * const { result, duration } = await measureRequestTime(() => fetch('/api/data'));
 * console.log(`Request took ${duration}ms`);
 */
export const measureRequestTime = async (requestFn: RequestFunction): Promise<RESTTimeResult> => {
  const startTime = Date.now();

  try {
    const result = await requestFn();
    const duration = Date.now() - startTime;

    logger.info(`Request completed in ${duration}ms`);
    return { result, duration, startTime, endTime: Date.now() };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`Request failed after ${duration}ms: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Execute requests with circuit breaker pattern
 * @param {Function} requestFn - Function that returns a promise
 * @param {Object} options - Circuit breaker options
 * @param {number} options.failureThreshold - Failures before opening circuit (default: 5)
 * @param {number} options.successThreshold - Successes to close circuit (default: 2)
 * @param {number} options.timeout - Timeout in ms before attempting reset (default: 60000)
 * @returns {Promise<any>} Request result
 * @example
 * const breaker = createCircuitBreaker();
 * const result = await executeWithCircuitBreaker(() => fetch('/api/data'), breaker);
 */
const circuitBreakerStates = new Map<string, RESTCircuitBreakerState>();

export const executeWithCircuitBreaker = async (
  requestFn: RequestFunction,
  options: RESTCircuitBreakerOptions = {}
): Promise<unknown> => {
  const {
    failureThreshold = 5,
    successThreshold = 2,
    timeout = 60000,
    breakerId = 'default',
  } = options;

  if (!circuitBreakerStates.has(breakerId)) {
    circuitBreakerStates.set(breakerId, {
      state: 'CLOSED',
      failures: 0,
      successes: 0,
      nextAttempt: Date.now(),
    });
  }

  const breaker = circuitBreakerStates.get(breakerId);
  if (!breaker) {
    throw new Error(`Circuit breaker with id '${breakerId}' not found`);
  }

  try {
    // Check if circuit is OPEN
    if (breaker.state === 'OPEN') {
      if (Date.now() < breaker.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      breaker.state = 'HALF_OPEN';
      logger.info('Circuit breaker transitioning to HALF_OPEN');
    }

    const result = await requestFn();

    // Success handling
    if (breaker.state === 'HALF_OPEN') {
      breaker.successes++;
      if (breaker.successes >= successThreshold) {
        breaker.state = 'CLOSED';
        breaker.failures = 0;
        breaker.successes = 0;
        logger.info('Circuit breaker CLOSED');
      }
    } else {
      breaker.failures = 0;
    }

    return result;
  } catch (error) {
    breaker.failures++;
    breaker.successes = 0;

    if (breaker.failures >= failureThreshold) {
      breaker.state = 'OPEN';
      breaker.nextAttempt = Date.now() + timeout;
      logger.error(`Circuit breaker OPEN after ${breaker.failures} failures`);
    }

    throw error;
  }
};

/**
 * Cache API responses with TTL
 * @param {Function} requestFn - Function that returns a promise
 * @param {Object} options - Cache options
 * @param {string} options.cacheKey - Unique cache key
 * @param {number} options.ttl - Time to live in ms (default: 60000)
 * @param {boolean} options.forceRefresh - Force cache refresh (default: false)
 * @returns {Promise<any>} Cached or fresh result
 * @example
 * const data = await cacheRequest(
 *   () => fetch('/api/data'),
 *   { cacheKey: 'api-data', ttl: 300000 }
 * );
 */
const requestCache = new Map<string, RESTCacheEntry>();

export const cacheRequest = async (
  requestFn: RequestFunction,
  options: RESTCacheOptions = {}
): Promise<unknown> => {
  const { cacheKey = 'default', ttl = 60000, forceRefresh = false } = options;

  try {
    if (!forceRefresh && requestCache.has(cacheKey)) {
      const cached = requestCache.get(cacheKey);
      if (cached && Date.now() < cached.expiry) {
        logger.info(`Returning cached result for key: ${cacheKey}`);
        return cached.data;
      }
    }

    const result = await requestFn();
    requestCache.set(cacheKey, {
      data: result,
      expiry: Date.now() + ttl,
    });

    logger.info(`Cached result for key: ${cacheKey} (TTL: ${ttl}ms)`);
    return result;
  } catch (error) {
    logger.error(`Cache request failed for key ${cacheKey}: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Clear request cache entries
 * @param cacheKey - Specific cache key to clear, or null to clear all cache
 * @example
 * clearCache('api-data'); // Clear specific key
 * clearCache(); // Clear all cache
 */
export const clearCache = (cacheKey: string | null = null): void => {
  if (cacheKey) {
    requestCache.delete(cacheKey);
    logger.info(`Cleared cache for key: ${cacheKey}`);
  } else {
    requestCache.clear();
    logger.info('Cleared all request cache');
  }
};

/**
 * Execute request with timeout limit
 * @param requestFn - Function that returns a promise
 * @param timeout - Timeout in milliseconds (default: 30000)
 * @returns Promise resolving to request result
 * @throws {Error} When request exceeds timeout
 * @example
 * const result = await withRequestTimeout(() => fetch('/api/data'), 5000);
 */
export const withRequestTimeout = async (
  requestFn: RequestFunction,
  timeout = 30000
): Promise<unknown> => {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout)
    );

    return await Promise.race([requestFn(), timeoutPromise]);
  } catch (error) {
    logger.error(`Request with timeout failed: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Aggregate multiple API calls and return combined results
 * @param {Object} requests - Object with named request functions
 * @param {Object} options - Aggregation options
 * @param {boolean} options.parallel - Execute in parallel (default: true)
 * @param {boolean} options.continueOnError - Continue on error (default: true)
 * @returns {Promise<Object>} Object with results keyed by request names
 * @example
 * const results = await aggregateRequests({
 *   users: () => fetch('/api/users'),
 *   products: () => fetch('/api/products'),
 *   orders: () => fetch('/api/orders')
 * });
 * console.log(results.users, results.products, results.orders);
 */
export const aggregateRequests = async (
  requests: Record<string, RequestFunction>,
  options: RESTAggregateOptions = {}
): Promise<Record<string, unknown>> => {
  const { parallel = true, continueOnError = true } = options;

  try {
    const results: Record<string, unknown> = {};
    const entries = Object.entries(requests);

    if (parallel) {
      const promises = entries.map(async ([key, requestFn]) => {
        try {
          results[key] = await requestFn();
        } catch (error) {
          results[key] = { error: (error as Error).message };
          if (!continueOnError) {
            throw error;
          }
        }
      });

      await Promise.all(promises);
    } else {
      for (const [key, requestFn] of entries) {
        try {
          results[key] = await requestFn();
        } catch (error) {
          results[key] = { error: (error as Error).message };
          if (!continueOnError) {
            throw error;
          }
        }
      }
    }

    logger.info(`Aggregated ${Object.keys(requests).length} requests`);
    return results;
  } catch (error) {
    logger.error(`Request aggregation failed: ${(error as Error).message}`);
    throw error;
  }
};
