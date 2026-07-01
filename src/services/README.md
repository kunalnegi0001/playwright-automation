# Service Layer Documentation

This document provides guidelines for creating and maintaining API service
classes in the Playwright Enterprise Framework.

---

## 📋 Overview

The service layer provides a clean abstraction over API interactions, following
enterprise patterns:

- **Type-Safe**: Full TypeScript typing for requests and responses
- **Logging**: Comprehensive logging of all operations
- **Error Handling**: Proper error propagation and custom errors
- **Testable**: Dependency injection ready
- **Reusable**: CRUD patterns for consistent API interaction

---

## 🏗️ Service Structure

### Basic Service Template

```typescript
import { APIClient } from '@utils/api/rest';
import { logger } from '@utils/core';

/**
 * User data type
 */
export type UserData = {
  /** User ID */
  id: string | number;
  /** Email address */
  email: string;
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** User role */
  role?: string;
};

/**
 * User service for managing user operations
 * Provides CRUD operations for user entities
 */
export class UserService {
  private apiClient: APIClient;

  /**
   * Creates UserService instance
   * @param apiClient - Optional APIClient instance (DI ready)
   */
  constructor(apiClient?: APIClient) {
    this.apiClient = apiClient || new APIClient();
  }

  /**
   * Retrieves user by ID
   * @param id - User identifier
   * @returns Promise resolving to user data
   * @throws {APIError} If request fails
   */
  async getUserById(id: string | number): Promise<UserData> {
    logger.info(`Getting user by ID: ${id}`);

    try {
      const response = await this.apiClient.get<UserData>(`/users/${id}`);
      logger.info(`User retrieved successfully`, { userId: id });
      return response.data;
    } catch (error) {
      logger.error(`Failed to get user ${id}`, error);
      throw error;
    }
  }

  /**
   * Creates a new user
   * @param userData - User data to create
   * @returns Promise resolving to created user
   * @throws {APIError} If validation or request fails
   */
  async createUser(userData: Partial<UserData>): Promise<UserData> {
    logger.info('Creating new user', { email: userData.email });

    try {
      const response = await this.apiClient.post<UserData>('/users', userData);
      logger.info('User created successfully', { userId: response.data.id });
      return response.data;
    } catch (error) {
      logger.error('Failed to create user', error);
      throw error;
    }
  }

  /**
   * Updates existing user
   * @param id - User identifier
   * @param userData - Updated user data
   * @returns Promise resolving to updated user
   */
  async updateUser(
    id: string | number,
    userData: Partial<UserData>
  ): Promise<UserData> {
    logger.info(`Updating user ${id}`);

    try {
      const response = await this.apiClient.put<UserData>(
        `/users/${id}`,
        userData
      );
      logger.info(`User ${id} updated successfully`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to update user ${id}`, error);
      throw error;
    }
  }

  /**
   * Deletes user by ID
   * @param id - User identifier
   * @returns Promise resolving when deletion completes
   */
  async deleteUser(id: string | number): Promise<void> {
    logger.info(`Deleting user ${id}`);

    try {
      await this.apiClient.delete(`/users/${id}`);
      logger.info(`User ${id} deleted successfully`);
    } catch (error) {
      logger.error(`Failed to delete user ${id}`, error);
      throw error;
    }
  }

  /**
   * Retrieves all users (with optional filtering)
   * @param params - Query parameters for filtering
   * @returns Promise resolving to user list
   */
  async getAllUsers(params?: Record<string, unknown>): Promise<UserData[]> {
    logger.info('Getting all users', { params });

    try {
      const response = await this.apiClient.get<UserData[]>('/users', {
        params,
      });
      logger.info(`Retrieved ${response.data.length} users`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get users', error);
      throw error;
    }
  }
}
```

---

## 📐 CRUD Pattern

### Standard Method Names

| Operation    | Method Name        | HTTP Method |
| ------------ | ------------------ | ----------- |
| **Create**   | `create{Entity}`   | POST        |
| **Read One** | `get{Entity}ById`  | GET         |
| **Read All** | `getAll{Entities}` | GET         |
| **Update**   | `update{Entity}`   | PUT/PATCH   |
| **Delete**   | `delete{Entity}`   | DELETE      |

### Example

```typescript
// User Service
createUser(); // POST /users
getUserById(); // GET /users/:id
getAllUsers(); // GET /users
updateUser(); // PUT /users/:id
deleteUser(); // DELETE /users/:id

// Product Service
createProduct(); // POST /products
getProductById(); // GET /products/:id
getAllProducts(); // GET /products
updateProduct(); // PUT /products/:id
deleteProduct(); // DELETE /products/:id
```

---

## 🎯 Best Practices

### 1. **Dependency Injection**

✅ **DO**: Support optional dependency injection

```typescript
constructor(apiClient?: APIClient) {
  this.apiClient = apiClient || new APIClient();
}
```

❌ **DON'T**: Hard-code dependencies

```typescript
constructor() {
  this.apiClient = new APIClient(); // Not testable
}
```

### 2. **Logging**

✅ **DO**: Log all operations with context

```typescript
logger.info('Creating user', { email: userData.email });
logger.error('Failed to create user', error);
```

❌ **DON'T**: Use console.log or skip logging

```typescript
console.log('Creating user'); // Not captured in reports
```

### 3. **Error Handling**

✅ **DO**: Log errors and re-throw

```typescript
try {
  return await this.apiClient.post('/users', data);
} catch (error) {
  logger.error('User creation failed', error);
  throw error; // Propagate to caller
}
```

❌ **DON'T**: Swallow errors

```typescript
try {
  return await this.apiClient.post('/users', data);
} catch (error) {
  return null; // Silent failure - BAD!
}
```

### 4. **Type Safety**

✅ **DO**: Use explicit generic types

```typescript
const response = await this.apiClient.get<UserData>(`/users/${id}`);
return response.data; // Typed as UserData
```

❌ **DON'T**: Use `any` or skip types

```typescript
const response = await this.apiClient.get(`/users/${id}`);
return response.data; // Type is 'any'
```

### 5. **Documentation**

✅ **DO**: Add JSDoc to all methods

```typescript
/**
 * Retrieves user by ID
 * @param id - User identifier
 * @returns Promise resolving to user data
 * @throws {APIError} If user not found
 */
async getUserById(id: string): Promise<UserData>
```

---

## 🧪 Testing Services

### Unit Test Example

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from './user.service';
import { APIClient } from '@utils/api/rest';

describe('UserService', () => {
  let service: UserService;
  let mockApiClient: APIClient;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as APIClient;

    service = new UserService(mockApiClient);
  });

  it('should get user by ID', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    mockApiClient.get = vi.fn().mockResolvedValue({ data: mockUser });

    const result = await service.getUserById('1');

    expect(result).toEqual(mockUser);
    expect(mockApiClient.get).toHaveBeenCalledWith('/users/1');
  });

  it('should create user', async () => {
    const newUser = { email: 'new@example.com', firstName: 'John' };
    const createdUser = { id: '2', ...newUser };
    mockApiClient.post = vi.fn().mockResolvedValue({ data: createdUser });

    const result = await service.createUser(newUser);

    expect(result).toEqual(createdUser);
    expect(mockApiClient.post).toHaveBeenCalledWith('/users', newUser);
  });
});
```

---

## 📊 Usage in Tests

### In BDD Step Definitions

```typescript
import { createBdd } from 'playwright-bdd';
import { test } from '@fixtures/test.fixtures';
import { UserService } from '@services/user.service';

const { Given, When, Then } = createBdd(test);

let userService: UserService;
let createdUserId: string;

Given('I have a user service', async () => {
  userService = new UserService();
});

When('I create a new user with email {string}', async ({}, email: string) => {
  const user = await userService.createUser({
    email,
    firstName: 'Test',
    lastName: 'User',
  });
  createdUserId = user.id;
});

Then('the user should exist in the system', async () => {
  const user = await userService.getUserById(createdUserId);
  expect(user).toBeDefined();
  expect(user.id).toBe(createdUserId);
});
```

---

## 📝 Checklist

When creating a new service class:

- [ ] Named `{Entity}Service` (e.g., `UserService`, `ProductService`)
- [ ] Located in `src/services/` directory
- [ ] File named in `kebab-case` (e.g., `user.service.ts`)
- [ ] Uses APIClient via dependency injection
- [ ] Follows CRUD naming conventions
- [ ] All methods are `async` and return `Promise<T>`
- [ ] Comprehensive JSDoc on all public methods
- [ ] Logging for all operations (info, error)
- [ ] Proper error handling (log & re-throw)
- [ ] Explicit TypeScript types for all parameters and returns
- [ ] Exported types for data structures
- [ ] Unit tests with mocked APIClient

---

## 🔗 Related Documentation

- **[API Client Documentation](../resources/utils/api/README.md)**
- **[TypeScript Conventions](../.ai/instructions/typescript.md)**
- **[Service Layer Patterns](../.ai/instructions/services.md)**
- **[Service Template](../.ai/templates/service.template.ts)**

---

**Questions?** Check [AGENTS.md](../AGENTS.md) or consult the QA Engineering
team.
