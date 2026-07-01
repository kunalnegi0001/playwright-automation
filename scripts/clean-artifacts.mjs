#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const targets = [
  'test-results',
  'playwright-report',
  'allure-results',
  'allure-report',
  'screenshots',
  'videos',
  '.features-gen',
];

for (const target of targets) {
  fs.rmSync(path.resolve(process.cwd(), target), { recursive: true, force: true });
}

const logsDir = path.resolve(process.cwd(), 'logs');
if (fs.existsSync(logsDir)) {
  for (const fileName of fs.readdirSync(logsDir)) {
    if (fileName.endsWith('.log')) {
      fs.rmSync(path.join(logsDir, fileName), { force: true });
    }
  }
}

console.log('Cleaned test artifacts and logs.');
