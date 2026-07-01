# 🎭 Playwright Enterprise Test Automation Framework

> A production-ready, enterprise-grade test automation framework built with
> Playwright and TypeScript, featuring comprehensive UI, API, accessibility,
> performance, and visual regression testing capabilities.

[![Playwright](https://img.shields.io/badge/Playwright-v1.54.0-45ba4b?logo=playwright)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.9.3-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D18.0.0-339933?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📑 Table of Contents

- [Features](#-features)
- [Enterprise Readiness](#-enterprise-readiness)
- [Starting a New Project](#-starting-a-new-project)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Running Tests](#-running-tests)
- [Test Tags](#-test-tags)
- [Configuration](#-configuration)
- [Authentication](#-authentication)
- [Reporting](#-reporting)
- [Best Practices](#-best-practices)
- [CI/CD Integration](#-cicd-integration)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [Documentation](#-documentation)

---

> **📚 Documentation Hub**  
> Explore our comprehensive documentation: [Documentation Index](docs/README.md)
> | [AI Coding Guidelines (AGENTS.md)](AGENTS.md) |
> [Agent Skills (SKILL.md)](SKILL.md)

---

## 🎯 Enterprise Readiness

This framework has been thoroughly audited for enterprise production use:

- **Assessment Score:** 92/100 (Excellent)
- **Status:** ✅ Production-Ready
- **Compliance:** ISO 27001, SOC 2, GDPR considerations
- **Security:** CodeQL scanning, dependency auditing, secret management

📋 **Quick Links:**

- [Advanced Features](docs/advanced.md) - Enterprise features and advanced
  patterns
- [Security Policy](SECURITY.md) - Security practices and vulnerability
  reporting
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute to this
  framework

---

## ✨ Features

### 🎯 Core Testing Capabilities

| Feature               | Description                                        | Status |
| --------------------- | -------------------------------------------------- | ------ |
| **UI Testing**        | Multi-browser testing (Chromium, Firefox, WebKit)  | ✅     |
| **API Testing**       | REST API testing with schema validation            | ✅     |
| **BDD Support**       | Cucumber/Gherkin feature files with playwright-bdd | ✅     |
| **Visual Regression** | Pixel-perfect screenshot comparison                | ✅     |
| **Accessibility**     | WCAG compliance testing with @axe-core/playwright  | ✅     |
| **Performance**       | Core Web Vitals & Lighthouse audits                | ✅     |
| **Mobile Testing**    | Device emulation and responsive testing            | ✅     |

### 🔐 Advanced Features

- **Authentication Strategies**
  - Basic Auth
  - OAuth 2.0 (Okta, Auth0, Azure AD)
  - SAML
  - Session pooling for parallel execution
- **Data Management**
  - Test data factories with Faker.js
  - Database support (PostgreSQL, MySQL, MongoDB, Redis)
  - Dynamic data generation
  - Encrypted credential management

- **Reporting & Monitoring**
  - Allure Reports (interactive HTML reports)
  - Playwright HTML Reports (with traces, videos, screenshots)
  - Custom audit logging for compliance
  - Slack/Teams/Email notifications

- **Developer Experience**
  - Full TypeScript support
  - ESLint + Prettier integration
  - VS Code snippets and debugging configs
  - Hot reload in UI mode
  - Git hooks with Husky & lint-staged

---

## 🆕 Working with Examples

**Philosophy:** This framework includes comprehensive test examples organized
with **consistent feature-based structure across all test types**. They serve as
**reference material and learning resources** and can be run through explicit
example-only projects or alongside framework suites.

### Understanding the Examples Strategy

```
src/tests/
├── UI/
│   ├── __examples-orangehrm__/     # ⭐ UI examples (feature-based)
│   │   ├── admin/                  # User management
│   │   ├── authentication/         # Login/logout
│   │   ├── pim/                    # Employee management
│   │   ├── recruitment/            # Recruitment module
│   │   └── README.md
│   ├── common/                     # Your shared components
│   └── your-module/                # Your UI tests
├── API/
│   ├── __examples-jsonplaceholder__/ # ⭐ API examples (resource-based)
│   │   ├── users/                  # User API tests
│   │   ├── posts/                  # Posts API tests
│   │   ├── comments/               # Comments API tests
│   │   ├── albums/                 # Albums API tests
│   │   └── README.md
│   └── your-api/                   # Your API tests
├── accessibility/
│   ├── __examples-orangehrm__/     # ⭐ A11y examples (module-based)
│   │   ├── comprehensive/
│   │   └── README.md
│   └── your-module/                # Your a11y tests
├── performance/
│   ├── __examples-orangehrm__/     # ⭐ Perf examples (type-based)
│   │   ├── lighthouse/
│   │   ├── general/
│   │   └── README.md
│   └── your-module/                # Your perf tests
└── visual/
    ├── __examples-orangehrm__/     # ⭐ Visual examples (module-based)
    │   ├── dashboard/
    │   ├── general/
    │   └── README.md
    └── your-module/                # Your visual tests
```

### Quick Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your application URLs and credentials
```

**Environment Setup:**

```bash
# Required: Update these in your .env file
BASE_URL=https://your-app.example.com
LOGIN_URL=https://your-app.example.com/login
TEST_USERNAME=your_test_username
TEST_PASSWORD=your_test_password

# For OrangeHRM examples (optional - uses defaults if not set)
ORANGEHRM_BASE_URL=https://opensource-demo.orangehrmlive.com
ORANGEHRM_LOGIN_URL=https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
ORANGEHRM_USERNAME=Admin
ORANGEHRM_PASSWORD=admin123
```

**Using Environment Config in Tests:**

```typescript
import { env } from '@config/env.config';

// Access environment variables with type safety
await page.goto(env.orangehrm.loginUrl);
await page.fill('[name="username"]', env.orangehrm.username);
await page.fill('[name="password"]', env.orangehrm.password);
```

```bash
# 3. Reorganize examples with consistent structure (one-time setup - RECOMMENDED)
pnpm run reorganize:tests

# 4. Start creating your tests!
# Your tests: src/tests/UI/your-module/
# UI Examples: src/tests/UI/__examples-orangehrm__/ (reference only)
# API Examples: src/tests/API/__examples-jsonplaceholder__/ (reference only)
```

### Working with Examples

```bash
# Run your primary end-to-end suites
pnpm test

# Run UI BDD examples (OrangeHRM)
pnpm test:examples

# Run API BDD examples (JSONPlaceholder)
pnpm test:examples:api

# Run accessibility examples
pnpm test:examples:a11y

# Run performance examples
pnpm test:examples:performance

# Run lighthouse examples
pnpm test:examples:lighthouse

# Run visual regression examples
pnpm test:examples:visual
```

> **📊 Example Test Status**  
> Some examples depend on external demo sites which may be temporarily
> unavailable.  
> API examples typically have the highest success rate as JSONPlaceholder is
> very reliable.

```bash
# Run specific example module
npx playwright test src/tests/UI/__examples-orangehrm__/authentication
npx playwright test src/tests/API/__examples-jsonplaceholder__/users

# Run everything (including examples)
npx playwright test --grep-invert '^$'
```

### Benefits of This Approach

✅ **Comprehensive Reference** - All example scenarios preserved across all test
types ✅ **Consistent Structure** - Feature-based organization for UI, API,
accessibility, performance, visual ✅ **Auto-Excluded** - Won't pollute your
test results ✅ **Clear Separation** - `__examples-*__/` naming makes intent
obvious ✅ **Easy to Learn** - Run specific examples anytime ✅ **No Deletion**

- All code snippets remain available

### Documentation

- 📖 **[Setup Guide](docs/setup.md)** - Installation and configuration
- 💾 **[OrangeHRM Examples](src/tests/UI/__examples-orangehrm__/README.md)** -
  Example documentation
- 📚 **[Documentation Index](docs/README.md)** - Complete documentation
  navigation
- 🎯 **[SKILL.md](SKILL.md)** - Agent skills reference (agentskills.io format)

> **Note:** Examples are tagged with `@example` and have dedicated
> `test:*:examples` commands for isolated execution. Framework-only commands are
> also available (`test:*:framework`) for production suites.

---

## 📋 Prerequisites

Ensure you have the following installed:

```bash
Node.js     >= 18.0.0
npm         >= 9.0.0
Git         >= 2.30.0
```

**Supported Operating Systems:**

- macOS (Intel & Apple Silicon)
- Linux (Ubuntu 20.04+, Debian, Fedora)
- Windows 10/11 (WSL2 recommended)

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-org/playwright-enterprise-framework.git
cd playwright-enterprise-framework

# Install dependencies
pnpm install

# Install Playwright browsers
ppnpm install:browsers
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Essential Environment Variables:**

```env
# Application URLs
BASE_URL=https://opensource-demo.orangehrmlive.com
API_BASE_URL=https://jsonplaceholder.typicode.com

# Test Credentials
TEST_USER_ADMIN_EMAIL=Admin
TEST_USER_ADMIN_PASSWORD=admin123

# Feature Flags
ENABLE_VISUAL_TESTING=true
ENABLE_ACCESSIBILITY_TESTING=true
ENABLE_PERFORMANCE_TESTING=true

# Browser Settings
BROWSER_HEADLESS=true
PARALLEL_WORKERS=4
MAX_TEST_RETRIES=2
```

### 3. Run Your First Test

```bash
# Run smoke tests
pnpm test:smoke

# Run all tests
pnpm test

# Run in UI mode (interactive)
pnpm exec playwright test --ui
```

---

## 📁 Project Structure

```
playwright-enterprise-framework/
│
├── .auth/                      # Authentication state storage
├── .config/                    # Configuration files
│   ├── .eslintrc.cjs          # ESLint configuration
│   └── .prettierrc            # Prettier formatting
│
├── src/
│   ├── reporters/             # Custom reporters
│   │   └── audit.reporter.ts  # Compliance audit reporter
│   │
│   ├── resources/
│   │   ├── config/            # Environment & project configs
│   │   │   ├── base.config.ts
│   │   │   └── config.manager.ts
│   │   │
│   │   ├── fixtures/          # Playwright fixtures & setup
│   │   │   ├── test.fixtures.ts
│   │   │   ├── global-setup.ts
│   │   │   └── global-teardown.ts
│   │   │
│   │   ├── middleware/        # Request/Response interceptors
│   │   │
│   │   ├── test-data/         # Test data & factories
│   │   │   ├── factories/
│   │   │   └── fixtures/
│   │   │
│   │   └── utils/             # Utility helpers (103 files)
│   │       ├── auth/          # Authentication providers
│   │       ├── api/           # API clients & helpers
│   │       ├── database/      # DB connection utilities
│   │       ├── performance/   # Performance testing helpers
│   │       ├── ui/            # UI interaction helpers
│   │       └── core/          # Core utilities (logger, constants)
│   │
│   ├── services/              # Business logic services
│   │
│   ├── tests/
│   │   ├── auth.setup.ts      # Global authentication setup
│   │   ├── API/               # API & GraphQL tests
│   │   │   ├── features/      # BDD feature files
│   │   │   └── step_definitions/
│   │   │
│   │   ├── UI/                # UI tests organized by module
│   │   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── login/
│   │   │   ├── performance_module/
│   │   │   └── common/        # Shared UI components
│   │   │
│   │   ├── accessibility-technical/  # WCAG compliance tests
│   │   ├── performance/       # Core Web Vitals & Lighthouse
│   │   └── visual/            # Visual regression tests
│   │
│   └── types/                 # TypeScript type definitions
│
├── scripts/                   # Utility scripts
│   └── flaky-test-detector.ts
│
├── allure-results/            # Allure test results
├── lighthouse-results/        # Lighthouse audit reports
├── logs/                      # Application logs
├── screenshots/               # Test failure screenshots
├── videos/                    # Test execution videos
├── test-results/              # Playwright test results
│
├── .features-gen/             # Auto-generated BDD specs
├── .gitignore
├── package.json
├── playwright.config.ts       # Playwright configuration
├── playwright-bdd.config.ts   # BDD-specific config
├── tsconfig.json              # TypeScript configuration
└── README.md
```

---

## 🧪 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run all tests in headed mode
npx playwright test --headed

# Run all tests in debug mode
npx playwright test --debug

# Run tests in UI mode (interactive)
npx playwright test --ui
```

### Tag-Based Execution

The framework uses tags for organized test execution:

```bash
# Smoke tests (critical path)
pnpm test:smoke

# UI tests
pnpm test:ui

# API tests
pnpm test:api

# Accessibility tests (WCAG 2.1 AA)
pnpm test:accessibility

# Performance tests (Core Web Vitals)
pnpm test:performance

# Lighthouse audits (advanced)
pnpm test:lighthouse

# Visual regression tests
pnpm test:visual

# Full end-to-end suite
pnpm test:e2e
```

### Advanced Test Execution

```bash
# Run specific file
npx playwright test src/tests/UI/login/login.spec.ts

# Run specific test by name
npx playwright test -g "should login successfully"

# Run with specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run with specific number of workers
npx playwright test --workers=2

# Run failed tests only
npx playwright test --last-failed

# Run tests with trace
npx playwright test --trace on
```

---

## 🏷️ Test Tags

Organize and filter tests using these tags:

| Tag               | Description           | Example Usage             |
| ----------------- | --------------------- | ------------------------- |
| `@smoke`          | Critical path tests   | `pnpm test:smoke`         |
| `@ui`             | User interface tests  | `pnpm test:ui`            |
| `@api`            | API endpoint tests    | `pnpm test:api`           |
| `@a11y`           | Accessibility tests   | `pnpm test:accessibility` |
| `@performance`    | Performance tests     | `pnpm test:performance`   |
| `@lighthouse`     | Lighthouse audits     | `pnpm test:lighthouse`    |
| `@visual`         | Visual regression     | `pnpm test:visual`        |
| `@regression`     | Full regression suite | Custom grep               |
| `@authentication` | Auth module tests     | Custom grep               |
| `@admin`          | Admin features        | Custom grep               |
| `@dashboard`      | Dashboard tests       | Custom grep               |

**Combine multiple tags:**

```bash
# Run smoke UI tests only
npx playwright test --grep "@smoke.*@ui"

# Run all tests except performance
npx playwright test --grep-invert "@performance"
```

---

## ⚙️ Configuration

### Environment Configuration

The framework supports multiple environments via `.env` files:

```bash
.env                 # Default configuration
.env.development     # Development environment
.env.staging         # Staging environment
.env.production      # Production environment
```

**Load specific environment:**

```bash
NODE_ENV=staging npm test
```

### Key Configuration Options

Edit `playwright.config.ts` for framework-level settings:

```typescript
// Parallelization
workers: process.env.CI ? 4 : 4

// Timeouts
timeout: 30000              // Test timeout
expect.timeout: 10000       // Assertion timeout
navigationTimeout: 30000    // Page navigation timeout

// Retries
retries: process.env.CI ? 2 : 0

// Reporters
reporter: [
  ['html'],
  ['allure-playwright'],
  ['list'],
  ['json', { outputFile: 'test-results/results.json' }]
]

// Browser options
use: {
  headless: true,
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry'
}
```

### Performance Thresholds

Configure performance budgets in `src/resources/config/base.config.ts`:

```typescript
performance: {
  performanceBudget: 30,        // Lighthouse performance score (0-100)
  accessibilityBudget: 80,      // Lighthouse accessibility score
  bestPracticesBudget: 70,      // Lighthouse best practices score
  seoBudget: 70,                // Lighthouse SEO score
}
```

**Core Web Vitals thresholds** (in `src/tests/performance/performance.spec.ts`):

- LCP (Largest Contentful Paint): < 4s
- FID (First Input Delay): < 300ms
- CLS (Cumulative Layout Shift): < 0.25
- Page Load Time: < 5s

---

## 🔐 Authentication

### Auto-Authentication Setup

The framework includes automatic authentication state management:

1. **Global Setup** (`src/tests/auth.setup.ts`):

   ```typescript
   // Runs once before all tests
   // Saves authenticated state to .auth/user.json
   ```

2. **Usage in Tests**:

   ```typescript
   test.use({ storageState: '.auth/user.json' });

   test('authenticated test', async ({ page }) => {
     await page.goto('/dashboard');
     // User is already logged in
   });
   ```

### Supported Auth Providers

The framework supports multiple authentication strategies:

```typescript
import AuthFactory from '@utils/auth/auth-factory';

// Basic Authentication
const basicAuth = AuthFactory.createProvider('basic');
await basicAuth.authenticate({ username, password }, page);

// OAuth 2.0 - Okta
const oktaAuth = AuthFactory.createProvider('okta');
await oktaAuth.authenticate(credentials, page);

// OAuth 2.0 - Auth0
const auth0 = AuthFactory.createProvider('auth0');
await auth0.authenticate(credentials, page);

// Azure AD
const azureAuth = AuthFactory.createProvider('azure');
await azureAuth.authenticate(credentials, page);

// SAML
const samlAuth = AuthFactory.createProvider('saml');
await samlAuth.authenticate(credentials, page);
```

### Session Pooling

For parallel test execution with authentication:

```typescript
import { SessionPoolManager } from '@utils/auth/session-pool';

const sessionPool = new SessionPoolManager({
  maxSessions: 10,
  sessionTimeout: 3600000, // 1 hour
});

// Acquire session
const session = await sessionPool.acquireSession();

// Use session in test
test.use({ storageState: session.storageState });

// Release session
await sessionPool.releaseSession(session.id);
```

---

## 📊 Reporting

### Allure Reports

Generate rich, interactive HTML reports with test history and trends:

```bash
# Generate Allure report
pnpm report:allure:generate

# Open Allure report in browser
pnpm report:allure:open
```

**Features:**

- ✅ Test execution history & trends
- ✅ Flaky test detection
- ✅ Test duration analytics
- ✅ Attached screenshots, videos, traces
- ✅ Environment information
- ✅ Categorized failures

### Playwright HTML Reports

Built-in Playwright reports with trace viewer:

```bash
# Generate Playwright HTML report
pnpm report:playwright:generate

# Open report in browser
pnpm report:playwright:open
```

**Features:**

- ✅ Interactive trace viewer
- ✅ Network activity inspection
- ✅ Console logs
- ✅ Video recordings
- ✅ Screenshot comparisons

### CI/CD Reports

The framework automatically generates reports in CI/CD pipelines:

```bash
# In CI environment
playwright-report/      # HTML report (artifact)
allure-results/         # Allure results (artifact)
test-results/           # Test results JSON
```

---

## 💡 Best Practices

### 1. Page Object Model

```typescript
// src/tests/UI/login/pages/login.page.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async goto() {
    await this.page.goto('/auth/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

### 2. Test Data Factories

```typescript
// src/resources/test-data/factories/user.factory.ts
import { faker } from '@faker-js/faker';

export class UserFactory {
  static createAdmin() {
    return {
      username: 'Admin',
      password: 'admin123',
      role: 'admin',
    };
  }

  static createRandom() {
    return {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: 'user',
    };
  }
}
```

### 3. Custom Fixtures

```typescript
// src/resources/fixtures/test.fixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../tests/UI/login/pages/login.page';

type MyFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});

export { expect } from '@playwright/test';
```

### 4. API Testing

```typescript
test('API GET request', async ({ request }) => {
  const response = await request.get('/api/users');

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);

  const users = await response.json();
  expect(users).toHaveLength(10);
});
```

### 5. Visual Regression

```typescript
test('visual regression', async ({ page }) => {
  await page.goto('/dashboard');

  // Take screenshot and compare
  await expect(page).toHaveScreenshot('dashboard.png', {
    maxDiffPixels: 100,
    threshold: 0.2,
  });
});
```

### 6. Accessibility Testing

```typescript
import AxeBuilder from '@axe-core/playwright';

test('accessibility audit', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

---

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npm test

      - name: Upload Playwright Report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload Allure Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: allure-results
          path: allure-results/
          retention-days: 30
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Report') {
            steps {
                allure([
                    includeProperties: false,
                    jdk: '',
                    properties: [],
                    reportBuildPolicy: 'ALWAYS',
                    results: [[path: 'allure-results']]
                ])
            }
        }
    }

    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])
        }
    }
}
```

---

## 🛠️ Development

### Code Quality

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format

# Clean artifacts
npm run clean
```

### Git Hooks

Pre-configured with Husky and lint-staged:

```json
{
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml}": ["prettier --write"]
  }
}
```

### VS Code Integration

Install recommended extensions:

- Playwright Test for VSCode
- ESLint
- Prettier
- Code Spell Checker

**Debug Configuration** (`.vscode/launch.json`):

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Playwright Test",
  "program": "${workspaceFolder}/node_modules/.bin/playwright",
  "args": ["test", "--debug", "${file}"]
}
```

---

## ❓ Troubleshooting

### Common Issues

**1. Browser not found:**

```bash
pnpm install:browsers
```

**2. Authentication failures:**

- Check `.auth/user.json` exists
- Verify credentials in `.env`
- Run: `npx playwright test src/tests/auth.setup.ts`

**3. Port already in use:**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**4. Slow test execution:**

- Reduce `workers` in `playwright.config.ts`
- Disable video recording: `video: 'off'`
- Disable traces: `trace: 'off'`

**5. Flaky tests:**

```bash
# Run flaky test detector
npx ts-node scripts/flaky-test-detector.ts
```

### Debug Mode

```bash
# Run with Playwright Inspector
npx playwright test --debug

# Run with headed browser and slow motion
npx playwright test --headed --slow-mo=1000

# Generate trace for specific test
npx playwright test --trace on src/tests/UI/login/login.spec.ts
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Coding Standards

- Follow TypeScript best practices
- Write meaningful test descriptions
- Add JSDoc comments for public methods
- Ensure all tests pass before submitting PR
- Maintain test coverage above 80%

---

## 📚 Documentation

### 🚀 Getting Started

- **[Documentation Index](docs/README.md)** - Central hub for all documentation
  with navigation
- **[Quick Start Guide](#-quick-start)** - Get up and running in minutes
- **[Setup Guide](docs/setup.md)** - Installation and configuration guide

### 🤖 AI-Assisted Development

This framework is optimized for AI-assisted development. Whether you're using
GitHub Copilot, Cursor, Claude, or any other AI coding assistant:

- **[AGENTS.md](AGENTS.md)** - **START HERE** - Comprehensive AI coding
  guidelines and conventions ⭐
- **[SKILL.md](SKILL.md)** - Agent skills reference (agentskills.io format)

**Detailed Instructions** (`.ai/instructions/` directory):

- **[TypeScript Conventions](.ai/instructions/typescript.md)** - Naming,
  imports, types, documentation
- **[Test Patterns](.ai/instructions/testing.md)** - Fixtures, structure,
  authentication
- **[Page Object Model](.ai/instructions/page-objects.md)** - POM best practices
- **[BDD Patterns](.ai/instructions/bdd.md)** - Feature files, step definitions
- **[Service Layer](.ai/instructions/services.md)** - API services, CRUD
  patterns
- **[Utility Patterns](.ai/instructions/utilities.md)** - Logger, validation,
  helpers
- **[Import Reference](.ai/instructions/imports-reference.md)** - Path aliases
  and imports

**Code Templates** (`.ai/templates/` directory):

- [Page Object Template](.ai/templates/page-object.template.ts)
- [Service Layer Template](.ai/templates/service.template.ts)
- [Test Spec Template](.ai/templates/test-spec.template.ts)
- [BDD Step Definitions Template](.ai/templates/bdd-step-definitions.template.ts)
- [Utility Function Template](.ai/templates/utility.template.ts)

### 📖 Core Framework Documentation

**Configuration & Setup:**

- **[Setup & Configuration](docs/setup.md)** - Installation, config, environment
  setup
- **[Advanced Features](docs/advanced.md)** - Advanced framework capabilities

**Testing Guides:**

- **[Testing Guide](docs/testing.md)** - Test data, examples, organization
- **[Quality Assurance](docs/quality.md)** - Visual regression, performance,
  accessibility

**Operations & Monitoring:**

- **[Observability](docs/observability.md)** - Reports, logging, monitoring
- **[Troubleshooting Guide](docs/troubleshooting.md)** - Common issues and
  solutions

**Security & Enterprise:**

- **[Security Practices](docs/security.md)** - Security best practices and
  secrets management
- **[Advanced Features](docs/advanced.md)** - Enterprise features and patterns

### 🏗️ Architecture Documentation

- **[Source Architecture](src/README.md)** - Overview of src/ directory
  structure
- **[Test Organization](src/tests/README.md)** - Test suite organization and
  patterns
- **[Service Layer](src/services/README.md)** - API services documentation
- **[Utilities](src/resources/utils/README.md)** - Framework utilities and
  helpers
- **[Test Data](src/resources/test-data/README.md)** - Test data organization
- **[Scripts](scripts/README.md)** - Utility scripts and tools

### 🤝 Collaboration

- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute to this
  framework
- **[Security Policy](SECURITY.md)** - Security practices and reporting
  vulnerabilities
- **[Changelog](CHANGELOG.md)** - Version history and release notes
- **[Commands Reference](COMMANDS.md)** - Available npm/pnpm scripts

### 🎭 GitHub Copilot Agents

Specialized GitHub Copilot agents for test automation workflows:

- **[Test Planner](.github/agents/playwright-test-planner.agent.md)** - Analyzes
  web applications and creates comprehensive test plans by exploring the UI
  (`@playwright-test-planner`)
- **[Test Generator](.github/agents/playwright-test-generator.agent.md)** -
  Converts test plans into automated Playwright tests following framework
  conventions (`@playwright-test-generator`)
- **[Test Healer](.github/agents/playwright-test-healer.agent.md)** - Debugs
  failing tests and automatically fixes selector and timing issues
  (`@playwright-test-healer`)

**Workflow**: Plan → Generate → Heal - Use these agents in sequence for complete
test coverage lifecycle.

---

## �📖 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Cucumber BDD](https://cucumber.io/docs/guides/)
- [Allure Framework](https://docs.qameta.io/allure/)
- [Web.dev Performance](https://web.dev/metrics/)
- [W3C Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

---

## 👥 Support & Contact

**Issues:**
[GitHub Issues](https://github.com/your-org/playwright-enterprise-framework/issues)
**Discussions:**
[GitHub Discussions](https://github.com/your-org/playwright-enterprise-framework/discussions)
**Email:** your-team@company.com

---

## 🙏 Acknowledgments

Built with these amazing open-source projects:

- [Playwright](https://playwright.dev/) - Microsoft
- [TypeScript](https://www.typescriptlang.org/) - Microsoft
- [Allure Framework](https://allurereport.org/) - Qameta Software
- [Faker.js](https://fakerjs.dev/) - Community
- [Axe-core](https://github.com/dequelabs/axe-core) - Deque Systems
- [Lighthouse](https://github.com/GoogleChrome/lighthouse) - Google Chrome

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by Your Team

</div>
