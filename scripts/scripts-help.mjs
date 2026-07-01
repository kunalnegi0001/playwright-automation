import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const packageJsonPath = path.join(rootDir, 'package.json');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const scripts = packageJson.scripts ?? {};

const categories = [
  {
    title: '🧱 Setup & Maintenance',
    match: (name) =>
      ['postinstall', 'clean', 'install:browsers'].includes(name),
  },
  {
    title: '🔎 Validation',
    match: (name) => ['typecheck'].includes(name),
  },
  {
    title: '🧪 Tests',
    match: (name) => name.startsWith('bdd:') || name.startsWith('test:'),
  },
  {
    title: '📊 Reports',
    match: (name) => name.startsWith('report:'),
  },
];

const printed = new Set();

console.log('\nScript Catalog (category-wise)\n');

for (const category of categories) {
  const names = Object.keys(scripts).filter((name) => category.match(name));
  if (names.length === 0) {
    continue;
  }

  console.log(category.title);
  for (const name of names) {
    printed.add(name);
    console.log(`  - ${name}`);
  }
  console.log('');
}

const uncategorized = Object.keys(scripts).filter((name) => !printed.has(name));
if (uncategorized.length > 0) {
  console.log('📦 Uncategorized');
  for (const name of uncategorized) {
    console.log(`  - ${name}`);
  }
  console.log('');
}

console.log('Run any script with: pnpm <script-name>\n');
