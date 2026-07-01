# Contributing to Playwright Enterprise Framework

Thank you for your interest in contributing! This document outlines the process
and guidelines for contributing to the Playwright Enterprise Test Automation
Framework.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Commit Conventions](#commit-conventions)
7. [Pull Request Process](#pull-request-process)
8. [Documentation](#documentation)
9. [AI Coding Guidelines](#ai-coding-guidelines)

---

## 🤝 Code of Conduct

### Our Standards

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Collaborative**: Work together to find the best solutions
- **Be Professional**: Keep discussions focused on technical merit
- **Be Inclusive**: Welcome contributors of all skill levels

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Git** for version control
- **VS Code** (recommended) with suggested extensions

### Initial Setup

1. **Create your working copy**

   ```bash
  # GitHub contribution flow: fork the repository
  # Azure DevOps flow: clone the shared repository directly or create a branch in Azure Repos
   ```

2. **Clone your repository**

   ```bash
  git clone <your-repository-url>
   cd playwright-enterprise-framework
   ```

3. **Add upstream remote (optional)**

   ```bash
   git remote add upstream https://github.com/successivedigitalorg/playwright-enterprise-framework.git
   ```

  If you are working only in Azure DevOps, keep your Azure Repos remote and
  skip the `upstream` remote unless you also contribute back to the GitHub
  source repository.

4. **Install dependencies**

   ```bash
   pnpm install
   ```

5. **Install Playwright browsers**

   ```bash
   pnpm install:browsers
   ```

6. **Run tests to verify setup**
   ```bash
   pnpm test:smoke
   ```

---

## 🔄 Development Workflow

### 1. Create a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes

Follow the coding standards and best practices outlined below.

### 3. Test Your Changes

```bash
# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Run tests
pnpm test:smoke

# Run formatting
pnpm format
```

### 4. Commit Your Changes

Follow our [commit conventions](#commit-conventions).

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request in the host platform you are using:

- GitHub → open a Pull Request
- Azure DevOps → open an Azure Repos Pull Request

---

## 📏 Coding Standards

### TypeScript Conventions

#### 1. **Naming Conventions**

```typescript
// ✅ Files: kebab-case
user - service.ts;
login.page.ts;

// ✅ Classes/Types: PascalCase
class UserService {}
type UserData = {};

// ✅ Functions/Variables: camelCase
const getUserById = () => {};
let activeUsers = [];

// ✅ Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = '...';
```

#### 2. **Export Patterns**

```typescript
// ✅ DO: Named exports
export const getUserById = () => {};
export class UserService {}
export type UserData = {};

// ❌ DON'T: Default exports (except Playwright config)
export default function getUserById() {} // ❌
```

#### 3. **Type Safety**

```typescript
// ✅ DO: Explicit types
export const processUser = async (id: string): Promise<UserData> => {
  // implementation
};

// ❌ DON'T: Implicit any
export const processUser = async id => {
  // ❌
  // implementation
};
```

#### 4. **Documentation**

```typescript
// ✅ DO: JSDoc for all functions
/**
 * Retrieves user data by ID
 * @param id - User identifier
 * @returns Promise resolving to user data
 * @throws {UserNotFoundError} When user doesn't exist
 * @example
 * const user = await getUserById('123');
 */
export const getUserById = async (id: string): Promise<UserData> => {
  // implementation
};

// ✅ DO: Document types with inline comments
/**
 * User data structure
 */
type UserData = {
  /** Unique user identifier */
  id: string;
  /** User's full name */
  name: string;
};

// ❌ DON'T: Use @property tags for types
/**
 * User data
 * @property {string} id - User ID  // ❌ Wrong
 */
type UserData = { id: string };
```

#### 5. **Arrow Functions**

```typescript
// ✅ DO: Arrow functions
export const getUserById = async (id: string): Promise<UserData> => {
  return await apiClient.get(`/users/${id}`);
};

// ❌ DON'T: Function declarations
export async function getUserById(id: string): Promise<UserData> {
  // ❌
  return await apiClient.get(`/users/${id}`);
}
```

### Import Conventions

```typescript
// ✅ DO: Use path aliases
import { logger } from '@utils/core';
import { APIClient } from '@utils/api/rest';
import { configManager } from '@config/config.manager';

// ❌ DON'T: Use relative paths for shared code
import { logger } from '../../../utils/core/logger/logger'; // ❌
```

### File Organization

```typescript
// Recommended file structure
/**
 * @fileoverview User service for API operations
 * @module services/user.service
 */

// 1. Imports
import { APIClient } from '@utils/api/rest';
import { logger } from '@utils/core';

// 2. Types
export type UserData = {
  /* ... */
};

// 3. Constants
const API_ENDPOINT = '/users';

// 4. Main exports
export class UserService {
  // implementation
}

// 5. Helper functions (not exported if internal)
const formatUserData = (data: unknown) => {
  /* ... */
};
```

---

## 🧪 Testing Guidelines

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Management @smoke @api', () => {
  test.beforeEach(async ({ page }) => {
    // Setup for each test
  });

  test('should create a new user', async ({ page }) => {
    // Test implementation
  });

  test.afterEach(async ({ page }) => {
    // Cleanup after each test
  });
});
```

### BDD Structure

```gherkin
Feature: User Management
  As an admin
  I want to manage users
  So that I can control access

  @smoke @ui @admin
  Scenario: Admin creates a new user
    Given I am logged in as admin
    When I create a user with email "test@example.com"
    Then the user should appear in the user list
```

### Test Coverage

- Write tests for new features
- Update existing tests when modifying features
- Aim for meaningful test coverage (not just numbers)
- Include positive and negative test cases

---

## 📝 Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Feature
feat(auth): add Azure AD authentication provider

# Bug fix
fix(api-client): handle timeout errors correctly

# Documentation
docs(readme): update installation instructions

# Refactor
refactor(user-service): simplify error handling

# Tests
test(admin): add tests for user search functionality

# Chore
chore(deps): update playwright to v1.42.0
```

### Scope

Use module or component name:

- `auth`, `api`, `ui`, `config`
- `admin`, `dashboard`, `pim`
- `services`, `fixtures`, `utils`

---

## 🔍 Pull Request Process

### Before Submitting

1. **Update your branch**

   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Run validation**

   ```bash
   pnpm validate  # Runs typecheck, lint, format:check
   pnpm test:smoke
   ```

3. **Update documentation**
   - Update README if adding features
   - Add JSDoc comments to new functions
   - Update type definitions if needed

### PR Title

Use conventional commit format:

```
feat(admin): add bulk user import functionality
fix(api-client): resolve timeout issue in POST requests
```

### PR Description Template

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added for changes
```

### Review Process

1. At least one approval required
2. All checks must pass (linting, tests, type checking)
3. Address review comments
4. Squash commits if requested
5. Maintainer will merge when ready

---

## 📚 Documentation

### When to Update Documentation

- Adding new features
- Changing existing behavior
- Adding new utilities or services
- Modifying configuration options

### Documentation Files

- **README.md**: Framework overview and quick start
- **AGENTS.md**: AI coding guidelines
- **src/README.md**: Architecture overview
- **src/services/README.md**: Service layer guide
- **src/tests/README.md**: Test organization
- **.ai/instructions/**: Detailed pattern guides

### Code Comments

```typescript
// ✅ DO: Explain WHY, not WHAT
// Retry 3 times because API can be flaky under load
const maxRetries = 3;

// ❌ DON'T: State the obvious
// Set maxRetries to 3
const maxRetries = 3;
```

---

## 🐛 Reporting Issues

### Bug Reports

Include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Node version, browser version
6. **Logs**: Relevant error messages or logs
7. **Screenshots**: If applicable

### Feature Requests

Include:

1. **Use Case**: Why is this needed?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: Other approaches considered
4. **Additional Context**: Any other relevant information

---

## 💡 Best Practices

### Code Quality

- Follow the single responsibility principle
- Keep functions small and focused
- Write self-documenting code
- Use meaningful variable names
- Avoid deep nesting (use early returns)

### Performance

- Use async/await properly
- Avoid unnecessary waits
- Leverage Playwright's auto-waiting
- Use proper selectors (role > text > CSS)

### Security

- Never commit secrets or credentials
- Use environment variables for sensitive data
- Sanitize user inputs
- Validate all external data

---

## 🤖 AI Coding Guidelines

This framework is optimized for AI-assisted development. When contributing with
AI coding assistants (GitHub Copilot, Cursor, Claude, etc.):

### Required Reading

1. **[AGENTS.md](AGENTS.md)** - Comprehensive AI coding guidelines (START HERE)
2. **[SKILL.md](SKILL.md)** - Agent skills reference (agentskills.io format)
3. **[Documentation Index](docs/README.md)** - Complete documentation navigation

### Detailed Instructions

Located in [`.ai/instructions/`](.ai/instructions/):

- [TypeScript Conventions](.ai/instructions/typescript.md)
- [Test Patterns](.ai/instructions/testing.md)
- [Page Object Model](.ai/instructions/page-objects.md)
- [BDD Patterns](.ai/instructions/bdd.md)
- [Service Layer](.ai/instructions/services.md)
- [Utility Patterns](.ai/instructions/utilities.md)
- [Import Reference](.ai/instructions/imports-reference.md)

### Code Templates

Use templates from [`.ai/templates/`](.ai/templates/) as starting points:

- Page Object Template
- Service Layer Template
- Test Spec Template
- BDD Step Definitions Template
- Utility Function Template

### Key Principles

- **Export Everything**: Named exports only (no default exports)
- **Document Everything**: JSDoc comments on all functions and types
- **Use Types, Not Interfaces**: Consistency with `type` over `interface`
- **Arrow Functions Only**: Consistent function syntax
- **Path Aliases**: Always use `@utils/*`, `@config/*`, `@services/*`, etc.

---

## 📞 Getting Help

- **Documentation**: Check [AGENTS.md](AGENTS.md), [SKILL.md](SKILL.md), and
  [docs/](docs/README.md)
- **AI Instructions**: See [`.ai/instructions/`](.ai/instructions/) for detailed
  patterns
- **Issues**: Search existing issues first
- **Discussions**: Use GitHub Discussions for questions
- **Team**: Reach out to the QA Engineering team

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the
MIT License.

---

**Thank you for contributing! 🎉**

Your contributions help make this framework better for everyone.
