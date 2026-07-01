/**
 * @fileoverview Master utilities barrel file
 * Central export point for all framework utilities
 * @module utils
 *
 * @example
 * // Import from specific category
 * import { logger } from '@utils/core';
 *
 * @example
 * // Import from master barrel (not recommended for tree-shaking)
 * import { logger, APIClient, validateEmail } from '@utils';
 *
 * @remarks
 * For better tree-shaking and bundle optimization, prefer importing from
 * specific subdirectories rather than the master barrel file.
 */

// ==================== API UTILITIES ====================
/**
 * API testing utilities (REST)
 * @see {@link module:utils/api}
 */
export * as API from './api';

// ==================== AUTHENTICATION UTILITIES ====================
/**
 * Authentication providers and session management
 * @see {@link module:utils/auth}
 */
export * from './auth';

// ==================== BROWSER UTILITIES ====================
/**
 * Browser-level utilities: cookies, dialogs, downloads, navigation, storage, uploads
 * @see {@link module:utils/browser}
 */
export * from './browser';

// ==================== CORE UTILITIES ====================
/**
 * Core utilities: constants, decorators, logger, retry
 * @see {@link module:utils/core}
 */
export * from './core';

// ==================== DATA UTILITIES ====================
/**
 * Test data generation and factories
 * @see {@link module:utils/data}
 */
export * from './data';

// ==================== DATABASE UTILITIES ====================
/**
 * Database operations and utilities
 * @see {@link module:utils/database}
 */
export * from './database';

// ==================== ENCRYPTION UTILITIES ====================
/**
 * Encryption and cryptography utilities
 * @see {@link module:utils/encryption}
 */
export * from './encryption';

// ==================== NETWORK UTILITIES ====================
/**
 * Network utilities: interceptors, proxy, throttling, WebSocket, SSE
 * @see {@link module:utils/network}
 */
export * from './network';

// ==================== PLAYWRIGHT UTILITIES ====================
/**
 * Playwright-specific utilities and enhanced base page
 * @see {@link module:utils/playwright}
 */
export * from './playwright';

// ==================== SECURITY UTILITIES ====================
/**
 * Security testing utilities: CSRF, headers, SQL injection, SSL, XSS
 * @see {@link module:utils/security}
 */
export * from './security';

// ==================== TRANSFORMERS ====================
/**
 * Data transformation utilities: encoding, formatting, masking, normalization, sanitization
 * @see {@link module:utils/transformers}
 */
export * from './transformers';

// ==================== VALIDATORS ====================
/**
 * Data validation utilities: credit card, email, form, password, phone, schema
 * @see {@link module:utils/validators}
 */
export * from './validators';

