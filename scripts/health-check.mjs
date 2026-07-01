import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const checkFileExists = (filePath, name) => {
  const exists = fs.existsSync(filePath);
  return {
    name,
    passed: exists,
    details: filePath,
    error: exists ? undefined : `Missing file: ${filePath}`,
  };
};

const checkCommand = (name, command) => {
  try {
    execSync(command, { stdio: 'pipe', encoding: 'utf-8' });
    return { name, passed: true };
  } catch (error) {
    return {
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

const checkNodeVersion = () => {
  const currentVersion = process.version.replace('v', '');
  const [major] = currentVersion.split('.').map(Number);
  const passed = major >= 18;

  return {
    name: 'Node.js version',
    passed,
    details: currentVersion,
    error: passed ? undefined : `Node.js 18+ required, found ${currentVersion}`,
  };
};

const checkPlaywrightBrowsers = () => {
  const home = process.env.HOME || '';
  const browserLocations = [
    path.join(home, '.cache', 'ms-playwright'),
    path.join(home, 'Library', 'Caches', 'ms-playwright'),
  ];
  const found = browserLocations.find(location => fs.existsSync(location));

  return {
    name: 'Playwright browsers',
    passed: Boolean(found),
    details: found || 'Run pnpm install or pnpm install:browsers',
    error: found ? undefined : 'Playwright browsers are not installed',
  };
};

const checkEnvironment = () => {
  const requiredInCi = ['BASE_URL'];
  const missing = requiredInCi.filter(variableName => !process.env[variableName]);
  const isCi = process.env.CI === 'true';
  const passed = !isCi || missing.length === 0;

  return {
    name: 'Environment readiness',
    passed,
    details: missing.length === 0 ? 'Environment variables look good' : `Missing: ${missing.join(', ')}`,
    error: passed ? undefined : `Missing CI variables: ${missing.join(', ')}`,
  };
};

const checks = [
  checkFileExists('package.json', 'package manifest'),
  checkFileExists('playwright.config.ts', 'Playwright config'),
  checkFileExists('azure-pipelines.yml', 'Azure pipeline'),
  checkFileExists('.env.example', 'Environment example'),
  checkNodeVersion(),
  checkEnvironment(),
  checkPlaywrightBrowsers(),
  checkCommand('TypeScript tests config', 'pnpm typecheck'),
];

const passedCount = checks.filter(check => check.passed).length;
const failedChecks = checks.filter(check => !check.passed);

console.log('\n🏥 Framework health check');
console.log('='.repeat(48));
for (const check of checks) {
  console.log(`${check.passed ? '✅' : '❌'} ${check.name}`);
  if (check.details) {
    console.log(`   ${check.details}`);
  }
  if (check.error) {
    console.log(`   ${check.error}`);
  }
}
console.log('='.repeat(48));
console.log(`Passed ${passedCount}/${checks.length} checks`);

if (failedChecks.length > 0) {
  process.exitCode = 1;
}
