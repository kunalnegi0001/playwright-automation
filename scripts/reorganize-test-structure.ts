#!/usr/bin/env ts-node

/**
 * Reorganize Test Structure for Consistency
 *
 * This script reorganizes ALL test types to follow consistent feature-based organization:
 * - UI: Already feature-based (admin/, pim/, etc.) → Move to __examples-orangehrm__/
 * - API: Organize by resource (users/, posts/, etc.) → Move to __examples-jsonplaceholder__/
 * - Accessibility: Organize by module → Move to __examples-orangehrm__/
 * - Performance: Organize by type → Move to __examples-orangehrm__/
 * - Visual: Organize by module → Move to __examples-orangehrm__/
 *
 * Usage:
 *   pnpm run reorganize:tests
 *   or
 *   npx ts-node scripts/reorganize-test-structure.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const TESTS_DIR = path.join(ROOT_DIR, 'src/tests');

// Utility functions
const ensureDir = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const moveFile = (source: string, destination: string): void => {
  ensureDir(path.dirname(destination));
  if (fs.existsSync(source)) {
    fs.renameSync(source, destination);
    console.log(
      `✅ Moved: ${path.relative(ROOT_DIR, source)} → ${path.relative(ROOT_DIR, destination)}`
    );
  }
};

const moveDirectory = (source: string, destination: string): void => {
  if (fs.existsSync(source)) {
    ensureDir(path.dirname(destination));
    fs.renameSync(source, destination);
    console.log(
      `✅ Moved directory: ${path.relative(ROOT_DIR, source)} → ${path.relative(ROOT_DIR, destination)}`
    );
  }
};

const deleteDirectory = (dirPath: string): void => {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`🗑️  Deleted: ${path.relative(ROOT_DIR, dirPath)}`);
  }
};

const addExampleTag = (filePath: string): void => {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // Check if already has @example tag
  if (content.includes('@example')) {
    return;
  }

  // Add @example tag after the first line with tags
  const lines = content.split('\n');
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^@\w+/) && !modified) {
      lines[i] = `@example ${lines[i]}`;
      modified = true;
      break;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`🏷️  Added @example tag: ${path.relative(ROOT_DIR, filePath)}`);
  }
};

const createReadme = (dirPath: string, title: string, description: string): void => {
  const readmePath = path.join(dirPath, 'README.md');
  const content = `# ${title}

${description}

## Purpose

These are example tests demonstrating best practices for this test type.

## Running Examples

\`\`\`bash
# Run all examples
pnpm test:examples

# Run this specific example
npx playwright test ${path.relative(path.join(ROOT_DIR, 'src/tests'), dirPath)}
\`\`\`

## Note

These tests are tagged with \`@example\` and automatically excluded from regular test runs.
They serve as reference material and learning resources.
`;

  fs.writeFileSync(readmePath, content);
  console.log(`📝 Created README: ${path.relative(ROOT_DIR, readmePath)}`);
};

// =============================================================================
// 1. REORGANIZE UI TESTS (Already feature-based, just move to examples)
// =============================================================================
const reorganizeUITests = (): void => {
  console.log('\n🔄 REORGANIZING UI TESTS...\n');

  const uiExamplesDir = path.join(TESTS_DIR, 'UI', '__examples-orangehrm__');
  const uiSourceDir = path.join(TESTS_DIR, 'UI');

  const featureDirs = [
    'admin',
    'authentication',
    'dashboard',
    'directory',
    'leave',
    'maintenance',
    'myinfo',
    'performance-module',
    'pim',
    'recruitment',
  ];

  ensureDir(uiExamplesDir);

  for (const feature of featureDirs) {
    const sourceDir = path.join(uiSourceDir, feature);
    const destDir = path.join(uiExamplesDir, feature);

    if (fs.existsSync(sourceDir)) {
      moveDirectory(sourceDir, destDir);

      // Add @example tags to all feature files
      const featuresDir = path.join(destDir, 'features');
      if (fs.existsSync(featuresDir)) {
        fs.readdirSync(featuresDir).forEach(file => {
          if (file.endsWith('.feature')) {
            addExampleTag(path.join(featuresDir, file));
          }
        });
      }
    }
  }

  // Remove duplicate performance_module (snake_case)
  const duplicatePerf = path.join(uiSourceDir, 'performance_module');
  deleteDirectory(duplicatePerf);

  // Move common to examples (it's OrangeHRM-specific)
  const commonSource = path.join(uiSourceDir, 'common');
  const commonDest = path.join(uiExamplesDir, 'common');
  if (fs.existsSync(commonSource)) {
    moveDirectory(commonSource, commonDest);
  }

  createReadme(
    uiExamplesDir,
    'OrangeHRM UI Test Examples',
    'Comprehensive UI test examples covering all OrangeHRM modules using Page Object Model and BDD patterns.'
  );
};

// =============================================================================
// 2. REORGANIZE API TESTS (Organize by resource feature)
// =============================================================================
const reorganizeAPITests = (): void => {
  console.log('\n🔄 REORGANIZING API TESTS...\n');

  const apiExamplesDir = path.join(TESTS_DIR, 'API', '__examples-jsonplaceholder__');
  const apiSourceDir = path.join(TESTS_DIR, 'API');

  ensureDir(apiExamplesDir);

  // Resource-based organization
  const resources = [
    { name: 'users', files: ['users.feature'] },
    { name: 'posts', files: ['posts.feature'] },
    { name: 'comments', files: ['comments.feature'] },
    { name: 'albums', files: ['albums.feature'] },
    { name: 'photos', files: ['photos.feature'] },
    {
      name: 'advanced',
      files: ['advanced-testing.feature', 'enhanced-api.feature', 'error-handling.feature'],
    },
  ];

  for (const resource of resources) {
    const resourceDir = path.join(apiExamplesDir, resource.name);
    const featuresDir = path.join(resourceDir, 'features');
    ensureDir(featuresDir);

    // Move feature files
    for (const file of resource.files) {
      const sourceFile = path.join(apiSourceDir, 'features', file);
      const destFile = path.join(featuresDir, file);
      if (fs.existsSync(sourceFile)) {
        moveFile(sourceFile, destFile);
        addExampleTag(destFile);
      }
    }
  }

  // Move shared step_definitions and hooks
  const stepDefsSource = path.join(apiSourceDir, 'step_definitions');
  const stepDefsDest = path.join(apiExamplesDir, 'step_definitions');
  if (fs.existsSync(stepDefsSource)) {
    moveDirectory(stepDefsSource, stepDefsDest);
  }

  const hooksSource = path.join(apiSourceDir, 'hooks');
  const hooksDest = path.join(apiExamplesDir, 'hooks');
  if (fs.existsSync(hooksSource)) {
    moveDirectory(hooksSource, hooksDest);
  }

  // Clean up empty features directory
  const emptyFeaturesDir = path.join(apiSourceDir, 'features');
  if (fs.existsSync(emptyFeaturesDir) && fs.readdirSync(emptyFeaturesDir).length === 0) {
    deleteDirectory(emptyFeaturesDir);
  }

  createReadme(
    apiExamplesDir,
    'JSONPlaceholder API Test Examples',
    'Comprehensive API test examples using JSONPlaceholder API, demonstrating REST API testing with BDD.'
  );
};

// =============================================================================
// 3. REORGANIZE ACCESSIBILITY TESTS (Organize by module)
// =============================================================================
const reorganizeAccessibilityTests = (): void => {
  console.log('\n🔄 REORGANIZING ACCESSIBILITY TESTS...\n');

  const a11yExamplesDir = path.join(TESTS_DIR, 'accessibility', '__examples-orangehrm__');
  const a11ySourceDir = path.join(TESTS_DIR, 'accessibility');

  ensureDir(path.join(a11yExamplesDir, 'comprehensive'));

  // Move accessibility.spec.ts to comprehensive module
  const sourceFile = path.join(a11ySourceDir, 'accessibility.spec.ts');
  const destFile = path.join(a11yExamplesDir, 'comprehensive', 'accessibility.spec.ts');

  if (fs.existsSync(sourceFile)) {
    moveFile(sourceFile, destFile);
  }

  createReadme(
    a11yExamplesDir,
    'OrangeHRM Accessibility Test Examples',
    'Accessibility testing examples using axe-core and Playwright, demonstrating WCAG compliance checks.'
  );
};

// =============================================================================
// 4. REORGANIZE PERFORMANCE TESTS (Organize by type)
// =============================================================================
const reorganizePerformanceTests = (): void => {
  console.log('\n🔄 REORGANIZING PERFORMANCE TESTS...\n');

  const perfExamplesDir = path.join(TESTS_DIR, 'performance', '__examples-orangehrm__');
  const perfSourceDir = path.join(TESTS_DIR, 'performance');

  // Lighthouse module
  ensureDir(path.join(perfExamplesDir, 'lighthouse'));
  const lighthouseSource = path.join(perfSourceDir, 'lighthouse-ui-comprehensive.spec.ts');
  const lighthouseDest = path.join(
    perfExamplesDir,
    'lighthouse',
    'lighthouse-ui-comprehensive.spec.ts'
  );
  if (fs.existsSync(lighthouseSource)) {
    moveFile(lighthouseSource, lighthouseDest);
  }

  // General performance module
  ensureDir(path.join(perfExamplesDir, 'general'));
  const perfSource = path.join(perfSourceDir, 'performance.spec.ts');
  const perfDest = path.join(perfExamplesDir, 'general', 'performance.spec.ts');
  if (fs.existsSync(perfSource)) {
    moveFile(perfSource, perfDest);
  }

  createReadme(
    perfExamplesDir,
    'OrangeHRM Performance Test Examples',
    'Performance testing examples including Lighthouse audits and custom performance metrics.'
  );
};

// =============================================================================
// 5. REORGANIZE VISUAL TESTS (Organize by module)
// =============================================================================
const reorganizeVisualTests = (): void => {
  console.log('\n🔄 REORGANIZING VISUAL TESTS...\n');

  const visualExamplesDir = path.join(TESTS_DIR, 'visual', '__examples-orangehrm__');
  const visualSourceDir = path.join(TESTS_DIR, 'visual');

  // Dashboard module
  ensureDir(path.join(visualExamplesDir, 'dashboard'));
  const dashboardSource = path.join(visualSourceDir, 'dashboard-visual-comprehensive.spec.ts');
  const dashboardDest = path.join(
    visualExamplesDir,
    'dashboard',
    'dashboard-visual-comprehensive.spec.ts'
  );
  if (fs.existsSync(dashboardSource)) {
    moveFile(dashboardSource, dashboardDest);
  }

  // Move dashboard snapshots
  const snapshotPatterns = [
    'dashboard-visual-comprehensive.spec.ts-snapshots',
    'dashboard-visual-comprehensive.spec.js-snapshots',
    'dashboard-login-visual.spec.ts-snapshots',
    'dashboard-login-visual.spec.js-snapshots',
  ];

  for (const pattern of snapshotPatterns) {
    const snapshotSource = path.join(visualSourceDir, pattern);
    const snapshotDest = path.join(visualExamplesDir, 'dashboard', pattern);
    if (fs.existsSync(snapshotSource)) {
      moveDirectory(snapshotSource, snapshotDest);
    }
  }

  // General visual regression module
  ensureDir(path.join(visualExamplesDir, 'general'));
  const visualSource = path.join(visualSourceDir, 'visual-regression.spec.ts');
  const visualDest = path.join(visualExamplesDir, 'general', 'visual-regression.spec.ts');
  if (fs.existsSync(visualSource)) {
    moveFile(visualSource, visualDest);
  }

  // Move general snapshots
  const generalSnapshots = [
    'visual-regression.spec.ts-snapshots',
    'visual-regression.spec.js-snapshots',
  ];

  for (const pattern of generalSnapshots) {
    const snapshotSource = path.join(visualSourceDir, pattern);
    const snapshotDest = path.join(visualExamplesDir, 'general', pattern);
    if (fs.existsSync(snapshotSource)) {
      moveDirectory(snapshotSource, snapshotDest);
    }
  }

  createReadme(
    visualExamplesDir,
    'OrangeHRM Visual Regression Test Examples',
    'Visual regression testing examples using Playwright screenshots and pixel-based comparisons.'
  );
};

// =============================================================================
// 6. CREATE TEMPLATE DIRECTORIES FOR USER TESTS
// =============================================================================
const createTemplateDirectories = (): void => {
  console.log('\n📁 CREATING TEMPLATE DIRECTORIES FOR YOUR TESTS...\n');

  const templates = [
    { dir: 'UI/your-module', desc: 'Create your UI test modules here' },
    { dir: 'API/your-api', desc: 'Create your API test modules here' },
    { dir: 'accessibility/your-module', desc: 'Create your accessibility tests here' },
    { dir: 'performance/your-module', desc: 'Create your performance tests here' },
    { dir: 'visual/your-module', desc: 'Create your visual regression tests here' },
  ];

  for (const template of templates) {
    const templateDir = path.join(TESTS_DIR, template.dir);
    ensureDir(templateDir);

    const gitkeepPath = path.join(templateDir, '.gitkeep');
    fs.writeFileSync(gitkeepPath, `# ${template.desc}\n`);
    console.log(`📝 Created template: ${path.relative(ROOT_DIR, templateDir)}/`);
  }
};

// =============================================================================
// MAIN EXECUTION
// =============================================================================
const main = (): void => {
  console.log('🚀 REORGANIZING TEST STRUCTURE FOR CONSISTENCY\n');
  console.log('This will organize all test types with consistent feature-based structure:\n');
  console.log('  • UI Tests → __examples-orangehrm__/ (already feature-based)');
  console.log('  • API Tests → __examples-jsonplaceholder__/ (organize by resource)');
  console.log('  • Accessibility → __examples-orangehrm__/ (organize by module)');
  console.log('  • Performance → __examples-orangehrm__/ (organize by type)');
  console.log('  • Visual → __examples-orangehrm__/ (organize by module)');
  console.log(`\n${'='.repeat(80)}\n`);

  reorganizeUITests();
  reorganizeAPITests();
  reorganizeAccessibilityTests();
  reorganizePerformanceTests();
  reorganizeVisualTests();
  createTemplateDirectories();

  console.log(`\n${'='.repeat(80)}`);
  console.log('\n✅ REORGANIZATION COMPLETE!\n');
  console.log('Your test structure is now consistent across all test types.');
  console.log('\nNext steps:');
  console.log('  1. Review the new structure');
  console.log('  2. Run: pnpm test (examples auto-excluded)');
  console.log('  3. Run: pnpm test:examples (to verify examples work)');
  console.log('  4. Update your tests in the template directories\n');
};

// Run the script
main();
