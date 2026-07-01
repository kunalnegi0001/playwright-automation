/**
 * @fileoverview Custom Playwright test fixtures for enhanced testing capabilities.
 * Extends base Playwright test with authenticated contexts, API clients, and shared utilities.
 * @module fixtures/test.fixtures
 */

import { test as base, APIResponse, Page, APIRequestContext } from '@playwright/test';
import { AuthFactory } from '@utils/auth/auth-factory';
import { configManager } from '@config/config.manager';
import { logger } from '@utils/core';

/**
 * Custom test fixtures type definition
 */
export type CustomTestFixtures = {
  config: typeof configManager;
  logger: typeof logger;
  authenticatedPage: Page;
  adminPage: Page;
  apiContext: APIRequestContext;
  // API testing state properties
  userData?: {
    name: string;
    email: string;
    username?: string;
    address?: { street: string; city: string; zipcode: string };
  };
  postData?: { title: string; body: string; userId: number };
  commentData?: { postId: number; name: string; email: string; body: string };
  invalidData?: Record<string, unknown>;
  updatedData?: {
    id?: number;
    name?: string;
    email?: string;
    username?: string;
    title?: string;
    body?: string;
    userId?: number;
  };
  lastResponse?: APIResponse;
  lastApiResponse?: { success?: boolean; data?: unknown; error?: string; message?: string };
  responseTime?: number;
};

/**
 * Extended Playwright Test with Custom Fixtures
 * Provides authenticated pages, API clients, and configuration access
 * @typedef {Object} TestFixtures
 * @property {typeof configManager} config - Configuration manager instance
 * @property {typeof logger} logger - Logger instance
 * @property {Page} authenticatedPage - Page with standard user authentication
 * @property {Page} adminPage - Page with admin user authentication
 * @property {APIRequestContext} apiContext - Playwright request context
 */
export const test = base.extend<CustomTestFixtures>({
  /**
   * Configuration fixture
   * Provides access to application configuration and test user credentials
   */
  config: async (_fixtures, use) => {
    await use(configManager);
  },

  /**
   * Logger fixture
   * Provides access to the centralized logging utility
   */
  logger: async (_fixtures, use) => {
    await use(logger);
  },

  /**
   * Authenticated page for standard user
   * Creates a new browser context with standard user authentication
   * @async
   */
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Get test user credentials
    const user = configManager.getConfigTestUser('standard');
    const loginIdentity = user.email || user.username || '';
    const authProvider = AuthFactory.createProvider('basic');

    // Authenticate - map username to email if needed
    await authProvider.authenticate(
      { email: loginIdentity, password: user.password || '' },
      page,
      { saveState: true }
    );

    await use(page);

    await page.close();
    await context.close();
  },

  /**
   * Authenticated page for admin user
   */
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const user = configManager.getConfigTestUser('admin');
    const loginIdentity = user.email || user.username || '';
    const authProvider = AuthFactory.createProvider('basic');

    await authProvider.authenticate(
      { email: loginIdentity, password: user.password || '' },
      page,
      { saveState: true }
    );

    await use(page);

    await page.close();
    await context.close();
  },

  /**
   * Playwright request context fixture
   */
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: configManager.getAPIBaseURL(),
      extraHTTPHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    await use(context);
    await context.dispose();
  },

  // API testing state properties - initialized as undefined
  userData: undefined,
  postData: undefined,
  commentData: undefined,
  invalidData: undefined,
  updatedData: undefined,
  lastResponse: undefined,
  lastApiResponse: undefined,
  responseTime: undefined,
});

export { expect } from '@playwright/test';
