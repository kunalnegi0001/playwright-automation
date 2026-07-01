/**
 * @fileoverview Comprehensive file download utilities for Playwright.
 * Handles download initiation, waiting, verification, path management, and cleanup.
 * @module ui/download.helper
 * @category UI Testing
 *
 * Features:
 * - Download initiation and waiting
 * - File verification and validation
 * - Download path management
 * - Multiple downloads handling
 * - Download cleanup
 *
 * @example
 * import * as DownloadHelper from './download.helper';
 * const downloadedFile = await DownloadHelper.downloadAndWait(page, '#download-btn');
 * const content = await DownloadHelper.readDownloadedFile(downloadedFile);
 */

import { Page, Download } from '@playwright/test';
import { logger } from '@utils/core';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createReadStream } from 'fs';
import { createHash } from 'crypto';

/**
 * Wait for download to complete
 *
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector that triggers download
 * @param {Object} options - Download options
 * @param {number} options.timeout - Timeout in milliseconds (default: 30000)
 * @param {string} options.path - Custom download path
 * @returns {Promise<Download>} Download object
 *
 * @example
 * const download = await downloadAndWait(page, '#download-button', { timeout: 60000 });
 * console.log(`Downloaded: ${await download.path()}`);
 */
export const downloadAndWait = async (
  page: Page,
  selector: string,
  options: { timeout?: number; path?: string } = {}
): Promise<Download> => {
  const { timeout = 30000, path: downloadPath = null } = options;

  try {
    logger.info(`Initiating download from: ${selector}`);

    // Start waiting for download
    const downloadPromise = page.waitForEvent('download', { timeout });

    // Click download button
    await page.click(selector);

    // Wait for download to start
    const download = await downloadPromise;

    logger.info(`Download started: ${download.suggestedFilename()}`);

    // Save to custom path if specified
    if (downloadPath) {
      await download.saveAs(downloadPath);
      logger.info(`Download saved to: ${downloadPath}`);
    }

    // Wait for download to complete
    await download.path();

    logger.info('Download completed');
    return download;
  } catch (error) {
    logger.error('Download failed', error instanceof Error ? error.message : String(error));
    throw error;
  }
};

/**
 * Download file from direct URL
 *
 * @param {Page} page - Playwright page object
 * @param {string} url - Download URL
 * @param {string} savePath - Path to save file
 * @returns {Promise<string>} Path to downloaded file
 *
 * @example
 * const filePath = await downloadFromURL(page, 'https://example.com/file.pdf', './downloads/file.pdf');
 */
export const downloadFromURL = async (
  page: Page,
  url: string,
  savePath: string
): Promise<string> => {
  try {
    logger.info(`Downloading from URL: ${url}`);

    const downloadPromise = page.waitForEvent('download');

    // Navigate to URL or trigger download
    await page.evaluate((url: string) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, url);

    const download = await downloadPromise;
    await download.saveAs(savePath);

    logger.info(`File downloaded to: ${savePath}`);
    return savePath;
  } catch (error) {
    logger.error(
      'Failed to download from URL',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Get downloaded file info
 *
 * @param {Download} download - Playwright download object
 * @returns {Promise<Object>} File information
 *
 * @example
 * const info = await getDownloadInfo(download);
 * // Returns: { filename, path, size, mimeType }
 */
export const getDownloadInfo = async (
  download: Download
): Promise<{
  filename: string;
  path: string;
  size: number;
  sizeInMB: string;
  created: Date;
  modified: Date;
}> => {
  try {
    const filePath = await download.path();
    const filename = download.suggestedFilename();

    const stats = await fs.stat(filePath);

    const info = {
      filename,
      path: filePath,
      size: stats.size,
      sizeInMB: (stats.size / (1024 * 1024)).toFixed(2),
      created: stats.birthtime,
      modified: stats.mtime,
    };

    logger.info('Download info retrieved', info);
    return info;
  } catch (error) {
    logger.error(
      'Failed to get download info',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

/**
 * Verify downloaded file exists
 *
 * @param {string} filePath - Path to file
 * @param {Object} options - Verification options
 * @param {number} options.timeout - How long to wait for file (default: 10000)
 * @param {number} options.minSize - Minimum file size in bytes
 * @returns {Promise<boolean>} True if file exists and meets criteria
 *
 * @example
 * const exists = await verifyDownload('./downloads/report.pdf', { minSize: 1024 });
 */
export const verifyDownload = async (
  filePath: string,
  options: { timeout?: number; minSize?: number } = {}
): Promise<boolean> => {
  const { timeout = 10000, minSize = 0 } = options;

  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const stats = await fs.stat(filePath);

      if (stats.size >= minSize) {
        logger.info(`Download verified: ${filePath} (${stats.size} bytes)`);
        return true;
      }

      // File exists but too small, wait a bit
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      // File doesn't exist yet, wait and retry
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  logger.warn(`Download not verified: ${filePath}`);
  return false;
};

/**
 * Read downloaded file content
 *
 * @param {string|Download} filePathOrDownload - File path or download object
 * @param {string} encoding - File encoding (default: 'utf8')
 * @returns {Promise<string|Buffer>} File content
 *
 * @example
 * const content = await readDownloadedFile(download, 'utf8');
 * const buffer = await readDownloadedFile('./file.pdf', null); // Returns buffer
 */
export const readDownloadedFile = async (
  filePathOrDownload: string | Download,
  encoding:
    | 'utf8'
    | 'ascii'
    | 'utf-8'
    | 'utf16le'
    | 'ucs2'
    | 'ucs-2'
    | 'base64'
    | 'base64url'
    | 'latin1'
    | 'binary'
    | 'hex'
    | null = 'utf8'
): Promise<string | Buffer> => {
  try {
    let filePath: string;

    if (typeof filePathOrDownload === 'string') {
      filePath = filePathOrDownload;
    } else {
      filePath = await filePathOrDownload.path();
    }

    const content = encoding ? await fs.readFile(filePath, encoding) : await fs.readFile(filePath);

    logger.info(`File read: ${filePath}`);
    return content;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to read downloaded file', errorMessage);
    throw error;
  }
};

/**
 * Get file checksum (MD5/SHA256)
 *
 * @param {string} filePath - Path to file
 * @param {string} algorithm - Hash algorithm: 'md5', 'sha256' (default: 'md5')
 * @returns {Promise<string>} File checksum
 *
 * @example
 * const checksum = await getFileChecksum('./file.zip', 'sha256');
 * console.log(`SHA256: ${checksum}`);
 */
export const getFileChecksum = async (filePath: string, algorithm = 'md5'): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const hash = createHash(algorithm);
      const stream = createReadStream(filePath);

      stream.on('data', chunk => hash.update(chunk));
      stream.on('end', () => {
        const checksum = hash.digest('hex');
        logger.info(`File checksum (${algorithm}): ${checksum}`);
        resolve(checksum);
      });
      stream.on('error', reject);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to calculate checksum', errorMessage);
      reject(error);
    }
  });
};

/**
 * Compare two files
 *
 * @param {string} filePath1 - First file path
 * @param {string} filePath2 - Second file path
 * @returns {Promise<boolean>} True if files are identical
 *
 * @example
 * const areIdentical = await compareFiles('./file1.pdf', './file2.pdf');
 */
export const compareFiles = async (filePath1: string, filePath2: string): Promise<boolean> => {
  try {
    const [checksum1, checksum2] = await Promise.all([
      getFileChecksum(filePath1, 'sha256'),
      getFileChecksum(filePath2, 'sha256'),
    ]);

    const areIdentical = checksum1 === checksum2;
    logger.info(`Files ${areIdentical ? 'match' : 'differ'}`);

    return areIdentical;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to compare files', errorMessage);
    throw error;
  }
};

/**
 * Delete downloaded file
 *
 * @param {string|Download} filePathOrDownload - File path or download object
 * @returns {Promise<boolean>} True if deleted successfully
 *
 * @example
 * await deleteDownload(download);
 * await deleteDownload('./downloads/temp.txt');
 */
export const deleteDownload = async (filePathOrDownload: string | Download): Promise<boolean> => {
  try {
    let filePath: string;

    if (typeof filePathOrDownload === 'string') {
      filePath = filePathOrDownload;
    } else {
      filePath = await filePathOrDownload.path();
    }

    await fs.unlink(filePath);
    logger.info(`Download deleted: ${filePath}`);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to delete download', errorMessage);
    return false;
  }
};

/**
 * Clean up downloads directory
 *
 * @param {string} directory - Downloads directory path
 * @param {Object} options - Cleanup options
 * @param {number} options.olderThan - Delete files older than X milliseconds
 * @param {RegExp} options.pattern - Only delete files matching pattern
 * @returns {Promise<number>} Number of files deleted
 *
 * @example
 * // Delete all files older than 1 hour
 * const deleted = await cleanupDownloads('./downloads', { olderThan: 3600000 });
 *
 * // Delete only PDF files
 * const deleted = await cleanupDownloads('./downloads', { pattern: /\.pdf$/ });
 */
export const cleanupDownloads = async (
  directory: string,
  options: { olderThan?: number; pattern?: RegExp } = {}
): Promise<number> => {
  const { olderThan = 0, pattern = null } = options;

  try {
    const files = await fs.readdir(directory);
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(directory, file);

      // Check pattern if specified
      if (pattern && !pattern.test(file)) {
        continue;
      }

      // Check age if specified
      if (olderThan > 0) {
        const stats = await fs.stat(filePath);
        const age = Date.now() - stats.mtime.getTime();

        if (age < olderThan) {
          continue;
        }
      }

      await fs.unlink(filePath);
      deletedCount++;
    }

    logger.info(`Cleaned up ${deletedCount} downloads from ${directory}`);
    return deletedCount;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to cleanup downloads', errorMessage);
    return 0;
  }
};

/**
 * Handle multiple downloads
 *
 * @param {Page} page - Playwright page object
 * @param {Function} triggerFunction - Function that triggers downloads
 * @param {number} expectedCount - Expected number of downloads
 * @param {Object} options - Options
 * @returns {Promise<Array<Download>>} Array of download objects
 *
 * @example
 * const downloads = await handleMultipleDownloads(page, async () => {
 *   await page.click('#download-all');
 * }, 3, { timeout: 60000 });
 */
export const handleMultipleDownloads = async (
  page: Page,
  triggerFunction: () => Promise<void>,
  expectedCount: number,
  options: { timeout?: number } = {}
): Promise<Download[]> => {
  const { timeout = 30000 } = options;

  try {
    logger.info(`Waiting for ${expectedCount} downloads`);

    const downloads = [];
    const downloadPromises = [];

    // Set up listeners for all expected downloads
    for (let i = 0; i < expectedCount; i++) {
      downloadPromises.push(page.waitForEvent('download', { timeout }));
    }

    // Trigger the downloads
    await triggerFunction();

    // Wait for all downloads
    const results = await Promise.all(downloadPromises);
    downloads.push(...results);

    logger.info(`All ${expectedCount} downloads completed`);
    return downloads as Download[];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to handle multiple downloads', errorMessage);
    throw error;
  }
};

/**
 * Wait for file to stop growing (download complete)
 *
 * @param {string} filePath - Path to file
 * @param {Object} options - Options
 * @param {number} options.checkInterval - Interval to check file size (default: 1000ms)
 * @param {number} options.stableFor - File must be stable for X ms (default: 2000ms)
 * @param {number} options.timeout - Maximum wait time (default: 60000ms)
 * @returns {Promise<boolean>} True if file is stable
 *
 * @example
 * await waitForFileStable('./downloads/large-file.zip');
 */
export const waitForFileStable = async (
  filePath: string,
  options: { checkInterval?: number; stableFor?: number; timeout?: number } = {}
): Promise<boolean> => {
  const { checkInterval = 1000, stableFor = 2000, timeout = 60000 } = options;

  const startTime = Date.now();
  let lastSize = 0;
  let stableTime = 0;

  while (Date.now() - startTime < timeout) {
    try {
      const stats = await fs.stat(filePath);
      const currentSize = stats.size;

      if (currentSize === lastSize) {
        stableTime += checkInterval;

        if (stableTime >= stableFor) {
          logger.info(`File stable: ${filePath} (${currentSize} bytes)`);
          return true;
        }
      } else {
        stableTime = 0;
        lastSize = currentSize;
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval));
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
  }

  logger.warn(`File not stable within timeout: ${filePath}`);
  return false;
};

/**
 * Get file extension
 *
 * @param {string|Download} filePathOrDownload - File path or download object
 * @returns {Promise<string>} File extension (without dot)
 *
 * @example
 * const ext = await getFileExtension(download);
 * console.log(ext); // 'pdf'
 */
export const getFileExtension = async (filePathOrDownload: string | Download): Promise<string> => {
  try {
    let filename: string;

    if (typeof filePathOrDownload === 'string') {
      filename = path.basename(filePathOrDownload);
    } else {
      filename = filePathOrDownload.suggestedFilename();
    }

    const ext = path.extname(filename).substring(1);
    return ext;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to get file extension', errorMessage);
    return '';
  }
};

/**
 * Rename downloaded file
 *
 * @param {string} oldPath - Current file path
 * @param {string} newName - New filename
 * @returns {Promise<string>} New file path
 *
 * @example
 * const newPath = await renameDownload('./downloads/file123.pdf', 'report.pdf');
 */
export const renameDownload = async (oldPath: string, newName: string): Promise<string> => {
  try {
    const directory = path.dirname(oldPath);
    const newPath = path.join(directory, newName);

    await fs.rename(oldPath, newPath);

    logger.info(`File renamed: ${oldPath} -> ${newPath}`);
    return newPath;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to rename file', errorMessage);
    throw error;
  }
};
