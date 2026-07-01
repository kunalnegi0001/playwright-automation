# Page Object Model Patterns

## Structure

```typescript
import type { Page, Locator } from '@playwright/test';
import { logger } from '@utils/core';

/**
 * Login page object
 */
export class LoginPage {
  // Locators - readonly, semantic selectors
  readonly usernameInput = this.page.getByRole('textbox', { name: 'Username' });
  readonly passwordInput = this.page.getByRole('textbox', { name: 'Password' });
  readonly submitButton = this.page.getByRole('button', { name: 'Login' });
  readonly errorMessage = this.page.getByRole('alert');

  constructor(private readonly page: Page) {}

  /**
   * Performs login action
   * @param username - User credentials
   * @param password - User password
   */
  async login(username: string, password: string): Promise<void> {
    logger.info('Logging in', { username });
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /**
   * Checks if login failed
   */
  async hasError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }
}
```

## Rules

1. **Extend Base**: Extend `OrangeHRMBasePage` or appropriate base class
2. **Locators**: Use `readonly`, semantic selectors (`getByRole`, `getByText`,
   `getByLabel`)
3. **Methods**: All `async`, include JSDoc
4. **Constructor**: Accept `Page` object
5. **Logging**: Log significant actions

## Locator Preferences

```typescript
// ✅ Semantic (Best)
this.page.getByRole('button', { name: 'Submit' });
this.page.getByText('Welcome');
this.page.getByLabel('Email');
this.page.getByPlaceholder('Enter name');

// ⚠️ Test ID (Acceptable)
this.page.getByTestId('submit-btn');

// ❌ CSS/XPath (Avoid)
this.page.locator('#submit-button');
this.page.locator('//button[@id="submit"]');
```

## Organization

```
src/tests/UI/
  └── module-name/
      ├── features/       # Gherkin features
      ├── pages/          # Page objects
      ├── step_definitions/  # BDD steps
      └── tests/          # Test specs
```
