/**
 * @fileoverview Data transformation utilities for format conversion.
 * Supports JSON ↔ XML ↔ CSV ↔ YAML conversions, normalization, and sanitization.
 * @module validation-transform/transformers/format.transformer
 * @category Transformers
 *
 * Features:
 * - Format conversion (JSON ↔ XML ↔ CSV ↔ YAML)
 * - Data normalization
 * - Data sanitization
 * - Encoding/Decoding
 * - Template processing
 *
 * @example
 * import * as Transformer from './format.transformer';
 * const csv = Transformer.jsonToCSV(data);
 */

import { logger } from '@utils/core';

/**
 * CSV formatting options
 */
export type FormatCSVOptions = {
  /** Column delimiter character (default: ',') */
  delimiter?: string;
  /** Include header row in output (default: true) */
  includeHeaders?: boolean;
  /** Input CSV has header row (default: true) */
  hasHeaders?: boolean;
};

/**
 * XML formatting options
 */
export type FormatXMLOptions = {
  /** Root element name (default: 'root') */
  rootName?: string;
  /** Include XML declaration header (default: true) */
  declaration?: boolean;
};

/**
 * Options for removing empty values
 */
export type FormatRemoveEmptyOptions = {
  /** Remove empty strings (default: false) */
  removeEmptyStrings?: boolean;
  /** Remove empty arrays (default: false) */
  removeEmptyArrays?: boolean;
};

/**
 * Convert JSON to CSV
 *
 * @param {Array<Object>} jsonArray - Array of objects
 * @param {Object} options - Conversion options
 * @returns {string} CSV string
 *
 * @example
 * const csv = jsonToCSV([
 *   { name: 'John', age: 30, city: 'NYC' },
 *   { name: 'Jane', age: 25, city: 'LA' }
 * ]);
 */
export const jsonToCSV = (
  jsonArray: Array<Record<string, unknown>>,
  options: FormatCSVOptions = {}
): string => {
  const { delimiter = ',', includeHeaders = true } = options;

  try {
    if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
      return '';
    }

    // Get headers from first object
    const headers = Object.keys(jsonArray[0]);

    // Build CSV
    const rows = [];

    if (includeHeaders) {
      rows.push(headers.join(delimiter));
    }

    jsonArray.forEach(obj => {
      const values = headers.map(header => {
        const value = obj[header] ?? '';
        // Escape values containing delimiter or quotes
        const stringValue = String(value);
        if (stringValue.includes(delimiter) || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      rows.push(values.join(delimiter));
    });

    const csv = rows.join('\n');
    logger.info(`Converted JSON to CSV: ${jsonArray.length} rows`);
    return csv;
  } catch (error) {
    logger.error(
      'JSON to CSV conversion failed',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
};

/**
 * Convert CSV to JSON
 *
 * @param {string} csvString - CSV string
 * @param {Object} options - Conversion options
 * @returns {Array<Object>} Array of objects
 *
 * @example
 * const json = csvToJSON('name,age\nJohn,30\nJane,25');
 */
export const csvToJSON = (
  csvString: string,
  options: FormatCSVOptions = {}
): Array<Record<string, string>> => {
  const { delimiter = ',', hasHeaders = true } = options;

  try {
    const lines = csvString.trim().split('\n');

    if (lines.length === 0) {
      return [];
    }

    let headers: string[];
    let startIndex = 0;

    if (hasHeaders) {
      headers = lines[0].split(delimiter).map(h => h.trim());
      startIndex = 1;
    } else {
      // Generate headers
      const firstLine = lines[0].split(delimiter);
      headers = firstLine.map((_, i) => `column${i + 1}`);
    }

    const result: Array<Record<string, string>> = [];

    for (let i = startIndex; i < lines.length; i++) {
      const values = lines[i].split(delimiter);
      const obj: Record<string, string> = {};

      headers.forEach((header, index) => {
        let value = values[index]?.trim() || '';
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1).replace(/""/g, '"');
        }
        obj[header] = value;
      });

      result.push(obj);
    }

    logger.info(`Converted CSV to JSON: ${result.length} records`);
    return result;
  } catch (error) {
    logger.error(
      'CSV to JSON conversion failed',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
};

/**
 * Helper function to recursively convert objects to XML
 * @param obj - Object or value to convert
 * @param nodeName - XML node name (default: 'root')
 * @returns XML string representation
 * @example
 * convertToXMLHelper({ user: 'John' }, 'data') // '<data><user>John</user></data>'
 */
export const convertToXMLHelper = (obj: unknown, nodeName = 'root'): string => {
  let result = '';

  if (Array.isArray(obj)) {
    obj.forEach(item => {
      result += convertToXMLHelper(item, nodeName);
    });
  } else if (typeof obj === 'object' && obj !== null) {
    result += `<${nodeName}>`;
    for (const [key, value] of Object.entries(obj)) {
      result += convertToXMLHelper(value, key);
    }
    result += `</${nodeName}>`;
  } else {
    const escapedValue = String(obj)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
    result += `<${nodeName}>${escapedValue}</${nodeName}>`;
  }

  return result;
};

/**
 * Convert JSON to XML
 *
 * @param {Object|Array} json - JSON object or array
 * @param {Object} options - Conversion options
 * @returns {string} XML string
 *
 * @example
 * const xml = jsonToXML({ user: { name: 'John', age: 30 } });
 */
export const jsonToXML = (json: unknown, options: FormatXMLOptions = {}): string => {
  const { rootName = 'root', declaration = true } = options;

  try {
    let xml = declaration ? '<?xml version="1.0" encoding="UTF-8"?>\n' : '';
    xml += convertToXMLHelper(json, rootName);
    logger.info('Converted JSON to XML');
    return xml;
  } catch (error) {
    logger.error(
      'JSON to XML conversion failed',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
};

/**
 * Flatten nested object
 *
 * @param {Object} obj - Nested object
 * @param {string} separator - Key separator (default: '.')
 * @returns {Object} Flattened object
 *
 * @example
 * const flat = flattenObject({ user: { name: 'John', address: { city: 'NYC' } } });
 * // Result: { 'user.name': 'John', 'user.address.city': 'NYC' }
 */
export const flattenObject = (
  obj: Record<string, unknown>,
  separator = '.',
  prefix = ''
): Record<string, unknown> => {
  try {
    const flattened: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}${separator}${key}` : key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(
          flattened,
          flattenObject(value as Record<string, unknown>, separator, newKey)
        );
      } else {
        flattened[newKey] = value;
      }
    }

    logger.info('Object flattened');
    return flattened;
  } catch (error) {
    logger.error('Object flattening failed', error as Error);
    throw error;
  }
};

/**
 * Unflatten object
 *
 * @param {Object} obj - Flattened object
 * @param {string} separator - Key separator (default: '.')
 * @returns {Object} Nested object
 *
 * @example
 * const nested = unflattenObject({ 'user.name': 'John', 'user.age': 30 });
 * // Result: { user: { name: 'John', age: 30 } }
 */
export const unflattenObject = (
  obj: Record<string, unknown>,
  separator = '.'
): Record<string, unknown> => {
  try {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const keys = key.split(separator);
      let current: Record<string, unknown> = result;

      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in current)) {
          current[k] = {};
        }
        current = current[k] as Record<string, unknown>;
      }

      current[keys[keys.length - 1]] = value;
    }

    logger.info('Object unflattened');
    return result;
  } catch (error) {
    logger.error('Object unflattening failed', error as Error);
    throw error;
  }
};

/**
 * Convert snake_case keys to camelCase
 *
 * @param {Object|Array} obj - Object with snake_case keys
 * @returns {Object|Array} Object with camelCase keys
 *
 * @example
 * const camel = snakeToCamel({ user_name: 'John', user_age: 30 });
 * // Result: { userName: 'John', userAge: 30 }
 */
export const snakeToCamel = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item)) as unknown;
  }

  if (obj !== null && typeof obj === 'object') {
    const converted: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter: string) =>
        (letter as string).toUpperCase()
      );
      converted[camelKey] = snakeToCamel(value) as unknown;
    }

    return converted as unknown;
  }

  return obj;
};

/**
 * Convert camelCase keys to snake_case
 *
 * @param {Object|Array} obj - Object with camelCase keys
 * @returns {Object|Array} Object with snake_case keys
 *
 * @example
 * const snake = camelToSnake({ userName: 'John', userAge: 30 });
 * // Result: { user_name: 'John', user_age: 30 }
 */
export const camelToSnake = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map(item => camelToSnake(item)) as unknown;
  }

  if (obj !== null && typeof obj === 'object') {
    const converted: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      converted[snakeKey] = camelToSnake(value);
    }

    return converted;
  }

  return obj;
};

/**
 * Deep clone object
 *
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 *
 * @example
 * const cloned = deepClone(originalObject);
 */
export const deepClone = (obj: unknown): unknown => {
  try {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
      return obj.map(item => deepClone(item));
    }

    if (obj instanceof Object) {
      const cloned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        cloned[key] = deepClone(value);
      }
      return cloned;
    }

    return obj;
  } catch (error) {
    logger.error('Deep clone failed', error as Error);
    throw error;
  }
};

/**
 * Remove null/undefined values from object
 *
 * @param {Object} obj - Object to clean
 * @param {Object} options - Options
 * @returns {Object} Cleaned object
 *
 * @example
 * const cleaned = removeEmpty({ a: 1, b: null, c: undefined, d: '' });
 * // Result: { a: 1, d: '' } (by default keeps empty strings)
 */
export const removeEmpty = (obj: unknown, options: FormatRemoveEmptyOptions = {}): unknown => {
  const { removeEmptyStrings = false, removeEmptyArrays = false } = options;

  try {
    if (Array.isArray(obj)) {
      return obj
        .map(item => removeEmpty(item, options))
        .filter(item => {
          if (removeEmptyArrays && Array.isArray(item) && item.length === 0) {
            return false;
          }
          return item !== null && item !== undefined;
        });
    }

    if (obj !== null && typeof obj === 'object') {
      const cleaned: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(obj)) {
        if (value === null || value === undefined) {
          continue;
        }

        if (removeEmptyStrings && value === '') {
          continue;
        }

        if (removeEmptyArrays && Array.isArray(value) && value.length === 0) {
          continue;
        }

        cleaned[key] = removeEmpty(value, options);
      }

      return cleaned;
    }

    return obj;
  } catch (error) {
    logger.error('Remove empty failed', error as Error);
    throw error;
  }
};

/**
 * Merge objects deeply
 *
 * @param {Object} target - Target object
 * @param {...Object} sources - Source objects
 * @returns {Object} Merged object
 *
 * @example
 * const merged = deepMerge({ a: 1, b: { c: 2 } }, { b: { d: 3 }, e: 4 });
 * // Result: { a: 1, b: { c: 2, d: 3 }, e: 4 }
 */
export const deepMerge = (
  target: Record<string, unknown>,
  ...sources: Array<Record<string, unknown>>
): Record<string, unknown> => {
  try {
    if (!sources.length) {
      return target;
    }

    const source = sources.shift()!;

    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) {
            Object.assign(target, { [key]: {} });
          }
          deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return deepMerge(target, ...sources);
  } catch (error) {
    logger.error('Deep merge failed', error as Error);
    throw error;
  }
};

/**
 * Type guard to check if value is a plain object
 * @param item - Value to check
 * @returns True if item is a plain object (not array or null)
 * @example
 * isObject({}) // true
 * isObject([]) // false
 * isObject(null) // false
 */
export const isObject = (item: unknown): item is Record<string, unknown> => {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
};

/**
 * Pick specific fields from object
 *
 * @param {Object} obj - Source object
 * @param {Array<string>} fields - Fields to pick
 * @returns {Object} Object with only specified fields
 *
 * @example
 * const picked = pick({ a: 1, b: 2, c: 3 }, ['a', 'c']);
 * // Result: { a: 1, c: 3 }
 */
export const pick = (obj: Record<string, unknown>, fields: string[]): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  fields.forEach(field => {
    if (field in obj) {
      result[field] = obj[field];
    }
  });

  return result;
};

/**
 * Omit specific fields from object
 *
 * @param {Object} obj - Source object
 * @param {Array<string>} fields - Fields to omit
 * @returns {Object} Object without specified fields
 *
 * @example
 * const omitted = omit({ a: 1, b: 2, c: 3 }, ['b']);
 * // Result: { a: 1, c: 3 }
 */
export const omit = (obj: Record<string, unknown>, fields: string[]): Record<string, unknown> => {
  const result = { ...obj };

  fields.forEach(field => {
    delete result[field];
  });

  return result;
};
