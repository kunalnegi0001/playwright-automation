# Test Suites

## Purpose

Test suite files provide **programmatic test organization** for complex test
execution scenarios beyond simple tag-based filtering.

## Suites vs Tags

### Use Tags (`@smoke`, `@regression`, `@ui`, `@api`) When:

- Simple filtering needed
- Running tests via CLI: `pnpm test --grep @smoke`
- Single-dimension categorization
- Quick selective execution

**Example:**

```bash
# Run all smoke tests across all modules
pnpm test:smoke

# Run all API tests
pnpm test:api

# Run UI tests only
pnpm test:ui
```

### Use Suite Files When:

- Complex test selection logic needed
- Dynamic test filtering based on environment variables
- Custom test ordering requirements
- Programmatic test configuration per suite
- Multiple criteria selection (e.g., smoke + UI + specific module)

**Example:**

```typescript
// Import and run a specific suite programmatically
import { smokeTests } from './smoke.suite';
test.describe('Smoke Tests', smokeTests);
```

## Available Suites

### `smoke.suite.ts`

**Critical path tests** - Fast, essential functionality tests

- **Duration**: < 5 minutes
- **Run frequency**: On every commit, PR, deployment
- **Coverage**: Critical user journeys and core features
- **Tags included**: `@smoke`

### `sanity.suite.ts`

**Build verification tests** - Quick health check after build

- **Duration**: 5-10 minutes
- **Run frequency**: After build completion
- **Coverage**: Major feature areas, basic workflows
- **Tags included**: `@smoke`, `@sanity`

### `regression.suite.ts`

**Full test coverage** - Comprehensive test execution

- **Duration**: 30+ minutes
- **Run frequency**: Nightly, pre-release
- **Coverage**: All features, edge cases, integrations
- **Tags included**: `@smoke`, `@regression`, `@ui`, `@api`, `@a11y`

## Suite Structure

Each suite file should export:

```typescript
export const suiteName = () => {
  // Suite configuration and test organization
  test.describe.configure({
    mode: 'parallel',
    retries: 2,
  });

  // Test includes/excludes
  // Dynamic environment-based configuration
  // Custom setup/teardown
};
```

## Usage Examples

### CLI Execution (via Tags)

```bash
# Recommended for most use cases
pnpm test:smoke
pnpm test:ui
pnpm test --grep "@smoke"
pnpm test --grep "@ui.*@smoke"  # Multiple tags
```

### Programmatic Execution (via Suites)

```typescript
import { test } from '@playwright/test';
import { smokeTests } from '@/test-suites/smoke.suite';

test.describe('Smoke Suite', smokeTests);
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
jobs:
  smoke:
    name: Smoke Tests
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test:smoke

  regression:
    name: Full Regression
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule'
    steps:
      - run: pnpm test --grep "@regression"
```

## When to Create a New Suite

Create a new suite file when:

- You need environment-specific test selection logic
- You have complex filtering criteria that can't be expressed with tags alone
- You need custom configuration for a specific test subset
- You want to programmatically control test execution order

## Best Practices

1. **Prefer Tags for Simplicity**: Use tags for most scenarios via CLI
2. **Keep Suites Lightweight**: Don't duplicate logic that tags already provide
3. **Document Suite Purpose**: Clearly state what each suite does and when to
   use it
4. **Maintain Tag Consistency**: Ensure suite files align with tag conventions
5. **Regular Cleanup**: Remove suites that aren't actively used

## Tag Reference

| Tag            | Purpose                  | Typical Tests         |
| -------------- | ------------------------ | --------------------- |
| `@smoke`       | Critical path validation | Login, core workflows |
| `@sanity`      | Build verification       | Major feature checks  |
| `@regression`  | Full coverage            | All tests             |
| `@ui`          | UI/browser tests         | Page interactions     |
| `@api`         | API endpoint tests       | REST/GraphQL          |
| `@a11y`        | Accessibility tests      | WCAG compliance       |
| `@visual`      | Visual regression        | Screenshot comparison |
| `@performance` | Performance tests        | Page load, metrics    |

## Related Documentation

- [Test Patterns](../../../.ai/instructions/testing.md)
- [README.md](../../../README.md#running-tests)
