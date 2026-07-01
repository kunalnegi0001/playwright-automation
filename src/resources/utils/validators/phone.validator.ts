/**
 * @fileoverview Phone number validation utilities for international formats.
 * Provides validation, normalization, and formatting for phone numbers across countries.
 * @module validators/phone.validator
 */

import { logger } from '@utils/core';

/**
 * Phone number validation configuration
 */
export type PhoneValidationOptions = {
  /** Country code (e.g., 'US', 'UK', 'IN') */
  country?: string;
  /** Strict validation requiring country code */
  strict?: boolean;
};

/**
 * Phone number validation result
 */
export type PhoneValidationResult = {
  /** Whether phone number is valid */
  valid: boolean;
  /** List of validation errors */
  errors: string[];
  /** Cleaned phone number (digits only) */
  cleaned?: string;
  /** Original input phone number */
  original?: string;
  /** Detected country code */
  country?: string;
  /** Phone type (mobile, landline, unknown) */
  type?: string | null;
  /** Carrier name if detected */
  carrier?: string | null;
};

/**
 * Phone number normalization options
 */
export type PhoneNormalizationOptions = {
  /** Country code for normalization */
  country?: string;
  /** Output format: 'international', 'national', 'e164' */
  format?: string;
};

/**
 * Phone number normalization result
 */
export type PhoneNormalizationResult = {
  /** Whether normalization succeeded */
  valid: boolean;
  /** Normalization errors if any */
  errors?: string[];
  /** Original input phone number */
  original: string;
  /** Cleaned phone number (digits only) */
  cleaned?: string;
  /** Normalized phone number with country code */
  normalized?: string;
  /** Formatted phone number for display */
  formatted?: string;
  /** Country code used */
  country?: string;
  /** Format applied */
  format?: string;
  /** Numeric country code */
  countryCode?: string;
};

/**
 * Comprehensive phone validation options
 */
export type PhoneComprehensiveOptions = {
  /** Country code for validation */
  country?: string;
  /** Allow mobile phone numbers */
  allowMobile?: boolean;
  /** Allow landline phone numbers */
  allowLandline?: boolean;
};

/**
 * Phone extraction configuration
 */
export type PhoneExtractionOptions = {
  /** Country code for validation */
  country?: string;
};

/**
 * Invalid phone number with errors
 */
export type PhoneInvalidPhone = {
  /** Invalid phone number */
  phone: string;
  /** Validation errors */
  errors: string[];
};

/**
 * Phone extraction result from text
 */
export type PhoneExtractionResult = {
  /** All extracted phone numbers */
  phones: string[];
  /** Valid phone numbers */
  validPhones: string[];
  /** Invalid phone numbers with errors */
  invalidPhones: PhoneInvalidPhone[];
  /** Total count of phones found */
  totalFound?: number;
  /** Count of valid phones */
  validCount?: number;
  /** Count of invalid phones */
  invalidCount?: number;
  /** Extraction errors */
  errors?: string[];
};

/**
 * Phone list validation options
 */
export type PhoneListOptions = {
  /** Country code for validation */
  country?: string;
};

/**
 * Phone list validation result with statistics
 */
export type PhoneListResult = {
  /** Overall validation status */
  valid?: boolean;
  /** Validation errors */
  errors?: string[];
  /** Total phones processed */
  totalCount: number;
  /** Count of valid phones */
  validCount?: number;
  /** Count of invalid phones */
  invalidCount?: number;
  /** Array of valid phone numbers */
  validPhones?: string[];
  /** Array of invalid phones with errors */
  invalidPhones?: PhoneInvalidPhone[];
  /** Duplicate phone numbers found */
  duplicates?: string[];
  /** Success rate percentage */
  successRate?: number;
};

/**
 * Phone metadata retrieval options
 */
export type PhoneMetadataOptions = {
  /** Country code for metadata lookup */
  country?: string;
};

/**
 * Phone number metadata information
 */
export type PhoneMetadata = {
  /** Country code */
  country: string;
  /** Geographic region */
  region: string | null;
  /** Timezone information */
  timezone: string | null;
  /** Phone number length */
  length: number;
  /** Whether number has country code */
  hasCountryCode: boolean;
  /** Possible phone type */
  possibleType: string;
};

/**
 * Phone metadata retrieval result
 */
export type PhoneMetadataResult = {
  /** Whether metadata retrieval succeeded */
  valid: boolean;
  /** Retrieval errors */
  errors?: string[];
  /** Phone number processed */
  phone?: string;
  /** Cleaned phone number */
  cleaned?: string;
  /** Metadata object */
  metadata: PhoneMetadata | null;
};

/**
 * Phone display formatting options
 */
export type PhoneDisplayOptions = {
  /** Format style: 'national', 'international', 'masked' */
  style?: string;
  /** Country code for formatting */
  country?: string;
};

/**
 * Phone display formatting result
 */
export type PhoneDisplayResult = {
  /** Whether formatting succeeded */
  valid: boolean;
  /** Formatting errors */
  errors?: string[];
  /** Original phone number */
  original?: string;
  /** Formatted phone number */
  formatted: string;
  /** Style applied */
  style?: string;
  /** Country used for formatting */
  country?: string;
};

/**
 * Test phone generation options
 */
export type PhoneGenerateOptions = {
  /** Number of phones to generate */
  count?: number;
  /** Country code for generation */
  country?: string;
  /** Phone type: 'mobile', 'landline', 'mixed' */
  type?: string;
};

/**
 * Carrier validation result
 */
export type PhoneCarrierResult = {
  /** Whether carrier check succeeded */
  valid: boolean;
  /** Carrier check errors */
  errors?: string[];
  /** Phone number checked */
  phone?: string;
  /** Carrier name */
  carrier?: string;
  /** Whether phone is from specified carrier */
  isFromCarrier: boolean;
  /** Additional notes */
  note?: string;
};

/**
 * @fileoverview Phone number validation helper functions
 * Provides comprehensive phone number validation for international formats
 * @module phone.validator
 */

/**
 * Basic phone number format validation
 * @param {string} phone - Phone number to validate
 * @param {Object} options - Validation options
 * @param {string} options.country - Country code (default: 'US')
 * @param {boolean} options.strict - Strict validation (default: false)
 * @returns {Object} Validation result
 * @example
 * const result = validatePhoneFormat('+1-555-123-4567');
 * console.log(result.valid); // true
 */
export const validatePhoneFormat = (
  phone: string,
  options: PhoneValidationOptions = {}
): PhoneValidationResult => {
  const { country = 'US', strict = false } = options;

  try {
    if (!phone || typeof phone !== 'string') {
      return { valid: false, errors: ['Phone number is required and must be a string'] };
    }

    // Remove common formatting characters
    const cleaned = phone.replace(/[\s\-().+]/g, '');

    const patterns = {
      US: {
        loose: /^(\+?1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/,
        strict: /^\+1[2-9]\d{2}[2-9]\d{2}\d{4}$/,
      },
      UK: {
        loose: /^(\+?44)?[1-9]\d{8,9}$/,
        strict: /^\+44[1-9]\d{8,9}$/,
      },
      CA: {
        loose: /^(\+?1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/,
        strict: /^\+1[2-9]\d{2}[2-9]\d{2}\d{4}$/,
      },
      AU: {
        loose: /^(\+?61)?[2-478]\d{8}$/,
        strict: /^\+61[2-478]\d{8}$/,
      },
      DE: {
        loose: /^(\+?49)?[1-9]\d{10,11}$/,
        strict: /^\+49[1-9]\d{10,11}$/,
      },
      IN: {
        loose: /^(\+?91)?[6-9]\d{9}$/,
        strict: /^\+91[6-9]\d{9}$/,
      },
      INTERNATIONAL: {
        loose: /^(\+\d{1,3})?\d{4,15}$/,
        strict: /^\+\d{1,3}\d{4,15}$/,
      },
    };

    const pattern =
      (patterns as Record<string, { strict: RegExp; loose: RegExp }>)[country.toUpperCase()] ||
      patterns.INTERNATIONAL;
    const regex = strict
      ? (pattern as { strict: RegExp; loose: RegExp }).strict
      : (pattern as { strict: RegExp; loose: RegExp }).loose;
    const valid = (regex as RegExp).test(cleaned);

    const errors = [];
    if (!valid) {
      errors.push(`Invalid ${country} phone number format`);

      if (cleaned.length < 7) {
        errors.push('Phone number too short');
      } else if (cleaned.length > 20) {
        errors.push('Phone number too long');
      }
    }

    if (valid) {
      logger.info(`Phone format validation passed: ${phone}`);
    } else {
      logger.warn(`Phone format validation failed: ${phone} - ${errors.join(', ')}`);
    }

    return {
      valid,
      errors: errors as string[],
      cleaned,
      original: phone,
      country,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Phone format validation error: ${errorMessage}`);
    return { valid: false, errors: [errorMessage] };
  }
};

/**
 * Normalize phone number to standard format
 * @param {string} phone - Phone number to normalize
 * @param {Object} options - Normalization options
 * @param {string} options.country - Country code (default: 'US')
 * @param {string} options.format - Output format: 'international', 'national', 'e164' (default: 'international')
 * @returns {Object} Normalized phone number
 * @example
 * const result = normalizePhoneNumber('555-123-4567', { country: 'US' });
 * console.log(result.formatted); // '+1-555-123-4567'
 */
export const normalizePhoneNumber = (
  phone: string,
  options: PhoneNormalizationOptions = {}
): PhoneNormalizationResult => {
  const { country = 'US', format = 'international' } = options;

  try {
    if (!phone || typeof phone !== 'string') {
      return {
        valid: false,
        errors: ['Phone number is required and must be a string'],
        original: phone,
      };
    }

    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');

    // Country code mappings
    const countryCodes = {
      US: '1',
      CA: '1',
      UK: '44',
      AU: '61',
      DE: '49',
      IN: '91',
      FR: '33',
      IT: '39',
      ES: '34',
      NL: '31',
      BR: '55',
      MX: '52',
    };

    let normalized = cleaned;
    const countryCode = (countryCodes as Record<string, string>)[country.toUpperCase()] || '1';

    // Add country code if missing
    if (!normalized.startsWith('+')) {
      if (!normalized.startsWith(countryCode)) {
        normalized = `${countryCode}${normalized}`;
      }
      normalized = `+${normalized}`;
    }

    // Format according to requested format
    let formatted;
    switch (format.toLowerCase()) {
      case 'e164':
        formatted = normalized.replace(/[^\d+]/g, '');
        break;
      case 'national':
        formatted = normalized.replace(`+${countryCode}`, '');
        if (country.toUpperCase() === 'US' && (formatted as string).length === 10) {
          formatted = `(${(formatted as string).slice(0, 3)}) ${(formatted as string).slice(3, 6)}-${(formatted as string).slice(6)}`;
        }
        break;
      case 'international':
      default:
        if (country.toUpperCase() === 'US' && (normalized as string).length === 12) {
          formatted = `${(normalized as string).slice(0, 2)}-${(normalized as string).slice(2, 5)}-${(normalized as string).slice(5, 8)}-${(normalized as string).slice(8)}`;
        } else {
          formatted = normalized;
        }
        break;
    }

    const result = {
      valid: true,
      original: phone,
      cleaned,
      normalized: normalized as string,
      formatted: formatted as string,
      country,
      format,
      countryCode,
    };

    logger.info(`Phone normalization successful: ${phone} -> ${formatted}`);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Phone normalization error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage] as string[],
      original: phone,
    };
  }
};

/**
 * Validate phone number with comprehensive checks
 * @param {string} phone - Phone number to validate
 * @param {Object} options - Validation options
 * @param {string} options.country - Country code (default: 'US')
 * @param {boolean} options.allowMobile - Allow mobile numbers (default: true)
 * @param {boolean} options.allowLandline - Allow landline numbers (default: true)
 * @returns {Object} Comprehensive validation result
 * @example
 * const result = validatePhoneComprehensive('+1-555-123-4567', { country: 'US' });
 * console.log(result.type); // 'mobile' or 'landline'
 */
export const validatePhoneComprehensive = (
  phone: string,
  options: PhoneComprehensiveOptions = {}
): PhoneValidationResult => {
  const { country = 'US', allowMobile = true, allowLandline = true } = options;

  try {
    const formatResult = validatePhoneFormat(phone, { country, strict: false });

    if (!formatResult.valid) {
      return {
        ...formatResult,
        type: null,
        carrier: null,
      };
    }

    const cleaned = formatResult.cleaned;
    if (!cleaned) {
      return {
        valid: false,
        errors: ['Unable to clean phone number'],
        type: 'unknown',
        carrier: null,
        country,
      };
    }

    let type = 'unknown';
    const carrier = null;

    // Simple heuristics for phone type detection (in real implementation, use libphonenumber)
    if (country.toUpperCase() === 'US') {
      const areaCode = cleaned.length >= 10 ? cleaned.slice(-10, -7) : '';
      const exchange = cleaned.length >= 10 ? cleaned.slice(-7, -4) : '';

      // Mobile area codes (simplified)
      const mobileAreaCodes = ['201', '202', '206', '212', '213', '214', '215'];
      const mobileExchanges = ['555', '666', '777', '888', '999'];

      if (mobileAreaCodes.includes(areaCode) || mobileExchanges.includes(exchange)) {
        type = 'mobile';
      } else if (areaCode && exchange) {
        type = 'landline';
      }
    }

    const isValidType =
      (type === 'mobile' && allowMobile) ||
      (type === 'landline' && allowLandline) ||
      type === 'unknown';

    const errors = [];
    if (!isValidType) {
      if (type === 'mobile' && !allowMobile) {
        errors.push('Mobile numbers are not allowed');
      } else if (type === 'landline' && !allowLandline) {
        errors.push('Landline numbers are not allowed');
      }
    }

    return {
      valid: isValidType,
      errors,
      type,
      carrier: carrier || undefined,
      country,
      ...(formatResult as Record<string, unknown>),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Comprehensive phone validation error: ${errorMessage}`);
    return { valid: false, errors: [errorMessage] };
  }
};

/**
 * Extract phone numbers from text
 * @param {string} text - Text containing phone numbers
 * @param {Object} options - Extraction options
 * @param {string} options.country - Country to validate against (default: 'US')
 * @returns {Object} Extracted phone numbers
 * @example
 * const result = extractPhonesFromText('Call us at 555-123-4567 or 1-800-555-0123');
 * console.log(result.phones); // ['555-123-4567', '1-800-555-0123']
 */
export const extractPhonesFromText = (
  text: string,
  options: PhoneExtractionOptions = {}
): PhoneExtractionResult => {
  const { country = 'US' } = options;

  try {
    if (!text || typeof text !== 'string') {
      return { phones: [], validPhones: [], invalidPhones: [], errors: [] };
    }

    // Phone number patterns for extraction
    const patterns = [
      /\+\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,9}/g,
      /\(\d{3}\)[\s-]?\d{3}[\s-]?\d{4}/g,
      /\d{3}[\s-]?\d{3}[\s-]?\d{4}/g,
      /\d{3}\.\d{3}\.\d{4}/g,
    ];

    let foundPhones: string[] = [];
    patterns.forEach(pattern => {
      const matches = text.match(pattern) || ([] as string[]);
      foundPhones.push(...(matches as string[]));
    });

    // Remove duplicates
    foundPhones = [...new Set(foundPhones)];

    const validPhones: string[] = [];
    const invalidPhones: PhoneInvalidPhone[] = [];

    foundPhones.forEach(phone => {
      const validation = validatePhoneFormat(phone, { country }) as {
        valid: boolean;
        errors?: string[];
      };
      if (validation.valid) {
        validPhones.push(phone);
      } else {
        invalidPhones.push({ phone, errors: validation.errors || [] });
      }
    });

    logger.info(
      `Extracted ${foundPhones.length} phone numbers from text (${validPhones.length} valid)`
    );

    return {
      phones: foundPhones as string[],
      validPhones: validPhones as string[],
      invalidPhones: invalidPhones as PhoneInvalidPhone[],
      totalFound: foundPhones.length,
      validCount: validPhones.length,
      invalidCount: invalidPhones.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Phone extraction error: ${errorMessage}`);
    return { phones: [], validPhones: [], invalidPhones: [], errors: [errorMessage] };
  }
};

/**
 * Validate list of phone numbers
 * @param {Array<string>} phones - Array of phone numbers
 * @param {Object} options - Validation options
 * @param {string} options.country - Country code (default: 'US')
 * @returns {Object} Validation statistics
 * @example
 * const stats = validatePhoneList(['555-123-4567', 'invalid-phone']);
 * console.log(stats.validCount, stats.invalidCount);
 */
export const validatePhoneList = (
  phones: string[],
  options: PhoneListOptions = {}
): PhoneListResult => {
  const { country = 'US' } = options;

  try {
    if (!Array.isArray(phones)) {
      return {
        valid: false,
        errors: ['Input must be an array of phone numbers'],
        totalCount: 0,
      };
    }

    const results: PhoneListResult = {
      totalCount: phones.length,
      validCount: 0,
      invalidCount: 0,
      validPhones: [],
      invalidPhones: [],
      duplicates: [],
      successRate: 0,
    };

    // Check for duplicates
    const seen = new Set<string>();
    phones.forEach(phone => {
      const cleaned = phone?.replace(/[^\d]/g, '') || '';
      if (seen.has(cleaned)) {
        results.duplicates!.push(phone);
      }
      seen.add(cleaned);
    });

    // Validate each phone
    phones.forEach(phone => {
      try {
        const validation = validatePhoneComprehensive(phone, { country });

        if (validation.valid) {
          results.validCount!++;
          results.validPhones!.push(phone);
        } else {
          results.invalidCount!++;
          results.invalidPhones!.push({
            phone,
            errors: validation.errors,
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.invalidCount!++;
        results.invalidPhones!.push({
          phone,
          errors: [errorMessage],
        });
      }
    });

    results.successRate = Math.round((results.validCount! / results.totalCount) * 100);

    logger.info(
      `Phone list validation: ${results.validCount}/${results.totalCount} valid (${results.successRate}%)`
    );
    return results;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Phone list validation error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage],
      totalCount: phones?.length || 0,
    };
  }
};

/**
 * Get phone number metadata
 * @param {string} phone - Phone number to analyze
 * @param {Object} options - Analysis options
 * @param {string} options.country - Country code (default: 'US')
 * @returns {Object} Phone metadata
 * @example
 * const metadata = getPhoneMetadata('+1-555-123-4567');
 * console.log(metadata.country, metadata.region, metadata.type);
 */
export const getPhoneMetadata = (
  phone: string,
  options: PhoneMetadataOptions = {}
): PhoneMetadataResult => {
  const { country = 'US' } = options;

  try {
    const validation = validatePhoneFormat(phone, { country });

    if (!validation.valid) {
      return {
        valid: false,
        errors: validation.errors,
        metadata: null,
      };
    }

    const cleaned = validation.cleaned;
    if (!cleaned) {
      return {
        valid: false,
        errors: ['Unable to clean phone number'],
        metadata: null,
      };
    }

    // Basic metadata extraction (in real implementation, use libphonenumber)
    let detectedCountry = country;
    let region: string | null = null;
    let timezone: string | null = null;

    // Country detection from country code
    if (cleaned.startsWith('1')) {
      detectedCountry = 'US';
      region = 'North America';
      timezone = 'Various (UTC-12 to UTC-5)';
    } else if (cleaned.startsWith('44')) {
      detectedCountry = 'UK';
      region = 'Europe';
      timezone = 'UTC+0';
    } else if (cleaned.startsWith('61')) {
      detectedCountry = 'AU';
      region = 'Australia/Oceania';
      timezone = 'Various (UTC+8 to UTC+11)';
    }

    const metadata: PhoneMetadata = {
      country: detectedCountry,
      region: region || 'Unknown',
      timezone: timezone || 'Unknown',
      length: cleaned.length,
      hasCountryCode: cleaned.length > 10,
      possibleType: (validation as { type?: string }).type || 'unknown',
    };

    return {
      valid: true,
      phone,
      cleaned,
      metadata,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Phone metadata extraction error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage],
      metadata: null,
    };
  }
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @param {Object} options - Formatting options
 * @param {string} options.style - Format style: 'national', 'international', 'masked' (default: 'national')
 * @param {string} options.country - Country code (default: 'US')
 * @returns {Object} Formatted phone number
 * @example
 * const result = formatPhoneForDisplay('5551234567', { style: 'national', country: 'US' });
 * console.log(result.formatted); // '(555) 123-4567'
 */
export const formatPhoneForDisplay = (
  phone: string,
  options: PhoneDisplayOptions = {}
): PhoneDisplayResult => {
  const { style = 'national', country = 'US' } = options;

  try {
    const validation = validatePhoneFormat(phone, { country });

    if (!validation.valid) {
      return {
        valid: false,
        errors: validation.errors,
        formatted: phone,
      };
    }

    const cleaned = validation.cleaned;
    if (!cleaned) {
      return {
        valid: false,
        errors: ['Unable to clean phone number'],
        formatted: phone,
      };
    }

    let formatted = cleaned;

    if (country.toUpperCase() === 'US' && cleaned.length >= 10) {
      const number = cleaned.slice(-10);
      const areaCode = number.slice(0, 3);
      const exchange = number.slice(3, 6);
      const lineNumber = number.slice(6);

      switch (style.toLowerCase()) {
        case 'national':
          formatted = `(${areaCode}) ${exchange}-${lineNumber}`;
          break;
        case 'international':
          formatted = `+1 ${areaCode} ${exchange} ${lineNumber}`;
          break;
        case 'masked':
          formatted = `(${areaCode}) ***-${lineNumber}`;
          break;
        default:
          formatted = cleaned;
      }
    }

    return {
      valid: true,
      original: phone,
      formatted,
      style,
      country,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Phone formatting error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage],
      formatted: phone,
    };
  }
};

/**
 * Generate test phone numbers for testing
 * @param {Object} options - Generation options
 * @param {number} options.count - Number of phones to generate (default: 5)
 * @param {string} options.country - Country code (default: 'US')
 * @param {string} options.type - Phone type: 'mobile', 'landline', 'mixed' (default: 'mixed')
 * @returns {Array<string>} Array of generated phone numbers
 * @example
 * const phones = generateTestPhones({ count: 3, country: 'US', type: 'mobile' });
 */
export const generateTestPhones = (options: PhoneGenerateOptions = {}): string[] => {
  const { count = 5, country = 'US' } = options;

  try {
    const phones: string[] = [];

    for (let i = 0; i < count; i++) {
      let phone;

      if (country.toUpperCase() === 'US') {
        // Generate US phone numbers
        const areaCode = Math.floor(Math.random() * 800) + 200; // 200-999
        const exchange = Math.floor(Math.random() * 800) + 200; // 200-999
        const lineNumber = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, '0');

        phone = `+1${areaCode}${exchange}${lineNumber}`;
      } else {
        // Generate basic international format
        const countryCode = Math.floor(Math.random() * 99) + 1;
        const number = Math.floor(Math.random() * 1000000000);
        phone = `+${countryCode}${number}`;
      }

      phones.push(phone);
    }

    logger.info(`Generated ${phones.length} test phone numbers for ${country}`);
    return phones;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Test phone generation error: ${errorMessage}`);
    return [];
  }
};

/**
 * Check if phone number is from specific carrier
 * @param {string} phone - Phone number to check
 * @param {string} carrier - Carrier name to check against
 * @returns {Object} Carrier validation result
 * @example
 * const result = isPhoneFromCarrier('555-123-4567', 'Verizon');
 * console.log(result.isFromCarrier); // true/false
 */
export const isPhoneFromCarrier = (phone: string, carrier: string): PhoneCarrierResult => {
  try {
    const validation = validatePhoneFormat(phone);

    if (!validation.valid) {
      return {
        valid: false,
        errors: validation.errors,
        isFromCarrier: false,
      };
    }

    // Note: In real implementation, this would query carrier databases
    // This is a simplified mock implementation
    const carrierPrefixes: Record<string, string[]> = {
      Verizon: ['555', '666'],
      'AT&T': ['777', '888'],
      'T-Mobile': ['999', '111'],
      Sprint: ['222', '333'],
    };

    const cleaned = validation.cleaned!;
    const prefix = cleaned.slice(-7, -4); // Exchange code
    const isFromCarrier = carrierPrefixes[carrier]?.includes(prefix) || false;

    return {
      valid: true,
      phone,
      carrier,
      isFromCarrier,
      note: 'Mock implementation - use real carrier database for production',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Carrier check error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage],
      isFromCarrier: false,
    };
  }
};
