# Source Code Architecture

This document provides an architectural overview of the Playwright Enterprise
Framework source code structure.

---

## 📁 Directory Structure

```
src/
├── core/                   # Core framework utilities
│   ├── errors/            # Custom error classes
│   ├── http/              # HTTP client utilities
│   ├── logger/            # Logging infrastructure
│   ├── navigation/        # Navigation helpers
│   ├── secrets/           # Secrets management
│   └── utils/             # Core utility functions
│
├── reporters/             # Custom test reporters
│   └── audit-reporter.ts  # Audit and compliance reporter
│
├── reports/               # Report generation
│   ├── metrics/           # Test metrics collection
│   └── templates/         # Report templates
│
├── resources/             # Test resources & utilities
│   ├── config/           # Configuration management
│   │   ├── environments/ # Environment-specific configs
│   │   ├── projects/     # Project-specific configs
│   │   ├── base.config.ts
│   │   ├── config.manager.ts
│   │   └── env.validator.ts
│   │
│   ├── docker/           # Docker configurations
│   │
│   ├── fixtures/         # Playwright fixtures
│   │   ├── global-setup.ts
│   │   ├── global-teardown.ts
│   │   └── test.fixtures.ts
│   │
│   ├── middleware/       # Request/Response middleware
│   │   ├── auth/        # Authentication middleware
│   │   ├── interceptors/# Request interceptors
│   │   └── logging/     # Logging middleware
│   │
│   ├── scripts/          # Utility scripts
│   │
│   ├── test-data/        # Test data storage
│   │   ├── api/         # API test data
│   │   ├── environments/# Environment data
│   │   ├── mocks/       # Mock data
│   │   ├── schemas/     # JSON schemas
│   │   └── ui/          # UI test data
│   │
│   └── utils/            # Comprehensive utility library
│       ├── accessibility/# A11y testing utilities
│       ├── api/         # API testing (REST, GraphQL)
│       ├── auth/        # Authentication providers
│       ├── browser/     # Browser utilities
│       ├── core/        # Core utilities (logger, retry, etc.)
│       ├── data/        # Data factories & generators
│       ├── database/    # Database utilities
│       ├── encryption/  # Encryption/decryption
│       ├── network/     # Network utilities (WebSocket, SSE)
│       ├── performance/ # Performance testing
│       ├── playwright/  # Playwright extensions
│       ├── security/    # Security testing
│       ├── transformers/# Data transformers
│       ├── validators/  # Data validators
│       └── visual/      # Visual regression testing
│
├── services/              # API service layer
│   ├── user.service.ts   # User management service
│   └── product.service.ts# Product management service
│
├── tests/                 # All test files
│   ├── API/              # BDD API tests
│   │   ├── features/    # Gherkin feature files
│   │   ├── hooks/       # Test hooks
│   │   └── step_definitions/
│   │
│   ├── UI/               # BDD UI tests
│   │   ├── admin/       # Admin module tests
│   │   ├── authentication/
│   │   ├── common/      # Common pages & fixtures
│   │   ├── dashboard/
│   │   ├── directory/
│   │   ├── leave/
│   │   ├── maintenance/
│   │   ├── myinfo/
│   │   ├── performance_module/
│   │   ├── pim/
│   │   └── recruitment/
│   │
│   ├── accessibility-technical/  # A11y tests
│   ├── performance/              # Performance tests
│   └── visual/                   # Visual regression tests
│
├── test-suites/           # Test suite configurations
│   └── smoke.suite.ts    # Smoke test suite
│
└── types/                 # TypeScript type definitions
    ├── global.d.ts       # Global type augmentations
    └── playwright.d.ts   # Playwright type extensions
```

---

## 🎯 Core Principles

### 1. **Path Aliases**

All imports use path aliases for consistency:

- `@utils/*` → `src/resources/utils/*`
- `@config/*` → `src/resources/config/*`
- `@services/*` → `src/services/*`
- `@fixtures/*` → `src/resources/fixtures/*`
- `@test-data/*` → `src/resources/test-data/*`
- `@types/*` → `src/types/*`

### 2. **Naming Conventions**

- **Files**: `kebab-case` (e.g., `user-service.ts`)
- **Classes/Types**: `PascalCase` (e.g., `UserService`, `UserData`)
- **Functions/Variables**: `camelCase` (e.g., `getUserById`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)

### 3. **TypeScript Standards**

- **Strict Mode**: Enabled for type safety
- **Explicit Types**: All function parameters and returns are typed
- **Named Exports**: No `export default` (except Playwright config)
- **Arrow Functions**: All functions use arrow syntax
- **JSDoc**: All functions and types are documented

### 4. **Test Organization**

- **BDD Structure**: Tests use Gherkin syntax with step definitions
- **Page Object Model**: UI tests use page objects in `tests/UI/*/pages/`
- **Service Layer**: API interaction through service classes
- **Fixtures**: Reusable test fixtures in `resources/fixtures/`

---

## 🔧 Key Components

### Configuration (`resources/config/`)

- **config.manager.ts**: Centralized configuration access
- **env.validator.ts**: Environment variable validation
- **base.config.ts**: Base configuration
- **environments/**: Environment-specific overrides

### Utilities (`resources/utils/`)

Comprehensive utility library organized by domain:

- **Core**: Logger, retry logic, decorators
- **API**: REST/GraphQL clients, request builders
- **Auth**: Multi-provider authentication
- **Browser**: Cookie, storage, dialog management
- **Playwright**: Enhanced page objects, element helpers

### Services (`services/`)

API service layer following CRUD patterns:

- Dependency injection ready
- Comprehensive logging
- Type-safe request/response handling
- Error propagation

### Tests (`tests/`)

- **UI Tests**: BDD scenarios with page objects
- **API Tests**: BDD scenarios with service layer
- **Accessibility**: Axe-core integration
- **Performance**: Lighthouse & custom metrics
- **Visual**: Playwright visual comparison

---

## 📊 Import Patterns

### ✅ Correct

```typescript
// Use path aliases
import { logger } from '@utils/core';
import { APIClient } from '@utils/api/rest';
import { configManager } from '@config/config.manager';
import { UserService } from '@services/user.service';
```

### ❌ Incorrect

```typescript
// Never use relative paths for shared code
import { logger } from '../../../resources/utils/core/logger/logger';
import { APIClient } from '../../utils/api/rest/api-client';
```

---

## 🚀 Getting Started

### For Developers

1. Review [AGENTS.md](../AGENTS.md) for AI coding guidelines
2. Check `.ai/instructions/` for detailed patterns
3. Use templates in `.ai/templates/` for new code

### For Testers

1. Explore [tests/README.md](tests/README.md) for test organization
2. Review BDD patterns in `.ai/instructions/bdd.md`
3. Check page object patterns in `.ai/instructions/page-objects.md`

### For Service Development

1. Review [services/README.md](services/README.md)
2. Follow service layer patterns in `.ai/instructions/services.md`
3. Use service template from `.ai/templates/service.template.ts`

---

## 📚 Additional Resources

- **[AGENTS.md](../AGENTS.md)**: Comprehensive AI coding guidelines
- **[README.md](../README.md)**: Framework overview and usage
- **[CONTRIBUTING.md](../CONTRIBUTING.md)**: Contribution guidelines
- **`.ai/instructions/`**: Detailed coding patterns and conventions

---

## 🔍 Quick Reference

| Component | Location               | Purpose                  |
| --------- | ---------------------- | ------------------------ |
| Config    | `resources/config/`    | Environment & app config |
| Fixtures  | `resources/fixtures/`  | Playwright test fixtures |
| Pages     | `tests/UI/*/pages/`    | Page object models       |
| Services  | `services/`            | API service layer        |
| Utils     | `resources/utils/`     | Utility functions        |
| Types     | `types/`               | TypeScript definitions   |
| Test Data | `resources/test-data/` | Static test data         |
