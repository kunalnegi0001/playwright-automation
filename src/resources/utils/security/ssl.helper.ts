/**
 * @fileoverview SSL/TLS validation and security checking utilities.
 * Validates certificates, TLS versions, secure cookies, and HTTPS protocol.
 * @module validation-transform/security/ssl.helper
 */

/**
 * Check if a URL uses HTTPS protocol
 * @param url - URL to validate (default: '')
 * @returns True if URL uses HTTPS
 * @example
 * const secure = isHttpsUrl('https://example.com');
 * expect(secure).toBe(true);
 */
export const isHttpsUrl = (url = '') => {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validate SSL/TLS certificate information
 * @param cert - Certificate object with validity dates (default: {})
 * @returns Validation result object
 * @example
 * const result = validateCertificateInfo(cert);
 * if (!result.passed) {
 *   console.error('Certificate issues:', result.errors);
 * }
 * console.log(`Certificate expires in ${result.daysRemaining} days`);
 */
export const validateCertificateInfo = (cert: Record<string, unknown> = {}) => {
  const now = Date.now();
  const notBefore = cert.valid_from ? new Date(cert.valid_from as string).getTime() : null;
  const notAfter = cert.valid_to ? new Date(cert.valid_to as string).getTime() : null;

  const errors = [];
  if (!notBefore || !notAfter) {
    errors.push('Missing certificate validity dates');
  }
  if (notBefore && now < notBefore) {
    errors.push('Certificate not yet valid');
  }
  if (notAfter && now > notAfter) {
    errors.push('Certificate expired');
  }

  return {
    passed: errors.length === 0,
    errors,
    daysRemaining: notAfter ? Math.floor((notAfter - now) / (1000 * 60 * 60 * 24)) : null,
  };
};

/**
 * Validate TLS version meets security standards
 * @param version - TLS version string (e.g., 'TLSv1.2', 'TLSv1.3') (default: '')
 * @returns Validation result object
 * @example
 * const result = validateTlsVersion('TLSv1.2');
 * expect(result.passed).toBe(true);
 */
export const validateTlsVersion = (version = '') => {
  const acceptable = ['TLSv1.2', 'TLSv1.3'];
  return { passed: acceptable.includes(version), version, acceptable };
};

/**
 * Validate that a cookie has secure attributes
 * @param cookie - Cookie object (default: {})
 * @returns Validation result object
 * @example
 * const result = validateSecureCookie(cookie);
 * if (!result.passed) {
 *   console.log('Cookie security issues:', result.errors);
 * }
 */
export const validateSecureCookie = (cookie: Record<string, unknown> = {}) => {
  const errors = [];
  if (!cookie.secure) {
    errors.push('Cookie missing Secure flag');
  }
  if (!cookie.httpOnly) {
    errors.push('Cookie missing HttpOnly flag');
  }
  if (!cookie.sameSite) {
    errors.push('Cookie missing SameSite flag');
  }
  return { passed: errors.length === 0, errors };
};
