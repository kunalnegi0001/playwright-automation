import { Page } from '@playwright/test';
/**
 * Browser Helper Utilities
 * Browser-specific management and configuration utilities
 *
 * @module BrowserHelper
 * @category UI Testing
 *
 * @description
 * This module provides utilities for:
 * - Browser context management (clearAll data)
 * - Network monitoring and manipulation
 * - Performance metrics collection
 * - Browser information and capabilities
 * - Geolocation, timezone, device emulation
 *
 * For storage and cookie operations, use:
 * - storage.helper.ts for localStorage/sessionStorage
 * - cookies.helper.ts for cookie management
 *
 * @example
 * import * as BrowserHelper from './browser.helper';
 * import * as StorageHelper from './storage.helper';
 * import * as CookiesHelper from './cookies.helper';
 *
 * // Clear all browser data
 * await BrowserHelper.clearAllBrowserData(page);
 *
 * // Get performance metrics
 * const metrics = await BrowserHelper.getPerformanceMetrics(page);
 *
 * // Use dedicated helpers for storage/cookies
 * await StorageHelper.setItem(page, 'key', 'value');
 * await CookiesHelper.setCookie(page, { name: 'token', value: 'abc' });
 */

import { logger } from '@utils/core';

// Re-export commonly used storage and cookie functions for convenience
export { getItem, setItem, getAllItems, clear } from './storage.helper';
export {
  getCookie,
  setCookie,
  getAllCookies,
  deleteCookie,
  deleteAllCookies,
} from './cookies.helper';

/**
 * Clear all browser storage (localStorage, sessionStorage, cookies)
 *
 * @async
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 *
 * @example
 * await clearAllBrowserData(page);
 */
export const clearAllBrowserData = async (page: Page): Promise<void> => {
  try {
    logger.info('Clearing all browser data');

    // Clear localStorage
    await page.evaluate(() => localStorage.clear());

    // Clear sessionStorage
    await page.evaluate(() => sessionStorage.clear());

    // Clear cookies
    const context = page.context();
    await context.clearCookies();

    logger.info('Successfully cleared all browser data');
  } catch (error) {
    logger.error(
      'Failed to clear browser data',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Get browser context information
 *
 * @async
 * @param {Page} page - Playwright page object
 * @returns {Promise<Object>} Browser context information
 *
 * @example
 * const info = await getBrowserInfo(page);
 * console.log(info.userAgent);
 */
export const getBrowserInfo = async (page: Page): Promise<Record<string, unknown>> => {
  try {
    return await page.evaluate(() => ({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      online: navigator.onLine,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
        colorDepth: window.screen.colorDepth,
        pixelDepth: window.screen.pixelDepth,
      },
    }));
  } catch (error) {
    logger.error(
      'Failed to get browser info',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Get performance metrics
 *
 * @async
 * @param {Page} page - Playwright page object
 * @returns {Promise<Object>} Performance metrics
 *
 * @example
 * const metrics = await getPerformanceMetrics(page);
 * console.log(`Load time: ${metrics.loadEventEnd}ms`);
 */
export const getPerformanceMetrics = async (page: Page): Promise<Record<string, unknown>> => {
  try {
    const metrics = await page.evaluate(() => {
      const timing = performance.timing;
      const navigation = performance.getEntriesByType('navigation')[0];

      return {
        // Navigation timing
        navigationStart: timing.navigationStart,
        domainLookupTime: timing.domainLookupEnd - timing.domainLookupStart,
        connectTime: timing.connectEnd - timing.connectStart,
        requestTime: timing.responseStart - timing.requestStart,
        responseTime: timing.responseEnd - timing.responseStart,
        domLoadTime: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
        loadEventEnd: timing.loadEventEnd - timing.navigationStart,

        // Paint timing
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint:
          performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,

        // Navigation type
        navigationType: ((navigation as { type?: string })?.type as string) || 'unknown',

        // Resource timing summary
        resourceCount: performance.getEntriesByType('resource').length,
      };
    });

    return metrics as Record<string, unknown>;
  } catch (error) {
    logger.error(
      'Failed to get performance metrics',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Wait for network idle
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {Object} [options] - Wait options
 * @param {number} [options.timeout=30000] - Timeout in milliseconds
 * @param {number} [options.idleTime=500] - Time to consider network idle
 * @returns {Promise<void>}
 *
 * @example
 * await waitForNetworkIdle(page, { timeout: 10000 });
 */
export const waitForNetworkIdle = async (
  page: Page,
  options: { timeout?: number; idleTime?: number } = {}
): Promise<void> => {
  const { timeout = 30000, idleTime = 500 } = options;

  try {
    // eslint-disable-next-line playwright/no-networkidle
    await page.waitForLoadState('networkidle', { timeout });
    // Additional wait for stability
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(idleTime);
    logger.info('Network is idle');
  } catch (error) {
    logger.error(
      'Failed waiting for network idle',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Enable offline mode
 *
 * @async
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 *
 * @example
 * await setOfflineMode(page, true);
 */
export const setOfflineMode = async (page: Page, offline: boolean = true): Promise<void> => {
  try {
    const context = page.context();
    await context.setOffline(offline);
    logger.info(`Offline mode: ${offline ? 'enabled' : 'disabled'}`);
  } catch (error) {
    logger.error(
      'Failed to set offline mode',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Set geolocation
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {Object} location - Location coordinates
 * @param {number} location.latitude - Latitude
 * @param {number} location.longitude - Longitude
 * @param {number} [location.accuracy=0] - Accuracy in meters
 * @returns {Promise<void>}
 *
 * @example
 * await setGeolocation(page, { latitude: 37.7749, longitude: -122.4194 });
 */
export const setGeolocation = async (
  page: Page,
  location: { latitude: number; longitude: number; accuracy?: number }
): Promise<void> => {
  try {
    const context = page.context();
    await context.setGeolocation({
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy || 0,
    });
    logger.info(`Set geolocation: ${location.latitude}, ${location.longitude}`);
  } catch (error) {
    logger.error(
      'Failed to set geolocation',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Set timezone
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} timezoneId - IANA timezone identifier (e.g., 'America/New_York')
 * @returns {Promise<void>}
 *
 * @example
 * await setTimezone(page, 'America/Los_Angeles');
 */
export const setTimezone = async (page: Page, timezoneId: string): Promise<void> => {
  try {
    const context = page.context();
    await (context as unknown as { setTimezone: (id: string) => Promise<void> }).setTimezone(
      timezoneId
    );
    logger.info(`Set timezone: ${timezoneId}`);
  } catch (error) {
    logger.error('Failed to set timezone', error instanceof Error ? error.message : String(error));
    throw error;
  }
};

/**
 * Get console messages
 *
 * @param {Page} page - Playwright page object
 * @param {Object} [options] - Filter options
 * @param {string} [options.type] - Message type filter ('log', 'error', 'warning', 'info')
 * @returns {Array} Array of console message objects
 *
 * @example
 * const consoleMessages = [];
 * page.on('console', msg => consoleMessages.push(msg));
 * const errors = getConsoleMessages(consoleMessages, { type: 'error' });
 */
export const getConsoleMessages = (
  messages: Array<{ type: () => string }>,
  options: { type?: string } = {}
): Array<{ type: () => string }> => {
  try {
    if (!options.type) {
      return messages;
    }
    return messages.filter(msg => msg.type() === options.type);
  } catch (error) {
    logger.error(
      'Failed to get console messages',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Inject script into page
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} script - JavaScript code to inject
 * @returns {Promise<any>} Result of the script execution
 *
 * @example
 * await injectScript(page, 'window.myCustomFunction = () => "Hello"');
 */
export const injectScript = async (page: Page, script: string): Promise<void> => {
  try {
    return await page.evaluate(script);
  } catch (error) {
    logger.error('Failed to inject script', error instanceof Error ? error.message : String(error));
    throw error;
  }
};

/**
 * Block specific resource types
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {Array<string>} resourceTypes - Resource types to block ('image', 'stylesheet', 'font', 'script', 'xhr', 'fetch', 'media')
 * @returns {Promise<void>}
 *
 * @example
 * await blockResources(page, ['image', 'font']);
 */
export const blockResources = async (page: Page, resourceTypes: string[] = []): Promise<void> => {
  try {
    await page.route('**/*', route => {
      if (resourceTypes.includes(route.request().resourceType())) {
        route.abort();
      } else {
        route.continue();
      }
    });
    logger.info(`Blocking resources: ${resourceTypes.join(', ')}`);
  } catch (error) {
    logger.error(
      'Failed to block resources',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Get all network requests
 *
 * @param {Page} page - Playwright page object
 * @returns {Array} Array to store network requests
 *
 * @example
 * const requests = [];
 * page.on('request', req => requests.push(req));
 * await page.goto('https://example.com');
 * const apiRequests = requests.filter(r => r.url().includes('/api/'));
 */
export const captureNetworkRequests = (page: Page): Array<Record<string, unknown>> => {
  const requests: Array<Record<string, unknown>> = [];
  page.on('request', request =>
    requests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      headers: request.headers(),
      postData: request.postData(),
      timestamp: Date.now(),
    })
  );
  return requests;
};

/**
 * Get all network responses
 *
 * @param {Page} page - Playwright page object
 * @returns {Array} Array to store network responses
 *
 * @example
 * const responses = [];
 * page.on('response', res => responses.push(res));
 * await page.goto('https://example.com');
 * const failedResponses = responses.filter(r => r.status() >= 400);
 */
export const captureNetworkResponses = (page: Page): Array<Record<string, unknown>> => {
  const responses: Array<Record<string, unknown>> = [];
  page.on('response', async response => {
    responses.push({
      url: response.url(),
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers(),
      timestamp: Date.now(),
    });
  });
  return responses;
};
