/**
 * @fileoverview Product data factory for generating test product data.
 * Creates realistic product objects with Faker.js for e-commerce testing.
 * @module data/factories/product.factory
 */

import { BaseFactory } from './base.factory';
import { faker } from '@faker-js/faker';

/**
 * Product Data Factory
 * Generates realistic product data for testing
 * @class
 * @extends {BaseFactory}
 * @example
 * import productFactory from './product.factory';
 * const product = productFactory.create();
 * const products = productFactory.createMany(10);
 */
class ProductFactory extends BaseFactory {
  /**
   * Create a single product with random data
   * @param overrides - Custom values to override defaults
   * @returns Product object with all fields
   * @example
   * const product = productFactory.create({ price: 99.99, stock: 50 });
   */
  create(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      id: this.generateId(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      sku: faker.string.alphanumeric(10).toUpperCase(),
      category: faker.commerce.department(),
      brand: faker.company.name(),
      stock: faker.number.int({ min: 0, max: 1000 }),
      images: [faker.image.url(), faker.image.url()],
      rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
      reviews: faker.number.int({ min: 0, max: 500 }),
      createdAt: new Date().toISOString(),
      ...overrides,
    };
  }

  /**
   * Create multiple products at once
   * @param {number} count - Number of products to create
   * @param {Object} [overrides={}] - Custom values to apply to all products
   * @returns {Array<Object>} Array of product objects
   * @example
   * const products = productFactory.createMany(10, { category: 'Electronics' });
   */
  createMany(
    count: number,
    overrides: Record<string, unknown> = {}
  ): Array<Record<string, unknown>> {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

const productFactory = new ProductFactory();

export { ProductFactory, productFactory };
