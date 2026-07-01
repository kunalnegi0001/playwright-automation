export type DBQueryBuilder = {
  table: string;
  type: string;
  columns: string[];
  where: Array<{ condition: string; params: unknown[]; op: string }>;
  orderBy: Array<{ field: string; direction: string }>;
  limit: number | null;
  offset: number | null;
  joins: Array<{ type: string; table: string; on: string }>;
};

export type DBSqlResult = {
  sql: string;
  params: unknown[];
};

export const qbSelect = (table: string, columns: string[] = ['*']): DBQueryBuilder => {
  return {
    table,
    type: 'select',
    columns,
    where: [],
    orderBy: [],
    limit: null,
    offset: null,
    joins: [],
  };
};

export const qbWhere = (
  qb: DBQueryBuilder,
  condition: string,
  params: unknown[] = []
): DBQueryBuilder => {
  qb.where.push({ condition, params, op: 'AND' });
  return qb;
};

export const qbOrWhere = (
  qb: DBQueryBuilder,
  condition: string,
  params: unknown[] = []
): DBQueryBuilder => {
  qb.where.push({ condition, params, op: 'OR' });
  return qb;
};

export const qbJoin = (
  qb: DBQueryBuilder,
  type: string,
  table: string,
  on: string
): DBQueryBuilder => {
  qb.joins.push({ type: type.toUpperCase(), table, on });
  return qb;
};

export const qbOrderBy = (qb: DBQueryBuilder, field: string, direction = 'ASC'): DBQueryBuilder => {
  qb.orderBy.push({ field, direction: direction.toUpperCase() });
  return qb;
};

export const qbLimit = (
  qb: DBQueryBuilder,
  limit: number,
  offset: number | null = null
): DBQueryBuilder => {
  qb.limit = limit;
  qb.offset = offset;
  return qb;
};

export const qbToSql = (qb: DBQueryBuilder): DBSqlResult => {
  const params: unknown[] = [];
  let sql = `SELECT ${qb.columns.join(', ')} FROM ${qb.table}`;

  if (qb.joins.length) {
    sql += ` ${qb.joins.map(j => `${j.type} JOIN ${j.table} ON ${j.on}`).join(' ')}`;
  }

  if (qb.where.length) {
    sql += ' WHERE ';
    sql += qb.where
      .map((w, i) => {
        params.push(...w.params);
        return `${i === 0 ? '' : `${w.op} `}(${w.condition})`;
      })
      .join(' ');
  }

  if (qb.orderBy.length) {
    sql += ` ORDER BY ${qb.orderBy.map(o => `${o.field} ${o.direction}`).join(', ')}`;
  }

  if (qb.limit !== null) {
    sql += ' LIMIT ?';
    params.push(qb.limit);
    if (qb.offset !== null) {
      sql += ' OFFSET ?';
      params.push(qb.offset);
    }
  }

  return { sql, params };
};

export const buildInsert = (table: string, data: Record<string, unknown> = {}): DBSqlResult => {
  const keys = Object.keys(data);
  return {
    sql: `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`,
    params: keys.map(k => data[k]),
  };
};

export const buildBulkInsert = (
  table: string,
  rows: Array<Record<string, unknown>> = []
): DBSqlResult => {
  if (!rows.length) {
    return { sql: '', params: [] };
  }
  const keys = Object.keys(rows[0]);
  const placeholders = `(${keys.map(() => '?').join(', ')})`;
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES ${rows.map(() => placeholders).join(', ')}`;
  const params = rows.flatMap(r => keys.map(k => r[k]));
  return { sql, params };
};

export const buildUpdate = (
  table: string,
  data: Record<string, unknown> = {},
  where = '1=1',
  whereParams: unknown[] = []
): DBSqlResult => {
  const keys = Object.keys(data);
  return {
    sql: `UPDATE ${table} SET ${keys.map(k => `${k} = ?`).join(', ')} WHERE ${where}`,
    params: [...keys.map(k => data[k]), ...whereParams],
  };
};

export const buildDelete = (
  table: string,
  where = '1=1',
  whereParams: unknown[] = []
): DBSqlResult => {
  return { sql: `DELETE FROM ${table} WHERE ${where}`, params: whereParams };
};

export const paginate = (limit = 20, page = 1): { limit: number; offset: number } => {
  const safeLimit = Math.max(1, Number(limit));
  const safePage = Math.max(1, Number(page));
  return { limit: safeLimit, offset: (safePage - 1) * safeLimit };
};
