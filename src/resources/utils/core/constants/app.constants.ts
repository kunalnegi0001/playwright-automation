/**
 * Application Constants
 * Central location for all application-wide constants
 */

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

/**
 * HTTP Methods
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
};

/**
 * Content Types
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM: 'application/x-www-form-urlencoded',
  MULTIPART: 'multipart/form-data',
  TEXT: 'text/plain',
  HTML: 'text/html',
  XML: 'application/xml',
  PDF: 'application/pdf',
};

/**
 * User Roles
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  GUEST: 'guest',
};

/**
 * User Status
 */
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
};

/**
 * Order Status
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

/**
 * Payment Methods
 */
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PAYPAL: 'paypal',
  STRIPE: 'stripe',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
};

/**
 * Payment Status
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
};

/**
 * Environment Names
 */
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
};

/**
 * Browser Names
 */
export const BROWSERS = {
  CHROMIUM: 'chromium',
  FIREFOX: 'firefox',
  WEBKIT: 'webkit',
  CHROME: 'chrome',
  EDGE: 'edge',
  SAFARI: 'safari',
};

/**
 * Test Priorities
 */
export const TEST_PRIORITIES = {
  CRITICAL: 'P0',
  HIGH: 'P1',
  MEDIUM: 'P2',
  LOW: 'P3',
};

/**
 * Test Tags
 */
export const TEST_TAGS = {
  SMOKE: '@smoke',
  REGRESSION: '@regression',
  SANITY: '@sanity',
  E2E: '@e2e',
  API: '@api',
  VISUAL: '@visual',
  A11Y: '@a11y',
  PERFORMANCE: '@performance',
  SECURITY: '@security',
  LOGIN: '@login',
  CHECKOUT: '@checkout',
  CART: '@cart',
};

/**
 * Keyboard Keys
 */
export const KEYS = {
  ENTER: 'Enter',
  ESC: 'Escape',
  TAB: 'Tab',
  SPACE: 'Space',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
};

/**
 * Wait Times (milliseconds)
 */
export const WAIT_TIMES = {
  INSTANT: 100,
  VERY_SHORT: 500,
  SHORT: 1000,
  MEDIUM: 3000,
  LONG: 5000,
  VERY_LONG: 10000,
  EXTRA_LONG: 30000,
};

/**
 * Retry Attempts
 */
export const RETRY_ATTEMPTS = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  VERY_HIGH: 5,
};

/**
 * File Extensions
 */
export const FILE_EXTENSIONS = {
  IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
  ARCHIVES: ['zip', 'rar', '7z', 'tar', 'gz'],
  VIDEOS: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
  AUDIO: ['mp3', 'wav', 'ogg', 'flac', 'm4a'],
};

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  US: 'MM/DD/YYYY',
  EU: 'DD/MM/YYYY',
  FULL: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm:ss',
  TIMESTAMP: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
};

/**
 * Regex Patterns
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE_US: /^\+?1?\d{10}$/,
  ZIP_CODE_US: /^\d{5}(-\d{4})?$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  CREDIT_CARD: /^\d{13,19}$/,
  HEX_COLOR: /^#[0-9A-F]{6}$/i,
  IPV4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NUMERIC: /^\d+$/,
  ALPHA: /^[a-zA-Z]+$/,
};

/**
 * API Endpoints (relative paths)
 */
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  REFRESH_TOKEN: '/auth/refresh',

  // Users
  USERS: '/users',
  USER_BY_ID: (id: string | number) => `/users/${id}`,
  USER_PROFILE: '/users/me',

  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string | number) => `/products/${id}`,
  PRODUCT_CATEGORIES: '/products/categories',

  // Orders
  ORDERS: '/orders',
  ORDER_BY_ID: (id: string | number) => `/orders/${id}`,
  USER_ORDERS: (userId: string | number) => `/users/${userId}/orders`,

  // Cart
  CART: '/cart',
  CART_ITEMS: '/cart/items',
  ADD_TO_CART: '/cart/add',
  REMOVE_FROM_CART: (itemId: string | number) => `/cart/remove/${itemId}`,
};

/**
 * SSO Providers
 */
export const SSO_PROVIDERS = {
  OKTA: 'okta',
  AUTH0: 'auth0',
  AZURE_AD: 'azure-ad',
  GOOGLE: 'google',
  GITHUB: 'github',
  SAML: 'saml',
};

/**
 * Log Levels
 */
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace',
};

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORDS_NOT_MATCH: 'Passwords do not match',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_WEAK:
    'Password must be at least 8 characters and contain uppercase, lowercase, number and special character',
  NETWORK_ERROR: 'Network error occurred',
  SERVER_ERROR: 'Server error occurred',
  TIMEOUT: 'Request timeout',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
};

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  ORDER_PLACED: 'Order placed successfully',
  ITEM_ADDED_TO_CART: 'Item added to cart',
  ITEM_REMOVED_FROM_CART: 'Item removed from cart',
};
