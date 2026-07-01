import { logger } from '@utils/core';
import { APIClient } from '@utils/api/rest';

/**
 * [Entity] data structure
 * Represents a [entity] object from the API
 */
export type [Entity]Data = {
  /** Unique identifier */
  id: string;
  /** [Entity] name */
  name: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Active status flag */
  isActive: boolean;
};

/**
 * Query parameters for [entity] list
 */
export type [Entity]QueryParams = {
  /** Page number for pagination */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
};

/**
 * Payload for creating a new [entity]
 */
export type Create[Entity]Payload = {
  /** [Entity] name (required) */
  name: string;
};

/**
 * Payload for updating an existing [entity]
 */
export type Update[Entity]Payload = {
  /** Updated name */
  name?: string;
  /** Updated active status */
  isActive?: boolean;
}

/**
 * Service for managing [entity] operations
 * Provides CRUD operations and business logic for [entities]
 * @class [Entity]Service
 * @example
 * const service = new [Entity]Service();
 * const [entities] = await service.getAll[Entities]();
 */
export class [Entity]Service {
  readonly apiClient: APIClient;
  private readonly basePath: string = '/api/[entities]';

  /**
   * Create [Entity]Service instance
   * @param {APIClient | null} apiClient - Optional API client instance
   * @example
   * // With default client
   * const service = new [Entity]Service();
   *
   * // With custom client
   * const customClient = new APIClient('https://api.custom.com');
   * const service = new [Entity]Service(customClient);
   */
  constructor(apiClient: APIClient | null = null) {
    this.apiClient = apiClient || new APIClient(process.env.API_BASE_URL);
    logger.info('[Entity]Service initialized', {
      baseURL: this.apiClient.baseURL,
      basePath: this.basePath
    });
  }

  // ==================== READ OPERATIONS ====================

  /**
   * Get all [entities] with optional filters
   * @async
   * @param {[Entity]QueryParams} params - Query parameters for filtering and pagination
   * @returns {Promise<[Entity]Data[]>} Array of [entities]
   * @throws {Error} If API request fails
   * @example
   * const [entities] = await service.getAll[Entities]({ page: 1, limit: 10 });
   * const active = await service.getAll[Entities]({ isActive: true });
   */
  async getAll[Entities](params: [Entity]QueryParams = {}): Promise<[Entity]Data[]> {
    logger.info('Fetching all [entities]', params);

    try {
      const response = await this.apiClient.get(this.basePath, { params });

      logger.info('[Entities] fetched successfully', {
        count: response.data.length,
        params
      });

      return response.data as [Entity]Data[];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to fetch [entities]', { params, error });
      throw new Error(`Failed to fetch [entities]: ${errorMessage}`);
    }
  }

  /**
   * Get [entity] by ID
   * @async
   * @param {string} [entity]Id - [Entity] ID
   * @returns {Promise<[Entity]Data>} [Entity] data
   * @throws {Error} If [entity] not found or request fails
   * @example
   * const [entity] = await service.get[Entity]ById('123');
   */
  async get[Entity]ById([entity]Id: string): Promise<[Entity]Data> {
    logger.info('Fetching [entity] by ID', { [entity]Id });

    if (![ entity]Id || [entity]Id.trim().length === 0) {
      throw new Error('[Entity] ID is required');
    }

    try {
      const response = await this.apiClient.get(`${this.basePath}/${[entity]Id}`);

      logger.info('[Entity] fetched successfully', { [entity]Id });

      return response.data as [Entity]Data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to fetch [entity]', { [entity]Id, error });
      throw new Error(`Failed to fetch [entity] ${[entity]Id}: ${errorMessage}`);
    }
  }

  /**
   * Search [entities] by criteria
   * @async
   * @param {string} searchTerm - Search term
   * @param {string[]} fields - Fields to search in
   * @returns {Promise<[Entity]Data[]>} Matching [entities]
   * @example
   * const results = await service.search[Entities]('test', ['name']);
   */
  async search[Entities](
    searchTerm: string,
    fields: string[] = ['name']
  ): Promise<[Entity]Data[]> {
    logger.info('Searching [entities]', { searchTerm, fields });

    try {
      const response = await this.apiClient.get(`${this.basePath}/search`, {
        params: {
          q: searchTerm,
          fields: fields.join(',')
        }
      });

      logger.info('Search completed', {
        searchTerm,
        resultsCount: response.data.length
      });

      return response.data as [Entity]Data[];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Search failed', { searchTerm, error });
      throw new Error(`Search failed: ${errorMessage}`);
    }
  }

  // ==================== CREATE OPERATIONS ====================

  /**
   * Create a new [entity]
   * @async
   * @param {Create[Entity]Payload} [entity]Data - [Entity] data
   * @returns {Promise<[Entity]Data>} Created [entity] data
   * @throws {Error} If creation fails or validation errors occur
   * @example
   * const new[Entity] = await service.create[Entity]({
   *   name: 'Test [Entity]',
   * });
   */
  async create[Entity]([entity]Data: Create[Entity]Payload): Promise<[Entity]Data> {
    logger.info('Creating new [entity]', { name: [entity]Data.name });

    // Validate input data
    this.validate[Entity]Data([entity]Data);

    try {
      const response = await this.apiClient.post(this.basePath, [entity]Data);

      logger.info('[Entity] created successfully', {
        [entity]Id: response.data.id,
        name: [entity]Data.name
      });

      return response.data as [Entity]Data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to create [entity]', {
        name: [entity]Data.name,
        error
      });
      throw new Error(`Failed to create [entity]: ${errorMessage}`);
    }
  }

  // ==================== UPDATE OPERATIONS ====================

  /**
   * Update existing [entity] (full update)
   * @async
   * @param {string} [entity]Id - [Entity] ID
   * @param {Update[Entity]Payload} updates - Updates to apply
   * @returns {Promise<[Entity]Data>} Updated [entity] data
   * @throws {Error} If update fails
   * @example
   * const updated = await service.update[Entity]('123', {
   *   name: 'Updated Name',
   *   isActive: true
   * });
   */
  async update[Entity](
    [entity]Id: string,
    updates: Update[Entity]Payload
  ): Promise<[Entity]Data> {
    logger.info('Updating [entity]', { [entity]Id, updates });

    if (![entity]Id || [entity]Id.trim().length === 0) {
      throw new Error('[Entity] ID is required');
    }

    try {
      const response = await this.apiClient.put(
        `${this.basePath}/${[entity]Id}`,
        updates
      );

      logger.info('[Entity] updated successfully', { [entity]Id });

      return response.data as [Entity]Data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to update [entity]', { [entity]Id, error });
      throw new Error(`Failed to update [entity] ${[entity]Id}: ${errorMessage}`);
    }
  }

  /**
   * Partially update [entity] (PATCH)
   * @async
   * @param {string} [entity]Id - [Entity] ID
   * @param {Partial<Update[Entity]Payload>} updates - Partial updates
   * @returns {Promise<[Entity]Data>} Updated [entity] data
   * @example
   * const patched = await service.patch[Entity]('123', { isActive: false });
   */
  async patch[Entity](
    [entity]Id: string,
    updates: Partial<Update[Entity]Payload>
  ): Promise<[Entity]Data> {
    logger.info('Patching [entity]', { [entity]Id, updates });

    if (![entity]Id || [entity]Id.trim().length === 0) {
      throw new Error('[Entity] ID is required');
    }

    try {
      const response = await this.apiClient.patch(
        `${this.basePath}/${[entity]Id}`,
        updates
      );

      logger.info('[Entity] patched successfully', { [entity]Id });

      return response.data as [Entity]Data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to patch [entity]', { [entity]Id, error });
      throw new Error(`Failed to patch [entity] ${[entity]Id}: ${errorMessage}`);
    }
  }

  // ==================== DELETE OPERATIONS ====================

  /**
   * Delete [entity]
   * @async
   * @param {string} [entity]Id - [Entity] ID
   * @returns {Promise<void>}
   * @throws {Error} If deletion fails
   * @example
   * await service.delete[Entity]('123');
   */
  async delete[Entity]([entity]Id: string): Promise<void> {
    logger.info('Deleting [entity]', { [entity]Id });

    if (![entity]Id || [entity]Id.trim().length === 0) {
      throw new Error('[Entity] ID is required');
    }

    try {
      await this.apiClient.delete(`${this.basePath}/${[entity]Id}`);

      logger.info('[Entity] deleted successfully', { [entity]Id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to delete [entity]', { [entity]Id, error });
      throw new Error(`Failed to delete [entity] ${[entity]Id}: ${errorMessage}`);
    }
  }

  /**
   * Bulk delete [entities]
   * @async
   * @param {string[]} [entity]Ids - Array of [entity] IDs
   * @returns {Promise<{ deleted: number; failed: number }>} Deletion results
   * @example
   * const result = await service.bulkDelete[Entities](['123', '456', '789']);
   * console.log(`Deleted: ${result.deleted}, Failed: ${result.failed}`);
   */
  async bulkDelete[Entities](
    [entity]Ids: string[]
  ): Promise<{ deleted: number; failed: number }> {
    logger.info('Bulk deleting [entities]', { count: [entity]Ids.length });

    let deleted = 0;
    let failed = 0;

    for (const [entity]Id of [entity]Ids) {
      try {
        await this.delete[Entity]([entity]Id);
        deleted++;
      } catch (error) {
        logger.warn('Failed to delete [entity] in bulk operation', { [entity]Id });
        failed++;
      }
    }

    logger.info('Bulk delete completed', { deleted, failed });

    return { deleted, failed };
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate [entity] data
   * @private
   * @param {Create[Entity]Payload} [entity]Data - [Entity] data to validate
   * @throws {Error} If validation fails
   */
  private validate[Entity]Data([entity]Data: Create[Entity]Payload): void {
    if (![entity]Data.name || [entity]Data.name.trim().length === 0) {
      throw new Error('[Entity] name is required');
    }

    if ([entity]Data.name.length > 255) {
      throw new Error('[Entity] name must be less than 255 characters');
    }

    // Add more validation rules as needed
  }

  // ==================== FACTORY METHODS ====================

  /**
   * Create service instance with custom base URL
   * @static
   * @param {string} baseURL - Custom base URL
   * @returns {[Entity]Service} Service instance
   * @example
   * const service = [Entity]Service.withBaseURL('https://api.staging.com');
   */
  static withBaseURL(baseURL: string): [Entity]Service {
    const apiClient = new APIClient(baseURL);
    return new [Entity]Service(apiClient);
  }

  /**
   * Create service instance for staging environment
   * @static
   * @returns {[Entity]Service} Service instance
   * @example
   * const service = [Entity]Service.forStaging();
   */
  static forStaging(): [Entity]Service {
    return [Entity]Service.withBaseURL(process.env.STAGING_API_URL || '');
  }

  /**
   * Create service instance for production environment
   * @static
   * @returns {[Entity]Service} Service instance
   * @example
   * const service = [Entity]Service.forProduction();
   */
  static forProduction(): [Entity]Service {
    return [Entity]Service.withBaseURL(process.env.PRODUCTION_API_URL || '');
  }
}

// ==================== USAGE EXAMPLE ====================
/*
import { test, expect } from '@fixtures/test.fixtures';
import [Entity]Service from '@services/[entity].service';

test.describe('[Entity] Service Tests @api', () => {
  let service: [Entity]Service;
  const created[Entity]Ids: string[] = [];

  test.beforeEach(async () => {
    service = new [Entity]Service();
  });

  test.afterEach(async () => {
    // Cleanup created [entities]
    for (const id of created[Entity]Ids) {
      await service.delete[Entity](id).catch(() => {});
    }
    created[Entity]Ids.length = 0;
  });

  test('should create [entity]', async () => {
    const [entity] = await service.create[Entity]({ name: 'Test [Entity]' });
    created[Entity]Ids.push([entity].id);

    expect([entity].id).toBeTruthy();
    expect([entity].name).toBe('Test [Entity]');
  });

  test('should get [entity] by ID', async () => {
    const created = await service.create[Entity]({ name: 'Test [Entity]' });
    created[Entity]Ids.push(created.id);

    const [entity] = await service.get[Entity]ById(created.id);
    expect([entity].id).toBe(created.id);
    expect([entity].name).toBe(created.name);
  });
});
*/
