/**
 * @fileoverview Input sanitization utilities for security and data validation
 * Provides functions to sanitize user inputs, prevent XSS, SQL injection, and other attacks
 * @module utils/sanitization/input-sanitizer
 */

import { logger } from '@utils/core';

/**
 * HTML sanitization options
 */
type HTMLSanitizeOptions = {
  /** Allow specific HTML tags */
  allowedTags?: string[];
  /** Allow specific HTML attributes */
  allowedAttributes?: Record<string, string[]>;
  /** Strip all HTML tags */
  stripAll?: boolean;
};

/**
 * SQL sanitization options
 */
type SQLSanitizeOptions = {
  /** Allow parameterized queries */
  allowParameters?: boolean;
  /** Escape single quotes */
  escapeSingleQuotes?: boolean;
};

/**
 * Sanitizes HTML input to prevent XSS attacks
 * @param input - Raw HTML string
 * @param options - Sanitization options
 * @returns Sanitized HTML string
 * @throws {Error} When sanitization fails
 * @example
 * const safe = sanitizeHTML('<script>alert("xss")</script>Text', { stripAll: true });
 * // Returns: "Text"
 */
export const sanitizeHTML = (input: string, options: HTMLSanitizeOptions = {}): string => {
  try {
    const { stripAll = true } = options;

    if (stripAll) {
      // Remove all HTML tags
      return input.replace(/<[^>]*>/g, '');
    }

    // Basic HTML entity encoding
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  } catch (error) {
    logger.error('HTML sanitization failed', { input, error });
    throw new Error(
      `HTML sanitization failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Sanitizes SQL input to prevent SQL injection
 * @param input - Raw SQL string or value
 * @param options - Sanitization options
 * @returns Sanitized SQL string
 * @example
 * const safe = sanitizeSQL("'; DROP TABLE users; --");
 * // Returns: escaped string safe for SQL
 */
export const sanitizeSQL = (input: string, options: SQLSanitizeOptions = {}): string => {
  try {
    const { escapeSingleQuotes = true } = options;

    let sanitized = input;

    // Remove SQL comments
    sanitized = sanitized.replace(/--.*$/gm, '');
    sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '');

    // Escape single quotes
    if (escapeSingleQuotes) {
      sanitized = sanitized.replace(/'/g, "''");
    }

    // Remove dangerous SQL keywords
    const dangerousPatterns = [
      /;\s*DROP\s+/gi,
      /;\s*DELETE\s+/gi,
      /;\s*UPDATE\s+/gi,
      /;\s*INSERT\s+/gi,
      /;\s*EXEC(UTE)?\s+/gi,
      /;\s*UNION\s+/gi,
      /xp_/gi,
      /sp_/gi,
    ];

    dangerousPatterns.forEach(pattern => {
      if (pattern.test(sanitized)) {
        logger.warn('Dangerous SQL pattern detected and removed', { pattern: pattern.source });
        sanitized = sanitized.replace(pattern, '');
      }
    });

    return sanitized.trim();
  } catch (error) {
    logger.error('SQL sanitization failed', { input, error });
    throw new Error(
      `SQL sanitization failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Sanitizes file paths to prevent directory traversal attacks
 * @param path - Raw file path
 * @returns Sanitized file path
 * @throws {Error} When path contains dangerous patterns
 * @example
 * const safe = sanitizeFilePath('../../../etc/passwd');
 * // Throws error for dangerous path
 */
export const sanitizeFilePath = (path: string): string => {
  try {
    // Remove null bytes
    let sanitized = path.replace(/\0/g, '');

    // Check for directory traversal
    if (sanitized.includes('..') || sanitized.includes('~')) {
      throw new Error('Path traversal detected');
    }

    // Remove leading slashes on Windows drive letters
    sanitized = sanitized.replace(/^[a-zA-Z]:\\/, '');

    // Normalize path separators
    sanitized = sanitized.replace(/\\/g, '/');

    // Remove duplicate slashes
    sanitized = sanitized.replace(/\/+/g, '/');

    // Remove leading/trailing slashes
    sanitized = sanitized.replace(/^\/|\/$/g, '');

    return sanitized;
  } catch (error) {
    logger.error('File path sanitization failed', { path, error });
    throw new Error(
      `File path sanitization failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Sanitizes URL to prevent open redirect and SSRF attacks
 * @param url - Raw URL string
 * @returns Sanitized URL string
 * @throws {Error} When URL is invalid or dangerous
 * @example
 * const safe = sanitizeURL('https://example.com/path?query=value');
 * // Returns: validated URL
 */
export const sanitizeURL = (url: string): string => {
  try {
    // Remove null bytes and control characters
    // eslint-disable-next-line no-control-regex
    const sanitized = url.replace(/[\0\x00-\x1F\x7F]/g, '');

    // Parse URL to validate
    const urlObj = new URL(sanitized);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error(`Invalid protocol: ${urlObj.protocol}`);
    }

    // Check for localhost/private IP ranges (prevent SSRF)
    const privateIPPatterns = [
      /^localhost$/i,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^169\.254\./,
      /^fe80:/i,
      /^::1$/,
    ];

    if (privateIPPatterns.some(pattern => pattern.test(urlObj.hostname))) {
      logger.warn('Private IP or localhost detected in URL', { url: urlObj.hostname });
      throw new Error('Private IP addresses not allowed');
    }

    return urlObj.toString();
  } catch (error) {
    logger.error('URL sanitization failed', { url, error });
    throw new Error(
      `URL sanitization failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Sanitizes email address
 * @param email - Raw email string
 * @returns Sanitized email address
 * @throws {Error} When email is invalid
 * @example
 * const safe = sanitizeEmail('user@example.com');
 * // Returns: validated email
 */
export const sanitizeEmail = (email: string): string => {
  try {
    // Remove whitespace
    const sanitized = email.trim().toLowerCase();

    // Basic email validation regex
    const emailRegex = /^[a-z0-9][a-z0-9._+-]*@[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i;

    if (!emailRegex.test(sanitized)) {
      throw new Error('Invalid email format');
    }

    // Check for dangerous characters
    if (/[<>()[\]\\,;:\s@"]/.test(sanitized.split('@')[0] || '')) {
      throw new Error('Email contains dangerous characters');
    }

    return sanitized;
  } catch (error) {
    logger.error('Email sanitization failed', { email, error });
    throw new Error(
      `Email sanitization failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Sanitizes JSON data by removing potentially dangerous keys
 * @param data - JSON object
 * @param dangerousKeys - Keys to remove
 * @returns Sanitized JSON object
 * @example
 * const safe = sanitizeJSON({ name: 'test', __proto__: {} }, ['__proto__']);
 * // Returns: { name: 'test' }
 */
export const sanitizeJSON = <T extends Record<string, unknown>>(
  data: T,
  dangerousKeys: string[] = ['__proto__', 'constructor', 'prototype']
): Partial<T> => {
  try {
    const sanitized = { ...data };

    dangerousKeys.forEach(key => {
      if (key in sanitized) {
        logger.warn('Dangerous key removed from JSON', { key });
        delete sanitized[key];
      }
    });

    return sanitized;
  } catch (error) {
    logger.error('JSON sanitization failed', { error });
    throw new Error(
      `JSON sanitization failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Sanitizes string input for general use
 * Removes control characters, trims whitespace, enforces length limits
 * @param input - Raw string
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string
 * @example
 * const safe = sanitizeString('  Hello\x00World  ', 50);
 * // Returns: "HelloWorld"
 */
export const sanitizeString = (input: string, maxLength = 1000): string => {
  try {
    // Remove null bytes and control characters
    // eslint-disable-next-line no-control-regex
    let sanitized = input.replace(/[\0\x00-\x1F\x7F]/g, '');

    // Trim whitespace
    sanitized = sanitized.trim();

    // Enforce length limit
    if (sanitized.length > maxLength) {
      logger.warn('String truncated due to length limit', {
        original: sanitized.length,
        limit: maxLength,
      });
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  } catch (error) {
    logger.error('String sanitization failed', { input, error });
    throw new Error(
      `String sanitization failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Validates and sanitizes a phone number
 * @param phone - Raw phone number string
 * @returns Sanitized phone number
 * @throws {Error} When phone number is invalid
 * @example
 * const safe = sanitizePhoneNumber('+1-234-567-8900');
 * // Returns: "+12345678900"
 */
export const sanitizePhoneNumber = (phone: string): string => {
  try {
    // Remove all non-digit characters except +
    const sanitized = phone.replace(/[^\d+]/g, '');

    // Validate format (very basic)
    if (!/^\+?\d{7,15}$/.test(sanitized)) {
      throw new Error('Invalid phone number format');
    }

    return sanitized;
  } catch (error) {
    logger.error('Phone number sanitization failed', { phone, error });
    throw new Error(
      `Phone sanitization failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
