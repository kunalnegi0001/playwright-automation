/**
 * @fileoverview Credit card validation utilities using Luhn algorithm.
 * Validates card numbers, detects card types, and checks formatting.
 * @module validators/credit-card.validator
 */

import { logger } from '@utils/core';

/**
 * @fileoverview Credit card validation helper functions
 * Provides comprehensive credit card validation including Luhn algorithm and format checking
 * @module credit-card.validator
 */

/**
 * Credit card validation options
 */
export type CardValidationOptions = {
  /** Allow spaces in card number */
  allowSpaces?: boolean;
  /** Allow dashes in card number */
  allowDashes?: boolean;
};

/**
 * Credit card number validation result
 */
export type CardNumberValidationResult = {
  /** Whether card number is valid */
  valid: boolean;
  /** Validation errors */
  errors: string[];
  /** Detected card type */
  type: string | null;
  /** Cleaned card number (digits only) */
  cleaned?: string;
  /** Original input card number */
  original?: string;
  /** Card number length */
  length?: number;
};

/**
 * Card type detection result
 */
export type CardTypeResult = string;

/**
 * Card expiration validation options
 */
export type CardExpirationOptions = {
  /** Allow past expiration dates */
  allowPastDates?: boolean;
  /** Date format: 'MM/YY' or 'MM/YYYY' */
  format?: 'MM/YY' | 'MM/YYYY';
};

/**
 * Card expiration validation result
 */
export type CardExpirationValidationResult = {
  /** Whether expiration is valid */
  valid: boolean;
  /** Validation errors */
  errors: string[];
  /** Expiration month (1-12) */
  month?: number;
  /** Expiration year (4 digits) */
  year?: number;
  /** Whether card has expired */
  isExpired?: boolean;
  /** Parsed date object */
  parsed?: { month: number; year: number } | null;
  /** Formatted expiration date */
  formatted?: string;
};

/**
 * CVV validation result
 */
export type CardCVVValidationResult = {
  /** Whether CVV is valid */
  valid: boolean;
  /** Validation errors */
  errors: string[];
  /** CVV length */
  length?: number | null;
  /** Expected CVV lengths for card type */
  expectedLength?: number[];
};

/**
 * Complete credit card data for validation
 */
export type CardComprehensiveData = {
  /** Credit card number */
  cardNumber: string;
  /** Expiration date (MM/YY or MM/YYYY) */
  expirationDate: string;
  /** CVV/CVC security code */
  cvv: string;
  /** Cardholder name (optional) */
  cardholderName?: string;
  /** Alternative: card number field */
  number?: string;
  /** Alternative: expiration field */
  expiration?: string;
  /** Alternative: name field */
  name?: string;
};

/**
 * Comprehensive card validation options
 */
export type CardComprehensiveValidationOptions = {
  /** Validate card number */
  validateCardNumber?: boolean;
  /** Validate expiration date */
  validateExpiration?: boolean;
  /** Validate CVV */
  validateCVV?: boolean;
  /** Validate cardholder name */
  validateCardholder?: boolean;
  /** Allow past expiration dates */
  allowPastDates?: boolean;
  /** Allow spaces in card number */
  allowSpaces?: boolean;
  /** Allow dashes in card number */
  allowDashes?: boolean;
};

/**
 * Individual field validation results
 */
export type CardValidationResults = {
  /** Card number validation result */
  number?: { valid: boolean; errors?: string[]; type?: string | null };
  /** Expiration validation result */
  expiration?: { valid: boolean; errors?: string[] };
  /** CVV validation result */
  cvv?: { valid: boolean; errors?: string[] };
  /** Name validation result */
  name?: { valid: boolean; errors?: string[] };
};

/**
 * Comprehensive credit card validation result
 */
export type CardComprehensiveValidationResult = {
  /** Overall validation status */
  valid: boolean;
  /** All validation errors */
  errors: string[];
  /** Whether card number is valid */
  cardNumberValid?: boolean;
  /** Whether expiration is valid */
  expirationValid?: boolean;
  /** Whether CVV is valid */
  cvvValid?: boolean;
  /** Whether cardholder name is valid */
  cardholderValid?: boolean;
  /** Detected card type */
  cardType?: string | null;
  /** Individual field results */
  results?: CardValidationResults;
};

/**
 * Cardholder name validation result
 */
export type CardCardholderNameResult = {
  /** Whether name is valid */
  valid: boolean;
  /** Validation errors */
  errors: string[];
  /** Normalized name */
  normalized?: string;
  /** Trimmed name */
  trimmed?: string;
  /** Original input name */
  original?: string;
};

/**
 * Card number formatting options
 */
export type CardFormatOptions = {
  /** Character separator (default: ' ') */
  separator?: string;
  /** Group sizes for formatting */
  groupSize?: number[];
  /** Mask all but last 4 digits */
  mask?: boolean;
};

/**
 * Card number formatting result
 */
export type CardFormatResult = {
  /** Formatted card number */
  formatted: string;
  /** Original card number */
  original: string;
  /** Whether formatting succeeded */
  valid?: boolean;
  /** Validation errors */
  errors?: string[];
  /** Detected card type */
  cardType?: string | null;
  /** Whether number was masked */
  masked?: boolean;
};

/**
 * Test credit card data
 */
export type CardTestData = {
  /** Test card number */
  cardNumber?: string;
  /** Card type */
  type: string;
  /** Test CVV */
  cvv: string;
  /** Test expiration date */
  expirationDate?: string;
  /** Cleaned card number (alias for cardNumber) */
  number?: string;
  /** Expiration (alias for expirationDate) */
  expiration?: string;
  /** Cardholder name */
  name?: string;
};

/**
 * Validate credit card number using Luhn algorithm
 * @param cardNumber - Credit card number to validate
 * @param options - Validation options
 * @param options.allowSpaces - Allow spaces in card number (default: true)
 * @param options.allowDashes - Allow dashes in card number (default: true)
 * @returns Validation result with card type
 * @throws {Error} When validation encounters errors
 * @example
 * const result = validateCreditCardNumber('4111 1111 1111 1111');
 * console.log(result.valid); // true
 */
export const validateCreditCardNumber = (
  cardNumber: string,
  options: CardValidationOptions = {}
): CardNumberValidationResult => {
  const { allowSpaces = true, allowDashes = true } = options;

  try {
    if (!cardNumber || typeof cardNumber !== 'string') {
      return {
        valid: false,
        errors: ['Credit card number is required and must be a string'],
        type: null,
      };
    }

    // Remove formatting characters if allowed
    let cleaned = cardNumber;
    if (allowSpaces) {
      cleaned = cleaned.replace(/\s/g, '');
    }
    if (allowDashes) {
      cleaned = cleaned.replace(/-/g, '');
    }

    // Check if only digits remain
    if (!/^\d+$/.test(cleaned)) {
      return {
        valid: false,
        errors: ['Credit card number must contain only digits'],
        type: null,
        cleaned,
      };
    }

    // Check length
    if (cleaned.length < 13 || cleaned.length > 19) {
      return {
        valid: false,
        errors: ['Credit card number must be between 13 and 19 digits'],
        type: null,
        cleaned,
      };
    }

    // Luhn algorithm validation
    const luhnValid = validateLuhn(cleaned);
    if (!luhnValid) {
      return {
        valid: false,
        errors: ['Invalid credit card number (Luhn check failed)'],
        type: null,
        cleaned,
      };
    }

    const cardType = detectCreditCardType(cleaned);

    logger.info(`Credit card validation passed: ${cardType} ending in ${cleaned.slice(-4)}`);

    return {
      valid: true,
      errors: [],
      cleaned,
      original: cardNumber,
      type: cardType,
      length: cleaned.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Credit card validation error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage],
      type: null,
    };
  }
};

/**
 * Implement Luhn algorithm for credit card validation
 * @param {string} cardNumber - Clean card number (digits only)
 * @returns {boolean} True if valid according to Luhn algorithm
 * @example
 * const isValid = validateLuhn('4111111111111111');
 * console.log(isValid); // true
 */
export const validateLuhn = (cardNumber: string): boolean => {
  try {
    if (!cardNumber || typeof cardNumber !== 'string' || !/^\d+$/.test(cardNumber)) {
      return false;
    }

    let sum = 0;
    let alternate = false;

    // Process digits from right to left
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);

      if (alternate) {
        digit *= 2;
        if (digit > 9) {
          digit = Math.floor(digit / 10) + (digit % 10);
        }
      }

      sum += digit;
      alternate = !alternate;
    }

    return sum % 10 === 0;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Luhn validation error: ${errorMessage}`);
    return false;
  }
};

/**
 * Detect credit card type from number
 * @param {string} cardNumber - Clean card number (digits only)
 * @returns {string} Card type or 'unknown'
 * @example
 * const type = detectCreditCardType('4111111111111111');
 * console.log(type); // 'visa'
 */
export const detectCreditCardType = (cardNumber: string): CardTypeResult => {
  try {
    if (!cardNumber || typeof cardNumber !== 'string') {
      return 'unknown';
    }

    const patterns = {
      visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      mastercard:
        /^5[1-5][0-9]{14}$|^2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9][0-9]|7(?:[01][0-9]|20))[0-9]{12}$/,
      amex: /^3[47][0-9]{13}$/,
      discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
      dinersclub: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
      jcb: /^(?:2131|1800|35\d{3})\d{11}$/,
      unionpay: /^(62|88)[0-9]{14,17}$/,
      maestro: /^(?:5[0678]\d\d|6304|6390|67\d\d)\d{8,15}$/,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cardNumber)) {
        return type;
      }
    }

    return 'unknown';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Card type detection error: ${errorMessage}`);
    return 'unknown';
  }
};

/**
 * Validate credit card expiration date
 * @param expiration - Expiration date (MM/YY, MM/YYYY, or {month, year})
 * @param options - Validation options
 * @param options.allowPastDates - Allow past expiration dates (default: false)
 * @returns Validation result with parsed date
 * @throws {Error} When date validation encounters errors
 * @example
 * const result = validateExpirationDate('12/25');
 * console.log(result.valid); // true (if current date is before 12/25)
 */
export const validateExpirationDate = (
  expiration: string | { month: number; year: number },
  options: CardExpirationOptions = {}
): CardExpirationValidationResult => {
  const { allowPastDates = false } = options;

  try {
    if (!expiration) {
      return {
        valid: false,
        errors: ['Expiration date is required'],
        parsed: null,
      };
    }

    let month, year;

    if (typeof expiration === 'string') {
      // Parse string formats: MM/YY, MM/YYYY, MM-YY, MM-YYYY
      const match = expiration.match(/^(\d{1,2})[/-](\d{2,4})$/);
      if (!match) {
        return {
          valid: false,
          errors: ['Invalid expiration date format (use MM/YY or MM/YYYY)'],
          parsed: null,
        };
      }

      month = parseInt(match[1]);
      year = parseInt(match[2]);

      // Convert 2-digit year to 4-digit
      if (year < 100) {
        const currentYear = new Date().getFullYear();
        const currentCentury = Math.floor(currentYear / 100) * 100;
        year = currentCentury + (year as number);

        // If the year is more than 50 years in the past, assume next century
        if (year < currentYear - 50) {
          year += 100;
        }
      }
    } else if (typeof expiration === 'object') {
      month = expiration.month;
      year = expiration.year;
    } else {
      return {
        valid: false,
        errors: ['Expiration date must be a string or object'],
        parsed: null,
      };
    }

    const errors = [];

    // Validate month
    if (!month || month < 1 || month > 12) {
      errors.push('Invalid month (must be 1-12)');
    }

    // Validate year
    const currentYear = new Date().getFullYear();
    if (!year || year < currentYear - 10 || year > currentYear + 20) {
      errors.push('Invalid year');
    }

    // Check if date is in the past
    let isExpired = false;
    if (!allowPastDates && month && year) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYearActual = now.getFullYear();

      if (year < currentYearActual || (year === currentYearActual && month < currentMonth)) {
        errors.push('Card has expired');
        isExpired = true;
      }
    }

    const valid = errors.length === 0;

    if (valid) {
      logger.info(`Expiration date validation passed: ${month}/${year}`);
    } else {
      logger.warn(`Expiration date validation failed: ${errors.join(', ')}`);
    }

    return {
      valid,
      errors: errors as string[],
      month: month as number,
      year: year as number,
      isExpired,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Expiration date validation error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage],
      month: undefined,
      year: undefined,
    };
  }
};

/**
 * Validate CVV/CVC security code
 * @param {string} cvv - CVV code to validate
 * @param {string} cardType - Credit card type (optional, for length validation)
 * @returns {Object} Validation result
 * @example
 * const result = validateCVV('123', 'visa');
 * console.log(result.valid); // true
 */
export const validateCVV = (
  cvv: string,
  cardType: string | null = null
): CardCVVValidationResult => {
  try {
    if (!cvv || typeof cvv !== 'string') {
      return {
        valid: false,
        errors: ['CVV is required and must be a string'],
        length: null,
      };
    }

    const cleaned = cvv.replace(/\s/g, '');

    // Check if only digits
    if (!/^\d+$/.test(cleaned)) {
      return {
        valid: false,
        errors: ['CVV must contain only digits'],
        length: cleaned.length,
      };
    }

    const errors = [];
    let expectedLength = [3, 4]; // Default: 3 or 4 digits

    // Set expected length based on card type
    if (cardType) {
      switch (cardType.toLowerCase()) {
        case 'amex':
        case 'american express':
          expectedLength = [4];
          break;
        case 'visa':
        case 'mastercard':
        case 'discover':
        case 'jcb':
        case 'dinersclub':
        case 'maestro':
        case 'unionpay':
          expectedLength = [3];
          break;
      }
    }

    if (!expectedLength.includes(cleaned.length)) {
      const lengthStr =
        expectedLength.length === 1
          ? `${expectedLength[0]} digits`
          : `${expectedLength.join(' or ')} digits`;
      errors.push(`CVV must be ${lengthStr}${cardType ? ` for ${cardType}` : ''}`);
    }

    const valid = errors.length === 0;

    if (valid) {
      logger.info(`CVV validation passed: ${cleaned.length} digits`);
    } else {
      logger.warn(`CVV validation failed: ${errors.join(', ')}`);
    }

    return {
      valid,
      errors: errors as string[],
      length: cleaned.length,
      expectedLength,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`CVV validation error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage] as string[],
      length: null,
    };
  }
};

/**
 * Comprehensive credit card validation
 * @param {Object} cardData - Credit card data to validate
 * @param {string} cardData.number - Card number
 * @param {string} cardData.expiration - Expiration date
 * @param {string} cardData.cvv - CVV code
 * @param {string} cardData.name - Cardholder name (optional)
 * @param {Object} options - Validation options
 * @returns {Object} Comprehensive validation result
 * @example
 * const result = validateCreditCard({
 *   number: '4111 1111 1111 1111',
 *   expiration: '12/25',
 *   cvv: '123',
 *   name: 'John Doe'
 * });
 */
export const validateCreditCard = (
  cardData: CardComprehensiveData,
  options: CardComprehensiveValidationOptions = {}
): CardComprehensiveValidationResult => {
  try {
    if (!cardData || typeof cardData !== 'object') {
      return {
        valid: false,
        errors: ['Card data is required and must be an object'],
        results: {},
      };
    }

    const results = {
      number: { valid: false, errors: [], type: null } as CardNumberValidationResult,
      expiration: { valid: false, errors: [], parsed: null } as CardExpirationValidationResult,
      cvv: { valid: false, errors: [], length: null } as CardCVVValidationResult,
      name: { valid: true, errors: [] } as CardCardholderNameResult, // Optional field
    };

    const errors: string[] = [];

    // Validate card number
    if (cardData.number) {
      results.number = validateCreditCardNumber(cardData.number, options);
      if (!results.number.valid && results.number.errors) {
        errors.push(...results.number.errors);
      }
    } else {
      results.number = { valid: false, errors: ['Card number is required'], type: null };
      errors.push('Card number is required');
    }

    // Validate expiration date
    if (cardData.expiration) {
      results.expiration = validateExpirationDate(cardData.expiration, options);
      if (!results.expiration.valid && results.expiration.errors) {
        errors.push(...results.expiration.errors);
      }
    } else {
      results.expiration = { valid: false, errors: ['Expiration date is required'], parsed: null };
      errors.push('Expiration date is required');
    }

    // Validate CVV
    if (cardData.cvv) {
      const cardType = results.number.valid && results.number.type ? results.number.type : null;
      results.cvv = validateCVV(cardData.cvv, cardType);
      if (!results.cvv.valid && results.cvv.errors) {
        errors.push(...results.cvv.errors);
      }
    } else {
      results.cvv = { valid: false, errors: ['CVV is required'], length: null };
      errors.push('CVV is required');
    }

    // Validate cardholder name (optional)
    if (cardData.name) {
      results.name = validateCardholderName(cardData.name);
      if (!results.name.valid) {
        errors.push(...results.name.errors);
      }
    }

    const allValid = Object.values(results).every(result => result.valid);

    if (allValid) {
      logger.info('Comprehensive credit card validation passed');
    } else {
      logger.warn(`Credit card validation failed: ${errors.join(', ')}`);
    }

    return {
      valid: allValid,
      errors: errors as string[],
      results: results as unknown as Record<string, unknown>,
      cardType: results.number.valid ? (results.number.type as string | null) : null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Comprehensive credit card validation error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage] as string[],
      results: {} as Record<string, unknown>,
      cardType: null,
    };
  }
};

/**
 * Validate cardholder name
 * @param {string} name - Cardholder name to validate
 * @returns {Object} Validation result
 * @example
 * const result = validateCardholderName('John Doe');
 * console.log(result.valid); // true
 */
export const validateCardholderName = (name: string): CardCardholderNameResult => {
  try {
    if (!name || typeof name !== 'string') {
      return {
        valid: false,
        errors: ['Cardholder name is required and must be a string'],
      };
    }

    const trimmed = name.trim();
    const errors = [];

    if (trimmed.length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    if (trimmed.length > 50) {
      errors.push('Name must be 50 characters or less');
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    if (!/^[a-zA-Z\s\-'.]+$/.test(trimmed)) {
      errors.push('Name contains invalid characters');
    }

    // Check for at least one letter
    if (!/[a-zA-Z]/.test(trimmed)) {
      errors.push('Name must contain at least one letter');
    }

    const valid = errors.length === 0;

    return {
      valid,
      errors: errors as string[],
      trimmed,
      original: name,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Cardholder name validation error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage] as string[],
    };
  }
};

/**
 * Format credit card number for display
 * @param {string} cardNumber - Credit card number to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.mask - Mask all but last 4 digits (default: false)
 * @param {string} options.separator - Separator character (default: ' ')
 * @returns {Object} Formatted card number
 * @example
 * const result = formatCreditCardNumber('4111111111111111', { mask: true });
 * console.log(result.formatted); // '**** **** **** 1111'
 */
export const formatCreditCardNumber = (
  cardNumber: string,
  options: CardFormatOptions = {}
): CardFormatResult => {
  const { mask = false, separator = ' ' } = options;

  try {
    const validation = validateCreditCardNumber(cardNumber);

    if (!validation.valid) {
      return {
        valid: false,
        errors: validation.errors,
        formatted: cardNumber,
        original: cardNumber,
      };
    }

    const cleaned = validation.cleaned;
    if (!cleaned) {
      return {
        valid: false,
        errors: ['Unable to clean card number'],
        formatted: cardNumber,
        original: cardNumber,
      };
    }

    let formatted = cleaned;

    // Apply masking if requested
    if (mask) {
      const lastFour = cleaned.slice(-4);
      const masked = '*'.repeat(cleaned.length - 4);
      formatted = masked + lastFour;
    }

    // Add separators based on card type
    const cardType = validation.type;
    switch (cardType) {
      case 'amex':
        // XXXX XXXXXX XXXXX format
        formatted = formatted.replace(/(\d{4})(\d{6})(\d{5})/, `$1${separator}$2${separator}$3`);
        break;
      case 'dinersclub':
        // XXXX XXXXXX XXXX format
        formatted = formatted.replace(/(\d{4})(\d{6})(\d{4})/, `$1${separator}$2${separator}$3`);
        break;
      default:
        // XXXX XXXX XXXX XXXX format (most cards)
        formatted = formatted.replace(/(\d{4})/g, `$1${separator}`).trim();
        break;
    }

    return {
      valid: true,
      formatted,
      original: cardNumber,
      cardType,
      masked: mask,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Credit card formatting error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage],
      formatted: cardNumber,
      original: cardNumber,
    };
  }
};

/**
 * Generate test credit card numbers for testing
 * @param {string} cardType - Type of card to generate ('visa', 'mastercard', 'amex')
 * @param {number} count - Number of cards to generate (default: 1)
 * @returns {Array<Object>} Array of test card data
 * @example
 * const testCards = generateTestCreditCards('visa', 3);
 * console.log(testCards[0].number); // Valid test Visa number
 */
export const generateTestCreditCards = (cardType = 'visa', count = 1): CardTestData[] => {
  try {
    const testNumbers = {
      visa: ['4111111111111111', '4012888888881881', '4222222222222', '4000000000000002'],
      mastercard: ['5555555555554444', '5105105105105100', '2223003122003222', '5425233430109903'],
      amex: ['378282246310005', '371449635398431', '378734493671000', '347653450306297'],
      discover: ['6011111111111117', '6011000990139424', '6011981111111113'],
    };

    const numbers =
      (testNumbers as Record<string, string[]>)[cardType.toLowerCase()] || testNumbers.visa;
    const cards: CardTestData[] = [];

    for (let i = 0; i < count; i++) {
      const number = (numbers as string[])[i % (numbers as string[]).length];
      const currentYear = new Date().getFullYear();
      const futureYear = currentYear + Math.floor(Math.random() * 5) + 1;
      const month = Math.floor(Math.random() * 12) + 1;

      cards.push({
        number,
        expiration: `${String(month).padStart(2, '0')}/${futureYear}`,
        cvv: cardType.toLowerCase() === 'amex' ? '1234' : '123',
        name: `Test User ${i + 1}`,
        type: cardType.toLowerCase(),
      });
    }

    logger.info(`Generated ${cards.length} test ${cardType} cards`);
    return cards as CardTestData[];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Test card generation error: ${errorMessage}`);
    return [] as CardTestData[];
  }
};
