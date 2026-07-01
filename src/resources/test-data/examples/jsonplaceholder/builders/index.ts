/**
 * Test Data Builders
 *
 * Builder pattern implementations for constructing complex test objects
 * with a fluent API.
 *
 * @example
 * ```typescript
 * import { OrderBuilder } from '@resources/test-data/examples/jsonplaceholder/builders';
 *
 * const order = new OrderBuilder()
 *   .withCustomer(customer)
 *   .withProduct(product, 2)
 *   .withStatus('processing')
 *   .build();
 * ```
 *
 * @module test-data/builders
 */

export { OrderBuilder } from './order.builder';
