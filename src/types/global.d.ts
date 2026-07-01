/**
 * @fileoverview Global type declarations and environment variable definitions.
 * Extends NodeJS ProcessEnv with all framework environment variables.
 * @module types/global
 */

/// <reference types="node" />
/// <reference types="@playwright/test" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ProcessEnv {
      // Environment variables
      NODE_ENV: 'development' | 'staging' | 'production' | 'test';
      BASE_URL: string;
      API_URL?: string;

      // Database
      DB_HOST?: string;
      DB_PORT?: string;
      DB_NAME?: string;
      DB_USER?: string;
      DB_PASSWORD?: string;

      // Authentication
      TEST_USER_EMAIL?: string;
      TEST_USER_PASSWORD?: string;
      AZURE_TENANT_ID?: string;
      AZURE_CLIENT_ID?: string;
      AZURE_CLIENT_SECRET?: string;

      // API Keys
      // OPENAI_API_KEY?: string; // Removed - openai package not in use

      // Agents
      AGENT_LLM_PROVIDER?: 'openai' | 'anthropic' | 'ollama' | 'azure';
      AGENT_PLANNER_MODEL?: string;
      AGENT_GENERATOR_MODEL?: string;
      AGENT_HEALER_MODEL?: string;
      AGENT_HEALER_AUTO_FIX?: string;
      AGENT_HEALER_CONFIDENCE?: string;

      [key: string]: string | undefined;
    }
  }
}

export {};
