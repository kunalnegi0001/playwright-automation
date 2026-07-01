import { Page } from '@playwright/test';

type ScrollBehavior = 'auto' | 'smooth' | 'instant';
type ScrollLogicalPosition = 'start' | 'center' | 'end' | 'nearest';

/**
 * Element Helper Utilities
 * Comprehensive DOM element interaction and manipulation utilities
 *
 * @module ElementHelper
 * @category UI Testing
 *
 * @description
 * This module provides utilities for:
 * - Smart element waiting and interaction
 * - Visibility and state checking
 * - Element manipulation (scroll, highlight, modify)
 * - Attribute and property handling
 * - Advanced selectors and queries
 *
 * @example
 * import * as ElementHelper from './element.helper';
 *
 * // Wait for element to be visible and clickable
 * await ElementHelper.waitForElementReady(page, '#submit-btn');
 *
 * // Highlight element for debugging
 * await ElementHelper.highlightElement(page, '#target-element');
 */

import { logger } from '@utils/core';

/**
 * Wait for element to be ready (visible, enabled, stable)
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {Object} [options] - Wait options
 * @param {number} [options.timeout=30000] - Timeout in milliseconds
 * @param {string} [options.state='visible'] - State to wait for ('visible', 'attached', 'detached', 'hidden')
 * @returns {Promise<ElementHandle>} Element handle
 *
 * @example
 * const element = await waitForElementReady(page, '#submit-btn');
 */
export const waitForElementReady = async (
  page: Page,
  selector: string,
  options: { timeout?: number; state?: 'visible' | 'attached' | 'detached' | 'hidden' } = {}
): Promise<unknown> => {
  const { timeout = 30000, state = 'visible' } = options;

  try {
    await page.locator(selector).waitFor({ state, timeout });
    const element = await page.$(selector);

    // Additional check for enabled state
    if (state === 'visible') {
      await page.waitForFunction(
        sel => {
          const el = document.querySelector(sel) as HTMLElement | null;
          return el && !(el as HTMLInputElement).disabled && el.offsetParent !== null;
        },
        selector,
        { timeout }
      );
    }

    logger.info(`Element ready: ${selector}`);
    return element;
  } catch (error) {
    logger.error(
      `Element not ready: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Check if element exists
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @returns {Promise<boolean>} True if element exists
 *
 * @example
 * const exists = await elementExists(page, '#optional-field');
 */
export const elementExists = async (page: Page, selector: string): Promise<boolean> => {
  try {
    const element = await page.$(selector);
    return element !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Check if element is visible
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @returns {Promise<boolean>} True if element is visible
 *
 * @example
 * const visible = await isElementVisible(page, '#error-message');
 */
export const isElementVisible = async (page: Page, selector: string): Promise<boolean> => {
  try {
    return await page.isVisible(selector);
  } catch (error) {
    return false;
  }
};

/**
 * Check if element is enabled
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @returns {Promise<boolean>} True if element is enabled
 *
 * @example
 * const enabled = await isElementEnabled(page, '#submit-btn');
 */
export const isElementEnabled = async (page: Page, selector: string): Promise<boolean> => {
  try {
    return await page.isEnabled(selector);
  } catch (error) {
    return false;
  }
};

/**
 * Check if element is checked (checkbox/radio)
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @returns {Promise<boolean>} True if element is checked
 *
 * @example
 * const checked = await isElementChecked(page, '#agree-terms');
 */
export const isElementChecked = async (page: Page, selector: string): Promise<boolean> => {
  try {
    return await page.isChecked(selector);
  } catch (error) {
    return false;
  }
};

/**
 * Wait for element to disappear
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {Object} [options] - Wait options
 * @param {number} [options.timeout=30000] - Timeout in milliseconds
 * @returns {Promise<void>}
 *
 * @example
 * await waitForElementToDisappear(page, '.loading-spinner');
 */
export const waitForElementToDisappear = async (
  page: Page,
  selector: string,
  options: { timeout?: number } = {}
): Promise<void> => {
  const { timeout = 30000 } = options;

  try {
    await page.locator(selector).waitFor({ state: 'hidden', timeout });
    logger.info(`Element disappeared: ${selector}`);
  } catch (error) {
    logger.error(
      `Element did not disappear: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Get element count
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @returns {Promise<number>} Count of matching elements
 *
 * @example
 * const count = await getElementCount(page, '.product-card');
 */
export const getElementCount = async (page: Page, selector: string): Promise<number> => {
  try {
    return await page.locator(selector).count();
  } catch (error) {
    logger.error(
      `Failed to get element count: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    return 0;
  }
};

/**
 * Get element text
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {Object} [options] - Options
 * @param {boolean} [options.trim=true] - Trim whitespace
 * @returns {Promise<string>} Element text content
 *
 * @example
 * const text = await getElementText(page, 'h1');
 */
export const getElementText = async (
  page: Page,
  selector: string,
  options: { trim?: boolean } = {}
): Promise<string> => {
  const { trim = true } = options;

  try {
    const text = await page.textContent(selector);
    return trim && text ? text.trim() : text || '';
  } catch (error) {
    logger.error(
      `Failed to get element text: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Get element inner HTML
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @returns {Promise<string>} Element innerHTML
 *
 * @example
 * const html = await getElementInnerHTML(page, '#content');
 */
export const getElementInnerHTML = async (page: Page, selector: string): Promise<string> => {
  try {
    return await page.innerHTML(selector);
  } catch (error) {
    logger.error(
      `Failed to get element innerHTML: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Get element attribute
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {string} attribute - Attribute name
 * @returns {Promise<string|null>} Attribute value
 *
 * @example
 * const href = await getElementAttribute(page, 'a', 'href');
 */
export const getElementAttribute = async (
  page: Page,
  selector: string,
  attribute: string
): Promise<string | null> => {
  try {
    return await page.getAttribute(selector, attribute);
  } catch (error) {
    logger.error(
      `Failed to get attribute ${attribute} from: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
};

/**
 * Set element attribute
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {string} attribute - Attribute name
 * @param {string} value - Attribute value
 * @returns {Promise<void>}
 *
 * @example
 * await setElementAttribute(page, '#input', 'data-test', 'enabled');
 */
export const setElementAttribute = async (
  page: Page,
  selector: string,
  attribute: string,
  value: string
): Promise<void> => {
  try {
    await page.evaluate(
      ({ sel, attr, val }) => {
        const element = document.querySelector(sel);
        if (element) {
          element.setAttribute(attr, val);
        }
      },
      { sel: selector, attr: attribute, val: value }
    );
    logger.info(`Set attribute ${attribute}="${value}" on: ${selector}`);
  } catch (error) {
    logger.error(
      `Failed to set attribute on: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Get element CSS property
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {string} property - CSS property name
 * @returns {Promise<string>} CSS property value
 *
 * @example
 * const color = await getElementCSSProperty(page, 'h1', 'color');
 */
export const getElementCSSProperty = async (
  page: Page,
  selector: string,
  property: string
): Promise<string | null> => {
  try {
    return await page.evaluate(
      ({ sel, prop }) => {
        const element = document.querySelector(sel);
        return element ? window.getComputedStyle(element).getPropertyValue(prop) : null;
      },
      { sel: selector, prop: property }
    );
  } catch (error) {
    logger.error(
      `Failed to get CSS property ${property} from: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Get element bounding box
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @returns {Promise<Object>} Bounding box { x, y, width, height }
 *
 * @example
 * const box = await getElementBoundingBox(page, '#target');
 * console.log(`Width: ${box.width}, Height: ${box.height}`);
 */
export const getElementBoundingBox = async (
  page: Page,
  selector: string
): Promise<{ x: number; y: number; width: number; height: number } | null> => {
  try {
    const element = await page.$(selector);
    return element ? await element.boundingBox() : null;
  } catch (error) {
    logger.error(
      `Failed to get bounding box: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Scroll element into view
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {Object} [options] - Scroll options
 * @param {string} [options.block='center'] - Vertical alignment ('start', 'center', 'end', 'nearest')
 * @param {string} [options.inline='nearest'] - Horizontal alignment
 * @param {string} [options.behavior='smooth'] - Scroll behavior ('auto', 'smooth')
 * @returns {Promise<void>}
 *
 * @example
 * await scrollIntoView(page, '#footer', { block: 'end' });
 */
export const scrollIntoView = async (
  page: Page,
  selector: string,
  options: { block?: string; inline?: string; behavior?: string } = {}
): Promise<void> => {
  const { block = 'center', inline = 'nearest', behavior = 'smooth' } = options;

  try {
    await page.evaluate(
      ({ sel, opts }) => {
        const element = document.querySelector(sel);
        if (element) {
          element.scrollIntoView({
            block: opts.block as unknown as ScrollLogicalPosition,
            inline: opts.inline as unknown as ScrollLogicalPosition,
            behavior: opts.behavior as unknown as ScrollBehavior,
          });
        }
      },
      { sel: selector, opts: { block, inline, behavior } }
    );
    logger.info(`Scrolled to: ${selector}`);
  } catch (error) {
    logger.error(
      `Failed to scroll to: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Scroll to top of page
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {Object} [options] - Scroll options
 * @param {string} [options.behavior='smooth'] - Scroll behavior
 * @returns {Promise<void>}
 *
 * @example
 * await scrollToTop(page);
 */
export const scrollToTop = async (
  page: Page,
  options: { behavior?: string } = {}
): Promise<void> => {
  const { behavior = 'smooth' } = options;

  try {
    await page.evaluate(behavior => {
      window.scrollTo({ top: 0, behavior: behavior as ScrollBehavior });
    }, behavior);
    logger.info('Scrolled to top');
  } catch (error) {
    logger.error('Failed to scroll to top', error instanceof Error ? error.message : String(error));
    throw error;
  }
};

/**
 * Scroll to bottom of page
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {Object} [options] - Scroll options
 * @param {string} [options.behavior='smooth'] - Scroll behavior
 * @returns {Promise<void>}
 *
 * @example
 * await scrollToBottom(page);
 */
export const scrollToBottom = async (
  page: Page,
  options: { behavior?: string } = {}
): Promise<void> => {
  const { behavior = 'smooth' } = options;

  try {
    await page.evaluate(behavior => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: behavior as ScrollBehavior });
    }, behavior);
    logger.info('Scrolled to bottom');
  } catch (error) {
    logger.error(
      'Failed to scroll to bottom',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Highlight element (for debugging/demos)
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {Object} [options] - Highlight options
 * @param {string} [options.color='red'] - Border color
 * @param {number} [options.duration=2000] - Highlight duration in ms
 * @param {string} [options.width='3px'] - Border width
 * @returns {Promise<void>}
 *
 * @example
 * await highlightElement(page, '#important-field', { color: 'yellow', duration: 3000 });
 */
export const highlightElement = async (
  page: Page,
  selector: string,
  options: { color?: string; duration?: number; width?: string } = {}
): Promise<void> => {
  const { color = 'red', duration = 2000, width = '3px' } = options;

  try {
    await page.evaluate(
      ({ sel, color, width, duration }) => {
        const element = document.querySelector(sel) as HTMLElement | null;
        if (element) {
          const originalStyle = element.style.border;
          element.style.border = `${width} solid ${color}`;
          element.style.boxSizing = 'border-box';

          setTimeout(() => {
            element.style.border = originalStyle;
          }, duration);
        }
      },
      { sel: selector, color, width, duration }
    );
    logger.info(`Highlighted element: ${selector}`);
  } catch (error) {
    logger.error(
      `Failed to highlight element: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Flash element (blink animation)
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {Object} [options] - Flash options
 * @param {number} [options.times=3] - Number of flashes
 * @param {number} [options.interval=200] - Interval between flashes in ms
 * @returns {Promise<void>}
 *
 * @example
 * await flashElement(page, '.success-message', { times: 5 });
 */
export const flashElement = async (
  page: Page,
  selector: string,
  options: { times?: number; interval?: number } = {}
): Promise<void> => {
  const { times = 3, interval = 200 } = options;

  try {
    await page.evaluate(
      ({ sel, times, interval }) => {
        const element = document.querySelector(sel) as HTMLElement | null;
        if (element) {
          let count = 0;
          const originalOpacity = element.style.opacity;

          const flash = setInterval(() => {
            element.style.opacity = element.style.opacity === '0' ? originalOpacity || '1' : '0';
            count++;

            if (count >= times * 2) {
              clearInterval(flash);
              element.style.opacity = originalOpacity;
            }
          }, interval);
        }
      },
      { sel: selector, times, interval }
    );
    logger.info(`Flashed element: ${selector}`);
  } catch (error) {
    logger.error(
      `Failed to flash element: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Wait for element to contain text
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {string} text - Expected text
 * @param {Object} [options] - Wait options
 * @param {number} [options.timeout=30000] - Timeout in milliseconds
 * @returns {Promise<void>}
 *
 * @example
 * await waitForElementText(page, '#status', 'Success');
 */
export const waitForElementText = async (
  page: Page,
  selector: string,
  text: string,
  options: { timeout?: number } = {}
): Promise<void> => {
  const { timeout = 30000 } = options;

  try {
    await page.waitForFunction(
      ({ sel, txt }) => {
        const element = document.querySelector(sel);
        return element && element.textContent && element.textContent.includes(txt);
      },
      { sel: selector, txt: text },
      { timeout }
    );
    logger.info(`Element contains text "${text}": ${selector}`);
  } catch (error) {
    logger.error(
      `Element does not contain text "${text}": ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Get all elements matching selector
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @returns {Promise<Array>} Array of element handles
 *
 * @example
 * const items = await getAllElements(page, '.list-item');
 * console.log(`Found ${items.length} items`);
 */
export const getAllElements = async (page: Page, selector: string): Promise<unknown[]> => {
  try {
    return await page.$$(selector);
  } catch (error) {
    logger.error(
      `Failed to get all elements: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
};

/**
 * Get element by text content
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Base selector
 * @param {string} text - Text to match
 * @param {Object} [options] - Options
 * @param {boolean} [options.exact=false] - Exact match
 * @returns {Promise<ElementHandle|null>} Element handle
 *
 * @example
 * const button = await getElementByText(page, 'button', 'Submit');
 */
export const getElementByText = async (
  page: Page,
  selector: string,
  text: string,
  options: { exact?: boolean } = {}
): Promise<unknown> => {
  const { exact = false } = options;

  try {
    if (exact) {
      return page.locator(selector).filter({ hasText: text }).first();
    }
    return page.locator(selector, { hasText: text }).first();
  } catch (error) {
    logger.error(
      `Failed to get element by text: ${selector} with text "${text}"`,
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
};

/**
 * Check if element has class
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {string} className - Class name to check
 * @returns {Promise<boolean>} True if element has class
 *
 * @example
 * const hasError = await elementHasClass(page, '#input', 'error');
 */
export const elementHasClass = async (
  page: Page,
  selector: string,
  className: string
): Promise<boolean> => {
  try {
    const classList = await page.getAttribute(selector, 'class');
    return classList ? classList.split(' ').includes(className) : false;
  } catch (error) {
    logger.error(
      `Failed to check class on: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
};

/**
 * Wait for element attribute value
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {string} attribute - Attribute name
 * @param {string} expectedValue - Expected attribute value
 * @param {Object} [options] - Wait options
 * @param {number} [options.timeout=30000] - Timeout in milliseconds
 * @returns {Promise<void>}
 *
 * @example
 * await waitForAttributeValue(page, '#input', 'aria-invalid', 'true');
 */
export const waitForAttributeValue = async (
  page: Page,
  selector: string,
  attribute: string,
  expectedValue: string,
  options: { timeout?: number } = {}
): Promise<void> => {
  const { timeout = 30000 } = options;

  try {
    await page.waitForFunction(
      ({ sel, attr, val }) => {
        const element = document.querySelector(sel);
        return element && element.getAttribute(attr) === val;
      },
      { sel: selector, attr: attribute, val: expectedValue },
      { timeout }
    );
    logger.info(`Attribute ${attribute}="${expectedValue}" found on: ${selector}`);
  } catch (error) {
    logger.error(
      `Attribute value not found on: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};
