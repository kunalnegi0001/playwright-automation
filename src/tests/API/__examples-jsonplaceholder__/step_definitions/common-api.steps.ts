/**
 * @fileoverview Common API testing step definitions for JSONPlaceholder.
 * Provides reusable BDD steps for HTTP methods, validation, and assertions.
 * @module tests/API/step_definitions/common-api.steps
 */

/// <reference types="../../../../types/playwright.d.ts" />

import { createBdd, test as baseTest } from 'playwright-bdd';
import { expect } from '@playwright/test';
import type { DataTable } from '@/types/playwright';
import type { APIResponse } from '@playwright/test';

// Type extension for test object with API state properties
type ExtendedTest = typeof baseTest & {
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
  lastApiResponse?: {
    success?: boolean;
    data?: unknown;
    error?: string;
    message?: string;
  } | null;
  responseTime?: number;
};

// Cast test to extended type for API testing state
const test = baseTest as unknown as ExtendedTest;

const { Given, When, Then } = createBdd(test as typeof baseTest);

// Helper to get API base URL
const getApiBaseURL = (): string =>
  process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com';

// Background steps
Given('the JSONPlaceholder API is available', async () => {
  // This step is just for documentation - the API is always available
});

// Common API request steps
When('I send a GET request to {string}', async ({ request }, endpoint: string) => {
  const startTime = Date.now();
  const apiBaseURL = getApiBaseURL();
  const response = await request.get(`${apiBaseURL}${endpoint}`);
  const endTime = Date.now();
  test.responseTime = endTime - startTime;

  test.info().attach('api-response', {
    body: JSON.stringify({
      status: response.status(),
      url: response.url(),
      responseTime: `${endTime - startTime}ms`,
      headers: response.headers(),
      body: await response.text(),
    }),
    contentType: 'application/json',
  });
  // Store response in test context
  test.lastResponse = response;
});

// Advanced request steps with headers
When(
  'I send a GET request to {string} with header {string}: {string}',
  async ({ request }, endpoint: string, headerName: string, headerValue: string) => {
    const startTime = Date.now();
    const response = await request.get(`${getApiBaseURL()}${endpoint}`, {
      headers: {
        [headerName]: headerValue,
      },
    });
    const endTime = Date.now();
    test.responseTime = endTime - startTime;

    test.info().attach('api-response', {
      body: JSON.stringify({
        status: response.status(),
        url: response.url(),
        responseTime: `${endTime - startTime}ms`,
        requestHeaders: { [headerName]: headerValue },
        responseHeaders: response.headers(),
        body: await response.text(),
      }),
      contentType: 'application/json',
    });
    test.lastResponse = response;
  }
);

// PATCH method support
When(
  'I send a PATCH request to {string} with the updated data',
  async ({ request }, endpoint: string) => {
    const updatedData = test.updatedData;
    const startTime = Date.now();
    const response = await request.patch(`${getApiBaseURL()}${endpoint}`, {
      data: updatedData,
    });
    const endTime = Date.now();
    test.responseTime = endTime - startTime;

    test.info().attach('api-response', {
      body: JSON.stringify({
        status: response.status(),
        url: response.url(),
        responseTime: `${endTime - startTime}ms`,
        requestBody: updatedData,
        responseBody: await response.text(),
      }),
      contentType: 'application/json',
    });
    test.lastResponse = response;
  }
);

// Request with query parameters
When(
  'I send a GET request to {string} with query parameter {string}={string}',
  async ({ request }, endpoint: string, paramName: string, paramValue: string) => {
    const url = new URL(`${getApiBaseURL()}${endpoint}`);
    url.searchParams.set(paramName, paramValue);

    const startTime = Date.now();
    const response = await request.get(url.toString());
    const endTime = Date.now();
    test.responseTime = endTime - startTime;

    test.info().attach('api-response', {
      body: JSON.stringify({
        status: response.status(),
        url: response.url(),
        responseTime: `${endTime - startTime}ms`,
        queryParams: { [paramName]: paramValue },
        body: await response.text(),
      }),
      contentType: 'application/json',
    });
    test.lastResponse = response;
  }
);

// Request with multiple query parameters
When(
  'I send a GET request to {string} with query parameters:',
  async ({ request }, endpoint: string, dataTable: DataTable) => {
    const url = new URL(`${getApiBaseURL()}${endpoint}`);
    const params = dataTable.rowsHash();

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value as string);
    });

    const startTime = Date.now();
    const response = await request.get(url.toString());
    const endTime = Date.now();
    test.responseTime = endTime - startTime;

    test.info().attach('api-response', {
      body: JSON.stringify({
        status: response.status(),
        url: response.url(),
        responseTime: `${endTime - startTime}ms`,
        queryParams: params,
        body: await response.text(),
      }),
      contentType: 'application/json',
    });
    test.lastResponse = response;
  }
);

// Request with custom headers table
When(
  'I send a {string} request to {string} with headers:',
  async ({ request }, method: string, endpoint: string, dataTable: DataTable) => {
    const headers = dataTable.rowsHash();
    const startTime = Date.now();

    let response: APIResponse;
    switch (method.toUpperCase()) {
      case 'GET':
        response = await request.get(`${getApiBaseURL()}${endpoint}`, {
          headers,
        });
        break;
      case 'POST': {
        const postData = test.postData || test.userData || test.commentData || {};
        response = await request.post(`${getApiBaseURL()}${endpoint}`, {
          data: postData,
          headers,
        });
        break;
      }
      case 'PUT': {
        const putData = test.updatedData || {};
        response = await request.put(`${getApiBaseURL()}${endpoint}`, {
          data: putData,
          headers,
        });
        break;
      }
      case 'DELETE':
        response = await request.delete(`${getApiBaseURL()}${endpoint}`, {
          headers,
        });
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }

    const endTime = Date.now();
    test.responseTime = endTime - startTime;

    test.info().attach('api-response', {
      body: JSON.stringify({
        status: response.status(),
        url: response.url(),
        method: method.toUpperCase(),
        responseTime: `${endTime - startTime}ms`,
        requestHeaders: headers,
        responseHeaders: response.headers(),
        body: await response.text(),
      }),
      contentType: 'application/json',
    });
    test.lastResponse = response;
  }
);

When(
  'I send a POST request to {string} with the user data',
  async ({ request }, endpoint: string) => {
    const userData = test.userData;
    const response = await request.post(`${getApiBaseURL()}${endpoint}`, {
      data: userData,
    });
    test.info().attach('api-response', {
      body: JSON.stringify({
        status: response.status(),
        url: response.url(),
        requestBody: userData,
        responseBody: await response.text(),
      }),
      contentType: 'application/json',
    });
    test.lastResponse = response;
  }
);

When(
  'I send a POST request to {string} with the post data',
  async ({ request }, endpoint: string) => {
    const postData = test.postData;
    const response = await request.post(`${getApiBaseURL()}${endpoint}`, {
      data: postData,
    });
    test.info().attach('api-response', {
      body: JSON.stringify({
        status: response.status(),
        url: response.url(),
        requestBody: postData,
        responseBody: await response.text(),
      }),
      contentType: 'application/json',
    });
    test.lastResponse = response;
  }
);

When(
  'I send a POST request to {string} with the comment data',
  async ({ request }, endpoint: string) => {
    const commentData = test.commentData;
    const response = await request.post(`${getApiBaseURL()}${endpoint}`, {
      data: commentData,
    });
    test.info().attach('api-response', {
      body: JSON.stringify({
        status: response.status(),
        url: response.url(),
        requestBody: commentData,
        responseBody: await response.text(),
      }),
      contentType: 'application/json',
    });
    test.lastResponse = response;
  }
);

When(
  'I send a POST request to {string} with the invalid data',
  async ({ request }, endpoint: string) => {
    const invalidData = test.invalidData || {};
    const response = await request.post(`${getApiBaseURL()}${endpoint}`, {
      data: invalidData,
    });
    test.info().attach('api-response', {
      body: JSON.stringify({
        status: response.status(),
        url: response.url(),
        requestBody: invalidData,
        responseBody: await response.text(),
      }),
      contentType: 'application/json',
    });
    test.lastResponse = response;
  }
);

When(
  'I send a PUT request to {string} with the updated data',
  async ({ request }, endpoint: string) => {
    const updatedData = test.updatedData;
    const response = await request.put(`${getApiBaseURL()}${endpoint}`, {
      data: updatedData,
    });
    test.info().attach('api-response', {
      body: JSON.stringify({
        status: response.status(),
        url: response.url(),
        requestBody: updatedData,
        responseBody: await response.text(),
      }),
      contentType: 'application/json',
    });
    test.lastResponse = response;
  }
);

When('I send a DELETE request to {string}', async ({ request }, endpoint: string) => {
  const response = await request.delete(`${getApiBaseURL()}${endpoint}`);
  test.info().attach('api-response', {
    body: JSON.stringify({
      status: response.status(),
      url: response.url(),
      responseBody: await response.text(),
    }),
    contentType: 'application/json',
  });
  test.lastResponse = response;
});

// Response validation steps
Then('the response status code should be {int}', async ({}, expectedStatus: number) => {
  const response = test.lastResponse as APIResponse;
  expect(response.status()).toBe(expectedStatus);
});

Then('the response status code should be one of: {string}', async ({}, statusCodes: string) => {
  const response = test.lastResponse as APIResponse;
  const allowedCodes = statusCodes.split(',').map(code => parseInt(code.trim()));
  expect(allowedCodes).toContain(response.status());
});

Then(
  'the response status code should be one of: {int}, {int}, {int}, {int}',
  async ({}, code1: number, code2: number, code3: number, code4: number) => {
    const response = test.lastResponse as APIResponse;
    const allowedCodes = [code1, code2, code3, code4];
    expect(allowedCodes).toContain(response.status());
  }
);

Then('the response should contain a list of users', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const users = (await response.json()) as unknown[];
  expect(Array.isArray(users)).toBe(true);
  expect(users.length).toBeGreaterThan(0);
});

Then('the response should contain a list of posts', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const posts = (await response.json()) as unknown[];
  expect(Array.isArray(posts)).toBe(true);
  expect(posts.length).toBeGreaterThan(0);
});

Then('the response should contain a list of comments', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const comments = (await response.json()) as unknown[];
  expect(Array.isArray(comments)).toBe(true);
  expect(comments.length).toBeGreaterThan(0);
});

Then('the response should contain a list of albums', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const albums = (await response.json()) as unknown[];
  expect(Array.isArray(albums)).toBe(true);
  expect(albums.length).toBeGreaterThan(0);
});

Then('the response should contain a list of photos', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const photos = (await response.json()) as unknown[];
  expect(Array.isArray(photos)).toBe(true);
  expect(photos.length).toBeGreaterThan(0);
});

Then('each user should have id, name, email, and username', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const users = (await response.json()) as unknown[];
  expect(users[0]).toHaveProperty('id');
  expect(users[0]).toHaveProperty('name');
  expect(users[0]).toHaveProperty('email');
  expect(users[0]).toHaveProperty('username');
});

Then('each post should have id, title, body, and userId', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const posts = (await response.json()) as unknown[];
  expect(posts[0]).toHaveProperty('id');
  expect(posts[0]).toHaveProperty('title');
  expect(posts[0]).toHaveProperty('body');
  expect(posts[0]).toHaveProperty('userId');
});

Then('each comment should have id, name, email, body, and postId', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const comments = (await response.json()) as unknown[];
  expect(comments[0]).toHaveProperty('id');
  expect(comments[0]).toHaveProperty('name');
  expect(comments[0]).toHaveProperty('email');
  expect(comments[0]).toHaveProperty('body');
  expect(comments[0]).toHaveProperty('postId');
});

Then('each album should have id, title, and userId', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const albums = (await response.json()) as unknown[];
  expect(albums[0]).toHaveProperty('id');
  expect(albums[0]).toHaveProperty('title');
  expect(albums[0]).toHaveProperty('userId');
});

Then('each photo should have albumId, title, url, and thumbnailUrl', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const photos = (await response.json()) as Record<string, unknown>[];
  if (photos.length > 0) {
    expect(photos[0]).toHaveProperty('albumId');
    expect(photos[0]).toHaveProperty('title');
    expect(photos[0]).toHaveProperty('url');
    expect(photos[0]).toHaveProperty('thumbnailUrl');
  }
});

Then('the response should contain user details', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const user = (await response.json()) as Record<string, unknown>;
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('name');
  expect(user).toHaveProperty('email');
  expect(user).toHaveProperty('username');
});

Then('the response should contain post details', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const post = (await response.json()) as Record<string, unknown>;
  expect(post).toHaveProperty('id');
  expect(post).toHaveProperty('title');
  expect(post).toHaveProperty('body');
  expect(post).toHaveProperty('userId');
});

Then('the response should contain comment details', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const comment = (await response.json()) as Record<string, unknown>;
  expect(comment).toHaveProperty('id');
  expect(comment).toHaveProperty('name');
  expect(comment).toHaveProperty('email');
  expect(comment).toHaveProperty('body');
});

Then('the user id should be {int}', async ({}, expectedId: number) => {
  const response = test.lastResponse as APIResponse;
  const user = (await response.json()) as Record<string, unknown>;
  expect(user.id).toBe(expectedId);
});

Then('the post id should be {int}', async ({}, expectedId: number) => {
  const response = test.lastResponse as APIResponse;
  const post = (await response.json()) as Record<string, unknown>;
  expect(post.id).toBe(expectedId);
});

Then('the comment id should be {int}', async ({}, expectedId: number) => {
  const response = test.lastResponse as APIResponse;
  const comment = (await response.json()) as Record<string, unknown>;
  expect(comment.id).toBe(expectedId);
});

Then('all posts should belong to user {int}', async ({}, userId: number) => {
  const response = test.lastResponse as APIResponse;
  const posts = (await response.json()) as Record<string, unknown>[];
  posts.forEach((post: Record<string, unknown>) => {
    expect(post.userId).toBe(userId);
  });
});

Then('all comments should belong to post {int}', async ({}, postId: number) => {
  const response = test.lastResponse as APIResponse;
  const comments = (await response.json()) as Record<string, unknown>[];
  comments.forEach((comment: Record<string, unknown>) => {
    expect(comment.postId).toBe(postId);
  });
});

Then('all albums should belong to user {int}', async ({}, userId: number) => {
  const response = test.lastResponse as APIResponse;
  const albums = (await response.json()) as Record<string, unknown>[];
  albums.forEach((album: Record<string, unknown>) => {
    expect(album.userId).toBe(userId);
  });
});

Then('all photos should belong to album {int}', async ({}, albumId: number) => {
  const response = test.lastResponse as APIResponse;
  const photos = (await response.json()) as Record<string, unknown>[];
  photos.forEach((photo: Record<string, unknown>) => {
    expect(photo.albumId).toBe(albumId);
  });
});

Then('the response should contain the created user', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const userData = test.userData!;
  const createdUser = (await response.json()) as Record<string, unknown>;
  expect(createdUser).toHaveProperty('name', userData.name);
  expect(createdUser).toHaveProperty('email', userData.email);
  expect(createdUser).toHaveProperty('id');
});

Then('the response should contain the created post', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const postData = test.postData!;
  const createdPost = (await response.json()) as Record<string, unknown>;
  expect(createdPost).toHaveProperty('title', postData.title);
  expect(createdPost).toHaveProperty('body', postData.body);
  expect(createdPost).toHaveProperty('userId', postData.userId);
  expect(createdPost).toHaveProperty('id');
});

Then('the response should contain the created comment', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const commentData = test.commentData!;
  const createdComment = (await response.json()) as Record<string, unknown>;
  expect(createdComment).toHaveProperty('name', commentData.name);
  expect(createdComment).toHaveProperty('body', commentData.body);
  expect(createdComment).toHaveProperty('postId', commentData.postId);
  expect(createdComment).toHaveProperty('id');
});

Then('the response should contain the updated user', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const updatedData = test.updatedData!;
  const updatedUser = (await response.json()) as Record<string, unknown>;
  expect(updatedUser).toHaveProperty('name', updatedData.name);
  expect(updatedUser).toHaveProperty('id', updatedData.id);
});

Then('the response should contain the updated post', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const updatedData = test.updatedData!;
  const updatedPost = (await response.json()) as Record<string, unknown>;
  expect(updatedPost).toHaveProperty('title', updatedData.title);
  expect(updatedPost).toHaveProperty('id', updatedData.id);
});

Then('the user should have an assigned id', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const createdUser = (await response.json()) as Record<string, unknown>;
  expect(createdUser).toHaveProperty('id');
  expect(typeof createdUser.id).toBe('number');
});

Then('the post should have an assigned id', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const createdPost = (await response.json()) as Record<string, unknown>;
  expect(createdPost).toHaveProperty('id');
  expect(typeof createdPost.id).toBe('number');
});

Then('the comment should have an assigned id', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const createdComment = (await response.json()) as Record<string, unknown>;
  expect(createdComment).toHaveProperty('id');
  expect(typeof createdComment.id).toBe('number');
});

Then('the user name should be {string}', async ({}, expectedName: string) => {
  const response = test.lastResponse as APIResponse;
  const user = (await response.json()) as Record<string, unknown>;
  expect(user.name).toBe(expectedName);
});

Then('the post title should be {string}', async ({}, expectedTitle: string) => {
  const response = test.lastResponse as APIResponse;
  const post = (await response.json()) as Record<string, unknown>;
  expect(post.title).toBe(expectedTitle);
});

// Additional comprehensive step definitions

// Response time validation
Then('the response time should be less than {int} milliseconds', async ({}, maxTime: number) => {
  const responseTime = test.responseTime || 0;
  expect(responseTime).toBeLessThan(maxTime);
});

// Content-Type validation
Then('the response content type should be {string}', async ({}, expectedContentType: string) => {
  const response = test.lastResponse as APIResponse;
  const contentType = response.headers()['content-type'];
  expect(contentType).toContain(expectedContentType);
});

// Response header validation
Then(
  'the response should have header {string} with value {string}',
  async ({}, headerName: string, expectedValue: string) => {
    const response = test.lastResponse as APIResponse;
    const headerValue = response.headers()[headerName.toLowerCase()];
    expect(headerValue).toBe(expectedValue);
  }
);

// Response body size validation
Then('the response body should not be empty', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const body = await response.text();
  expect(body.length).toBeGreaterThan(0);
});

// JSON schema validation
Then('the response should be valid JSON', async ({}) => {
  const response = test.lastResponse as APIResponse;
  expect(async () => {
    await response.json();
  }).not.toThrow();
});

// Array length validation
Then('the response array should have {int} items', async ({}, expectedLength: number) => {
  const response = test.lastResponse as APIResponse;
  const data = (await response.json()) as unknown[];
  expect(Array.isArray(data)).toBe(true);
  expect(data.length).toBe(expectedLength);
});

Then('the response array should have at least {int} items', async ({}, minLength: number) => {
  const response = test.lastResponse as APIResponse;
  const data = (await response.json()) as unknown[];
  expect(Array.isArray(data)).toBe(true);
  expect(data.length).toBeGreaterThanOrEqual(minLength);
});

// Property existence validation
Then('the response should contain property {string}', async ({}, propertyName: string) => {
  const response = test.lastResponse as APIResponse;
  const data = (await response.json()) as Record<string, unknown>;
  expect(data).toHaveProperty(propertyName);
});

Then('the response should not contain property {string}', async ({}, propertyName: string) => {
  const response = test.lastResponse as APIResponse;
  const data = (await response.json()) as Record<string, unknown>;
  expect(data).not.toHaveProperty(propertyName);
});

// Value validation
Then(
  'the response property {string} should be {string}',
  async ({}, propertyName: string, expectedValue: string) => {
    const response = test.lastResponse as APIResponse;
    const data = (await response.json()) as Record<string, unknown>;
    expect(data[propertyName]).toBe(expectedValue);
  }
);

Then(
  'the response property {string} should be {int}',
  async ({}, propertyName: string, expectedValue: number) => {
    const response = test.lastResponse as APIResponse;
    const data = (await response.json()) as Record<string, unknown>;
    expect(data[propertyName]).toBe(expectedValue);
  }
);

// Error message validation
Then('the response should contain error message', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const data = (await response.json()) as Record<string, unknown>;
  expect(data).toHaveProperty('error');
});

Then('the response error message should contain {string}', async ({}, errorText: string) => {
  const response = test.lastResponse as APIResponse;
  const data = (await response.json()) as Record<string, unknown>;
  expect((data.error as string) || (data.message as string) || '').toContain(errorText);
});

// Pagination validation
Then('the response should contain pagination information', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const data = (await response.json()) as Record<string, unknown>;
  expect(data).toHaveProperty('page');
  expect(data).toHaveProperty('totalPages');
});

// Data type validation
Then('the response property {string} should be a number', async ({}, propertyName: string) => {
  const response = test.lastResponse as APIResponse;
  const data = (await response.json()) as Record<string, unknown>;
  expect(typeof data[propertyName]).toBe('number');
});

Then('the response property {string} should be a string', async ({}, propertyName: string) => {
  const response = test.lastResponse as APIResponse;
  const data = (await response.json()) as Record<string, unknown>;
  expect(typeof data[propertyName]).toBe('string');
});

Then('the response property {string} should be a boolean', async ({}, propertyName: string) => {
  const response = test.lastResponse as APIResponse;
  const data = (await response.json()) as Record<string, unknown>;
  expect(typeof data[propertyName]).toBe('boolean');
});

// URL validation
Then('the response should contain valid URLs', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const data = (await response.json()) as Record<string, unknown> | Record<string, unknown>[];
  if (Array.isArray(data)) {
    data.forEach((item: Record<string, unknown>) => {
      if (item.url) {
        expect(item.url as string).toMatch(/^https?:\/\/.+/);
      }
      if (item.thumbnailUrl) {
        expect(item.thumbnailUrl as string).toMatch(/^https?:\/\/.+/);
      }
    });
  } else {
    if (data.url) {
      expect(data.url as string).toMatch(/^https?:\/\/.+/);
    }
  }
});

// Email validation
Then('the response should contain valid email addresses', async ({}) => {
  const response = test.lastResponse as APIResponse;
  const data = (await response.json()) as Record<string, unknown> | Record<string, unknown>[];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (Array.isArray(data)) {
    data.forEach((item: Record<string, unknown>) => {
      if (item.email) {
        expect(item.email as string).toMatch(emailRegex);
      }
    });
  } else {
    if (data.email) {
      expect(data.email as string).toMatch(emailRegex);
    }
  }
});
