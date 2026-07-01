/**
 * @fileoverview API pagination helpers for various pagination strategies.
 * Supports offset-based, page number, cursor-based, and link header pagination.
 * @module api-testing/rest/pagination.helper
 */

import { logger } from '@utils/core';

/**
 * Options for basic pagination operations
 */
export type PaginationOptions = {
  /** Maximum items per page */
  limit?: number;
  /** Maximum number of pages to fetch */
  maxPages?: number;
  /** Custom function to determine if more pages exist */
  hasMoreFn?: ((response: unknown) => boolean) | null;
};

/**
 * Options for page number-based pagination
 */
export type PaginationPageNumberOptions = PaginationOptions & {
  /** Starting page number (typically 1) */
  startPage?: number;
};

/**
 * Options for cursor-based pagination
 */
export type PaginationCursorOptions = {
  /** Maximum items per page */
  limit?: number;
  /** Initial cursor value for first page */
  initialCursor?: string | null;
  /** Key in response containing next cursor (supports dot notation) */
  cursorKey?: string;
  /** Maximum number of pages to fetch */
  maxPages?: number;
};

/**
 * Options for extracting pagination metadata
 */
export type PaginationMetaOptions = {
  /** Key containing pagination metadata in response */
  metaKey?: string;
};

/**
 * Options for validating pagination response structure
 */
export type PaginationValidationOptions = {
  /** Required fields in pagination response (supports dot notation) */
  requiredFields?: string[];
};

/**
 * Options for fetching specific page ranges
 */
export type PaginationPageRangeOptions = {
  /** Maximum items per page */
  limit?: number;
};

/**
 * Pagination metadata extracted from API response
 */
export type PaginationMeta = {
  /** Total number of pages available */
  totalPages: number | null;
  /** Current page number */
  currentPage: number | null;
  /** Total number of items across all pages */
  totalItems: number | null;
  /** Number of items per page */
  itemsPerPage: number | null;
  /** Whether next page exists */
  hasNextPage: boolean;
  /** Whether previous page exists */
  hasPrevPage: boolean;
  /** Cursor for next page (cursor-based pagination) */
  nextCursor: string | null;
  /** Cursor for previous page (cursor-based pagination) */
  prevCursor: string | null;
};

/**
 * Result of pagination response validation
 */
export type PaginationValidationResult = {
  /** Whether validation passed */
  valid: boolean;
  /** Array of validation error messages */
  errors: string[];
};

/**
 * Statistical information about pagination
 */
export type PaginationStats = {
  /** Total number of items */
  totalItems: number;
  /** Items per page */
  itemsPerPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Number of items on last page */
  lastPageItems: number;
  /** Number of full pages (excluding partial last page) */
  fullPages: number;
};

/**
 * Function signature for fetching paginated data
 */
export type PaginationFetchFunction = (
  pageOrOffset: number | string | null,
  limit: number
) => Promise<unknown>;

/**
 * @fileoverview Pagination handling helpers for API testing
 * Provides utilities for handling different pagination strategies
 * @module pagination.helper
 */

/**
 * Fetch all pages using offset-based pagination
 * @param {Function} fetchFn - Function to fetch a page (receives offset, limit)
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Items per page (default: 20)
 * @param {number} options.maxPages - Maximum pages to fetch (default: 100)
 * @param {Function} options.hasMoreFn - Function to check if more pages exist
 * @returns {Promise<Array>} All items from all pages
 * @example
 * const allUsers = await fetchAllPagesOffset(
 *   (offset, limit) => fetch(`/api/users?offset=${offset}&limit=${limit}`),
 *   { limit: 50, maxPages: 10 }
 * );
 */
export const fetchAllPagesOffset = async (
  fetchFn: PaginationFetchFunction,
  options: PaginationOptions = {}
): Promise<unknown[]> => {
  const { limit = 20, maxPages = 100, hasMoreFn = null } = options;

  try {
    const allItems: unknown[] = [];
    let offset = 0;
    let pageCount = 0;

    while (pageCount < maxPages) {
      const response = await fetchFn(offset, limit);
      const responseObj = response as Record<string, unknown>;
      const items = Array.isArray(response)
        ? response
        : ((responseObj.data || responseObj.items || []) as unknown[]);

      if (items.length === 0) {
        break;
      }

      allItems.push(...items);
      pageCount++;
      offset += limit;

      // Custom check for more pages
      if (hasMoreFn && !hasMoreFn(response)) {
        break;
      }

      // Standard check: if received less than limit, no more pages
      if (items.length < limit) {
        break;
      }
    }

    logger.info(`Fetched ${allItems.length} items across ${pageCount} pages (offset-based)`);
    return allItems;
  } catch (error) {
    logger.error(`Offset pagination failed: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Fetch all pages using page number-based pagination
 * @param {Function} fetchFn - Function to fetch a page (receives page, limit)
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Items per page (default: 20)
 * @param {number} options.startPage - Starting page number (default: 1)
 * @param {number} options.maxPages - Maximum pages to fetch (default: 100)
 * @param {Function} options.hasMoreFn - Function to check if more pages exist
 * @returns {Promise<Array>} All items from all pages
 * @example
 * const allProducts = await fetchAllPagesNumber(
 *   (page, limit) => fetch(`/api/products?page=${page}&limit=${limit}`),
 *   { limit: 25, startPage: 1 }
 * );
 */
export const fetchAllPagesNumber = async (
  fetchFn: PaginationFetchFunction,
  options: PaginationPageNumberOptions = {}
): Promise<unknown[]> => {
  const { limit = 20, startPage = 1, maxPages = 100, hasMoreFn = null } = options;

  try {
    const allItems: unknown[] = [];
    let currentPage = startPage;
    let pageCount = 0;

    while (pageCount < maxPages) {
      const response = await fetchFn(currentPage, limit);
      const responseObj = response as Record<string, unknown>;
      const items = Array.isArray(response)
        ? response
        : ((responseObj.data || responseObj.items || []) as unknown[]);

      if (items.length === 0) {
        break;
      }

      allItems.push(...items);
      pageCount++;
      currentPage++;

      // Custom check for more pages
      if (hasMoreFn && !hasMoreFn(response)) {
        break;
      }

      // Standard check
      if (items.length < limit) {
        break;
      }
    }

    logger.info(`Fetched ${allItems.length} items across ${pageCount} pages (page number-based)`);
    return allItems;
  } catch (error) {
    logger.error(`Page number pagination failed: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Fetch all pages using cursor-based pagination
 * @param {Function} fetchFn - Function to fetch a page (receives cursor, limit)
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Items per page (default: 20)
 * @param {string} options.initialCursor - Initial cursor value (default: null)
 * @param {string} options.cursorKey - Key in response containing next cursor (default: 'nextCursor')
 * @param {number} options.maxPages - Maximum pages to fetch (default: 100)
 * @returns {Promise<Array>} All items from all pages
 * @example
 * const allOrders = await fetchAllPagesCursor(
 *   (cursor, limit) => fetch(`/api/orders?cursor=${cursor}&limit=${limit}`),
 *   { limit: 30, cursorKey: 'pagination.next' }
 * );
 */
export const fetchAllPagesCursor = async (
  fetchFn: PaginationFetchFunction,
  options: PaginationCursorOptions = {}
): Promise<unknown[]> => {
  const { limit = 20, initialCursor = null, cursorKey = 'nextCursor', maxPages = 100 } = options;

  try {
    const allItems: unknown[] = [];
    let cursor: string | null = initialCursor;
    let pageCount = 0;

    while (pageCount < maxPages) {
      const response = await fetchFn(cursor, limit);
      const responseObj = response as Record<string, unknown>;
      const items = Array.isArray(response)
        ? response
        : ((responseObj.data || responseObj.items || []) as unknown[]);

      if (items.length === 0) {
        break;
      }

      allItems.push(...items);
      pageCount++;

      // Get next cursor
      const keys = cursorKey.split('.');
      let nextCursor: unknown = response;
      for (const key of keys) {
        nextCursor = (nextCursor as Record<string, unknown>)?.[key];
      }

      if (!nextCursor) {
        break;
      }
      cursor = nextCursor as string;
    }

    logger.info(`Fetched ${allItems.length} items across ${pageCount} pages (cursor-based)`);
    return allItems;
  } catch (error) {
    logger.error(`Cursor pagination failed: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Extract pagination metadata from response
 * @param {Object} response - API response
 * @param {Object} options - Extraction options
 * @param {string} options.metaKey - Key containing pagination metadata (default: 'meta')
 * @returns {Object} Pagination metadata
 * @example
 * const meta = extractPaginationMeta(response);
 * console.log(meta.totalPages, meta.currentPage, meta.totalItems);
 */
export const extractPaginationMeta = (
  response: unknown,
  options: PaginationMetaOptions = {}
): PaginationMeta => {
  const { metaKey = 'meta' } = options;

  try {
    const responseObj = response as Record<string, unknown>;
    const meta = (responseObj[metaKey] || responseObj.pagination || {}) as Record<string, unknown>;

    return {
      totalPages: (meta.totalPages || meta.total_pages || meta.pageCount || null) as number | null,
      currentPage: (meta.currentPage || meta.current_page || meta.page || null) as number | null,
      totalItems: (meta.totalItems || meta.total_items || meta.total || meta.count || null) as
        | number
        | null,
      itemsPerPage: (meta.itemsPerPage ||
        meta.items_per_page ||
        meta.limit ||
        meta.pageSize ||
        null) as number | null,
      hasNextPage: (meta.hasNextPage || meta.has_next_page || meta.hasNext || false) as boolean,
      hasPrevPage: (meta.hasPrevPage || meta.has_prev_page || meta.hasPrev || false) as boolean,
      nextCursor: (meta.nextCursor || meta.next_cursor || meta.next || null) as string | null,
      prevCursor: (meta.prevCursor || meta.prev_cursor || meta.prev || null) as string | null,
    };
  } catch (error) {
    logger.error(`Failed to extract pagination metadata: ${(error as Error).message}`);
    return {
      totalPages: null,
      currentPage: null,
      totalItems: null,
      itemsPerPage: null,
      hasNextPage: false,
      hasPrevPage: false,
      nextCursor: null,
      prevCursor: null,
    };
  }
};

/**
 * Validate pagination response structure
 * @param {Object} response - API response
 * @param {Object} options - Validation options
 * @param {Array<string>} options.requiredFields - Required pagination fields
 * @returns {Object} Validation result
 * @example
 * const result = validatePaginationResponse(response, {
 *   requiredFields: ['data', 'meta.totalPages', 'meta.currentPage']
 * });
 */
export const validatePaginationResponse = (
  responseData: unknown,
  options: PaginationValidationOptions = {}
): PaginationValidationResult => {
  const { requiredFields = ['data'] } = options;

  try {
    const errors: string[] = [];

    for (const field of requiredFields) {
      const keys = field.split('.');
      let value: unknown = responseData;

      for (const key of keys) {
        value = (value as Record<string, unknown>)?.[key];
      }

      if (value === undefined || value === null) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    const valid = errors.length === 0;
    if (valid) {
      logger.info('Pagination response validation passed');
    } else {
      logger.warn(`Pagination response validation failed: ${errors.join(', ')}`);
    }

    return { valid, errors };
  } catch (error) {
    logger.error(`Pagination validation failed: ${(error as Error).message}`);
    return { valid: false, errors: [(error as Error).message] };
  }
};

/**
 * Calculate pagination statistics
 * @param {number} totalItems - Total number of items
 * @param {number} itemsPerPage - Items per page
 * @returns {Object} Pagination statistics
 * @example
 * const stats = calculatePaginationStats(150, 25);
 * console.log(stats.totalPages); // 6
 */
export const calculatePaginationStats = (
  totalItems: number,
  itemsPerPage: number
): PaginationStats => {
  try {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const lastPageItems = totalItems % itemsPerPage || itemsPerPage;

    return {
      totalItems,
      itemsPerPage,
      totalPages,
      lastPageItems,
      fullPages: totalPages - (lastPageItems < itemsPerPage ? 1 : 0),
    };
  } catch (error) {
    logger.error(`Failed to calculate pagination stats: ${(error as Error).message}`);
    return {
      totalItems: 0,
      itemsPerPage: 0,
      totalPages: 0,
      lastPageItems: 0,
      fullPages: 0,
    };
  }
};

/**
 * Fetch specific page range
 * @param {Function} fetchFn - Function to fetch a page (receives page, limit)
 * @param {number} startPage - Starting page number
 * @param {number} endPage - Ending page number
 * @param {Object} options - Options
 * @param {number} options.limit - Items per page (default: 20)
 * @returns {Promise<Array>} Items from specified page range
 * @example
 * const items = await fetchPageRange(
 *   (page, limit) => fetch(`/api/items?page=${page}&limit=${limit}`),
 *   3, 5, { limit: 20 }
 * );
 */
export const fetchPageRange = async (
  fetchFn: PaginationFetchFunction,
  startPage: number,
  endPage: number,
  options: PaginationPageRangeOptions = {}
): Promise<unknown[]> => {
  const { limit = 20 } = options;

  try {
    const allItems: unknown[] = [];

    for (let page = startPage; page <= endPage; page++) {
      const response = await fetchFn(page, limit);
      const responseObj = response as Record<string, unknown>;
      const items = Array.isArray(response)
        ? response
        : ((responseObj.data || responseObj.items || []) as unknown[]);
      allItems.push(...items);
    }

    logger.info(`Fetched ${allItems.length} items from pages ${startPage}-${endPage}`);
    return allItems;
  } catch (error) {
    logger.error(`Failed to fetch page range: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Auto-detect pagination type from API response structure
 * @param response - API response object
 * @returns Pagination type: 'offset', 'page', 'cursor', or 'unknown'
 * @example
 * const type = detectPaginationType(response);
 * console.log(type); // 'cursor'
 */
export const detectPaginationType = (response: unknown): string => {
  try {
    const responseObj = response as Record<string, unknown>;
    const meta = (responseObj.meta || responseObj.pagination || {}) as Record<string, unknown>;

    if (meta.nextCursor || meta.next_cursor || meta.cursor) {
      return 'cursor';
    }

    if (meta.offset !== undefined || meta.skip !== undefined) {
      return 'offset';
    }

    if (
      meta.page !== undefined ||
      meta.currentPage !== undefined ||
      meta.current_page !== undefined
    ) {
      return 'page';
    }

    return 'unknown';
  } catch (error) {
    logger.error(`Failed to detect pagination type: ${(error as Error).message}`);
    return 'unknown';
  }
};
