# Imports & Path Aliases Reference

**Path Aliases:**

- `@utils/*` → `src/resources/utils/*`
- `@config/*` → `src/resources/config/*`
- `@fixtures/*` → `src/resources/fixtures/*`
- `@services/*` → `src/services/*`

## Core Imports

```typescript
// Logger & Retry
import { logger, RetryUtil } from '@utils/core';

// API Client
import { APIClient } from '@utils/api/rest';

// Configuration
import { configManager } from '@config/config.manager';

// Validation
import {
  validateEmail,
  validatePassword,
  sanitizeInput,
} from '@utils/validation-transform';

// Performance & A11y
import { LighthouseRunner, getPerformanceMetrics } from '@utils/performance';
import { auditAccessibility } from '@utils/accessibility';

// Network
import { WebSocketHelper, SSEHelper } from '@utils/network';

// UI Utilities
import { downloadFile, uploadFile } from '@utils/ui';
```

## Test Imports

```typescript
// Test fixtures
import { test, expect } from '@fixtures/test.fixtures';
import type { Page, Locator } from '@playwright/test';

// BDD
import { createBdd } from 'playwright-bdd';
const { Given, When, Then } = createBdd(test);
```

## Quick Snippets

### Page Object

```typescript
import type { Page } from '@playwright/test';
import { logger } from '@utils/core';

export class LoginPage {
  readonly usernameInput = this.page.getByRole('textbox', { name: 'Username' });
  readonly submitButton = this.page.getByRole('button', { name: 'Login' });

  constructor(private readonly page: Page) {}

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.submitButton.click();
    logger.info('Login attempted', { username });
  }
}
```

### Service Layer

```typescript
import { APIClient } from '@utils/api/rest';
import { logger } from '@utils/core';

export class UserService {
  constructor(private apiClient: APIClient = new APIClient()) {}

  async getById(id: string): Promise<User> {
    logger.info('Fetching user', { id });
    const response = await this.apiClient.get<User>(`/users/${id}`);
    return response.data;
  }
}
```

### Test with Fixtures

```typescript
import { test, expect } from '@fixtures/test.fixtures';

test.describe('User Management @smoke', () => {
  test('should create user', async ({ authenticatedPage }) => {
    // Test logic
  });
});
```

### BDD Steps

```typescript
import { createBdd } from 'playwright-bdd';
import { test } from '@fixtures/test.fixtures';

const { Given, When, Then } = createBdd(test);

Given('I am on the login page', async ({ page }) => {
  await page.goto('/login');
});

When('I login with {string} and {string}', async ({ page }, user, pass) => {
  await page.fill('[name="username"]', user);
  await page.fill('[name="password"]', pass);
  await page.click('button[type="submit"]');
});
```

## Common Patterns

### Retry with Logging

```typescript
import { RetryUtil, logger } from '@utils/core';

const result = await RetryUtil.withRetry(async () => await apiCall(), {
  maxAttempts: 3,
  delayMs: 1000,
});
```

### Config Access

```typescript
import { configManager } from '@config/config.manager';

const baseURL = configManager.get('baseURL');
const timeout = configManager.get('timeout', 30000); // with default
```

### Error Handling

```typescript
import { logger } from '@utils/core';

try {
  await riskyOperation();
  logger.info('Operation succeeded');
} catch (error) {
  logger.error('Operation failed', error);
  throw error; // Always propagate
}
```
