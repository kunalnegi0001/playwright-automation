/**
 * @fileoverview Enhanced API helper for Playwright API testing.
 * Provides REST API request wrapper with authentication, retry logic, and configuration management.
 * @module api-testing/rest/api.helper
 */

import { request, APIRequestContext, APIResponse } from '@playwright/test';
import { config } from 'dotenv';
import { configManager } from '@config/config.manager';
import { logger } from '@utils/core';

config();

export type APIRequestOptions = {
  timeout?: number;
  maxRetries: number;
  ignoreHTTPSErrors?: boolean;
  headers?: APIRequestHeaders;
};

export type APIRequestHeaders = {
  [key: string]: string;
};

export type APIConfig = {
  apiUrl: string;
  headers: {
    api: APIRequestHeaders;
  };
};

/**
 * Enhanced API Helper for Playwright API Testing
 * Supports Bearer token authentication, retry logic, verbose logging, and integration with existing config
 */
class ApiHelper {
  private setConf: APIRequestOptions;
  private verbose: boolean;
  private authToken: string | null = null;
  private apiContext: APIRequestContext | null = null;
  private baseConfig: APIConfig;

  constructor() {
    this.setConf = {
      timeout: 60 * 1000,
      maxRetries: 3,
      ignoreHTTPSErrors: true,
    };
    this.verbose = process.env.API_VERBOSE === 'true' || true;

    // Initialize base configuration with fallbacks
    this.baseConfig = this.initializeConfig();
  }

  /**
   * Initialize API configuration with environment-specific settings
   */
  private initializeConfig(): APIConfig {
    try {
      // Try to get from existing config manager first
      const apiUrl =
        configManager.getAPIBaseURL() ||
        process.env.API_BASE_URL ||
        'https://jsonplaceholder.typicode.com';

      return {
        apiUrl,
        headers: {
          api: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      };
    } catch (error) {
      logger.warn('Config manager not available, using fallback configuration');
      return {
        apiUrl: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
        headers: {
          api: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      };
    }
  }

  /**
   * Set Bearer token for authentication
   * @param {string} raw - Bearer token (with or without 'Bearer ' prefix)
   */
  setBearerToken(raw: string): void {
    this.authToken = raw.replace(/^Bearer\\s+/i, '');
    if (this.verbose) {
      logger.debug('Bearer token set successfully');
    }
  }

  /**
   * Get current Bearer token
   * @returns {string|null} Current Bearer token or null if not set
   */
  getBearerToken(): string | null {
    return this.authToken;
  }

  /**
   * Validate that token is set before making authenticated requests
   */
  validateToken(): void {
    if (!this.authToken) {
      logger.warn('Bearer token is not set. Proceeding without authentication.');
    }
  }

  /**
   * Get or create API request context
   */
  private async getContext(): Promise<APIRequestContext> {
    if (!this.apiContext) {
      this.apiContext = await request.newContext({
        baseURL: this.baseConfig.apiUrl,
        timeout: this.setConf.timeout,
        ignoreHTTPSErrors: this.setConf.ignoreHTTPSErrors,
        extraHTTPHeaders: this.baseConfig.headers.api,
      });
    }
    return this.apiContext;
  }

  /**
   * Log verbose request/response information
   */
  private async verboseLog(
    url: string,
    options: Record<string, unknown>,
    response: APIResponse
  ): Promise<void> {
    if (this.verbose) {
      logger.debug('=== API Request Debug Information ===');
      logger.debug(`URL: ${url}`);
      logger.debug(`Method: ${options.method || 'GET'}`);
      logger.debug('Request details', { headers: options.headers });
      logger.debug(`Status: ${response.status()}`);
      logger.debug(`Status Text: ${response.statusText()}`);

      try {
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.includes('application/json')) {
          const responseData = (await response.json()) as unknown;
          logger.debug('Response JSON', { data: responseData });
        } else {
          const text = await response.text();
          const preview = text.substring(0, 500) + (text.length > 500 ? '...' : '');
          logger.debug(`Response Text: ${preview}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.debug(`Could not parse response: ${errorMsg}`);
      }
      logger.debug('======================================\\n');
    }
  }

  /**
   * Send HTTP request with retry logic and comprehensive error handling
   */
  async sendRequest(
    endpoint: string,
    method: string,
    body: object = {},
    headers: APIRequestHeaders = {}
  ): Promise<unknown> {
    const context = await this.getContext();

    // Normalize URL construction
    const baseUrl = this.baseConfig.apiUrl.endsWith('/')
      ? this.baseConfig.apiUrl.slice(0, -1)
      : this.baseConfig.apiUrl;
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${baseUrl}/${normalizedEndpoint}`;

    // Merge headers
    const mergedHeaders: APIRequestHeaders = {
      ...this.baseConfig.headers.api,
      ...headers,
    };

    // Add authentication header if token is available
    if (this.authToken) {
      mergedHeaders['Authorization'] = `Bearer ${this.authToken}`;
    }

    const options: { method: string; headers: APIRequestHeaders; data?: object } = {
      method: method.toUpperCase(),
      headers: mergedHeaders,
    };

    // Add body for non-GET requests
    if (method.toUpperCase() !== 'GET' && Object.keys(body).length > 0) {
      options.data = body;
    }

    // Retry logic
    for (let attempt = 0; attempt < this.setConf.maxRetries; attempt++) {
      try {
        logger.debug(
          `API Request attempt ${attempt + 1}/${this.setConf.maxRetries}: ${method.toUpperCase()} ${url}`
        );

        const response: APIResponse = await context.fetch(url, options);

        // Log request details
        await this.verboseLog(url, options, response);

        // Log to existing logger if available
        try {
          logger.logAPIRequest(method.toUpperCase(), url, body as Record<string, unknown>);
          const responseText = await response.text();
          logger.logAPIResponse(
            url,
            response.status(),
            responseText as unknown as Record<string, unknown>
          );
        } catch (logError) {
          // Logger might not be available, continue without it
        }

        if (response.ok()) {
          const contentType = response.headers()['content-type'];
          if (contentType && contentType.includes('application/json')) {
            return (await response.json()) as unknown;
          } else {
            return (await response.text()) as unknown;
          }
        } else {
          // For auth errors (401, 403), don't retry - throw immediately
          if (response.status() === 401 || response.status() === 403) {
            const errorText = await response.text();
            throw new Error(
              `Authentication failed: ${response.status()} ${response.statusText()}: ${errorText}`
            );
          }

          console.warn(`Attempt ${attempt + 1} failed with status: ${response.status()}`);

          // If this is the last attempt, throw error with status code
          if (attempt === this.setConf.maxRetries - 1) {
            const errorText = await response.text();
            throw new Error(
              `Request failed after ${this.setConf.maxRetries} attempts: ${response.status()} ${response.statusText()}: ${errorText}`
            );
          }
        }
      } catch (error) {
        if (attempt === this.setConf.maxRetries - 1) {
          console.error(`All ${this.setConf.maxRetries} attempts failed.`);
          throw error;
        }

        // For auth errors, don't retry
        if (
          error instanceof Error &&
          (error.message.includes('401') || error.message.includes('403'))
        ) {
          throw error;
        }

        console.warn(`Retrying request (${attempt + 1}/${this.setConf.maxRetries})...`);
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    // This should never be reached due to throw in last attempt, but added for type safety
    throw new Error(`Request failed after ${this.setConf.maxRetries} attempts`);
  }

  /**
   * Send GET request
   */
  async sendGetRequest(endpoint: string, headers: APIRequestHeaders = {}): Promise<unknown> {
    return await this.sendRequest(endpoint, 'GET', {}, headers);
  }

  /**
   * Send POST request
   */
  async sendPostRequest(
    endpoint: string,
    body: object = {},
    headers: APIRequestHeaders = {}
  ): Promise<unknown> {
    return await this.sendRequest(endpoint, 'POST', body, headers);
  }

  /**
   * Send PUT request
   */
  async sendPutRequest(
    endpoint: string,
    body: object = {},
    headers: APIRequestHeaders = {}
  ): Promise<unknown> {
    return await this.sendRequest(endpoint, 'PUT', body, headers);
  }

  /**
   * Send PATCH request
   */
  async sendPatchRequest(
    endpoint: string,
    body: object = {},
    headers: APIRequestHeaders = {}
  ): Promise<unknown> {
    return await this.sendRequest(endpoint, 'PATCH', body, headers);
  }

  /**
   * Send DELETE request
   */
  async sendDeleteRequest(endpoint: string, headers: APIRequestHeaders = {}): Promise<unknown> {
    return await this.sendRequest(endpoint, 'DELETE', {}, headers);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<APIConfig>): void {
    this.baseConfig = { ...this.baseConfig, ...newConfig };
    // Reset context to use new config
    this.apiContext = null;
  }

  /**
   * Set verbose mode
   */
  setVerbose(verbose: boolean): void {
    this.verbose = verbose;
  }

  /**
   * Close API context
   */
  async dispose(): Promise<void> {
    if (this.apiContext) {
      await this.apiContext.dispose();
      this.apiContext = null;
    }
  }
}

// Export singleton instance
export { ApiHelper };
