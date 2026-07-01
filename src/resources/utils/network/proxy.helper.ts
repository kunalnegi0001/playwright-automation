/**
 * @fileoverview Proxy configuration and HAR recording utilities.
 * Provides functions for setting up proxies and HTTP Archive (HAR) file management.
 * @module network/proxy.helper
 */

import fs from 'fs/promises';
import { logger } from '@utils/core';

/**
 * Build proxy configuration object from individual parameters
 * @param options - Proxy configuration options
 * @param options.server - Proxy server URL (e.g., 'http://proxy.example.com:8080')
 * @param options.bypass - Comma-separated domains to bypass proxy (default: '')
 * @param options.username - Proxy authentication username (default: '')
 * @param options.password - Proxy authentication password (default: '')
 * @returns Proxy configuration object
 * @example
 * buildProxyConfig({ server: 'http://proxy:8080', username: 'user', password: 'pass' })
 * // { server: 'http://proxy:8080', username: 'user', password: 'pass' }
 */
export const buildProxyConfig = ({
  server,
  bypass = '',
  username = '',
  password = '',
}: { server?: string; bypass?: string; username?: string; password?: string } = {}): Record<
  string,
  string
> => {
  const config: Record<string, string> = {};
  if (server) {
    config.server = server;
  }
  if (bypass) {
    config.bypass = bypass;
  }
  if (username) {
    config.username = username;
  }
  if (password) {
    config.password = password;
  }
  return config;
};

/**
 * Merge browser context options with proxy configuration
 * @param contextOptions - Existing browser context options (default: {})
 * @param proxyOptions - Proxy configuration options
 * @returns Combined context options with proxy settings
 * @example
 * buildContextOptionsWithProxy({ viewport: { width: 1920, height: 1080 } }, { server: 'http://proxy:8080' })
 */
export const buildContextOptionsWithProxy = (
  contextOptions: Record<string, unknown> = {},
  proxyOptions: Record<string, unknown> = {}
): Record<string, unknown> => {
  return {
    ...contextOptions,
    proxy: buildProxyConfig(
      proxyOptions as { server?: string; bypass?: string; username?: string; password?: string }
    ),
  };
};

/**
 * Start HTTP Archive (HAR) recording for network traffic
 * @param context - Playwright browser context with routeFromHAR method
 * @param harPath - File path where HAR file will be saved
 * @param options - HAR recording options
 * @param options.notFound - Behavior when requested resource not in HAR ('abort', 'fallback') (default: 'fallback')
 * @param options.update - Whether to update HAR with new requests (default: true)
 * @param options.updateMode - Update mode ('full' or 'minimal') (default: 'minimal')
 * @returns Promise<void>
 * @example
 * await startHarRecording(context, './recordings/session.har', { update: true, updateMode: 'minimal' });
 */
export const startHarRecording = async (
  context: { routeFromHAR: (path: string, opts: Record<string, unknown>) => Promise<void> },
  harPath: string,
  options: { notFound?: string; update?: boolean; updateMode?: string } = {}
): Promise<void> => {
  await context.routeFromHAR(harPath, {
    notFound: options.notFound || 'fallback',
    update: options.update ?? true,
    updateMode: options.updateMode || 'minimal',
  });
  logger.info(`HAR recording setup: ${harPath}`);
};

/**
 * Get metadata about a HAR file
 * @param harPath - Path to HAR file
 * @returns Promise resolving to file metadata
 * @throws {Error} If file doesn't exist or can't be accessed
 * @example
 * const meta = await saveHarMeta('./recordings/session.har');
 * // { path: './recordings/session.har', sizeBytes: 15234, modifiedAt: '2024-01-15T10:30:00.000Z' }
 */
export const saveHarMeta = async (
  harPath: string
): Promise<{ path: string; sizeBytes: number; modifiedAt: string }> => {
  const stat = await fs.stat(harPath);
  return {
    path: harPath,
    sizeBytes: stat.size,
    modifiedAt: stat.mtime.toISOString(),
  };
};

/**
 * Verify HAR file exists and has content
 * @param harPath - Path to HAR file
 * @returns Promise resolving to validation result with metadata
 * @example
 * const result = await assertHarExists('./recordings/session.har');
 * if (result.passed) { console.log('HAR file is valid', result.meta); }
 */
export const assertHarExists = async (
  harPath: string
): Promise<{
  passed: boolean;
  meta: { path: string; sizeBytes: number; modifiedAt: string } | null;
}> => {
  try {
    const meta = await saveHarMeta(harPath);
    return { passed: meta.sizeBytes > 0, meta };
  } catch {
    return { passed: false, meta: null };
  }
};
