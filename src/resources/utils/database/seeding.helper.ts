export type SeedUser = {
  email: string;
  first_name: string;
  last_name: string;
  status: string;
};

export type SeedProduct = {
  sku: string;
  name: string;
  price: number;
  in_stock: boolean;
};

export const generateUserSeed = (count = 10): SeedUser[] => {
  return Array.from({ length: count }, (_, i) => ({
    email: `user${i + 1}@example.com`,
    first_name: `User${i + 1}`,
    last_name: 'Test',
    status: i % 2 === 0 ? 'active' : 'inactive',
  }));
};

export const generateProductSeed = (count = 10): SeedProduct[] => {
  return Array.from({ length: count }, (_, i) => ({
    sku: `SKU-${1000 + i}`,
    name: `Product ${i + 1}`,
    price: Number((10 + i * 1.5).toFixed(2)),
    in_stock: i % 3 !== 0,
  }));
};

export const seedMySqlTable = async (
  client: unknown,
  table: string,
  rows: Array<Record<string, unknown>> = []
): Promise<{ inserted: number }> => {
  if (!rows.length) {
    return { inserted: 0 };
  }
  const keys = Object.keys(rows[0]);
  const placeholders = `(${keys.map(() => '?').join(', ')})`;
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES ${rows.map(() => placeholders).join(', ')}`;
  const params = rows.flatMap(r => keys.map(k => r[k]));
  await (client as { execute: (sql: string, params: unknown[]) => Promise<void> }).execute(
    sql,
    params
  );
  return { inserted: rows.length };
};

export const clearMySqlTable = async (client: unknown, table: string): Promise<boolean> => {
  await (client as { execute: (sql: string) => Promise<void> }).execute(`DELETE FROM ${table}`);
  return true;
};

export const seedMongoCollection = async (
  db: unknown,
  collection: string,
  docs: Array<Record<string, unknown>> = []
): Promise<{ inserted: number }> => {
  if (!docs.length) {
    return { inserted: 0 };
  }
  const res = await (
    db as {
      collection: (name: string) => {
        insertMany: (docs: unknown[]) => Promise<{ insertedCount: number }>;
      };
    }
  )
    .collection(collection)
    .insertMany(docs);
  return { inserted: res.insertedCount };
};

export const clearMongoCollection = async (
  db: unknown,
  collection: string
): Promise<{ deleted: number }> => {
  const res = await (
    db as {
      collection: (name: string) => {
        deleteMany: (filter: Record<string, unknown>) => Promise<{ deletedCount: number }>;
      };
    }
  )
    .collection(collection)
    .deleteMany({});
  return { deleted: res.deletedCount };
};

export const seedRedisKeys = async (
  client: unknown,
  data: Record<string, unknown> = {},
  ttlSeconds: number | null = null
): Promise<{ inserted: number }> => {
  const entries = Object.entries(data);
  const redisClient = client as {
    set: (key: string, value: string, opts?: { EX: number }) => Promise<void>;
  };
  for (const [k, v] of entries) {
    const val = typeof v === 'string' ? v : JSON.stringify(v);
    if (ttlSeconds) {
      await redisClient.set(k, val, { EX: ttlSeconds });
    } else {
      await redisClient.set(k, val);
    }
  }
  return { inserted: entries.length };
};

export const clearRedisByPattern = async (
  client: unknown,
  pattern = '*'
): Promise<{ deleted: number }> => {
  const redisClient = client as {
    keys: (pattern: string) => Promise<string[]>;
    del: (keys: string[]) => Promise<void>;
  };
  const keys = await redisClient.keys(pattern);
  if (!keys.length) {
    return { deleted: 0 };
  }
  await redisClient.del(keys);
  return { deleted: keys.length };
};

export const chunkSeedData = <T>(rows: T[] = [], chunkSize = 100): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    out.push(rows.slice(i, i + chunkSize));
  }
  return out;
};

export const seedInChunks = async <T>(
  seedFn: (chunk: T[]) => Promise<{ inserted?: number }>,
  rows: T[] = [],
  chunkSize = 100
): Promise<{ inserted: number; chunks: number }> => {
  const chunks = chunkSeedData(rows, chunkSize);
  let inserted = 0;
  for (const chunk of chunks) {
    const res = await seedFn(chunk);
    inserted += Number(res?.inserted || chunk.length);
  }
  return { inserted, chunks: chunks.length };
};
