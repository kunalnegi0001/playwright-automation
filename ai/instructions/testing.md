# Test Patterns

## Basic Test Structure

```typescript
import { test, expect } from '@fixtures/test.fixtures';
import { logger } from '@utils/core';

test.describe('User Management @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
  });

  test('should create new user', async ({ page }) => {
    await page.click('[data-testid="add-user"]');
    await page.fill('[name="username"]', 'testuser');
    await page.click('[type="submit"]');

    await expect(page.getByText('User created')).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    // Cleanup
  });
});
```

## Using Fixtures

```typescript
test.describe('Authenticated Tests', () => {
  test('should access dashboard', async ({ authenticatedPage }) => {
    // authenticatedPage is already logged in
    await expect(authenticatedPage.getByText('Dashboard')).toBeVisible();
  });

  test('with custom data', async ({ testUser, apiClient }) => {
    // testUser and apiClient from fixtures
    const response = await apiClient.get(`/users/${testUser.id}`);
    expect(response.status).toBe(200);
  });
});
```

## Test Isolation

```typescript
// ✅ DO - Isolated
test('test 1', async ({ page }) => {
  const user = await createUser(); // Local state
  await login(page, user);
});

test('test 2', async ({ page }) => {
  const user = await createUser(); // Independent
  await login(page, user);
});

// ❌ DON'T - Shared state
let sharedUser;
test('test 1', async () => {
  sharedUser = await createUser();
});
test('test 2', async () => {
  await login(sharedUser); // Depends on test 1
});
```

## Tags

Use tags for test organization:

- `@smoke` - Critical path tests
- `@regression` - Full test suite
- `@api` - API tests
- `@ui` - UI tests
- `@slow` - Long-running tests

```typescript
test.describe('Login Tests @smoke @ui', () => {
  test('valid login @critical', async ({ page }) => {
    // Test implementation
  });
});
```

## Assertions

```typescript
// Visibility
await expect(element).toBeVisible();
await expect(element).toBeHidden();

// Text content
await expect(element).toHaveText('Expected text');
await expect(element).toContainText('partial');

// Values
await expect(input).toHaveValue('value');
await expect(element).toHaveAttribute('href', '/path');

// Counts
await expect(page.getByRole('listitem')).toHaveCount(5);
```
