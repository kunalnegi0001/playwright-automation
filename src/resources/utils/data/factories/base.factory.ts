/**
 * @fileoverview Base data factory providing common functionality for all factories.
 * Provides ID generation, sequencing, and unique string creation.
 * @module data/factories/base.factory
 */

import { faker } from '@faker-js/faker';

/**
 * Base Data Factory
 * Provides common functionality for all data factories
 * Includes ID generation, sequencing, and unique data creation
 * @class
 * @example
 * class MyFactory extends BaseFactory {
 *   create() {
 *     return {
 *       id: this.generateId(),
 *       email: this.generateEmail('user'),
 *       sequence: this.sequence('order')
 *     };
 *   }
 * }
 */
class BaseFactory {
  faker: any;
  sequenceCounters: Map<string, number>;

  constructor() {
    this.faker = faker;
    this.sequenceCounters = new Map();
  }

  /**
   * Generate unique UUID v4 identifier
   * @returns {string} UUID string
   * @example
   * const id = this.generateId(); // 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
   */
  generateId() {
    return faker.string.uuid();
  }

  /**
   * Generate auto-incrementing sequence number
   * @param {string} key - Sequence identifier/name
   * @returns {number} Next sequence number
   * @example
   * const orderNum = this.sequence('order'); // 1
   * const nextNum = this.sequence('order'); // 2
   */
  sequence(key: string) {
    if (!this.sequenceCounters.has(key)) {
      this.sequenceCounters.set(key, 1);
    }
    const current = this.sequenceCounters.get(key) || 0;
    this.sequenceCounters.set(key, current + 1);
    return current;
  }

  /**
   * Generate unique email address with timestamp
   * @param {string} [prefix='test'] - Email prefix
   * @returns {string} Unique email address
   * @example
   * const email = this.generateEmail('admin'); // 'admin_1234567890_abc12@test.com'
   */
  generateEmail(prefix = 'test') {
    const timestamp = Date.now();
    return `${prefix}_${timestamp}_${faker.string.alphanumeric(5)}@test.com`;
  }

  /**
   * Generate timestamp-based unique string
   * @param {string} [prefix=''] - String prefix
   * @returns {string} Unique string
   * @example
   * const username = this.generateUniqueString('user_'); // 'user_1234567890_xyz789'
   */
  generateUniqueString(prefix = '') {
    return `${prefix}${Date.now()}_${faker.string.alphanumeric(6)}`;
  }

  /**
   * Reset all sequence counters to initial state
   * @returns {void}
   */
  resetSequences() {
    this.sequenceCounters.clear();
  }
}

export { BaseFactory };
