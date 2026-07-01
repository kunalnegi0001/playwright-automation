/**
 * @fileoverview Playwright custom fixture type definitions.
 * Defines custom fixtures for authentication, API contexts, session pooling, and test metadata.
 * @module types/playwright
 */

import { Page, BrowserContext, APIRequestContext, APIResponse } from '@playwright/test';
import { User } from './common';

// DataTable types for BDD step definitions
export type DataTable = {
  raw(): string[][];
  rows(): string[][];
  rowsHash(): Record<string, string>;
  hashes(): Record<string, string>[];
};

export type CustomFixtures = {
  authenticatedPage: Page;
  authenticatedContext: BrowserContext;
  apiContext: APIRequestContext;
  testUser: User;
  sessionPool: SessionPool;
};

export type CustomWorkerFixtures = {
  adminUser: User;
  workerStorageState: string;
};

export type SessionPool = {
  acquire(): Promise<{ page: Page; context: BrowserContext; user: User }>;
  release(_page: Page): Promise<void>;
  size(): number;
};

export type TestMetadata = {
  testId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  retries: number;
  browser: string;
  viewport: { width: number; height: number };
  videoPath?: string;
  screenshotPath?: string;
};

// Augment playwright-bdd BddTestFixtures
declare module 'playwright-bdd' {
  export interface BddTestFixtures {
    userData?: {
      name: string;
      email: string;
      username?: string;
      address?: {
        street: string;
        city: string;
        zipcode: string;
      };
    };
    postData?: {
      title: string;
      body: string;
      userId: number;
    };
    commentData?: {
      postId: number;
      name: string;
      email: string;
      body: string;
    };
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
    lastApiResponse?: {
      success?: boolean;
      data?: unknown;
      error?: string;
      message?: string;
      status?: number;
    } | null;
    responseTime?: number;
  }

  export interface Test {
    userData?: {
      name: string;
      email: string;
      username?: string;
      address?: {
        street: string;
        city: string;
        zipcode: string;
      };
    };
    postData?: {
      title: string;
      body: string;
      userId: number;
    };
    commentData?: {
      postId: number;
      name: string;
      email: string;
      body: string;
    };
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
    lastApiResponse?: {
      success?: boolean;
      data?: unknown;
      error?: string;
      message?: string;
      status?: number;
    } | null;
    responseTime?: number;
  }
}

declare module '@playwright/test' {
  export interface Page {
    accessibility: {
      snapshot(options?: { interestingOnly?: boolean; root?: any }): Promise<unknown>;
    };
  }

  export interface Test {
    userData?: {
      name: string;
      email: string;
      username?: string;
      address?: {
        street: string;
        city: string;
        zipcode: string;
      };
    };
    postData?: {
      title: string;
      body: string;
      userId: number;
    };
    commentData?: {
      postId: number;
      name: string;
      email: string;
      body: string;
    };
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
    lastApiResponse?: {
      success?: boolean;
      data?: unknown;
      error?: string;
      message?: string;
      status?: number;
    } | null;
    responseTime?: number;
  }
}

