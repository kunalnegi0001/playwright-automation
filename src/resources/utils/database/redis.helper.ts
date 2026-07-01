/**
 * @fileoverview Redis cache helper functions.
 * Provides wrapper functions for common Redis operations including strings, hashes, and lists.
 * @module utils/database/redis.helper
 */

import { logger } from '@utils/core';

/**
 * Get value from Redis by key
 * @export
 * @async
 * @param {import('redis').RedisClientType} client - Redis client instance
 * @param {string} key - Key to retrieve
 * @returns {Promise<string|null>} Value or null if key doesn't exist
 * @example
 * const value = await get(client, 'session:123');
 */
export const get = async (client: unknown, key: string): Promise<string | null> => {
  return (client as { get: (key: string) => Promise<string | null> }).get(key);
};

/**
 * Set value in Redis with optional TTL
 * @export
 * @async
 * @param {import('redis').RedisClientType} client - Redis client instance
 * @param {string} key - Key to set
 * @param {string} value - Value to store
 * @param {number|null} [ttlSeconds=null] - Time to live in seconds (null = no expiration)
 * @returns {Promise<string>} 'OK' if successful
 * @example
 * await set(client, 'session:123', 'data', 3600); // Expires in 1 hour
 */
export const set = async (
  client: unknown,
  key: string,
  value: string,
  ttlSeconds: number | null = null
): Promise<string> => {
  const redisClient = client as {
    set: (key: string, value: string, opts?: { EX: number }) => Promise<string>;
  };
  if (ttlSeconds) {
    return redisClient.set(key, value, { EX: ttlSeconds });
  }
  return redisClient.set(key, value);
};

export const del = async (client: unknown, key: string): Promise<number> => {
  return (client as { del: (key: string) => Promise<number> }).del(key);
};

export const exists = async (client: unknown, key: string): Promise<boolean> => {
  return (await (client as { exists: (key: string) => Promise<number> }).exists(key)) === 1;
};

export const incr = async (client: unknown, key: string): Promise<number> => {
  return (client as { incr: (key: string) => Promise<number> }).incr(key);
};

export const expire = async (
  client: unknown,
  key: string,
  ttlSeconds: number
): Promise<boolean> => {
  return (client as { expire: (key: string, ttl: number) => Promise<boolean> }).expire(
    key,
    ttlSeconds
  );
};

export const hset = async (
  client: unknown,
  key: string,
  field: string,
  value: string
): Promise<number> => {
  return (client as { hSet: (key: string, field: string, value: string) => Promise<number> }).hSet(
    key,
    field,
    value
  );
};

export const hget = async (
  client: unknown,
  key: string,
  field: string
): Promise<string | undefined> => {
  return (client as { hGet: (key: string, field: string) => Promise<string | undefined> }).hGet(
    key,
    field
  );
};

export const hgetall = async (client: unknown, key: string): Promise<Record<string, string>> => {
  return (client as { hGetAll: (key: string) => Promise<Record<string, string>> }).hGetAll(key);
};

export const lpush = async (client: unknown, key: string, ...values: string[]): Promise<number> => {
  return (client as { lPush: (key: string, values: string[]) => Promise<number> }).lPush(
    key,
    values
  );
};

export const rpop = async (client: unknown, key: string): Promise<string | null> => {
  return (client as { rPop: (key: string) => Promise<string | null> }).rPop(key);
};

export const flushDb = async (client: unknown): Promise<string> => {
  return (client as { flushDb: () => Promise<string> }).flushDb();
};

export const keys = async (client: unknown, pattern = '*'): Promise<string[]> => {
  return (client as { keys: (pattern: string) => Promise<string[]> }).keys(pattern);
};

/**
 * Safely store a JavaScript object as JSON in Redis
 * @export
 * @async
 * @param {import('redis').RedisClientType} client - Redis client instance
 * @param {string} key - Key to set
 * @param {any} value - Object to store (will be JSON stringified)
 * @param {number|null} [ttlSeconds=null] - Time to live in seconds
 * @returns {Promise<string>} 'OK' if successful
 * @throws {Error} If JSON stringification fails
 * @example
 * await safeJsonSet(client, 'user:123', { name: 'John', age: 30 }, 3600);
 */
export const safeJsonSet = async (
  client: unknown,
  key: string,
  value: unknown,
  ttlSeconds: number | null = null
): Promise<string> => {
  try {
    return set(client, key, JSON.stringify(value), ttlSeconds);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`safeJsonSet failed: ${errorMessage}`);
    throw error;
  }
};

/**
 * Safely retrieve and parse a JSON object from Redis
 * @export
 * @async
 * @param {import('redis').RedisClientType} client - Redis client instance
 * @param {string} key - Key to retrieve
 * @param {any} [fallback=null] - Default value if key doesn't exist or parsing fails
 * @returns {Promise<any>} Parsed object or fallback value
 * @example
 * const user = await safeJsonGet(client, 'user:123', { name: 'Guest' });
 */
export const safeJsonGet = async <T = unknown>(
  client: unknown,
  key: string,
  fallback: T | null = null
): Promise<T | null> => {
  try {
    const raw = await get(client, key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`safeJsonGet failed: ${errorMessage}`);
    return fallback;
  }
};
