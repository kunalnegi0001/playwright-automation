import { faker } from '@faker-js/faker';

/**
 * Product data structure for test generation
 */
export type TestProduct = {
  /** Unique product identifier */
  id: string;
  /** Product name */
  name: string;
  /** Product description */
  description: string;
  /** Product SKU */
  sku: string;
  /** Product price */
  price: number;
  /** Product category */
  category: string;
  /** Stock quantity */
  stock: number;
  /** Product status */
  status: 'active' | 'inactive' | 'discontinued';
  /** Product rating (1-5) */
  rating: number;
  /** Number of reviews */
  reviewCount: number;
  /** Product tags */
  tags: string[];
  /** Product images */
  images: string[];
  /** Creation timestamp */
  createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
};

/**
 * Factory for generating test product data with Faker.js
 * @example
 * // Generate a single product
 * const product = ProductFactory.build();
 *
 * @example
 * // Generate an out-of-stock product
 * const outOfStock = ProductFactory.buildOutOfStock();
 *
 * @example
 * // Generate multiple products
 * const products = ProductFactory.buildBatch(10);
 */
export const ProductFactory = {
  /**
   * Build a single product with optional overrides
   * @param overrides - Properties to override in the generated product
   * @returns Generated product object
   */
  build: (overrides: Partial<TestProduct> = {}): TestProduct => {
    const productName = faker.commerce.productName();

    return {
      id: faker.string.uuid(),
      name: productName,
      description: faker.commerce.productDescription(),
      sku: faker.string.alphanumeric(10).toUpperCase(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
      category: faker.commerce.department(),
      stock: faker.number.int({ min: 0, max: 1000 }),
      status: 'active',
      rating: parseFloat(faker.number.float({ min: 1, max: 5, fractionDigits: 1 }).toFixed(1)),
      reviewCount: faker.number.int({ min: 0, max: 500 }),
      tags: faker.helpers.arrayElements(['new', 'sale', 'featured', 'trending', 'bestseller'], {
        min: 0,
        max: 3,
      }),
      images: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.image.url()),
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: new Date(),
      ...overrides,
    };
  },

  /**
   * Build an out-of-stock product
   * @param overrides - Properties to override
   * @returns Generated out-of-stock product object
   */
  buildOutOfStock: (overrides: Partial<TestProduct> = {}): TestProduct =>
    ProductFactory.build({
      stock: 0,
      status: 'inactive',
      ...overrides,
    }),

  /**
   * Build a premium/expensive product
   * @param overrides - Properties to override
   * @returns Generated premium product object
   */
  buildPremium: (overrides: Partial<TestProduct> = {}): TestProduct =>
    ProductFactory.build({
      price: parseFloat(faker.commerce.price({ min: 500, max: 5000 })),
      rating: parseFloat(faker.number.float({ min: 4, max: 5, fractionDigits: 1 }).toFixed(1)),
      reviewCount: faker.number.int({ min: 100, max: 1000 }),
      tags: ['premium', 'featured', 'bestseller'],
      ...overrides,
    }),

  /**
   * Build a discounted/sale product
   * @param overrides - Properties to override
   * @returns Generated sale product object
   */
  buildOnSale: (overrides: Partial<TestProduct> = {}): TestProduct =>
    ProductFactory.build({
      price: parseFloat(faker.commerce.price({ min: 5, max: 100 })),
      tags: ['sale', 'clearance'],
      ...overrides,
    }),

  /**
   * Build a new product (recently added)
   * @param overrides - Properties to override
   * @returns Generated new product object
   */
  buildNew: (overrides: Partial<TestProduct> = {}): TestProduct =>
    ProductFactory.build({
      createdAt: faker.date.recent({ days: 7 }),
      updatedAt: new Date(),
      reviewCount: faker.number.int({ min: 0, max: 10 }),
      tags: ['new'],
      ...overrides,
    }),

  /**
   * Build a discontinued product
   * @param overrides - Properties to override
   * @returns Generated discontinued product object
   */
  buildDiscontinued: (overrides: Partial<TestProduct> = {}): TestProduct =>
    ProductFactory.build({
      status: 'discontinued',
      stock: 0,
      ...overrides,
    }),

  /**
   * Build multiple products
   * @param count - Number of products to generate
   * @param overrides - Properties to override for all products
   * @returns Array of generated product objects
   */
  buildBatch: (count: number, overrides: Partial<TestProduct> = {}): TestProduct[] =>
    Array.from({ length: count }, () => ProductFactory.build(overrides)),

  /**
   * Build products for a specific category
   * @param category - Product category
   * @param count - Number of products to generate
   * @param overrides - Additional properties to override
   * @returns Array of generated product objects in the category
   */
  buildForCategory: (
    category: string,
    count: number,
    overrides: Partial<TestProduct> = {}
  ): TestProduct[] => ProductFactory.buildBatch(count, { category, ...overrides }),
};
