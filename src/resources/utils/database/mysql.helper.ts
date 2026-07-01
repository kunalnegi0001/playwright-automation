/**
 * @fileoverview MySQL query builder and helper functions.
 * Provides utilities for constructing and executing MySQL queries safely.
 * @module utils/database/mysql.helper
 */

import { logger } from '@utils/core';

export type MysqlQueryResult = { query: string; params: unknown[] };

/**
 * Build a SELECT query with optional WHERE clause
 * @export
 * @param {string} table - Table name
 * @param {string[]} [columns=['*']] - Columns to select
 * @param {Object} [where={}] - WHERE clause conditions (key-value pairs)
 * @returns {{query: string, params: Array}} Query and parameters
 * @example
 * const { query, params } = buildSelectQuery('users', ['id', 'name'], { role: 'admin' });
 * // query: 'SELECT id, name FROM users WHERE role = ?'
 * // params: ['admin']
 */
export const buildSelectQuery = (
  table: string,
  columns: string[] = ['*'],
  where: Record<string, unknown> = {}
) => {
  const cols = columns.join(', ');
  const keys = Object.keys(where);
  const clause = keys.length ? ` WHERE ${keys.map(k => `${k} = ?`).join(' AND ')}` : '';
  return {
    query: `SELECT ${cols} FROM ${table}${clause}`,
    params: keys.map(k => (where as Record<string, unknown>)[k]) as unknown[],
  };
};

/**
 * Build an INSERT query
 * @export
 * @param {string} table - Table name
 * @param {Object} [data={}] - Data to insert (key-value pairs)
 * @returns {{query: string, params: Array}} Query and parameters
 * @example
 * const { query, params } = buildInsertQuery('users', { name: 'John', email: 'john@example.com' });
 * // query: 'INSERT INTO users (name, email) VALUES (?, ?)'
 * // params: ['John', 'john@example.com']
 */
export const buildInsertQuery = (
  table: string,
  data: Record<string, unknown> = {}
): MysqlQueryResult => {
  const keys = Object.keys(data);
  const placeholders = keys.map(() => '?').join(', ');
  return {
    query: `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
    params: keys.map(k => data[k]),
  };
};

/**
 * Build an UPDATE query with SET and WHERE clauses
 * @export
 * @param {string} table - Table name
 * @param {Object} [data={}] - Data to update (key-value pairs)
 * @param {Object} [where={}] - WHERE clause conditions (key-value pairs)
 * @returns {{query: string, params: Array}} Query and parameters
 * @example
 * const { query, params } = buildUpdateQuery('users', { name: 'Jane' }, { id: 1 });
 * // query: 'UPDATE users SET name = ? WHERE id = ?'
 * // params: ['Jane', 1]
 */
export const buildUpdateQuery = (
  table: string,
  data: Record<string, unknown> = {},
  where: Record<string, unknown> = {}
): MysqlQueryResult => {
  const setKeys = Object.keys(data);
  const whereKeys = Object.keys(where);
  const query = `UPDATE ${table} SET ${setKeys.map(k => `${k} = ?`).join(', ')}${whereKeys.length ? ` WHERE ${whereKeys.map(k => `${k} = ?`).join(' AND ')}` : ''}`;
  return { query, params: [...setKeys.map(k => data[k]), ...whereKeys.map(k => where[k])] };
};

/**
 * Build a DELETE query with optional WHERE clause
 * @export
 * @param {string} table - Table name
 * @param {Object} [where={}] - WHERE clause conditions (key-value pairs)
 * @returns {{query: string, params: Array}} Query and parameters
 * @example
 * const { query, params } = buildDeleteQuery('users', { status: 'inactive' });
 * // query: 'DELETE FROM users WHERE status = ?'
 * // params: ['inactive']
 */
export const buildDeleteQuery = (
  table: string,
  where: Record<string, unknown> = {}
): MysqlQueryResult => {
  const whereKeys = Object.keys(where);
  const query = `DELETE FROM ${table}${whereKeys.length ? ` WHERE ${whereKeys.map(k => `${k} = ?`).join(' AND ')}` : ''}`;
  return { query, params: whereKeys.map(k => where[k]) };
};

export const buildCountQuery = (
  table: string,
  where: Record<string, unknown> = {}
): MysqlQueryResult => {
  const whereKeys = Object.keys(where);
  const query = `SELECT COUNT(*) as count FROM ${table}${whereKeys.length ? ` WHERE ${whereKeys.map(k => `${k} = ?`).join(' AND ')}` : ''}`;
  return { query, params: whereKeys.map(k => where[k]) };
};

export const runQuery = async (
  client: unknown,
  query: string,
  params: unknown[] = []
): Promise<unknown> => {
  try {
    const [rows] = await (
      client as { execute: (q: string, p: unknown[]) => Promise<[unknown, unknown]> }
    ).execute(query, params);
    return rows;
  } catch (error) {
    logger.error(`runQuery failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

export const fetchOne = async (
  client: unknown,
  table: string,
  where: Record<string, unknown> = {},
  columns: string[] = ['*']
): Promise<unknown> => {
  const { query, params } = buildSelectQuery(table, columns, where);
  const rows = await runQuery(client, `${query} LIMIT 1`, params);
  return (rows as unknown[])[0] || null;
};

export const fetchMany = async (
  client: unknown,
  table: string,
  where: Record<string, unknown> = {},
  columns: string[] = ['*']
): Promise<unknown> => {
  const { query, params } = buildSelectQuery(table, columns, where);
  return runQuery(client, query, params);
};

export const insertOne = async (
  client: unknown,
  table: string,
  data: Record<string, unknown> = {}
): Promise<unknown> => {
  const { query, params } = buildInsertQuery(table, data);
  return runQuery(client, query, params);
};

export const updateMany = async (
  client: unknown,
  table: string,
  data: Record<string, unknown> = {},
  where: Record<string, unknown> = {}
): Promise<unknown> => {
  const { query, params } = buildUpdateQuery(table, data, where);
  return runQuery(client, query, params);
};

export const deleteMany = async (
  client: unknown,
  table: string,
  where: Record<string, unknown> = {}
): Promise<unknown> => {
  const { query, params } = buildDeleteQuery(table, where);
  return runQuery(client, query, params);
};

export const countRows = async (
  client: unknown,
  table: string,
  where: Record<string, unknown> = {}
): Promise<number> => {
  const { query, params } = buildCountQuery(table, where);
  const rows = (await runQuery(client, query, params)) as Array<Record<string, unknown>>;
  return Number((rows?.[0]?.count as number | undefined) ?? 0);
};

export const tableExists = async (client: unknown, table: string): Promise<boolean> => {
  const rows = (await runQuery(
    client,
    'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?',
    [table]
  )) as Array<Record<string, unknown>>;
  return Number((rows?.[0]?.count as number | undefined) || 0) > 0;
};

export const truncateTable = async (client: unknown, table: string): Promise<unknown> => {
  return runQuery(client, `TRUNCATE TABLE ${table}`);
};

export const transaction = async <T>(
  client: unknown,
  callback: (c: unknown) => Promise<T>
): Promise<T> => {
  await (client as { beginTransaction: () => Promise<void> }).beginTransaction();
  try {
    const result = await callback(client);
    await (client as { commit: () => Promise<void> }).commit();
    return result;
  } catch (error) {
    await (client as { rollback: () => Promise<void> }).rollback();
    logger.error(`transaction failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};
