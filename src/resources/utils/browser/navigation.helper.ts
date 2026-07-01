/**
 * Navigation Helper Utilities
 * Comprehensive navigation and page state utilities
 *
 * @module NavigationHelper
 * @category UI Testing
 *
 * @description
 * This module provides utilities for:
 * - Page navigation (goto, back, forward)
 * - URL verification and waiting
 * - Network idle state management (waitForNetworkIdle re-exported from browser.helper)
 * - Page reload operations
 *
 * @example
 * import * as NavigationHelper from './navigation.helper';
 *
 * // Navigate to URL and wait for network idle
 * await NavigationHelper.navigateAndWaitForIdle(page, 'https://example.com');
 *
 * // Verify current URL matches expected
 * await NavigationHelper.verifyUrl(page, '/dashboard');
 */

import { Page } from '@playwright/test';
import { logger } from '@utils/core';
import { waitForNetworkIdle } from './browser.helper';

/**
 * Navigate to a URL
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} url - URL to navigate to
 * @param {Object} [options] - Navigation options
 * @param {number} [options.timeout=30000] - Navigation timeout
 * @param {string} [options.waitUntil='load'] - When to consider navigation successful
 * @returns {Promise<void>}
 *
 * @example
 * await goto(page, 'https://example.com/login');
 */
export const goto = async (
  page: Page,
  url: string,
  options: { timeout?: number; waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' } = {}
) => {
  const { timeout = 30000, waitUntil = 'load' } = options;

  try {
    logger.info(`Navigating to: ${url}`);
    await page.goto(url, { timeout, waitUntil });
    logger.info(`Successfully navigated to: ${url}`);
  } catch (error) {
    logger.error(
      `Failed to navigate to ${url}: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
};

/**
 * Navigate to URL and wait for network idle
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} url - URL to navigate to
 * @param {Object} [options] - Navigation options
 * @returns {Promise<void>}
 *
 * @example
 * await navigateAndWaitForIdle(page, 'https://example.com');
 */
export const navigateAndWaitForIdle = async (page: Page, url: string, options = {}) => {
  await goto(page, url, options);
  await waitForNetworkIdle(page);
};

/**
 * Wait for page URL to match expected URL
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} expectedUrl - Expected URL or URL pattern
 * @param {Object} [options] - Wait options
 * @param {number} [options.timeout=30000] - Timeout in milliseconds
 * @returns {Promise<void>}
 *
 * @example
 * await verifyUrl(page, 'https://example.com/dashboard');
 * await verifyUrl(page, /\/dashboard$/);
 */
export const verifyUrl = async (
  page: Page,
  expectedUrl: string | RegExp,
  options: { timeout?: number } = {}
) => {
  const { timeout = 30000 } = options;

  try {
    logger.info(`Waiting for URL to match: ${expectedUrl}`);
    await page.waitForURL(expectedUrl, { timeout });
    logger.info(`URL verified: ${page.url()}`);
  } catch (error) {
    logger.error(`URL verification failed. Expected: ${expectedUrl}, Actual: ${page.url()}`);
    throw error;
  }
};

/**
 * Reload the current page
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {Object} [options] - Reload options
 * @param {boolean} [options.waitForNetworkIdle=true] - Wait for network idle after reload
 * @param {number} [options.timeout=30000] - Timeout in milliseconds
 * @returns {Promise<void>}
 *
 * @example
 * await reloadPage(page);
 * await reloadPage(page, { waitForNetworkIdle: false });
 */
export const reloadPage = async (
  page: Page,
  options: { waitForNetworkIdle?: boolean; timeout?: number } = {}
) => {
  const { waitForNetworkIdle: shouldWaitForIdle = true, timeout = 30000 } = options;

  try {
    logger.info('Reloading page');
    await page.reload({ timeout });

    if (shouldWaitForIdle) {
      await waitForNetworkIdle(page, { timeout });
    }

    logger.info('Page reloaded successfully');
  } catch (error) {
    logger.error(
      `Failed to reload page: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
};

/**
 * Navigate back in browser history
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {Object} [options] - Navigation options
 * @param {number} [options.timeout=30000] - Timeout in milliseconds
 * @returns {Promise<void>}
 *
 * @example
 * await goBack(page);
 */
export const goBack = async (page: Page, options: { timeout?: number } = {}) => {
  const { timeout = 30000 } = options;

  try {
    logger.info('Navigating back');
    await page.goBack({ timeout });
    logger.info('Navigated back successfully');
  } catch (error) {
    logger.error(
      `Failed to navigate back: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
};

/**
 * Navigate forward in browser history
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {Object} [options] - Navigation options
 * @param {number} [options.timeout=30000] - Timeout in milliseconds
 * @returns {Promise<void>}
 *
 * @example
 * await goForward(page);
 */
export const goForward = async (page: Page, options: { timeout?: number } = {}) => {
  const { timeout = 30000 } = options;

  try {
    logger.info('Navigating forward');
    await page.goForward({ timeout });
    logger.info('Navigated forward successfully');
  } catch (error) {
    logger.error(
      `Failed to navigate forward: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
};

/**
 * Get the current page URL
 *
 * @param {Page} page - Playwright page object
 * @returns {string} Current URL
 *
 * @example
 * const currentUrl = getCurrentUrl(page);
 * console.log(`Current URL: ${currentUrl}`);
 */
export const getCurrentUrl = (page: Page): string => {
  return page.url();
};

/**
 * Get the page title
 *
 * @async
 * @param {Page} page - Playwright page object
 * @returns {Promise<string>} Page title
 *
 * @example
 * const title = await getPageTitle(page);
 * expect(title).toBe('Welcome | MyApp');
 */
export const getPageTitle = async (page: Page): Promise<string> => {
  return await page.title();
};

/**
 * Wait for page to load completely
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {Object} [options] - Load options
 * @param {string} [options.state='load'] - Load state to wait for
 * @param {number} [options.timeout=30000] - Timeout in milliseconds
 * @returns {Promise<void>}
 *
 * @example
 * await waitForPageLoad(page, { state: 'domcontentloaded' });
 */
export const waitForPageLoad = async (
  page: Page,
  options: { state?: 'load' | 'domcontentloaded' | 'networkidle'; timeout?: number } = {}
) => {
  const { state = 'load', timeout = 30000 } = options;

  try {
    logger.info(`Waiting for page load state: ${state}`);
    await page.waitForLoadState(state, { timeout });
    logger.info(`Page load state reached: ${state}`);
  } catch (error) {
    logger.error(
      `Failed to reach load state ${state}: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
};
