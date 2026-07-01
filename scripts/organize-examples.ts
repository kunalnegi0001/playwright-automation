#!/usr/bin/env ts-node

/**
 * Organize Examples with Clear Naming Convention
 *
 * This script organizes all OrangeHRM sample tests using the naming convention:
 * __examples-orangehrm__/
 *
 * This keeps examples in place but makes them:
 * - Clearly identifiable as examples (not active tests)
 * - Automatically excluded from regular test runs
 * - Easy to reference and learn from
 * - Comprehensive coverage retained
 *
 * Usage:
 *   pnpm run organize:examples
 *   or
 *   npx ts-node scripts/organize-examples.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');

// OrangeHRM sample directories to organize
const UI_EXAMPLES_TO_ORGANIZE = [
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

const API_EXAMPLES_TO_ORGANIZE = ['features', 'hooks', 'step_definitions'];

const STANDALONE_EXAMPLES = [
  'src/tests/seed.spec.ts',
  'src/tests/accessibility/accessibility.spec.ts',
  'src/tests/performance/lighthouse-ui-comprehensive.spec.ts',
  'src/tests/performance/performance.spec.ts',
  'src/tests/visual/dashboard-visual-comprehensive.spec.ts',
  'src/tests/visual/visual-regression.spec.ts',
];

/**
 * Remove duplicate performance_module directory
 */
const removeDuplicateDirectory = (): void => {
  const duplicatePath = path.join(ROOT_DIR, 'src/tests/UI/performance_module');
  if (fs.existsSync(duplicatePath)) {
    fs.rmSync(duplicatePath, { recursive: true, force: true });
    console.log('✅ Removed duplicate: src/tests/UI/performance_module');
  } else {
    console.log('⏭️  No duplicate directory found (already clean)');
  }
};

/**
 * Organize UI examples under __examples-orangehrm__
 */
const organizeUIExamples = (): void => {
  const uiTestsDir = path.join(ROOT_DIR, 'src/tests/UI');
  const examplesDir = path.join(uiTestsDir, '__examples-orangehrm__');

  // Create examples directory if it doesn't exist
  if (!fs.existsSync(examplesDir)) {
    fs.mkdirSync(examplesDir, { recursive: true });
    console.log('📁 Created: src/tests/UI/__examples-orangehrm__/');
  }

  // Move each example module
  UI_EXAMPLES_TO_ORGANIZE.forEach(moduleName => {
    const sourcePath = path.join(uiTestsDir, moduleName);
    const destPath = path.join(examplesDir, moduleName);

    if (fs.existsSync(sourcePath)) {
      if (fs.existsSync(destPath)) {
        console.log(`⏭️  Already organized: ${moduleName}`);
      } else {
        fs.renameSync(sourcePath, destPath);
        console.log(`✅ Moved: ${moduleName} → __examples-orangehrm__/${moduleName}`);
      }
    } else {
      console.log(`⏭️  Not found: ${moduleName}`);
    }
  });

  // Move common if it's OrangeHRM-specific
  const commonPath = path.join(uiTestsDir, 'common');
  if (fs.existsSync(commonPath)) {
    const commonDestPath = path.join(examplesDir, 'common');
    if (!fs.existsSync(commonDestPath)) {
      fs.renameSync(commonPath, commonDestPath);
      console.log('✅ Moved: common → __examples-orangehrm__/common');
    }
  }
};

/**
 * Organize API examples under __examples-orangehrm__
 */
const organizeAPIExamples = (): void => {
  const apiTestsDir = path.join(ROOT_DIR, 'src/tests/API');
  const examplesDir = path.join(apiTestsDir, '__examples-orangehrm__');

  // Create examples directory
  if (!fs.existsSync(examplesDir)) {
    fs.mkdirSync(examplesDir, { recursive: true });
    console.log('📁 Created: src/tests/API/__examples-orangehrm__/');
  }

  // Move each API example module
  API_EXAMPLES_TO_ORGANIZE.forEach(moduleName => {
    const sourcePath = path.join(apiTestsDir, moduleName);
    const destPath = path.join(examplesDir, moduleName);

    if (fs.existsSync(sourcePath)) {
      if (fs.existsSync(destPath)) {
        console.log(`⏭️  Already organized: API/${moduleName}`);
      } else {
        fs.renameSync(sourcePath, destPath);
        console.log(`✅ Moved: API/${moduleName} → __examples-orangehrm__/${moduleName}`);
      }
    } else {
      console.log(`⏭️  Not found: API/${moduleName}`);
    }
  });
};

/**
 * Organize standalone example tests
 */
const organizeStandaloneExamples = (): void => {
  STANDALONE_EXAMPLES.forEach(filePath => {
    const sourcePath = path.join(ROOT_DIR, filePath);
    if (!fs.existsSync(sourcePath)) {
      console.log(`⏭️  Not found: ${filePath}`);
      return;
    }

    const dir = path.dirname(sourcePath);
    const filename = path.basename(sourcePath);
    const examplesDir = path.join(dir, '__examples__');
    const destPath = path.join(examplesDir, filename);

    // Create __examples__ directory
    if (!fs.existsSync(examplesDir)) {
      fs.mkdirSync(examplesDir, { recursive: true });
    }

    // Move file
    if (!fs.existsSync(destPath)) {
      fs.renameSync(sourcePath, destPath);
      console.log(`✅ Moved: ${filePath} → ${path.relative(ROOT_DIR, destPath)}`);
    } else {
      console.log(`⏭️  Already organized: ${filePath}`);
    }
  });
};

/**
 * Add @example tag to feature files
 */
const addExampleTags = (): void => {
  const examplesDirs = [
    'src/tests/UI/__examples-orangehrm__',
    'src/tests/API/__examples-orangehrm__',
  ];

  examplesDirs.forEach(examplesDir => {
    const fullPath = path.join(ROOT_DIR, examplesDir);
    if (!fs.existsSync(fullPath)) {
      return;
    }

    // Find all .feature files
    const findFeatureFiles = (dir: string): string[] => {
      let results: string[] = [];
      const files = fs.readdirSync(dir);

      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          results = results.concat(findFeatureFiles(filePath));
        } else if (file.endsWith('.feature')) {
          results.push(filePath);
        }
      });

      return results;
    };

    const featureFiles = findFeatureFiles(fullPath);

    featureFiles.forEach(featureFile => {
      const content = fs.readFileSync(featureFile, 'utf-8');
      const lines = content.split('\n');

      // Check if @example tag exists
      const hasExampleTag = content.includes('@example');
      if (hasExampleTag) {
        console.log(`⏭️  Already tagged: ${path.relative(ROOT_DIR, featureFile)}`);
        return;
      }

      // Find Feature line and add @example tag
      let modified = false;
      const newLines = lines.map((line, index) => {
        if (line.trim().startsWith('Feature:') && index > 0) {
          // Add @example on the line before Feature
          modified = true;
          return `@example\n${line}`;
        }
        return line;
      });

      if (modified) {
        fs.writeFileSync(featureFile, newLines.join('\n'));
        console.log(`✅ Tagged: ${path.relative(ROOT_DIR, featureFile)}`);
      }
    });
  });
};

/**
 * Create README files in example directories
 */
const createExampleREADMEs = (): void => {
  const uiReadmeContent = `# OrangeHRM Test Examples

**Application:** https://opensource-demo.orangehrmlive.com/
**Credentials:** Admin / admin123

## Purpose

These are **comprehensive example tests** demonstrating best practices and patterns for this framework, including:

- ✅ BDD (Cucumber/Gherkin) feature files
- ✅ Page Object Model implementation
- ✅ Step definitions with proper fixtures
- ✅ Custom fixtures and hooks
- ✅ Authentication patterns
- ✅ Multiple test scenarios

## Running These Examples

\`\`\`bash
# Run all OrangeHRM examples
npx playwright test src/tests/UI/__examples-orangehrm__

# Run specific module
npx playwright test src/tests/UI/__examples-orangehrm__/authentication
npx playwright test src/tests/UI/__examples-orangehrm__/pim

# Run with specific tag
npx playwright test --grep "@example.*@smoke"

# Run all examples across framework
pnpm test:examples
\`\`\`

## Using as Reference

Copy and adapt these patterns for your project:

1. **Page Objects** → See \`pages/*.page.ts\` for structure
2. **Features** → See \`features/*.feature\` for Gherkin examples
3. **Steps** → See \`step_definitions/*.steps.ts\` for implementation
4. **Fixtures** → See \`common/fixtures/\` for custom fixtures

## Modules Included

| Module | Description | Key Patterns |
|--------|-------------|--------------|
| **admin** | User management | CRUD operations, tables |
| **authentication** | Login/logout | Auth patterns, session |
| **dashboard** | Dashboard tests | Charts, widgets, navigation |
| **pim** | Employee management | Forms, file upload |
| **recruitment** | Recruitment flow | Multi-step forms |
| **directory** | Employee directory | Search, filters |
| **leave** | Leave management | Date pickers, approvals |
| **myinfo** | Employee self-service | Profile updates |
| **maintenance** | System maintenance | Admin features |
| **performance** | Performance reviews | Ratings, evaluations |

## Important Notes

⚠️ **These are EXAMPLES, not active tests**

- Tagged with \`@example\` - excluded from regular test runs
- For reference and learning only
- Do not modify these for your project
- Create your own tests in \`src/tests/UI/your-module/\`

## Creating Your Own Tests

\`\`\`bash
# Create your module
mkdir -p src/tests/UI/your-module/{pages,features,step_definitions}

# Copy structure from examples
cp src/tests/UI/__examples-orangehrm__/authentication/pages/login.page.ts \\
   src/tests/UI/your-module/pages/your-page.page.ts

# Update for your application
# Don't include @example tag in your tests
\`\`\`

---

**Last Updated:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
`;

  const apiReadmeContent = `# OrangeHRM API Test Examples

**API Base:** https://jsonplaceholder.typicode.com/ (used for examples)

## Purpose

Comprehensive API testing examples showing:

- ✅ BDD API feature files
- ✅ REST API testing patterns
- ✅ Request/response validation
- ✅ Schema validation with JSON Schema
- ✅ API test hooks and setup
- ✅ Data-driven testing

## Running API Examples

\`\`\`bash
# All API examples
npx playwright test src/tests/API/__examples-orangehrm__

# With specific tag
npx playwright test --grep "@example.*@api"
\`\`\`

## Structure

- **features/** - Gherkin feature files for API tests
- **hooks/** - Setup/teardown hooks for API tests
- **step_definitions/** - Step implementations using APIClient

## Using as Reference

Study these examples to learn:
1. How to structure API feature files
2. How to use step definitions for API testing
3. How to validate responses
4. How to handle authentication in API tests

---

**Last Updated:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
`;

  // Write UI README
  const uiReadmePath = path.join(ROOT_DIR, 'src/tests/UI/__examples-orangehrm__/README.md');
  if (fs.existsSync(path.dirname(uiReadmePath))) {
    fs.writeFileSync(uiReadmePath, uiReadmeContent);
    console.log('✅ Created: src/tests/UI/__examples-orangehrm__/README.md');
  }

  // Write API README
  const apiReadmePath = path.join(ROOT_DIR, 'src/tests/API/__examples-orangehrm__/README.md');
  if (fs.existsSync(path.dirname(apiReadmePath))) {
    fs.writeFileSync(apiReadmePath, apiReadmeContent);
    console.log('✅ Created: src/tests/API/__examples-orangehrm__/README.md');
  }
};

/**
 * Create template directories for user tests
 */
const createTemplateDirectories = (): void => {
  const templates = [
    'src/tests/UI/common/pages',
    'src/tests/UI/common/fixtures',
    'src/tests/UI/common/step_definitions',
    'src/tests/UI/_templates',
    'src/tests/API/_templates',
  ];

  templates.forEach(templatePath => {
    const fullPath = path.join(ROOT_DIR, templatePath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      // Create .gitkeep
      fs.writeFileSync(path.join(fullPath, '.gitkeep'), '');
      console.log(`✅ Created template directory: ${templatePath}`);
    }
  });
};

/**
 * Main organization function
 */
const organizeExamples = (): void => {
  console.log('\n📦 Organizing examples with naming convention...\n');
  console.log('Strategy: Keep examples as comprehensive reference material');
  console.log('Pattern: __examples-{source}__/\n');

  console.log('📁 Step 1: Removing duplicate directories...\n');
  removeDuplicateDirectory();

  console.log('\n📁 Step 2: Organizing UI examples...\n');
  organizeUIExamples();

  console.log('\n📁 Step 3: Organizing API examples...\n');
  organizeAPIExamples();

  console.log('\n📁 Step 4: Organizing standalone examples...\n');
  organizeStandaloneExamples();

  console.log('\n🏷️  Step 5: Adding @example tags to feature files...\n');
  addExampleTags();

  console.log('\n📝 Step 6: Creating README files...\n');
  createExampleREADMEs();

  console.log('\n📁 Step 7: Creating template directories...\n');
  createTemplateDirectories();

  console.log('\n✨ Organization complete!\n');
  console.log('✅ Examples organized under __examples-orangehrm__/');
  console.log('✅ Feature files tagged with @example');
  console.log('✅ READMEs created for reference');
  console.log('✅ Template directories ready for your tests\n');

  console.log('Next steps:');
  console.log('1. Update playwright.config.ts to exclude @example by default');
  console.log('   Add: grepInvert: /@example/');
  console.log('2. Run examples: pnpm test:examples');
  console.log('3. Create your tests in: src/tests/UI/your-module/');
  console.log('4. See: docs/EXAMPLES-STRATEGY.md for details\n');
};

// Run organization
if (require.main === module) {
  organizeExamples();
}

export { organizeExamples };
