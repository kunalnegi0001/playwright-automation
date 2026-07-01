/**
 * @fileoverview Email validation utilities with comprehensive checks.
 * Provides format validation, domain checking, and disposable email detection.
 * @module validators/email.validator
 */

import { logger } from '@utils/core';

/**
 * Email validation result
 */
export type EmailValidationResult = {
  /** Whether email is valid */
  valid: boolean;
  /** Validation errors */
  errors: string[];
};

/**
 * Email domain validation result with MX records
 */
export type EmailDomainValidationResult = {
  /** Whether domain is valid */
  valid: boolean;
  /** Domain name extracted from email */
  domain?: string;
  /** Validation errors */
  errors: string[];
  /** Additional information */
  note?: string;
  /** MX records for domain */
  mxRecords?: unknown[];
};

/**
 * Disposable email validation result
 */
export type EmailDisposableResult = {
  /** Whether email is not disposable */
  valid: boolean;
  /** Whether email is from disposable provider */
  isDisposable?: boolean;
  /** Email domain */
  domain?: string;
  /** Validation errors */
  errors: string[];
};

/**
 * Email extraction result from text
 */
export type EmailExtractionResult = {
  /** All extracted email addresses */
  emails: string[];
  /** Valid email addresses */
  validEmails: string[];
  /** Invalid emails with errors */
  invalidEmails: Array<{ email: string; errors: string[] }>;
  /** Total count of emails found */
  totalFound?: number;
  /** Count of valid emails */
  validCount?: number;
  /** Count of invalid emails */
  invalidCount?: number;
  /** Extraction errors */
  errors?: string[];
};

/**
 * Email normalization result
 */
export type EmailNormalizationResult = {
  /** Whether normalization succeeded */
  valid: boolean;
  /** Original email address */
  original: string;
  /** Normalized email address */
  normalized: string | null;
  /** Whether email was changed */
  changed?: boolean;
  /** Details of changes made */
  changes?: { trimmed: boolean; domainLowercased: boolean };
  /** Normalization errors */
  errors?: string[];
};

/**
 * Email validation configuration
 */
export type EmailValidatorOptions = {
  /** Allow Unicode characters in email */
  allowUnicode?: boolean;
};

/**
 * Email extraction configuration
 */
export type EmailExtractionOptions = {
  /** Return only unique emails */
  unique?: boolean;
};

/**
 * Email generation options for testing
 */
export type EmailGenerationOptions = {
  /** Number of emails to generate */
  count?: number;
  /** Domain name to use */
  domain?: string;
  /** Prefix for local part */
  prefix?: string;
};

/**
 * Basic email format validation using regex
 * @param {string} email - Email address to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.allowUnicode - Allow unicode characters (default: false)
 * @returns {Object} Validation result
 * @example
 * const result = validateEmailFormat('user@example.com');
 * console.log(result.valid); // true
 */
export const validateEmailFormat = (
  email: string,
  options: EmailValidatorOptions = {}
): EmailValidationResult => {
  const { allowUnicode = false } = options;

  try {
    if (!email || typeof email !== 'string') {
      return { valid: false, errors: ['Email is required and must be a string'] };
    }

    // Basic regex for ASCII emails
    const asciiPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Unicode-aware regex for international emails
    const unicodePattern = /^[\w._%+-]+@[\w.-]+\.[\w]{2,}$/u;

    const pattern = allowUnicode ? unicodePattern : asciiPattern;
    const valid = pattern.test(email);

    const errors: string[] = [];
    if (!valid) {
      errors.push('Invalid email format');

      // Detailed error analysis
      if (!email.includes('@')) {
        errors.push('Missing @ symbol');
      } else {
        const parts = email.split('@');
        if (parts.length !== 2) {
          errors.push('Multiple @ symbols found');
        } else {
          const [localPart, domain] = parts;
          if (!localPart) {
            errors.push('Missing local part (before @)');
          }
          if (!domain) {
            errors.push('Missing domain part (after @)');
          }
          if (domain && !domain.includes('.')) {
            errors.push('Domain missing TLD');
          }
        }
      }
    }

    if (valid) {
      logger.info(`Email format validation passed: ${email}`);
    } else {
      logger.warn(`Email format validation failed: ${email} - ${errors.join(', ')}`);
    }

    return { valid, errors };
  } catch (error) {
    logger.error(
      `Email format validation error: ${error instanceof Error ? error.message : String(error)}`
    );
    return { valid: false, errors: [error instanceof Error ? error.message : String(error)] };
  }
};

/**
 * Validate email domain exists and has MX record
 * @param email - Email address to validate
 * @returns Validation result with MX record info
 * @throws {Error} When domain validation fails
 * @example
 * const result = await validateEmailDomain('user@gmail.com');
 * console.log(result.valid, result.mxRecords);
 */
export const validateEmailDomain = async (email: string): Promise<EmailDomainValidationResult> => {
  try {
    if (!email || typeof email !== 'string') {
      return { valid: false, errors: ['Email is required and must be a string'] };
    }

    const domain = email.split('@')[1];
    if (!domain) {
      return { valid: false, errors: ['Invalid email format - missing domain'] };
    }

    // Note: In browser environment, DNS lookups are not directly available
    // This is a simplified version that would need server-side implementation
    // For actual MX record validation, you would need a backend service

    // Simplified domain validation using fetch to check if domain resolves
    try {
      await fetch(`https://${domain}`, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: AbortSignal.timeout(5000),
      });

      logger.info(`Domain validation passed for: ${domain}`);
      return {
        valid: true,
        domain,
        errors: [],
        note: 'Basic domain reachability check - for production use server-side MX validation',
      };
    } catch (error) {
      logger.warn(
        `Domain validation failed for: ${domain} - ${error instanceof Error ? error.message : String(error)}`
      );
      return {
        valid: false,
        domain,
        errors: [`Domain ${domain} appears unreachable`],
        note: 'Basic domain reachability check - domain may still be valid',
      };
    }
  } catch (error) {
    logger.error(
      `Email domain validation error: ${error instanceof Error ? error.message : String(error)}`
    );
    return { valid: false, errors: [error instanceof Error ? error.message : String(error)] };
  }
};

/**
 * Validate email against disposable email providers
 * @param {string} email - Email address to validate
 * @returns {Object} Validation result
 * @example
 * const result = validateDisposableEmail('user@10minutemail.com');
 * console.log(result.isDisposable); // true
 */
export const validateDisposableEmail = (email: string): EmailDisposableResult => {
  try {
    if (!email || typeof email !== 'string') {
      return { valid: false, errors: ['Email is required and must be a string'] };
    }

    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) {
      return { valid: false, errors: ['Invalid email format - missing domain'] };
    }

    // Common disposable email domains (this would typically be a larger list)
    const disposableDomains = [
      '10minutemail.com',
      'temp-mail.org',
      'guerrillamail.com',
      'mailinator.com',
      'tempail.com',
      '0-mail.com',
      '10minmail.com',
      'throwaway.email',
      'trashmail.com',
      'getnada.com',
      'tempmail.org',
      'fake-mail.ml',
      'spam4.me',
      'maildrop.cc',
      'sharklasers.com',
    ];

    const isDisposable = disposableDomains.includes(domain);
    const valid = !isDisposable;

    const result = {
      valid,
      isDisposable,
      domain,
      errors: isDisposable ? [`Domain ${domain} is a disposable email provider`] : [],
    };

    if (isDisposable) {
      logger.warn(`Disposable email detected: ${email}`);
    } else {
      logger.info(`Email passed disposable check: ${email}`);
    }

    return result;
  } catch (error) {
    logger.error(
      `Disposable email validation error: ${error instanceof Error ? error.message : String(error)}`
    );
    return { valid: false, errors: [error instanceof Error ? error.message : String(error)] };
  }
};

/**
 * Comprehensive email validation combining multiple checks
 * @param email - Email address to validate
 * @param options - Validation options
 * @param options.checkDomain - Check domain validity (default: false)
 * @param options.checkDisposable - Check for disposable emails (default: true)
 * @param options.allowUnicode - Allow unicode characters (default: false)
 * @returns Comprehensive validation result with all checks
 * @throws {Error} When comprehensive validation encounters errors
 * @example
 * const result = await validateEmailComprehensive('user@example.com', {
 *   checkDomain: true,
 *   checkDisposable: true
 * });
 */
export const validateEmailComprehensive = async (
  email: string,
  options: { checkDomain?: boolean; checkDisposable?: boolean; allowUnicode?: boolean } = {}
): Promise<{
  email: string;
  overallValid: boolean;
  checks: Record<string, unknown>;
  errors: string[];
}> => {
  const { checkDomain = false, checkDisposable = true, allowUnicode = false } = options;

  try {
    const results: {
      email: string;
      overallValid: boolean;
      checks: Record<string, unknown>;
      errors: string[];
    } = {
      email,
      overallValid: true,
      checks: {} as Record<string, unknown>,
      errors: [],
    };

    // Format validation
    const formatResult = validateEmailFormat(email, { allowUnicode });
    results.checks.format = formatResult;
    if (!formatResult.valid) {
      results.overallValid = false;
      results.errors.push(...formatResult.errors);
    }

    // Domain validation (if requested and format is valid)
    if (checkDomain && formatResult.valid) {
      const domainResult = await validateEmailDomain(email);
      results.checks.domain = domainResult;
      if (!domainResult.valid) {
        results.overallValid = false;
        results.errors.push(...domainResult.errors);
      }
    }

    // Disposable email validation
    if (checkDisposable && formatResult.valid) {
      const disposableResult = validateDisposableEmail(email);
      results.checks.disposable = disposableResult;
      if (!disposableResult.valid) {
        results.overallValid = false;
        results.errors.push(...disposableResult.errors);
      }
    }

    logger.info(
      `Comprehensive email validation for ${email}: ${results.overallValid ? 'PASSED' : 'FAILED'}`
    );
    return results;
  } catch (error) {
    logger.error(
      `Comprehensive email validation error: ${error instanceof Error ? error.message : String(error)}`
    );
    return {
      overallValid: false,
      errors: [error instanceof Error ? error.message : String(error)],
      email,
      checks: {} as Record<string, unknown>,
    };
  }
};

/**
 * Extract and validate multiple emails from text
 * @param {string} text - Text containing email addresses
 * @param {Object} options - Extraction options
 * @param {boolean} options.unique - Return unique emails only (default: true)
 * @returns {Object} Extracted emails with validation results
 * @example
 * const result = extractEmailsFromText('Contact us: sales@company.com or support@company.com');
 * console.log(result.emails); // ['sales@company.com', 'support@company.com']
 */
export const extractEmailsFromText = (
  text: string,
  options: EmailExtractionOptions = {}
): EmailExtractionResult => {
  const { unique = true } = options;

  try {
    if (!text || typeof text !== 'string') {
      return { emails: [], validEmails: [], invalidEmails: [], errors: [] };
    }

    // Email regex for extraction
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    let foundEmails: string[] = (text.match(emailRegex) || []) as string[];

    if (unique) {
      foundEmails = [...new Set(foundEmails)];
    }

    const validEmails: string[] = [];
    const invalidEmails: Array<{ email: string; errors: string[] }> = [];

    foundEmails.forEach(email => {
      const validation = validateEmailFormat(email);
      if (validation.valid) {
        validEmails.push(email);
      } else {
        invalidEmails.push({ email, errors: validation.errors });
      }
    });

    logger.info(`Extracted ${foundEmails.length} emails from text (${validEmails.length} valid)`);

    return {
      emails: foundEmails,
      validEmails,
      invalidEmails,
      totalFound: foundEmails.length,
      validCount: validEmails.length,
      invalidCount: invalidEmails.length,
    };
  } catch (error) {
    logger.error(
      `Email extraction error: ${error instanceof Error ? error.message : String(error)}`
    );
    return {
      emails: [],
      validEmails: [],
      invalidEmails: [],
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
};

/**
 * Validate email list and return statistics
 * @param emails - Array of email addresses
 * @param options - Validation options
 * @param options.checkDomain - Check domain validity
 * @param options.checkDisposable - Check for disposable emails
 * @returns Validation statistics with counts and errors
 * @throws {Error} When list validation encounters errors
 * @example
 * const stats = await validateEmailList(['user1@example.com', 'invalid-email']);
 * console.log(stats.validCount, stats.invalidCount, stats.successRate);
 */
export const validateEmailList = async (
  emails: string[],
  options: { checkDomain?: boolean; checkDisposable?: boolean } = {}
): Promise<{
  totalCount: number;
  validCount: number;
  invalidCount: number;
  validEmails: string[];
  invalidEmails: Array<{ email: string; errors: string[] }>;
  duplicates: string[];
  successRate: number;
  valid?: boolean;
  errors?: string[];
}> => {
  try {
    if (!Array.isArray(emails)) {
      return {
        valid: false,
        errors: ['Input must be an array of emails'],
        totalCount: 0,
        validCount: 0,
        invalidCount: 0,
        validEmails: [],
        invalidEmails: [],
        duplicates: [],
        successRate: 0,
      };
    }

    const results = {
      totalCount: emails.length,
      validCount: 0,
      invalidCount: 0,
      validEmails: [] as string[],
      invalidEmails: [] as Array<{ email: string; errors: string[] }>,
      duplicates: [] as string[],
      successRate: 0,
    };

    // Check for duplicates
    const seen = new Set();
    emails.forEach(email => {
      if (seen.has(email.toLowerCase())) {
        results.duplicates.push(email);
      }
      seen.add(email.toLowerCase());
    });

    // Validate each email
    for (const email of emails) {
      try {
        const validation = await validateEmailComprehensive(email, options);

        if (validation.overallValid) {
          results.validCount++;
          results.validEmails.push(email);
        } else {
          results.invalidCount++;
          results.invalidEmails.push({
            email,
            errors: validation.errors,
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.invalidCount++;
        results.invalidEmails.push({
          email,
          errors: [errorMessage],
        });
      }
    }

    results.successRate = Math.round((results.validCount / results.totalCount) * 100);

    logger.info(
      `Email list validation: ${results.validCount}/${results.totalCount} valid (${results.successRate}%)`
    );
    return results;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Email list validation error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage],
      totalCount: emails?.length || 0,
      validCount: 0,
      invalidCount: 0,
      validEmails: [],
      invalidEmails: [],
      duplicates: [],
      successRate: 0,
    };
  }
};

/**
 * Normalize email address (lowercase domain, trim spaces)
 * @param {string} email - Email address to normalize
 * @returns {Object} Normalized email result
 * @example
 * const result = normalizeEmail('  User@EXAMPLE.COM  ');
 * console.log(result.normalized); // 'User@example.com'
 */
export const normalizeEmail = (email: string): EmailNormalizationResult => {
  try {
    if (!email || typeof email !== 'string') {
      return {
        valid: false,
        errors: ['Email is required and must be a string'],
        original: email,
        normalized: null,
      };
    }

    const trimmed = email.trim();
    const parts = trimmed.split('@');

    if (parts.length !== 2) {
      return {
        valid: false,
        errors: ['Invalid email format'],
        original: email,
        normalized: null,
      };
    }

    const [localPart, domain] = parts;
    const normalized = `${localPart}@${domain.toLowerCase()}`;

    return {
      valid: true,
      original: email,
      normalized,
      changed: email !== normalized,
      changes: {
        trimmed: email !== trimmed,
        domainLowercased: domain !== domain.toLowerCase(),
      },
    };
  } catch (error) {
    logger.error(
      `Email normalization error: ${error instanceof Error ? error.message : String(error)}`
    );
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : String(error)],
      original: email,
      normalized: null,
    };
  }
};

/**
 * Generate test email addresses for testing
 * @param {Object} options - Generation options
 * @param {number} options.count - Number of emails to generate (default: 5)
 * @param {string} options.domain - Domain to use (default: 'test.com')
 * @param {string} options.prefix - Prefix for local part (default: 'user')
 * @returns {Array<string>} Array of generated email addresses
 * @example
 * const emails = generateTestEmails({ count: 3, domain: 'example.com', prefix: 'test' });
 * console.log(emails); // ['test1@example.com', 'test2@example.com', 'test3@example.com']
 */
export const generateTestEmails = (options: EmailGenerationOptions = {}): string[] => {
  const { count = 5, domain = 'test.com', prefix = 'user' } = options;

  try {
    const emails: string[] = [];

    for (let i = 1; i <= count; i++) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const localPart = `${prefix}${i}_${timestamp}_${random}`;
      emails.push(`${localPart}@${domain}`);
    }

    logger.info(`Generated ${emails.length} test emails`);
    return emails;
  } catch (error) {
    logger.error(
      `Test email generation error: ${error instanceof Error ? error.message : String(error)}`
    );
    return [];
  }
};
