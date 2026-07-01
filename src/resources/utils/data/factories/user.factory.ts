/**
 * @fileoverview User data factory for test data generation.
 * Uses Faker.js to generate realistic user data for testing.
 * @module data/factories/user.factory
 */

import { BaseFactory } from './base.factory';
import { faker } from '@faker-js/faker';

/**
 * User Data Factory
 * Generates test user data with realistic fake information
 * Extends BaseFactory for common functionality
 * @class
 * @extends {BaseFactory}
 * @example
 * import userFactory from './user.factory';
 * const user = userFactory.create();
 * const admin = userFactory.createAdmin({ email: 'custom@example.com' });
 */
class UserFactory extends BaseFactory {
  /**
   * Create a standard user with random data
   * @param {Object} [overrides={}] - Custom values to override defaults
   * @returns {Object} User object with all fields
   * @example
   * const user = userFactory.create({ email: 'specific@example.com' });
   */
  create(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      id: this.generateId(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: this.generateEmail('user'),
      password: 'Test@123456',
      phone: faker.phone.number(),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country(),
      },
      createdAt: new Date().toISOString(),
      ...overrides,
    };
  }

  /**
   * Create admin user with elevated permissions
   * @param {Object} [overrides={}] - Custom values to override defaults
   * @returns {Object} Admin user object
   * @example
   * const admin = userFactory.createAdmin();
   */
  createAdmin(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return this.create({
      role: 'admin',
      email: this.generateEmail('admin'),
      permissions: ['read', 'write', 'delete', 'admin'],
      ...overrides,
    });
  }

  /**
   * Create multiple users at once
   * @param {number} count - Number of users to create
   * @param {Object} [overrides={}] - Custom values to apply to all users
   * @returns {Array<Object>} Array of user objects
   * @example
   * const users = userFactory.createMany(10, { role: 'standard' });
   */
  createMany(
    count: number,
    overrides: Record<string, unknown> = {}
  ): Array<Record<string, unknown>> {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Create user with specific traits/characteristics
   * @param {Array<string>} [traits=[]] - Array of trait names (verified, premium, inactive)
   * @returns {Object} User object with applied traits
   * @example
   * const verifiedUser = userFactory.withTraits(['verified', 'premium']);
   */
  withTraits(traits: string[] = []): Record<string, unknown> {
    const user = this.create() as Record<string, unknown>;

    traits.forEach(trait => {
      switch (trait) {
        case 'verified':
          user.emailVerified = true;
          user.verifiedAt = new Date().toISOString();
          break;
        case 'premium':
          user.subscription = 'premium';
          user.subscriptionExpiry = faker.date.future();
          break;
        case 'inactive':
          user.status = 'inactive';
          user.lastLogin = faker.date.past();
          break;
        default:
          break;
      }
    });

    return user;
  }
}

// Export singleton
const userFactory = new UserFactory();

export { UserFactory, userFactory };
