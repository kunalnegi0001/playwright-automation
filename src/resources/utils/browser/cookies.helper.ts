/**
 * @fileoverview Comprehensive cookie management utilities for Playwright.
 * Provides functions for getting, setting, deleting, and filtering cookies with security options.
 * @module utils/browser/cookies.helper
 *
 * Cookies Helper Utilities
 * Comprehensive cookie management utilities
 *
 * @category Browser Storage
 *
 * @description
 * This module provides utilities for:
 * - Getting/setting/deleting cookies
 * - Cookie filtering and searching
 * - Secure cookie handling
 * - Cookie attributes management
 * - Bulk cookie operations
 *
 * @example
 * import * as CookiesHelper from './cookies.helper';
 *
 * // Set secure cookie
 * await CookiesHelper.setCookie(page, {
 *   name: 'session',
 *   value: 'abc123',
 *   secure: true,
 *   httpOnly: true
 * });
 */

import type { Page, Cookie } from '@playwright/test';
import { logger } from '@utils/core';

/**
 * Cookie input configuration
 */
export type CookieInput = {
  /** Cookie name */
  name: string;
  /** Cookie value */
  value: string;
  /** Cookie domain (defaults to current domain) */
  domain?: string;
  /** Cookie path (default: '/') */
  path?: string;
  /** Expiration timestamp in seconds since epoch */
  expires?: number;
  /** HTTP only flag (default: false) */
  httpOnly?: boolean;
  /** Secure flag (default: false) */
  secure?: boolean;
  /** SameSite attribute (default: 'Lax') */
  sameSite?: 'Strict' | 'Lax' | 'None';
};

/**
 * Wait options for cookie operations
 */
export type CookieWaitOptions = {
  /** Maximum time to wait in milliseconds (default: 30000) */
  timeout?: number;
  /** Check interval in milliseconds (default: 100) */
  interval?: number;
};

/**
 * Get all cookies
 * @param page - Playwright page object
 * @returns Promise resolving to array of cookie objects
 * @throws {Error} When cookie retrieval fails
 * @example
 * const cookies = await getAllCookies(page);
 */
export const getAllCookies = async (page: Page): Promise<Cookie[]> => {
  try {
    const context = page.context();
    return await context.cookies();
  } catch (error) {
    logger.error('Failed to get all cookies', error as Error);
    throw error;
  }
};

/**
 * Get cookie by name
 * @param page - Playwright page object
 * @param name - Cookie name
 * @returns Promise resolving to cookie object or null
 * @example
 * const sessionCookie = await getCookie(page, 'session_id');
 */
export const getCookie = async (page: Page, name: string): Promise<Cookie | null> => {
  try {
    const context = page.context();
    const cookies = await context.cookies();
    return cookies.find(c => c.name === name) || null;
  } catch (error) {
    logger.error(`Failed to get cookie: ${name}`, error as Error);
    return null;
  }
};

/**
 * Get cookie value by name
 * @param page - Playwright page object
 * @param name - Cookie name
 * @returns Promise resolving to cookie value or null
 * @example
 * const token = await getCookieValue(page, 'auth_token');
 */
export const getCookieValue = async (page: Page, name: string): Promise<string | null> => {
  try {
    const cookie = await getCookie(page, name);
    return cookie ? cookie.value : null;
  } catch (error) {
    logger.error(`Failed to get cookie value: ${name}`, error as Error);
    return null;
  }
};

/**
 * Set cookie
 * @param page - Playwright page object
 * @param cookie - Cookie configuration object
 * @returns Promise that resolves when cookie is set
 * @throws {Error} When cookie setting fails
 * @example
 * await setCookie(page, {
 *   name: 'auth_token',
 *   value: 'abc123',
 *   secure: true,
 *   httpOnly: true,
 *   sameSite: 'Strict'
 * });
 */
export const setCookie = async (page: Page, cookie: CookieInput): Promise<void> => {
  try {
    const context = page.context();
    const url = page.url();
    const urlObj = new URL(url);

    const cookieData: Cookie = {
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain || urlObj.hostname,
      path: cookie.path || '/',
      httpOnly: cookie.httpOnly || false,
      secure: cookie.secure || false,
      sameSite: (cookie.sameSite || 'Lax') as 'Strict' | 'Lax' | 'None',
      expires: cookie.expires || -1,
    };

    await context.addCookies([cookieData]);
    logger.info(`Set cookie: ${cookie.name}`);
  } catch (error) {
    logger.error(`Failed to set cookie: ${cookie.name}`, error as Error);
    throw error;
  }
};

/**
 * Set multiple cookies
 * @param page - Playwright page object
 * @param cookies - Array of cookie objects
 * @returns Promise that resolves when all cookies are set
 * @throws {Error} When cookie setting fails
 * @example
 * await setMultipleCookies(page, [
 *   { name: 'token', value: 'abc123' },
 *   { name: 'user_id', value: '456' }
 * ]);
 */
export const setMultipleCookies = async (page: Page, cookies: CookieInput[]): Promise<void> => {
  try {
    for (const cookie of cookies) {
      await setCookie(page, cookie);
    }
    logger.info(`Set ${cookies.length} cookies`);
  } catch (error) {
    logger.error('Failed to set multiple cookies', error as Error);
    throw error;
  }
};

/**
 * Delete cookie by name
 * @param page - Playwright page object
 * @param name - Cookie name
 * @returns Promise that resolves when cookie is deleted
 * @throws {Error} When cookie deletion fails
 * @example
 * await deleteCookie(page, 'session_id');
 */
export const deleteCookie = async (page: Page, name: string): Promise<void> => {
  try {
    const context = page.context();
    const cookies = await context.cookies();
    const cookie = cookies.find(c => c.name === name);

    if (cookie) {
      await context.clearCookies({
        name: cookie.name,
        domain: cookie.domain,
      });
      logger.info(`Deleted cookie: ${name}`);
    } else {
      logger.warn(`Cookie not found: ${name}`);
    }
  } catch (error) {
    logger.error(`Failed to delete cookie: ${name}`, error as Error);
    throw error;
  }
};

/**
 * Delete multiple cookies
 * @param page - Playwright page object
 * @param names - Array of cookie names
 * @returns Promise that resolves when all cookies are deleted
 * @throws {Error} When cookie deletion fails
 * @example
 * await deleteMultipleCookies(page, ['token', 'session_id']);
 */
export const deleteMultipleCookies = async (page: Page, names: string[]): Promise<void> => {
  try {
    for (const name of names) {
      await deleteCookie(page, name);
    }
    logger.info(`Deleted ${names.length} cookies`);
  } catch (error) {
    logger.error('Failed to delete multiple cookies', error as Error);
    throw error;
  }
};

/**
 * Delete all cookies
 * @param page - Playwright page object
 * @returns Promise that resolves when all cookies are deleted
 * @throws {Error} When cookie deletion fails
 * @example
 * await deleteAllCookies(page);
 */
export const deleteAllCookies = async (page: Page): Promise<void> => {
  try {
    const context = page.context();
    await context.clearCookies();
    logger.info('Deleted all cookies');
  } catch (error) {
    logger.error('Failed to delete all cookies', error as Error);
    throw error;
  }
};

/**
 * Check if cookie exists
 * @param page - Playwright page object
 * @param name - Cookie name
 * @returns Promise resolving to true if cookie exists
 * @example
 * const exists = await hasCookie(page, 'auth_token');
 */
export const hasCookie = async (page: Page, name: string): Promise<boolean> => {
  try {
    const cookie = await getCookie(page, name);
    return cookie !== null;
  } catch (error) {
    logger.error(`Failed to check cookie: ${name}`, error as Error);
    return false;
  }
};

/**
 * Get cookies by domain
 * @param page - Playwright page object
 * @param domain - Domain to filter by
 * @returns Promise resolving to array of cookies for domain
 * @example
 * const cookies = await getCookiesByDomain(page, '.example.com');
 */
export const getCookiesByDomain = async (page: Page, domain: string): Promise<Cookie[]> => {
  try {
    const cookies = await getAllCookies(page);
    return cookies.filter(c => c.domain === domain || c.domain === `.${domain}`);
  } catch (error) {
    logger.error(`Failed to get cookies by domain: ${domain}`, error as Error);
    return [];
  }
};

/**
 * Get secure cookies only
 * @param page - Playwright page object
 * @returns Promise resolving to array of secure cookies
 * @example
 * const secureCookies = await getSecureCookies(page);
 */
export const getSecureCookies = async (page: Page): Promise<Cookie[]> => {
  try {
    const cookies = await getAllCookies(page);
    return cookies.filter(c => c.secure === true);
  } catch (error) {
    logger.error('Failed to get secure cookies', error as Error);
    return [];
  }
};

/**
 * Get HTTP-only cookies
 * @param page - Playwright page object
 * @returns Promise resolving to array of HTTP-only cookies
 * @example
 * const httpOnlyCookies = await getHttpOnlyCookies(page);
 */
export const getHttpOnlyCookies = async (page: Page): Promise<Cookie[]> => {
  try {
    const cookies = await getAllCookies(page);
    return cookies.filter(c => c.httpOnly === true);
  } catch (error) {
    logger.error('Failed to get HTTP-only cookies', error as Error);
    return [];
  }
};

/**
 * Create cookies snapshot
 * @param page - Playwright page object
 * @returns Promise resolving to snapshot of all cookies
 * @throws {Error} When snapshot creation fails
 * @example
 * const snapshot = await createSnapshot(page);
 * // Later restore it
 * await restoreSnapshot(page, snapshot);
 */
export const createSnapshot = async (page: Page): Promise<Cookie[]> => {
  try {
    const cookies = await getAllCookies(page);
    logger.info('Created cookies snapshot');
    return cookies;
  } catch (error) {
    logger.error('Failed to create cookies snapshot', error as Error);
    throw error;
  }
};

/**
 * Restore cookies from snapshot
 * @param page - Playwright page object
 * @param snapshot - Cookies snapshot
 * @param clearFirst - Clear existing cookies first (default: true)
 * @returns Promise that resolves when snapshot is restored
 * @throws {Error} When snapshot restoration fails
 * @example
 * await restoreSnapshot(page, previousSnapshot);
 */
export const restoreSnapshot = async (
  page: Page,
  snapshot: Cookie[],
  clearFirst = true
): Promise<void> => {
  try {
    if (clearFirst) {
      await deleteAllCookies(page);
    }

    const context = page.context();
    await context.addCookies(snapshot);
    logger.info('Restored cookies from snapshot');
  } catch (error) {
    logger.error('Failed to restore cookies snapshot', error as Error);
    throw error;
  }
};

/**
 * Get cookie count
 * @param page - Playwright page object
 * @returns Promise resolving to number of cookies
 * @example
 * const count = await getCookieCount(page);
 */
export const getCookieCount = async (page: Page): Promise<number> => {
  try {
    const cookies = await getAllCookies(page);
    return cookies.length;
  } catch (error) {
    logger.error('Failed to get cookie count', error as Error);
    return 0;
  }
};

/**
 * Search cookies by pattern
 * @param page - Playwright page object
 * @param pattern - Search pattern for cookie name (string or regex)
 * @returns Promise resolving to matching cookies
 * @example
 * const sessionCookies = await searchCookies(page, /^session_/);
 * const authCookies = await searchCookies(page, 'auth');
 */
export const searchCookies = async (page: Page, pattern: string | RegExp): Promise<Cookie[]> => {
  try {
    const cookies = await getAllCookies(page);
    const isRegex = pattern instanceof RegExp;

    return cookies.filter(cookie => {
      return isRegex ? pattern.test(cookie.name) : cookie.name.includes(pattern);
    });
  } catch (error) {
    logger.error('Failed to search cookies', error as Error);
    return [];
  }
};

/**
 * Check if cookie is expired
 * @param cookie - Cookie object
 * @returns True if cookie is expired
 * @example
 * const cookie = await getCookie(page, 'session');
 * const expired = isExpired(cookie);
 */
export const isExpired = (cookie: Cookie | null): boolean => {
  if (!cookie || !cookie.expires || cookie.expires === -1) {
    return false;
  }
  return cookie.expires * 1000 < Date.now();
};

/**
 * Get expired cookies
 * @param page - Playwright page object
 * @returns Promise resolving to array of expired cookies
 * @example
 * const expiredCookies = await getExpiredCookies(page);
 */
export const getExpiredCookies = async (page: Page): Promise<Cookie[]> => {
  try {
    const cookies = await getAllCookies(page);
    return cookies.filter(isExpired);
  } catch (error) {
    logger.error('Failed to get expired cookies', error as Error);
    return [];
  }
};

/**
 * Wait for cookie to exist
 * @param page - Playwright page object
 * @param name - Cookie name
 * @param options - Wait options
 * @returns Promise resolving to cookie object
 * @throws {Error} When timeout is reached or cookie access fails
 * @example
 * const cookie = await waitForCookie(page, 'session_id', { timeout: 5000 });
 */
export const waitForCookie = async (
  page: Page,
  name: string,
  options: CookieWaitOptions = {}
): Promise<Cookie> => {
  const { timeout = 30000, interval: _interval = 100 } = options;
  const startTime = Date.now();

  try {
    while (Date.now() - startTime < timeout) {
      const cookie = await getCookie(page, name);
      if (cookie) {
        logger.info(`Cookie found: ${name}`);
        return cookie;
      }
      await page.waitForLoadState('load');
    }

    throw new Error(`Timeout waiting for cookie: ${name}`);
  } catch (error) {
    logger.error(`Failed waiting for cookie: ${name}`, error as Error);
    throw error;
  }
};
