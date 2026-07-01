/**
 * @fileoverview Winston-based centralized logging utility.
 * Provides structured logging with file rotation, error handling, and audit trails.
 * @module core/logger/logger
 */

import winston from 'winston';

/**
 * Logger Utility
 * Centralized logging with Winston supporting multiple transports and log levels
 * Automatically manages log rotation, exception handling, and audit logging
 * @class
 * @example
 * import logger from './logger';
 * logger.info('User action', { userId: '123', action: 'login' });
 * logger.error('Operation failed', new Error('Invalid input'));
 */
class Logger {
  logger: winston.Logger;

  constructor() {
    this.logger = this.createLogger();
  }

  /**
   * Create Winston logger instance with configured transports
   * @returns {winston.Logger} Configured logger instance
   * @private
   */
  createLogger(): winston.Logger {
    const logLevel = process.env.LOG_LEVEL || 'warn';

    const formats = [
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
    ];

    // Add colorization for console in development
    if (process.env.NODE_ENV !== 'production') {
      formats.push(winston.format.colorize());
    }

    const transports = [
      // Console transport
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      }),

      // File transports
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),

      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880,
        maxFiles: 5,
      }),
    ];

    return winston.createLogger({
      level: logLevel,
      format: winston.format.combine(...formats),
      transports,
      exceptionHandlers: [new winston.transports.File({ filename: 'logs/exceptions.log' })],
      rejectionHandlers: [new winston.transports.File({ filename: 'logs/rejections.log' })],
    });
  }

  /**
   * Log info level message
   * @param {string} message - Log message
   * @param {Object} [meta={}] - Additional metadata to log
   * @example
   * logger.info('User logged in', { userId: '123', email: 'user@example.com' });
   */
  info(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.info(message, { ...meta, timestamp: new Date().toISOString() });
  }

  /**
   * Log warning level message
   * @param {string} message - Warning message
   * @param {Object} [meta={}] - Additional metadata to log
   * @example
   * logger.warn('API rate limit approaching', { remaining: 10, limit: 100 });
   */
  warn(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.warn(message, { ...meta, timestamp: new Date().toISOString() });
  }

  /**
   * Log error level message with optional error object
   * @param {string} message - Error message
   * @param {Error|null} [error=null] - Error object with stack trace
   * @param {Object} [meta={}] - Additional metadata to log
   * @example
   * logger.error('Test failed', new Error('Timeout'), { testName: 'login' });
   */
  error(message: string, error: Error | unknown = null, meta: Record<string, unknown> = {}): void {
    const errorObj = error instanceof Error ? error : null;
    this.logger.error(message, {
      ...meta,
      error: errorObj
        ? {
            message: errorObj.message,
            stack: errorObj.stack,
            name: errorObj.name,
          }
        : error
          ? { value: String(error) }
          : null,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log debug level message (only in development)
   * @param {string} message - Debug message
   * @param {Object} [meta={}] - Additional metadata to log
   * @example
   * logger.debug('API response received', { status: 200, duration: 150 });
   */
  debug(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.debug(message, { ...meta, timestamp: new Date().toISOString() });
  }

  /**
   * Log test execution start with test metadata
   * @param {Object} testInfo - Playwright test info object
   * @param {string} testInfo.title - Test name
   * @param {string} testInfo.file - Test file path
   * @param {Object} [testInfo.project] - Project configuration
   * @param {number} [testInfo.retry] - Retry attempt number
   * @example
   * logger.logTestStart(testInfo);
   */
  logTestStart(testInfo: {
    title: string;
    file: string;
    project?: { name: string };
    retry: number;
  }): void {
    this.info('Test started', {
      testName: testInfo.title,
      testFile: testInfo.file,
      project: testInfo.project?.name,
      retry: testInfo.retry,
    });
  }

  /**
   * Log test execution end with result status
   * @param {Object} testInfo - Playwright test info object
   * @param {Object} result - Test result object
   * @param {string} result.status - Test status (passed/failed/skipped)
   * @param {number} result.duration - Test duration in milliseconds
   * @example
   * logger.logTestEnd(testInfo, { status: 'passed', duration: 1500 });
   */
  logTestEnd(
    testInfo: { title: string; retry: number },
    result: { status: string; duration: number }
  ): void {
    const logMethod = result.status === 'passed' ? 'info' : 'error';
    this[logMethod]('Test ended', {
      testName: testInfo.title,
      status: result.status,
      duration: result.duration,
      retry: testInfo.retry,
    });
  }

  /**
   * Log outgoing API request
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
   * @param {string} url - Request URL
   * @param {Object|null} [data=null] - Request payload
   * @example
   * logger.logAPIRequest('POST', '/api/users', { name: 'John', email: 'john@example.com' });
   */
  logAPIRequest(method: string, url: string, data: Record<string, unknown> | null = null): void {
    this.info('API Request', {
      method,
      url,
      data: data ? JSON.stringify(data) : null,
    });
  }

  /**
   * Log incoming API response
   * @param {string} url - Request URL
   * @param {number} status - HTTP status code
   * @param {Object|null} [data=null] - Response payload
   * @example
   * logger.logAPIResponse('/api/users/123', 200, { id: '123', name: 'John' });
   */
  logAPIResponse(url: string, status: number, data: Record<string, unknown> | null = null): void {
    const logMethod = status >= 400 ? 'error' : 'info';
    this[logMethod]('API Response', {
      url,
      status,
      data: data ? JSON.stringify(data) : null,
    });
  }
}

// Export singleton
const logger = new Logger();
export { logger };
