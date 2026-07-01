/**
 * @fileoverview API client wrapper around axios with enhanced features.
 * Provides logging, request/response interceptors, retry logic, and authentication.
 * @module api-testing/rest/api/api-client
 */

import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { logger } from '@utils/core';
import { configManager } from '@config/config.manager';

/**
 * API Client
 * Wrapper around axios with logging, retries, and authentication support
 * Automatically logs all requests/responses and retries failed requests
 * @class
 * @example
 * const client = new APIClient();
 * client.setAuthToken('my-token');
 * const data = await client.get('/users');
 */
class APIClient {
  baseURL: string;
  client: AxiosInstance;

  constructor(baseURL: string | null = null) {
    this.baseURL = (baseURL || configManager.getAPIBaseURL()) as string;
    this.client = this.createClient();
  }

  createClient(): AxiosInstance {
    const client = axios.create({
      baseURL: this.baseURL,
      timeout: configManager.get('defaultTimeout'),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Request interceptor
    client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const method = (config.method || 'GET').toUpperCase();
        const url = config.url || '';
        logger.logAPIRequest(method, url, config.data);
        return config;
      },
      (error: AxiosError) => {
        logger.error('API Request Error', error instanceof Error ? error.message : String(error));
        return Promise.reject(error);
      }
    );

    // Response interceptor
    client.interceptors.response.use(
      response => {
        const url = response.config.url || '';
        logger.logAPIResponse(url, response.status, response.data);
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as
          | (InternalAxiosRequestConfig & { _retry?: boolean })
          | undefined;

        logger.logAPIResponse(
          config?.url || 'unknown',
          error.response?.status || 0,
          (error.response?.data as Record<string, unknown>) || {}
        );

        // Retry logic
        if (config && !config._retry && this.shouldRetry(error)) {
          config._retry = true;
          await this.delay(1000);
          return client(config);
        }

        return Promise.reject(error);
      }
    );

    return client;
  }

  shouldRetry(error: AxiosError): boolean {
    // Retry on network errors or 5xx status codes
    const status = error.response?.status;
    return !status || (status >= 500 && status < 600);
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Set authorization header for authenticated requests
   * @param {string} token - Authentication token
   * @param {string} [type='Bearer'] - Token type (e.g., 'Bearer', 'Basic')
   * @example
   * client.setAuthToken('abc123', 'Bearer');
   */
  setAuthToken(token: string, type = 'Bearer'): void {
    this.client.defaults.headers.common['Authorization'] = `${type} ${token}`;
  }

  /**
   * Remove authorization header
   */
  clearAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  /**
   * Perform GET request
   * @async
   * @param {string} url - Request URL
   * @param {Object} [config={}] - Axios request config
   * @returns {Promise<T>} Response data
   * @example
   * const users = await client.get<User[]>('/users', { params: { page: 1 } });
   */
  async get<T = unknown>(url: string, config: Record<string, unknown> = {}): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * Perform POST request
   * @async
   * @param {string} url - Request URL
   * @param {Object} [data={}] - Request body
   * @param {Object} [config={}] - Axios request config
   * @returns {Promise<T>} Response data
   */
  async post<T = unknown>(
    url: string,
    data: unknown = {},
    config: Record<string, unknown> = {}
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Perform PUT request
   * @async
   * @param {string} url - Request URL
   * @param {Object} [data={}] - Request body
   * @param {Object} [config={}] - Axios request config
   * @returns {Promise<T>} Response data
   */
  async put<T = unknown>(
    url: string,
    data: unknown = {},
    config: Record<string, unknown> = {}
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Perform PATCH request
   * @async
   * @param {string} url - Request URL
   * @param {Object} [data={}] - Request body
   * @param {Object} [config={}] - Axios request config
   * @returns {Promise<T>} Response data
   */
  async patch<T = unknown>(
    url: string,
    data: unknown = {},
    config: Record<string, unknown> = {}
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Perform DELETE request
   * @async
   * @param {string} url - Request URL
   * @param {Object} [config={}] - Axios request config
   * @returns {Promise<T>} Response data
   */
  async delete<T = unknown>(url: string, config: Record<string, unknown> = {}): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Close API client resources.
   * Included for service-layer compatibility and future extensibility.
   */
  async close(): Promise<void> {
    return await Promise.resolve();
  }

  /**
   * Upload file using multipart/form-data
   * @async
   * @param {string} url - Upload endpoint URL
   * @param {File|Buffer} file - File to upload
   * @param {string} [fieldName='file'] - Form field name
   * @param {Object} [additionalData={}] - Additional form data
   * @returns {Promise<T>} Response data
   * @example
   * const result = await client.uploadFile<UploadResult>('/upload', fileBuffer, 'document', { userId: '123' });
   */
  async uploadFile<T = unknown>(
    url: string,
    file: unknown,
    fieldName = 'file',
    additionalData: Record<string, unknown> = {}
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file as Blob);

    Object.keys(additionalData).forEach(key => {
      const value = additionalData[key];
      formData.append(key, value as string | Blob);
    });

    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }
}

export { APIClient };
