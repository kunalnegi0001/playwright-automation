/**
 * @fileoverview Password validation and strength checking utilities.
 * Provides comprehensive password validation with customizable criteria and common password checking.
 * @module validators/password.validator
 */

import { logger } from '@utils/core';

/**
 * @fileoverview Password validation helper functions
 * Provides comprehensive password strength checking and validation
 * @module password.validator
 */

/**
 * Password validation configuration options
 */
export type PasswordValidatorOptions = {
  /** Minimum password length */
  minLength?: number;
  /** Maximum password length */
  maxLength?: number;
  /** Require at least one uppercase letter */
  requireUppercase?: boolean;
  /** Require at least one lowercase letter */
  requireLowercase?: boolean;
  /** Require at least one number */
  requireNumbers?: boolean;
  /** Require at least one special character */
  requireSpecialChars?: boolean;
  /** Allowed special characters string */
  specialChars?: string;
};

/**
 * Password validation result with strength analysis
 */
export type PasswordValidationResult = {
  /** Whether password meets all requirements */
  valid: boolean;
  /** Strength score (0-100) */
  score: number;
  /** Strength level: very_weak, weak, fair, good, strong */
  strength: string;
  /** List of validation errors */
  errors: string[];
  /** Individual criteria validation results */
  criteria: Record<string, boolean>;
};

/**
 * Validate password strength based on common criteria
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length (default: 8)
 * @param {number} options.maxLength - Maximum length (default: 128)
 * @param {boolean} options.requireUppercase - Require uppercase letters (default: true)
 * @param {boolean} options.requireLowercase - Require lowercase letters (default: true)
 * @param {boolean} options.requireNumbers - Require numbers (default: true)
 * @param {boolean} options.requireSpecialChars - Require special characters (default: true)
 * @param {string} options.specialChars - Allowed special characters (default: '!@#$%^&*()_+-=[]{}|;:,.<>?')
 * @returns {Object} Validation result with strength score
 * @example
 * const result = validatePasswordStrength('MyPassword123!');
 * console.log(result.score, result.strength); // 85, 'strong'
 */
export const validatePasswordStrength = (
  password: string,
  options: PasswordValidatorOptions = {}
): PasswordValidationResult => {
  const {
    minLength = 8,
    maxLength = 128,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
    specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?',
  } = options;

  try {
    if (!password || typeof password !== 'string') {
      return {
        valid: false,
        score: 0,
        strength: 'invalid',
        errors: ['Password is required and must be a string'],
        criteria: {},
      };
    }

    const criteria = {
      length: password.length >= minLength && password.length <= maxLength,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: new RegExp(`[${specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(
        password
      ),
      noSpaces: !/\s/.test(password),
      notCommon: !isCommonPassword(password),
    };

    const errors = [];
    let score = 0;

    // Check required criteria
    if (!criteria.length) {
      errors.push(`Password must be between ${minLength} and ${maxLength} characters`);
    } else {
      score += 20;
    }

    if (requireUppercase && !criteria.hasUppercase) {
      errors.push('Password must contain uppercase letters');
    } else if (criteria.hasUppercase) {
      score += 15;
    }

    if (requireLowercase && !criteria.hasLowercase) {
      errors.push('Password must contain lowercase letters');
    } else if (criteria.hasLowercase) {
      score += 15;
    }

    if (requireNumbers && !criteria.hasNumbers) {
      errors.push('Password must contain numbers');
    } else if (criteria.hasNumbers) {
      score += 15;
    }

    if (requireSpecialChars && !criteria.hasSpecialChars) {
      errors.push('Password must contain special characters');
    } else if (criteria.hasSpecialChars) {
      score += 15;
    }

    // Bonus points
    if (criteria.noSpaces) {
      score += 5;
    }
    if (criteria.notCommon) {
      score += 10;
    }
    if (password.length >= 12) {
      score += 5;
    }
    if (password.length >= 16) {
      score += 5;
    }

    // Determine strength
    let strength: string;
    if (score < 30) {
      strength = 'very_weak';
    } else if (score < 50) {
      strength = 'weak';
    } else if (score < 70) {
      strength = 'fair';
    } else if (score < 85) {
      strength = 'good';
    } else {
      strength = 'strong';
    }

    const valid = errors.length === 0;

    if (valid) {
      logger.info(`Password strength validation passed: ${strength} (${score})`);
    } else {
      logger.warn(`Password strength validation failed: ${errors.join(', ')}`);
    }

    return {
      valid,
      score,
      strength,
      errors: errors as string[],
      criteria: criteria as Record<string, boolean>,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Password strength validation error: ${errorMessage}`);
    return {
      valid: false,
      score: 0,
      strength: 'invalid' as const,
      errors: [errorMessage] as string[],
      criteria: {} as Record<string, boolean>,
    };
  }
};

/**
 * Check if password is commonly used
 * @param {string} password - Password to check
 * @returns {boolean} True if password is common
 * @example
 * const isCommon = isCommonPassword('password123');
 * console.log(isCommon); // true
 */
export const isCommonPassword = (password: string): boolean => {
  try {
    if (!password || typeof password !== 'string') {
      return true;
    }

    const commonPasswords = [
      'password',
      '123456',
      '123456789',
      'qwerty',
      'abc123',
      'password123',
      'admin',
      'letmein',
      'welcome',
      'monkey',
      '1234567890',
      'iloveyou',
      'princess',
      'rockyou',
      '123123',
      'football',
      'baseball',
      'welcome123',
      'sunshine',
      'master',
      'hello',
      'freedom',
      'whatever',
      'qazwsx',
      'trustno1',
    ];

    const lowerPassword = password.toLowerCase();

    // Check exact matches
    if (commonPasswords.includes(lowerPassword)) {
      return true;
    }

    // Check simple variations
    const patterns = [
      /^password\d+$/i,
      /^admin\d+$/i,
      /^123+$/,
      /^qwerty\d+$/i,
      /^\d{4,}$/,
      /^[a-z]+123$/i,
      /^[a-z]+\d{2,4}$/i,
    ];

    return patterns.some(pattern => pattern.test(password));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Common password check error: ${errorMessage}`);
    return true; // Treat as common if error occurs
  }
};

/**
 * Generate password suggestions based on failed criteria
 * @param {Object} validationResult - Result from validatePasswordStrength
 * @returns {Array<string>} Array of improvement suggestions
 * @example
 * const suggestions = generatePasswordSuggestions(validationResult);
 * console.log(suggestions); // ['Add uppercase letters', 'Make it longer']
 */
export const generatePasswordSuggestions = (
  validationResult: PasswordValidationResult | Record<string, unknown>
): string[] => {
  try {
    if (!validationResult || typeof validationResult !== 'object') {
      return ['Invalid validation result provided'];
    }

    const suggestions: string[] = [];
    const result = validationResult as PasswordValidationResult;
    const criteria = result.criteria;
    const score = result.score;

    if (criteria && !criteria.length) {
      suggestions.push('Use between 8-128 characters');
    }

    if (criteria && !criteria.hasUppercase) {
      suggestions.push('Add uppercase letters (A-Z)');
    }

    if (criteria && !criteria.hasLowercase) {
      suggestions.push('Add lowercase letters (a-z)');
    }

    if (criteria && !criteria.hasNumbers) {
      suggestions.push('Add numbers (0-9)');
    }

    if (criteria && !criteria.hasSpecialChars) {
      suggestions.push('Add special characters (!@#$%^&*)');
    }

    if (criteria && !criteria.noSpaces) {
      suggestions.push('Remove spaces');
    }

    if (criteria && !criteria.notCommon) {
      suggestions.push('Avoid common passwords');
    }

    if (score !== undefined && score < 70) {
      suggestions.push('Make password longer for better security');
    }

    if (suggestions.length === 0) {
      suggestions.push('Password is strong!');
    }

    return suggestions;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Password suggestion generation error: ${errorMessage}`);
    return ['Unable to generate suggestions'];
  }
};

/**
 * Options for secure password generation
 */
export type PasswordGeneratorOptions = {
  /** Desired password length */
  length?: number;
  /** Include uppercase letters */
  includeUppercase?: boolean;
  /** Include lowercase letters */
  includeLowercase?: boolean;
  /** Include numeric digits */
  includeNumbers?: boolean;
  /** Include special characters */
  includeSpecialChars?: boolean;
  /** Special characters to use */
  specialChars?: string;
  /** Exclude similar characters (0,O,l,1) */
  excludeSimilar?: boolean;
};

/**
 * Generate secure password with specified criteria
 * @param {Object} options - Generation options
 * @param {number} options.length - Password length (default: 12)
 * @param {boolean} options.includeUppercase - Include uppercase letters (default: true)
 * @param {boolean} options.includeLowercase - Include lowercase letters (default: true)
 * @param {boolean} options.includeNumbers - Include numbers (default: true)
 * @param {boolean} options.includeSpecialChars - Include special characters (default: true)
 * @param {string} options.specialChars - Special characters to use (default: '!@#$%^&*')
 * @param {boolean} options.excludeSimilar - Exclude similar characters (0,O,l,1) (default: true)
 * @returns {Object} Generated password with metadata
 * @example
 * const result = generateSecurePassword({ length: 16, excludeSimilar: true });
 * console.log(result.password); // 'Kp9$mN7@vX2#qR8!'
 */
export const generateSecurePassword = (
  options: PasswordGeneratorOptions = {}
): Record<string, unknown> => {
  const {
    length = 12,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSpecialChars = true,
    specialChars = '!@#$%^&*',
    excludeSimilar = true,
  } = options;

  try {
    let charset = '';

    if (includeUppercase) {
      charset += excludeSimilar ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }

    if (includeLowercase) {
      charset += excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    }

    if (includeNumbers) {
      charset += excludeSimilar ? '23456789' : '0123456789';
    }

    if (includeSpecialChars) {
      charset += specialChars;
    }

    if (!charset) {
      throw new Error('At least one character type must be selected');
    }

    let password = '';

    // Ensure at least one character from each selected type
    if (includeUppercase) {
      const upperChars = excludeSimilar ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      password += upperChars[Math.floor(Math.random() * upperChars.length)];
    }

    if (includeLowercase) {
      const lowerChars = excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
      password += lowerChars[Math.floor(Math.random() * lowerChars.length)];
    }

    if (includeNumbers) {
      const numberChars = excludeSimilar ? '23456789' : '0123456789';
      password += numberChars[Math.floor(Math.random() * numberChars.length)];
    }

    if (includeSpecialChars) {
      password += specialChars[Math.floor(Math.random() * specialChars.length)];
    }

    // Fill remaining length with random characters
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password to avoid predictable patterns
    password = password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    const strength = validatePasswordStrength(password);

    logger.info(`Generated secure password: length ${length}, strength ${strength.strength}`);

    return {
      password,
      length: password.length,
      charset: charset.length,
      strength: strength.strength,
      score: strength.score,
      entropy: Math.log2(charset.length) * length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Secure password generation error: ${errorMessage}`);
    return {
      password: null,
      errors: [errorMessage],
    };
  }
};

/**
 * Check password against known breached passwords (mock implementation)
 * @param password - Password to check
 * @returns Breach check result with occurrence count
 * @throws {Error} When password validation fails
 * @example
 * const result = await checkPasswordBreach('password123');
 * console.log(result.isBreached); // true
 */
export const checkPasswordBreach = async (password: string): Promise<Record<string, unknown>> => {
  try {
    if (!password || typeof password !== 'string') {
      return {
        valid: false,
        errors: ['Password is required and must be a string'],
        isBreached: true,
      };
    }

    // Mock implementation - in real scenario, use HaveIBeenPwned API
    // This would typically hash the password and check against breach databases
    const commonBreachedPasswords = [
      'password',
      '123456',
      '123456789',
      'qwerty',
      'password123',
      'admin',
      'letmein',
      'welcome',
      'monkey',
      'iloveyou',
    ];

    const isBreached = commonBreachedPasswords.includes(password.toLowerCase());
    const timesFound = isBreached ? Math.floor(Math.random() * 1000000) + 1 : 0;

    const result = {
      valid: true,
      isBreached,
      timesFound,
      recommendation: isBreached ? 'Choose a different password' : 'Password appears safe',
      note: 'Mock implementation - use HaveIBeenPwned API for production',
    };

    if (isBreached) {
      logger.warn(`Password found in breach database: ${timesFound} times`);
    } else {
      logger.info('Password not found in breach database');
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Password breach check error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage],
      isBreached: true,
    };
  }
};

/**
 * Custom password complexity rule definition
 */
export type PasswordComplexityRule = {
  /** Rule identifier */
  name: string;
  /** Test function that returns true if password passes */
  test: (password: string) => boolean;
  /** Error message shown when rule fails */
  message?: string;
};

/**
 * Validate password against custom complexity rules
 * @param {string} password - Password to validate
 * @param {Array<Object>} rules - Array of custom validation rules
 * @returns {Object} Validation result
 * @example
 * const rules = [
 *   { name: 'minLength', test: (p) => p.length >= 10, message: 'At least 10 characters' },
 *   { name: 'noSequence', test: (p) => !/123|abc/i.test(p), message: 'No sequences' }
 * ];
 * const result = validatePasswordComplexity('MyPass123!', rules);
 */
export const validatePasswordComplexity = (
  password: string,
  rules: PasswordComplexityRule[] = []
): Record<string, unknown> => {
  try {
    if (!password || typeof password !== 'string') {
      return {
        valid: false,
        errors: ['Password is required and must be a string'],
        results: {},
      };
    }

    if (!Array.isArray(rules)) {
      return {
        valid: false,
        errors: ['Rules must be an array'],
        results: {},
      };
    }

    const results: Record<string, { passed: boolean; message: string }> = {};
    const errors: string[] = [];
    let passedCount = 0;

    rules.forEach(rule => {
      try {
        const passed = rule.test(password);
        results[rule.name] = {
          passed,
          message: rule.message || 'Custom rule',
        };

        if (passed) {
          passedCount++;
        } else {
          errors.push(rule.message || `Rule ${rule.name} failed`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results[rule.name] = {
          passed: false,
          message: `Rule execution error: ${errorMessage}`,
        };
        errors.push(`Rule ${rule.name} execution error`);
      }
    });

    const valid = errors.length === 0;
    const score = rules.length > 0 ? Math.round((passedCount / rules.length) * 100) : 0;

    logger.info(`Password complexity check: ${passedCount}/${rules.length} rules passed`);

    return {
      valid,
      score,
      passedCount,
      totalRules: rules.length,
      errors,
      results,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Password complexity validation error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage],
      results: {},
    };
  }
};

/**
 * Calculate password entropy
 * @param {string} password - Password to analyze
 * @returns {Object} Entropy analysis
 * @example
 * const entropy = calculatePasswordEntropy('MyPassword123!');
 * console.log(entropy.bits); // 72.5
 */
export const calculatePasswordEntropy = (password: string): Record<string, unknown> => {
  try {
    if (!password || typeof password !== 'string') {
      return {
        valid: false,
        errors: ['Password is required and must be a string'],
        entropy: 0,
      };
    }

    let charsetSize = 0;

    if (/[a-z]/.test(password)) {
      charsetSize += 26;
    } // lowercase
    if (/[A-Z]/.test(password)) {
      charsetSize += 26;
    } // uppercase
    if (/\d/.test(password)) {
      charsetSize += 10;
    } // digits
    if (/[^a-zA-Z0-9]/.test(password)) {
      charsetSize += 32;
    } // special chars (estimate)

    const entropy = password.length * Math.log2(charsetSize);

    let strength;
    if (entropy < 30) {
      strength = 'very_weak';
    } else if (entropy < 40) {
      strength = 'weak';
    } else if (entropy < 60) {
      strength = 'fair';
    } else if (entropy < 80) {
      strength = 'good';
    } else {
      strength = 'strong';
    }

    const timeToBreak = calculateTimeToBreak(entropy);

    logger.info(`Password entropy: ${entropy.toFixed(1)} bits (${strength})`);

    return {
      valid: true,
      entropy: Math.round(entropy * 10) / 10,
      charsetSize,
      length: password.length,
      strength,
      timeToBreak,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Password entropy calculation error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage],
      entropy: 0,
    };
  }
};

/**
 * Calculate estimated time to break password
 * @private
 */
export const calculateTimeToBreak = (entropy: number): string => {
  const attemptsPerSecond = 1000000000; // 1 billion attempts per second (estimate)
  const combinations = Math.pow(2, entropy);
  const seconds = combinations / (2 * attemptsPerSecond); // Average case

  if (seconds < 60) {
    return `${Math.round(seconds)} seconds`;
  }
  if (seconds < 3600) {
    return `${Math.round(seconds / 60)} minutes`;
  }
  if (seconds < 86400) {
    return `${Math.round(seconds / 3600)} hours`;
  }
  if (seconds < 31536000) {
    return `${Math.round(seconds / 86400)} days`;
  }
  if (seconds < 31536000000) {
    return `${Math.round(seconds / 31536000)} years`;
  }
  return 'centuries';
};

/**
 * Check for password patterns and weaknesses
 * @param {string} password - Password to analyze
 * @returns {Object} Pattern analysis result
 * @example
 * const analysis = analyzePasswordPatterns('Password123!');
 * console.log(analysis.patterns); // ['dictionary_word', 'number_suffix']
 */
export const analyzePasswordPatterns = (password: string): Record<string, unknown> => {
  try {
    if (!password || typeof password !== 'string') {
      return {
        valid: false,
        errors: ['Password is required and must be a string'],
        patterns: [],
      };
    }

    const patterns = [];
    const warnings = [];

    // Dictionary words
    const commonWords = ['password', 'admin', 'user', 'login', 'welcome', 'hello'];
    if (commonWords.some(word => password.toLowerCase().includes(word))) {
      patterns.push('dictionary_word');
      warnings.push('Contains common dictionary words');
    }

    // Repeated characters
    if (/(.)\1{2,}/.test(password)) {
      patterns.push('repeated_chars');
      warnings.push('Contains repeated characters');
    }

    // Sequential characters
    if (/123|abc|qwe|789/i.test(password)) {
      patterns.push('sequential_chars');
      warnings.push('Contains sequential characters');
    }

    // Keyboard patterns
    if (/qwerty|asdf|zxcv/i.test(password)) {
      patterns.push('keyboard_pattern');
      warnings.push('Contains keyboard patterns');
    }

    // Number suffix/prefix
    if (/^\d+/.test(password) || /\d+$/.test(password)) {
      patterns.push('number_affix');
      warnings.push('Numbers only at beginning or end');
    }

    // Date patterns
    if (/\d{4}|\d{2}\/\d{2}/.test(password)) {
      patterns.push('date_pattern');
      warnings.push('May contain dates');
    }

    const score = Math.max(0, 100 - patterns.length * 15);

    return {
      valid: true,
      patterns,
      warnings,
      score,
      security: score > 70 ? 'good' : score > 40 ? 'fair' : 'poor',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Password pattern analysis error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage],
      patterns: [],
    };
  }
};
