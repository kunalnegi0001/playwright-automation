/**
 * @fileoverview Comprehensive form validation utilities.
 * Validates multi-field forms with dependency checking and custom rules.
 * @module validators/form.validator
 */

import { logger } from '@utils/core';

/**
 * Form field validation rule definition
 */
export type FormValidatorFieldRule = {
  /** Field name */
  name: string;
  /** Whether field is required */
  required?: boolean;
  /** Expected data type */
  type?: string;
  /** Minimum string length */
  minLength?: number;
  /** Maximum string length */
  maxLength?: number;
  /** Minimum numeric value */
  min?: number;
  /** Maximum numeric value */
  max?: number;
  /** Regex pattern to match */
  pattern?: RegExp | string;
  /** Custom validation function */
  custom?: (
    value: unknown,
    formData: Record<string, unknown>
  ) => { valid: boolean; errors?: string[] } | undefined;
  /** Async validation function */
  asyncValidation?: (
    value: unknown,
    formData: Record<string, unknown>
  ) => Promise<{ valid: boolean; errors?: string[] }>;
  /** Allowed enum values */
  enum?: unknown[];
  /** Field this depends on */
  dependsOn?: string;
  /** Dependency condition type */
  condition?: string;
  /** Custom error message */
  message?: string;
  /** Required field error message */
  requiredMessage?: string;
  /** Min length error message */
  minLengthMessage?: string;
  /** Max length error message */
  maxLengthMessage?: string;
  /** Min value error message */
  minMessage?: string;
  /** Max value error message */
  maxMessage?: string;
  /** Pattern error message */
  patternMessage?: string;
};

/**
 * Form validation options
 */
export type FormValidatorOptions = {
  /** Stop validation on first error encountered */
  stopOnFirstError?: boolean;
  /** Validate field dependencies */
  validateDependencies?: boolean;
};

/**
 * Individual field validation result
 */
export type FormValidatorFieldResult = {
  /** Whether field is valid */
  valid: boolean;
  /** Field validation errors */
  errors: string[];
  /** Field value */
  value: unknown;
  /** Rule name that was applied */
  rule: string;
};

/**
 * Complete form validation result
 */
export type FormValidatorResult = {
  /** Overall form validity */
  valid: boolean;
  /** All validation errors */
  errors: string[];
  /** Individual field results */
  fields: Record<string, FormValidatorFieldResult>;
  /** Dependency validation results */
  dependencies?: Record<string, unknown>;
  /** Validation summary statistics */
  summary: {
    /** Total number of fields */
    totalFields: number;
    /** Number of valid fields */
    validFields: number;
    /** Number of fields with errors */
    errorFields: number;
  };
  /** Success rate percentage */
  successRate?: number;
  /** Async validation results */
  asyncResults?: Record<string, unknown>;
};

/**
 * Field type validation result
 */
export type FormValidatorTypeResult = {
  /** Whether type validation passed */
  valid: boolean;
  /** Type validation errors */
  errors: string[];
  /** Processed/converted value */
  value?: unknown;
};

/**
 * Form data sanitization options
 */
export type FormValidatorSanitizationOptions = {
  /** Remove invalid fields from data */
  removeInvalid?: boolean;
  /** Trim string values */
  trimStrings?: boolean;
};

/**
 * Form data sanitization result
 */
export type FormValidatorSanitizationResult = {
  /** Sanitized form data */
  data: Record<string, unknown>;
  /** List of changes made */
  changes: string[];
  /** Number of changes made */
  changeCount: number;
  /** Sanitization errors */
  errors?: string[];
};

/**
 * Form validation report
 */
export type FormValidatorReport = {
  /** Overall validation status */
  valid?: boolean;
  /** Human-readable summary */
  summary: string;
  /** Validation statistics */
  details: {
    /** Total fields validated */
    totalFields: number;
    /** Valid field count */
    validFields: number;
    /** Error field count */
    errorFields: number;
    /** Success rate percentage */
    successRate: number;
  };
  /** All validation errors */
  errors: string[];
  /** Improvement recommendations */
  recommendations: string[];
  /** Individual field results */
  fieldResults: Record<string, FormValidatorFieldResult>;
};

/**
 * Validation rule builder interface
 */
export type FormValidatorRuleBuilder = {
  /** Mark field as required */
  required(message?: string): FormValidatorRuleBuilder;
  /** Set field type */
  type(dataType: string): FormValidatorRuleBuilder;
  /** Set minimum length */
  minLength(length: number, message?: string): FormValidatorRuleBuilder;
  /** Set maximum length */
  maxLength(length: number, message?: string): FormValidatorRuleBuilder;
  /** Set minimum value */
  min(value: number, message?: string): FormValidatorRuleBuilder;
  /** Set maximum value */
  max(value: number, message?: string): FormValidatorRuleBuilder;
  /** Set pattern to match */
  pattern(regex: RegExp | string, message?: string): FormValidatorRuleBuilder;
  /** Add custom validation */
  custom(
    fn: (
      value: unknown,
      formData: Record<string, unknown>
    ) => { valid: boolean; errors?: string[] } | undefined
  ): FormValidatorRuleBuilder;
  /** Add async validation */
  asyncValidation(
    fn: (
      value: unknown,
      formData: Record<string, unknown>
    ) => Promise<{ valid: boolean; errors?: string[] }>
  ): FormValidatorRuleBuilder;
  /** Set field dependency */
  dependsOn(fieldName: string, condition?: string, message?: string): FormValidatorRuleBuilder;
  /** Set enum values */
  enum(values: unknown[]): FormValidatorRuleBuilder;
  /** Build the rule */
  build(): FormValidatorFieldRule;
};

/**
 * @fileoverview Form validation helper functions
 * Provides comprehensive form validation with dependency checking and multi-field validation
 * @module form.validator
 */

/**
 * Validate entire form with multiple fields and rules
 * @param {Object} formData - Form data to validate
 * @param {Array<Object>} fieldRules - Array of field validation rules
 * @param {Object} options - Validation options
 * @param {boolean} options.stopOnFirstError - Stop validation on first error (default: false)
 * @param {boolean} options.validateDependencies - Check field dependencies (default: true)
 * @returns {Object} Comprehensive validation result
 * @example
 * const rules = [
 *   { name: 'email', required: true, type: 'email' },
 *   { name: 'password', required: true, minLength: 8 }
 * ];
 * const result = validateForm({ email: 'user@example.com', password: '12345678' }, rules);
 */
export const validateForm = (
  formData: Record<string, unknown>,
  fieldRules: FormValidatorFieldRule[],
  options: FormValidatorOptions = {}
): FormValidatorResult => {
  const { stopOnFirstError = false, validateDependencies = true } = options;

  try {
    if (!formData || typeof formData !== 'object') {
      return {
        valid: false,
        errors: ['Form data is required and must be an object'],
        fields: {},
        summary: { totalFields: 0, validFields: 0, errorFields: 0 },
      };
    }

    if (!Array.isArray(fieldRules)) {
      return {
        valid: false,
        errors: ['Field rules must be an array'],
        fields: {},
        summary: { totalFields: 0, validFields: 0, errorFields: 0 },
      };
    }

    const results: {
      valid: boolean;
      errors: string[];
      fields: Record<string, unknown>;
      dependencies?: unknown;
      summary: { totalFields: number; validFields: number; errorFields: number };
    } = {
      valid: true,
      errors: [],
      fields: {},
      dependencies: {},
      summary: { totalFields: fieldRules.length, validFields: 0, errorFields: 0 },
    };

    // Validate each field
    for (const rule of fieldRules) {
      const fieldResult = validateField(formData[rule.name], rule, formData);
      results.fields[rule.name as string] = fieldResult;

      if (fieldResult.valid) {
        results.summary.validFields++;
      } else {
        results.summary.errorFields++;
        results.valid = false;
        results.errors.push(...fieldResult.errors);

        if (stopOnFirstError) {
          break;
        }
      }
    }

    // Validate field dependencies
    if (validateDependencies && results.valid) {
      const dependencyResult = validateFieldDependencies(formData, fieldRules);
      results.dependencies = dependencyResult;

      if (!dependencyResult.valid) {
        results.valid = false;
        results.errors.push(...dependencyResult.errors);
      }
    }

    const successRate = Math.round(
      (results.summary.validFields / results.summary.totalFields) * 100
    );

    if (results.valid) {
      logger.info(
        `Form validation passed: ${results.summary.validFields}/${results.summary.totalFields} fields valid`
      );
    } else {
      logger.warn(
        `Form validation failed: ${results.summary.errorFields} errors, ${successRate}% success rate`
      );
    }

    return { ...results, successRate } as FormValidatorResult;
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Form validation error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage],
      fields: {},
      summary: { totalFields: 0, validFields: 0, errorFields: 0 },
    };
  }
};

/**
 * Validate individual form field
 * @param {any} value - Field value to validate
 * @param {Object} rule - Validation rule for the field
 * @param {Object} formData - Full form data for context
 * @returns {Object} Field validation result
 * @example
 * const rule = { name: 'email', required: true, type: 'email', maxLength: 100 };
 * const result = validateField('user@example.com', rule);
 */
export const validateField = (
  value: unknown,
  rule: FormValidatorFieldRule,
  formData: Record<string, unknown> = {}
): FormValidatorFieldResult => {
  try {
    const errors: string[] = [];
    let processedValue = value;

    // Required field check
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${rule.name || 'Field'} is required`);
      return {
        valid: false,
        errors,
        value: processedValue,
        rule: rule.name,
      };
    }

    // Skip further validation if field is empty and not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return {
        valid: true,
        errors: [],
        value: processedValue,
        rule: rule.name,
      };
    }

    // Type validation
    if (rule.type) {
      const typeResult = validateFieldType(value, rule.type);
      if (!typeResult.valid) {
        errors.push(...typeResult.errors);
      }
      processedValue = typeResult.value;
    }

    // Length validation
    if (rule.minLength !== undefined || rule.maxLength !== undefined) {
      const lengthResult = validateFieldLength(value, rule.minLength, rule.maxLength);
      if (!lengthResult.valid) {
        errors.push(...lengthResult.errors);
      }
    }

    // Range validation (for numbers)
    if (rule.min !== undefined || rule.max !== undefined) {
      const rangeResult = validateFieldRange(value, rule.min, rule.max);
      if (!rangeResult.valid) {
        errors.push(...rangeResult.errors);
      }
    }

    // Pattern validation
    if (rule.pattern) {
      const patternResult = validateFieldPattern(value, rule.pattern);
      if (!patternResult.valid) {
        errors.push(...patternResult.errors);
      }
    }

    // Custom validation function
    if (rule.custom && typeof rule.custom === 'function') {
      try {
        const customResult = rule.custom(value, formData);
        if (customResult && !customResult.valid) {
          errors.push(...(customResult.errors || ['Custom validation failed']));
        }
      } catch (customError) {
        const errorMessage = (customError as Error).message;
        errors.push(`Custom validation error: ${errorMessage}`);
      }
    }

    // Enum validation
    if (rule.enum && Array.isArray(rule.enum)) {
      if (!rule.enum.includes(value)) {
        errors.push(`${rule.name || 'Field'} must be one of: ${rule.enum.join(', ')}`);
      }
    }

    const valid = errors.length === 0;
    return {
      valid,
      errors,
      value: processedValue,
      rule: rule.name,
    };
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Field validation error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage],
      value,
      rule: rule.name,
    };
  }
};

/**
 * Validate field type
 * @private
 */
export const validateFieldType = (value: unknown, type: string): FormValidatorTypeResult => {
  const errors: string[] = [];
  let processedValue = value;

  switch (type.toLowerCase()) {
    case 'email': {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        errors.push('Invalid email format');
      }
      break;
    }

    case 'url':
      try {
        new URL(String(value));
      } catch {
        errors.push('Invalid URL format');
      }
      break;

    case 'number': {
      const num = Number(value);
      if (isNaN(num)) {
        errors.push('Must be a valid number');
      } else {
        processedValue = num;
      }
      break;
    }

    case 'integer': {
      const int = parseInt(String(value));
      if (isNaN(int) || int.toString() !== String(value)) {
        errors.push('Must be a valid integer');
      } else {
        processedValue = int;
      }
      break;
    }

    case 'boolean':
      if (typeof value !== 'boolean') {
        if (value === 'true' || value === '1' || value === 1) {
          processedValue = true;
        } else if (value === 'false' || value === '0' || value === 0) {
          processedValue = false;
        } else {
          errors.push('Must be a boolean value');
        }
      }
      break;

    case 'date': {
      const date = new Date(String(value));
      if (isNaN(date.getTime())) {
        errors.push('Invalid date format');
      } else {
        processedValue = date;
      }
      break;
    }

    case 'phone': {
      const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
      if (!phoneRegex.test(String(value))) {
        errors.push('Invalid phone number format');
      }
      break;
    }

    case 'string':
      if (typeof value !== 'string') {
        processedValue = String(value);
      }
      break;

    default:
      // Unknown type, skip validation
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
    value: processedValue,
  };
};

/**
 * Validate field length
 * @private
 */
export const validateFieldLength = (
  value: unknown,
  minLength?: number,
  maxLength?: number
): FormValidatorTypeResult => {
  const errors: string[] = [];
  const length = value ? value.toString().length : 0;

  if (minLength !== undefined && length < minLength) {
    errors.push(`Must be at least ${minLength} characters`);
  }

  if (maxLength !== undefined && length > maxLength) {
    errors.push(`Must be no more than ${maxLength} characters`);
  }

  return {
    valid: errors.length === 0,
    errors,
    value,
  };
};

/**
 * Validate field range (for numbers)
 * @private
 */
export const validateFieldRange = (
  value: unknown,
  min?: number,
  max?: number
): FormValidatorTypeResult => {
  const errors: string[] = [];
  const num = Number(value);

  if (isNaN(num)) {
    return { valid: true, errors: [], value }; // Skip range validation for non-numbers
  }

  if (min !== undefined && num < min) {
    errors.push(`Must be at least ${min}`);
  }

  if (max !== undefined && num > max) {
    errors.push(`Must be no more than ${max}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    value,
  };
};

/**
 * Validate field pattern
 * @private
 */
export const validateFieldPattern = (
  value: unknown,
  pattern: RegExp | string
): FormValidatorTypeResult => {
  try {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern as string);
    const valid = regex.test(String(value));

    return {
      valid,
      errors: valid ? [] : ['Does not match required pattern'],
      value,
    };
  } catch (error) {
    return {
      valid: false,
      errors: ['Invalid pattern for validation'],
      value,
    };
  }
};

/**
 * Validate field dependencies
 * @param {Object} formData - Form data
 * @param {Array<Object>} fieldRules - Field rules with dependencies
 * @returns {Object} Dependency validation result
 * @example
 * // Rule with dependency: { name: 'confirmPassword', dependsOn: 'password', condition: 'equals' }
 */
export const validateFieldDependencies = (
  formData: Record<string, unknown>,
  fieldRules: FormValidatorFieldRule[]
): { valid: boolean; errors: string[]; dependencies: Record<string, unknown> } => {
  try {
    const errors: string[] = [];
    const dependencyResults: Record<string, unknown> = {};

    for (const rule of fieldRules) {
      if (rule.dependsOn) {
        const dependencyResult = validateSingleDependency(formData, rule);
        dependencyResults[rule.name as string] = dependencyResult;

        if (!dependencyResult.valid) {
          errors.push(...dependencyResult.errors);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      dependencies: dependencyResults,
    };
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Dependency validation error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage],
      dependencies: {},
    };
  }
};

/**
 * Validate single field dependency
 * @private
 */
export const validateSingleDependency = (
  formData: Record<string, unknown>,
  rule: FormValidatorFieldRule
): {
  valid: boolean;
  errors: string[];
  condition: string | undefined;
  dependsOn: string | undefined;
} => {
  const { name, dependsOn, condition = 'equals', message } = rule;
  const fieldValue = formData[name as string];
  const dependentValue = formData[dependsOn as string];

  const errors: string[] = [];

  switch (condition) {
    case 'equals':
      if (fieldValue !== dependentValue) {
        errors.push(message || `${name} must match ${dependsOn}`);
      }
      break;

    case 'not_equals':
      if (fieldValue === dependentValue) {
        errors.push(message || `${name} must not match ${dependsOn}`);
      }
      break;

    case 'required_if':
      if (dependentValue && !fieldValue) {
        errors.push(message || `${name} is required when ${dependsOn} is provided`);
      }
      break;

    case 'greater_than':
      if (Number(fieldValue) <= Number(dependentValue)) {
        errors.push(message || `${name} must be greater than ${dependsOn}`);
      }
      break;

    case 'less_than':
      if (Number(fieldValue) >= Number(dependentValue)) {
        errors.push(message || `${name} must be less than ${dependsOn}`);
      }
      break;

    default:
      errors.push(`Unknown dependency condition: ${condition}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    condition,
    dependsOn,
  };
};

/**
 * Validate form with async operations
 * @param formData - Form data to validate
 * @param fieldRules - Field rules with possible async validations
 * @param options - Validation options
 * @param options.stopOnFirstError - Stop on first error
 * @param options.validateDependencies - Validate dependencies
 * @returns Async validation result with all checks
 * @throws {Error} When async validation encounters errors
 * @example
 * const rules = [
 *   { name: 'username', required: true, asyncValidation: checkUsernameAvailable },
 *   { name: 'email', required: true, type: 'email', asyncValidation: checkEmailExists }
 * ];
 * const result = await validateFormAsync(formData, rules);
 */
export const validateFormAsync = async (
  formData: Record<string, unknown>,
  fieldRules: FormValidatorFieldRule[],
  options: FormValidatorOptions = {}
): Promise<FormValidatorResult> => {
  try {
    // First run synchronous validation
    const syncResult = validateForm(formData, fieldRules, options);

    if (!syncResult.valid || options.stopOnFirstError) {
      return syncResult;
    }

    // Run async validations
    const asyncResults: Record<string, unknown> = {};
    const asyncErrors: string[] = [];

    for (const rule of fieldRules) {
      if (rule.asyncValidation && typeof rule.asyncValidation === 'function') {
        try {
          const asyncResult = await rule.asyncValidation(formData[rule.name], formData);
          asyncResults[rule.name as string] = asyncResult;

          if (asyncResult && !asyncResult.valid) {
            asyncErrors.push(
              ...(asyncResult.errors || [`Async validation failed for ${rule.name}`])
            );
            syncResult.fields[rule.name as string].valid = false;
            syncResult.fields[rule.name as string].errors.push(...(asyncResult.errors as string[]));
          }
        } catch (asyncError) {
          const errorMessage = `Async validation error for ${rule.name}: ${(asyncError as Error).message}`;
          asyncErrors.push(errorMessage);
          syncResult.fields[rule.name as string].valid = false;
          syncResult.fields[rule.name as string].errors.push(errorMessage);
        }
      }
    }

    const finalValid = syncResult.valid && asyncErrors.length === 0;

    return {
      ...syncResult,
      valid: finalValid,
      errors: [...syncResult.errors, ...asyncErrors],
      asyncResults,
    };
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Async form validation error: ${errorMessage}`);
    return {
      valid: false,
      errors: [errorMessage],
      fields: {},
      summary: { totalFields: 0, validFields: 0, errorFields: 0 },
    };
  }
};

/**
 * Create validation rule builder for easier rule creation
 * @param {string} fieldName - Name of the field
 * @returns {Object} Rule builder object
 * @example
 * const rule = createValidationRule('email')
 *   .required()
 *   .type('email')
 *   .maxLength(100)
 *   .build();
 */
export const createValidationRule = (fieldName: string): FormValidatorRuleBuilder => {
  const rule: FormValidatorFieldRule = { name: fieldName };

  const builder: FormValidatorRuleBuilder = {
    required(message?: string) {
      rule.required = true;
      if (message) {
        rule.requiredMessage = message;
      }
      return builder;
    },

    type(dataType: string) {
      rule.type = dataType;
      return builder;
    },

    minLength(length: number, message?: string) {
      rule.minLength = length;
      if (message) {
        rule.minLengthMessage = message;
      }
      return builder;
    },

    maxLength(length: number, message?: string) {
      rule.maxLength = length;
      if (message) {
        rule.maxLengthMessage = message;
      }
      return builder;
    },

    min(value: number, message?: string) {
      rule.min = value;
      if (message) {
        rule.minMessage = message;
      }
      return builder;
    },

    max(value: number, message?: string) {
      rule.max = value;
      if (message) {
        rule.maxMessage = message;
      }
      return builder;
    },

    pattern(regex: RegExp | string, message?: string) {
      rule.pattern = regex;
      if (message) {
        rule.patternMessage = message;
      }
      return builder;
    },

    custom(
      fn: (
        value: unknown,
        formData: Record<string, unknown>
      ) => { valid: boolean; errors?: string[] } | undefined
    ) {
      rule.custom = fn;
      return builder;
    },

    asyncValidation(
      fn: (
        value: unknown,
        formData: Record<string, unknown>
      ) => Promise<{ valid: boolean; errors?: string[] }>
    ) {
      rule.asyncValidation = fn;
      return builder;
    },

    dependsOn(fieldName: string, condition = 'equals', message?: string) {
      rule.dependsOn = fieldName;
      rule.condition = condition;
      if (message) {
        rule.message = message;
      }
      return builder;
    },

    enum(values: unknown[]) {
      rule.enum = values;
      return builder;
    },

    build() {
      return rule;
    },
  };

  return builder;
};

/**
 * Sanitize form data by removing/cleaning invalid values
 * @param {Object} formData - Form data to sanitize
 * @param {Array<Object>} fieldRules - Field rules for sanitization
 * @param {Object} options - Sanitization options
 * @param {boolean} options.removeInvalid - Remove invalid fields (default: false)
 * @param {boolean} options.trimStrings - Trim string values (default: true)
 * @returns {Object} Sanitized form data
 * @example
 * const sanitized = sanitizeFormData(formData, rules, { trimStrings: true, removeInvalid: false });
 */
export const sanitizeFormData = (
  formData: Record<string, unknown>,
  fieldRules: FormValidatorFieldRule[],
  options: FormValidatorSanitizationOptions = {}
): FormValidatorSanitizationResult => {
  const { removeInvalid = false, trimStrings = true } = options;

  try {
    const sanitized: Record<string, unknown> = { ...formData };
    const sanitizationLog: string[] = [];

    for (const rule of fieldRules) {
      const fieldName = rule.name;
      let value = sanitized[fieldName];

      if (value === undefined || value === null) {
        continue;
      }

      // Trim strings
      if (trimStrings && typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed !== value) {
          sanitized[fieldName] = trimmed;
          sanitizationLog.push(`${fieldName}: trimmed whitespace`);
        }
        value = trimmed;
      }

      // Type conversion
      if (rule.type) {
        const typeResult = validateFieldType(value, rule.type);
        if (typeResult.valid && typeResult.value !== value) {
          sanitized[fieldName] = typeResult.value;
          sanitizationLog.push(`${fieldName}: converted to ${rule.type}`);
        }
      }

      // Remove invalid fields if requested
      if (removeInvalid) {
        const fieldResult = validateField(sanitized[fieldName], rule, sanitized);
        if (!fieldResult.valid) {
          delete sanitized[fieldName];
          sanitizationLog.push(`${fieldName}: removed (invalid)`);
        }
      }
    }

    logger.info(`Form data sanitized: ${sanitizationLog.length} changes made`);

    return {
      data: sanitized,
      changes: sanitizationLog,
      changeCount: sanitizationLog.length,
    };
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Form sanitization error: ${errorMessage}`);
    return {
      data: formData,
      changes: [],
      changeCount: 0,
      errors: [errorMessage],
    };
  }
};

/**
 * Generate form validation summary report
 * @param {Object} validationResult - Result from validateForm
 * @returns {Object} Formatted summary report
 * @example
 * const report = generateValidationReport(validationResult);
 * console.log(report.summary); // Human-readable summary
 */
export const generateValidationReport = (
  validationResult: FormValidatorResult
): FormValidatorReport => {
  try {
    if (!validationResult || typeof validationResult !== 'object') {
      return {
        summary: 'Invalid validation result provided',
        details: { totalFields: 0, validFields: 0, errorFields: 0, successRate: 0 },
        errors: [],
        recommendations: [],
        fieldResults: {},
      };
    }

    const { valid, fields, summary, errors } = validationResult;
    const recommendations: string[] = [];

    // Generate field-specific recommendations
    Object.entries(fields || {}).forEach(
      ([fieldName, result]: [string, FormValidatorFieldResult]) => {
        if (!result.valid) {
          recommendations.push(`Fix ${fieldName}: ${result.errors.join(', ')}`);
        }
      }
    );

    // Overall recommendations
    if (summary && summary.errorFields > 0) {
      const errorRate = (summary.errorFields / summary.totalFields) * 100;
      if (errorRate > 50) {
        recommendations.push('Consider reviewing form design - high error rate detected');
      }
    }

    const summaryText = valid
      ? `✅ Form validation passed (${summary?.validFields || 0}/${summary?.totalFields || 0} fields valid)`
      : `❌ Form validation failed (${summary?.errorFields || 0} errors in ${summary?.totalFields || 0} fields)`;

    return {
      valid,
      summary: summaryText,
      details: {
        totalFields: summary?.totalFields || 0,
        validFields: summary?.validFields || 0,
        errorFields: summary?.errorFields || 0,
        successRate: validationResult.successRate || 0,
      },
      errors: errors || [],
      recommendations,
      fieldResults: fields || {},
    };
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error(`Validation report generation error: ${errorMessage}`);
    return {
      summary: 'Error generating validation report',
      details: { totalFields: 0, validFields: 0, errorFields: 0, successRate: 0 },
      errors: [errorMessage],
      recommendations: [],
      fieldResults: {},
    };
  }
};
