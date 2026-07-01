#!/usr/bin/env node

/**
 * @fileoverview Cleanup script for removing test artifacts and reports.
 * Safely removes test results, reports, logs, and temporary files, then recreates necessary directories.
 * @module scripts/clean
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const dirsToClean = [
  'test-results',
  'playwright-report',
  'allure-results',
  'allure-report',
  'screenshots',
  'videos',
  'logs',
  'coverage',
  '.auth',
];

const filesToClean = ['page-content.html', 'inspector-full-page.png'];

export const clean = async () => {
  console.log('🧹 Starting cleanup...\n');

  // Clean directories
  for (const dir of dirsToClean) {
    const dirPath = path.join(rootDir, dir);
    try {
      if (await fs.pathExists(dirPath)) {
        await fs.remove(dirPath);
        console.log(`✅ Removed: ${dir}/`);
      }
    } catch (error) {
      console.error(
        `❌ Failed to remove ${dir}/: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Clean files
  for (const file of filesToClean) {
    const filePath = path.join(rootDir, file);
    try {
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
        console.log(`✅ Removed: ${file}`);
      }
    } catch (error) {
      console.error(
        `❌ Failed to remove ${file}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Recreate necessary directories
  console.log('\n📁 Recreating directories...');
  const dirsToRecreate = ['test-results', 'logs', 'screenshots', 'videos'];
  for (const dir of dirsToRecreate) {
    const dirPath = path.join(rootDir, dir);
    try {
      await fs.ensureDir(dirPath);
      console.log(`✅ Created: ${dir}/`);
    } catch (error) {
      console.error(
        `❌ Failed to create ${dir}/: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  console.log('\n✨ Cleanup complete!');
};

// Run cleanup
clean().catch(error => {
  console.error(`\n❌ Cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
