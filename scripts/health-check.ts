#!/usr/bin/env ts-node
/**
 * @fileoverview Health check script for CI/CD pipelines
 * Validates that all required services, dependencies, and configurations are available
 * @module scripts/health-check
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

type HealthCheckResult = {
  /** Check name */
  name: string;
  /** Whether check passed */
  passed: boolean;
  /** Error message if failed */
  error?: string;
  /** Additional context */
  details?: string;
};

type HealthCheckReport = {
  /** Overall health status */
  healthy: boolean;
  /** Timestamp of check */
  timestamp: string;
  /** Individual check results */
  checks: HealthCheckResult[];
  /** Number of passed checks */
  passed: number;
  /** Number of failed checks */
  failed: number;
};

/**
 * Checks if a file exists
 */
const checkFileExists = (filePath: string, name: string): HealthCheckResult => {
  try {
    const exists = fs.existsSync(filePath);
    return {
      name,
      passed: exists,
      error: exists ? undefined : `File not found: ${filePath}`,
      details: filePath,
    };
  } catch (error) {
    return {
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Checks if a package is installed
 */
const checkPackageInstalled = (packageName: string): HealthCheckResult => {
  try {
    const packagePath = path.join(process.cwd(), 'node_modules', packageName);
    const exists = fs.existsSync(packagePath);
    return {
      name: `Package: ${packageName}`,
      passed: exists,
      error: exists ? undefined : `Package not installed: ${packageName}`,
    };
  } catch (error) {
    return {
      name: `Package: ${packageName}`,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Checks Node.js version
 */
const checkNodeVersion = (): HealthCheckResult => {
  try {
    const requiredVersion = '18.0.0';
    const currentVersion = process.version.replace('v', '');

    const [reqMajor] = requiredVersion.split('.').map(Number);
    const [curMajor] = currentVersion.split('.').map(Number);

    const passed = curMajor >= reqMajor;

    return {
      name: 'Node.js Version',
      passed,
      error: passed ? undefined : `Node.js ${requiredVersion}+ required, found ${currentVersion}`,
      details: `Current: ${currentVersion}, Required: ${requiredVersion}+`,
    };
  } catch (error) {
    return {
      name: 'Node.js Version',
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Checks TypeScript compilation
 */
const checkTypeScript = (): HealthCheckResult => {
  try {
    execSync('tsc --noEmit', { stdio: 'pipe', encoding: 'utf-8' });
    return {
      name: 'TypeScript Compilation',
      passed: true,
      details: 'No type errors',
    };
  } catch (error) {
    return {
      name: 'TypeScript Compilation',
      passed: false,
      error: 'Type errors detected',
      details: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Checks environment variables
 */
const checkEnvironmentVariables = (): HealthCheckResult => {
  const optionalVars = ['NODE_ENV', 'BASE_URL'];
  const missing: string[] = [];

  optionalVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // These are optional for local development but should be set in CI/CD
  const isCI = process.env.CI === 'true';
  const passed = !isCI || missing.length === 0;

  return {
    name: 'Environment Variables',
    passed,
    error: !passed ? `Missing environment variables: ${missing.join(', ')}` : undefined,
    details:
      missing.length === 0
        ? 'All environment variables set'
        : isCI
          ? undefined
          : `Optional (local dev): ${missing.join(', ')} not set`,
  };
};

/**
 * Checks disk space
 */
const checkDiskSpace = (): HealthCheckResult => {
  try {
    const stats = fs.statfsSync(process.cwd());
    const freeSpaceGB = (stats.bavail * stats.bsize) / 1024 / 1024 / 1024;
    const minRequiredGB = 1;

    const passed = freeSpaceGB >= minRequiredGB;

    return {
      name: 'Disk Space',
      passed,
      error: passed ? undefined : `Insufficient disk space: ${freeSpaceGB.toFixed(2)}GB available`,
      details: `${freeSpaceGB.toFixed(2)}GB available`,
    };
  } catch (error) {
    return {
      name: 'Disk Space',
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Checks if Playwright browsers are installed
 */
const checkPlaywrightBrowsers = (): HealthCheckResult => {
  try {
    // Check both Linux (~/.cache/ms-playwright) and macOS (~/Library/Caches/ms-playwright) locations
    const linuxPath = path.join(process.env.HOME || '', '.cache', 'ms-playwright');
    const macOSPath = path.join(process.env.HOME || '', 'Library', 'Caches', 'ms-playwright');

    const exists = fs.existsSync(linuxPath) || fs.existsSync(macOSPath);
    const actualPath = fs.existsSync(linuxPath) ? linuxPath : macOSPath;

    return {
      name: 'Playwright Browsers',
      passed: exists,
      error: exists ? undefined : 'Playwright browsers not installed',
      details: exists ? `Browsers installed at ${actualPath}` : 'Run: pnpm exec playwright install',
    };
  } catch (error) {
    return {
      name: 'Playwright Browsers',
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Runs all health checks
 */
const runHealthChecks = async (): Promise<HealthCheckReport> => {
  const checks: HealthCheckResult[] = [];

  // File existence checks
  checks.push(checkFileExists('package.json', 'package.json'));
  checks.push(checkFileExists('playwright.config.ts', 'Playwright Config'));
  checks.push(checkFileExists('tsconfig.json', 'TypeScript Config'));
  checks.push(checkFileExists('.env.example', '.env.example'));

  // Package checks
  checks.push(checkPackageInstalled('@playwright/test'));
  checks.push(checkPackageInstalled('typescript'));

  // System checks
  checks.push(checkNodeVersion());
  checks.push(checkTypeScript());
  checks.push(checkEnvironmentVariables());
  checks.push(checkDiskSpace());
  checks.push(checkPlaywrightBrowsers());

  const passed = checks.filter(c => c.passed).length;
  const failed = checks.filter(c => !c.passed).length;

  return {
    healthy: failed === 0,
    timestamp: new Date().toISOString(),
    checks,
    passed,
    failed,
  };
};

/**
 * Prints health check report
 */
const printReport = (report: HealthCheckReport): void => {
  console.log('\n🏥 Health Check Report');
  console.log('='.repeat(60));
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Status: ${report.healthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
  console.log(`Passed: ${report.passed}/${report.checks.length}`);
  console.log(`Failed: ${report.failed}/${report.checks.length}`);
  console.log('='.repeat(60));

  report.checks.forEach(check => {
    const icon = check.passed ? '✅' : '❌';
    console.log(`\n${icon} ${check.name}`);
    if (check.details) {
      console.log(`   ${check.details}`);
    }
    if (check.error) {
      console.log(`   ⚠️  ${check.error}`);
    }
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(report.healthy ? '✅ All checks passed!' : '❌ Some checks failed!');
  console.log(`${'='.repeat(60)}\n`);
};

/**
 * Main execution
 */
const main = async (): Promise<void> => {
  try {
    const report = await runHealthChecks();
    printReport(report);

    // Exit with appropriate code
    process.exit(report.healthy ? 0 : 1);
  } catch (error) {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  }
};

// Run if executed directly (ES module)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  void main();
}

export { runHealthChecks, type HealthCheckReport, type HealthCheckResult };
