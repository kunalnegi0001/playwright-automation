import { faker } from '@faker-js/faker';

/**
 * User data structure for test generation
 */
export type TestUser = {
  /** Unique user identifier */
  id: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's email address */
  email: string;
  /** User's username */
  username: string;
  /** User's phone number */
  phone: string;
  /** User role */
  role: 'user' | 'admin' | 'manager' | 'viewer';
  /** Account status */
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  /** Date of birth */
  dateOfBirth: Date;
  /** User address */
  address: {
    /** Street address */
    street: string;
    /** City */
    city: string;
    /** State/Province */
    state: string;
    /** Postal code */
    zip: string;
    /** Country */
    country: string;
  };
  /** Creation timestamp */
  createdAt: Date;
  /** Last login timestamp */
  lastLogin?: Date;
};

/**
 * Factory for generating test user data with Faker.js
 * @example
 * // Generate a single user
 * const user = UserFactory.build();
 *
 * @example
 * // Generate an admin user
 * const admin = UserFactory.buildAdmin();
 *
 * @example
 * // Generate with overrides
 * const specificUser = UserFactory.build({ email: 'specific@test.com' });
 *
 * @example
 * // Generate multiple users
 * const users = UserFactory.buildBatch(5);
 */
export const UserFactory = {
  /**
   * Build a single user with optional overrides
   * @param overrides - Properties to override in the generated user
   * @returns Generated user object
   */
  build: (overrides: Partial<TestUser> = {}): TestUser => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      id: faker.string.uuid(),
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName }),
      username: faker.internet.username({ firstName, lastName }),
      phone: faker.phone.number(),
      role: 'user',
      status: 'active',
      dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zip: faker.location.zipCode(),
        country: faker.location.country(),
      },
      createdAt: new Date(),
      lastLogin: faker.date.recent({ days: 7 }),
      ...overrides,
    };
  },

  /**
   * Build an admin user
   * @param overrides - Properties to override
   * @returns Generated admin user object
   */
  buildAdmin: (overrides: Partial<TestUser> = {}): TestUser =>
    UserFactory.build({
      role: 'admin',
      ...overrides,
    }),

  /**
   * Build a manager user
   * @param overrides - Properties to override
   * @returns Generated manager user object
   */
  buildManager: (overrides: Partial<TestUser> = {}): TestUser =>
    UserFactory.build({
      role: 'manager',
      ...overrides,
    }),

  /**
   * Build a viewer user
   * @param overrides - Properties to override
   * @returns Generated viewer user object
   */
  buildViewer: (overrides: Partial<TestUser> = {}): TestUser =>
    UserFactory.build({
      role: 'viewer',
      ...overrides,
    }),

  /**
   * Build an inactive user
   * @param overrides - Properties to override
   * @returns Generated inactive user object
   */
  buildInactive: (overrides: Partial<TestUser> = {}): TestUser =>
    UserFactory.build({
      status: 'inactive',
      lastLogin: faker.date.past({ years: 1 }),
      ...overrides,
    }),

  /**
   * Build a pending user (not yet activated)
   * @param overrides - Properties to override
   * @returns Generated pending user object
   */
  buildPending: (overrides: Partial<TestUser> = {}): TestUser =>
    UserFactory.build({
      status: 'pending',
      lastLogin: undefined,
      ...overrides,
    }),

  /**
   * Build multiple users
   * @param count - Number of users to generate
   * @param overrides - Properties to override for all users
   * @returns Array of generated user objects
   */
  buildBatch: (count: number, overrides: Partial<TestUser> = {}): TestUser[] =>
    Array.from({ length: count }, () => UserFactory.build(overrides)),

  /**
   * Build a user with deterministic data (uses seed)
   * @param seed - Seed for reproducible data generation
   * @param overrides - Properties to override
   * @returns Generated user object
   */
  buildWithSeed: (seed: number, overrides: Partial<TestUser> = {}): TestUser => {
    faker.seed(seed);
    const user = UserFactory.build(overrides);
    faker.seed(); // Reset seed to random
    return user;
  },
};
