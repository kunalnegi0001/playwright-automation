/**
 * @fileoverview Centralized logging middleware for test execution.
 * Provides structured logging functions for tests, API calls, database operations, and authentication.
 * @module middleware/logging/logging.middleware
 */

import { logger } from '@utils/core';

/**
 * Log test start with metadata
 * @param {string} testName - Name of the test
 * @param {Object} [metadata={}] - Additional test metadata
 * @example
 * logTestStart('User Login Test', { suite: 'Authentication', priority: 'high' });
 */
export const logTestStart = (testName: string, metadata: Record<string, unknown> = {}): void => {
  logger.info(`🧪 Test Started: ${testName}`, metadata);
};

/**
 * Log test completion with status and duration
 * @param {string} testName - Name of the test
 * @param {string} status - Test status ('passed' or 'failed')
 * @param {number|null} [duration=null] - Test duration in milliseconds
 * @example
 * logTestEnd('User Login Test', 'passed', 1250);
 */
export const logTestEnd = (
  testName: string,
  status: string,
  duration: number | null = null
): void => {
  const emoji = status === 'passed' ? '✅' : '❌';
  const durationMsg = duration ? ` (${duration}ms)` : '';
  logger.info(`${emoji} Test ${status}: ${testName}${durationMsg}`);
};

/**
 * Log individual test step execution
 * @param {string} stepName - Name of the step
 * @param {string} [action='executing'] - Action being performed
 */
export const logStep = (stepName: string, action: string = 'executing'): void => {
  logger.debug(`📍 Step ${action}: ${stepName}`);
};

/**
 * Log outgoing API call with details
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} url - Request URL
 * @param {Object} [options={}] - Request options
 * @param {Object} [options.headers] - Request headers
 * @param {any} [options.body] - Request body
 */
export const logApiCall = (
  method: string,
  url: string,
  options: { headers?: unknown; body?: unknown } = {}
): void => {
  logger.info(`🌐 API Call: ${method} ${url}`, {
    headers: options.headers,
    body: options.body,
  });
};

/**
 * Log API response with status and duration
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {number} status - HTTP status code
 * @param {number} duration - Response time in milliseconds
 */
export const logApiResponse = (
  method: string,
  url: string,
  status: number,
  duration: number
): void => {
  const emoji = status >= 200 && status < 300 ? '✅' : '❌';
  logger.info(`${emoji} API Response: ${method} ${url} - ${status} (${duration}ms)`);
};

/**
 * Log database operation
 * @param {string} operation - Database operation (SELECT, INSERT, UPDATE, DELETE)
 * @param {string} table - Table name
 * @param {string|null} [query=null] - SQL query
 */
export const logDbOperation = (
  operation: string,
  table: string,
  query: string | null = null
): void => {
  logger.debug(`🗄️  DB Operation: ${operation} on ${table}`, { query });
};

/**
 * Log authentication event
 * @param {string} event - Auth event type (login, logout, refresh, etc.)
 * @param {string|null} [user=null] - Username or user ID
 * @param {string|null} [provider=null] - Auth provider name
 */
export const logAuthEvent = (
  event: string,
  user: string | null = null,
  provider: string | null = null
): void => {
  const userInfo = user ? ` for ${user}` : '';
  const providerInfo = provider ? ` via ${provider}` : '';
  logger.info(`🔐 Auth Event: ${event}${userInfo}${providerInfo}`);
};

/**
 * Log navigation event to a URL
 * @param url - Destination URL
 * @param from - Optional source URL
 * @example
 * logNavigation('/dashboard', '/login');
 */
export const logNavigation = (url: string, from: string | null = null): void => {
  const fromInfo = from ? ` from ${from}` : '';
  logger.info(`🧭 Navigation: ${url}${fromInfo}`);
};

/**
 * Log test assertion result with expected and actual values
 * @param description - Assertion description
 * @param passed - Whether assertion passed
 * @param actual - Actual value (default: null)
 * @param expected - Expected value (default: null)
 * @example
 * logAssertion('Status code should be 200', true, 200, 200);
 */
export const logAssertion = (
  description: string,
  passed: boolean,
  actual: unknown = null,
  expected: unknown = null
): void => {
  const emoji = passed ? '✓' : '✗';
  const values =
    actual !== null && expected !== null ? ` (expected: ${expected}, actual: ${actual})` : '';
  logger.debug(`${emoji} Assertion: ${description}${values}`);
};

/**
 * Log error with stack trace and context
 * @param error - Error object or error-like object
 * @param context - Additional context data (default: {})
 * @example
 * logError(new Error('Failed'), { userId: '123', action: 'login' });
 */
export const logError = (
  error: Error | { message: string; stack?: string },
  context: Record<string, unknown> = {}
): void => {
  logger.error(`❌ Error: ${error.message}`, {
    stack: error.stack,
    ...context,
  });
};

/**
 * Log warning message with context
 * @param message - Warning message
 * @param context - Additional context data (default: {})
 * @example
 * logWarning('Slow response detected', { duration: 5000 });
 */
export const logWarning = (message: string, context: Record<string, unknown> = {}): void => {
  logger.warn(`⚠️  Warning: ${message}`, context);
};

/**
 * Log performance metric with optional threshold comparison
 * @param metric - Metric name
 * @param value - Metric value
 * @param threshold - Optional threshold for warning (default: null)
 * @example
 * logPerformance('Page Load Time', 1500, 2000);
 */
export const logPerformance = (
  metric: string,
  value: number,
  threshold: number | null = null
): void => {
  const emoji = threshold && value > threshold ? '⚠️' : '📊';
  const thresholdInfo = threshold ? ` (threshold: ${threshold})` : '';
  logger.info(`${emoji} Performance: ${metric} = ${value}${thresholdInfo}`);
};

/**
 * Log retry attempt for an operation
 * @param operation - Operation being retried
 * @param attempt - Current attempt number
 * @param maxAttempts - Maximum number of attempts
 * @example
 * logRetry('API call to /users', 2, 3);
 */
export const logRetry = (operation: string, attempt: number, maxAttempts: number): void => {
  logger.warn(`🔄 Retry attempt ${attempt}/${maxAttempts} for: ${operation}`);
};

/**
 * Log file operation (read, write, delete, etc.)
 * @param operation - Operation type (read, write, delete)
 * @param filePath - File path
 * @param success - Operation success status (default: true)
 * @example
 * logFileOperation('write', '/path/to/file.txt', true);
 */
export const logFileOperation = (
  operation: string,
  filePath: string,
  success: boolean = true
): void => {
  const emoji = success ? '📄' : '❌';
  logger.debug(`${emoji} File ${operation}: ${filePath}`);
};

/**
 * Log configuration loading event
 * @param environment - Environment name (development, staging, production)
 * @param source - Configuration source (file path, API, etc.)
 * @example
 * logConfigLoaded('production', 'config/prod.json');
 */
export const logConfigLoaded = (environment: string, source: string): void => {
  logger.info(`⚙️  Configuration loaded: ${environment} from ${source}`);
};

/**
 * Log cleanup operation for resources
 * @param resource - Resource being cleaned up
 * @param success - Cleanup success status (default: true)
 * @example
 * logCleanup('Temporary files', true);
 */
export const logCleanup = (resource: string, success: boolean = true): void => {
  const emoji = success ? '🧹' : '❌';
  logger.debug(`${emoji} Cleanup: ${resource}`);
};

/**
 * Performance logger for tracking operation duration
 * Measures time from creation to end() call with optional checkpoints
 * @class
 * @example
 * const perf = new PerformanceLogger('Database query');
 * // ... perform operation ...
 * perf.checkpoint('Query completed');
 * const duration = perf.end(); // logs duration
 */
export class PerformanceLogger {
  operation: string;
  startTime: number;

  constructor(operation: string) {
    this.operation = operation;
    this.startTime = Date.now();
    logger.debug(`⏱️  Started: ${operation}`);
  }

  /**
   * End performance logging and return duration
   * @returns Duration in milliseconds
   * @example
   * const duration = perf.end();
   */
  end(): number {
    const duration = Date.now() - this.startTime;
    logger.info(`⏱️  Completed: ${this.operation} in ${duration}ms`);
    return duration;
  }

  /**
   * Add a checkpoint to track intermediate progress
   * @param label - Checkpoint label
   * @example
   * perf.checkpoint('Data loaded');
   */
  checkpoint(label: string): void {
    const elapsed = Date.now() - this.startTime;
    logger.debug(`⏱️  Checkpoint "${label}": ${elapsed}ms elapsed`);
  }
}

/**
 * Test logger with context tracking for individual tests
 * Tracks test steps, timing, and provides contextual logging
 * @class
 * @example
 * const testLog = new TestLogger('User Login Test');
 * testLog.step('Navigate to login page');
 * testLog.info('Entering credentials');
 * const summary = testLog.getSummary();
 */
export class TestLogger {
  testName: string;
  startTime: number;
  steps: Array<{ name: string; timestamp: number }>;

  constructor(testName: string) {
    this.testName = testName;
    this.startTime = Date.now();
    this.steps = [];
  }

  /**
   * Log a test step with elapsed time
   * @param stepName - Step name or description
   * @example
   * testLog.step('Click login button');
   */
  step(stepName: string): void {
    const elapsed = Date.now() - this.startTime;
    this.steps.push({ name: stepName, timestamp: elapsed });
    logStep(stepName);
  }

  /**
   * Log info message with test context
   * @param message - Info message
   * @param data - Additional data (default: {})
   * @example
   * testLog.info('User created', { userId: '123' });
   */
  info(message: string, data: Record<string, unknown> = {}): void {
    logger.info(`[${this.testName}] ${message}`, data);
  }

  /**
   * Log error message with test context
   * @param message - Error message
   * @param error - Error object (default: null)
   * @example
   * testLog.error('Login failed', new Error('Invalid credentials'));
   */
  error(message: string, error: Error | null = null): void {
    logger.error(`[${this.testName}] ${message}`, { error: error?.message });
  }

  /**
   * Get test execution summary with duration and steps
   * @returns Summary object with test name, duration, and steps
   * @example
   * const summary = testLog.getSummary();
   * console.log(summary.duration, summary.steps.length);
   */
  getSummary(): {
    testName: string;
    duration: number;
    steps: Array<{ name: string; timestamp: number }>;
  } {
    const duration = Date.now() - this.startTime;
    return {
      testName: this.testName,
      duration,
      steps: this.steps,
    };
  }
}

/**
 * API logger for logging HTTP requests and responses
 * Provides contextual logging for API operations
 * @class
 * @example
 * const apiLog = new ApiLogger('https://api.example.com');
 * apiLog.logRequest('GET', '/users');
 * apiLog.logResponse('GET', '/users', 200, 150);
 */
export class ApiLogger {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Log API request with method and endpoint
   * @param method - HTTP method (GET, POST, etc.)
   * @param endpoint - API endpoint path
   * @param options - Optional request options (headers, body)
   * @example
   * apiLog.logRequest('POST', '/users', { body: userData });
   */
  logRequest(
    method: string,
    endpoint: string,
    options: { headers?: unknown; body?: unknown } = {}
  ): void {
    const url = `${this.baseUrl}${endpoint}`;
    logApiCall(method, url, options);
  }

  /**
   * Log API response with status and duration
   * @param method - HTTP method
   * @param endpoint - API endpoint path
   * @param status - HTTP status code
   * @param duration - Response time in milliseconds
   * @example
   * apiLog.logResponse('GET', '/users', 200, 150);
   */
  logResponse(method: string, endpoint: string, status: number, duration: number): void {
    const url = `${this.baseUrl}${endpoint}`;
    logApiResponse(method, url, status, duration);
  }

  /**
   * Log API error with status code
   * @param method - HTTP method
   * @param endpoint - API endpoint path
   * @param error - Error object with message and optional status
   * @example
   * apiLog.logError('POST', '/users', { message: 'Invalid data', status: 400 });
   */
  logError(method: string, endpoint: string, error: { message: string; status?: number }): void {
    const url = `${this.baseUrl}${endpoint}`;
    logger.error(`❌ API Error: ${method} ${url}`, {
      message: error.message,
      status: error.status,
    });
  }
}

/**
 * Create logging middleware for intercepting requests, responses, and errors
 * @returns Middleware object with onRequest, onResponse, and onError handlers
 * @example
 * const middleware = createLoggingMiddleware();
 * middleware.onRequest(request);
 * middleware.onResponse(response, 150);
 */
export const createLoggingMiddleware = (): {
  onRequest: (request: unknown) => void;
  onResponse: (response: unknown, duration: number) => void;
  onError: (error: Error, context: Record<string, unknown>) => void;
} => {
  return {
    onRequest: (request: unknown) => {
      const req = request as Record<string, unknown>;
      logApiCall((req.method as string) || '', (req.url as string) || '', {
        headers: req.headers,
        body: req.body,
      });
    },

    onResponse: (response: unknown, duration: number) => {
      const res = response as Record<string, unknown>;
      logApiResponse(
        (res.request as () => { method: () => string })().method(),
        (res.url as () => string)(),
        (res.status as () => number)(),
        duration
      );
    },

    onError: (error: Error, context: Record<string, unknown>) => {
      logError(error, context);
    },
  };
};
