# Service Layer Patterns

## Structure

```typescript
import { APIClient } from '@utils/api/rest';
import { logger } from '@utils/core';

/**
 * User data type
 */
type User = {
  id: string;
  name: string;
  email: string;
};

/**
 * User service for API operations
 */
export class UserService {
  constructor(private apiClient: APIClient = new APIClient()) {}

  /**
   * Get user by ID
   * @param id - User ID
   * @returns User object
   */
  async getById(id: string): Promise<User> {
    logger.info('Fetching user', { id });
    try {
      const response = await this.apiClient.get<User>(`/users/${id}`);
      logger.info('User fetched successfully', { id });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch user', error);
      throw error;
    }
  }

  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    logger.info('Fetching all users');
    const response = await this.apiClient.get<User[]>('/users');
    return response.data;
  }

  /**
   * Create new user
   * @param userData - User data to create
   */
  async create(userData: Omit<User, 'id'>): Promise<User> {
    logger.info('Creating user');
    const response = await this.apiClient.post<User>('/users', userData);
    return response.data;
  }

  /**
   * Update existing user
   */
  async update(id: string, userData: Partial<User>): Promise<User> {
    logger.info('Updating user', { id });
    const response = await this.apiClient.put<User>(`/users/${id}`, userData);
    return response.data;
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    logger.info('Deleting user', { id });
    await this.apiClient.delete(`/users/${id}`);
  }
}
```

## Rules

1. **Inject APIClient**: Via constructor with default
2. **Log Everything**: Log all operations (info for success, error for failures)
3. **CRUD Naming**: `getById`, `getAll`, `create`, `update`, `delete`
4. **Error Handling**: Log and propagate (never swallow)
5. **Type Generics**: Use `apiClient.get<User>()` for type safety
6. **JSDoc**: Document all public methods
