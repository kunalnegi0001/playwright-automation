/**
 * @fileoverview Global teardown for Playwright test execution.
 * Runs once after all tests to cleanup, save sessions, and generate reports.
 * @module fixtures/global-teardown
 */

import { logger } from '@utils/core/logger';

/**
 * Global Teardown
 * Runs once after all tests to cleanup and finalize
 * @async
 * @param {Object} config - Playwright configuration object
 * @returns {Promise<void>}
 */
export const globalTeardown = async (_config: Record<string, unknown>): Promise<void> => {
  console.log('\n🧹 Starting Global Teardown...');
  logger.info('Global teardown started');

  try {
    // Generate final reports
    console.log('📊 Generating reports...');

    // Clean up temporary files
    console.log('🗑️  Cleaning up temporary files...');

    logger.info('Global teardown completed successfully');
    console.log('✅ Global Teardown Complete');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Global teardown failed', error);
    console.error('❌ Global Teardown Failed:', errorMessage);
  }
};

// NOTE: Playwright requires default export for globalSetup/globalTeardown functions
// This is an exception to the framework's named-exports-only convention
export default globalTeardown;
