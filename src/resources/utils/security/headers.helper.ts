/**
 * @fileoverview Security headers validation and checking utilities.
 * Provides functions to validate CSP, HSTS, and other security headers.
 * @module validation-transform/security/headers.helper
 */

/**
 * Recommended security headers and their requirement status
 * @constant {Object<string, boolean>}
 * @property {boolean} content-security-policy - CSP header required
 * @property {boolean} x-content-type-options - MIME type sniffing prevention required
 * @property {boolean} x-frame-options - Clickjacking protection required
 * @property {boolean} referrer-policy - Referrer policy required
 * @property {boolean} strict-transport-security - HSTS required
 * @property {boolean} permissions-policy - Permissions policy optional
 */
export const RECOMMENDED_SECURITY_HEADERS = {
  'content-security-policy': true,
  'x-content-type-options': true,
  'x-frame-options': true,
  'referrer-policy': true,
  'strict-transport-security': true,
  'permissions-policy': false,
};

/**
 * Normalize header names to lowercase for case-insensitive comparison
 * @param headers - Headers object with any casing (default: {})
 * @returns Headers object with lowercase keys
 * @example
 * const normalized = normalizeHeaders({ 'Content-Type': 'text/html', 'X-Frame-Options': 'DENY' });
 * // Returns: { 'content-type': 'text/html', 'x-frame-options': 'DENY' }
 */
export const normalizeHeaders = (headers: Record<string, unknown> = {}) => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(headers)) {
    out[k.toLowerCase()] = v;
  }
  return out;
};

/**
 * Check if required security headers are present
 * @param headers - HTTP response headers (default: {})
 * @param policy - Security policy defining required headers (default: RECOMMENDED_SECURITY_HEADERS)
 * @returns Validation result object
 * @example
 * const result = checkSecurityHeaders(response.headers());
 * if (!result.passed) {
 *   console.log('Missing headers:', result.missing);
 * }
 */
export const checkSecurityHeaders = (
  headers: Record<string, unknown> = {},
  policy: Record<string, boolean> = RECOMMENDED_SECURITY_HEADERS
) => {
  const normalized = normalizeHeaders(headers);
  const missing: string[] = [];
  const present: string[] = [];

  for (const [header, required] of Object.entries(policy)) {
    if (normalized[header] !== undefined) {
      present.push(header);
    } else if (required) {
      missing.push(header);
    }
  }

  return { passed: missing.length === 0, missing, present };
};

/**
 * Validate Content Security Policy (CSP) header
 * @param headerValue - CSP header value (default: '')
 * @returns Validation result object
 * @example
 * const csp = validateCsp("default-src 'self'; script-src 'self'");
 * expect(csp.passed).toBe(true);
 * expect(csp.hasUnsafeInline).toBe(false);
 */
export const validateCsp = (headerValue = '') => {
  const directives = String(headerValue)
    .split(';')
    .map(d => d.trim())
    .filter(Boolean);
  const hasDefaultSrc = directives.some(d => d.startsWith('default-src'));
  const hasUnsafeInline = directives.some(d => /'unsafe-inline'/.test(d));
  return {
    passed: hasDefaultSrc && !hasUnsafeInline,
    hasDefaultSrc,
    hasUnsafeInline,
    directives,
  };
};

/**
 * Validate HTTP Strict Transport Security (HSTS) header
 * @param headerValue - HSTS header value (default: '')
 * @returns Validation result object
 * @example
 * const hsts = validateHsts('max-age=31536000; includeSubDomains; preload');
 * expect(hsts.passed).toBe(true);
 * expect(hsts.includeSubDomains).toBe(true);
 */
export const validateHsts = (headerValue = '') => {
  const maxAge = /max-age=(\d+)/i.exec(headerValue)?.[1];
  return {
    passed: Boolean(maxAge && Number(maxAge) >= 31536000),
    maxAge: maxAge ? Number(maxAge) : null,
    includeSubDomains: /includesubdomains/i.test(headerValue),
    preload: /preload/i.test(headerValue),
  };
};
