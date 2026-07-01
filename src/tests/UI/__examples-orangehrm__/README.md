# OrangeHRM BDD Examples

This directory contains **complete working examples** of BDD (Behavior-Driven
Development) tests using the Playwright Enterprise Framework with
[OrangeHRM](https://opensource-demo.orangehrmlive.com) as the test application.

> **⚠️ External Dependency Notice**  
> These examples depend on the OrangeHRM demo site
> (https://opensource-demo.orangehrmlive.com).  
> If tests fail with timeout errors, the demo site may be temporarily
> unavailable.  
> See [TEST_STATUS.md](../../../../TEST_STATUS.md) for current status and
> alternative solutions.

## 🎯 Purpose

These examples are **isolated from the main framework** and serve as a reference
implementation to help you:

- Understand how to structure BDD feature files
- Learn best practices for writing step definitions
- See how to organize page objects
- Understand fixture patterns for test dependencies
- Learn proper test organization by feature/module

## 📂 Structure

```
__examples-orangehrm__/
├── admin/                    # Admin module examples
│   ├── features/            # Gherkin feature files
│   ├── pages/               # Page Object files
│   └── step_definitions/    # Step implementation
├── authentication/          # Login/auth examples
├── dashboard/              # Dashboard examples
├── directory/              # Employee directory examples
├── leave/                  # Leave management examples
├── maintenance/            # Maintenance module examples
├── myinfo/                 # Personal info examples
├── performance-module/     # Performance tracking examples
├── pim/                    # Personnel management examples
├── recruitment/            # Recruitment examples
└── common/                 # Shared fixtures & steps
    ├── fixtures/           # BDD fixtures
    │   └── orangehrm.fixtures.ts
    └── step_definitions/   # Common step definitions
```

## 🚀 Running Examples

### Run All OrangeHRM BDD Examples

```bash
# Run examples (recommended)
pnpm test:examples

# Run in UI mode (for interactive exploration)
pnpm test:examples --ui

# Run in debug mode
pnpm test:examples --debug

# Run in headed mode (see browser)
pnpm test:examples --headed

# Using npx directly
pnpm bdd:gen && npx playwright test --project=bdd-examples
```

### Run Specific Feature

```bash
pnpm test:examples --grep "Dashboard"
```

### Filter by Scenario Tag

```bash
# Run only @smoke tagged scenarios
pnpm test:examples --grep @smoke

# Run only @regression tagged scenarios
pnpm test:examples --grep @regression
```

## 📝 Configuration

Examples run through the **main Playwright config** with an example-only
project:
`bdd-examples`

This ensures:

- ✅ Explicit separation between example and framework project execution
- ✅ Shared reporting policy with standard output paths
- ✅ Separate generated BDD specs (`.features-gen/ui/examples/`)
- ✅ Consistent base URL and runtime settings via centralized config

## 🔧 Key Differences from Main Framework

### Import Paths

Examples use **relative imports** instead of path aliases:

```typescript
// ❌ DON'T (won't work in examples)
import { test, expect } from '@tests/UI/common/fixtures/orangehrm.fixtures';
import { LoginPage } from '@tests/UI/authentication/pages/login.page';

// ✅ DO (relative paths)
import { test, expect } from '../../common/fixtures/orangehrm.fixtures';
import { LoginPage } from '../../authentication/pages/login.page';
```

### Fixtures

Examples define their own fixtures in `common/fixtures/orangehrm.fixtures.ts`:

```typescript
export const test = base.extend<OrangeHRMFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  // ... more page fixtures
});
```

## 📚 What You'll Learn

### 1. Feature Files (Gherkin)

- How to write clear, business-readable scenarios
- Proper use of Given/When/Then
- Background steps for common setup
- Scenario outlines for data-driven tests
- Tags for test categorization

**Example:**

```gherkin
Feature: OrangeHRM Authentication

  @smoke @authentication
  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I login with username "Admin" and password "admin123"
    Then I should see the dashboard
```

### 2. Step Definitions

- Using `createBdd(test)` for type-safe steps
- Accessing page fixtures in steps
- Sharing steps across features
- Parameter extraction from scenarios

**Example:**

```typescript
const { Given, When, Then } = createBdd(test);

When(
  'I login with username {string} and password {string}',
  async ({ loginPage }, username, password) => {
    await loginPage.login(username, password);
  }
);
```

### 3. Page Objects

- Extending base page classes
- Using semantic locators
- Declaring readonly locators
- Implementing action methods
- Proper error handling

**Example:**

```typescript
export class LoginPage extends OrangeHRMBasePage {
  readonly usernameInput = this.page.getByRole('textbox', { name: 'Username' });
  readonly passwordInput = this.page.getByRole('textbox', { name: 'Password' });
  readonly loginButton = this.page.getByRole('button', { name: 'Login' });

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

## 🎓 How to Adapt for Your Project

1. **Copy the structure**: Use the same folder organization for your features
2. **Update imports**: Use your actual page objects and fixtures
3. **Modify fixtures**: Create fixtures for your application's pages
4. **Write features**: Create `.feature` files for your business requirements
5. **Implement steps**: Write step definitions that use your page objects
6. **Run tests**: Use the same commands with your config file

## 🔍 Tips for Using Examples

- ✅ **DO** study the patterns and copy the structure
- ✅ **DO** use these as templates for your own tests
- ✅ **DO** reference the JSDoc comments for understanding
- ❌ **DON'T** modify examples directly for your tests
- ❌ **DON'T** expect examples to run against your application

## 📊 Test Reports

Example test results are generated in:

- HTML Report: `playwright-report/examples-orangehrm/`
- JSON Results: `test-results/examples-orangehrm-results.json`
- JUnit XML: `test-results/examples-orangehrm-junit.xml`

View the report:

```bash
npx playwright show-report playwright-report/examples-orangehrm
```

## 🔧 Troubleshooting

### Tests Timing Out?

If you see errors like `TimeoutError: locator.fill: Timeout 10000ms exceeded`,
the OrangeHRM demo site may be down.

**Check site availability:**

```bash
curl -I -m 10 https://opensource-demo.orangehrmlive.com
```

**If site is down:**

1. Wait and retry later (demo sites occasionally experience downtime)
2. Check [TEST_STATUS.md](../../../../TEST_STATUS.md) for current status
3. Try API examples instead: `pnpm test:examples:api` (uses different service)

**Alternative solutions:**

- Use a different demo application
- Set up a local OrangeHRM instance in Docker
- Implement MSW mocks for offline testing

### BDD Spec Generation Issues?

If tests aren't found, regenerate BDD specs:

```bash
pnpm examples:generate
```

## ⚠️ Important Notes

1. **Network Required**: Examples run against the live OrangeHRM demo site
2. **Data Limitations**: Demo site may have limited or reset data
3. **Rate Limiting**: Don't run examples excessively to avoid IP blocks
4. **Not for CI**: These are learning examples, not production tests

## 🤝 Contributing

If you find issues with examples or want to add new ones:

1. Ensure they follow the same patterns
2. Use relative imports (not path aliases)
3. Add proper JSDoc comments
4. Test both example and main framework still work independently

## 📖 Related Documentation

- [Main Framework README](../../../../../README.md)
- [BDD Patterns Guide](../../../../../.ai/instructions/bdd.md)
- [Page Object Model Guide](../../../../../.ai/instructions/page-objects.md)
- [AI Agent Guidelines](../../../../../AGENTS.md)

---

**Happy Testing! 🎉**
