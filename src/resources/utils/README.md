# Utils Directory Organization

This document explains the organization and purpose of each utility directory in
the framework.

## Directory Structure Overview

```
utils/
├── accessibility/      # Accessibility testing utilities
├── api/               # API testing (GraphQL & REST)
├── auth/              # Authentication providers
├── browser/           # Browser-level operations
├── core/              # Core utilities (logger, retry, decorators)
├── data/              # Test data generation
├── database/          # Database helpers
├── encryption/        # DEPRECATED - Use security/ instead
├── network/           # Network utilities
├── performance/       # Performance testing
├── playwright/        # Playwright abstractions & patterns
├── security/          # Security testing utilities
├── transformers/      # Data transformation utilities
├── validators/        # Validation utilities
└── visual/            # Visual regression utilities
```

## Directory Purpose Guide

### `accessibility/`

Accessibility testing and WCAG compliance:

- Axe-core integration
- ARIA validation
- Color contrast checks
- Use for: A11y testing and compliance

### `api/`

API testing utilities:

- **`graphql/`** - GraphQL query building and testing
- **`rest/`** - REST API client and helpers
- Use for: API endpoint testing, schema validation

### `auth/`

Authentication providers and session management:

- Base authentication interfaces
- OAuth, SAML, basic auth implementations
- Session pooling
- Use for: Multi-authentication strategy support

### `browser/`

Browser-level operations (lower-level):

- `cookies.helper.ts` - Cookie management
- `dialog.helper.ts` - Alert/confirm/prompt dialogs
- `download.helper.ts` - File downloads
- `navigation.helper.ts` - Page navigation
- `storage.helper.ts` - LocalStorage/SessionStorage
- `upload.helper.ts` - File uploads
- Use for: Direct browser API interactions

### `core/`

Core framework utilities:

- `constants/` - Framework constants
- `decorators/` - TypeScript decorators
- `logger/` - Winston logger configuration
- `retry/` - Retry logic utilities
- Use for: Essential framework functionality

### `data/`

Test data generation and factories:

- `factories/` - Factory functions for creating test data objects (e.g.,
  userFactory, productFactory)
- Use for: Creating complex test data structures dynamically

### `database/`

Database connection and query utilities:

- MongoDB, MySQL, PostgreSQL, Redis clients
- Query builders
- Seeding helpers
- Use for: Database testing and test data setup

### `encryption/` ⚠️ DEPRECATED

**This directory is deprecated.** Encryption utilities have been moved to
`security/encryption.util.ts`. The index file re-exports from the new location
for backwards compatibility.

- **Action**: Import from `@utils/security` instead

### `network/`

Network-level utilities:

- Request interception
- Proxy configuration
- Network throttling
- WebSocket testing
- Server-Sent Events (SSE)
- Use for: Network behavior testing

### `performance/`

Performance testing utilities:

- Core Web Vitals measurement
- Lighthouse integration
- Resource timing analysis
- Use for: Performance benchmarking

### `playwright/`

Playwright-specific abstractions and patterns (higher-level):

- `base-page.enhanced.ts` - Base page object class
- `element.helper.ts` - Element interaction utilities
- `form.helper.ts` - Form filling helpers
- `iframe.helper.ts` - iFrame handling
- `verification.helper.ts` - Assertion helpers
- Use for: Page Object Model patterns and reusable component interactions

### `security/`

Security testing utilities:

- CSRF protection testing
- Encryption/decryption utilities
- Security headers validation
- SQL injection testing
- SSL/TLS verification
- XSS protection testing
- Use for: Security vulnerability testing

### `transformers/`

Data transformation utilities:

- `encode.transformer.ts` - Encoding/decoding data
- `format.transformer.ts` - Formatting data for display
- `mask.transformer.ts` - Masking sensitive data
- `normalize.transformer.ts` - Normalizing data formats
- `sanitize.transformer.ts` - Sanitizing input data
- Use for: Transforming existing data between formats

### `validators/`

Validation utilities:

- Credit card validation
- Email validation
- Form validation
- Password strength validation
- Phone number validation
- Schema validation (JSON, Joi)
- Use for: Input validation and data integrity checks

### `visual/`

Visual regression testing:

- Screenshot comparison
- Visual diff generation
- Baseline management
- Use for: Pixel-perfect UI testing

## Key Differences

### `data/` vs `transformers/`

- **`data/`** = Creating **new** data (factories, generators)
- **`transformers/`** = Modifying **existing** data (formatting, encoding)

### `browser/` vs `playwright/`

- **`browser/`** = Direct browser API usage (lower-level operations)
- **`playwright/`** = Playwright abstractions & patterns (higher-level POM)

### `encryption/` vs `security/`

- **`encryption/`** = DEPRECATED - Use `security/` instead
- **`security/`** = All security utilities including encryption

## Import Best Practices

### ✅ Recommended

```typescript
// Import from specific category barrel
import { logger } from '@utils/core';
import { APIClient } from '@utils/api/rest';
import { encryptData } from '@utils/security';
```

### ⚠️ Acceptable (but less optimal for tree-shaking)

```typescript
// Import from master barrel
import { logger, APIClient, encryptData } from '@utils';
```

### ❌ Avoid

```typescript
// Don't use relative paths for shared utilities
import { logger } from '../../../utils/core/logger';
```

## Adding New Utilities

When adding a new utility:

1. Choose the appropriate directory based on its purpose
2. Follow the naming convention: `{feature}.{type}.ts` (e.g.,
   `email.validator.ts`)
3. Add JSDoc comments with `@param`, `@returns`, `@example`
4. Export from the category's `index.ts` barrel file
5. Use named exports only (no default exports)
6. Update this README if creating a new category

## Related Documentation

- [AGENTS.md](../../../../AGENTS.md) - AI coding guidelines
- [TypeScript Conventions](../../../../.ai/instructions/typescript.md)
- [Utility Patterns](../../../../.ai/instructions/utilities.md)
