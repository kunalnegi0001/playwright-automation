# Playwright Enterprise Framework Skill

**Skill Type**: Testing Framework  
**Category**: E2E Test Automation  
**Difficulty**: Intermediate  
**Version**: 1.1.0

---

## Overview

Enterprise-grade test automation framework built on Playwright with TypeScript,
providing comprehensive testing capabilities including UI, API, visual
regression, accessibility, and performance testing with enterprise features.

## What This Skill Enables

- ✅ Multi-browser E2E testing (Chromium, Firefox, WebKit)
- ✅ BDD/Gherkin test development with playwright-bdd
- ✅ Page Object Model architecture
- ✅ API testing with validation and schema checking
- ✅ Visual regression testing
- ✅ Accessibility testing (WCAG 2.1 AA/AAA)
- ✅ Performance budgeting and Lighthouse integration
- ✅ Enterprise security (secrets management, encryption, input sanitization)
- ✅ Advanced reporting (Allure, HTML, JUnit)
- ✅ CI/CD integration (GitHub Actions)

## Prerequisites

```json
{
  "node": ">=20.18.0",
  "packageManager": "pnpm@9.x",
  "browsers": ["chromium", "firefox", "webkit"],
  "knowledge": {
    "typescript": "intermediate",
    "playwright": "basic",
    "testing": "intermediate"
  }
}
```

## Installation

```bash
# Clone repository
git clone https://github.com/successivedigitalorg/playwright-enterprise-framework.git
cd playwright-enterprise-framework

# Install dependencies
pnpm install

# Install browsers
pnpm exec playwright install

# Setup environment
cp .env.example .env

# Validate installation
pnpm health:check
pnpm enterprise:validate
```

## Core Patterns

### 1. Page Object Model

```typescript
// Base page with common functionality
import { BasePage } from '@/tests/UI/pages/base.page';

export class LoginPage extends BasePage {
  // Readonly locators
  readonly usernameInput = this.page.getByRole('textbox', { name: 'Username' });
  readonly passwordInput = this.page.getByRole('textbox', { name: 'Password' });
  readonly loginButton = this.page.getByRole('button', { name: 'Login' });

  // Page actions
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForURL(/dashboard/);
  }
}
```

### 2. Service Layer Pattern

```typescript
// API service with type safety
import { APIClient } from '@utils/api/rest';

export class UserService {
  constructor(private readonly client: APIClient) {}

  async getById(id: string): Promise<User> {
    const response = await this.client.get<User>(`/users/${id}`);
    return response.data;
  }

  async create(data: CreateUserDto): Promise<User> {
    const response = await this.client.post<User>('/users', data);
    return response.data;
  }
}
```

### 3. BDD Implementation

```gherkin
# Feature file
Feature: User Authentication

  Background:
    Given I am on the home page

  @smoke @auth
  Scenario: Successful login with valid credentials
    When I navigate to login page
    And I enter username "Admin"
    And I enter password "admin123"
    And I click login button
    Then I should be redirected to dashboard
    And I should see welcome message
```

```typescript
// Step definitions
import { createBdd } from 'playwright-bdd';
import { test } from '@fixtures/test.fixtures';

const { Given, When, Then } = createBdd(test);

Given('I am on the home page', async ({ page }) => {
  await page.goto('/');
});

When('I navigate to login page', async ({ page }) => {
  await page.click('text=Login');
});

Then('I should be redirected to dashboard', async ({ page }) => {
  await expect(page).toHaveURL(/dashboard/);
});
```

### 4. Test Fixtures

```typescript
// Custom fixtures with auto-setup
import { test as base } from '@playwright/test';

type Fixtures = {
  authenticatedPage: Page;
  apiClient: APIClient;
  testUser: User;
};

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="password"]', 'password');
    await page.click('button:has-text("Login")');
    await use(page);
  },

  apiClient: async ({}, use) => {
    const client = new APIClient({ baseURL: process.env.API_URL });
    await use(client);
    await client.close();
  },
});
```

## Key Commands

```bash
# Testing
pnpm test                    # Run all tests
pnpm test:ui                 # UI tests
pnpm test:api                # API tests
pnpm test:visual             # Visual regression
pnpm test:a11y               # Accessibility
pnpm test:performance        # Performance tests
pnpm test -- --grep @smoke   # Tagged tests

# Development
pnpm test:debug              # Debug mode
pnpm test:ui-mode            # Playwright UI mode
pnpm test:trace              # Generate traces

# Quality
pnpm lint                    # Lint code
pnpm format                  # Format code
pnpm typecheck               # Type checking
pnpm coverage                # Generate coverage

# Enterprise
pnpm health:check            # System validation
pnpm security:check          # Secrets scanning
pnpm enterprise:validate     # Full validation

# Reporting
pnpm allure:generate         # Generate Allure report
pnpm allure:open             # Open report
```

## Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  workers: process.env.CI ? 4 : 2,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html'], ['allure-playwright'], ['list']],
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
  ],
});
```

## Architecture

```
playwright-enterprise-framework/
├── .ai/                      # AI agent instructions
│   ├── instructions/         # Detailed coding guidelines
│   └── templates/            # Code templates
├── .github/
│   ├── agents/               # Copilot agents
│   ├── skills/               # Skill definitions
│   └── workflows/            # CI/CD pipelines
├── src/
│   ├── resources/
│   │   ├── config/           # Configuration management
│   │   ├── fixtures/         # Custom Playwright fixtures
│   │   ├── test-data/        # Test data files
│   │   └── utils/            # Utility functions
│   │       ├── core/         # Core utilities
│   │       ├── api/          # API testing utilities
│   │       ├── sanitization/ # Input sanitization
│   │       ├── encryption/   # Data encryption
│   │       └── secrets/      # Secrets management
│   ├── services/             # API service layer
│   └── tests/
│       ├── UI/               # UI tests
│       ├── API/              # API tests
│       ├── visual/           # Visual regression
│       ├── accessibility/    # A11y tests
│       └── performance/      # Performance tests
├── docs/                     # Documentation
├── AGENTS.md                 # AI coding guidelines
└── SKILL.md                  # This file
```

## Security Features

```typescript
// Secrets Management
import { secretsManager } from '@utils/secrets';
const apiKey = await secretsManager.get('API_KEY');

// Input Sanitization
import { sanitizeHTML, sanitizeSQL, sanitizeURL } from '@utils/sanitization';
const safe = sanitizeHTML(userInput);

// Data Encryption
import { encrypt, decrypt } from '@utils/encryption';
const encrypted = encrypt(sensitiveData, key);
```

## Best Practices

### Naming Conventions

- ✅ Files: `kebab-case.ts`
- ✅ Classes/Types: `PascalCase`
- ✅ Functions/Variables: `camelCase`
- ✅ Constants: `UPPER_SNAKE_CASE`

### Imports

```typescript
// ✅ Use path aliases
import { logger } from '@utils/core';
import { APIClient } from '@utils/api/rest';

// ❌ No relative imports
import { logger } from '../../../utils/core/logger';
```

### Type Safety

```typescript
// ✅ Explicit types
export const getUser = async (id: string): Promise<User> => {
  return await userService.getById(id);
};

// ❌ Implicit any
export const getUser = async id => {
  return await userService.getById(id);
};
```

### Documentation

```typescript
/**
 * Authenticates user and returns session token
 * @param username - User's login username
 * @param password - User's password
 * @returns Promise resolving to auth token
 * @throws {AuthenticationError} When credentials are invalid
 * @example
 * const token = await authenticateUser('admin', 'pass123');
 */
export const authenticateUser = async (
  username: string,
  password: string
): Promise<string> => {
  // Implementation
};
```

## Learning Resources

- **Documentation**: [docs/README.md](./docs/README.md)
- **AI Guidelines**: [AGENTS.md](./AGENTS.md)
- **Setup**: [docs/setup.md](./docs/setup.md)
- **Advanced**: [docs/advanced.md](./docs/advanced.md)
- **Troubleshooting**: [docs/troubleshooting.md](./docs/troubleshooting.md)

## Support

- **Issues**:
  [GitHub Issues](https://github.com/successivedigitalorg/playwright-enterprise-framework/issues)
- **Discussions**:
  [GitHub Discussions](https://github.com/successivedigitalorg/playwright-enterprise-framework/discussions)
- **Documentation**: [Full Docs](./docs/)

## License

MIT License - See [LICENSE](./LICENSE)
