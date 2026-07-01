/**
 * @fileoverview PostgreSQL database client for test data management.
 * Provides connection pooling, query execution, transactions, and seeding capabilities.
 * @module utils/database/postgres.client
 */

// @ts-ignore - pg types may not be installed
import pg from 'pg';
import { configManager } from '@config/config.manager';
import { logger } from '@utils/core';

// Create safe type-safe wrappers for pg types with PG prefix to avoid conflicts
export type PGSafePoolClient = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>;
  release: () => void;
};

export type PGSafePool = {
  query: <T>(sql: string, params?: unknown[]) => Promise<{ rows: T[]; rowCount: number }>;
  connect: () => Promise<PGSafePoolClient>;
  end: () => Promise<void>;
};

const Pool = (pg as unknown as { Pool: new (config: unknown) => PGSafePool }).Pool;

export type PostgresConfig = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
};

export type PostgresQueryResult<T = unknown> = {
  rows: T[];
  rowCount: number;
};

export type PostgresPoolClient = {
  query: (sql: string, params?: unknown[]) => Promise<PostgresQueryResult>;
  release: () => void;
};

/**
 * PostgreSQL Database Client
 * Manages database connections and operations for testing
 * @class
 */
class PostgresClient {
  config: PostgresConfig;
  pool: PGSafePool | null;

  constructor() {
    this.config = configManager.getDatabase('postgres') as PostgresConfig;
    this.pool = null;
  }

  /**
   * Establish connection to PostgreSQL database
   * Creates a connection pool if not already connected
   * @async
   * @returns {Promise<void>}
   * @example
   * await postgresClient.connect();
   */
  async connect(): Promise<void> {
    if (this.pool) {
      return;
    }

    this.pool = new Pool({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    logger.info('PostgreSQL connection established');
  }

  /**
   * Execute a SQL query with optional parameters
   * @async
   * @param {string} sql - SQL query string with placeholders ($1, $2, etc.)
   * @param {Array} [params=[]] - Query parameters
   * @returns {Promise<Array>} Array of result rows
   * @throws {Error} If query execution fails
   * @example
   * const users = await postgresClient.query('SELECT * FROM users WHERE role = $1', ['admin']);
   */
  async query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    await this.connect();

    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    try {
      const result = await this.pool.query<T>(sql, params);
      return result.rows;
    } catch (error) {
      logger.error(
        'PostgreSQL query error',
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  /**
   * Execute multiple queries within a transaction
   * Automatically commits on success or rolls back on error
   * @async
   * @param {Function} callback - Async function receiving client for query execution
   * @returns {Promise<*>} Result from the callback function
   * @throws {Error} If any query in the transaction fails
   * @example
   * await postgresClient.transaction(async (client) => {
   *   await client.query('INSERT INTO orders VALUES ($1)', [orderId]);
   *   await client.query('UPDATE inventory SET stock = stock - 1');
   * });
   */
  async transaction<T>(callback: (client: PGSafePoolClient) => Promise<T>): Promise<T> {
    await this.connect();

    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result: T = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(
        'Transaction rolled back',
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Seed database tables with test data
   * @async
   * @param {Object} data - Object mapping table names to arrays of row objects
   * @returns {Promise<void>}
   * @example
   * await postgresClient.seed({
   *   users: [{ name: 'Alice', email: 'alice@example.com' }],
   *   products: [{ name: 'Widget', price: 9.99 }]
   * });
   */
  async seed(data: Record<string, Array<Record<string, unknown>>>): Promise<void> {
    for (const table in data) {
      for (const row of data[table]) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = columns.map((_, i) => `$${i + 1}`);

        const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
        await this.query(sql, values);
      }
    }

    logger.info('Database seeded successfully');
  }

  /**
   * Clear all data from a table including cascading deletes
   * @async
   * @param {string} tableName - Name of the table to clear
   * @returns {Promise<void>}
   * @example
   * await postgresClient.clearTable('users');
   */
  async clearTable(tableName: string): Promise<void> {
    await this.query(`TRUNCATE TABLE ${tableName} CASCADE`);
    logger.info(`Table ${tableName} cleared`);
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      logger.info('PostgreSQL connection closed');
    }
  }
}

// Export singleton
const postgresClient = new PostgresClient();

export { PostgresClient, postgresClient };
