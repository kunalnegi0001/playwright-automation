/**
 * Verification Helper Utilities
 * Comprehensive element verification and assertion utilities
 *
 * @module VerificationHelper
 * @category UI Testing
 *
 * @description
 * This module provides utilities for:
 * - Element visibility verification
 * - Text content verification
 * - Button state verification
 * - Role-based element verification
 * - Generic state verification
 *
 * @example
 * import * as VerificationHelper from './verification.helper';
 *
 * // Verify element is visible
 * await VerificationHelper.verifyElementVisible(page, '#loginButton');
 *
 * // Verify text appears on page
 * await VerificationHelper.verifyTextVisible(page, 'Welcome back!');
 */

import { Page, expect } from '@playwright/test';
import { logger } from '@utils/core';

export type UIVerificationOptions = {
  index?: number;
  timeout?: number;
  exact?: boolean;
  state?: 'visible' | 'hidden' | 'attached' | 'detached';
};

/**
 * Verify that an element is visible on the page
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS/XPath selector for the element
 * @param {Object} [options] - Verification options
 * @returns {Promise<void>}
 *
 * @example
 * await verifyElementVisible(page, '#loginButton');
 * await verifyElementVisible(page, '.modal', { timeout: 5000 });
 */
export const verifyElementVisible = async (
  page: Page,
  selector: string,
  options: UIVerificationOptions = {}
) => {
  const { index = 0, timeout = 30000 } = options;

  try {
    const element = page.locator(selector).nth(index);
    await element.waitFor({ state: 'visible', timeout });
    logger.info(`Verified element visible: ${selector}`);
  } catch (error) {
    logger.error(`Element not visible: ${selector}`);
    throw error;
  }
};

/**
 * Verify that an element is hidden or not present on the page
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS/XPath selector for the element
 * @param {Object} [options] - Verification options
 * @returns {Promise<void>}
 *
 * @example
 * await verifyElementHidden(page, '#loadingSpinner');
 */
export const verifyElementHidden = async (
  page: Page,
  selector: string,
  options: UIVerificationOptions = {}
) => {
  const { index = 0, timeout = 30000 } = options;

  try {
    const element = page.locator(selector).nth(index);
    await element.waitFor({ state: 'hidden', timeout });
    logger.info(`Verified element hidden: ${selector}`);
  } catch (error) {
    logger.error(`Element not hidden: ${selector}`);
    throw error;
  }
};

/**
 * Verify that text content is visible on the page
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} text - Text content to verify
 * @param {Object} [options] - Verification options
 * @returns {Promise<void>}
 *
 * @example
 * await verifyTextVisible(page, 'Welcome back!');
 * await verifyTextVisible(page, 'error', { exact: false });
 */
export const verifyTextVisible = async (
  page: Page,
  text: string,
  options: UIVerificationOptions = {}
) => {
  const { exact = true, index = 0, timeout = 30000 } = options;

  try {
    const element = page.getByText(text, { exact });
    await element.nth(index).waitFor({ state: 'visible', timeout });
    logger.info(`Verified text visible: ${text}`);
  } catch (error) {
    logger.error(`Text not visible: ${text}`);
    throw error;
  }
};

/**
 * Verify that text content is hidden or not present on the page
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} text - Text content to verify
 * @param {Object} [options] - Verification options
 * @returns {Promise<void>}
 *
 * @example
 * await verifyTextHidden(page, 'Loading...');
 */
export const verifyTextHidden = async (
  page: Page,
  text: string,
  options: UIVerificationOptions = {}
) => {
  const { exact = true, index = 0, timeout = 30000 } = options;

  try {
    const element = page.getByText(text, { exact });
    await element.nth(index).waitFor({ state: 'hidden', timeout });
    logger.info(`Verified text hidden: ${text}`);
  } catch (error) {
    logger.error(`Text not hidden: ${text}`);
    throw error;
  }
};

/**
 * Verify that an element with specific ARIA role and name is visible
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} role - ARIA role
 * @param {string} name - Accessible name of the element
 * @param {Object} [options] - Verification options
 * @returns {Promise<void>}
 *
 * @example
 * await verifyRoleVisible(page, 'button', 'Submit');
 * await verifyRoleVisible(page, 'heading', 'Dashboard', { exact: false });
 */
export const verifyRoleVisible = async (
  page: Page,
  role: string,
  name: string,
  options: UIVerificationOptions = {}
) => {
  const { exact = true, index = 0, timeout = 30000 } = options;

  try {
    const element = page.getByRole(role as any, { name, exact });
    await element.nth(index).waitFor({ state: 'visible', timeout });
    logger.info(`Verified ${role} visible with name: ${name}`);
  } catch (error) {
    logger.error(`Role element not visible. Role: ${role}, Name: ${name}`);
    throw error;
  }
};

/**
 * Verify button state (enabled, disabled, visible, or hidden)
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS/XPath selector for the button
 * @param {string} state - Expected state
 * @param {Object} [options] - Verification options
 * @returns {Promise<void>}
 *
 * @example
 * await verifyButtonState(page, '#submitBtn', 'enabled');
 * await verifyButtonState(page, '.cancel', 'disabled');
 */
export const verifyButtonState = async (
  page: Page,
  selector: string,
  state: 'enabled' | 'disabled' | 'visible' | 'hidden',
  options: UIVerificationOptions = {}
) => {
  const { index = 0, timeout = 30000 } = options;

  try {
    const button = page.locator(selector).nth(index);

    switch (state) {
      case 'enabled':
        await button.waitFor({ state: 'visible', timeout });
        await expect(button).toBeEnabled({ timeout });
        break;
      case 'disabled':
        await button.waitFor({ state: 'visible', timeout });
        await expect(button).toBeDisabled({ timeout });
        break;
      case 'visible':
        await button.waitFor({ state: 'visible', timeout });
        break;
      case 'hidden':
        await button.waitFor({ state: 'hidden', timeout });
        break;
      default:
        logger.warn(`Unknown button state: ${state}`);
    }
    logger.info(`Verified button state "${state}": ${selector}`);
  } catch (error) {
    logger.error(`Button state verification failed. Selector: ${selector}, State: ${state}`);
    throw error;
  }
};

/**
 * Generic state verification method for any locator
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {string} state - The expected state
 * @param {Object} [options] - Verification options
 * @returns {Promise<void>}
 *
 * @example
 * await verifyElementState(page, '#submitBtn', 'enabled');
 * await verifyElementState(page, '.error-message', 'visible');
 */
export const verifyElementState = async (
  page: Page,
  selector: string,
  state: 'enabled' | 'disabled' | 'visible' | 'hidden' | 'focused' | 'attached',
  options: { negate?: boolean; timeout?: number; index?: number } = {}
) => {
  const { negate = false, timeout = 10000, index = 0 } = options;

  try {
    const locator = page.locator(selector).nth(index);
    // eslint-disable-next-line playwright/valid-expect
    const expectedLocator = negate ? expect(locator).not : expect(locator);

    switch (state) {
      case 'enabled':
        await expectedLocator.toBeEnabled({ timeout });
        break;
      case 'visible':
        await expectedLocator.toBeVisible({ timeout });
        break;
      case 'focused':
        await expectedLocator.toBeFocused({ timeout });
        break;
      case 'disabled':
        await expectedLocator.toBeDisabled({ timeout });
        break;
      case 'hidden':
        await expectedLocator.toBeHidden({ timeout });
        break;
      case 'attached':
        await expectedLocator.toBeAttached({ timeout });
        break;
      default:
        throw new Error(`Unsupported state requested: ${state}`);
    }
    logger.info(`Verified element state: ${state} for ${selector}`);
  } catch (error) {
    logger.error(`Element state verification failed. Selector: ${selector}, State: ${state}`);
    throw error;
  }
};

/**
 * Verify element count
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {number} expectedCount - Expected number of elements
 * @param {Object} [options] - Verification options
 * @returns {Promise<void>}
 *
 * @example
 * await verifyElementCount(page, '.product-item', 10);
 */
export const verifyElementCount = async (
  page: Page,
  selector: string,
  expectedCount: number,
  options: { timeout?: number } = {}
) => {
  const { timeout = 10000 } = options;

  try {
    const locator = page.locator(selector);
    await expect(locator).toHaveCount(expectedCount, { timeout });
    logger.info(`Verified element count: ${expectedCount} for ${selector}`);
  } catch (error) {
    logger.error(
      `Element count verification failed. Selector: ${selector}, Expected: ${expectedCount}`
    );
    throw error;
  }
};

/**
 * Verify element has specific text
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {string} expectedText - Expected text content
 * @param {Object} [options] - Verification options
 * @returns {Promise<void>}
 *
 * @example
 * await verifyElementText(page, '#username', 'John Doe');
 */
export const verifyElementText = async (
  page: Page,
  selector: string,
  expectedText: string | RegExp,
  options: { timeout?: number; index?: number } = {}
) => {
  const { timeout = 10000, index = 0 } = options;

  try {
    const locator = page.locator(selector).nth(index);
    await expect(locator).toHaveText(expectedText, { timeout });
    logger.info(`Verified element text: ${expectedText} for ${selector}`);
  } catch (error) {
    logger.error(
      `Element text verification failed. Selector: ${selector}, Expected: ${expectedText}`
    );
    throw error;
  }
};

/**
 * Verify element contains specific text
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {string} expectedText - Expected text content (partial match)
 * @param {Object} [options] - Verification options
 * @returns {Promise<void>}
 *
 * @example
 * await verifyElementContainsText(page, '.message', 'success');
 */
export const verifyElementContainsText = async (
  page: Page,
  selector: string,
  expectedText: string | RegExp,
  options: { timeout?: number; index?: number } = {}
) => {
  const { timeout = 10000, index = 0 } = options;

  try {
    const locator = page.locator(selector).nth(index);
    await expect(locator).toContainText(expectedText, { timeout });
    logger.info(`Verified element contains text: ${expectedText} for ${selector}`);
  } catch (error) {
    logger.error(
      `Element text verification failed. Selector: ${selector}, Expected to contain: ${expectedText}`
    );
    throw error;
  }
};
