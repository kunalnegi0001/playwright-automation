import { faker } from '@faker-js/faker';
import { TestOrder, OrderItem } from '../factories/order.factory';
import { TestUser, UserFactory } from '../factories/user.factory';
import { TestProduct, ProductFactory } from '../factories/product.factory';

/**
 * Builder for constructing complex Order objects with fluent API
 *
 * @example
 * ```typescript
 * const order = new OrderBuilder()
 *   .withCustomer(customer)
 *   .withItem({ productId: '123', price: 29.99, quantity: 2 })
 *   .withStatus('processing')
 *   .withPaymentMethod('credit_card')
 *   .build();
 * ```
 */
export class OrderBuilder {
  private order: Partial<TestOrder> = {
    id: faker.string.uuid(),
    orderNumber: `ORD-${faker.string.numeric(8)}`,
    status: 'pending',
    paymentStatus: 'pending',
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  /**
   * Set the order ID
   * @param id - Order ID
   * @returns Builder instance for chaining
   */
  withId(id: string): this {
    this.order.id = id;
    return this;
  }

  /**
   * Set the order number
   * @param orderNumber - Order number
   * @returns Builder instance for chaining
   */
  withOrderNumber(orderNumber: string): this {
    this.order.orderNumber = orderNumber;
    return this;
  }

  /**
   * Set the customer
   * @param customer - Customer object
   * @returns Builder instance for chaining
   */
  withCustomer(customer: TestUser): this {
    this.order.customer = customer;
    return this;
  }

  /**
   * Add an order item
   * @param item - Partial order item (will auto-calculate subtotal)
   * @returns Builder instance for chaining
   */
  withItem(
    item: Partial<OrderItem> & { productId: string; price: number; quantity: number }
  ): this {
    const orderItem: OrderItem = {
      productId: item.productId,
      productName: item.productName || `Product ${item.productId}`,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    };

    this.order.items = [...(this.order.items || []), orderItem];
    return this;
  }

  /**
   * Add an order item from a product
   * @param product - Product object
   * @param quantity - Quantity to order
   * @returns Builder instance for chaining
   */
  withProduct(product: TestProduct, quantity: number = 1): this {
    return this.withItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity,
    });
  }

  /**
   * Add multiple items at once
   * @param items - Array of order items
   * @returns Builder instance for chaining
   */
  withItems(
    items: (Partial<OrderItem> & { productId: string; price: number; quantity: number })[]
  ): this {
    items.forEach(item => this.withItem(item));
    return this;
  }

  /**
   * Set the order status
   * @param status - Order status
   * @returns Builder instance for chaining
   */
  withStatus(status: TestOrder['status']): this {
    this.order.status = status;
    return this;
  }

  /**
   * Set the payment status
   * @param paymentStatus - Payment status
   * @returns Builder instance for chaining
   */
  withPaymentStatus(paymentStatus: TestOrder['paymentStatus']): this {
    this.order.paymentStatus = paymentStatus;
    return this;
  }

  /**
   * Set the payment method
   * @param paymentMethod - Payment method
   * @returns Builder instance for chaining
   */
  withPaymentMethod(paymentMethod: TestOrder['paymentMethod']): this {
    this.order.paymentMethod = paymentMethod;
    return this;
  }

  /**
   * Set the shipping address
   * @param address - Shipping address
   * @returns Builder instance for chaining
   */
  withShippingAddress(address: TestOrder['shippingAddress']): this {
    this.order.shippingAddress = address;
    return this;
  }

  /**
   * Set the creation date
   * @param createdAt - Creation date
   * @returns Builder instance for chaining
   */
  withCreatedAt(createdAt: Date): this {
    this.order.createdAt = createdAt;
    return this;
  }

  /**
   * Set the estimated delivery date
   * @param estimatedDelivery - Estimated delivery date
   * @returns Builder instance for chaining
   */
  withEstimatedDelivery(estimatedDelivery: Date): this {
    this.order.estimatedDelivery = estimatedDelivery;
    return this;
  }

  /**
   * Set the actual delivery date
   * @param deliveredAt - Delivery date
   * @returns Builder instance for chaining
   */
  withDeliveredAt(deliveredAt: Date): this {
    this.order.deliveredAt = deliveredAt;
    return this;
  }

  /**
   * Calculate totals based on current items
   * @param taxRate - Tax rate (default 0.1 = 10%)
   * @param shippingCost - Shipping cost (optional, will generate if not provided)
   * @returns Object with calculated totals
   */
  private calculateTotals(
    taxRate = 0.1,
    shippingCost?: number
  ): {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  } {
    const subtotal = (this.order.items || []).reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * taxRate;
    const shipping = shippingCost ?? parseFloat(faker.commerce.price({ min: 5, max: 20 }));
    const total = subtotal + tax + shipping;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }

  /**
   * Build the final order object
   * @param taxRate - Tax rate for calculation (default 0.1)
   * @param shippingCost - Shipping cost (optional)
   * @returns Complete order object
   * @throws Error if required fields are missing
   */
  build(taxRate = 0.1, shippingCost?: number): TestOrder {
    // Set defaults for missing required fields
    if (!this.order.customer) {
      this.order.customer = UserFactory.build();
    }

    if (!this.order.items || this.order.items.length === 0) {
      // Add a default product if no items
      const defaultProduct = ProductFactory.build();
      this.withProduct(defaultProduct, 1);
    }

    if (!this.order.shippingAddress) {
      this.order.shippingAddress = {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zip: faker.location.zipCode(),
        country: faker.location.country(),
      };
    }

    if (!this.order.paymentMethod) {
      this.order.paymentMethod = faker.helpers.arrayElement([
        'credit_card',
        'debit_card',
        'paypal',
        'bank_transfer',
      ]);
    }

    // Calculate totals
    const totals = this.calculateTotals(taxRate, shippingCost);

    return {
      ...this.order,
      ...totals,
    } as TestOrder;
  }

  /**
   * Reset the builder to create a new order
   * @returns New builder instance
   */
  reset(): OrderBuilder {
    return new OrderBuilder();
  }
}
