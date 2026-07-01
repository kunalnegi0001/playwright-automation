import { faker } from '@faker-js/faker';
import { TestUser, UserFactory } from './user.factory';
import { TestProduct, ProductFactory } from './product.factory';

/**
 * Order item data structure
 */
export type OrderItem = {
  /** Product ID */
  productId: string;
  /** Product name */
  productName: string;
  /** Unit price */
  price: number;
  /** Quantity ordered */
  quantity: number;
  /** Subtotal (price * quantity) */
  subtotal: number;
};

/**
 * Order data structure for test generation
 */
export type TestOrder = {
  /** Unique order identifier */
  id: string;
  /** Order number (human-readable) */
  orderNumber: string;
  /** Customer who placed the order */
  customer: TestUser;
  /** Order items */
  items: OrderItem[];
  /** Order status */
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  /** Subtotal (sum of all items) */
  subtotal: number;
  /** Tax amount */
  tax: number;
  /** Shipping cost */
  shipping: number;
  /** Total amount (subtotal + tax + shipping) */
  total: number;
  /** Shipping address */
  shippingAddress: {
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
  /** Payment method */
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
  /** Payment status */
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  /** Creation timestamp */
  createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
  /** Estimated delivery date */
  estimatedDelivery?: Date;
  /** Actual delivery date */
  deliveredAt?: Date;
};

/**
 * Factory for generating test order data
 * @example
 * // Generate a single order
 * const order = OrderFactory.build();
 *
 * @example
 * // Generate a completed order
 * const completedOrder = OrderFactory.buildDelivered();
 *
 * @example
 * // Generate an order with specific customer
 * const customer = UserFactory.build();
 * const order = OrderFactory.build({ customer });
 */
export const OrderFactory = {
  /**
   * Build order items from products
   * @param products - Products to create order items from
   * @returns Array of order items
   */
  buildOrderItems: (products: TestProduct[]): OrderItem[] =>
    products.map(product => {
      const quantity = faker.number.int({ min: 1, max: 5 });
      return {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity,
        subtotal: product.price * quantity,
      };
    }),

  /**
   * Calculate order totals
   * @param items - Order items
   * @param taxRate - Tax rate (default 0.1 = 10%)
   * @param shipping - Shipping cost (optional)
   * @returns Object with subtotal, tax, shipping, and total
   */
  calculateTotals: (items: OrderItem[], taxRate = 0.1, shipping?: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * taxRate;
    const shippingCost = shipping ?? parseFloat(faker.commerce.price({ min: 5, max: 20 }));
    const total = subtotal + tax + shippingCost;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      shipping: parseFloat(shippingCost.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  },

  /**
   * Build a single order with optional overrides
   * @param overrides - Properties to override in the generated order
   * @returns Generated order object
   */
  build: (overrides: Partial<TestOrder> = {}): TestOrder => {
    const customer = overrides.customer || UserFactory.build();
    const products = ProductFactory.buildBatch(faker.number.int({ min: 1, max: 5 }));
    const items = OrderFactory.buildOrderItems(products);
    const totals = OrderFactory.calculateTotals(items);
    const createdAt = faker.date.recent({ days: 30 });

    return {
      id: faker.string.uuid(),
      orderNumber: `ORD-${faker.string.numeric(8)}`,
      customer,
      items,
      status: 'pending',
      ...totals,
      shippingAddress: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zip: faker.location.zipCode(),
        country: faker.location.country(),
      },
      paymentMethod: faker.helpers.arrayElement([
        'credit_card',
        'debit_card',
        'paypal',
        'bank_transfer',
      ]),
      paymentStatus: 'pending',
      createdAt,
      updatedAt: new Date(),
      estimatedDelivery: faker.date.soon({ days: 7 }),
      ...overrides,
    };
  },

  /**
   * Build a pending order (just created)
   * @param overrides - Properties to override
   * @returns Generated pending order object
   */
  buildPending: (overrides: Partial<TestOrder> = {}): TestOrder =>
    OrderFactory.build({
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      ...overrides,
    }),

  /**
   * Build a processing order (payment confirmed)
   * @param overrides - Properties to override
   * @returns Generated processing order object
   */
  buildProcessing: (overrides: Partial<TestOrder> = {}): TestOrder =>
    OrderFactory.build({
      status: 'processing',
      paymentStatus: 'paid',
      ...overrides,
    }),

  /**
   * Build a shipped order
   * @param overrides - Properties to override
   * @returns Generated shipped order object
   */
  buildShipped: (overrides: Partial<TestOrder> = {}): TestOrder =>
    OrderFactory.build({
      status: 'shipped',
      paymentStatus: 'paid',
      ...overrides,
    }),

  /**
   * Build a delivered order
   * @param overrides - Properties to override
   * @returns Generated delivered order object
   */
  buildDelivered: (overrides: Partial<TestOrder> = {}): TestOrder => {
    const createdAt = faker.date.recent({ days: 30 });
    const deliveredAt = faker.date.between({
      from: createdAt,
      to: new Date(),
    });

    return OrderFactory.build({
      status: 'delivered',
      paymentStatus: 'paid',
      createdAt,
      deliveredAt,
      ...overrides,
    });
  },

  /**
   * Build a cancelled order
   * @param overrides - Properties to override
   * @returns Generated cancelled order object
   */
  buildCancelled: (overrides: Partial<TestOrder> = {}): TestOrder =>
    OrderFactory.build({
      status: 'cancelled',
      paymentStatus: 'refunded',
      ...overrides,
    }),

  /**
   * Build a refunded order
   * @param overrides - Properties to override
   * @returns Generated refunded order object
   */
  buildRefunded: (overrides: Partial<TestOrder> = {}): TestOrder =>
    OrderFactory.build({
      status: 'refunded',
      paymentStatus: 'refunded',
      ...overrides,
    }),

  /**
   * Build multiple orders
   * @param count - Number of orders to generate
   * @param overrides - Properties to override for all orders
   * @returns Array of generated order objects
   */
  buildBatch: (count: number, overrides: Partial<TestOrder> = {}): TestOrder[] =>
    Array.from({ length: count }, () => OrderFactory.build(overrides)),

  /**
   * Build orders for a specific customer
   * @param customer - Customer who placed the orders
   * @param count - Number of orders to generate
   * @param overrides - Additional properties to override
   * @returns Array of generated order objects for the customer
   */
  buildForCustomer: (
    customer: TestUser,
    count: number,
    overrides: Partial<TestOrder> = {}
  ): TestOrder[] => OrderFactory.buildBatch(count, { customer, ...overrides }),
};
