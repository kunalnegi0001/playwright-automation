/**
 * @fileoverview Comprehensive localStorage management utilities for Playwright.
 * Provides functions for managing browser localStorage with automatic JSON handling.
 * @module utils/browser/storage.helper
 *
 * LocalStorage Helper Utilities
 * Comprehensive localStorage management utilities
 *
 * @category Browser Storage
 *
 * @description
 * This module provides utilities for:
 * - Getting/setting/removing localStorage items
 * - Bulk operations
 * - Type-safe storage (automatic JSON parsing)
 * - Storage size calculation
 * - Storage event monitoring
 *
 * @example
 * import * as LocalStorageHelper from './local-storage.helper';
 *
 * // Set item
 * await LocalStorageHelper.setItem(page, 'user', { id: 1, name: 'John' });
 *
 * // Get item
 * const user = await LocalStorageHelper.getItem(page, 'user', true);
 */

import type { Page } from '@playwright/test';
import { logger } from '@utils/core';

/**
 * Wait options for localStorage operations
 */
export type LocalStorageWaitOptions = {
  /** Maximum time to wait in milliseconds (default: 30000) */
  timeout?: number;
  /** Check interval in milliseconds (default: 100) */
  interval?: number;
};

/**
 * Value wait options for localStorage operations
 */
export type LocalStorageValueOptions = {
  /** Maximum time to wait in milliseconds (default: 30000) */
  timeout?: number;
  /** Auto-parse JSON before comparing (default: false) */
  parse?: boolean;
};

/**
 * Get item from localStorage
 * @param page - Playwright page object
 * @param key - Storage key
 * @param parse - Auto-parse JSON (default: false)
 * @returns Promise resolving to stored value
 * @throws {Error} When localStorage access fails
 * @example
 * const value = await getItem(page, 'token');
 * const user = await getItem(page, 'user', true); // Auto-parse JSON
 */
export const getItem = async (page: Page, key: string, parse = false): Promise<unknown> => {
  try {
    const value = await page.evaluate(k => localStorage.getItem(k), key);

    if (value && parse) {
      try {
        return JSON.parse(value) as unknown;
      } catch (e) {
        logger.warn(`Failed to parse JSON for key: ${key}`);
        return value as unknown;
      }
    }

    return value as unknown;
  } catch (error) {
    logger.error(
      `Failed to get localStorage item: ${key}`,
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
};

/**
 * Set item in localStorage
 * @param page - Playwright page object
 * @param key - Storage key
 * @param value - Value to store (objects will be stringified)
 * @returns Promise that resolves when item is set
 * @throws {Error} When localStorage access fails
 * @example
 * await setItem(page, 'token', 'abc123');
 * await setItem(page, 'user', { id: 1, name: 'John' });
 */
export const setItem = async (page: Page, key: string, value: unknown): Promise<void> => {
  try {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    await page.evaluate(({ k, v }) => localStorage.setItem(k, v), { k: key, v: stringValue });

    logger.info(`Set localStorage item: ${key}`);
  } catch (error) {
    logger.error(
      `Failed to set localStorage item: ${key}`,
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
};

/**
 * Remove item from localStorage
 * @param page - Playwright page object
 * @param key - Storage key
 * @returns Promise that resolves when item is removed
 * @throws {Error} When localStorage access fails
 * @example
 * await removeItem(page, 'token');
 */
export const removeItem = async (page: Page, key: string): Promise<void> => {
  try {
    await page.evaluate(k => localStorage.removeItem(k), key);
    logger.info(`Removed localStorage item: ${key}`);
  } catch (error) {
    logger.error(`Failed to remove localStorage item: ${key}`, error);
    throw error;
  }
};

/**
 * Clear all localStorage
 * @param page - Playwright page object
 * @returns Promise that resolves when storage is cleared
 * @throws {Error} When localStorage access fails
 * @example
 * await clear(page);
 */
export const clear = async (page: Page): Promise<void> => {
  try {
    await page.evaluate(() => localStorage.clear());
    logger.info('Cleared all localStorage');
  } catch (error) {
    logger.error('Failed to clear localStorage', error);
    throw error;
  }
};

/**
 * Get all localStorage items
 * @param page - Playwright page object
 * @param parse - Auto-parse JSON values (default: false)
 * @returns Promise resolving to object with all key-value pairs
 * @throws {Error} When localStorage access fails
 * @example
 * const all = await getAllItems(page, true);
 */
export const getAllItems = async (page: Page, parse = false): Promise<Record<string, unknown>> => {
  try {
    const items = await page.evaluate(() => {
      const storage: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)!;
        storage[key] = localStorage.getItem(key)!;
      }
      return storage;
    });

    if (parse) {
      const parsed: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(items)) {
        try {
          parsed[key] = JSON.parse(value as string);
        } catch (e) {
          parsed[key] = value;
        }
      }
      return parsed;
    }

    return items;
  } catch (error) {
    logger.error('Failed to get all localStorage items', error);
    throw error;
  }
};

/**
 * Set multiple items in localStorage
 * @param page - Playwright page object
 * @param items - Object with key-value pairs
 * @returns Promise that resolves when all items are set
 * @throws {Error} When localStorage access fails
 * @example
 * await setMultiple(page, {
 *   token: 'abc123',
 *   user: { id: 1, name: 'John' },
 *   theme: 'dark'
 * });
 */
export const setMultiple = async (page: Page, items: Record<string, unknown>): Promise<void> => {
  try {
    await page.evaluate(itemsObj => {
      Object.entries(itemsObj).forEach(([key, value]) => {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        localStorage.setItem(key, stringValue);
      });
    }, items);

    logger.info(`Set ${Object.keys(items).length} localStorage items`);
  } catch (error) {
    logger.error('Failed to set multiple localStorage items', error);
    throw error;
  }
};

/**
 * Remove multiple items from localStorage
 * @param page - Playwright page object
 * @param keys - Array of keys to remove
 * @returns Promise that resolves when all items are removed
 * @throws {Error} When localStorage access fails
 * @example
 * await removeMultiple(page, ['token', 'user', 'session']);
 */
export const removeMultiple = async (page: Page, keys: string[]): Promise<void> => {
  try {
    await page.evaluate(keysList => {
      keysList.forEach(key => localStorage.removeItem(key));
    }, keys);

    logger.info(`Removed ${keys.length} localStorage items`);
  } catch (error) {
    logger.error('Failed to remove multiple localStorage items', error);
    throw error;
  }
};

/**
 * Check if key exists in localStorage
 * @param page - Playwright page object
 * @param key - Storage key
 * @returns Promise resolving to true if key exists
 * @example
 * const exists = await hasItem(page, 'token');
 */
export const hasItem = async (page: Page, key: string): Promise<boolean> => {
  try {
    return await page.evaluate(k => localStorage.getItem(k) !== null, key);
  } catch (error) {
    logger.error(`Failed to check localStorage item: ${key}`, error);
    return false;
  }
};

/**
 * Get localStorage keys
 * @param page - Playwright page object
 * @returns Promise resolving to array of keys
 * @throws {Error} When localStorage access fails
 * @example
 * const keys = await getKeys(page);
 */
export const getKeys = async (page: Page): Promise<string[]> => {
  try {
    return await page.evaluate(() => {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i)!);
      }
      return keys;
    });
  } catch (error) {
    logger.error('Failed to get localStorage keys', error);
    throw error;
  }
};

/**
 * Get localStorage size (approximate in bytes)
 * @param page - Playwright page object
 * @returns Promise resolving to size in bytes
 * @throws {Error} When localStorage access fails
 * @example
 * const size = await getSize(page);
 * console.log(`LocalStorage size: ${size} bytes`);
 */
export const getSize = async (page: Page): Promise<number> => {
  try {
    return await page.evaluate(() => {
      let size = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)!;
        const value = localStorage.getItem(key)!;
        size += key.length + value.length;
      }
      return size * 2; // JavaScript uses UTF-16, 2 bytes per character
    });
  } catch (error) {
    logger.error('Failed to get localStorage size', error);
    throw error;
  }
};

/**
 * Get item count
 * @param page - Playwright page object
 * @returns Promise resolving to number of items
 * @example
 * const count = await getCount(page);
 */
export const getCount = async (page: Page): Promise<number> => {
  try {
    return await page.evaluate(() => localStorage.length);
  } catch (error) {
    logger.error('Failed to get localStorage count', error);
    return 0;
  }
};

/**
 * Search for items by key pattern
 * @param page - Playwright page object
 * @param pattern - Search pattern (string or regex)
 * @param parse - Auto-parse JSON values (default: false)
 * @returns Promise resolving to matching key-value pairs
 * @throws {Error} When localStorage access fails
 * @example
 * const userItems = await searchByKey(page, /^user_/);
 * const cartItems = await searchByKey(page, 'cart', true);
 */
export const searchByKey = async (
  page: Page,
  pattern: string | RegExp,
  parse = false
): Promise<Record<string, unknown>> => {
  try {
    const isRegex = pattern instanceof RegExp;
    const patternStr = isRegex ? pattern.source : pattern;

    const items = await page.evaluate(
      ({ patternStr, isRegex }) => {
        const regex = isRegex ? new RegExp(patternStr) : null;
        const results: Record<string, string> = {};

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)!;
          const matches = isRegex ? regex!.test(key) : key.includes(patternStr);

          if (matches) {
            results[key] = localStorage.getItem(key)!;
          }
        }

        return results;
      },
      { patternStr, isRegex }
    );

    if (parse) {
      const parsed: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(items)) {
        try {
          parsed[key] = JSON.parse(value as string);
        } catch (e) {
          parsed[key] = value;
        }
      }
      return parsed;
    }

    return items;
  } catch (error) {
    logger.error('Failed to search localStorage', error);
    throw error;
  }
};

/**
 * Create a snapshot of localStorage
 * @param page - Playwright page object
 * @returns Promise resolving to snapshot of all localStorage items
 * @throws {Error} When localStorage access fails
 * @example
 * const snapshot = await createSnapshot(page);
 * // Later restore it
 * await restoreSnapshot(page, snapshot);
 */
export const createSnapshot = async (page: Page): Promise<Record<string, unknown>> => {
  try {
    const snapshot = await getAllItems(page);
    logger.info('Created localStorage snapshot');
    return snapshot;
  } catch (error) {
    logger.error('Failed to create localStorage snapshot', error);
    throw error;
  }
};

/**
 * Restore localStorage from snapshot
 * @param page - Playwright page object
 * @param snapshot - Snapshot to restore
 * @param clearFirst - Clear existing storage first (default: true)
 * @returns Promise that resolves when snapshot is restored
 * @throws {Error} When localStorage access fails
 * @example
 * await restoreSnapshot(page, previousSnapshot);
 */
export const restoreSnapshot = async (
  page: Page,
  snapshot: Record<string, unknown>,
  clearFirst = true
): Promise<void> => {
  try {
    if (clearFirst) {
      await clear(page);
    }

    await setMultiple(page, snapshot);
    logger.info('Restored localStorage from snapshot');
  } catch (error) {
    logger.error('Failed to restore localStorage snapshot', error);
    throw error;
  }
};

/**
 * Wait for localStorage item to exist
 * @param page - Playwright page object
 * @param key - Storage key
 * @param options - Wait options
 * @returns Promise that resolves when item exists
 * @throws {Error} When timeout is reached or localStorage access fails
 * @example
 * await waitForItem(page, 'auth_token', { timeout: 5000 });
 */
export const waitForItem = async (
  page: Page,
  key: string,
  options: LocalStorageWaitOptions = {}
): Promise<void> => {
  const { timeout = 30000, interval: _interval = 100 } = options;
  const startTime = Date.now();

  try {
    while (Date.now() - startTime < timeout) {
      const exists = await hasItem(page, key);
      if (exists) {
        logger.info(`localStorage item found: ${key}`);
        return;
      }
      await page.waitForLoadState('load');
    }

    throw new Error(`Timeout waiting for localStorage item: ${key}`);
  } catch (error) {
    logger.error(`Failed waiting for localStorage item: ${key}`, error);
    throw error;
  }
};

/**
 * Wait for localStorage item to have specific value
 * @param page - Playwright page object
 * @param key - Storage key
 * @param expectedValue - Expected value
 * @param options - Wait options
 * @returns Promise that resolves when value matches
 * @throws {Error} When timeout is reached or localStorage access fails
 * @example
 * await waitForValue(page, 'status', 'ready', { timeout: 10000 });
 */
export const waitForValue = async (
  page: Page,
  key: string,
  expectedValue: unknown,
  options: LocalStorageValueOptions = {}
): Promise<void> => {
  const { timeout = 30000, parse = false } = options;

  try {
    await page.waitForFunction(
      ({ k, expected, doParse }) => {
        const value = localStorage.getItem(k);
        if (!value) {
          return false;
        }

        const actualValue = doParse ? (JSON.parse(value) as unknown) : value;
        const expectedVal =
          typeof expected === 'object' ? JSON.stringify(expected) : String(expected);
        const actualVal =
          typeof actualValue === 'object' ? JSON.stringify(actualValue) : String(actualValue);

        return actualVal === expectedVal;
      },
      { k: key, expected: expectedValue, doParse: parse },
      { timeout }
    );

    logger.info(`localStorage item has expected value: ${key}`);
  } catch (error) {
    logger.error(`Failed waiting for localStorage value: ${key}`, error);
    throw error;
  }
};
