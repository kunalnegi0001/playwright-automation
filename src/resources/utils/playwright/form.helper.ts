/**
 * Form Helper Utilities
 * Comprehensive form interaction utilities
 *
 * @module FormHelper
 * @category UI Testing
 *
 * @description
 * This module provides utilities for:
 * - Textbox/input field interactions
 * - Checkbox and radio button handling
 * - Form filling by various selectors (placeholder, label, role)
 * - Form submission and validation
 *
 * Note: For typing with delay or clearing inputs, use KeyboardHelper.typeWithDelay() and KeyboardHelper.clearInput()
 *
 * @example
 * import * as FormHelper from './form.helper';
 *
 * // Fill form fields
 * await FormHelper.fillByPlaceholder(page, 'Email', 'user@example.com');
 * await FormHelper.fillByLabel(page, 'Password', 'secret123');
 */

import { Page } from '@playwright/test';
import { logger } from '@utils/core';

export type UIFillOptions = {
  index?: number;
  timeout?: number;
  exact?: boolean;
};

/**
 * Fill textbox with value
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS/XPath selector for textbox
 * @param {string} value - Text value to fill
 * @param {Object} [options] - Fill options
 * @returns {Promise<void>}
 *
 * @example
 * await fillTextbox(page, '#email', 'user@example.com');
 */
export const fillTextbox = async (
  page: Page,
  selector: string,
  value: string,
  options: UIFillOptions = {}
) => {
  const { index = 0 } = options;

  try {
    const textbox = page.locator(selector).nth(index);
    await textbox.click();
    await textbox.fill(value);
    logger.info(`Filled textbox ${selector} with: ${value}`);
  } catch (error) {
    logger.error(
      `Failed to fill textbox ${selector}: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
};

/**
 * Fill textbox by placeholder text
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} placeholder - Placeholder text
 * @param {string} value - Text value to fill
 * @param {Object} [options] - Fill options
 * @returns {Promise<void>}
 *
 * @example
 * await fillByPlaceholder(page, 'Enter email', 'user@example.com');
 */
export const fillByPlaceholder = async (
  page: Page,
  placeholder: string,
  value: string,
  _options: UIFillOptions = {}
) => {
  try {
    const textbox = page.getByPlaceholder(placeholder);
    await textbox.click();
    await textbox.fill(value);
    logger.info(`Filled textbox with placeholder "${placeholder}" with: ${value}`);
  } catch (error) {
    logger.error(
      `Failed to fill textbox by placeholder "${placeholder}": ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
};

/**
 * Fill textbox by associated label text
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} label - Label text
 * @param {string} value - Text value to fill
 * @param {Object} [options] - Fill options
 * @returns {Promise<void>}
 *
 * @example
 * await fillByLabel(page, 'Email Address', 'user@example.com');
 */
export const fillByLabel = async (
  page: Page,
  label: string,
  value: string,
  options: UIFillOptions = {}
) => {
  const { exact = true } = options;

  try {
    const textbox = page.getByLabel(label, { exact });
    await textbox.click();
    await textbox.fill(value);
    logger.info(`Filled textbox with label "${label}" with: ${value}`);
  } catch (error) {
    logger.error(
      `Failed to fill textbox by label "${label}": ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
};

/**
 * Press Enter key on textbox (useful for search forms)
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS/XPath selector for textbox
 * @param {Object} [options] - Press options
 * @returns {Promise<void>}
 *
 * @example
 * await pressEnterOnTextbox(page, '#searchInput');
 */
export const pressEnterOnTextbox = async (
  page: Page,
  selector: string,
  options: UIFillOptions = {}
) => {
  const { index = 0 } = options;

  try {
    const textbox = page.locator(selector).nth(index);
    await textbox.press('Enter');
    logger.info(`Pressed Enter on textbox: ${selector}`);
  } catch (error) {
    logger.error(
      `Failed to press Enter on textbox ${selector}: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
};

/**
 * Set checkbox to checked or unchecked state
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS/XPath selector for checkbox
 * @param {string} state - Desired state: 'checked' or 'unchecked'
 * @param {Object} [options] - Checkbox options
 * @returns {Promise<void>}
 *
 * @example
 * await setCheckboxState(page, '#terms', 'checked');
 * await setCheckboxState(page, '#newsletter', 'unchecked');
 */
export const setCheckboxState = async (
  page: Page,
  selector: string,
  state: 'checked' | 'unchecked',
  options: UIFillOptions = {}
) => {
  const { index = 0 } = options;

  try {
    const checkbox = page.locator(selector).nth(index);

    if (state === 'checked') {
      await checkbox.check();
      logger.info(`Checked checkbox: ${selector}`);
    } else {
      await checkbox.uncheck();
      logger.info(`Unchecked checkbox: ${selector}`);
    }
  } catch (error) {
    logger.error(
      `Failed to set checkbox ${selector} to ${state}: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
};

/**
 * Set checkbox by label text
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} label - Label text for checkbox
 * @param {string} state - Desired state: 'checked' or 'unchecked'
 * @param {Object} [options] - Checkbox options
 * @returns {Promise<void>}
 *
 * @example
 * await setCheckboxByLabel(page, 'I agree to terms', 'checked');
 */
export const setCheckboxByLabel = async (
  page: Page,
  label: string,
  state: 'checked' | 'unchecked',
  options: UIFillOptions = {}
) => {
  const { exact = true } = options;

  try {
    const checkbox = page.getByLabel(label, { exact });

    if (state === 'checked') {
      await checkbox.check();
      logger.info(`Checked checkbox with label: ${label}`);
    } else {
      await checkbox.uncheck();
      logger.info(`Unchecked checkbox with label: ${label}`);
    }
  } catch (error) {
    logger.error(
      `Failed to set checkbox by label "${label}" to ${state}: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
};

/**
 * Click radio button
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS/XPath selector for radio button
 * @param {Object} [options] - Click options
 * @returns {Promise<void>}
 *
 * @example
 * await clickRadioButton(page, 'input[name="gender"][value="male"]');
 */
export const clickRadioButton = async (
  page: Page,
  selector: string,
  options: UIFillOptions = {}
) => {
  const { index = 0 } = options;

  try {
    const radio = page.locator(selector).nth(index);
    await radio.click();
    logger.info(`Clicked radio button: ${selector}`);
  } catch (error) {
    logger.error(
      `Failed to click radio button ${selector}: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
};

/**
 * Click radio button by label text
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} label - Label text for radio button
 * @param {Object} [options] - Click options
 * @returns {Promise<void>}
 *
 * @example
 * await clickRadioByLabel(page, 'Male');
 */
export const clickRadioByLabel = async (page: Page, label: string, options: UIFillOptions = {}) => {
  const { exact = true } = options;

  try {
    const radio = page.getByLabel(label, { exact });
    await radio.click();
    logger.info(`Clicked radio button with label: ${label}`);
  } catch (error) {
    logger.error(
      `Failed to click radio button by label "${label}": ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
};

/**
 * Check if a radio button is checked
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS/XPath selector for the radio button
 * @param {Object} [options] - Check options
 * @returns {Promise<boolean>} True if radio button is checked
 *
 * @example
 * const isChecked = await isRadioButtonChecked(page, 'input[name="gender"][value="male"]');
 */
export const isRadioButtonChecked = async (
  page: Page,
  selector: string,
  options: UIFillOptions = {}
): Promise<boolean> => {
  const { index = 0 } = options;

  try {
    const radio = page.locator(selector).nth(index);
    return await radio.isChecked();
  } catch (error) {
    logger.error(
      `Failed to check radio button state ${selector}: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
};
