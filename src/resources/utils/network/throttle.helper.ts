/**
 * @fileoverview Network throttling utilities for simulating different connection speeds.
 * Provides presets for offline, 3G, 4G and custom network conditions using Chrome DevTools Protocol.
 * @module network/throttle.helper
 */

import { Page } from '@playwright/test';
import { logger } from '@utils/core';

/**
 * Network throttling presets
 * @const
 */
const PRESETS = {
  offline: { offline: true, downloadThroughput: -1, uploadThroughput: -1, latency: 0 },
  slow3G: {
    offline: false,
    downloadThroughput: (50 * 1024) / 8,
    uploadThroughput: (20 * 1024) / 8,
    latency: 400,
  },
  fast3G: {
    offline: false,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
    latency: 150,
  },
  slow4G: {
    offline: false,
    downloadThroughput: (4 * 1024 * 1024) / 8,
    uploadThroughput: (3 * 1024 * 1024) / 8,
    latency: 80,
  },
};

/**
 * Get Chrome DevTools Protocol session for network control
 * @async
 * @param {Page} page - Playwright page
 * @returns {Promise<CDPSession>} CDP session
 * @private
 */
export const getCdpSession = async (page: Page): Promise<unknown> => {
  const context = page.context();
  return (context as { newCDPSession: (p: unknown) => Promise<unknown> }).newCDPSession(page);
};

/**
 * Apply network throttling preset
 * @async
 * @param {Page} page - Playwright page
 * @param {string} [preset='fast3G'] - Preset name (offline, slow3G, fast3G, slow4G)
 * @returns {Promise<void>}
 * @throws {Error} If preset is unknown
 * @example
 * await applyNetworkPreset(page, 'slow3G');
 */
export const applyNetworkPreset = async (page: Page, preset: string = 'fast3G'): Promise<void> => {
  const profile = PRESETS[preset as keyof typeof PRESETS];
  if (!profile) {
    throw new Error(`Unknown preset: ${preset}`);
  }

  const cdp = (await getCdpSession(page)) as {
    send: (cmd: string, params?: unknown) => Promise<unknown>;
  };
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', profile);
  logger.info(`Applied network preset: ${preset}`);
};

/**
 * Set custom network conditions
 * @async
 * @param {Page} page - Playwright page
 * @param {Object} conditions - Network conditions
 * @param {boolean} [conditions.offline] - Offline mode
 * @param {number} [conditions.downloadThroughput] - Download speed in bytes/sec (-1 for unlimited)
 * @param {number} [conditions.uploadThroughput] - Upload speed in bytes/sec (-1 for unlimited)
 * @param {number} [conditions.latency] - Latency in milliseconds
 * @returns {Promise<void>}
 * @example
 * await setCustomNetworkConditions(page, { downloadThroughput: 50000, latency: 200 });
 */
export const setCustomNetworkConditions = async (
  page: Page,
  conditions: {
    offline?: boolean;
    downloadThroughput?: number;
    uploadThroughput?: number;
    latency?: number;
  }
): Promise<void> => {
  const cdp = (await getCdpSession(page)) as {
    send: (cmd: string, params?: unknown) => Promise<unknown>;
  };
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: Boolean(conditions.offline),
    downloadThroughput: Number(conditions.downloadThroughput ?? -1),
    uploadThroughput: Number(conditions.uploadThroughput ?? -1),
    latency: Number(conditions.latency ?? 0),
  });
};

/**
 * Reset network conditions to normal (no throttling)
 * @param page - Playwright page
 * @returns Promise<void>
 * @example
 * await resetNetworkConditions(page);
 */
export const resetNetworkConditions = async (page: Page): Promise<void> => {
  const cdp = (await getCdpSession(page)) as {
    send: (cmd: string, params?: unknown) => Promise<unknown>;
  };
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: -1,
    uploadThroughput: -1,
    latency: 0,
  });
};

/**
 * Get all available network presets
 * @returns Object containing all network throttling presets (offline, slow3G, fast3G, slow4G)
 * @example
 * const presets = getNetworkPresets();
 * // { offline: {...}, slow3G: {...}, fast3G: {...}, slow4G: {...} }
 */
export const getNetworkPresets = () => {
  return { ...PRESETS };
};
