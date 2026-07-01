#!/usr/bin/env node

/**
 * @fileoverview Environment switching script for managing different configurations.
 * Updates .env file based on environment-specific JSON configuration files.
 * @module scripts/env-switch
 * @example
 * node scripts/env-switch.js staging
 * npm run env:switch -- prod
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const environments = ['dev', 'staging', 'prod'];

export const switchEnvironment = async (targetEnv: string): Promise<void> => {
  if (!environments.includes(targetEnv)) {
    console.error(`❌ Invalid environment: ${targetEnv}`);
    console.log(`Valid environments: ${environments.join(', ')}`);
    process.exit(1);
  }

  console.log(`🔄 Switching to ${targetEnv} environment...\n`);

  // Load environment config
  const configPath = path.join(rootDir, 'src', 'test-data', 'environments', `${targetEnv}.json`);

  if (!(await fs.pathExists(configPath))) {
    console.error(`❌ Environment config not found: ${configPath}`);
    process.exit(1);
  }

  const config = (await fs.readJSON(configPath)) as {
    environment: string;
    baseUrl: string;
    apiBaseUrl: string;
    graphqlEndpoint: string;
    parallelization: { workers: number };
    retries: { maxTestRetries: number };
    timeouts: { default: number; navigation: number; action: number };
  };

  // Update .env file
  const envPath = path.join(rootDir, '.env');
  let envContent = '';

  if (await fs.pathExists(envPath)) {
    envContent = await fs.readFile(envPath, 'utf8');
  }

  // Update environment variables
  const updates = {
    NODE_ENV: config.environment,
    BASE_URL: config.baseUrl,
    API_BASE_URL: config.apiBaseUrl,
    GRAPHQL_ENDPOINT: config.graphqlEndpoint,
    PARALLEL_WORKERS: config.parallelization.workers,
    MAX_TEST_RETRIES: config.retries.maxTestRetries,
    DEFAULT_TIMEOUT: config.timeouts.default,
    NAVIGATION_TIMEOUT: config.timeouts.navigation,
    ACTION_TIMEOUT: config.timeouts.action,
  };

  Object.entries(updates).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  });

  await fs.writeFile(envPath, `${envContent.trim()}\n`);

  console.log('✅ Environment variables updated:');
  console.log('─'.repeat(50));
  Object.entries(updates).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });
  console.log('─'.repeat(50));

  console.log(`\n✨ Successfully switched to ${targetEnv} environment!`);
  console.log(`\n📝 Config loaded from: ${configPath}`);
  console.log(`📝 Updated: ${envPath}`);
};

// Get target environment from command line
const targetEnv = process.argv[2];

if (!targetEnv) {
  console.log('Usage: node scripts/env-switch.js <environment>');
  console.log(`Available environments: ${environments.join(', ')}`);
  process.exit(1);
}

// Run environment switch
switchEnvironment(targetEnv).catch(error => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`\n❌ Environment switch failed: ${errorMessage}`);
  process.exit(1);
});
