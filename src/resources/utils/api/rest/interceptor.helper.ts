/**
 * @fileoverview API request/response interception and mocking utilities.
 * Provides route mocking, request modification, response simulation, and network condition testing.
 * @module api-testing/rest/interceptor.helper
 */

import type { Page, Route } from '@playwright/test';
import { logger } from '@utils/core';

/**
 * Convert glob pattern to regular expression for URL matching
 * @param globPattern - Glob pattern string (supports ** for multi-level wildcards)
 * @returns Regular expression for pattern matching
 * @throws {Error} When pattern is invalid
 * @example
 * const regex = globToRegExp('** /path/to/resource/*');
 * console.log(regex.test('https://example.com/path/to/resource/123')); // true
 */
export const globToRegExp = (globPattern = '') => {
  const escaped = globPattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '§§DOUBLE_STAR§§')
    .replace(/\*/g, '[^/]*')
    .replace(/§§DOUBLE_STAR§§/g, '.*');

  return new RegExp(`^${escaped}$`);
};

/**
 * Check if URL matches the given glob pattern
 * @param url - URL string to test
 * @param pattern - Glob pattern to match against
 * @returns True if URL matches pattern, false otherwise
 * @example
 * const matches = matchesUrlPattern('https://example.com/path/to/resource/123', '** /path/to/resource/*');
 * console.log(matches); // true
 */
export const matchesUrlPattern = (url: string, pattern: string): boolean => {
  try {
    return globToRegExp(pattern).test(url);
  } catch {
    return false;
  }
};

/**
 * Build fulfill body for route interception response
 * @param body - Response body data (object, string, or null)
 * @returns String representation of body for Playwright route.fulfill()
 * @example
 * const bodyStr = buildFulfillBody({ id: 1, name: 'John' });
 * console.log(bodyStr); // '{"id":1,"name":"John"}'
 */
export const buildFulfillBody = (body: unknown): string => {
  if (body === null || body === undefined) {
    return '';
  }
  if (typeof body === 'string') {
    return body;
  }
  return JSON.stringify(body);
};

/**
 * @fileoverview API request/response interception and mocking helpers
 * Provides utilities for mocking responses, modifying requests, and simulating network conditions
 * @module interceptor.helper
 */

/**
 * Setup route interception with mock response
 * @param {Object} page - Playwright page object
 * @param {string} urlPattern - URL pattern to intercept (supports wildcards)
 * @param {Object} mockResponse - Mock response data
 * @param {number} mockResponse.status - HTTP status code (default: 200)
 * @param {Object} mockResponse.body - Response body
 * @param {Object} mockResponse.headers - Response headers
 * @param {number} mockResponse.delay - Response delay in ms (default: 0)
 * @returns {Promise<void>}
 * @example
 * await mockResponse(page, '**\\/api/users', {
 *   status: 200,
 *   body: [{ id: 1, name: 'John' }],
 *   headers: { 'content-type': 'application/json' }
 * });
 */
export const mockResponse = async (
  page: Page,
  urlPattern: string,
  mockResponse: {
    status?: number;
    body?: unknown;
    headers?: Record<string, string>;
    delay?: number;
  } = {}
): Promise<void> => {
  const { status = 200, body = {}, headers = {}, delay = 0 } = mockResponse;

  try {
    await page.route(urlPattern, async (route: Route) => {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      await route.fulfill({
        status,
        body: buildFulfillBody(body),
        headers: {
          'content-type': 'application/json',
          ...headers,
        },
      });
    });

    logger.info(`Mock response setup for pattern: ${urlPattern}`);
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Failed to setup mock response: ${errorMessage}`);
    throw error;
  }
};

/**
 * Intercept and modify request headers
 * @param {Object} page - Playwright page object
 * @param {string} urlPattern - URL pattern to intercept
 * @param {Object} headersToAdd - Headers to add/modify
 * @returns {Promise<void>}
 * @example
 * await modifyRequestHeaders(page, '**\\/api/**', {
 *   'Authorization': 'Bearer test-token',
 *   'X-Custom-Header': 'test-value'
 * });
 */
export const modifyRequestHeaders = async (
  page: Page,
  urlPattern: string,
  headersToAdd: Record<string, string> = {}
): Promise<void> => {
  try {
    await page.route(urlPattern, async (route: Route) => {
      const request = route.request();
      await route.continue({
        headers: {
          ...request.headers(),
          ...headersToAdd,
        },
      });
    });

    logger.info(`Request header modification setup for: ${urlPattern}`);
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Failed to modify request headers: ${errorMessage}`);
    throw error;
  }
};

/**
 * Intercept and modify response
 * @param {Object} page - Playwright page object
 * @param {string} urlPattern - URL pattern to intercept
 * @param {Function} modifyFn - Function to modify response body
 * @returns {Promise<void>}
 * @example
 * await modifyResponse(page, '**\\/api/users', (data) => {
 *   return data.map(user => ({ ...user, modified: true }));
 * });
 */
export const modifyResponse = async (
  page: Page,
  urlPattern: string,
  modifyFn: (
    parsedBody: unknown,
    context: { isJSON: boolean; url: string; method: string; status: number }
  ) => Promise<unknown> | unknown
): Promise<void> => {
  try {
    await page.route(urlPattern, async (route: Route) => {
      const response = await route.fetch();
      const originalBody = await response.text();

      let parsedBody: unknown = originalBody;
      let isJSON = false;
      try {
        parsedBody = JSON.parse(originalBody) as unknown;
        isJSON = true;
      } catch {
        // keep string body as-is
      }

      const modifiedBody = await modifyFn(parsedBody, {
        isJSON,
        url: route.request().url(),
        method: route.request().method(),
        status: response.status(),
      });

      await route.fulfill({
        response,
        body: isJSON ? JSON.stringify(modifiedBody) : String(modifiedBody),
      });
    });

    logger.info(`Response modification setup for: ${urlPattern}`);
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Failed to modify response: ${errorMessage}`);
    throw error;
  }
};

/**
 * Block specific requests
 * @param {Object} page - Playwright page object
 * @param {Array<string>} urlPatterns - Array of URL patterns to block
 * @returns {Promise<void>}
 * @example
 * await blockRequests(page, ['**\\/*.png', '**\\/*.jpg', '**\\/analytics/**']);
 */
export const blockRequests = async (page: Page, urlPatterns: string[] = []): Promise<void> => {
  try {
    await page.route('**/*', async (route: Route) => {
      const url = route.request().url();
      const shouldBlock = urlPatterns.some(pattern => matchesUrlPattern(url, pattern));

      if (shouldBlock) {
        await route.abort();
      } else {
        await route.continue();
      }
    });

    logger.info(`Request blocking setup for ${urlPatterns.length} patterns`);
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Failed to block requests: ${errorMessage}`);
    throw error;
  }
};

/**
 * Simulate network failure for specific requests
 * @param {Object} page - Playwright page object
 * @param {string} urlPattern - URL pattern to fail
 * @param {Object} options - Failure options
 * @param {string} options.errorCode - Error code: 'failed', 'aborted', 'timedout' (default: 'failed')
 * @returns {Promise<void>}
 * @example
 * await simulateNetworkFailure(page, '**\\/api/submit', { errorCode: 'timedout' });
 */
export const simulateNetworkFailure = async (
  page: Page,
  urlPattern: string,
  options: { errorCode?: string } = {}
): Promise<void> => {
  const { errorCode = 'failed' } = options;

  try {
    await page.route(urlPattern, (route: Route) => {
      route.abort(errorCode);
    });

    logger.info(`Network failure simulation setup for: ${urlPattern}`);
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Failed to simulate network failure: ${errorMessage}`);
    throw error;
  }
};

/**
 * Simulate slow network by adding delay to responses
 * @param {Object} page - Playwright page object
 * @param {string} urlPattern - URL pattern to delay
 * @param {number} delay - Delay in milliseconds
 * @returns {Promise<void>}
 * @example
 * await simulateSlowNetwork(page, '**\\/api/**', 3000); // 3 second delay
 */
export const simulateSlowNetwork = async (
  page: Page,
  urlPattern: string,
  delay = 1000
): Promise<void> => {
  try {
    await page.route(urlPattern, async (route: Route) => {
      await new Promise(resolve => setTimeout(resolve, delay));
      await route.continue();
    });

    logger.info(`Slow network simulation setup: ${delay}ms delay for ${urlPattern}`);
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Failed to simulate slow network: ${errorMessage}`);
    throw error;
  }
};

/**
 * Capture all requests matching pattern
 * @param {Object} page - Playwright page object
 * @param {string} urlPattern - URL pattern to capture
 * @returns {Promise<Array>} Array to store captured requests
 * @example
 * const requests = await captureRequests(page, '**\\/api/**');
 * // Perform actions
 * console.log(requests); // All captured requests
 */
export const captureRequests = async (
  page: Page,
  urlPattern: string
): Promise<
  Array<{
    url: string;
    method: string;
    headers: Record<string, string>;
    postData: string | null;
    timestamp: number;
  }>
> => {
  const capturedRequests: Array<{
    url: string;
    method: string;
    headers: Record<string, string>;
    postData: string | null;
    timestamp: number;
  }> = [];

  try {
    await page.route(urlPattern, async (route: Route) => {
      const request = route.request();
      capturedRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
        timestamp: Date.now(),
      });
      await route.continue();
    });

    logger.info(`Request capture setup for: ${urlPattern}`);
    return capturedRequests;
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Failed to capture requests: ${errorMessage}`);
    throw error;
  }
};

/**
 * Mock GraphQL responses based on operation name
 * @param {Object} page - Playwright page object
 * @param {string} endpoint - GraphQL endpoint URL pattern
 * @param {Object} mocks - Object mapping operation names to mock data
 * @returns {Promise<void>}
 * @example
 * await mockGraphQLResponse(page, '**\\/graphql', {
 *   GetUser: { data: { user: { id: 1, name: 'John' } } },
 *   GetPosts: { data: { posts: [] } }
 * });
 */
export const mockGraphQLResponse = async (
  page: Page,
  endpoint: string,
  mocks: Record<string, unknown> = {}
): Promise<void> => {
  try {
    await page.route(endpoint, async (route: Route) => {
      const request = route.request();
      const postData = request.postData();

      if (postData) {
        try {
          const body = JSON.parse(postData) as Record<string, unknown>;
          const operationName = body.operationName as string;

          if (operationName && mocks[operationName]) {
            await route.fulfill({
              status: 200,
              body: JSON.stringify(mocks[operationName]),
              headers: { 'content-type': 'application/json' },
            });
            return;
          }
        } catch (parseError) {
          const errorMessage = (parseError as Error).message;
          logger.warn(`Failed to parse GraphQL request: ${errorMessage}`);
        }
      }

      await route.continue();
    });

    logger.info(`GraphQL mock setup for ${Object.keys(mocks).length} operations`);
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Failed to setup GraphQL mock: ${errorMessage}`);
    throw error;
  }
};

/**
 * Wait for specific request to complete
 * @param {Object} page - Playwright page object
 * @param {string} urlPattern - URL pattern to wait for
 * @param {Object} options - Wait options
 * @param {number} options.timeout - Timeout in ms (default: 30000)
 * @returns {Promise<Object>} Request details
 * @example
 * const request = await waitForRequest(page, '**\\/api/submit');
 * console.log(request.url, request.method);
 */
export const waitForRequest = async (
  page: Page,
  urlPattern: string,
  options: { timeout?: number } = {}
): Promise<{
  url: string;
  method: string;
  headers: Record<string, string>;
  postData: string | null;
}> => {
  const { timeout = 30000 } = options;

  try {
    const request = await page.waitForRequest(req => matchesUrlPattern(req.url(), urlPattern), {
      timeout,
    });

    logger.info(`Request captured: ${request.url()}`);
    return {
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      postData: request.postData(),
    };
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Failed to wait for request: ${errorMessage}`);
    throw error;
  }
};

/**
 * Wait for specific response to complete
 * @param {Object} page - Playwright page object
 * @param {string} urlPattern - URL pattern to wait for
 * @param {Object} options - Wait options
 * @param {number} options.timeout - Timeout in ms (default: 30000)
 * @returns {Promise<Object>} Response details
 * @example
 * const response = await waitForResponse(page, '**\\/api/data');
 * console.log(response.status, response.body);
 */
export const waitForResponse = async (
  page: Page,
  urlPattern: string,
  options: { timeout?: number } = {}
): Promise<{ url: string; status: number; headers: Record<string, string>; body: unknown }> => {
  const { timeout = 30000 } = options;

  try {
    const response = await page.waitForResponse(resp => matchesUrlPattern(resp.url(), urlPattern), {
      timeout,
    });

    const body: unknown = await response.json().catch(() => response.text());

    logger.info(`Response captured: ${response.url()}`);
    return {
      url: response.url(),
      status: response.status(),
      headers: response.headers(),
      body,
    };
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Failed to wait for response: ${errorMessage}`);
    throw error;
  }
};

/**
 * Clear previously registered interceptors
 * @param {Object} page - Playwright page object
 * @param {string|RegExp|Function} urlPattern - Pattern used for page.unroute (default: all routes)
 * @returns {Promise<void>}
 * @example
 * await clearInterceptors(page); // remove all route handlers
 */
export const clearInterceptors = async (
  page: Page,
  urlPattern: string | RegExp | ((url: URL) => boolean) = '**/*'
): Promise<void> => {
  try {
    await page.unroute(urlPattern);
    logger.info('Interceptors cleared successfully');
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Failed to clear interceptors: ${errorMessage}`);
    throw error;
  }
};
