/**
 * @fileoverview Global setup for Playwright test execution.
 * Runs once before all tests to initialize directories, session pools, and cleanup.
 * @module fixtures/global-setup
 */

import { logger } from '@utils/core/logger';
import fs from 'fs/promises';

/**
 * Global Setup
 * Runs once before all tests to prepare the test environment
 * @async
 * @param {Object} config - Playwright configuration object
 * @returns {Promise<void>}
 */
export const globalSetup = async (_config: Record<string, unknown>): Promise<void> => {
  console.log('🚀 Starting Global Setup...');
  logger.info('Global setup started');

  try {
    // Create necessary directories
    await createDirectories();

    // Clean up old artifacts if needed
    await cleanupOldArtifacts();

    // Seed database if needed
    if (process.env.SEED_DATABASE === 'true') {
      console.log('📦 Seeding database...');
      // Add database seeding logic here
    }

    logger.info('Global setup completed successfully');
    console.log('✅ Global Setup Complete\n');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Global setup failed', error);
    console.error('❌ Global Setup Failed:', errorMessage);
    throw error;
  }
};

/**
 * Create necessary directories for test execution
 * Creates logs, test-results, screenshots, videos, .auth, and allure-results directories
 * @returns Promise that resolves when all directories are created
 * @example
 * await createDirectories();
 */
export const createDirectories = async (): Promise<void> => {
  const dirs = ['logs', 'test-results', 'screenshots', 'videos', '.auth', 'allure-results'];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
};

/**
 * Clean up old test artifacts based on retention policy
 * Removes artifacts older than configured retention days (default: 90 days)
 * @returns Promise that resolves when cleanup is complete
 * @example
 * await cleanupOldArtifacts();
 */
export const cleanupOldArtifacts = async (): Promise<void> => {
  const retentionDays = Number(process.env.ARTIFACT_RETENTION_DAYS || 30);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  // Add cleanup logic here for old test artifacts
  logger.info(`Cleaning up artifacts older than ${retentionDays} days`);
};

// NOTE: Playwright requires default export for globalSetup/globalTeardown functions
// This is an exception to the framework's named-exports-only convention
export default globalSetup;
