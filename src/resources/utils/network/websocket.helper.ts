/**
 * @fileoverview WebSocket testing utilities for capturing and analyzing WebSocket traffic.
 * Provides functions to capture frames, search messages, and wait for specific events.
 * @module network/websocket.helper
 */

import { Page, WebSocket } from '@playwright/test';
import { logger } from '@utils/core';

/**
 * WebSocket frame data
 */
export type WebSocketFrame = {
  /** Frame payload (string or binary data) */
  payload: string | Buffer;
  /** Unix timestamp when frame was captured */
  timestamp: number;
};

/**
 * Captured WebSocket connection data
 */
export type WebSocketCapture = {
  /** WebSocket connection URL */
  url: string;
  /** Frames sent by the client */
  framesSent: WebSocketFrame[];
  /** Frames received from the server */
  framesReceived: WebSocketFrame[];
  /** Whether connection has been closed */
  closed: boolean;
};

/**
 * WebSocket capture result with stop function
 */
export type WebSocketCaptureResult = {
  /** Array of captured WebSocket connections */
  sockets: WebSocketCapture[];
  /** Stop capturing and return final results */
  stop: () => WebSocketCapture[];
};

/**
 * WebSocket frame search result with metadata
 */
export type WebSocketFrameMatch = WebSocketFrame & {
  /** Frame direction ('sent' or 'received') */
  direction: 'sent' | 'received';
  /** WebSocket connection URL */
  url: string;
};

/**
 * Capture WebSocket frames for analysis
 * @param {Page} page - Playwright page
 * @param {string} [urlIncludes=''] - Filter by URL substring
 * @returns {Object} Capture object with sockets array and stop function
 * @returns {Array} .sockets - Array of captured WebSocket connections
 * @returns {Function} .stop - Stop capturing and return results
 * @example
 * const capture = captureWebSocketFrames(page, 'api.example.com');
 * // ... perform actions ...
 * const sockets = capture.stop();
 */
export const captureWebSocketFrames = (page: Page, urlIncludes = ''): WebSocketCaptureResult => {
  const sockets: WebSocketCapture[] = [];

  const onWebSocket = (ws: WebSocket): void => {
    const socket: WebSocketCapture = {
      url: ws.url(),
      framesSent: [],
      framesReceived: [],
      closed: false,
    };

    if (!urlIncludes || socket.url.includes(urlIncludes)) {
      ws.on('framesent', event =>
        socket.framesSent.push({ payload: event.payload, timestamp: Date.now() })
      );
      ws.on('framereceived', event =>
        socket.framesReceived.push({ payload: event.payload, timestamp: Date.now() })
      );
      ws.on('close', () => {
        socket.closed = true;
      });
      sockets.push(socket);
    }
  };

  page.on('websocket', onWebSocket);

  return {
    sockets,
    stop: () => {
      page.off('websocket', onWebSocket);
      logger.info(`Captured ${sockets.length} websocket connection(s)`);
      return sockets;
    },
  };
};

/**
 * Find WebSocket frames containing specific text
 * @param {Array} [sockets=[]] - Array of captured sockets
 * @param {string} [text=''] - Text to search for in frames
 * @returns {Array<Object>} Array of matching frames with metadata
 * @example
 * const frames = findFramesByText(sockets, 'message-type');
 */
export const findFramesByText = (
  sockets: WebSocketCapture[] = [],
  text = ''
): WebSocketFrameMatch[] => {
  const results: WebSocketFrameMatch[] = [];
  for (const s of sockets) {
    for (const f of s.framesReceived) {
      if (String(f.payload).includes(text)) {
        results.push({ direction: 'received', url: s.url, ...f });
      }
    }
    for (const f of s.framesSent) {
      if (String(f.payload).includes(text)) {
        results.push({ direction: 'sent', url: s.url, ...f });
      }
    }
  }
  return results;
};

/**
 * Wait for a WebSocket frame matching predicate
 * @async
 * @param {Object} capture - Capture object from captureWebSocketFrames
 * @param {Function} predicate - Function to test frames (receives frame and socket)
 * @param {number} [timeoutMs=10000] - Timeout in milliseconds
 * @returns {Promise<Object>} Object with socket and frame properties
 * @throws {Error} If timeout is reached
 * @example
 * const { socket, frame } = await waitForWebSocketFrame(
 *   capture,
 *   (frame) => frame.payload.includes('success')
 * );
 */
export const waitForWebSocketFrame = async (
  capture: WebSocketCaptureResult,
  predicate: (frame: WebSocketFrame, socket: WebSocketCapture) => boolean,
  timeoutMs = 10000
): Promise<{ socket: WebSocketCapture; frame: WebSocketFrame }> => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const socket of capture.sockets) {
      for (const frame of socket.framesReceived) {
        if (predicate(frame, socket)) {
          return { socket, frame };
        }
      }
    }
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error(`Timed out waiting for websocket frame after ${timeoutMs}ms`);
};
