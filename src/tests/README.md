# Test Organization Guide

This document explains the test organization structure and conventions for the
Playwright Enterprise Framework.

---

## 📁 Test Directory Structure

```
src/tests/
├── API/                          # API & BDD tests
│   ├── features/                # Gherkin feature files
│   │   ├── users-api.feature
│   │   └── products-api.feature
│   ├── hooks/                   # BDD hooks
│   │   └── api.hooks.ts
│   └── step_definitions/        # Step implementations
│       ├── common-api.steps.ts
│       ├── enhanced-api.steps.ts
│       └── data-setup.steps.ts
│
├── UI/                          # UI & BDD tests
│   ├── admin/                   # Admin module
│   │   ├── pages/
│   │   │   └── admin.page.ts
│   │   ├── features/
│   │   │   └── admin.feature
│   │   └── step_definitions/
│   │       └── admin.steps.ts
│   │
│   ├── authentication/          # Login/logout
│   │   ├── pages/
│   │   │   └── login.page.ts
│   │   ├── features/
│   │   └── step_definitions/
│   │
│   ├── common/                  # Shared components
│   │   ├── pages/
│   │   │   └── orangehrm-base.page.ts
│   │   └── fixtures/
│   │       └── orangehrm.fixtures.ts
│   │
│   ├── dashboard/
│   ├── directory/
│   ├── leave/
│   ├── maintenance/
│   ├── myinfo/
│   ├── performance_module/
│   ├── pim/
│   └── recruitment/
│
├── accessibility-technical/      # A11y tests
│   └── accessibility.spec.ts
│
├── performance/                  # Performance tests
│   ├── performance.spec.ts
│   └── lighthouse-ui-comprehensive.spec.ts
│
└── visual/                       # Visual regression
    └── *-visual.spec.ts
```

---

## 🎯 Test Organization Principles

### 1. **Module-Based Organization**

Tests are organized by **application module** (not by test type):

```
UI/
├── admin/           # Admin module tests
├── dashboard/       # Dashboard module tests
└── pim/            # PIM module tests
```

### 2. **BDD Structure**

Each module follows BDD pattern:

- **features/** - Gherkin scenarios (`.feature` files)
- **step_definitions/** - Step implementations (`.steps.ts`)
- **pages/** - Page objects (`.page.ts`)

### 3. **Shared Components**

Common elements in `tests/UI/common/`:

- **orangehrm-base.page.ts** - Base page class
- **orangehrm.fixtures.ts** - Shared fixtures

---

## 📐 File Naming Conventions

| Type                 | Pattern                | Example                 |
| -------------------- | ---------------------- | ----------------------- |
| **Feature File**     | `{module}.feature`     | `admin.feature`         |
| **Step Definitions** | `{module}.steps.ts`    | `admin.steps.ts`        |
| **Page Object**      | `{page-name}.page.ts`  | `login.page.ts`         |
| **Spec File**        | `{module}.spec.ts`     | `accessibility.spec.ts` |
| **Fixtures**         | `{module}.fixtures.ts` | `orangehrm.fixtures.ts` |

---

## 🧪 Test Types

### 1. **BDD UI Tests** (`tests/UI/`)

**Purpose**: End-to-end user workflows in Gherkin syntax

**Structure**:

```
UI/admin/
├── features/admin.feature
├── pages/admin.page.ts
└── step_definitions/admin.steps.ts
```

**Example Feature**:

```gherkin
Feature: Admin User Management
  @smoke @ui @admin
  Scenario: Search for a user
    Given I am logged in as admin
    When I navigate to Admin module
    And I search for user "John Doe"
    Then I should see user "John Doe" in results
```

**Example Step**:

```typescript
import { createBdd } from 'playwright-bdd';
import { test } from '../../common/fixtures/orangehrm.fixtures';

const { Given, When, Then } = createBdd(test);

When('I search for user {string}', async ({ adminPage }, username: string) => {
  await adminPage.searchUser(username);
});
```

### 2. **BDD API Tests** (`tests/API/`)

**Purpose**: API testing with Gherkin scenarios

**Structure**:

```
API/
├── features/users-api.feature
├── hooks/api.hooks.ts
└── step_definitions/common-api.steps.ts
```

**Example Feature**:

```gherkin
Feature: User API
  @api @smoke
  Scenario: Create a new user
    When I send a POST request to "/users" with:
      | email      | test@example.com |
      | firstName  | John             |
    Then the response status should be 201
```

### 3. **Accessibility Tests** (`tests/accessibility-technical/`)

**Purpose**: Automated accessibility testing with axe-core

```typescript
test('Login page should be accessible', async ({ page }) => {
  await page.goto('/login');
  const results = await runAccessibilityScan(page);
  expect(results.violations).toHaveLength(0);
});
```

### 4. **Performance Tests** (`tests/performance/`)

**Purpose**: Performance metrics and Lighthouse audits

```typescript
test('Dashboard performance @performance', async ({ page }) => {
  await page.goto('/dashboard');
  const metrics = await getWebVitals(page);
  expect(metrics.LCP).toBeLessThan(2500);
});
```

### 5. **Visual Regression** (`tests/visual/`)

**Purpose**: Screenshot comparison testing

```typescript
test('Dashboard visual comparison @visual', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png');
});
```

---

## 🏗️ Creating a New Test Module

### 1. Create Module Structure

```bash
mkdir -p src/tests/UI/my-module/{pages,features,step_definitions}
```

### 2. Create Page Object

**File**: `src/tests/UI/my-module/pages/my-module.page.ts`

```typescript
import { Page, Locator } from '@playwright/test';
import { OrangeHRMBasePage } from '../../common/pages/orangehrm-base.page';

export class MyModulePage extends OrangeHRMBasePage {
  readonly myElement: Locator;

  constructor(page: Page) {
    super(page);
    this.myElement = page.getByRole('button', { name: 'Submit' });
  }

  async performAction(): Promise<void> {
    await this.myElement.click();
  }
}
```

### 3. Create Feature File

**File**: `src/tests/UI/my-module/features/my-module.feature`

```gherkin
Feature: My Module

  @smoke @ui @my-module
  Scenario: Perform basic action
    Given I am on my module page
    When I perform an action
    Then I should see success message
```

### 4. Create Step Definitions

**File**: `src/tests/UI/my-module/step_definitions/my-module.steps.ts`

```typescript
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { test } from '../../common/fixtures/orangehrm.fixtures';

const { Given, When, Then } = createBdd(test);

Given('I am on my module page', async ({ page }) => {
  await page.goto('/my-module');
});

When('I perform an action', async ({ myModulePage }) => {
  await myModulePage.performAction();
});

Then('I should see success message', async ({ page }) => {
  await expect(page.getByText('Success')).toBeVisible();
});
```

### 5. Add to Fixtures

Update `src/tests/UI/common/fixtures/orangehrm.fixtures.ts`:

```typescript
import { MyModulePage } from '../../my-module/pages/my-module.page';

type OrangeHRMFixtures = {
  // ... existing fixtures
  myModulePage: MyModulePage;
};

export const test = base.extend<OrangeHRMFixtures>({
  // ... existing fixtures
  myModulePage: async ({ page }, use) => {
    await use(new MyModulePage(page));
  },
});
```

---

## 🏷️ Test Tags

Use tags for selective test execution:

| Tag            | Purpose             | Example                   |
| -------------- | ------------------- | ------------------------- |
| `@smoke`       | Critical path tests | `pnpm test:smoke`         |
| `@ui`          | UI tests            | `pnpm test:ui`            |
| `@api`         | API tests           | `pnpm test:api`           |
| `@a11y`        | Accessibility tests | `pnpm test:accessibility` |
| `@visual`      | Visual regression   | `pnpm test:visual`        |
| `@performance` | Performance tests   | `pnpm test:performance`   |
| `@{module}`    | Module-specific     | `@admin`, `@pim`          |

**Example**:

```gherkin
@smoke @ui @admin
Scenario: Admin can search users
```

**Run**:

```bash
# Run smoke tests only
pnpm test:smoke

# Run admin module tests
playwright test --grep @admin

# Run UI tests excluding visual
playwright test --grep @ui --grep-invert @visual
```

---

## 📊 Test Execution

### Run All Tests

```bash
pnpm test:e2e
```

### Run by Type

```bash
pnpm test:smoke        # Smoke tests
pnpm test:ui          # UI tests
pnpm test:api         # API tests
pnpm test:accessibility # A11y tests
pnpm test:performance  # Performance tests
pnpm test:visual      # Visual regression
```

### Run by Module

```bash
playwright test tests/UI/admin
playwright test tests/UI/dashboard
```

### Debug Mode

```bash
pnpm test:debug
pnpm test:ui-mode
pnpm test:headed
```

---

## 📝 Test Writing Guidelines

### 1. **Test Isolation**

✅ **DO**: Each test should be independent

```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/dashboard');
});

test('Test 1', async ({ page }) => {
  // Independent state
});

test('Test 2', async ({ page }) => {
  // Independent state
});
```

❌ **DON'T**: Share state between tests

```typescript
let sharedUser; // BAD - global state

test('Test 1', async () => {
  sharedUser = await createUser();
});

test('Test 2', async () => {
  await login(sharedUser); // Breaks if Test 1 fails
});
```

### 2. **Use Fixtures**

✅ **DO**: Use fixtures for setup

```typescript
test('Admin can view users', async ({ adminPage, authenticatedPage }) => {
  await adminPage.navigate();
  await adminPage.searchUser('John');
});
```

### 3. **Descriptive Scenarios**

✅ **DO**: Use clear, business-focused scenario names

```gherkin
Scenario: Admin can search for active users by username
```

❌ **DON'T**: Use technical or vague names

```gherkin
Scenario: Test 1
Scenario: Search works
```

### 4. **Wait for Elements**

✅ **DO**: Use auto-waiting locators

```typescript
await page.getByRole('button', { name: 'Submit' }).click();
```

❌ **DON'T**: Use arbitrary waits

```typescript
await page.waitForTimeout(5000); // BAD
```

---

## 📚 Related Documentation

- **[Page Object Model Guide](../.ai/instructions/page-objects.md)**
- **[BDD Patterns](../.ai/instructions/bdd.md)**
- **[Test Patterns](../.ai/instructions/testing.md)**

---

**Questions?** Check [AGENTS.md](../AGENTS.md) or consult the QA Engineering
team.
