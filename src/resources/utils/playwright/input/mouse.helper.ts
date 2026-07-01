/**
 * @fileoverview Comprehensive mouse interaction utilities for Playwright.
 * Provides click, drag-drop, hover, context menu, and mouse wheel operations.
 * @module ui/mouse.helper
 * @category UI Testing
 *
 * @description
 * This module provides utilities for:
 * - Mouse movements and clicks
 * - Drag and drop operations
 * - Hover interactions
 * - Context menu operations
 * - Mouse wheel scrolling
 *
 * @example
 * import * as MouseHelper from './mouse.helper';
 * await MouseHelper.dragAndDrop(page, '#draggable', '#dropzone');
 * await MouseHelper.rightClick(page, '#element');
 */

import { Page } from '@playwright/test';
import { logger } from '@utils/core';

/**
 * Click element at specific position
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {Object} [options] - Click options
 * @param {number} [options.x] - X offset from element top-left
 * @param {number} [options.y] - Y offset from element top-left
 * @param {string} [options.button='left'] - Mouse button ('left', 'right', 'middle')
 * @param {number} [options.clickCount=1] - Number of clicks
 * @param {number} [options.delay=0] - Delay between mousedown and mouseup
 * @returns {Promise<void>}
 *
 * @example
 * await clickAt(page, '#canvas', { x: 100, y: 50 });
 */
export const clickAt = async (
  page: Page,
  selector: string,
  options: Record<string, unknown> = {}
): Promise<void> => {
  try {
    await page.click(selector, options);
    logger.info(`Clicked at position on: ${selector}`);
  } catch (error) {
    logger.error(
      `Failed to click at position: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Double click element
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {Object} [options] - Click options
 * @returns {Promise<void>}
 *
 * @example
 * await doubleClick(page, '#file-name');
 */
export const doubleClick = async (
  page: Page,
  selector: string,
  options: Record<string, unknown> = {}
): Promise<void> => {
  try {
    await page.dblclick(selector, options);
    logger.info(`Double clicked: ${selector}`);
  } catch (error) {
    logger.error(
      `Failed to double click: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Right click (context menu)
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {Object} [options] - Click options
 * @returns {Promise<void>}
 *
 * @example
 * await rightClick(page, '#context-menu-trigger');
 */
export const rightClick = async (
  page: Page,
  selector: string,
  options: Record<string, unknown> = {}
): Promise<void> => {
  try {
    await page.click(selector, { ...options, button: 'right' });
    logger.info(`Right clicked: ${selector}`);
  } catch (error) {
    logger.error(
      `Failed to right click: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Middle click
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {Object} [options] - Click options
 * @returns {Promise<void>}
 *
 * @example
 * await middleClick(page, 'a[href]'); // Open link in new tab
 */
export const middleClick = async (
  page: Page,
  selector: string,
  options: Record<string, unknown> = {}
): Promise<void> => {
  try {
    await page.click(selector, { ...options, button: 'middle' });
    logger.info(`Middle clicked: ${selector}`);
  } catch (error) {
    logger.error(
      `Failed to middle click: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Hover over element
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {Object} [options] - Hover options
 * @param {number} [options.x] - X offset
 * @param {number} [options.y] - Y offset
 * @param {number} [options.duration=0] - Duration to hold hover (ms)
 * @returns {Promise<void>}
 *
 * @example
 * await hover(page, '#menu-item', { duration: 1000 });
 */
export const hover = async (
  page: Page,
  selector: string,
  options: { duration?: number; [key: string]: unknown } = {}
): Promise<void> => {
  const { duration = 0, ...hoverOptions } = options;

  try {
    await page.hover(selector, hoverOptions);
    if (duration > 0) {
      await page.waitForLoadState('domcontentloaded');
    }
    logger.info(`Hovered over: ${selector}`);
  } catch (error) {
    logger.error(
      `Failed to hover over: ${selector}`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Drag and drop element
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} sourceSelector - Source element selector
 * @param {string} targetSelector - Target element selector
 * @param {Object} [options] - Drag options
 * @param {number} [options.delay=0] - Delay during drag
 * @returns {Promise<void>}
 *
 * @example
 * await dragAndDrop(page, '#draggable', '#dropzone');
 */
export const dragAndDrop = async (
  page: Page,
  sourceSelector: string,
  targetSelector: string,
  options: Record<string, unknown> = {}
): Promise<void> => {
  try {
    await page.dragAndDrop(sourceSelector, targetSelector, options);
    logger.info(`Dragged from ${sourceSelector} to ${targetSelector}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      `Failed to drag and drop from ${sourceSelector} to ${targetSelector}`,
      errorMessage
    );
    throw error;
  }
};

/**
 * Drag element by offset
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {number} x - Horizontal offset
 * @param {number} y - Vertical offset
 * @returns {Promise<void>}
 *
 * @example
 * await dragByOffset(page, '#slider', 100, 0); // Drag 100px right
 */
export const dragByOffset = async (
  page: Page,
  selector: string,
  x: number,
  y: number
): Promise<void> => {
  try {
    const element = await page.$(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    const box = await element.boundingBox();
    if (!box) {
      throw new Error(`Element has no bounding box: ${selector}`);
    }

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + x, box.y + box.height / 2 + y);
    await page.mouse.up();

    logger.info(`Dragged ${selector} by offset (${x}, ${y})`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to drag by offset: ${selector}`, errorMessage);
    throw error;
  }
};

/**
 * Mouse move to coordinates
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} [options] - Move options
 * @param {number} [options.steps=1] - Number of intermediate steps
 * @returns {Promise<void>}
 *
 * @example
 * await moveTo(page, 500, 300, { steps: 10 }); // Smooth move
 */
export const moveTo = async (
  page: Page,
  x: number,
  y: number,
  options: Record<string, unknown> = {}
): Promise<void> => {
  try {
    await page.mouse.move(x, y, options);
    logger.info(`Moved mouse to (${x}, ${y})`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to move mouse to (${x}, ${y})`, errorMessage);
    throw error;
  }
};

/**
 * Scroll with mouse wheel
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {number} deltaX - Horizontal scroll amount
 * @param {number} deltaY - Vertical scroll amount
 * @returns {Promise<void>}
 *
 * @example
 * await scrollWheel(page, 0, 100); // Scroll down
 * await scrollWheel(page, 0, -100); // Scroll up
 */
export const scrollWheel = async (page: Page, deltaX: number, deltaY: number): Promise<void> => {
  try {
    await page.mouse.wheel(deltaX, deltaY);
    logger.info(`Scrolled wheel by (${deltaX}, ${deltaY})`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to scroll with mouse wheel', errorMessage);
    throw error;
  }
};

/**
 * Click and hold
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {number} [duration=1000] - Duration to hold in milliseconds
 * @returns {Promise<void>}
 *
 * @example
 * await clickAndHold(page, '#button', 2000); // Long press for 2 seconds
 */
export const clickAndHold = async (
  page: Page,
  selector: string,
  duration = 1000
): Promise<void> => {
  try {
    const element = await page.$(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    const box = await element.boundingBox();
    if (!box) {
      throw new Error(`Element has no bounding box: ${selector}`);
    }

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForLoadState('domcontentloaded');
    await page.mouse.up();

    logger.info(`Clicked and held ${selector} for ${duration}ms`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to click and hold: ${selector}`, errorMessage);
    throw error;
  }
};

/**
 * Hover sequence over multiple elements
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {Array<string>} selectors - Array of element selectors
 * @param {number} [delay=500] - Delay between hovers in milliseconds
 * @returns {Promise<void>}
 *
 * @example
 * await hoverSequence(page, ['#menu', '#submenu', '#item'], 300);
 */
export const hoverSequence = async (
  page: Page,
  selectors: string[],
  _delay = 500
): Promise<void> => {
  try {
    for (const selector of selectors) {
      await page.hover(selector);
      await page.waitForLoadState('domcontentloaded');
    }
    logger.info(`Hovered over sequence of ${selectors.length} elements`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to hover sequence', errorMessage);
    throw error;
  }
};

/**
 * Simulate drawing/signature motion
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {Array<Object>} points - Array of {x, y} coordinate points
 * @param {number} [delay=10] - Delay between points in milliseconds
 * @returns {Promise<void>}
 *
 * @example
 * const signature = [
 *   { x: 100, y: 100 },
 *   { x: 150, y: 120 },
 *   { x: 200, y: 100 }
 * ];
 * await drawPath(page, signature);
 */
export const drawPath = async (
  page: Page,
  points: Array<{ x: number; y: number }>,
  delay = 10
): Promise<void> => {
  try {
    if (points.length < 2) {
      throw new Error('Need at least 2 points to draw a path');
    }

    // Move to starting point and mouse down
    await page.mouse.move(points[0].x, points[0].y);
    await page.mouse.down();

    // Draw through all points
    for (let i = 1; i < points.length; i++) {
      await page.mouse.move(points[i].x, points[i].y);
      if (delay > 0) {
        await page.waitForLoadState('domcontentloaded');
      }
    }

    // Release mouse
    await page.mouse.up();

    logger.info(`Drew path with ${points.length} points`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to draw path', errorMessage);
    throw error;
  }
};

/**
 * Click at absolute coordinates
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} [options] - Click options
 * @param {string} [options.button='left'] - Mouse button
 * @param {number} [options.clickCount=1] - Number of clicks
 * @returns {Promise<void>}
 *
 * @example
 * await clickAtCoordinates(page, 500, 300);
 */
export const clickAtCoordinates = async (
  page: Page,
  x: number,
  y: number,
  options: { button?: 'left' | 'right' | 'middle'; clickCount?: number } = {}
): Promise<void> => {
  const { button = 'left', clickCount = 1 } = options;

  try {
    await page.mouse.click(x, y, { button, clickCount });
    logger.info(`Clicked at coordinates (${x}, ${y})`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to click at coordinates (${x}, ${y})`, errorMessage);
    throw error;
  }
};

/**
 * Get mouse position
 *
 * @async
 * @param {Page} page - Playwright page object
 * @returns {Promise<Object>} Mouse position {x, y}
 *
 * @example
 * const position = await getMousePosition(page);
 * console.log(`Mouse at: ${position.x}, ${position.y}`);
 */
export const getMousePosition = async (page: Page): Promise<{ x: number; y: number }> => {
  try {
    return await page.evaluate(() => {
      return new Promise<{ x: number; y: number }>(resolve => {
        document.addEventListener(
          'mousemove',
          e => {
            resolve({ x: e.clientX, y: e.clientY });
          },
          { once: true }
        );

        // Trigger a tiny mouse move to capture position
        document.dispatchEvent(new MouseEvent('mousemove'));
      });
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to get mouse position', errorMessage);
    throw error;
  }
};

/**
 * Simulate slow mouse movement (for visibility in recordings/demos)
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Target element selector
 * @param {Object} [options] - Movement options
 * @param {number} [options.steps=50] - Number of steps
 * @param {number} [options.delay=10] - Delay between steps
 * @returns {Promise<void>}
 *
 * @example
 * await slowMoveTo(page, '#target', { steps: 100, delay: 5 });
 */
export const slowMoveTo = async (
  page: Page,
  selector: string,
  options: { steps?: number; delay?: number } = {}
): Promise<void> => {
  const { steps = 50, delay = 10 } = options;

  try {
    const element = await page.$(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    const box = await element.boundingBox();
    if (!box) {
      throw new Error(`Element has no bounding box: ${selector}`);
    }
    const targetX = box.x + box.width / 2;
    const targetY = box.y + box.height / 2;

    await page.mouse.move(targetX, targetY, { steps });
    if (delay > 0) {
      await page.waitForLoadState('domcontentloaded');
    }

    logger.info(`Slowly moved to: ${selector}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to slowly move to: ${selector}`, errorMessage);
    throw error;
  }
};

/**
 * Perform click with modifier key
 *
 * @async
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {string} modifier - Modifier key ('Control', 'Shift', 'Alt', 'Meta')
 * @returns {Promise<void>}
 *
 * @example
 * await clickWithModifier(page, 'a', 'Control'); // Ctrl+Click link
 */
export const clickWithModifier = async (
  page: Page,
  selector: string,
  modifier: 'Alt' | 'Control' | 'Meta' | 'Shift'
): Promise<void> => {
  try {
    await page.click(selector, { modifiers: [modifier] });
    logger.info(`Clicked ${selector} with ${modifier} modifier`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to click with modifier: ${selector}`, errorMessage);
    throw error;
  }
};
