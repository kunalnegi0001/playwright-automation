/**
 * @fileoverview File upload utilities for Playwright tests.
 * Provides functions for single/multiple uploads, drag-and-drop, and upload validation.
 * @module ui/upload.helper
 */

import { Page } from '@playwright/test';
/**
 * Upload Helper Utilities
 * Comprehensive utilities for handling file uploads in Playwright tests
 *
 * @category UI Testing
 *
 * Features:
 * - Single and multiple file uploads
 * - Drag-and-drop uploads
 * - File input handling
 * - Upload validation
 * - Mock file creation
 *
 * @example
 * import * as UploadHelper from './upload.helper';
 *
 * // Upload a file
 * await UploadHelper.uploadFile(page, '#file-input', './test-file.pdf');
 */

import { logger } from '@utils/core';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Upload single file to input element
 *
 * @param {Page} page - Playwright page object
 * @param {string} selector - File input selector
 * @param {string} filePath - Path to file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<void>}
 *
 * @example
 * await uploadFile(page, '#file-upload', './documents/resume.pdf');
 */
export const uploadFile = async (
  page: Page,
  selector: string,
  filePath: string,
  options: { timeout?: number } = {}
): Promise<void> => {
  const { timeout = 30000 } = options;

  try {
    logger.info(`Uploading file: ${filePath} to ${selector}`);

    // Wait for file input
    await page.locator(selector).waitFor({ state: 'attached', timeout });

    // Set file
    await page.setInputFiles(selector, filePath);

    logger.info('File uploaded successfully');
  } catch (error) {
    logger.error('File upload failed', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
};

/**
 * Upload multiple files
 *
 * @param {Page} page - Playwright page object
 * @param {string} selector - File input selector
 * @param {Array<string>} filePaths - Array of file paths
 * @returns {Promise<void>}
 *
 * @example
 * await uploadMultipleFiles(page, '#files', ['./file1.pdf', './file2.jpg', './file3.doc']);
 */
export const uploadMultipleFiles = async (
  page: Page,
  selector: string,
  filePaths: string[]
): Promise<void> => {
  try {
    logger.info(`Uploading ${filePaths.length} files to ${selector}`);

    await page.locator(selector).waitFor({ state: 'attached' });
    await page.setInputFiles(selector, filePaths);

    logger.info(`${filePaths.length} files uploaded successfully`);
  } catch (error) {
    logger.error(
      'Multiple file upload failed',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
};

/**
 * Upload file via drag and drop
 *
 * @param {Page} page - Playwright page object
 * @param {string} dropZoneSelector - Drop zone element selector
 * @param {string} filePath - Path to file
 * @returns {Promise<void>}
 *
 * @example
 * await uploadViaDragDrop(page, '.drop-zone', './image.png');
 */
export const uploadViaDragDrop = async (
  page: Page,
  dropZoneSelector: string,
  filePath: string
): Promise<void> => {
  try {
    logger.info(`Drag-drop upload: ${filePath} to ${dropZoneSelector}`);

    // Read file as buffer
    const buffer = await fs.readFile(filePath);
    const fileName = path.basename(filePath);

    // Create DataTransfer and File in browser
    await page.evaluate(
      async ({
        selector,
        fileName,
        buffer,
      }: {
        selector: string;
        fileName: string;
        buffer: number[];
      }) => {
        const dropZone = document.querySelector(selector);

        // Convert buffer to Uint8Array
        const uint8Array = new Uint8Array(buffer);

        // Create File object
        const file = new File([uint8Array], fileName);

        // Create DataTransfer
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        // Dispatch drag events
        const dragEnterEvent = new DragEvent('dragenter', {
          bubbles: true,
          cancelable: true,
          dataTransfer,
        });

        const dragOverEvent = new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          dataTransfer,
        });

        const dropEvent = new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          dataTransfer,
        });

        if (!dropZone) {
          throw new Error(`Drop zone not found: ${selector}`);
        }

        dropZone.dispatchEvent(dragEnterEvent);
        dropZone.dispatchEvent(dragOverEvent);
        dropZone.dispatchEvent(dropEvent);
      },
      { selector: dropZoneSelector, fileName, buffer: Array.from(buffer) }
    );

    logger.info('Drag-drop upload completed');
  } catch (error) {
    logger.error('Drag-drop upload failed', error);
    throw error;
  }
};

/**
 * Create temporary test file
 *
 * @param {string} filename - File name
 * @param {string} content - File content
 * @param {string} directory - Directory to create file (default: './temp')
 * @returns {Promise<string>} Path to created file
 *
 * @example
 * const filePath = await createTempFile('test.txt', 'Hello World');
 * await uploadFile(page, '#upload', filePath);
 * await deleteTempFile(filePath);
 */
export const createTempFile = async (
  filename: string,
  content: string,
  directory = './temp'
): Promise<string> => {
  try {
    // Ensure directory exists
    await fs.mkdir(directory, { recursive: true });

    const filePath = path.join(directory, filename);
    await fs.writeFile(filePath, content);

    logger.info(`Temp file created: ${filePath}`);
    return filePath;
  } catch (error) {
    logger.error('Failed to create temp file', error);
    throw error;
  }
};

/**
 * Delete temporary file
 *
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>} True if deleted
 *
 * @example
 * await deleteTempFile('./temp/test.txt');
 */
export const deleteTempFile = async (filePath: string): Promise<boolean> => {
  try {
    await fs.unlink(filePath);
    logger.info(`Temp file deleted: ${filePath}`);
    return true;
  } catch (error) {
    logger.warn('Failed to delete temp file', {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
};

/**
 * Create mock image file
 *
 * @param {string} filename - File name
 * @param {Object} options - Image options
 * @param {number} options.width - Width in pixels (default: 100)
 * @param {number} options.height - Height in pixels (default: 100)
 * @param {string} options.color - Background color (default: '#FF0000')
 * @returns {Promise<string>} Path to created image
 *
 * @example
 * const imagePath = await createMockImage('test.png', { width: 200, height: 200 });
 */
export const createMockImage = async (
  filename: string,
  _options: { width?: number; height?: number; directory?: string } = {}
): Promise<string> => {
  // Using width, height, color parameters would require image library
  // For now, using simple base64 encoded image
  // const _height = options.height || 100;
  // const _color = options.color || '#FF0000';

  try {
    // Create a simple base64 encoded 1x1 pixel PNG
    // For testing purposes - in real scenarios, use a proper image library
    const canvas = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==`;

    const directory = './temp';
    await fs.mkdir(directory, { recursive: true });

    const filePath = path.join(directory, filename);

    // For actual implementation, you'd use a canvas library or image manipulation library
    // This is a simplified version
    await fs.writeFile(filePath, Buffer.from(canvas.split(',')[1], 'base64'));

    logger.info(`Mock image created: ${filePath}`);
    return filePath;
  } catch (error) {
    logger.error('Failed to create mock image', error);
    throw error;
  }
};

/**
 * Verify file input accepts file type
 *
 * @param {Page} page - Playwright page object
 * @param {string} selector - File input selector
 * @param {string} fileType - File type to check (e.g., '.pdf', 'image/*')
 * @returns {Promise<boolean>} True if file type is accepted
 *
 * @example
 * const acceptsPDF = await verifyAcceptedFileType(page, '#upload', '.pdf');
 */
export const verifyAcceptedFileType = async (
  page: Page,
  selector: string,
  fileType: string
): Promise<boolean> => {
  try {
    // eslint-disable-next-line playwright/no-eval
    const accept = await page.$eval(selector, input => (input as HTMLInputElement).accept);

    if (!accept) {
      logger.info('Input accepts all file types');
      return true;
    }

    const isAccepted = accept.includes(fileType) || accept.includes('*/*');

    logger.info(`File type ${fileType} ${isAccepted ? 'accepted' : 'not accepted'}`);
    return isAccepted;
  } catch (error) {
    logger.error('Failed to verify accepted file type', error);
    return false;
  }
};

/**
 * Get file input accepted types
 *
 * @param {Page} page - Playwright page object
 * @param {string} selector - File input selector
 * @returns {Promise<string>} Accepted types string
 *
 * @example
 * const accepted = await getAcceptedTypes(page, '#upload');
 * console.log(accepted); // '.pdf,.doc,.docx'
 */
export const getAcceptedTypes = async (page: Page, selector: string): Promise<string[]> => {
  try {
    // eslint-disable-next-line playwright/no-eval
    const accept = await page.$eval(selector, input => (input as HTMLInputElement).accept || '*/*');
    const types = accept.split(',').map(t => t.trim());
    logger.info(`Accepted types: ${accept}`);
    return types;
  } catch (error) {
    logger.error('Failed to get accepted types', error);
    return ['*/*'];
  }
};

/**
 * Check if file input allows multiple files
 *
 * @param {Page} page - Playwright page object
 * @param {string} selector - File input selector
 * @returns {Promise<boolean>} True if multiple files allowed
 *
 * @example
 * const allowsMultiple = await allowsMultipleFiles(page, '#upload');
 */
export const allowsMultipleFiles = async (page: Page, selector: string): Promise<boolean> => {
  try {
    // eslint-disable-next-line playwright/no-eval
    const multiple = await page.$eval(selector, input => (input as HTMLInputElement).multiple);
    logger.info(`Multiple files: ${multiple ? 'allowed' : 'not allowed'}`);
    return multiple;
  } catch (error) {
    logger.error('Failed to check multiple files', error);
    return false;
  }
};

/**
 * Clear file input
 *
 * @param {Page} page - Playwright page object
 * @param {string} selector - File input selector
 * @returns {Promise<void>}
 *
 * @example
 * await clearFileInput(page, '#upload');
 */
export const clearFileInput = async (page: Page, selector: string): Promise<void> => {
  try {
    logger.info(`Clearing file input: ${selector}`);
    await page.setInputFiles(selector, []);
    logger.info('File input cleared');
  } catch (error) {
    logger.error('Failed to clear file input', error);
    throw error;
  }
};

/**
 * Get uploaded file names from input
 *
 * @param {Page} page - Playwright page object
 * @param {string} selector - File input selector
 * @returns {Promise<Array<string>>} Array of file names
 *
 * @example
 * const fileNames = await getUploadedFileNames(page, '#upload');
 * console.log(fileNames); // ['file1.pdf', 'file2.doc']
 */
export const getUploadedFileNames = async (page: Page, selector: string): Promise<string[]> => {
  try {
    // eslint-disable-next-line playwright/no-eval
    const fileNames = await page.$eval(selector, input => {
      const files = (input as HTMLInputElement).files;
      if (!files) {
        return [];
      }
      return Array.from(files).map(file => file.name);
    });

    logger.info(`Uploaded files: ${fileNames.join(', ')}`);
    return fileNames;
  } catch (error) {
    logger.error('Failed to get uploaded file names', error);
    return [];
  }
};

/**
 * Verify file was uploaded successfully
 *
 * @param {Page} page - Playwright page object
 * @param {string} selector - File input selector
 * @param {string} expectedFileName - Expected file name
 * @returns {Promise<boolean>} True if file uploaded
 *
 * @example
 * await uploadFile(page, '#upload', './file.pdf');
 * const success = await verifyFileUploaded(page, '#upload', 'file.pdf');
 */
export const verifyFileUploaded = async (
  page: Page,
  selector: string,
  expectedFileName: string
): Promise<boolean> => {
  try {
    const fileNames = await getUploadedFileNames(page, selector);
    const isUploaded = fileNames.includes(expectedFileName);

    logger.info(`File ${expectedFileName} ${isUploaded ? 'uploaded' : 'not found'}`);
    return isUploaded;
  } catch (error) {
    logger.error('Failed to verify file upload', error);
    return false;
  }
};

/**
 * Upload and wait for progress
 *
 * @param {Page} page - Playwright page object
 * @param {string} inputSelector - File input selector
 * @param {string} filePath - Path to file
 * @param {string} progressSelector - Progress indicator selector
 * @returns {Promise<void>}
 *
 * @example
 * await uploadWithProgress(page, '#upload', './large-file.zip', '.upload-progress');
 */
export const uploadWithProgress = async (
  page: Page,
  inputSelector: string,
  filePath: string,
  progressSelector: string
): Promise<void> => {
  try {
    logger.info('Uploading file with progress tracking');

    // Upload file
    await uploadFile(page, inputSelector, filePath);

    // Wait for progress to appear
    await page.locator(progressSelector).waitFor({ state: 'visible', timeout: 5000 });

    // Wait for progress to complete (element disappears or reaches 100%)
    await page
      .locator(progressSelector)
      .waitFor({ state: 'hidden', timeout: 60000 })
      .catch(() => {
        logger.warn('Progress indicator still visible after timeout');
      });

    logger.info('Upload with progress completed');
  } catch (error) {
    logger.error('Upload with progress failed', error);
    throw error;
  }
};

/**
 * Create file of specific size
 *
 * @param {string} filename - File name
 * @param {number} sizeInMB - File size in megabytes
 * @param {string} directory - Directory (default: './temp')
 * @returns {Promise<string>} Path to created file
 *
 * @example
 * // Create a 5MB test file
 * const largePath = await createFileOfSize('large.bin', 5);
 */
export const createFileOfSize = async (
  filename: string,
  sizeInMB: number,
  directory = './temp'
): Promise<string> => {
  try {
    await fs.mkdir(directory, { recursive: true });

    const filePath = path.join(directory, filename);
    const sizeInBytes = sizeInMB * 1024 * 1024;

    // Create buffer filled with random data
    const buffer = Buffer.alloc(sizeInBytes);
    for (let i = 0; i < sizeInBytes; i += 1000) {
      buffer.write(Math.random().toString(36), i);
    }

    await fs.writeFile(filePath, buffer);

    logger.info(`File created: ${filePath} (${sizeInMB}MB)`);
    return filePath;
  } catch (error) {
    logger.error('Failed to create file of size', error);
    throw error;
  }
};

/**
 * Trigger hidden file input click
 *
 * @param {Page} page - Playwright page object
 * @param {string} selector - File input selector (can be hidden)
 * @returns {Promise<void>}
 *
 * @example
 * await triggerFileInput(page, '#hidden-upload');
 */
export const triggerFileInput = async (page: Page, selector: string): Promise<void> => {
  try {
    logger.info(`Triggering file input: ${selector}`);

    await page.evaluate(sel => {
      const input = document.querySelector(sel);
      if (input) {
        (input as HTMLElement).click();
      }
    }, selector);

    logger.info('File input triggered');
  } catch (error) {
    logger.error('Failed to trigger file input', error);
    throw error;
  }
};
