/**
 * @fileoverview Common type definitions for the testing framework.
 * Includes config, API, user, validation, retry, and cache types.
 * @module types/common
 */

// Config types
export type EnvironmentConfig = {
  baseURL: string;
  apiURL: string;
  graphqlURL: string;
  timeout: number;
  retries: number;
  features: Record<string, boolean>;
};

export type TestConfig = {
  environment: 'development' | 'staging' | 'production';
  browser: 'chromium' | 'firefox' | 'webkit';
  headless: boolean;
  screenshot: 'on' | 'off' | 'only-on-failure';
  video: 'on' | 'off' | 'retain-on-failure';
  trace: 'on' | 'off' | 'retain-on-failure';
};

// API types
export type APIResponse<T = any> = {
  status: number;
  statusText: string;
  data: T;
  headers: Record<string, string>;
  config?: any;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'asc' | 'desc';
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// User types
export type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
};

// Test data types
export type TestData = {
  [key: string]: any;
};

// Validation types
export type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings?: string[];
};

// Retry options
export type RetryOptions = {
  maxRetries?: number;
  delay?: number;
  backoffMultiplier?: number;
  timeout?: number;
  retryOn?: (_error: Error) => boolean;
};

// Cache options
export type CacheOptions = {
  ttl?: number;
  keyResolver?: (..._args: any[]) => string;
};

// Decorator return type
export type DecoratedFunction<T extends (..._args: any[]) => any> = T & {
  clearCache?: () => void;
  cacheSize?: () => number;
  pruneExpired?: () => void;
};
