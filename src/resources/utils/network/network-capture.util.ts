/**
 * @fileoverview Network traffic capture utility for API call monitoring.
 * Captures HTTP requests and responses for API testing and debugging.
 * @module network/network-capture.util
 */

import { Page, Request, Response } from '@playwright/test';

export type CapturedAPICall = {
  method: string;
  url: string;
  headers: Record<string, string>;
  payload?: any;
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body?: any;
  };
  timestamp: number;
};

export class NetworkCaptureUtil {
  private capturedCalls: CapturedAPICall[] = [];
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async startCapture(): Promise<void> {
    this.capturedCalls = [];

    // Capture requests
    this.page.on('request', async (request: Request) => {
      if (this.isAPICall(request.url())) {
        const capturedCall: CapturedAPICall = {
          method: request.method(),
          url: request.url(),
          headers: request.headers(),
          payload: this.tryParseJSON(request.postData()) as unknown,
          timestamp: Date.now(),
        };
        this.capturedCalls.push(capturedCall);
      }
    });

    // Capture responses
    this.page.on('response', async (response: Response) => {
      if (this.isAPICall(response.url())) {
        const matchingCall = this.capturedCalls.find(
          call => call.url === response.url() && !call.response
        );

        if (matchingCall) {
          try {
            const responseBody = await response.text();
            matchingCall.response = {
              status: response.status(),
              statusText: response.statusText(),
              headers: response.headers(),
              body: this.tryParseJSON(responseBody) as unknown,
            };
          } catch (error) {
            console.warn('Failed to capture response body:', error);
          }
        }
      }
    });
  }

  getCapturedCalls(): CapturedAPICall[] {
    return this.capturedCalls;
  }

  getAPICallsByEndpoint(endpoint: string): CapturedAPICall[] {
    return this.capturedCalls.filter(call => call.url.includes(endpoint));
  }

  getAPICallsByMethod(method: string): CapturedAPICall[] {
    return this.capturedCalls.filter(call => call.method.toLowerCase() === method.toLowerCase());
  }

  exportCapturedCalls(): string {
    return JSON.stringify(this.capturedCalls, null, 2);
  }

  private isAPICall(url: string): boolean {
    const apiPatterns = [
      '/api/',
      '/rest/',
      '/graphql',
      '/web/index.php/api',
      'api/v1',
      'api/v2',
      '/services/',
      '/endpoints/',
      '/api/v',
    ];

    return apiPatterns.some(pattern => url.includes(pattern)) || this.isOrangeHRMAPI(url);
  }

  private isOrangeHRMAPI(url: string): boolean {
    const orangehrmPatterns = [
      '/web/index.php/auth/',
      '/web/index.php/admin/',
      '/web/index.php/pim/',
      '/web/index.php/leave/',
      '/web/index.php/time/',
      '/web/index.php/recruitment/',
      '/web/index.php/maintenance/',
      '/web/index.php/performance/',
      '/web/index.php/dashboard/',
      '/web/index.php/directory/',
      '/web/index.php/core/',
    ];

    return orangehrmPatterns.some(pattern => url.includes(pattern));
  }

  private tryParseJSON(data: string | null): any {
    if (!data) {
      return null;
    }
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
}
