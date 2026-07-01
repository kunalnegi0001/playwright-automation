/**
 * @fileoverview MongoDB database helper functions.
 * Provides wrapper functions for common MongoDB operations.
 * @module utils/database/mongodb.helper
 */

import { logger } from '@utils/core';

type MongoDb = {
  collection: (name: string) => {
    findOne: (
      filter: Record<string, unknown>,
      options?: Record<string, unknown>
    ) => Promise<Record<string, unknown> | null>;
    find: (
      filter: Record<string, unknown>,
      options?: Record<string, unknown>
    ) => { toArray: () => Promise<Array<Record<string, unknown>>> };
    insertOne: (doc: Record<string, unknown>) => Promise<Record<string, unknown>>;
    insertMany: (docs: Array<Record<string, unknown>>) => Promise<Record<string, unknown>>;
    updateOne: (
      filter: Record<string, unknown>,
      update: Record<string, unknown>,
      options?: Record<string, unknown>
    ) => Promise<Record<string, unknown>>;
    updateMany: (
      filter: Record<string, unknown>,
      update: Record<string, unknown>,
      options?: Record<string, unknown>
    ) => Promise<Record<string, unknown>>;
    deleteOne: (filter: Record<string, unknown>) => Promise<Record<string, unknown>>;
    deleteMany: (filter: Record<string, unknown>) => Promise<Record<string, unknown>>;
    countDocuments: (filter: Record<string, unknown>) => Promise<number>;
    aggregate: (pipeline: Array<Record<string, unknown>>) => {
      toArray: () => Promise<Array<Record<string, unknown>>>;
    };
    distinct: (field: string, filter: Record<string, unknown>) => Promise<unknown[]>;
  };
  listCollections: (filter: Record<string, unknown>) => { hasNext: () => Promise<boolean> };
};

type MongoClient = {
  startSession: () => {
    withTransaction: (callback: () => Promise<unknown>) => Promise<void>;
    endSession: () => Promise<void>;
  };
};

type MongoSession = Record<string, unknown>;

/**
 * Find a single document in a collection
 * @export
 * @async
 * @param {import('mongodb').Db} db - MongoDB database instance
 * @param {string} collection - Collection name
 * @param {Object} [filter={}] - Query filter
 * @param {Object} [options={}] - Query options
 * @returns {Promise<Object|null>} Document or null if not found
 * @example
 * const user = await findOne(db, 'users', { email: 'john@example.com' });
 */
export const findOne = async (
  db: MongoDb,
  collection: string,
  filter: Record<string, unknown> = {},
  options: Record<string, unknown> = {}
): Promise<Record<string, unknown> | null> => {
  return db.collection(collection).findOne(filter, options);
};

/**
 * Find multiple documents in a collection
 * @export
 * @async
 * @param {import('mongodb').Db} db - MongoDB database instance
 * @param {string} collection - Collection name
 * @param {Object} [filter={}] - Query filter
 * @param {Object} [options={}] - Query options (sort, limit, projection, etc.)
 * @returns {Promise<Array>} Array of documents
 * @example
 * const users = await findMany(db, 'users', { role: 'admin' }, { limit: 10 });
 */
export const findMany = async (
  db: MongoDb,
  collection: string,
  filter: Record<string, unknown> = {},
  options: Record<string, unknown> = {}
): Promise<Array<Record<string, unknown>>> => {
  return db.collection(collection).find(filter, options).toArray();
};

/**
 * Insert a single document into a collection
 * @export
 * @async
 * @param {import('mongodb').Db} db - MongoDB database instance
 * @param {string} collection - Collection name
 * @param {Object} [doc={}] - Document to insert
 * @returns {Promise<Object>} Insert result
 * @example
 * await insertOne(db, 'users', { name: 'John', email: 'john@example.com' });
 */
export const insertOne = async (
  db: MongoDb,
  collection: string,
  doc: Record<string, unknown> = {}
): Promise<Record<string, unknown>> => {
  return db.collection(collection).insertOne(doc);
};

/**
 * Insert multiple documents into a collection
 * @export
 * @async
 * @param {import('mongodb').Db} db - MongoDB database instance
 * @param {string} collection - Collection name
 * @param {Array} [docs=[]] - Array of documents to insert
 * @returns {Promise<Object>} Insert result
 * @example
 * await insertMany(db, 'users', [{ name: 'John' }, { name: 'Jane' }]);
 */
export const insertMany = async (
  db: MongoDb,
  collection: string,
  docs: Array<Record<string, unknown>> = []
): Promise<Record<string, unknown>> => {
  return db.collection(collection).insertMany(docs);
};

export const updateOne = async (
  db: MongoDb,
  collection: string,
  filter: Record<string, unknown> = {},
  update: Record<string, unknown> = {},
  options: Record<string, unknown> = {}
): Promise<Record<string, unknown>> => {
  return db.collection(collection).updateOne(filter, update, options);
};

export const updateMany = async (
  db: MongoDb,
  collection: string,
  filter: Record<string, unknown> = {},
  update: Record<string, unknown> = {},
  options: Record<string, unknown> = {}
): Promise<Record<string, unknown>> => {
  return db.collection(collection).updateMany(filter, update, options);
};

export const deleteOne = async (
  db: MongoDb,
  collection: string,
  filter: Record<string, unknown> = {}
): Promise<Record<string, unknown>> => {
  return db.collection(collection).deleteOne(filter);
};

export const deleteMany = async (
  db: MongoDb,
  collection: string,
  filter: Record<string, unknown> = {}
): Promise<Record<string, unknown>> => {
  return db.collection(collection).deleteMany(filter);
};

export const countDocuments = async (
  db: MongoDb,
  collection: string,
  filter: Record<string, unknown> = {}
): Promise<number> => {
  return db.collection(collection).countDocuments(filter);
};

export const collectionExists = async (db: MongoDb, collection: string): Promise<boolean> => {
  const exists = await db.listCollections({ name: collection }).hasNext();
  return exists;
};

export const clearCollection = async (
  db: MongoDb,
  collection: string
): Promise<Record<string, unknown>> => {
  return db.collection(collection).deleteMany({});
};

export const aggregate = async (
  db: MongoDb,
  collection: string,
  pipeline: Array<Record<string, unknown>> = []
): Promise<Array<Record<string, unknown>>> => {
  return db.collection(collection).aggregate(pipeline).toArray();
};

export const distinct = async (
  db: MongoDb,
  collection: string,
  field: string,
  filter: Record<string, unknown> = {}
): Promise<unknown[]> => {
  return db.collection(collection).distinct(field, filter);
};

export const upsertOne = async (
  db: MongoDb,
  collection: string,
  filter: Record<string, unknown> = {},
  update: Record<string, unknown> = {}
): Promise<Record<string, unknown>> => {
  return db.collection(collection).updateOne(filter, update, { upsert: true });
};

/**
 * Execute operations within a MongoDB transaction
 * @export
 * @async
 * @param {import('mongodb').MongoClient} client - MongoDB client instance
 * @param {Function} callback - Async callback function receiving session
 * @returns {Promise<*>} Result from callback function
 * @throws {Error} If transaction fails
 * @example
 * await withTransaction(client, async (session) => {
 *   await insertOne(db, 'users', { name: 'John' });
 *   await updateOne(db, 'accounts', { id: 1 }, { $inc: { balance: 100 } });
 * });
 */
export const withTransaction = async (
  client: MongoClient,
  callback: (session: MongoSession) => Promise<unknown>
): Promise<unknown> => {
  const session = client.startSession();
  try {
    let result: unknown;
    await session.withTransaction(async () => {
      result = await callback(session as MongoSession);
    });
    return result;
  } catch (error) {
    logger.error(`withTransaction failed: ${(error as Error).message}`);
    throw error;
  } finally {
    await session.endSession();
  }
};
