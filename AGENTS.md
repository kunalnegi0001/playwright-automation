# AI Code Generation Guidelines for Playwright Enterprise Framework

> **Framework:** Playwright + TypeScript + BDD (playwright-bdd)

## 🚨 CRITICAL LLM INSTRUCTIONS

**READ THIS FIRST - MANDATORY FOR ALL AI AGENTS:**

### DO NOT Create Summary Documents

- ❌ NEVER create comprehensive summary markdown files after completing work
- ❌ NEVER generate "SUMMARY.md", "CHANGES.md", "IMPLEMENTATION-REPORT.md" or
  similar
- ❌ NEVER create documentation describing what you just did
- ✅ ONLY modify code and existing documentation as requested
- ✅ Provide brief verbal confirmation when task is complete

### Keep Responses Concise

- ❌ NEVER generate verbose explanations unless explicitly asked
- ❌ NEVER add unnecessary context or background information
- ✅ Answer directly and briefly
- ✅ Focus on actionable information only

### Code Generation Rules

- ✅ Generate code that follows patterns in this file
- ✅ Use templates from `ai/templates/` as starting points
- ✅ Read `ai/instructions/` files for specific guidance
- ✅ Apply critical rules consistently
- ❌ NEVER deviate from established conventions without explicit permission

---

## ⭐ Core Principles

- **Export Everything**: Named exports only (`export const`), no default exports
- **Document Everything**: JSDoc on all functions and types
- **Use Types, Not Interfaces**: Consistency with `type` keyword
- **Arrow Functions Only**: `export const myFunc = () => {}`
- **Path Aliases**: Always use `@utils/`, `@config/`, `@fixtures/`, never
  relative imports

---

## 🚨 Critical Rules (MUST Follow)

### 1. File Naming & Imports

- **Files**: `kebab-case.ts`
- **Imports**: Path aliases only

  ```typescript
  // ✅ DO
  import { logger } from '@utils/core';
  import { APIClient } from '@utils/api/rest';

  // ❌ DON'T
  import { logger } from '../../../utils/core/logger';
  ```

### 2. TypeScript

- `PascalCase`: Classes, Types, Enums
- `camelCase`: Functions, variables, properties
- `UPPER_SNAKE_CASE`: Constants
- Explicit types on all parameters and returns
- Arrow functions with named exports

### 3. Test Structure

- Extend fixtures from `@fixtures/test.fixtures`
- Use `test.describe('Group @tag', () => {})`
- Test isolation: No shared state
- Setup: `test.beforeEach()`, Cleanup: `test.afterEach()`

### 4. Page Object Model

- Extend `OrangeHRMBasePage` or appropriate base
- `readonly` locators as class properties
- Semantic selectors over CSS: `getByRole()`, `getByText()`
- All methods `async` with JSDoc

### 5. Service Layer

- Inject `APIClient` via constructor
- Log all operations with `logger`
- CRUD naming: `getById`, `getAll`, `create`, `update`, `delete`
- Propagate errors, never swallow

### 6. BDD

- Use `createBdd(test)` for step definitions
- Gherkin: Given/When/Then
- Tags: @smoke, @regression, @api, @ui

### 7. Logging & Errors

```typescript
import { logger } from '@utils/core';

try {
  await operation();
  logger.info('Operation completed', { data });
} catch (error) {
  logger.error('Operation failed', error);
  throw error; // Always propagate
}
```

### 8. Configuration

```typescript
import { configManager } from '@config/config.manager';
const baseURL = configManager.get('baseURL');
```

### 9. Async/Await

- Always `await` async operations
- Never use callbacks or raw promises
- Handle rejections explicitly

---

## 🏗️ Project Structure

```
playwright-enterprise-framework/
├── ai/
│   ├── instructions/          # Detailed guides
│   └── templates/             # Code templates
├── src/
│   ├── resources/
│   │   ├── config/           # Configuration
│   │   ├── fixtures/         # Playwright fixtures
│   │   ├── test-data/        # Test data
│   │   └── utils/            # Utilities (core, api, ui, etc.)
│   ├── services/             # API services
│   ├── tests/                # All tests (API, UI, performance, visual, a11y)
│   └── types/                # TypeScript types
└── playwright.config.ts
```

**Technology Stack:** Playwright v1.40+ | TypeScript 5.x | playwright-bdd |
Axios | Winston | AJV/Joi | pnpm

---

## 📚 Detailed Instructions

**Read these files based on your task:**

- **TypeScript**: `ai/instructions/typescript.md`
- **Imports & Paths**: `ai/instructions/imports-reference.md`
- **Testing**: `ai/instructions/testing.md`
- **Page Objects**: `ai/instructions/page-objects.md`
- **BDD**: `ai/instructions/bdd.md`
- **Services**: `ai/instructions/services.md`
- **Utilities**: `ai/instructions/utilities.md`

**Templates**: `ai/templates/*.template.ts`

---

## ⚠️ Common Pitfalls

### Imports

```typescript
// ❌ DON'T
import { logger } from '../../../utils/core/logger';

// ✅ DO
import { logger } from '@utils/core';
```

### Locators

```typescript
// ❌ DON'T
usernameInput = this.page.locator('#app > div > div.orangehrm-login-slot');

// ✅ DO
readonly usernameInput = this.page.getByRole('textbox', { name: 'Username' });
```

### Error Handling

```typescript
// ❌ DON'T
try {
  await op();
} catch (error) {
  /* silent */
}

// ✅ DO
try {
  await op();
} catch (error) {
  logger.error('Operation failed', error);
  throw error;
}
```

### Exports

```typescript
// ❌ DON'T
export default myFunction;

// ✅ DO
export const myFunction = () => {};
```

### Types vs Interfaces

```typescript
// ❌ DON'T
interface UserData {
  id: string;
}

// ✅ DO
type UserData = {
  /** User ID */
  id: string;
};
```

### JSDoc

```typescript
// ✅ Functions
/**
 * Processes user by ID
 * @param id - User identifier
 * @returns Processed user
 */
export const processUser = async (id: string): Promise<User> => {};

// ✅ Types
/**
 * User configuration
 */
type UserConfig = {
  /** Include profile */
  includeProfile?: boolean;
};
```

---

## 🔐 Security

- **NO** credentials in code
- **YES** environment variables
- **YES** input validation
- **YES** HTTPS for external calls

---

## 🤖 Specialized GitHub Copilot Agents

The framework includes three specialized GitHub Copilot agents for specific
workflows:

### 1. Playwright Test Planner (`playwright-test-planner`)

**Purpose:** Creates comprehensive test plans for web applications

**Use When:** You need to analyze a web application and generate detailed test
scenarios

**Capabilities:**

- Navigates and explores web applications in browser
- Identifies functional areas requiring test coverage
- Generates structured test plans with edge cases
- Documents user flows and critical paths
- Creates test case specifications

**Location:**
[`.github/agents/playwright-test-planner.agent.md`](.github/agents/playwright-test-planner.agent.md)

### 2. Playwright Test Generator (`playwright-test-generator`)

**Purpose:** Generates automated Playwright tests from test plans

**Use When:** You have a test plan and need to create executable test code

**Capabilities:**

- Converts test plans into Playwright test code
- Follows framework conventions (path aliases, fixtures, logging)
- Generates semantic locators (getByRole, getByText)
- Creates page objects when needed
- Implements proper async/await patterns
- Includes JSDoc documentation

**Location:**
[`.github/agents/playwright-test-generator.agent.md`](.github/agents/playwright-test-generator.agent.md)

### 3. Playwright Test Healer (`playwright-test-healer`)

**Purpose:** Debugs and fixes failing Playwright tests

**Use When:** Tests are failing and need systematic debugging

**Capabilities:**

- Identifies failing tests in the suite
- Analyzes error messages and stack traces
- Examines page snapshots at failure points
- Diagnoses root causes (selectors, timing, data issues)
- Fixes broken tests automatically
- Improves test reliability and resilience

**Location:**
[`.github/agents/playwright-test-healer.agent.md`](.github/agents/playwright-test-healer.agent.md)

### Using These Agents

These agents are GitHub Copilot Chat agents that can be invoked using the `@`
mention syntax:

```
@playwright-test-planner Create a test plan for the login workflow
@playwright-test-generator Generate tests from the test plan
@playwright-test-healer Fix failing authentication tests
```

**Workflow Integration:**

1. **Plan** → Use `@playwright-test-planner` to analyze app and create test
   scenarios
2. **Generate** → Use `@playwright-test-generator` to convert plans into
   executable tests
3. **Heal** → Use `@playwright-test-healer` when tests break due to app changes

---

## 📖 Usage Guide

**For Development:**

1. Read Critical Rules
2. Check `ai/instructions/` for your task
3. Use `ai/templates/` as base
4. Validate against pitfalls

**For Code Review:**

1. Verify MUST rules
2. Check path aliases
3. Confirm error handling
4. Validate test isolation

**For LLM:**

1. Load `AGENTS.md` first
2. Load specific instruction files
3. Use templates
4. Apply patterns consistently
5. **DO NOT create summary docs**

---

**Remember:** Consistency is key. Follow these guidelines for maintainable,
scalable test automation.
