/**
 * @fileoverview Data masking utilities for sensitive information.
 * Provides functions to mask emails, phones, credit cards, SSN, and custom data.
 * @module validation-transform/transformers/mask.transformer
 */

import { logger } from '@utils/core';

/**
 * Mask email address while keeping first 2 characters visible
 * @param {string} [email=''] - Email address to mask
 * @returns {string} Masked email (e.g., 'jo****@example.com')
 * @example
 * maskEmail('john.doe@example.com') // 'jo******@example.com'
 */
export const maskEmail = (email: string = ''): string => {
  try {
    const [local, domain] = String(email).split('@');
    if (!local || !domain) {
      return email;
    }
    const visible = local.slice(0, 2);
    return `${visible}${'*'.repeat(Math.max(1, local.length - 2))}@${domain}`;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`maskEmail failed: ${errorMessage}`);
    return email;
  }
};

/**
 * Mask phone number showing only last N digits
 * @param {string} [phone=''] - Phone number to mask
 * @param {number} [visible=4] - Number of visible digits at end
 * @returns {string} Masked phone number
 * @example
 * maskPhone('1234567890', 4) // '******7890'
 */
export const maskPhone = (phone: string = '', visible = 4): string => {
  try {
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length <= visible) {
      return digits;
    }
    return `${'*'.repeat(digits.length - visible)}${digits.slice(-visible)}`;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`maskPhone failed: ${errorMessage}`);
    return phone;
  }
};

/**
 * Mask credit card number showing only last N digits
 * @param {string} [card=''] - Credit card number to mask
 * @param {number} [visible=4] - Number of visible digits at end
 * @returns {string} Masked card number with spacing
 * @example
 * maskCard('4111111111111111', 4) // '**** **** **** 1111'
 */
export const maskCard = (card: string = '', visible = 4): string => {
  try {
    const digits = String(card).replace(/\D/g, '');
    if (digits.length <= visible) {
      return digits;
    }
    const masked = `${'*'.repeat(digits.length - visible)}${digits.slice(-visible)}`;
    return masked.replace(/(.{4})/g, '$1 ').trim();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`maskCard failed: ${errorMessage}`);
    return card;
  }
};

/**
 * Mask Social Security Number showing only last 4 digits
 * @param {string} [ssn=''] - SSN to mask
 * @returns {string} Masked SSN in format '***-**-NNNN'
 * @example
 * maskSSN('123-45-6789') // '***-**-6789'
 */
export const maskSSN = (ssn: string = ''): string => {
  try {
    const digits = String(ssn).replace(/\D/g, '');
    if (digits.length < 4) {
      return '***-**-****';
    }
    return `***-**-${digits.slice(-4)}`;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`maskSSN failed: ${errorMessage}`);
    return ssn;
  }
};

/**
 * Partial mask showing start and end characters
 * @param {string} [value=''] - Value to mask
 * @param {number} [start=2] - Number of visible characters at start
 * @param {number} [end=2] - Number of visible characters at end
 * @returns {string} Partially masked string
 * @example
 * partialMask('secrettoken', 2, 2) // 'se******en'
 */
export const partialMask = (value: string = '', start = 2, end = 2): string => {
  try {
    const s = String(value);
    if (s.length <= start + end) {
      return '*'.repeat(s.length);
    }
    return `${s.slice(0, start)}${'*'.repeat(s.length - start - end)}${s.slice(-end)}`;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`partialMask failed: ${errorMessage}`);
    return value;
  }
};

/**
 * Recursively mask object fields based on field rules
 * @param obj - Object to mask (can be nested or array)
 * @param fieldRules - Mapping of field names to mask types ('email', 'phone', 'card', 'ssn') or partial mask config
 * @returns Masked object with sensitive fields obscured
 * @example
 * maskObject({ email: 'user@example.com', phone: '1234567890' }, { email: 'email', phone: 'phone' })
 * // { email: 'us****@example.com', phone: '******7890' }
 */
export const maskObject = (
  obj: unknown,
  fieldRules: Record<string, string | { start?: number; end?: number }> = {}
): unknown => {
  try {
    if (Array.isArray(obj)) {
      return obj.map((x: unknown) => maskObject(x, fieldRules));
    }
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const rule = fieldRules[key];
      if (!rule) {
        out[key] = value && typeof value === 'object' ? maskObject(value, fieldRules) : value;
        continue;
      }
      if (rule === 'email') {
        out[key] = maskEmail(value as string);
      } else if (rule === 'phone') {
        out[key] = maskPhone(value as string);
      } else if (rule === 'card') {
        out[key] = maskCard(value as string);
      } else if (rule === 'ssn') {
        out[key] = maskSSN(value as string);
      } else if (typeof rule === 'object') {
        out[key] = partialMask(value as string, rule.start ?? 2, rule.end ?? 2);
      } else {
        out[key] = partialMask(value as string);
      }
    }
    return out;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`maskObject failed: ${errorMessage}`);
    return obj;
  }
};

/**
 * Mask string using custom regular expression pattern
 * @param value - String to mask
 * @param regex - Regular expression pattern to match
 * @param replacement - Replacement character or string
 * @returns Masked string with matches replaced
 * @example
 * maskWithRegex('secret-ABC-123', /[A-Z]/g, 'X') // 'secret-XXX-123'
 */
export const maskWithRegex = (
  value: string = '',
  regex: RegExp,
  replacement: string = '*'
): string => {
  try {
    if (!regex) {
      return value;
    }
    return String(value).replace(regex, replacement);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`maskWithRegex failed: ${errorMessage}`);
    return value;
  }
};
