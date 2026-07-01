/**
 * @fileoverview Function caching decorators for performance optimization.
 * Provides memoization and TTL-based caching for async functions.
 * @module core/decorators/cache.decorator
 */

import { logger } from '@utils/core';

/**
 * In-memory memoization decorator that caches function results indefinitely
 * @param {Function} fn - Async function to memoize
 * @param {Object} [options={}] - Configuration options
 * @param {Function} [options.keyResolver] - Custom key generation function (default: JSON.stringify)
 * @returns {Function} Wrapped function with cache capabilities (clearCache, cacheSize methods)
 * @example
 * const getUser = withMemoization(async (id) => fetchUserFromDB(id));
 * await getUser(123); // Fetches from DB
 * await getUser(123); // Returns cached result
 * getUser.clearCache(); // Clear all cached results
 */
export const withMemoization = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: { keyResolver?: (...args: unknown[]) => string } = {}
): T & { clearCache: () => void; cacheSize: () => number } => {
  const { keyResolver = (..._args) => JSON.stringify(_args) } = options;
  const cache = new Map<string, unknown>();

  const wrapped = async (...args: unknown[]): Promise<unknown> => {
    const key = keyResolver(...args);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = await fn(...args);
    cache.set(key, result);
    return result;
  };

  wrapped.clearCache = () => cache.clear();
  wrapped.cacheSize = () => cache.size;

  return wrapped as T & { clearCache: () => void; cacheSize: () => number };
};

/**
 * In-memory TTL (Time-To-Live) cache decorator with automatic expiration
 * @param {Function} fn - Async function to cache
 * @param {number} [ttlMs=60000] - Cache lifetime in milliseconds (default: 60 seconds)
 * @param {Object} [options={}] - Configuration options
 * @param {Function} [options.keyResolver] - Custom key generation function (default: JSON.stringify)
 * @returns {Function} Wrapped function with cache methods (clearCache, pruneExpired)
 * @example
 * const getConfig = withTTLCache(async () => fetchConfig(), 5000); // 5 second TTL
 * await getConfig(); // Fetches config
 * await getConfig(); // Returns cached (within 5s)
 * // After 5s, fetches again
 * getConfig.pruneExpired(); // Remove expired entries
 */
export const withTTLCache = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  ttlMs: number = 60000,
  options: { keyResolver?: (...args: unknown[]) => string } = {}
): T & { clearCache: () => void; pruneExpired: () => void } => {
  const { keyResolver = (..._args) => JSON.stringify(_args) } = options;
  const cache = new Map<string, { value: unknown; expiresAt: number }>();

  const wrapped = async (...args: unknown[]): Promise<unknown> => {
    const key = keyResolver(...args);
    const now = Date.now();

    if (cache.has(key)) {
      const entry = cache.get(key);
      if (entry && entry.expiresAt > now) {
        return entry.value;
      }
      cache.delete(key);
    }

    const value = await fn(...args);
    cache.set(key, { value, expiresAt: now + ttlMs });
    return value;
  };

  wrapped.clearCache = () => cache.clear();
  wrapped.pruneExpired = () => {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (v && v.expiresAt <= now) {
        cache.delete(k);
      }
    }
    logger.info('TTL cache pruned');
  };

  return wrapped as T & { clearCache: () => void; pruneExpired: () => void };
};
