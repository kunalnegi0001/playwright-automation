/**
 * @fileoverview Comprehensive iframe handling utilities for Playwright.
 * Provides iframe detection, switching, cross-frame interaction, and nested frame support.
 * @module ui/iframe.helper
 * @category UI Testing
 *
 * Features:
 * - IFrame detection and waiting
 * - Frame switching and navigation
 * - Cross-frame element interaction
 * - Nested iframe handling
 * - Frame content validation
 *
 * @example
 * import * as IFrameHelper from './iframe.helper';
 * const frame = await IFrameHelper.waitForFrame(page, '#payment-iframe');
 * await frame.fill('#card-number', '4111111111111111');
 */

import { Page, FrameLocator, Frame, ElementHandle } from '@playwright/test';
import { logger } from '@utils/core';

/**
 * Wait for iframe to be attached and ready
 *
 * @param {Page} page - Playwright page object
 * @param {string} selector - IFrame selector (CSS or XPath)
 * @param {Object} options - Wait options
 * @param {number} options.timeout - Timeout in milliseconds (default: 30000)
 * @param {string} options.state - Wait for state: 'attached', 'visible' (default: 'attached')
 * @returns {Promise<FrameLocator>} Frame locator
 *
 * @example
 * const frame = await waitForFrame(page, '#stripe-iframe', { timeout: 10000 });
 */
export const waitForFrame = async (
  page: Page,
  selector: string,
  options: { timeout?: number; state?: 'attached' | 'detached' | 'visible' | 'hidden' } = {}
): Promise<FrameLocator> => {
  const { timeout = 30000, state = 'attached' } = options;

  try {
    logger.info(`Waiting for iframe: ${selector}`);

    // Wait for iframe element to be in DOM
    await page.locator(selector).waitFor({ state, timeout });

    // Get frame locator
    const frameLocator = page.frameLocator(selector);

    // Verify frame is accessible by waiting for its content
    await frameLocator
      .locator('body')
      .waitFor({ timeout: 5000 })
      .catch(() => {
        // Some iframes might not have body immediately
        logger.warn('Frame body not immediately accessible');
      });

    logger.info(`IFrame ready: ${selector}`);
    return frameLocator;
  } catch (error) {
    logger.error(
      `Failed to load iframe: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    throw new Error(`IFrame not found or not accessible: ${selector}`);
  }
};

/**
 * Get frame by name or URL pattern
 *
 * @param {Page} page - Playwright page object
 * @param {string|RegExp} nameOrUrl - Frame name or URL pattern
 * @returns {Promise<Frame|null>} Frame object or null
 *
 * @example
 * const frame = await getFrameByName(page, 'payment-frame');
 * const frame = await getFrameByName(page, /stripe\.com/);
 */
export const getFrameByName = async (
  page: Page,
  nameOrUrl: string | RegExp
): Promise<Frame | null> => {
  try {
    const frames = page.frames();

    for (const frame of frames) {
      const frameName = frame.name();
      const frameUrl = frame.url();

      if (typeof nameOrUrl === 'string') {
        if (frameName === nameOrUrl || frameUrl.includes(nameOrUrl)) {
          logger.info(`Found frame by name/url: ${nameOrUrl}`);
          return frame;
        }
      } else if (nameOrUrl instanceof RegExp) {
        if (nameOrUrl.test(frameUrl) || nameOrUrl.test(frameName)) {
          logger.info(`Found frame matching pattern: ${nameOrUrl}`);
          return frame;
        }
      }
    }

    logger.warn(`Frame not found: ${nameOrUrl}`);
    return null;
  } catch (error) {
    logger.error('Error finding frame', error instanceof Error ? error.message : String(error));
    return null;
  }
};

/**
 * Get all frames on the page
 *
 * @param {Page} page - Playwright page object
 * @param {Object} options - Filter options
 * @param {boolean} options.includeMain - Include main frame (default: false)
 * @param {RegExp} options.urlPattern - Filter by URL pattern
 * @returns {Promise<Array<Object>>} Array of frame information
 *
 * @example
 * const frames = await getAllFrames(page, { includeMain: false });
 * // Returns: [{ name: 'iframe1', url: 'https://...', frame: Frame }]
 */
export const getAllFrames = async (
  page: Page,
  options: { includeMain?: boolean; urlPattern?: string | RegExp } = {}
): Promise<Array<{ name: string; url: string; isMain: boolean; frame: Frame }>> => {
  const { includeMain = false, urlPattern = null } = options;

  try {
    const frames = page.frames();
    const frameInfo = [];

    for (const frame of frames) {
      const isMainFrame = frame === page.mainFrame();

      if (!includeMain && isMainFrame) {
        continue;
      }

      const url = frame.url();

      if (urlPattern) {
        if (typeof urlPattern === 'string' && !url.includes(urlPattern)) {
          continue;
        } else if (urlPattern instanceof RegExp && !urlPattern.test(url)) {
          continue;
        }
      }

      frameInfo.push({
        name: frame.name(),
        url,
        isMain: isMainFrame,
        frame,
      });
    }

    logger.info(`Found ${frameInfo.length} frames`);
    return frameInfo as Array<{
      name: string;
      url: string;
      isMain: boolean;
      frame: Frame;
    }>;
  } catch (error) {
    logger.error('Error getting frames', error instanceof Error ? error.message : String(error));
    return [];
  }
};

/**
 * Switch to iframe and execute actions
 *
 * @param {Page} page - Playwright page object
 * @param {string} selector - IFrame selector
 * @param {Function} callback - Function to execute in frame context
 * @returns {Promise<any>} Result of callback function
 *
 * @example
 * const result = await switchToFrameAndExecute(page, '#payment-iframe', async (frame) => {
 *   await frame.fill('#card-number', '4111111111111111');
 *   return await frame.textContent('.total');
 * });
 */
export const switchToFrameAndExecute = async <T>(
  page: Page,
  selector: string,
  callback: (frame: FrameLocator) => Promise<T>
): Promise<T> => {
  try {
    const frameLocator = await waitForFrame(page, selector);
    logger.info(`Executing actions in frame: ${selector}`);

    const result = await callback(frameLocator);

    logger.info(`Frame actions completed: ${selector}`);
    return result;
  } catch (error) {
    logger.error(
      `Failed to execute frame actions: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Check if element is inside an iframe
 *
 * @param {Page} page - Playwright page object
 * @param {string} elementSelector - Element selector
 * @returns {Promise<boolean>} True if element is in iframe
 *
 * @example
 * const isInFrame = await isElementInFrame(page, '#submit-button');
 */
export const isElementInFrame = async (page: Page, elementSelector: string): Promise<boolean> => {
  try {
    // Try to find element in main frame
    const mainElement = (await page.$(elementSelector).catch(() => null)) as ElementHandle | null;
    if (mainElement) {
      return false;
    }

    // Check all frames
    const frames = page.frames();
    for (const frame of frames) {
      if (frame === page.mainFrame()) {
        continue;
      }

      const frameElement = (await frame
        .$(elementSelector)
        .catch(() => null)) as ElementHandle | null;
      if (frameElement) {
        logger.info(`Element found in frame: ${elementSelector}`);
        return true;
      }
    }

    return false;
  } catch (error) {
    logger.error(
      'Error checking element frame location',
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
};

/**
 * Find element across all frames
 *
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @returns {Promise<Object|null>} Object with frame and element, or null
 *
 * @example
 * const result = await findElementInFrames(page, '#payment-button');
 * if (result) {
 *   await result.element.click();
 * }
 */
export const findElementInFrames = async (
  page: Page,
  selector: string
): Promise<{
  frame: Frame;
  element: ElementHandle;
  frameName: string;
  frameUrl: string;
} | null> => {
  try {
    const frames = page.frames();

    for (const frame of frames) {
      const element = (await frame.$(selector).catch(() => null)) as ElementHandle | null;

      if (element) {
        logger.info(`Element found in frame: ${selector}`, {
          frameName: frame.name(),
          frameUrl: frame.url(),
        });

        return {
          frame,
          element: element as ElementHandle,
          frameName: frame.name(),
          frameUrl: frame.url(),
        };
      }
    }

    logger.warn(`Element not found in any frame: ${selector}`);
    return null;
  } catch (error) {
    logger.error(
      'Error finding element in frames',
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
};

/**
 * Get nested iframe (iframe within iframe)
 *
 * @param {Page} page - Playwright page object
 * @param {Array<string>} selectors - Array of iframe selectors from parent to child
 * @returns {Promise<FrameLocator>} Nested frame locator
 *
 * @example
 * // Access iframe inside another iframe
 * const nestedFrame = await getNestedFrame(page, ['#outer-iframe', '#inner-iframe']);
 * await nestedFrame.fill('#input', 'value');
 */
export const getNestedFrame = async (page: Page, selectors: string[]): Promise<FrameLocator> => {
  try {
    logger.info(`Accessing nested iframe: ${selectors.join(' -> ')}`);

    let frameLocator: FrameLocator | null = null;

    for (const selector of selectors) {
      if (!frameLocator) {
        // First level
        frameLocator = await waitForFrame(page, selector);
      } else {
        // Nested level
        frameLocator = frameLocator.frameLocator(selector);
      }
    }

    if (!frameLocator) {
      throw new Error('Failed to initialize frame locator');
    }

    logger.info('Nested iframe ready');
    return frameLocator;
  } catch (error) {
    logger.error(
      'Failed to access nested iframe',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Wait for iframe content to be loaded
 *
 * @param {Page} page - Playwright page object
 * @param {string} iframeSelector - IFrame selector
 * @param {string} contentSelector - Selector for content inside iframe
 * @param {Object} options - Wait options
 * @returns {Promise<boolean>} True if content loaded
 *
 * @example
 * await waitForFrameContent(page, '#payment-iframe', '.payment-form', { timeout: 10000 });
 */
export const waitForFrameContent = async (
  page: Page,
  iframeSelector: string,
  contentSelector: string,
  options: { timeout?: number } = {}
): Promise<boolean> => {
  const { timeout = 30000 } = options;

  try {
    logger.info(`Waiting for frame content: ${iframeSelector} -> ${contentSelector}`);

    const frameLocator = await waitForFrame(page, iframeSelector, { timeout });
    await frameLocator.locator(contentSelector).waitFor({ timeout });

    logger.info('Frame content loaded');
    return true;
  } catch (error) {
    logger.error(
      'Frame content not loaded',
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
};

/**
 * Get iframe dimensions
 *
 * @param {Page} page - Playwright page object
 * @param {string} selector - IFrame selector
 * @returns {Promise<Object>} Dimensions object { width, height, x, y }
 *
 * @example
 * const dimensions = await getFrameDimensions(page, '#my-iframe');
 * console.log(`IFrame size: ${dimensions.width}x${dimensions.height}`);
 */
export const getFrameDimensions = async (
  page: Page,
  selector: string
): Promise<{ x: number; y: number; width: number; height: number } | null> => {
  try {
    const iframe = await page.$(selector);

    if (!iframe) {
      throw new Error(`IFrame not found: ${selector}`);
    }

    const boundingBox = await iframe.boundingBox();

    logger.info(`IFrame dimensions: ${selector}`, boundingBox || {});
    return boundingBox;
  } catch (error) {
    logger.error(
      'Failed to get iframe dimensions',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Check if iframe is responsive/loaded
 *
 * @param {Page} page - Playwright page object
 * @param {string} selector - IFrame selector
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>} True if iframe is responsive
 *
 * @example
 * const isReady = await isFrameResponsive(page, '#payment-iframe', 5000);
 */
export const isFrameResponsive = async (
  page: Page,
  selector: string,
  timeout = 5000
): Promise<boolean> => {
  try {
    const frameLocator = await waitForFrame(page, selector, { timeout });

    // Try to evaluate something in the frame
    const isResponsive = (await Promise.race([
      frameLocator.locator('body').evaluate(() => document.readyState === 'complete'),
      new Promise(resolve => setTimeout(() => resolve(false), timeout)),
    ])) as boolean;

    logger.info(`IFrame responsive: ${selector} - ${isResponsive}`);
    return isResponsive;
  } catch (error) {
    logger.error(
      'Failed to check iframe responsiveness',
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
};

/**
 * Get iframe source URL
 *
 * @param {Page} page - Playwright page object
 * @param {string} selector - IFrame selector
 * @returns {Promise<string>} IFrame source URL
 *
 * @example
 * const src = await getFrameSource(page, '#external-iframe');
 * console.log(`IFrame loads from: ${src}`);
 */
export const getFrameSource = async (page: Page, selector: string): Promise<string> => {
  try {
    // eslint-disable-next-line playwright/no-eval
    const src = await page.$eval(selector, (iframe: Element) => (iframe as HTMLIFrameElement).src);
    logger.info(`IFrame source: ${src}`);
    return src;
  } catch (error) {
    logger.error(
      'Failed to get iframe source',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Reload iframe
 *
 * @param {Page} page - Playwright page object
 * @param {string} selector - IFrame selector
 * @returns {Promise<void>}
 *
 * @example
 * await reloadFrame(page, '#my-iframe');
 */
export const reloadFrame = async (page: Page, selector: string): Promise<void> => {
  try {
    logger.info(`Reloading iframe: ${selector}`);

    const src = await getFrameSource(page, selector);
    // eslint-disable-next-line playwright/no-eval
    await page.$eval(
      selector,
      (iframe: Element, src: string) => {
        (iframe as HTMLIFrameElement).src = src;
      },
      src
    );

    await waitForFrame(page, selector);
    logger.info('IFrame reloaded');
  } catch (error) {
    logger.error('Failed to reload iframe', error instanceof Error ? error.message : String(error));
    throw error;
  }
};

/**
 * Count iframes on page
 *
 * @param {Page} page - Playwright page object
 * @returns {Promise<number>} Number of iframes
 *
 * @example
 * const count = await countFrames(page);
 * console.log(`Page has ${count} iframes`);
 */
export const countFrames = async (page: Page): Promise<number> => {
  try {
    const frames = page.frames();
    const count = frames.length - 1; // Exclude main frame

    logger.info(`Total iframes: ${count}`);
    return count;
  } catch (error) {
    logger.error('Failed to count iframes', error instanceof Error ? error.message : String(error));
    return 0;
  }
};
