/**
 * Test execution related errors
 */

import { BaseError, BaseErrorOptions } from './base-error';

/**
 * Error thrown during test execution
 */
export class TestError extends BaseError {
  constructor(message: string, code: string = 'TEST_ERROR', options: BaseErrorOptions = {}) {
    super(message, code, {
      severity: 'high',
      classification: 'fatal',
      ...options,
    });
  }
}

/**
 * Error thrown when test setup fails
 */
export class TestSetupError extends TestError {
  constructor(message: string, options: BaseErrorOptions = {}) {
    super(message, 'TEST_SETUP_ERROR', {
      severity: 'high',
      classification: 'configuration',
      ...options,
    });
  }
}

/**
 * Error thrown when test teardown fails
 */
export class TestTeardownError extends TestError {
  constructor(message: string, options: BaseErrorOptions = {}) {
    super(message, 'TEST_TEARDOWN_ERROR', {
      severity: 'medium',
      classification: 'transient',
      ...options,
    });
  }
}

/**
 * Error thrown when test timesout
 */
export class TestTimeoutError extends TestError {
  constructor(message: string, timeoutMs: number, options: BaseErrorOptions = {}) {
    super(`${message} (timeout: ${timeoutMs}ms)`, 'TEST_TIMEOUT_ERROR', {
      severity: 'high',
      classification: 'retryable',
      context: {
        ...options.context,
        metadata: {
          ...options.context?.metadata,
          timeoutMs,
        },
      },
      ...options,
    });
  }
}

/**
 * Error thrown when assertion fails
 */
export class AssertionError extends TestError {
  constructor(message: string, expected: unknown, actual: unknown, options: BaseErrorOptions = {}) {
    super(message, 'ASSERTION_ERROR', {
      severity: 'high',
      classification: 'fatal',
      context: {
        ...options.context,
        metadata: {
          ...options.context?.metadata,
          expected,
          actual,
        },
      },
      ...options,
    });
  }
}

/**
 * Error thrown when test data is invalid or missing
 */
export class TestDataError extends TestError {
  constructor(message: string, options: BaseErrorOptions = {}) {
    super(message, 'TEST_DATA_ERROR', {
      severity: 'high',
      classification: 'configuration',
      ...options,
    });
  }
}

/**
 * Error thrown when element is not found or not interactive
 */
export class ElementError extends TestError {
  constructor(message: string, selector?: string, options: BaseErrorOptions = {}) {
    super(message, 'ELEMENT_ERROR', {
      severity: 'high',
      classification: 'retryable',
      context: {
        ...options.context,
        metadata: {
          ...options.context?.metadata,
          selector,
        },
      },
      ...options,
    });
  }
}

/**
 * Error thrown when page navigation fails
 */
export class NavigationError extends TestError {
  constructor(message: string, url?: string, options: BaseErrorOptions = {}) {
    super(message, 'NAVIGATION_ERROR', {
      severity: 'high',
      classification: 'retryable',
      context: {
        ...options.context,
        metadata: {
          ...options.context?.metadata,
          url,
        },
      },
      ...options,
    });
  }
}
