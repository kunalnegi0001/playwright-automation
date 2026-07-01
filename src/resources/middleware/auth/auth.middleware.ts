import { logger } from '@utils/core';

/**
 * Authenticated user information
 */
export type AuthUser = {
  /** User email address */
  email?: string;
  /** Username */
  username?: string;
  /** Unique user identifier */
  id?: string;
  /** User role (admin, user, etc.) */
  role?: string;
};

/**
 * Authentication response structure
 */
export type AuthResponse = {
  /** Response data object */
  data: {
    /** Authentication token */
    token?: string;
    /** Refresh token for renewing access */
    refreshToken?: string;
    /** Token expiration time in seconds */
    expiresIn?: number;
    /** Authenticated user information */
    user?: AuthUser;
  };
};

/**
 * API client interface for authentication requests
 */
export type ApiClient = {
  /** POST request method */
  post: (endpoint: string, data: Record<string, unknown>) => Promise<AuthResponse>;
};

/**
 * Authentication Middleware
 * Manages authentication state including tokens, user information, and session lifecycle
 * @class
 * @example
 * const auth = new AuthMiddleware();
 * auth.setToken('jwt-token', 3600);
 * if (auth.isAuthenticated()) { ... }
 */
class AuthMiddleware {
  token: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  user: AuthUser | null;

  constructor() {
    this.token = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.user = null;
  }

  /**
   * Set authentication token with expiration time
   * @param {string} token - JWT or authentication token
   * @param {number} [expiresIn=3600] - Token expiration time in seconds (default: 1 hour)
   * @returns {void}
   * @example
   * authMiddleware.setToken('eyJhbGciOi...', 7200); // 2 hours
   */
  setToken(token: string, expiresIn = 3600): void {
    this.token = token;
    this.tokenExpiry = Date.now() + expiresIn * 1000;
    logger.info('Authentication token set');
  }

  /**
   * Set refresh token for token renewal
   * @param {string} refreshToken - Refresh token string
   * @returns {void}
   * @example
   * authMiddleware.setRefreshToken('refresh_xyz123');
   */
  setRefreshToken(refreshToken: string): void {
    this.refreshToken = refreshToken;
    logger.info('Refresh token set');
  }

  /**
   * Get current authentication token if not expired
   * @returns {string|null} Current token or null if expired/not set
   * @example
   * const token = authMiddleware.getToken();
   * if (token) {
   *   // Use token for authenticated request
   * }
   */
  getToken(): string | null {
    if (this.isTokenExpired()) {
      logger.warn('Token is expired');
      return null;
    }
    return this.token;
  }

  /**
   * Check if the current token has expired
   * @returns {boolean} True if token is expired or not set, false otherwise
   * @example
   * if (authMiddleware.isTokenExpired()) {
   *   // Request new token
   * }
   */
  isTokenExpired(): boolean {
    if (!this.token || !this.tokenExpiry) {
      return true;
    }
    return Date.now() >= this.tokenExpiry;
  }

  /**
   * Check if user is currently authenticated with a valid token
   * @returns {boolean} True if authenticated with valid token, false otherwise
   * @example
   * if (authMiddleware.isAuthenticated()) {
   *   // Proceed with authenticated request
   * }
   */
  isAuthenticated(): boolean {
    return Boolean(this.token && !this.isTokenExpired());
  }

  /**
   * Clear all authentication state including tokens and user information
   * @returns {void}
   * @example
   * authMiddleware.clearAuth(); // Logout
   */
  clearAuth(): void {
    this.token = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.user = null;
    logger.info('Authentication cleared');
  }

  /**
   * Set current user information
   * @param {Object} user - User object
   * @param {string} [user.email] - User email address
   * @param {string} [user.username] - Username
   * @param {string} [user.id] - User ID
   * @param {string} [user.role] - User role
   * @returns {void}
   * @example
   * authMiddleware.setUser({ email: 'user@example.com', role: 'admin' });
   */
  setUser(user: AuthUser): void {
    this.user = user;
    logger.info(`User set: ${user?.email || user?.username}`);
  }

  /**
   * Get current user information
   * @returns {Object|null} User object or null if not set
   * @example
   * const user = authMiddleware.getUser();
   * console.log(user?.email);
   */
  getUser(): AuthUser | null {
    return this.user;
  }

  /**
   * Add authentication header to request headers
   * @param {Object} [headers={}] - Existing headers object
   * @returns {Object} Headers object with Authorization header added
   * @example
   * const headers = authMiddleware.addAuthHeader({ 'Content-Type': 'application/json' });
   * // { 'Content-Type': 'application/json', 'Authorization': 'Bearer token...' }
   */
  addAuthHeader(headers: Record<string, string> = {}): Record<string, string> {
    const token = this.getToken();
    if (token) {
      return {
        ...headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return headers;
  }

  /**
   * Refresh authentication token using refresh token
   * @param refreshEndpoint - API endpoint for token refresh
   * @param apiClient - API client instance for making requests
   * @returns Promise resolving to new access token
   * @throws {Error} If refresh token is missing or refresh fails
   * @example
   * const newToken = await authMiddleware.refreshAuthToken('/auth/refresh', client);
   */
  async refreshAuthToken(refreshEndpoint: string, apiClient: ApiClient): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      logger.info('Refreshing authentication token');
      const response = await apiClient.post(refreshEndpoint, {
        refreshToken: this.refreshToken,
      });

      const { token, expiresIn, refreshToken } = response.data;
      if (token) {
        this.setToken(token, expiresIn);
      }

      if (refreshToken) {
        this.setRefreshToken(refreshToken);
      }

      logger.info('Token refreshed successfully');
      return token || '';
    } catch (error) {
      logger.error(
        `Failed to refresh token: ${error instanceof Error ? error.message : String(error)}`
      );
      this.clearAuth();
      throw error;
    }
  }

  /**
   * Handle authentication response and update middleware state
   * Extracts and sets token, refresh token, and user information from response
   * @param response - Authentication response from login/refresh endpoint
   * @returns void
   * @example
   * authMiddleware.handleAuthResponse(loginResponse);
   */
  handleAuthResponse(response: AuthResponse): void {
    const { token, refreshToken, expiresIn, user } = response.data;

    if (token) {
      this.setToken(token, expiresIn);
    }

    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }

    if (user) {
      this.setUser(user);
    }

    logger.info('Authentication response handled');
  }

  /**
   * Validate JWT token format (header.payload.signature)
   * @param token - Token string to validate
   * @returns True if token has valid JWT format, false otherwise
   * @example
   * if (authMiddleware.isValidTokenFormat(token)) { ... }
   */
  isValidTokenFormat(token: string | null): boolean {
    if (!token) {
      return false;
    }

    // Basic JWT format check (header.payload.signature)
    const parts = token.split('.');
    return parts.length === 3;
  }

  /**
   * Decode JWT token payload without verification
   * @param token - Token to decode (default: current token)
   * @returns Decoded token payload or null if invalid
   * @example
   * const payload = authMiddleware.decodeToken();
   * console.log(payload.sub, payload.exp);
   */
  decodeToken(token: string | null = this.token): Record<string, unknown> | null {
    if (!token || !this.isValidTokenFormat(token)) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString()) as Record<
        string,
        unknown
      >;
      return decoded;
    } catch (error) {
      logger.error(
        `Failed to decode token: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  /**
   * Get token claims from current token
   * @returns Token claims object or null if no valid token
   * @example
   * const claims = authMiddleware.getTokenClaims();
   * console.log(claims?.sub);
   */
  getTokenClaims(): Record<string, unknown> | null {
    return this.decodeToken();
  }

  /**
   * Get token expiry date as Date object
   * @returns Date object representing token expiration or null if not set
   * @example
   * const expiry = authMiddleware.getTokenExpiryDate();
   */
  getTokenExpiryDate() {
    if (!this.tokenExpiry) {
      return null;
    }
    return new Date(this.tokenExpiry);
  }

  /**
   * Get remaining time until token expires in seconds
   * @returns Number of seconds until expiry (0 if expired or not set)
   * @example
   * const remaining = authMiddleware.getTimeUntilExpiry();
   * console.log(`Token expires in ${remaining} seconds`);
   */
  getTimeUntilExpiry() {
    if (!this.tokenExpiry) {
      return 0;
    }
    return Math.max(0, Math.floor((this.tokenExpiry - Date.now()) / 1000));
  }

  /**
   * Check if token should be refreshed (expires in less than 5 minutes)
   * @returns True if token needs refresh, false otherwise
   * @example
   * if (authMiddleware.shouldRefreshToken()) {
   *   await authMiddleware.refreshAuthToken(endpoint, client);
   * }
   */
  shouldRefreshToken() {
    return this.getTimeUntilExpiry() < 300; // 5 minutes
  }

  /**
   * Serialize authentication state to JSON string for persistence
   * @returns JSON string containing token, refreshToken, expiry, and user data
   * @example
   * const state = authMiddleware.serialize();
   * localStorage.setItem('auth', state);
   */
  serialize() {
    return JSON.stringify({
      token: this.token,
      refreshToken: this.refreshToken,
      tokenExpiry: this.tokenExpiry,
      user: this.user,
    });
  }

  /**
   * Restore authentication state from serialized JSON string
   * @param data - Serialized auth state JSON string
   * @returns void
   * @example
   * const state = localStorage.getItem('auth');
   * authMiddleware.deserialize(state);
   */
  deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data) as {
        token: string | null;
        refreshToken: string | null;
        tokenExpiry: number | null;
        user: AuthUser | null;
      };
      this.token = parsed.token;
      this.refreshToken = parsed.refreshToken;
      this.tokenExpiry = parsed.tokenExpiry;
      this.user = parsed.user;
      logger.info('Authentication state restored');
    } catch (error) {
      logger.error(
        `Failed to restore auth state: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

/**
 * Singleton instance of AuthMiddleware
 * Provides centralized authentication state management
 * @example
 * import { authMiddleware } from '@middleware/auth/auth.middleware';
 * authMiddleware.setToken('token', 3600);
 */
const authMiddleware = new AuthMiddleware();

export { authMiddleware };
