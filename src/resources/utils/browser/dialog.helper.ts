/**
 * Dialog Helper Utilities
 * Comprehensive dialog and alert handling utilities
 *
 * @module DialogHelper
 * @category UI Testing
 *
 * @description
 * This module provides utilities for:
 * - Browser dialog handling (alert, confirm, prompt)
 * - Alert dialog verification
 * - Dialog message extraction
 *
 * @example
 * import * as DialogHelper from './dialog.helper';
 *
 * // Handle next dialog that appears
 * await DialogHelper.handleDialog(page, 'accept');
 *
 * // Verify alert is visible
 * await DialogHelper.verifyAlertVisible(page, 'Error: Invalid input');
 */

import { Page } from '@playwright/test';
import { logger } from '@utils/core';

/**
 * Set up a handler for browser dialogs (alert, confirm, prompt)
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} [action='accept'] - Action to take: 'accept' or 'dismiss'
 * @param {string} [promptText=''] - Text to enter for prompt dialogs
 * @returns {Promise<void>}
 *
 * @example
 * await handleDialog(page, 'accept');
 * await handleDialog(page, 'accept', 'My input text');
 * await handleDialog(page, 'dismiss');
 */
export const handleDialog = async (
  page: Page,
  action: 'accept' | 'dismiss' = 'accept',
  promptText: string = ''
) => {
  try {
    page.once('dialog', async dialog => {
      logger.info(`Dialog detected: ${dialog.type()} - ${dialog.message()}`);

      if (action === 'accept') {
        await dialog.accept(promptText);
        logger.info(`Dialog accepted with text: ${promptText || 'none'}`);
      } else {
        await dialog.dismiss();
        logger.info('Dialog dismissed');
      }
    });
  } catch (error) {
    logger.error(
      `Failed to handle dialog: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
};

/**
 * Handle dialog and return the message
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} [action='accept'] - Action to take: 'accept' or 'dismiss'
 * @param {string} [promptText=''] - Text to enter for prompt dialogs
 * @returns {Promise<string>} Dialog message
 *
 * @example
 * const message = await handleDialogAndGetMessage(page, 'accept');
 * console.log(`Dialog message: ${message}`);
 */
export const handleDialogAndGetMessage = async (
  page: Page,
  action: 'accept' | 'dismiss' = 'accept',
  promptText: string = ''
): Promise<string> => {
  return new Promise(resolve => {
    page.once('dialog', async dialog => {
      const message = dialog.message();
      logger.info(`Dialog detected: ${dialog.type()} - ${message}`);

      if (action === 'accept') {
        await dialog.accept(promptText);
        logger.info(`Dialog accepted with text: ${promptText || 'none'}`);
      } else {
        await dialog.dismiss();
        logger.info('Dialog dismissed');
      }

      resolve(message);
    });
  });
};

/**
 * Verify that an alert dialog is visible with optional message check
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} [message] - Expected alert message (optional)
 * @param {Object} [options] - Verification options
 * @returns {Promise<void>}
 *
 * @example
 * await verifyAlertVisible(page, 'Error: Invalid input');
 * await verifyAlertVisible(page); // Any alert
 */
export const verifyAlertVisible = async (
  page: Page,
  message?: string,
  options: { timeout?: number } = {}
) => {
  const { timeout = 30000 } = options;

  try {
    const alert = page.getByRole('alertdialog');
    await alert.waitFor({ state: 'visible', timeout });

    if (message) {
      await alert.getByText(message).waitFor({ state: 'visible' });
    }

    logger.info(`Verified alert visible: ${message || 'any'}`);
  } catch (error) {
    logger.error(`Alert not visible: ${message || 'any'}`);
    throw error;
  }
};

/**
 * Wait for a dialog to appear and handle it
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {Function} triggerAction - Function that triggers the dialog
 * @param {string} [action='accept'] - Action to take: 'accept' or 'dismiss'
 * @param {string} [promptText=''] - Text to enter for prompt dialogs
 * @returns {Promise<string>} Dialog message
 *
 * @example
 * const message = await waitForDialogAndHandle(
 *   page,
 *   async () => await page.click('#deleteBtn'),
 *   'accept'
 * );
 */
export const waitForDialogAndHandle = async (
  page: Page,
  triggerAction: () => Promise<void>,
  action: 'accept' | 'dismiss' = 'accept',
  promptText: string = ''
): Promise<string> => {
  let dialogMessage = '';

  const dialogPromise = page.waitForEvent('dialog').then(async dialog => {
    dialogMessage = dialog.message();
    logger.info(`Dialog detected: ${dialog.type()} - ${dialogMessage}`);

    if (action === 'accept') {
      await dialog.accept(promptText);
    } else {
      await dialog.dismiss();
    }
  });

  await triggerAction();
  await dialogPromise;

  return dialogMessage;
};

/**
 * Dismiss all dialogs automatically
 *
 * @param {Page} page - Playwright page object
 * @returns {void}
 *
 * @example
 * autoDismissDialogs(page);
 */
export const autoDismissDialogs = (page: Page) => {
  page.on('dialog', async dialog => {
    logger.info(`Auto-dismissing dialog: ${dialog.type()} - ${dialog.message()}`);
    await dialog.dismiss();
  });
};

/**
 * Auto accept all dialogs
 *
 * @param {Page} page - Playwright page object
 * @returns {void}
 *
 * @example
 * autoAcceptDialogs(page);
 */
export const autoAcceptDialogs = (page: Page) => {
  page.on('dialog', async dialog => {
    logger.info(`Auto-accepting dialog: ${dialog.type()} - ${dialog.message()}`);
    await dialog.accept();
  });
};

/**
 * Remove all dialog listeners
 *
 * @param {Page} page - Playwright page object
 * @returns {void}
 *
 * @example
 * removeDialogListeners(page);
 */
export const removeDialogListeners = (page: Page) => {
  page.removeAllListeners('dialog');
  logger.info('All dialog listeners removed');
};
