/**
 * Test Data Factories
 *
 * This module provides factories for generating realistic test data using Faker.js.
 * All factories follow consistent patterns and support overrides for customization.
 *
 * @example
 * ```typescript
 * import { UserFactory, ProductFactory, OrderFactory } from '@resources/test-data/examples/jsonplaceholder/factories';
 *
 * // Generate test data
 * const user = UserFactory.build();
 * const product = ProductFactory.build();
 * const order = OrderFactory.build({ customer: user });
 * ```
 *
 * @module test-data/factories
 */

// Export user factory
export { UserFactory, type TestUser } from './user.factory';

// Export product factory
export { ProductFactory, type TestProduct } from './product.factory';

// Export order factory
export { OrderFactory, type TestOrder, type OrderItem } from './order.factory';
