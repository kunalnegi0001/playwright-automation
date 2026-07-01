import { APIClient } from '@utils/api/rest';
import { logger } from '@utils/core';

/**
 * Represents a complete product entity with all details
 */
export type ProductItem = {
  /** Unique product identifier */
  id: string | number;
  /** Product display name */
  name: string;
  /** Detailed product description (optional) */
  description?: string;
  /** Product price in dollars (e.g., 99.99) */
  price: number;
  /** Product category name or ID (e.g., 'electronics', 'clothing') */
  category: string;
  /** Current inventory stock quantity */
  stock: number;
  /** Stock Keeping Unit identifier for inventory management (optional) */
  sku?: string;
  /** Additional dynamic properties */
  [key: string]: unknown;
};

/**
 * Query parameters for filtering and paginating product listings
 */
export type ProductQueryParams = {
  /** Page number for pagination (1-based, e.g., 1, 2, 3) */
  page?: number;
  /** Maximum number of results per page (e.g., 10, 20, 50) */
  limit?: number;
  /** Filter products by category name or ID */
  category?: string;
  /** Minimum price filter in dollars (inclusive) */
  minPrice?: number;
  /** Maximum price filter in dollars (inclusive) */
  maxPrice?: number;
  /** Filter by user role for role-based product visibility */
  role?: string;
  /** Filter by product status (e.g., 'active', 'discontinued') */
  status?: string;
  /** Field name to sort results by (e.g., 'name', 'price', 'stock') */
  sortBy?: string;
  /** Search query string for full-text product search */
  q?: string;
  /** Additional custom filter parameters */
  [key: string]: unknown;
};

/**
 * Partial product data for creating or updating products
 * All fields are optional to support partial updates
 */
export type ProductData = {
  /** Product display name */
  name?: string;
  /** Detailed product description */
  description?: string;
  /** Product price in dollars (must be non-negative) */
  price?: number;
  /** Product category name or ID */
  category?: string;
  /** Inventory stock quantity (must be non-negative integer) */
  stock?: number;
  /** Stock Keeping Unit identifier for inventory management */
  sku?: string;
  /** Additional custom product attributes */
  [key: string]: unknown;
};

/**
 * Customer review data for product feedback
 */
export type ProductReviewData = {
  /** Product rating score (typically 1-5 stars) */
  rating?: number;
  /** Customer review comment or feedback text */
  comment?: string;
  /** Additional review metadata (e.g., reviewerName, timestamp) */
  [key: string]: unknown;
};

/**
 * Result of product data validation with error details
 */
export type ProductValidationResult = {
  /** Indicates whether the product data passed all validation rules */
  isValid: boolean;
  /** Array of validation error messages (empty if isValid is true) */
  errors: string[];
};

/**
 * Formatted product data optimized for UI display
 */
export type ProductFormatted = {
  /** Unique product identifier */
  id: string | number;
  /** Product display name */
  name: string;
  /** Formatted price string with currency symbol (e.g., '$99.99') */
  price: string;
  /** Product category name */
  category: string;
  /** Indicates if product has available inventory (stock > 0) */
  inStock: boolean;
  /** Human-readable availability message (e.g., '5 available' or 'Out of stock') */
  availability: string;
};

/**
 * Product Service
 * Business logic for product-related operations
 *
 * @class ProductService
 */
export class ProductService {
  apiClient: APIClient;

  constructor(apiClient: APIClient | null = null) {
    this.apiClient = apiClient || new APIClient(process.env.API_BASE_URL);
  }

  /**
   * Standard enterprise CRUD alias for retrieving all products.
   * @param params - Optional query parameters
   * @returns Array of products
   */
  async getAll(params: ProductQueryParams = {}): Promise<ProductItem[]> {
    return await this.getAllProducts(params);
  }

  /**
   * Standard enterprise CRUD alias for retrieving a product by ID.
   * @param id - Product identifier
   * @returns Product record
   */
  async getById(id: string | number): Promise<ProductItem> {
    return await this.getProductById(id);
  }

  /**
   * Standard enterprise CRUD alias for creating a product.
   * @param data - Product payload
   * @returns Created product
   */
  async create(data: ProductData): Promise<ProductItem> {
    return await this.createProduct(data);
  }

  /**
   * Standard enterprise CRUD alias for updating a product.
   * @param id - Product identifier
   * @param data - Partial product payload
   * @returns Updated product
   */
  async update(id: string | number, data: ProductData): Promise<ProductItem> {
    return await this.updateProduct(id, data);
  }

  /**
   * Standard enterprise CRUD alias for deleting a product.
   * @param id - Product identifier
   * @returns Delete response
   */
  async delete(id: string | number): Promise<unknown> {
    return await this.deleteProduct(id);
  }

  /**
   * Get all products with optional filtering and pagination
   * @param {Object} [params={}] - Query parameters for filtering
   * @param {number} [params.page] - Page number for pagination
   * @param {number} [params.limit] - Number of results per page
   * @param {string} [params.category] - Filter by product category
   * @param {number} [params.minPrice] - Minimum price filter
   * @param {number} [params.maxPrice] - Maximum price filter
   * @returns {Promise<Array>} Array of product objects
   * @throws {Error} If API request fails
   * @example
   * const products = await productService.getAllProducts({ category: 'electronics', limit: 20 });
   */
  async getAllProducts(params: ProductQueryParams = {}): Promise<ProductItem[]> {
    logger.info('Fetching all products', params);
    const response = await this.apiClient.get('/products', { params });
    return (response as { data: ProductItem[] }).data;
  }

  /**
   * Get a specific product by its unique identifier
   * @param {string|number} productId - Unique product identifier
   * @returns {Promise<Object>} Product object with all details
   * @throws {Error} If product not found or API request fails
   * @example
   * const product = await productService.getProductById('prod_123');
   * console.log(product.name, product.price);
   */
  async getProductById(productId: string | number): Promise<ProductItem> {
    logger.info(`Fetching product: ${productId}`);
    const response = await this.apiClient.get(`/products/${productId}`);
    return (response as { data: ProductItem }).data;
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data object
   * @param {string} productData.name - Product name (required)
   * @param {string} productData.description - Product description
   * @param {number} productData.price - Product price (required)
   * @param {string} productData.category - Product category
   * @param {number} [productData.stock=0] - Initial stock quantity
   * @param {string} [productData.sku] - Stock keeping unit
   * @returns {Promise<Object>} Created product object with generated ID
   * @throws {Error} If validation fails or API request fails
   * @example
   * const newProduct = await productService.createProduct({
   *   name: 'Laptop',
   *   description: 'High-performance laptop',
   *   price: 999.99,
   *   category: 'electronics',
   *   stock: 50
   * });
   */
  async createProduct(productData: ProductData): Promise<ProductItem> {
    logger.info('Creating new product', { name: productData.name });
    const response = await this.apiClient.post('/products', productData);
    return (response as { data: ProductItem }).data;
  }

  /**
   * Update an existing product
   * @param {string|number} productId - Product ID to update
   * @param {Object} productData - Partial product data to update
   * @param {string} [productData.name] - Updated product name
   * @param {string} [productData.description] - Updated description
   * @param {number} [productData.price] - Updated price
   * @param {string} [productData.category] - Updated category
   * @param {number} [productData.stock] - Updated stock quantity
   * @returns {Promise<Object>} Updated product object
   * @throws {Error} If product not found or API request fails
   * @example
   * const updated = await productService.updateProduct('prod_123', {
   *   price: 899.99,
   *   stock: 75
   * });
   */
  async updateProduct(productId: string | number, productData: ProductData): Promise<ProductItem> {
    logger.info(`Updating product: ${productId}`);
    const response = await this.apiClient.put(`/products/${productId}`, productData);
    return (response as { data: ProductItem }).data;
  }

  /**
   * Delete a product permanently
   * @param {string|number} productId - Product ID to delete
   * @returns {Promise<Object>} Deletion confirmation response
   * @throws {Error} If product not found or API request fails
   * @example
   * await productService.deleteProduct('prod_123');
   */
  async deleteProduct(productId: string | number): Promise<unknown> {
    logger.info(`Deleting product: ${productId}`);
    const response = await this.apiClient.delete(`/products/${productId}`);
    return (response as { data: unknown }).data;
  }

  /**
   * Search products by query string with optional filters
   * @param {string} query - Search query string
   * @param {Object} [filters={}] - Additional filter parameters
   * @param {string} [filters.category] - Category filter
   * @param {number} [filters.minPrice] - Minimum price filter
   * @param {number} [filters.maxPrice] - Maximum price filter
   * @param {string} [filters.sortBy] - Sort field
   * @returns {Promise<Array>} Array of matching products
   * @throws {Error} If API request fails
   * @example
   * const results = await productService.searchProducts('laptop', {
   *   category: 'electronics',
   *   maxPrice: 1500
   * });
   */
  async searchProducts(query: string, filters: ProductQueryParams = {}): Promise<ProductItem[]> {
    logger.info(`Searching products: ${query}`);
    const response = await this.apiClient.get('/products/search', {
      params: { q: query, ...filters },
    });
    return (response as { data: ProductItem[] }).data;
  }

  /**
   * Get all products in a specific category
   * @param {string} category - Category name or ID
   * @returns {Promise<Array>} Array of products in the category
   * @throws {Error} If category not found or API request fails
   * @example
   * const electronics = await productService.getProductsByCategory('electronics');
   */
  async getProductsByCategory(category: string): Promise<ProductItem[]> {
    logger.info(`Fetching products in category: ${category}`);
    const response = await this.apiClient.get('/products', {
      params: { category },
    });
    return (response as { data: ProductItem[] }).data;
  }

  /**
   * Get all available product categories
   * @returns {Promise<Array>} Array of category objects
   * @throws {Error} If API request fails
   * @example
   * const categories = await productService.getCategories();
   * categories.forEach(cat => console.log(cat.name));
   */
  async getCategories(): Promise<unknown[]> {
    logger.info('Fetching product categories');
    const response = await this.apiClient.get('/products/categories');
    return (response as { data: unknown[] }).data;
  }

  /**
   * Update the stock quantity for a product
   * @param {string|number} productId - Product ID
   * @param {number} quantity - New stock quantity
   * @returns {Promise<Object>} Updated product with new stock level
   * @throws {Error} If product not found or invalid quantity
   * @example
   * await productService.updateStock('prod_123', 100);
   */
  async updateStock(productId: string | number, quantity: number): Promise<ProductItem> {
    logger.info(`Updating stock for product ${productId}: ${quantity}`);
    const response = await this.apiClient.patch(`/products/${productId}/stock`, {
      stock: quantity,
    });
    return (response as { data: ProductItem }).data;
  }

  /**
   * Check product availability based on stock quantity
   * @param {string|number} productId - Product ID to check
   * @param {number} [quantity=1] - Quantity to check for availability
   * @returns {Promise<boolean>} True if product has sufficient stock, false otherwise
   * @throws {Error} If product not found or API request fails
   * @example
   * const isAvailable = await productService.checkAvailability('prod_123', 5);
   */
  async checkAvailability(productId: string | number, quantity = 1): Promise<boolean> {
    const product = await this.getProductById(productId);
    return product.stock >= quantity;
  }

  /**
   * Get featured products curated by the platform
   * @returns {Promise<ProductItem[]>} Array of featured product objects
   * @throws {Error} If API request fails
   * @example
   * const featured = await productService.getFeaturedProducts();
   */
  async getFeaturedProducts(): Promise<ProductItem[]> {
    logger.info('Fetching featured products');
    const response = await this.apiClient.get('/products/featured');
    return (response as { data: ProductItem[] }).data;
  }

  /**
   * Get popular products sorted by popularity
   * @param {number} [limit=10] - Maximum number of products to return
   * @returns {Promise<ProductItem[]>} Array of popular product objects
   * @throws {Error} If API request fails
   * @example
   * const popular = await productService.getPopularProducts(20);
   */
  async getPopularProducts(limit = 10): Promise<ProductItem[]> {
    logger.info(`Fetching top ${limit} popular products`);
    const response = await this.apiClient.get('/products/popular', {
      params: { limit },
    });
    return (response as { data: ProductItem[] }).data;
  }

  /**
   * Get related products based on similarity to the given product
   * @param {string|number} productId - Product ID to find related products for
   * @returns {Promise<ProductItem[]>} Array of related product objects
   * @throws {Error} If product not found or API request fails
   * @example
   * const related = await productService.getRelatedProducts('prod_123');
   */
  async getRelatedProducts(productId: string | number): Promise<ProductItem[]> {
    logger.info(`Fetching related products for: ${productId}`);
    const response = await this.apiClient.get(`/products/${productId}/related`);
    return (response as { data: ProductItem[] }).data;
  }

  /**
   * Add a customer review for a product
   * @param {string|number} productId - Product ID to review
   * @param {ProductReviewData} reviewData - Review data including rating and comment
   * @returns {Promise<unknown>} Created review object
   * @throws {Error} If product not found or API request fails
   * @example
   * await productService.addReview('prod_123', {
   *   rating: 5,
   *   comment: 'Excellent product!'
   * });
   */
  async addReview(productId: string | number, reviewData: ProductReviewData): Promise<unknown> {
    logger.info(`Adding review for product: ${productId}`);
    const response = await this.apiClient.post(`/products/${productId}/reviews`, reviewData);
    return (response as { data: unknown }).data;
  }

  /**
   * Get all reviews for a specific product with optional pagination
   * @param {string|number} productId - Product ID to get reviews for
   * @param {ProductQueryParams} [params={}] - Query parameters for pagination and filtering
   * @returns {Promise<unknown[]>} Array of review objects
   * @throws {Error} If product not found or API request fails
   * @example
   * const reviews = await productService.getReviews('prod_123', { page: 1, limit: 10 });
   */
  async getReviews(
    productId: string | number,
    params: ProductQueryParams = {}
  ): Promise<unknown[]> {
    logger.info(`Fetching reviews for product: ${productId}`);
    const response = await this.apiClient.get(`/products/${productId}/reviews`, { params });
    return (response as { data: unknown[] }).data;
  }

  /**
   * Calculate the discounted price based on percentage
   * @param {number} price - Original product price
   * @param {number} discountPercent - Discount percentage (e.g., 20 for 20% off)
   * @returns {number} Discounted price
   * @example
   * const discounted = productService.calculateDiscountedPrice(100, 20); // Returns 80
   */
  calculateDiscountedPrice(price: number, discountPercent: number): number {
    return price * (1 - discountPercent / 100);
  }

  /**
   * Format product data for UI display with formatted price and availability
   * @param {ProductItem} product - Raw product object
   * @returns {ProductFormatted} Formatted product object optimized for display
   * @example
   * const formatted = productService.formatProduct(rawProduct);
   * console.log(formatted.price); // "$99.99"
   */
  formatProduct(product: ProductItem): ProductFormatted {
    return {
      id: product.id,
      name: product.name,
      price: `$${product.price.toFixed(2)}`,
      category: product.category,
      inStock: product.stock > 0,
      availability: product.stock > 0 ? `${product.stock} available` : 'Out of stock',
    };
  }

  /**
   * Validate product data against business rules
   * @param {ProductData} productData - Product data to validate
   * @returns {ProductValidationResult} Validation result with errors if any
   * @example
   * const result = productService.validateProductData(newProduct);
   * if (!result.isValid) {
   *   console.error(result.errors);
   * }
   */
  validateProductData(productData: ProductData): ProductValidationResult {
    const errors = [];

    if (!productData.name || productData.name.trim() === '') {
      errors.push('Product name is required');
    }

    if (typeof productData.price !== 'number' || productData.price < 0) {
      errors.push('Valid price is required');
    }

    if (!productData.category || productData.category.trim() === '') {
      errors.push('Category is required');
    }

    if (typeof productData.stock !== 'number' || productData.stock < 0) {
      errors.push('Valid stock quantity is required');
    }

    return {
      isValid: errors.length === 0,
      errors: errors as string[],
    };
  }

  /**
   * Filter products by price range (inclusive)
   * @param {ProductItem[]} products - Array of products to filter
   * @param {number} minPrice - Minimum price (inclusive)
   * @param {number} maxPrice - Maximum price (inclusive)
   * @returns {ProductItem[]} Filtered array of products within price range
   * @example
   * const affordable = productService.filterByPriceRange(allProducts, 50, 200);
   */
  filterByPriceRange(products: ProductItem[], minPrice: number, maxPrice: number): ProductItem[] {
    return products.filter(p => p.price >= minPrice && p.price <= maxPrice);
  }

  /**
   * Sort products by a specified field in ascending or descending order
   * @param {ProductItem[]} products - Array of products to sort
   * @param {string} [sortBy='name'] - Field name to sort by (e.g., 'name', 'price', 'stock')
   * @param {'asc'|'desc'} [order='asc'] - Sort order: 'asc' for ascending, 'desc' for descending
   * @returns {ProductItem[]} Sorted array of products
   * @example
   * const sorted = productService.sortProducts(products, 'price', 'desc');
   */
  sortProducts(
    products: ProductItem[],
    sortBy = 'name',
    order: 'asc' | 'desc' = 'asc'
  ): ProductItem[] {
    return products.sort((a, b) => {
      const aVal = a[sortBy] as number | string;
      const bVal = b[sortBy] as number | string;

      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
  }

  /**
   * Get products with stock below the specified threshold
   * @param {number} [threshold=10] - Stock quantity threshold
   * @returns {Promise<ProductItem[]>} Array of products with low stock
   * @throws {Error} If API request fails
   * @example
   * const lowStock = await productService.getLowStockProducts(5);
   */
  async getLowStockProducts(threshold = 10): Promise<ProductItem[]> {
    logger.info(`Fetching products with stock below ${threshold}`);
    const products = await this.getAllProducts();
    return products.filter(p => p.stock < threshold && p.stock > 0);
  }

  /**
   * Get all products that are currently out of stock
   * @returns {Promise<ProductItem[]>} Array of out-of-stock products
   * @throws {Error} If API request fails
   * @example
   * const outOfStock = await productService.getOutOfStockProducts();
   */
  async getOutOfStockProducts(): Promise<ProductItem[]> {
    logger.info('Fetching out of stock products');
    const products = await this.getAllProducts();
    return products.filter(p => p.stock === 0);
  }

  /**
   * Perform bulk update on multiple products in a single operation
   * @param {ProductData[]} updates - Array of product update objects
   * @returns {Promise<unknown>} Bulk update operation result
   * @throws {Error} If API request fails
   * @example
   * await productService.bulkUpdateProducts([
   *   { id: 'prod_1', price: 99.99 },
   *   { id: 'prod_2', stock: 50 }
   * ]);
   */
  async bulkUpdateProducts(updates: ProductData[]): Promise<unknown> {
    logger.info(`Bulk updating ${updates.length} products`);
    const response = await this.apiClient.patch('/products/bulk', { updates });
    return (response as { data: unknown }).data;
  }

  /**
   * Import products from a file upload (CSV, JSON, etc.)
   * @param {File|Blob} file - File containing product data to import
   * @returns {Promise<unknown>} Import operation result
   * @throws {Error} If file is invalid or API request fails
   * @example
   * const result = await productService.importProducts(csvFile);
   */
  async importProducts(file: File | Blob): Promise<unknown> {
    logger.info('Importing products from file');
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.apiClient.post('/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return (response as { data: unknown }).data;
  }

  /**
   * Export all products to a downloadable file in the specified format
   * @param {string} [format='csv'] - Export format ('csv', 'json', 'xlsx')
   * @returns {Promise<Blob>} Blob containing the exported product data
   * @throws {Error} If API request fails
   * @example
   * const blob = await productService.exportProducts('json');
   * // Use blob to trigger download
   */
  async exportProducts(format = 'csv'): Promise<Blob> {
    logger.info(`Exporting products as ${format}`);
    const response = await this.apiClient.get('/products/export', {
      params: { format },
      responseType: 'blob',
    });
    return (response as { data: Blob }).data;
  }
}
