import { logger } from '@utils/core';
import { RetryUtil } from '@utils/core';

/**
 * Wrap function with automatic retry behavior on failure
 * @param {Function} fn - Async function to wrap with retry logic
 * @param {Object} [options={}] - Retry configuration (passed to RetryUtil)
 * @param {number} [options.maxRetries=3] - Maximum retry attempts
 * @param {number} [options.delay=1000] - Initial delay between retries (ms)
 * @param {number} [options.backoffMultiplier=2] - Exponential backoff multiplier
 * @returns {Function} Wrapped function that retries on failure
 * @example
 * const fetchData = withRetry(async () => api.getData(), { maxRetries: 5, delay: 500 });
 * await fetchData(); // Retries up to 5 times on failure
 */
export const withRetry = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: Record<string, unknown> = {}
): T => {
  return (async (...args: unknown[]) => RetryUtil.retry(() => fn(...args), options)) as T;
};

/**
 * Wrap function with timeout enforcement
 * @param {Function} fn - Async function to wrap with timeout
 * @param {number} [timeoutMs=30000] - Timeout in milliseconds (default: 30 seconds)
 * @param {string} [timeoutMessage='Operation timed out'] - Custom timeout error message
 * @returns {Function} Wrapped function that rejects if timeout exceeded
 * @throws {Error} When operation exceeds timeout
 * @example
 * const fetchData = withTimeout(async () => api.getData(), 5000);
 * await fetchData(); // Throws error if takes longer than 5 seconds
 */
export const withTimeout = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  timeoutMs = 30000,
  timeoutMessage = 'Operation timed out'
): T => {
  return (async (...args: unknown[]) => {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${timeoutMessage} (${timeoutMs}ms)`)), timeoutMs)
    );

    return Promise.race([fn(...args), timeoutPromise]);
  }) as T;
};

/**
 * Wrap function with automatic execution logging (start, success, failure)
 * @param {Function} fn - Async function to wrap with logging
 * @param {Object} [options={}] - Logging configuration
 * @param {string} [options.name] - Custom name for logs (default: function name)
 * @param {boolean} [options.logArgs=false] - Log function arguments
 * @param {boolean} [options.logResult=false] - Log function result
 * @returns {Function} Wrapped function with automatic logging
 * @example
 * const processData = withLogging(async (data) => transform(data), { name: 'DataProcessor', logArgs: true });
 * await processData(input); // Logs start, duration, result/error
 */
export const withLogging = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: { name?: string; logArgs?: boolean; logResult?: boolean } = {}
): T => {
  const { name = fn.name || 'anonymous', logArgs = false, logResult = false } = options;

  return (async (...args: unknown[]) => {
    logger.info(`Started: ${name}`, logArgs ? { args } : {});
    const start = Date.now();

    try {
      const result = await fn(...args);
      const duration = Date.now() - start;
      logger.info(`Completed: ${name}`, {
        durationMs: duration,
        ...(logResult ? { result } : {}),
      });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`Failed: ${name}`, error as Error, { durationMs: duration });
      throw error;
    }
  }) as T;
};

/**
 * Wrap function and collect execution metrics (duration, success status)
 * @param {Function} fn - Async function to wrap with metrics collection
 * @param {string} [metricName] - Custom metric name (default: function name)
 * @returns {Function} Wrapped function that returns { result, metrics }
 * @example
 * const fetchData = withMetrics(async () => api.getData(), 'APIFetch');
 * const { result, metrics } = await fetchData();
 * console.log(metrics); // { name, startedAt, endedAt, durationMs, success }
 */
export const withMetrics = <T>(
  fn: (...args: unknown[]) => Promise<T>,
  metricName = fn.name || 'operation'
): ((...args: unknown[]) => Promise<{
  result: T | null;
  metrics: {
    name: string;
    startedAt: number;
    endedAt: number;
    durationMs: number;
    success: boolean;
    error?: string;
  };
}>) => {
  return async (...args: unknown[]) => {
    const startedAt = Date.now();
    try {
      const result = await fn(...args);
      return {
        result,
        metrics: {
          name: metricName,
          startedAt,
          endedAt: Date.now(),
          durationMs: Date.now() - startedAt,
          success: true,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        result: null,
        metrics: {
          name: metricName,
          startedAt,
          endedAt: Date.now(),
          durationMs: Date.now() - startedAt,
          success: false,
          error: errorMessage,
        },
      };
    }
  };
};

/**
 * Wrap function with fallback value or function on failure
 * @param {Function} fn - Async function to wrap with fallback
 * @param {*|Function} fallbackValueOrFn - Static fallback value or function(error, ...args)
 * @returns {Function} Wrapped function that never throws, returns fallback on error
 * @example
 * const fetchUser = withFallback(async (id) => api.getUser(id), { name: 'Guest' });
 * const user = await fetchUser(123); // Returns guest object if API fails
 */
export const withFallback = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  fallbackValueOrFn: unknown | ((error: Error, ...args: unknown[]) => unknown)
): T => {
  return (async (...args: unknown[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`Fallback used for ${fn.name || 'anonymous'}: ${errorMessage}`);
      return (
        typeof fallbackValueOrFn === 'function'
          ? fallbackValueOrFn(error as Error, ...args)
          : fallbackValueOrFn
      ) as ReturnType<T>;
    }
  }) as T;
};

/**
 * Compose multiple decorators into single wrapped function
 * Applies decorators left-to-right: composeDecorators(fn, d1, d2) => d2(d1(fn))
 * @param {Function} fn - Original function to decorate
 * @param {...Function} decorators - Decorator functions to apply
 * @returns {Function} Fully decorated function
 * @example
 * const process = composeDecorators(
 *   async (data) => transform(data),
 *   withRetry,
 *   (fn) => withTimeout(fn, 5000),
 *   withLogging
 * );
 * await process(data); // Runs with retry + timeout + logging
 */
export const composeDecorators = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  ...decorators: Array<(fn: T) => T>
): T => {
  return decorators.reduce((wrapped, decorator) => decorator(wrapped), fn);
};
