#!/usr/bin/env node

/**
 * @fileoverview Setup script for Playwright Enterprise Framework.
 * Installs dependencies, Playwright browsers, creates directories, and initializes git hooks.
 * @module scripts/setup
 */

import fs from 'fs/promises';
import { execSync } from 'child_process';

console.log('🚀 Setting up Playwright Enterprise Framework...\n');

/**
 * Main setup function
 * Performs complete framework initialization including:
 * - Node.js version check
 * - Dependency installation
 * - Playwright browser installation
 * - Environment file setup
 * - Directory creation
 * - Git hooks initialization
 * @async
 * @returns {Promise<void>}
 */
export const setup = async () => {
  try {
    // Check Node version
    console.log('✓ Checking Node.js version...');
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

    if (majorVersion < 18) {
      console.error('❌ Node.js 18 or higher is required');
      process.exit(1);
    }
    console.log(`  Node.js ${nodeVersion} detected\n`);

    // Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✓ Dependencies installed\n');

    // Install Playwright browsers
    console.log('🌐 Installing Playwright browsers...');
    execSync('npx playwright install --with-deps', { stdio: 'inherit' });
    console.log('✓ Browsers installed\n');

    // Create .env file if it doesn't exist
    console.log('⚙️  Setting up environment configuration...');
    const envPath = '.env';
    const envExamplePath = '.env.example';

    try {
      await fs.access(envPath);
      console.log('  .env file already exists');
    } catch {
      await fs.copyFile(envExamplePath, envPath);
      console.log('✓ Created .env file from .env.example');
      console.log('  ⚠️  Please update .env with your configuration\n');
    }

    // Create necessary directories
    console.log('📁 Creating directories...');
    const directories = [
      'logs',
      'test-results',
      'screenshots',
      'videos',
      '.auth',
      'allure-results',
      'allure-report',
    ];

    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true });
    }
    console.log('✓ Directories created\n');

    // Initialize Husky
    console.log('🪝 Setting up git hooks...');
    try {
      execSync('npx husky install', { stdio: 'inherit' });
      console.log('✓ Git hooks configured\n');
    } catch (error) {
      console.log('  ⚠️  Git hooks setup skipped (not in a git repository)\n');
    }

    // Success message
    console.log('✅ Setup completed successfully!\n');
    console.log('Next steps:');
    console.log('  1. Update .env file with your configuration');
    console.log('  2. Review playwright.config.js');
    console.log('  3. Run tests: npm test\n');
    console.log('Useful commands:');
    console.log('  npm test                 - Run all tests');
    console.log('  npm run test:ui          - Run UI tests');
    console.log('  npm run test:api         - Run API tests');
    console.log('  npm run test:smoke       - Run smoke tests');
    console.log('  npm run test:ui-mode     - Run tests in UI mode');
    console.log('  npm run report:allure    - Generate Allure report\n');
  } catch (error) {
    console.error('\n❌ Setup failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

setup();
