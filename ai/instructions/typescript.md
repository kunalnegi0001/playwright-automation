# TypeScript Conventions

## Naming

| Type                 | Convention         | Example                            |
| -------------------- | ------------------ | ---------------------------------- |
| **Files**            | `kebab-case`       | `user-service.ts`, `login-page.ts` |
| **Classes**          | `PascalCase`       | `UserService`, `LoginPage`         |
| **Types/Interfaces** | `PascalCase`       | `UserData`, `ApiResponse<T>`       |
| **Functions**        | `camelCase`        | `getUserById`, `validateInput`     |
| **Variables**        | `camelCase`        | `userName`, `isAuthenticated`      |
| **Constants**        | `UPPER_SNAKE_CASE` | `DEFAULT_TIMEOUT`, `MAX_RETRIES`   |
| **Enums**            | `PascalCase`       | `UserRole.Admin`                   |

## File Structure

```typescript
// 1. External imports
import { Page } from '@playwright/test';
import axios from 'axios';

// 2. Internal imports (path aliases)
import { logger } from '@utils/core';
import type { UserData } from '@/types';

// 3. Types (local)
type LocalType = { id: string };

// 4. Constants
const DEFAULT_TIMEOUT = 30000;

// 5. Implementation
export class MyClass {}
export const myFunction = () => {};
```

## Type System

### Types vs Interfaces

**Always use `type` (not `interface`):**

```typescript
// ✅ DO
type UserData = {
  /** User ID */
  id: string;
  /** User name */
  name: string;
};

// ❌ DON'T
interface UserData {
  id: string;
  name: string;
}
```

### JSDoc for Functions

```typescript
/**
 * Fetches user by ID
 * @param id - User identifier
 * @returns User object
 * @throws {UserNotFoundError} When user doesn't exist
 */
export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
};
```

### JSDoc for Types

```typescript
/**
 * User configuration options
 */
type UserOptions = {
  /** Include profile data */
  includeProfile?: boolean;
  /** Maximum depth for nested data */
  maxDepth?: number;
};
```

## Exports

**Always use named exports (never `export default`):**

```typescript
// ✅ DO
export const myFunction = () => {};
export class MyClass {}
export type MyType = {};

// ❌ DON'T
export default myFunction;
export default class MyClass {}
```

## Arrow Functions

**All functions must use arrow syntax:**

```typescript
// ✅ DO
export const processUser = async (id: string): Promise<User> => {
  return await userService.getById(id);
};

// ❌ DON'T
export async function processUser(id: string): Promise<User> {
  return await userService.getById(id);
}
```

## Barrel Files (index.ts)

**Use for cleaner imports:**

```typescript
// src/resources/utils/core/index.ts
export { logger } from './logger/logger.util';
export { RetryUtil } from './retry/retry.util';
export { cacheManager } from './cache/cache.util';

// Usage
import { logger, RetryUtil, cacheManager } from '@utils/core';
```

## Best Practices

1. **Explicit Types**: All parameters and return values must have explicit types
2. **readonly**: Use `readonly` for class properties that don't change
3. **async/await**: Always use `async/await` (never callbacks)
4. **No `any`**: Never use `any` type (use `unknown` if needed)
5. **Error Handling**: Always log and propagate errors
