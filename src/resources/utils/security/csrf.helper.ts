/**
 * @fileoverview CSRF (Cross-Site Request Forgery) protection utilities.
 * Provides token extraction, header building, and CSRF validation helpers.
 * @module validation-transform/security/csrf.helper
 */

import { logger } from '@utils/core';

/**
 * Extract CSRF token from HTML meta tag
 * @param html - HTML content to parse (default: '')
 * @param tokenName - Meta tag name attribute value (default: 'csrf-token')
 * @returns CSRF token value or null if not found
 * @example
 * const token = extractCsrfTokenFromHtml(pageContent, 'csrf-token');
 * if (token) headers['X-CSRF-Token'] = token;
 */
export const extractCsrfTokenFromHtml = (
  html: string = '',
  tokenName: string = 'csrf-token'
): string | null => {
  const metaRegex = new RegExp(
    `<meta[^>]+name=["']${tokenName}["'][^>]+content=["']([^"']+)["']`,
    'i'
  );
  const m = html.match(metaRegex);
  return m?.[1] || null;
};

/**
 * Extract CSRF token from cookies
 * @param cookies - Array of cookie objects (default: [])
 * @param names - Possible token cookie names (default: ['csrftoken', 'XSRF-TOKEN', '_csrf'])
 * @returns CSRF token value or null if not found
 * @example
 * const cookies = await context.cookies();
 * const token = extractCsrfTokenFromCookies(cookies);
 */
export const extractCsrfTokenFromCookies = (
  cookies: Array<{ name: string; value: string }> = [],
  names: string[] = ['csrftoken', 'XSRF-TOKEN', '_csrf']
): string | null => {
  const c = cookies.find((x: { name: string }) => names.includes(x.name));
  return c?.value || null;
};

/**
 * Build CSRF protection headers
 * @param token - CSRF token value
 * @param headerName - Header name for the token (default: 'X-CSRF-Token')
 * @returns Headers object with CSRF token
 * @example
 * const headers = buildCsrfHeaders(token, 'X-CSRF-Token');
 * await apiRequest.post('/api/save', { headers, data: payload });
 */
export const buildCsrfHeaders = (
  token: string,
  headerName: string = 'X-CSRF-Token'
): Record<string, string> => {
  return token ? { [headerName]: token } : {};
};

/**
 * Validate that CSRF protection is working (request without token should be rejected)
 * @param response - Response object with status/statusCode
 * @param expectedStatus - Expected rejection status codes (default: [403, 401])
 * @returns Validation result object
 * @example
 * const result = validateCsrfProtection(response);
 * expect(result.passed).toBe(true); // Request was properly rejected
 */
export const validateCsrfProtection = (
  response: { status?: number; statusCode?: number },
  expectedStatus: number[] = [403, 401]
): { passed: boolean; status: number | undefined } => {
  const status = response?.status || response?.statusCode;
  return { passed: expectedStatus.includes(status || 0), status };
};

/**
 * Verify that CSRF protection is required for state-changing operations
 * @param apiRequest - Playwright API request context
 * @param url - API endpoint URL
 * @param method - HTTP method (default: 'POST')
 * @param body - Request body (default: {})
 * @returns Promise resolving to validation result object
 * @example
 * const result = await verifyCsrfRequired(request, '/api/delete', 'DELETE');
 * expect(result.passed).toBe(true); // Request without token was rejected
 */
export const verifyCsrfRequired = async (
  apiRequest: {
    fetch: (
      url: string,
      options: { method: string; data: unknown }
    ) => Promise<{ status: () => number }>;
  },
  url: string,
  method: string = 'POST',
  body: unknown = {}
): Promise<{ passed: boolean; status?: number; error?: string }> => {
  try {
    const resp = await apiRequest.fetch(url, { method, data: body });
    return validateCsrfProtection({ status: resp.status() });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`verifyCsrfRequired failed: ${errorMessage}`);
    return { passed: false, error: errorMessage };
  }
};
