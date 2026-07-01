import { APIClient } from '@utils/api/rest';
import { logger } from '@utils/core';

/**
 * Represents a complete user entity from the API
 */
export type UserItem = {
  /** Unique user identifier */
  id: string | number;
  /** User's email address */
  email: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's hashed password (omitted in responses) */
  password?: string;
  /** User's role (e.g., 'admin', 'user', 'moderator') */
  role?: string;
  /** User's account status (e.g., 'active', 'inactive', 'blocked') */
  status?: string;
  /** ISO 8601 timestamp of user creation */
  createdAt?: string;
  /** User's phone number */
  phone?: string;
  /** User preferences and settings */
  preferences?: Record<string, unknown>;
  /** Additional dynamic properties */
  [key: string]: unknown;
};

/**
 * Data structure for creating or updating users
 */
export type UserData = {
  /** User's email address */
  email?: string;
  /** User's first name */
  firstName?: string;
  /** User's last name */
  lastName?: string;
  /** User's password (minimum 8 characters) */
  password?: string;
  /** User's role */
  role?: string;
  /** User's account status */
  status?: string;
  /** User's phone number */
  phone?: string;
  /** User preferences */
  preferences?: Record<string, unknown>;
  /** Additional dynamic properties */
  [key: string]: unknown;
};

/**
 * Query parameters for filtering and paginating user lists
 */
export type UserQueryParams = {
  /** Page number for pagination (starts at 1) */
  page?: number;
  /** Number of results per page */
  limit?: number;
  /** Filter by user role */
  role?: string;
  /** Filter by user status */
  status?: string;
  /** Additional dynamic query parameters */
  [key: string]: unknown;
};

/**
 * Result of user data validation
 */
export type UserValidationResult = {
  /** True if all validation checks pass */
  isValid: boolean;
  /** Array of validation error messages */
  errors: string[];
};

/**
 * Formatted user data optimized for display in UI
 */
export type UserFormatted = {
  /** User identifier */
  id: string | number;
  /** Full name (firstName + lastName) */
  name: string;
  /** Email address */
  email: string;
  /** User role */
  role?: string;
  /** Account status */
  status?: string;
  /** Formatted creation date */
  createdAt?: string;
};

/**
 * Result of bulk user creation operation
 */
export type UserBulkCreateResult = {
  /** Successfully created users */
  created: UserItem[];
  /** Failed creations with error details */
  failed: Array<{ data: UserData; error: string }>;
};

/**
 * User Service - Business logic for user-related operations
 */
export class UserService {
  /** API client instance for making HTTP requests */
  apiClient: APIClient;

  /**
   * Creates a new UserService instance
   * @param apiClient - Optional API client instance (creates new one if not provided)
   * @example
   * const userService = new UserService();
   * const customService = new UserService(customApiClient);
   */
  constructor(apiClient: APIClient | null = null) {
    this.apiClient = apiClient || new APIClient(process.env.API_BASE_URL);
  }

  /**
   * Retrieves all users with optional filtering and pagination
   * @param params - Query parameters for filtering (page, limit, role, status)
   * @returns Promise resolving to array of user objects
   * @throws {Error} If API request fails
   * @example
   * const users = await userService.getAllUsers({ role: 'admin', limit: 10 });
   */
  async getAllUsers(params: UserQueryParams = {}): Promise<UserItem[]> {
    logger.info('Fetching all users', params);
    const response = await this.apiClient.get<UserItem[]>('/users', { params });
    return response;
  }

  /**
   * Retrieves a specific user by their unique identifier
   * @param userId - Unique user identifier
   * @returns Promise resolving to user object with all details
   * @throws {Error} If user not found or API request fails
   * @example
   * const user = await userService.getUserById('123');
   */
  async getUserById(userId: string | number): Promise<UserItem> {
    logger.info(`Fetching user: ${userId}`);
    const response = await this.apiClient.get<UserItem>(`/users/${userId}`);
    return response;
  }

  /**
   * Creates a new user with the provided data
   * @param userData - User data object containing email, firstName, lastName, and optional fields
   * @returns Promise resolving to created user object with generated ID
   * @throws {Error} If validation fails or API request fails
   * @example
   * const newUser = await userService.createUser({
   *   email: 'john@example.com',
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   password: 'SecurePass123'
   * });
   */
  async createUser(userData: UserData): Promise<UserItem> {
    logger.info('Creating new user', { email: userData.email });
    const response = await this.apiClient.post<UserItem>('/users', userData);
    return response;
  }

  /**
   * Updates an existing user with the provided data
   * @param userId - User ID to update
   * @param userData - Partial user data to update (only provided fields will be updated)
   * @returns Promise resolving to updated user object
   * @throws {Error} If user not found or API request fails
   * @example
   * const updated = await userService.updateUser('123', {
   *   firstName: 'Jane',
   *   role: 'moderator'
   * });
   */
  async updateUser(userId: string | number, userData: UserData): Promise<UserItem> {
    logger.info(`Updating user: ${userId}`);
    const response = await this.apiClient.put<UserItem>(`/users/${userId}`, userData);
    return response;
  }

  /**
   * Permanently deletes a user from the system
   * @param userId - User ID to delete
   * @returns Promise resolving to deletion confirmation response
   * @throws {Error} If user not found or API request fails
   * @example
   * await userService.deleteUser('123');
   */
  async deleteUser(userId: string | number): Promise<unknown> {
    logger.info(`Deleting user: ${userId}`);
    const response = await this.apiClient.delete<unknown>(`/users/${userId}`);
    return response;
  }

  /**
   * Searches for users matching the provided query string
   * @param query - Search query (searches in name, email, etc.)
   * @returns Promise resolving to array of matching user objects
   * @throws {Error} If API request fails
   * @example
   * const results = await userService.searchUsers('john');
   */
  async searchUsers(query: string): Promise<UserItem[]> {
    logger.info(`Searching users: ${query}`);
    const response = await this.apiClient.get<UserItem[]>('/users/search', {
      params: { q: query },
    });
    return response;
  }

  /**
   * Retrieves a user by their email address
   * @param email - User email address
   * @returns Promise resolving to user object or undefined if not found
   * @throws {Error} If API request fails
   * @example
   * const user = await userService.getUserByEmail('john@example.com');
   */
  async getUserByEmail(email: string): Promise<UserItem | undefined> {
    logger.info(`Fetching user by email: ${email}`);
    const users = await this.searchUsers(email);
    return users.find(u => u.email === email);
  }

  /**
   * Retrieves all users with a specific role
   * @param role - Role to filter by (e.g., 'admin', 'user', 'moderator')
   * @returns Promise resolving to array of users with the specified role
   * @throws {Error} If API request fails
   * @example
   * const admins = await userService.getUsersByRole('admin');
   */
  async getUsersByRole(role: string): Promise<UserItem[]> {
    logger.info(`Fetching users with role: ${role}`);
    const response = await this.apiClient.get<UserItem[]>('/users', {
      params: { role },
    });
    return response;
  }

  /**
   * Activates a user account by setting status to 'active'
   * @param userId - User ID to activate
   * @returns Promise resolving to updated user object with active status
   * @throws {Error} If user not found or API request fails
   * @example
   * await userService.activateUser('123');
   */
  async activateUser(userId: string | number): Promise<UserItem> {
    logger.info(`Activating user: ${userId}`);
    return await this.updateUser(userId, { status: 'active' });
  }

  /**
   * Deactivates a user account by setting status to 'inactive'
   * @param userId - User ID to deactivate
   * @returns Promise resolving to updated user object with inactive status
   * @throws {Error} If user not found or API request fails
   * @example
   * await userService.deactivateUser('123');
   */
  async deactivateUser(userId: string | number): Promise<UserItem> {
    logger.info(`Deactivating user: ${userId}`);
    return await this.updateUser(userId, { status: 'inactive' });
  }

  /**
   * Blocks a user account by setting status to 'blocked'
   * @param userId - User ID to block
   * @returns Promise resolving to updated user object with blocked status
   * @throws {Error} If user not found or API request fails
   * @example
   * await userService.blockUser('123');
   */
  async blockUser(userId: string | number): Promise<UserItem> {
    logger.info(`Blocking user: ${userId}`);
    return await this.updateUser(userId, { status: 'blocked' });
  }

  /**
   * Changes a user's role to the specified value
   * @param userId - User ID
   * @param newRole - New role to assign (e.g., 'admin', 'user', 'moderator')
   * @returns Promise resolving to updated user object with new role
   * @throws {Error} If user not found or API request fails
   * @example
   * await userService.changeUserRole('123', 'admin');
   */
  async changeUserRole(userId: string | number, newRole: string): Promise<UserItem> {
    logger.info(`Changing user role: ${userId} to ${newRole}`);
    return await this.updateUser(userId, { role: newRole });
  }

  /**
   * Retrieves the current authenticated user's profile
   * @returns Promise resolving to current user profile object
   * @throws {Error} If not authenticated or API request fails
   * @example
   * const profile = await userService.getUserProfile();
   */
  async getUserProfile(): Promise<UserItem> {
    logger.info('Fetching current user profile');
    const response = await this.apiClient.get<UserItem>('/users/me');
    return response;
  }

  /**
   * Updates the current authenticated user's profile
   * @param profileData - Profile data to update (firstName, lastName, phone, preferences)
   * @returns Promise resolving to updated profile object
   * @throws {Error} If not authenticated or API request fails
   * @example
   * const updated = await userService.updateUserProfile({
   *   firstName: 'Jane',
   *   phone: '+1234567890'
   * });
   */
  async updateUserProfile(profileData: UserData): Promise<UserItem> {
    logger.info('Updating user profile');
    const response = await this.apiClient.put<UserItem>('/users/me', profileData);
    return response;
  }

  /**
   * Changes a user's password after verifying the old password
   * @param userId - User ID
   * @param oldPassword - Current password for verification
   * @param newPassword - New password (must meet security requirements)
   * @returns Promise resolving to success confirmation response
   * @throws {Error} If old password is incorrect or new password is invalid
   * @example
   * await userService.changePassword('123', 'OldPass123', 'NewSecurePass456');
   */
  async changePassword(
    userId: string | number,
    oldPassword: string,
    newPassword: string
  ): Promise<unknown> {
    logger.info(`Changing password for user: ${userId}`);
    const response = await this.apiClient.post<unknown>(`/users/${userId}/change-password`, {
      oldPassword,
      newPassword,
    });
    return response;
  }

  /**
   * Initiates a password reset request by sending reset instructions to the user's email
   * @param email - User's email address
   * @returns Promise resolving to response with reset instructions sent confirmation
   * @throws {Error} If email not found or API request fails
   * @example
   * await userService.requestPasswordReset('user@example.com');
   */
  async requestPasswordReset(email: string): Promise<unknown> {
    logger.info(`Requesting password reset for: ${email}`);
    const response = await this.apiClient.post<unknown>('/users/forgot-password', { email });
    return response;
  }

  /**
   * Resets a user's password using a valid reset token
   * @param token - Password reset token from email
   * @param newPassword - New password to set
   * @returns Promise resolving to success confirmation response
   * @throws {Error} If token is invalid/expired or password doesn't meet requirements
   * @example
   * await userService.resetPassword('abc123token', 'NewSecurePass789');
   */
  async resetPassword(token: string, newPassword: string): Promise<unknown> {
    logger.info('Resetting password with token');
    const response = await this.apiClient.post<unknown>('/users/reset-password', {
      token,
      password: newPassword,
    });
    return response;
  }

  /**
   * Validates user data before creation or update
   * @param userData - User data to validate (email, firstName, lastName, password)
   * @returns Validation result object with isValid flag and errors array
   * @example
   * const result = userService.validateUserData({ email: 'invalid', firstName: '' });
   * if (!result.isValid) {
   *   console.log('Errors:', result.errors);
   * }
   */
  validateUserData(userData: UserData): UserValidationResult {
    const errors: string[] = [];

    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('Valid email is required');
    }

    if (!userData.firstName || userData.firstName.trim() === '') {
      errors.push('First name is required');
    }

    if (!userData.lastName || userData.lastName.trim() === '') {
      errors.push('Last name is required');
    }

    if (userData.password && userData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates email address format using regex pattern
   * @param email - Email address to validate
   * @returns True if email format is valid, false otherwise
   * @example
   * const valid = userService.isValidEmail('user@example.com'); // true
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Formats user data for display purposes with computed full name and formatted date
   * @param user - Raw user object from API
   * @returns Formatted user object with display-friendly fields
   * @example
   * const formatted = userService.formatUser(rawUser);
   */
  formatUser(user: UserItem): UserFormatted {
    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    };
  }

  /**
   * Retrieves aggregated user statistics including total users, active users, and counts by role
   * @returns Promise resolving to statistics object with user metrics
   * @throws {Error} If API request fails
   * @example
   * const stats = await userService.getUserStatistics();
   */
  async getUserStatistics(): Promise<unknown> {
    logger.info('Fetching user statistics');
    const response = await this.apiClient.get<unknown>('/users/statistics');
    return response;
  }

  /**
   * Creates multiple users in a single batch request
   * @param usersData - Array of user data objects to create
   * @returns Promise resolving to result object with created users and any failures
   * @throws {Error} If API request fails
   * @example
   * const result = await userService.bulkCreateUsers([
   *   { email: 'user1@example.com', firstName: 'User', lastName: 'One' },
   *   { email: 'user2@example.com', firstName: 'User', lastName: 'Two' }
   * ]);
   */
  async bulkCreateUsers(usersData: UserData[]): Promise<UserBulkCreateResult> {
    logger.info(`Bulk creating ${usersData.length} users`);
    const response = await this.apiClient.post<UserBulkCreateResult>('/users/bulk', {
      users: usersData,
    });
    return response;
  }

  /**
   * Exports all users data to the specified file format
   * @param format - Export format: 'csv', 'json', or 'xlsx' (defaults to 'csv')
   * @returns Promise resolving to file blob data for download
   * @throws {Error} If format is unsupported or API request fails
   * @example
   * const csvData = await userService.exportUsers('csv');
   */
  async exportUsers(format = 'csv'): Promise<Blob> {
    logger.info(`Exporting users as ${format}`);
    const response = await this.apiClient.get<Blob>('/users/export', {
      params: { format },
      responseType: 'blob',
    });
    return response;
  }
}
