/**
 * @fileoverview Test data setup step definitions for API testing.
 * Handles data tables and docstrings for creating test data objects.
 * @module tests/API/step_definitions/data-setup.steps
 */

/// <reference types="../../../../types/playwright.d.ts" />

import { createBdd, test as baseTest } from 'playwright-bdd';
import { APIResponse } from '@playwright/test';

type DataTable = {
  rowsHash: () => Record<string, string>;
};

// Type extension for test object with API state properties
type ExtendedTest = typeof baseTest & {
  userData?: {
    name: string;
    email: string;
    username?: string;
    address?: { street: string; city: string; zipcode: string };
    phone?: string;
    bio?: string;
    website?: string;
    age?: number;
    score?: number;
    city?: string;
    country?: string;
    company?: { name: string; catchPhrase: string; bs: string } | string;
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
  lastApiResponse?: {
    success?: boolean;
    data?: unknown;
    error?: string;
    message?: string;
    status?: number;
  } | null;
  responseTime?: number;
  [key: string]: unknown;
};

// Cast test to extended type for API testing state
const test = baseTest as unknown as ExtendedTest;

const { Given } = createBdd(test as typeof baseTest);

// Test data setup steps using data tables
Given('I have user data:', async ({}, dataTable: DataTable) => {
  const data = dataTable.rowsHash();
  const userData = {
    name: data.name,
    email: data.email,
    username: data.username || data.name.toLowerCase().replace(/\s+/g, ''),
    address: {
      street: data.street || '123 Test Street',
      city: data.city || 'Test City',
      zipcode: data.zipcode || '12345',
    },
  };
  test.userData = userData;
});

Given('I have post data:', async ({}, dataTable: DataTable) => {
  const data = dataTable.rowsHash();
  const postData = {
    title: data.title,
    body: data.body,
    userId: parseInt(data.userId || '1'),
  };
  test.postData = postData;
});

Given('I have comment data:', async ({}, dataTable: DataTable) => {
  const data = dataTable.rowsHash();
  const commentData = {
    postId: parseInt(data.postId || '1'),
    name: data.name,
    email: data.email,
    body: data.body,
  };
  test.commentData = commentData;
});

// Test data setup steps using docstrings
Given('I have user data for creation:', async ({}, docString: string) => {
  const userData = JSON.parse(docString) as typeof test.userData;
  test.userData = userData;
});

Given('I have post data for creation:', async ({}, docString: string) => {
  const postData = JSON.parse(docString) as typeof test.postData;
  test.postData = postData;
});

Given('I have comment data for creation:', async ({}, docString: string) => {
  const commentData = JSON.parse(docString) as typeof test.commentData;
  test.commentData = commentData;
});

Given('I have invalid data:', async ({}, docString: string) => {
  const invalidData = JSON.parse(docString) as Record<string, unknown>;
  test.invalidData = invalidData;
});

Given('I have invalid post data with missing fields', async ({}) => {
  test.invalidData = {}; // Empty object to simulate missing required fields
});

Given('I have updated user data:', async ({}, dataTable: DataTable) => {
  const data = dataTable.rowsHash();
  const updatedData = {
    id: parseInt(data.id || '1'),
    name: data.name,
    email: data.email,
    username: data.username,
  };
  test.updatedData = updatedData;
});

Given('I have updated post data:', async ({}, dataTable: DataTable) => {
  const data = dataTable.rowsHash();
  const updatedData = {
    id: parseInt(data.id || '1'),
    title: data.title,
    body: data.body,
    userId: parseInt(data.userId || '1'),
  };
  test.updatedData = updatedData;
});

// Parameterized data steps for scenarios outlines
Given(
  'I want to create a user with name {string} and email {string}',
  async ({}, name: string, email: string) => {
    test.userData = {
      name,
      email,
      username: name.toLowerCase().replace(/\s+/g, ''),
      address: {
        street: '123 Test Street',
        city: 'Test City',
        zipcode: '12345',
      },
    };
  }
);

Given(
  'I want to create a post with title {string} and body {string} for user {int}',
  async ({}, title: string, body: string, userId: number) => {
    test.postData = {
      title,
      body,
      userId,
    };
  }
);

Given(
  'I want to create a comment with name {string}, email {string}, and body {string} for post {int}',
  async ({}, name: string, email: string, body: string, postId: number) => {
    test.commentData = {
      postId,
      name,
      email,
      body,
    };
  }
);

Given('I want to update user {int} with name {string}', async ({}, id: number, name: string) => {
  test.updatedData = {
    id,
    name,
    email: 'updated@example.com',
    username: name.toLowerCase().replace(/\s+/g, ''),
  };
});

Given('I want to update post {int} with title {string}', async ({}, id: number, title: string) => {
  test.updatedData = {
    id,
    userId: 1,
    title,
    body: 'Updated body content',
  };
});

// Advanced data setup steps

// Dynamic data generation
Given('I have random user data', async ({}) => {
  const timestamp = Date.now();
  test.userData = {
    name: `Test User ${timestamp}`,
    username: `testuser${timestamp}`,
    email: `test${timestamp}@example.com`,
    address: {
      street: '123 Random Street',
      city: 'Test City',
      zipcode: '12345',
    },
    phone: '1-555-123-4567',
    website: `test${timestamp}.org`,
    company: {
      name: `Test Company ${timestamp}`,
      catchPhrase: 'Testing is our passion',
      bs: 'testing solutions',
    },
  };
});

Given('I have random post data for user {int}', async ({}, userId: number) => {
  const timestamp = Date.now();
  test.postData = {
    title: `Test Post ${timestamp}`,
    body: `This is a test post created at ${new Date().toISOString()}`,
    userId,
  };
});

// Empty/minimal data
Given('I have minimal user data', async ({}) => {
  test.userData = {
    name: 'Minimal User',
    username: 'minimal',
    email: 'minimal@test.com',
  };
});

Given('I have empty data', async ({}) => {
  test.userData = {
    name: '',
    email: '',
  };
  test.postData = {
    title: '',
    body: '',
    userId: 0,
  };
  test.commentData = {
    postId: 0,
    name: '',
    email: '',
    body: '',
  };
  test.invalidData = {};
});

// Malformed data
Given('I have malformed JSON data', async ({}) => {
  test.invalidData = { malformed: 'json' } as Record<string, unknown>;
});

Given('I have oversized data', async ({}) => {
  const largeString = 'A'.repeat(10000); // 10KB string
  test.userData = {
    name: largeString,
    email: 'oversized@test.com',
    bio: largeString,
  };
});

// SQL injection test data
Given('I have SQL injection test data', async ({}) => {
  test.userData = {
    name: "'; DROP TABLE users; --",
    email: 'test@example.com',
    username: "admin' OR '1'='1",
  };
});

// XSS test data
Given('I have XSS test data', async ({}) => {
  test.userData = {
    name: "<script>alert('XSS')</script>",
    email: 'test@example.com',
    bio: "<img src=x onerror=alert('XSS')>",
  };
});

// Special characters test data
Given('I have special characters test data', async ({}) => {
  test.userData = {
    name: 'Test User ñáéíóú 中文 🎉',
    email: 'test+tag@sub-domain.co.uk',
    username: 'user_123-test.name',
  };
});

// Boundary value test data
Given('I have boundary value test data', async ({}) => {
  test.userData = {
    name: '', // Empty string
    email: 'a@b.c', // Minimal valid email
    phone: '+1234567890123456789', // Very long phone
    age: 0, // Minimum age
    score: 999999, // Large number
  };
});

// Data with null values
Given('I have data with null values', async ({}) => {
  test.userData = {
    name: '',
    email: 'test@example.com',
    phone: undefined,
    address: undefined,
  };
});

// International test data
Given('I have international test data', async ({}) => {
  test.userData = {
    name: 'José María García-López',
    email: 'josé@münchen.de',
    phone: '+49-30-12345678',
    city: 'São Paulo',
    country: 'España',
  };
});

// Store response data for later use
Given('I store the last response data as {string}', async ({}, variableName: string) => {
  const response = test.lastResponse!;
  const data = (await response.json()) as Record<string, unknown>;
  (test as unknown as Record<string, unknown>)[variableName] = data;
});

// Use stored data
Given('I use stored {string} data for the request', async ({}, variableName: string) => {
  const storedData = (test as Record<string, unknown>)[variableName];
  test.userData = storedData as typeof test.userData;
  test.postData = storedData as typeof test.postData;
  test.commentData = storedData as typeof test.commentData;
});

// Modify existing data
Given(
  'I modify the {string} property to {string}',
  async ({}, propertyName: string, newValue: string) => {
    if (test.userData) {
      (test.userData as Record<string, unknown>)[propertyName] = newValue;
    }
    if (test.postData) {
      (test.postData as Record<string, unknown>)[propertyName] = newValue;
    }
    if (test.commentData) {
      (test.commentData as Record<string, unknown>)[propertyName] = newValue;
    }
  }
);

// Remove property from data
Given('I remove the {string} property from the data', async ({}, propertyName: string) => {
  if (test.userData && Object.prototype.hasOwnProperty.call(test.userData, propertyName)) {
    delete (test.userData as Record<string, unknown>)[propertyName];
  }
  if (test.postData && Object.prototype.hasOwnProperty.call(test.postData, propertyName)) {
    delete (test.postData as Record<string, unknown>)[propertyName];
  }
  if (test.commentData && Object.prototype.hasOwnProperty.call(test.commentData, propertyName)) {
    delete (test.commentData as Record<string, unknown>)[propertyName];
  }
});
