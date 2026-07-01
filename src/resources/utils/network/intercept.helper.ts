/**
 * @fileoverview Network interception and mocking helper functions.
 * Provides utilities for intercepting, mocking, and modifying HTTP requests and responses.
 * @module network/intercept.helper
 */

import type { Page, Route, Request, Response } from '@playwright/test';
import { logger } from '@utils/core';
import { globToRegExp } from '@utils/api/rest';

/**
 * Network mock response configuration
 */
export type NetworkMockConfig = {
  /** HTTP status code (default: 200) */
  status?: number;
  /** Response body (object will be JSON stringified) */
  body?: unknown;
  /** HTTP response headers */
  headers?: Record<string, string>;
  /** Artificial delay in milliseconds before response */
  delayMs?: number;
};

/**
 * Network request information
 */
export type NetworkRequestInfo = {
  /** Request URL */
  url: string;
  /** HTTP method (GET, POST, etc.) */
  method: string;
  /** Request headers */
  headers: Record<string, string>;
  /** POST/PUT request body data */
  postData?: string | null;
};

/**
 * Network response metadata
 */
export type NetworkResponseMetadata = {
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers: Record<string, string>;
  /** Response URL */
  url: string;
};

/**
 * Captured network request with timestamp
 */
export type NetworkCapturedRequest = {
  /** Request URL */
  url: string;
  /** HTTP method */
  method: string;
  /** Request headers */
  headers: Record<string, string>;
  /** POST data if present */
  postData?: string | null;
  /** Unix timestamp when request was captured */
  timestamp: number;
};

/**
 * Captured network response with timestamp
 */
export type NetworkCapturedResponse = {
  /** Response URL */
  url: string;
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers: Record<string, string>;
  /** Unix timestamp when response was captured */
  timestamp: number;
};

/**
 * Network traffic capture result with stop function
 */
export type NetworkTrafficCapture = {
  /** Array of captured requests */
  requests: NetworkCapturedRequest[];
  /** Array of captured responses */
  responses: NetworkCapturedResponse[];
  /** Stop capturing and return final results */
  stop: () => { requests: NetworkCapturedRequest[]; responses: NetworkCapturedResponse[] };
};

/**
 * Check if a URL matches a glob pattern
 * @export
 * @param url - URL to test
 * @param pattern - Glob pattern to match against
 * @returns True if URL matches pattern
 * @example
 * matchesUrl('https://api.example.com/users', 'double-star/users');
 * matchesUrl('https://api.example.com/products', 'double-star/users');
 */
export const matchesUrl = (url: string, pattern: string): boolean => {
  try {
    return globToRegExp(pattern).test(url);
  } catch {
    return false;
  }
};

/**
 * Intercept network requests and return mock responses
 * @export
 * @async
 * @param page - Playwright page object
 * @param urlPattern - URL pattern to intercept (glob or RegExp)
 * @param mock - Mock response configuration
 * @returns Promise<void>
 * @example
 * await interceptAndMock(page, 'double-star/api/users', {
 *   status: 200,
 *   body: [{ id: 1, name: 'John' }],
 *   delayMs: 500
 * });
 */
export const interceptAndMock = async (
  page: Page,
  urlPattern: string | RegExp,
  mock: NetworkMockConfig = {}
): Promise<void> => {
  const {
    status = 200,
    body = {},
    headers = { 'content-type': 'application/json' },
    delayMs = 0,
  } = mock;
  await page.route(urlPattern, async (route: Route) => {
    if (delayMs > 0) {
      await new Promise(r => setTimeout(r, delayMs));
    }
    await route.fulfill({
      status,
      headers,
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
  });
};

/**
 * Intercept and modify outgoing requests before they're sent
 * @export
 * @async
 * @param page - Playwright page object
 * @param urlPattern - URL pattern to intercept
 * @param modifyFn - Function to modify request (receives request object, returns modifications)
 * @returns Promise<void>
 * @example
 * await interceptAndModifyRequest(page, 'double-star/api/double-star', async (req) => {
 *   return {
 *     headers: { ...req.headers, 'X-Custom': 'value' },
 *     url: req.url.replace('v1', 'v2')
 *   };
 * });
 */
export const interceptAndModifyRequest = async (
  page: Page,
  urlPattern: string | RegExp,
  modifyFn: (req: NetworkRequestInfo) => Promise<Partial<NetworkRequestInfo>>
): Promise<void> => {
  await page.route(urlPattern, async (route: Route) => {
    const req = route.request();
    const mutation = await modifyFn({
      url: req.url(),
      method: req.method(),
      headers: req.headers(),
      postData: req.postData(),
    });

    await route.continue({
      ...(mutation?.url ? { url: mutation.url } : {}),
      ...(mutation?.method
        ? { method: mutation.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' }
        : {}),
      ...(mutation?.headers ? { headers: mutation.headers } : {}),
      ...(mutation?.postData ? { postData: mutation.postData } : {}),
    });
  });
};

/**
 * Intercept and modify responses before they reach the page
 * @export
 * @async
 * @param page - Playwright page object
 * @param urlPattern - URL pattern to intercept
 * @param modifyFn - Function to modify response (receives response body and metadata, returns modified body)
 * @returns Promise<void>
 * @example
 * await interceptAndModifyResponse(page, 'double-star/api/users', async (body, meta) => {
 *   // Add extra field to each user
 *   return body.map(user => ({ ...user, enhanced: true }));
 * });
 */
export const interceptAndModifyResponse = async (
  page: Page,
  urlPattern: string | RegExp,
  modifyFn: (payload: unknown, meta: NetworkResponseMetadata) => Promise<unknown>
): Promise<void> => {
  await page.route(urlPattern, async (route: Route) => {
    const response = await route.fetch();
    const text = await response.text();

    let payload: unknown = text;
    let isJson = false;
    try {
      payload = JSON.parse(text) as unknown;
      isJson = true;
    } catch {
      // no-op
    }

    const modified = await modifyFn(payload, {
      status: response.status(),
      headers: response.headers(),
      url: route.request().url(),
    });

    await route.fulfill({
      response,
      body: isJson ? JSON.stringify(modified) : String(modified),
    });
  });
};

/**
 * Capture network requests and responses matching a pattern
 * Returns an object with collected requests and responses
 * @export
 * @async
 * @param page - Playwright page object
 * @param pattern - Glob pattern to match URLs
 * @returns Promise with network traffic capture object
 * @example
 * const traffic = await captureNetworkTraffic(page, 'double-star/api/double-star');
 * // Later...
 * console.log('Captured', traffic.requests.length, 'requests');
 * traffic.stop(); // Stop capturing
 */
export const captureNetworkTraffic = async (
  page: Page,
  pattern = '**/*'
): Promise<NetworkTrafficCapture> => {
  const requests: NetworkCapturedRequest[] = [];
  const responses: NetworkCapturedResponse[] = [];

  const onRequest = (req: Request) => {
    if (matchesUrl(req.url(), pattern)) {
      requests.push({
        url: req.url(),
        method: req.method(),
        headers: req.headers(),
        postData: req.postData(),
        timestamp: Date.now(),
      });
    }
  };

  const onResponse = async (res: Response) => {
    if (matchesUrl(res.url(), pattern)) {
      responses.push({
        url: res.url(),
        status: res.status(),
        headers: res.headers(),
        timestamp: Date.now(),
      });
    }
  };

  page.on('request', onRequest);
  page.on('response', onResponse);

  return {
    requests,
    responses,
    stop: () => {
      page.off('request', onRequest);
      page.off('response', onResponse);
      logger.info(`Captured traffic: ${requests.length} requests, ${responses.length} responses`);
      return { requests, responses };
    },
  };
};

/**
 * Block network requests by resource type (e.g., images, fonts)
 * @param page - Playwright page object
 * @param resourceTypes - Array of resource types to block (default: ['image', 'font'])
 * @returns Promise<void>
 * @example
 * await blockByResourceType(page, ['image', 'font', 'media']);
 */
export const blockByResourceType = async (
  page: Page,
  resourceTypes: string[] = ['image', 'font']
): Promise<void> => {
  await page.route('**/*', async (route: Route) => {
    const type = route.request().resourceType();
    if (resourceTypes.includes(type)) {
      return route.abort();
    }
    return route.continue();
  });
};
