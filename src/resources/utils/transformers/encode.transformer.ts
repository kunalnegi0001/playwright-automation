/**
 * @fileoverview Encoding and decoding utilities for various formats.
 * Provides Base64, URL, and HTML encoding/decoding functions.
 * @module validation-transform/transformers/encode.transformer
 */

import { logger } from '@utils/core';

/**
 * Encode string to Base64 format
 * @param {string} [value=''] - String to encode
 * @returns {string} Base64 encoded string
 * @example
 * encodeBase64('Hello World') // 'SGVsbG8gV29ybGQ='
 */
export const encodeBase64 = (value = ''): string => {
  try {
    return Buffer.from(String(value), 'utf8').toString('base64');
  } catch (error) {
    logger.error(`encodeBase64 failed: ${error instanceof Error ? error.message : String(error)}`);
    return '';
  }
};

/**
 * Decode Base64 string to UTF-8
 * @param {string} [value=''] - Base64 string to decode
 * @returns {string} Decoded UTF-8 string
 * @example
 * decodeBase64('SGVsbG8gV29ybGQ=') // 'Hello World'
 */
export const decodeBase64 = (value = ''): string => {
  try {
    return Buffer.from(String(value), 'base64').toString('utf8');
  } catch (error) {
    logger.error(`decodeBase64 failed: ${error instanceof Error ? error.message : String(error)}`);
    return '';
  }
};

/**
 * URL-encode string (percent encoding)
 * @param {string} [value=''] - String to encode
 * @returns {string} URL-encoded string
 * @example
 * encodeUrl('hello world') // 'hello%20world'
 */
export const encodeUrl = (value: string = ''): string => {
  try {
    return encodeURIComponent(String(value));
  } catch (error) {
    logger.error(`encodeUrl failed: ${error instanceof Error ? error.message : String(error)}`);
    return value;
  }
};

/**
 * Decode URL-encoded string
 * @param {string} [value=''] - URL-encoded string
 * @returns {string} Decoded string
 * @example
 * decodeUrl('hello%20world') // 'hello world'
 */
export const decodeUrl = (value: string = ''): string => {
  try {
    return decodeURIComponent(String(value));
  } catch (error) {
    logger.error(`decodeUrl failed: ${error instanceof Error ? error.message : String(error)}`);
    return value;
  }
};

/**
 * HTML-encode string by escaping special characters
 * @param {string} [value=''] - String to encode
 * @returns {string} HTML-encoded string
 * @example
 * encodeHtml('<script>alert(1)</script>') // '&lt;script&gt;alert(1)&lt;/script&gt;'
 */
export const encodeHtml = (value: string = ''): string => {
  try {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  } catch (error) {
    logger.error(`encodeHtml failed: ${error instanceof Error ? error.message : String(error)}`);
    return value;
  }
};

/**
 * Decode HTML entities to plain text
 * @param {string} [value=''] - HTML-encoded string
 * @returns {string} Decoded string
 * @example
 * decodeHtml('&lt;script&gt;') // '<script>'
 */
export const decodeHtml = (value: string = ''): string => {
  try {
    return String(value)
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  } catch (error) {
    logger.error(`decodeHtml failed: ${error instanceof Error ? error.message : String(error)}`);
    return value;
  }
};
