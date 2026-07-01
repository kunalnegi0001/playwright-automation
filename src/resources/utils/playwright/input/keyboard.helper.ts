/**
 * @fileoverview Comprehensive keyboard interaction utilities for Playwright.
 * Provides shortcuts, special keys, text input simulation, and modifier combinations.
 * @module ui/keyboard.helper
 * @category UI Testing
 *
 * @description
 * This module provides utilities for:
 * - Keyboard shortcuts and combinations
 * - Special key handling
 * - Text input simulation
 * - Modifier key combinations
 *
 * @example
 * import * as KeyboardHelper from './keyboard.helper';
 * await KeyboardHelper.pressShortcut(page, 'Control+S');
 * await KeyboardHelper.typeWithDelay(page, 'input', 'Hello', 100);
 */

import { Page } from '@playwright/test';
import { logger } from '@utils/core';

/**
 * Press keyboard shortcut
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} shortcut - Keyboard shortcut (e.g., 'Control+S', 'Shift+Alt+T')
 * @returns {Promise<void>}
 *
 * @example
 * await pressShortcut(page, 'Control+S'); // Save
 * await pressShortcut(page, 'Control+Shift+P'); // Command palette
 */
export const pressShortcut = async (page: Page, shortcut: string): Promise<void> => {
  try {
    await page.keyboard.press(shortcut);
    logger.info(`Pressed shortcut: ${shortcut}`);
  } catch (error) {
    logger.error(
      `Failed to press shortcut: ${shortcut}`,
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
};

/**
 * Type text with delay between keystrokes
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector (optional, if provided will focus first)
 * @param {string} text - Text to type
 * @param {number} [delay=50] - Delay between keystrokes in milliseconds
 * @returns {Promise<void>}
 *
 * @example
 * await typeWithDelay(page, '#search', 'test query', 100);
 */
export const typeWithDelay = async (
  page: Page,
  selector: string | null,
  text: string,
  delay = 50
): Promise<void> => {
  try {
    if (selector) {
      await page.focus(selector);
    }
    await page.keyboard.type(text, { delay });
    logger.info(`Typed text with delay: ${text.substring(0, 20)}...`);
  } catch (error) {
    logger.error(
      'Failed to type with delay',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
};

/**
 * Press Tab key
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {number} [times=1] - Number of times to press Tab
 * @returns {Promise<void>}
 *
 * @example
 * await pressTab(page, 3); // Tab through 3 elements
 */
export const pressTab = async (page: Page, times = 1) => {
  try {
    for (let i = 0; i < times; i++) {
      await page.keyboard.press('Tab');
    }
    logger.info(`Pressed Tab ${times} time(s)`);
  } catch (error) {
    logger.error('Failed to press Tab', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
};

/**
 * Press Shift+Tab key
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {number} [times=1] - Number of times to press Shift+Tab
 * @returns {Promise<void>}
 *
 * @example
 * await pressShiftTab(page, 2); // Navigate backwards 2 elements
 */
export const pressShiftTab = async (page: Page, times = 1) => {
  try {
    for (let i = 0; i < times; i++) {
      await page.keyboard.press('Shift+Tab');
    }
    logger.info(`Pressed Shift+Tab ${times} time(s)`);
  } catch (error) {
    logger.error('Failed to press Shift+Tab', error);
    throw error;
  }
};

/**
 * Press Enter key
 *
 * @async
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 *
 * @example
 * await pressEnter(page);
 */
export const pressEnter = async (page: Page) => {
  try {
    await page.keyboard.press('Enter');
    logger.info('Pressed Enter');
  } catch (error) {
    logger.error('Failed to press Enter', error);
    throw error;
  }
};

/**
 * Press Escape key
 *
 * @async
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 *
 * @example
 * await pressEscape(page);
 */
export const pressEscape = async (page: Page) => {
  try {
    await page.keyboard.press('Escape');
    logger.info('Pressed Escape');
  } catch (error) {
    logger.error('Failed to press Escape', error);
    throw error;
  }
};

/**
 * Press Backspace key
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {number} [times=1] - Number of times to press Backspace
 * @returns {Promise<void>}
 *
 * @example
 * await pressBackspace(page, 5); // Delete 5 characters
 */
export const pressBackspace = async (page: Page, times = 1) => {
  try {
    for (let i = 0; i < times; i++) {
      await page.keyboard.press('Backspace');
    }
    logger.info(`Pressed Backspace ${times} time(s)`);
  } catch (error) {
    logger.error('Failed to press Backspace', error);
    throw error;
  }
};

/**
 * Press Delete key
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {number} [times=1] - Number of times to press Delete
 * @returns {Promise<void>}
 *
 * @example
 * await pressDelete(page, 3);
 */
export const pressDelete = async (page: Page, times = 1) => {
  try {
    for (let i = 0; i < times; i++) {
      await page.keyboard.press('Delete');
    }
    logger.info(`Pressed Delete ${times} time(s)`);
  } catch (error) {
    logger.error('Failed to press Delete', error);
    throw error;
  }
};

/**
 * Press Arrow key
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} direction - Direction ('Up', 'Down', 'Left', 'Right')
 * @param {number} [times=1] - Number of times to press
 * @returns {Promise<void>}
 *
 * @example
 * await pressArrow(page, 'Down', 3); // Navigate down 3 items
 */
export const pressArrow = async (page: Page, direction: string, times = 1) => {
  const validDirections = ['Up', 'Down', 'Left', 'Right'];

  if (!validDirections.includes(direction)) {
    throw new Error(
      `Invalid direction: ${direction}. Must be one of: ${validDirections.join(', ')}`
    );
  }

  try {
    for (let i = 0; i < times; i++) {
      await page.keyboard.press(`Arrow${direction}`);
    }
    logger.info(`Pressed Arrow${direction} ${times} time(s)`);
  } catch (error) {
    logger.error(`Failed to press Arrow${direction}`, error);
    throw error;
  }
};

/**
 * Select all text (Control+A / Command+A)
 *
 * @async
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 *
 * @example
 * await selectAll(page);
 */
export const selectAll = async (page: Page) => {
  try {
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+A' : 'Control+A');
    logger.info('Selected all text');
  } catch (error) {
    logger.error('Failed to select all', error);
    throw error;
  }
};

/**
 * Copy selected text (Control+C / Command+C)
 *
 * @async
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 *
 * @example
 * await copyText(page);
 */
export const copyText = async (page: Page) => {
  try {
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+C' : 'Control+C');
    logger.info('Copied text');
  } catch (error) {
    logger.error('Failed to copy text', error);
    throw error;
  }
};

/**
 * Paste text (Control+V / Command+V)
 *
 * @async
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 *
 * @example
 * await pasteText(page);
 */
export const pasteText = async (page: Page) => {
  try {
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+V' : 'Control+V');
    logger.info('Pasted text');
  } catch (error) {
    logger.error('Failed to paste text', error);
    throw error;
  }
};

/**
 * Cut selected text (Control+X / Command+X)
 *
 * @async
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 *
 * @example
 * await cutText(page);
 */
export const cutText = async (page: Page) => {
  try {
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+X' : 'Control+X');
    logger.info('Cut text');
  } catch (error) {
    logger.error('Failed to cut text', error);
    throw error;
  }
};

/**
 * Undo action (Control+Z / Command+Z)
 *
 * @async
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 *
 * @example
 * await undo(page);
 */
export const undo = async (page: Page) => {
  try {
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+Z' : 'Control+Z');
    logger.info('Performed undo');
  } catch (error) {
    logger.error('Failed to undo', error);
    throw error;
  }
};

/**
 * Redo action (Control+Y / Command+Shift+Z)
 *
 * @async
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 *
 * @example
 * await redo(page);
 */
export const redo = async (page: Page) => {
  try {
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+Shift+Z' : 'Control+Y');
    logger.info('Performed redo');
  } catch (error) {
    logger.error('Failed to redo', error);
    throw error;
  }
};

/**
 * Clear input field
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Input selector
 * @returns {Promise<void>}
 *
 * @example
 * await clearInput(page, '#email');
 */
export const clearInput = async (page: Page, selector: string) => {
  try {
    await page.focus(selector);
    await selectAll(page);
    await page.keyboard.press('Backspace');
    logger.info(`Cleared input: ${selector}`);
  } catch (error) {
    logger.error(`Failed to clear input: ${selector}`, error);
    throw error;
  }
};

/**
 * Type text and press Enter
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Input selector
 * @param {string} text - Text to type
 * @returns {Promise<void>}
 *
 * @example
 * await typeAndEnter(page, '#search', 'test query');
 */
export const typeAndEnter = async (page: Page, selector: string, text: string) => {
  try {
    await page.fill(selector, text);
    await pressEnter(page);
    logger.info(`Typed and pressed Enter: ${text}`);
  } catch (error) {
    logger.error('Failed to type and press Enter', error);
    throw error;
  }
};

/**
 * Hold modifier key and perform action
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} modifier - Modifier key ('Shift', 'Control', 'Alt', 'Meta')
 * @param {Function} action - Async function to execute while holding modifier
 * @returns {Promise<void>}
 *
 * @example
 * await holdModifierAndAct(page, 'Shift', async () => {
 *   await page.click('.item-1');
 *   await page.click('.item-2');
 * });
 */
export const holdModifierAndAct = async (
  page: Page,
  modifier: string,
  action: () => Promise<void>
) => {
  try {
    await page.keyboard.down(modifier);
    await action();
    await page.keyboard.up(modifier);
    logger.info(`Performed action with ${modifier} modifier`);
  } catch (error) {
    logger.error(`Failed to perform action with ${modifier} modifier`, error);
    // Ensure modifier is released
    await page.keyboard.up(modifier);
    throw error;
  }
};

/**
 * Press Home key
 *
 * @async
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 *
 * @example
 * await pressHome(page);
 */
export const pressHome = async (page: Page) => {
  try {
    await page.keyboard.press('Home');
    logger.info('Pressed Home');
  } catch (error) {
    logger.error('Failed to press Home', error);
    throw error;
  }
};

/**
 * Press End key
 *
 * @async
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 *
 * @example
 * await pressEnd(page);
 */
export const pressEnd = async (page: Page) => {
  try {
    await page.keyboard.press('End');
    logger.info('Pressed End');
  } catch (error) {
    logger.error('Failed to press End', error);
    throw error;
  }
};

/**
 * Press Page Up key
 *
 * @async
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 *
 * @example
 * await pressPageUp(page);
 */
export const pressPageUp = async (page: Page) => {
  try {
    await page.keyboard.press('PageUp');
    logger.info('Pressed PageUp');
  } catch (error) {
    logger.error('Failed to press PageUp', error);
    throw error;
  }
};

/**
 * Press Page Down key
 *
 * @async
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 *
 * @example
 * await pressPageDown(page);
 */
export const pressPageDown = async (page: Page) => {
  try {
    await page.keyboard.press('PageDown');
    logger.info('Pressed PageDown');
  } catch (error) {
    logger.error('Failed to press PageDown', error);
    throw error;
  }
};

/**
 * Press Space key
 *
 * @async
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 *
 * @example
 * await pressSpace(page);
 */
export const pressSpace = async (page: Page) => {
  try {
    await page.keyboard.press('Space');
    logger.info('Pressed Space');
  } catch (error) {
    logger.error('Failed to press Space', error);
    throw error;
  }
};

/**
 * Common keyboard shortcuts
 */
export const SHORTCUTS = {
  SAVE: 'Control+S',
  SAVE_MAC: 'Meta+S',
  OPEN: 'Control+O',
  OPEN_MAC: 'Meta+O',
  FIND: 'Control+F',
  FIND_MAC: 'Meta+F',
  REFRESH: 'F5',
  REFRESH_HARD: 'Control+Shift+R',
  REFRESH_HARD_MAC: 'Meta+Shift+R',
  NEW_TAB: 'Control+T',
  NEW_TAB_MAC: 'Meta+T',
  CLOSE_TAB: 'Control+W',
  CLOSE_TAB_MAC: 'Meta+W',
  REOPEN_TAB: 'Control+Shift+T',
  REOPEN_TAB_MAC: 'Meta+Shift+T',
  DEV_TOOLS: 'F12',
  DEV_TOOLS_ALT: 'Control+Shift+I',
  ZOOM_IN: 'Control+Plus',
  ZOOM_IN_MAC: 'Meta+Plus',
  ZOOM_OUT: 'Control+Minus',
  ZOOM_OUT_MAC: 'Meta+Minus',
  ZOOM_RESET: 'Control+0',
  ZOOM_RESET_MAC: 'Meta+0',
};
