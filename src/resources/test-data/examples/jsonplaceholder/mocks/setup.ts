import { setupWorker } from 'msw/browser';
import { setupServer } from 'msw/node';
import { userHandlers } from './users.mock';

/**
 * MSW (Mock Service Worker) Setup
 * Provides API mocking for tests
 */

// Combine all handlers
const handlers = [
  ...userHandlers,
  // Add more handlers as needed
];

// Browser worker (for UI tests in browser)
export const worker = setupWorker(...handlers);

// Node server (for API tests in Node.js)
export const server = setupServer(...handlers);

/**
 * Start mock server for Node.js environment
 */
export const startMockServer = () => {
  server.listen({
    onUnhandledRequest: 'warn',
  });
  console.log('🎭 Mock Server started');
};

/**
 * Stop mock server
 */
export const stopMockServer = () => {
  server.close();
  console.log('🎭 Mock Server stopped');
};

/**
 * Reset handlers between tests
 */
export const resetMockServer = () => {
  server.resetHandlers();
};
