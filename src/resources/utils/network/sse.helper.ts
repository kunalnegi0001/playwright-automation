/**
 * @fileoverview Server-Sent Events (SSE) capture and testing utilities.
 * Intercepts EventSource connections and captures SSE messages for testing.
 * @module network/sse.helper
 */

import { logger } from '@utils/core';

// Extend Window interface for SSE capture
declare global {
  interface Window {
    __qaCaptureSSE?: (_evt: any) => void;
  }
}

/**
 * Capture Server-Sent Events (SSE) by intercepting EventSource connections
 * @param page - Playwright page object with expose and addInitScript methods
 * @param endpointPattern - URL pattern to match for SSE endpoints (default: '/events')
 * @returns Promise resolving to capture object with events array and stop function
 * @example
 * const capture = await captureSSE(page, '/api/events');
 * // ... perform actions ...
 * const events = capture.stop();
 */
export const captureSSE = async (
  page: {
    exposeFunction: (name: string, fn: (evt: unknown) => void) => Promise<void>;
    addInitScript: (
      script: (args: { endpointPatternInner: string }) => void,
      args: { endpointPatternInner: string }
    ) => Promise<void>;
  },
  endpointPattern: string = '/events'
): Promise<{
  events: Array<{ type: string; data: unknown; url: string; timestamp: number }>;
  stop: () => Array<{ type: string; data: unknown; url: string; timestamp: number }>;
}> => {
  const events: Array<{ type: string; data: unknown; url: string; timestamp: number }> = [];

  await page.exposeFunction('__qaCaptureSSE', (_evt: unknown) => {
    const evt = _evt as Record<string, unknown>;
    events.push({ ...evt, timestamp: Date.now() } as {
      type: string;
      data: unknown;
      url: string;
      timestamp: number;
    });
  });

  await page.addInitScript(
    ({ endpointPatternInner }) => {
      const NativeES = window.EventSource;
      if (!NativeES) {
        return;
      }

      class WrappedES extends NativeES {
        constructor(url: string | URL, config?: { withCredentials?: boolean }) {
          super(url, config);

          const matched = String(url).includes(endpointPatternInner);
          if (matched) {
            this.addEventListener('message', (e: MessageEvent) => {
              window.__qaCaptureSSE?.({
                type: 'message',
                data: e.data as unknown,
                url: String(url),
              });
            });
            this.addEventListener('error', () => {
              window.__qaCaptureSSE?.({ type: 'error', data: null, url: String(url) });
            });
            this.addEventListener('open', () => {
              window.__qaCaptureSSE?.({ type: 'open', data: null, url: String(url) });
            });
          }
        }
      }

      window.EventSource = WrappedES;
    },
    { endpointPatternInner: endpointPattern }
  );

  logger.info(`SSE capture initialized for pattern: ${endpointPattern}`);

  return {
    events,
    stop: () => events,
  };
};

/**
 * Wait for an SSE event matching the predicate function
 * @param capture - SSE capture object from captureSSE
 * @param predicate - Function to test events (returns true for matching event)
 * @param timeoutMs - Timeout in milliseconds (default: 10000)
 * @returns Promise resolving to the matching event
 * @throws {Error} If timeout is reached before matching event
 * @example
 * const event = await waitForSSEEvent(capture, (e) => e.type === 'message' && e.data.includes('success'));
 */
export const waitForSSEEvent = async (
  capture: { events: Array<Record<string, unknown>> },
  predicate: (event: Record<string, unknown>) => boolean,
  timeoutMs: number = 10000
): Promise<Record<string, unknown>> => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const found = capture.events.find(predicate);
    if (found) {
      return found;
    }
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error(`Timed out waiting for SSE event after ${timeoutMs}ms`);
};

/**
 * Filter SSE events by event type
 * @param events - Array of SSE events
 * @param type - Event type to filter by (default: 'message')
 * @returns Filtered array of events matching the type
 * @example
 * const messages = filterSSEEvents(capture.events, 'message');
 * const errors = filterSSEEvents(capture.events, 'error');
 */
export const filterSSEEvents = (
  events: Array<{ type: string }> = [],
  type: string = 'message'
): Array<{ type: string }> => {
  return events.filter(e => e.type === type);
};
