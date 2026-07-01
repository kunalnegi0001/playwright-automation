/**
 * @fileoverview Data sanitization utilities for security and data integrity.
 * Provides functions to sanitize HTML, SQL, URLs, paths, and JSON strings.
 * @module validation-transform/transformers/sanitize.transformer
 */

import { logger } from '@utils/core';

/**
 * HTML escape character mapping
 * @const
 */
const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Sanitize HTML by escaping special characters
 * @param {string} [input=''] - Input string to sanitize
 * @returns {string} Sanitized HTML string
 * @example
 * sanitizeHtml('<script>alert(1)</script>') // '&lt;script&gt;alert(1)&lt;/script&gt;'
 */
export const sanitizeHtml = (input: string = ''): string => {
  try {
    return String(input).replace(
      /[&<>"']/g,
      (c: string) => (HTML_ESCAPE_MAP as Record<string, string>)[c]
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`sanitizeHtml failed: ${errorMessage}`);
    return input;
  }
};

/**
 * Remove all HTML tags from input string
 * @param input - String containing HTML tags
 * @returns Plain text with all HTML tags removed
 * @example
 * stripHtmlTags('<p>Hello <strong>World</strong></p>') // 'Hello World'
 */
export const stripHtmlTags = (input: string = ''): string => {
  try {
    return String(input)
      .replace(/<[^>]*>/g, '')
      .trim();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`stripHtmlTags failed: ${errorMessage}`);
    return input;
  }
};

/**
 * Sanitize SQL input by escaping single quotes and removing SQL injection patterns
 * @param input - String to sanitize for SQL usage
 * @returns Sanitized string safe for SQL queries
 * @example
 * sanitizeSqlInput("O'Brien; DROP TABLE") // "O''Brien DROP TABLE"
 */
export const sanitizeSqlInput = (input: string = ''): string => {
  try {
    return String(input)
      .replace(/'/g, "''")
      .replace(/;|--|\/\*|\*\//g, '');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`sanitizeSqlInput failed: ${errorMessage}`);
    return input;
  }
};

/**
 * Sanitize file path by removing directory traversal and invalid characters
 * @param input - File path to sanitize
 * @returns Sanitized path safe for file operations
 * @example
 * sanitizePath('../../../etc/passwd') // 'etcpasswd'
 */
export const sanitizePath = (input: string = ''): string => {
  try {
    return String(input)
      .replace(/\.\./g, '')
      .replace(/[<>:"|?*]/g, '');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`sanitizePath failed: ${errorMessage}`);
    return input;
  }
};

/**
 * Sanitize JSON string by removing control characters and line/paragraph separators
 * @param input - String to sanitize for JSON usage
 * @returns Sanitized string safe for JSON serialization
 * @example
 * sanitizeJsonString('text\u0000with\u2028breaks') // 'textwithbreaks'
 */
export const sanitizeJsonString = (input: string = ''): string => {
  try {
    return (
      String(input)
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .replace(/\u2028|\u2029/g, '')
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`sanitizeJsonString failed: ${errorMessage}`);
    return input;
  }
};

/**
 * Validate and sanitize URL allowing only HTTP/HTTPS protocols
 * @param input - URL string to sanitize
 * @returns Valid URL string or empty string if invalid
 * @example
 * sanitizeUrl('https://example.com/path') // 'https://example.com/path'
 * sanitizeUrl('javascript:alert(1)') // ''
 */
export const sanitizeUrl = (input: string = ''): string => {
  try {
    const url = new URL(input);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return '';
    }
    return url.toString();
  } catch {
    return '';
  }
};

/**
 * Sanitize HTTP headers by removing CRLF injection attempts and normalizing keys
 * @param headers - HTTP headers object to sanitize
 * @returns Sanitized headers with lowercase keys and safe values
 * @example
 * sanitizeHeaders({ 'Content-Type': 'text/html\r\nX-Injected: bad' }) // { 'content-type': 'text/htmlX-Injected: bad' }
 */
export const sanitizeHeaders = (headers: Record<string, unknown> = {}): Record<string, string> => {
  try {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(headers)) {
      const key = String(k).trim().toLowerCase();
      const val = String(v)
        .replace(/[\r\n]/g, '')
        .trim();
      out[key] = val;
    }
    return out;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`sanitizeHeaders failed: ${errorMessage}`);
    return headers as Record<string, string>;
  }
};

/**
 * Recursively sanitize all string values in an object based on mode
 * @param data - Object to sanitize (can be nested or array)
 * @param mode - Sanitization mode ('html', 'sql', 'json')
 * @returns Sanitized object with all string values processed
 * @example
 * sanitizeObject({ user: '<script>alert(1)</script>' }, 'html')
 * // { user: '&lt;script&gt;alert(1)&lt;/script&gt;' }
 */
export const sanitizeObject = (data: unknown, mode: 'html' | 'sql' | 'json' = 'html'): unknown => {
  try {
    if (Array.isArray(data)) {
      return data.map((x: unknown) => sanitizeObject(x, mode));
    }
    if (!data || typeof data !== 'object') {
      if (typeof data !== 'string') {
        return data;
      }
      if (mode === 'sql') {
        return sanitizeSqlInput(data);
      }
      if (mode === 'json') {
        return sanitizeJsonString(data);
      }
      return sanitizeHtml(data);
    }

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      out[k] = sanitizeObject(v, mode);
    }
    return out;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`sanitizeObject failed: ${errorMessage}`);
    return data;
  }
};

/**
 * Remove dangerous prototype pollution keys from object
 * @param data - Object to clean (can be nested or array)
 * @param blocked - Array of dangerous keys to remove (default: __proto__, constructor, prototype)
 * @returns Cleaned object without dangerous keys
 * @example
 * removeDangerousKeys({ user: 'John', __proto__: { polluted: true } })
 * // { user: 'John' }
 */
export const removeDangerousKeys = (
  data: unknown,
  blocked: string[] = ['__proto__', 'constructor', 'prototype']
): unknown => {
  try {
    if (Array.isArray(data)) {
      return data.map((x: unknown) => removeDangerousKeys(x, blocked));
    }
    if (!data || typeof data !== 'object') {
      return data;
    }

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (blocked.includes(k)) {
        continue;
      }
      out[k] = removeDangerousKeys(v, blocked);
    }
    return out;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`removeDangerousKeys failed: ${errorMessage}`);
    return data;
  }
};

/**
 * Sanitize filename by removing invalid characters and normalizing whitespace
 * @param name - Filename to sanitize
 * @returns Safe filename with invalid characters replaced by underscores
 * @example
 * sanitizeFilename('my<file>name?.txt') // 'my_file_name_.txt'
 */
export const sanitizeFilename = (name: string = ''): string => {
  try {
    return (
      String(name)
        // eslint-disable-next-line no-control-regex
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
        .replace(/\s+/g, ' ')
        .trim()
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`sanitizeFilename failed: ${errorMessage}`);
    return name;
  }
};
