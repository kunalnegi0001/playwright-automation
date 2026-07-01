/**
 * @fileoverview Data normalization utilities for consistent data formatting.
 * Provides functions to normalize strings, phones, emails, URLs, dates, and booleans.
 * @module validation-transform/transformers/normalize.transformer
 */

import { logger } from '@utils/core';

export type NormalizeOptions = {
  trim?: boolean;
  collapseWhitespace?: boolean;
  caseMode?: string;
};

/**
 * Normalize object string fields (trim/case/whitespace)
 * Recursively processes objects and arrays
 * @param {any} data - Data to normalize
 * @param {Object} [options={}] - Normalization options
 * @param {boolean} [options.trim=true] - Trim whitespace
 * @param {boolean} [options.collapseWhitespace=true] - Collapse multiple spaces
 * @param {string} [options.caseMode='none'] - Case transformation ('none', 'lower', 'upper')
 * @returns {any} Normalized data
 * @example
 * normalizeObjectStrings({ name: '  John  Doe  ' }, { trim: true, collapseWhitespace: true })
 * // { name: 'John Doe' }
 */
export const normalizeObjectStrings = (data: unknown, options: NormalizeOptions = {}): unknown => {
  const { trim = true, collapseWhitespace = true, caseMode = 'none' } = options;
  try {
    if (Array.isArray(data)) {
      return data.map(item => normalizeObjectStrings(item, options));
    }
    if (!data || typeof data !== 'object') {
      return data;
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        let v = value;
        if (trim) {
          v = v.trim();
        }
        if (collapseWhitespace) {
          v = v.replace(/\s+/g, ' ');
        }
        if (caseMode === 'lower') {
          v = v.toLowerCase();
        }
        if (caseMode === 'upper') {
          v = v.toUpperCase();
        }
        result[key] = v;
      } else if (value && typeof value === 'object') {
        result[key] = normalizeObjectStrings(value, options);
      } else {
        result[key] = value;
      }
    }
    return result;
  } catch (error) {
    logger.error(`normalizeObjectStrings failed: ${(error as Error).message}`);
    return data;
  }
};

/**
 * Normalize phone-like string by removing non-digits (preserves leading +)
 * @param {string} [value=''] - Phone number to normalize
 * @returns {string} Normalized phone number
 * @example
 * normalizePhone('+1 (555) 123-4567') // '+15551234567'
 * normalizePhone('555-123-4567') // '5551234567'
 */
export const normalizePhone = (value: string = '') => {
  try {
    if (typeof value !== 'string') {
      return '';
    }
    const hasPlus = value.trim().startsWith('+');
    const digits = value.replace(/\D/g, '');
    return hasPlus ? `+${digits}` : digits;
  } catch (error) {
    logger.error(`normalizePhone failed: ${(error as Error).message}`);
    return value;
  }
};

/**
 * Normalize email (trim + lowercase domain)
 * Simple normalization without validation
 * @param {string} [value=''] - Email address to normalize
 * @returns {string} Normalized email
 * @example
 * normalizeEmailSimple(' John@EXAMPLE.COM ') // 'John@example.com'
 */
export const normalizeEmailSimple = (value: string = '') => {
  try {
    if (typeof value !== 'string') {
      return '';
    }
    const email = value.trim();
    const [local, domain] = email.split('@');
    if (!local || !domain) {
      return email;
    }
    return `${local}@${domain.toLowerCase()}`;
  } catch (error) {
    logger.error(`normalizeEmail failed: ${(error as Error).message}`);
    return value;
  }
};

/**
 * Normalize URL by removing trailing slash and lower-casing host
 * @param {string} [url=''] - URL to normalize
 * @returns {string} Normalized URL
 * @example
 * normalizeUrl('https://EXAMPLE.COM/path/') // 'https://example.com/path'
 */
export const normalizeUrl = (url: string = '') => {
  try {
    const parsed = new URL(url);
    parsed.hostname = parsed.hostname.toLowerCase();
    if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString();
  } catch {
    return url;
  }
};

/**
 * Normalize date-like inputs into ISO string
 * @param {Date|string|number} input - Date input to normalize
 * @returns {string|null} ISO date string or null if invalid
 * @example
 * normalizeDateISO('2024-01-15') // '2024-01-15T00:00:00.000Z'
 * normalizeDateISO(new Date('2024-01-15')) // '2024-01-15T00:00:00.000Z'
 */
export const normalizeDateISO = (input: Date | string | number): string | null => {
  try {
    const d = input instanceof Date ? input : new Date(input);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  } catch (error) {
    logger.error(`normalizeDateISO failed: ${(error as Error).message}`);
    return null;
  }
};

/**
 * Normalize booleans from string/number variants
 * @param {any} value - Value to convert to boolean
 * @returns {boolean} Normalized boolean value
 * @example
 * normalizeBoolean('true') // true
 * normalizeBoolean('false') // false
 * normalizeBoolean(1) // true
 * normalizeBoolean(0) // false
 */
export const normalizeBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y'].includes(v)) {
      return true;
    }
    if (['false', '0', 'no', 'n', ''].includes(v)) {
      return false;
    }
  }
  return Boolean(value);
};

/**
 * Normalize value to number, returning null for invalid inputs
 * @param value - Value to convert to number
 * @returns Number or null if conversion fails
 * @example
 * normalizeNumber('123') // 123
 * normalizeNumber('abc') // null
 * normalizeNumber(null) // null
 */
export const normalizeNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

/**
 * Normalize array of records by applying field-specific transformations
 * @param records - Array of record objects to normalize
 * @param map - Mapping of field names to normalization types ('email', 'phone', 'number', 'boolean', 'date')
 * @returns Array of normalized records
 * @example
 * normalizeRecords([{ email: ' USER@EXAMPLE.COM ', age: '25' }], { email: 'email', age: 'number' })
 * // [{ email: 'USER@example.com', age: 25 }]
 */
export const normalizeRecords = (
  records: Array<Record<string, unknown>> = [],
  map: Record<string, string> = {}
): Array<Record<string, unknown>> => {
  try {
    return records.map(item => {
      const out = { ...item };
      for (const [field, type] of Object.entries(map)) {
        if (!(field in out)) {
          continue;
        }
        if (type === 'email') {
          out[field] = normalizeEmailSimple(out[field] as string);
        } else if (type === 'phone') {
          out[field] = normalizePhone(out[field] as string);
        } else if (type === 'number') {
          out[field] = normalizeNumber(out[field]);
        } else if (type === 'boolean') {
          out[field] = normalizeBoolean(out[field]);
        } else if (type === 'date') {
          out[field] = normalizeDateISO(out[field] as string | number | Date);
        }
      }
      return out;
    });
  } catch (error) {
    logger.error(`normalizeRecords failed: ${(error as Error).message}`);
    return records;
  }
};

/**
 * Normalize object keys to consistent format (camelCase, snake_case, kebab-case, or lowercase)
 * @param obj - Object to normalize (can be nested or array)
 * @param mode - Key format ('camel', 'snake', 'kebab', 'lower')
 * @returns Object with normalized keys
 * @example
 * normalizeKeys({ UserName: 'John', user_age: 30 }, 'camel') // { userName: 'John', userAge: 30 }
 * normalizeKeys({ userName: 'John' }, 'snake') // { user_name: 'John' }
 */
export const normalizeKeys = (obj: unknown, mode = 'camel'): unknown => {
  try {
    if (Array.isArray(obj)) {
      return obj.map(x => normalizeKeys(x, mode));
    }
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const transform = (k: string): string => {
      if (mode === 'lower') {
        return k.toLowerCase();
      }
      const words = k
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_.-]+/g, ' ')
        .trim()
        .split(/\s+/);

      if (mode === 'snake') {
        return words.map(w => w.toLowerCase()).join('_');
      }
      if (mode === 'kebab') {
        return words.map(w => w.toLowerCase()).join('-');
      }
      // camel
      return words
        .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
        .join('');
    };

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[transform(k)] = normalizeKeys(v, mode);
    }
    return out;
  } catch (error) {
    logger.error(`normalizeKeys failed: ${(error as Error).message}`);
    return obj;
  }
};

/**
 * Fill in default values for null, undefined, or empty string fields
 * @param data - Object to normalize
 * @param defaults - Default values for missing/empty fields
 * @returns Object with defaults applied
 * @example
 * normalizeWithDefaults({ name: '', age: null }, { name: 'Unknown', age: 0 })
 * // { name: 'Unknown', age: 0 }
 */
export const normalizeWithDefaults = (
  data: Record<string, unknown>,
  defaults: Record<string, unknown> = {}
): Record<string, unknown> => {
  try {
    const out = { ...data };
    for (const [k, v] of Object.entries(defaults)) {
      if (out[k] === undefined || out[k] === null || out[k] === '') {
        out[k] = v;
      }
    }
    return out;
  } catch (error) {
    logger.error(`normalizeWithDefaults failed: ${(error as Error).message}`);
    return data;
  }
};
