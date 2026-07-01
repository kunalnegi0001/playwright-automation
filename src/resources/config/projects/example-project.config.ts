/**
 * @fileoverview Example project-specific configuration template.
 * Copy and customize this template for each project using the framework.
 * @module config/projects/example-project.config
 */

/**
 * Example Project-Specific Configuration
 * Defines project-specific URLs, users, features, and custom settings
 * @example
 * import exampleConfig from './example-project.config';
 * const baseUrl = exampleConfig.baseURL;
 */
export const exampleProjectConfig = {
  projectName: 'example-ecommerce',

  // Project-specific URLs
  baseURL: 'https://ecommerce.example.com',
  apiBaseURL: 'https://api.ecommerce.example.com',

  // Project-specific feature flags
  features: {
    visualTesting: true,
    accessibilityTesting: true,
    performanceTesting: false,
  },

  // Project-specific test users
  testUsers: {
    admin: {
      email: 'admin@ecommerce-test.com',
      password: 'Admin@123',
    },
    customer: {
      email: 'customer@ecommerce-test.com',
      password: 'Customer@123',
    },
    vendor: {
      email: 'vendor@ecommerce-test.com',
      password: 'Vendor@123',
    },
  },

  // Project-specific settings
  customSettings: {
    paymentGateway: 'stripe',
    shippingProvider: 'fedex',
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
  },
};
