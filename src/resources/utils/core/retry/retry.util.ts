/**
 * @fileoverview Retry utility for handling transient failures with exponential backoff.
 * Provides retry mechanisms, polling, and conditional retry patterns.
 * @module core/retry/retry.util
 */

/**
 * Retry Utility
 * Provides retry mechanisms with exponential backoff and custom conditions
 * @class
 * @example
 * await RetryUtil.retry(
 *   async () => fetchData(),
 *   { maxAttempts: 3, initialDelay: 1000 }
 * );
 */
class RetryUtil {
  /**
   * Retry function with exponential backoff
   * @static
   * @async
   * @param {Function} fn - Async function to retry
   * @param {Object} [options={}] - Retry options
   * @param {number} [options.maxAttempts=3] - Maximum retry attempts
   * @param {number} [options.initialDelay=1000] - Initial delay in ms
   * @param {number} [options.maxDelay=10000] - Maximum delay in ms
   * @param {number} [options.factor=2] - Backoff multiplication factor
   * @param {Function} [options.onRetry] - Callback on retry (receives attempt, error, delay)
   * @returns {Promise<any>} Result from successful function execution
   * @throws {Error} Last error if all attempts fail
   * @example
   * const data = await RetryUtil.retry(
   *   async () => api.getData(),
   *   { maxAttempts: 5, onRetry: (attempt) => console.log(`Attempt ${attempt}`) }
   * );
   */
  static async retry(
    fn: () => Promise<unknown>,
    options: {
      maxAttempts?: number;
      initialDelay?: number;
      maxDelay?: number;
      factor?: number;
      onRetry?: ((attempt: number, error: unknown, delay: number) => void) | null;
    } = {}
  ): Promise<unknown> {
    const {
      maxAttempts = 3,
      initialDelay = 1000,
      maxDelay = 10000,
      factor = 2,
      onRetry = null,
    } = options;

    let lastError: unknown;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt < maxAttempts) {
          if (onRetry) {
            onRetry(attempt, error, delay);
          }

          await this.wait(delay);
          delay = Math.min(delay * factor, maxDelay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Retry until custom condition is met
   * @static
   * @async
   * @param {Function} fn - Function to execute
   * @param {Function} condition - Condition function (receives result, returns boolean)
   * @param {Object} [options={}] - Retry options
   * @param {number} [options.maxAttempts=10] - Maximum attempts
   * @param {number} [options.delay=1000] - Delay between attempts in ms
   * @param {Function} [options.onRetry] - Callback on retry
   * @returns {Promise<any>} Result when condition is met
   * @throws {Error} If condition not met after max attempts
   * @example
   * const result = await RetryUtil.retryUntil(
   *   async () => checkStatus(),
   *   (status) => status === 'ready'
   * );
   */
  static async retryUntil(
    fn: () => Promise<unknown>,
    condition: (result: unknown) => boolean,
    options: {
      maxAttempts?: number;
      delay?: number;
      onRetry?: ((attempt: number, result: unknown) => void) | null;
    } = {}
  ): Promise<unknown> {
    const { maxAttempts = 10, delay = 1000, onRetry = null } = options;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await fn();

      if (condition(result)) {
        return result;
      }

      if (attempt < maxAttempts) {
        if (onRetry) {
          onRetry(attempt, result);
        }
        await this.wait(delay);
      }
    }

    throw new Error(`Condition not met after ${maxAttempts} attempts`);
  }

  /**
   * Wait for specified milliseconds
   * @static
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise<void>}
   */
  static wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Poll until function returns truthy value or timeout
   * @static
   * @async
   * @param {Function} fn - Function to poll
   * @param {Object} [options={}] - Polling options
   * @param {number} [options.interval=1000] - Poll interval in ms
   * @param {number} [options.timeout=30000] - Total timeout in ms
   * @returns {Promise<any>} First truthy result
   * @throws {Error} If timeout is reached
   * @example
   * const element = await RetryUtil.poll(
   *   async () => page.$('.dynamic-element'),
   *   { interval: 500, timeout: 5000 }
   * );
   */
  static async poll(
    fn: () => Promise<unknown>,
    options: { interval?: number; timeout?: number } = {}
  ): Promise<unknown> {
    const { interval = 1000, timeout = 30000 } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const result = await fn();
        if (result) {
          return result;
        }
      } catch (error) {
        // Continue polling on error
      }

      await this.wait(interval);
    }

    throw new Error(`Polling timeout after ${timeout}ms`);
  }
}

export { RetryUtil };
