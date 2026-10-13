import { describe, expect, it } from 'vitest';
import { defineSqlModel, sqlTable, transaction } from '../src/sql';
import type { SqlPool, SqlRow } from '../src/sql';

interface Call {
  sql: string;
  params: unknown[];
}

describe('sql query builder', () => {
  it('builds select SQL and keeps values in params', async () => {
    const { client, calls } = fakeClient();
    const users = sqlTable('users', client);

    await users
      .select('id', 'status')
      .join('orders', 'orders.user_id', 'users.id')
      .leftJoin('profiles', 'profiles.user_id', 'users.id')
      .where('status', 'active')
      .and('age', '>', 18)
      .or('role', 'admin')
      .where('id', 'IN', [1, 2])
      .groupBy('status')
      .having('age', '>', 21)
      .orderBy('id', 'desc')
      .limit(10)
      .offset(5)
      .find();

    expect(calls[0]).toEqual({
      sql: 'SELECT "id", "status" FROM "users" JOIN "orders" ON "orders"."user_id" = "users"."id" LEFT JOIN "profiles" ON "profiles"."user_id" = "users"."id" WHERE "status" = $1 AND "age" > $2 OR "role" = $3 AND "id" IN ($4, $5) GROUP BY "status" HAVING "age" > $6 ORDER BY "id" DESC LIMIT $7 OFFSET $8',
      params: ['active', 18, 'admin', 1, 2, 21, 10, 5],
    });
  });

  it('keeps hostile values in params', async () => {
    const { client, calls } = fakeClient();
    await sqlTable('users', client).where('name', "Robert'); DROP TABLE users;--").find();
    expect(calls[0]).toEqual({
      sql: 'SELECT * FROM "users" WHERE "name" = $1',
      params: ["Robert'); DROP TABLE users;--"],
    });
  });

  it('rejects identifiers that are not simple names', async () => {
    const { client, calls } = fakeClient();
    expect(() => sqlTable('users;drop', client)).toThrow(/Invalid SQL identifier/);
    expect(() => sqlTable('users', client).where('email;drop', 'x')).toThrow(/Invalid SQL identifier/);
    await expect(sqlTable('users', client).create({ 'a;drop': 1 })).rejects.toThrow(/Invalid SQL identifier/);
    expect(calls).toHaveLength(0);
  });

  it('uses RETURNING for insert, update, delete, and upsert', async () => {
    const { client, calls } = fakeClient([{ id: 1, email: 'a@b.c' }]);
    const users = defineSqlModel('users', client);

    await users.create({ email: 'a@b.c', name: 'Ada' });
    await users.insertMany([{ email: 'a@b.c' }, { email: 'b@b.c' }]);
    await users.updateOne({ id: 1 }, { name: 'Bea' });
    await users.updateMany({ active: true }, { name: 'Bea' });
    await users.deleteOne({ id: 1 });
    await users.deleteMany({ active: false });
    await users.remove({ id: 2 });
    await users.upsert({ email: 'a@b.c', name: 'Ada' }, 'email');
    await users.findOneAndUpdate({ email: 'a@b.c' }, { name: 'Ada' }, { upsert: true });

    expect(calls.map((call) => call.sql)).toEqual([
      'INSERT INTO "users" ("email", "name") VALUES ($1, $2) RETURNING *',
      'INSERT INTO "users" ("email") VALUES ($1), ($2) RETURNING *',
      'UPDATE "users" SET "name" = $1 WHERE "id" = $2 RETURNING *',
      'UPDATE "users" SET "name" = $1 WHERE "active" = $2 RETURNING *',
      'DELETE FROM "users" WHERE "id" = $1 RETURNING *',
      'DELETE FROM "users" WHERE "active" = $1 RETURNING *',
      'DELETE FROM "users" WHERE "id" = $1 RETURNING *',
      'INSERT INTO "users" ("email", "name") VALUES ($1, $2) ON CONFLICT ("email") DO UPDATE SET "name" = EXCLUDED."name" RETURNING *',
      'INSERT INTO "users" ("email", "name") VALUES ($1, $2) ON CONFLICT ("email") DO UPDATE SET "name" = EXCLUDED."name" RETURNING *',
    ]);
    expect(calls[0]?.params).toEqual(['a@b.c', 'Ada']);
    expect(calls[2]?.params).toEqual(['Bea', 1]);
  });

  it('builds read, aggregate, and index SQL', async () => {
    const { client, calls } = fakeClient([{ id: 4, count: 3, value: 'admin', sum: 9 }]);
    const users = sqlTable('users', client);

    await users.findById(4);
    await users.where('active', true).count();
    await users.where('id', 4).exists();
    await users.where('active', true).distinct('role');
    await users.where('active', true).sum('amount');
    await users.avg('amount');
    await users.min('amount');
    await users.max('amount');
    await users.createIndex(['email'], { unique: true });
    await users.dropIndex('users_email_idx');
    await users.listIndexes();
    await users.query('SELECT "id" FROM "users" WHERE "id" = $1', [4]);
    await users.where('deleted_at', null).find();

    expect(calls.map((call) => call.sql)).toEqual([
      'SELECT * FROM "users" WHERE "id" = $1 LIMIT $2',
      'SELECT COUNT(*) AS "count" FROM "users" WHERE "active" = $1',
      'SELECT 1 AS "exists" FROM "users" WHERE "id" = $1 LIMIT 1',
      'SELECT DISTINCT "role" AS "value" FROM "users" WHERE "active" = $1',
      'SELECT SUM("amount") AS "sum" FROM "users" WHERE "active" = $1',
      'SELECT AVG("amount") AS "avg" FROM "users"',
      'SELECT MIN("amount") AS "min" FROM "users"',
      'SELECT MAX("amount") AS "max" FROM "users"',
      'CREATE UNIQUE INDEX "users_email_idx" ON "users" ("email")',
      'DROP INDEX "users_email_idx"',
      'SELECT indexname, indexdef FROM pg_indexes WHERE tablename = $1',
      'SELECT "id" FROM "users" WHERE "id" = $1',
      'SELECT * FROM "users" WHERE "deleted_at" IS NULL',
    ]);
    expect(calls[0]?.params).toEqual([4, 1]);
    expect(calls[10]?.params).toEqual(['users']);
    expect(calls[11]?.params).toEqual([4]);
    expect(calls[12]?.params).toEqual([]);
  });
});

describe('sql transaction', () => {
  it('rolls back when the callback throws', async () => {
    const { pool, calls, released } = fakePool();
    await expect(transaction(async (tx) => {
      await tx.query('SELECT 1', []);
      throw new Error('nope');
    }, pool)).rejects.toThrow('nope');

    expect(calls.map((call) => call.sql)).toEqual(['BEGIN', 'SELECT 1', 'ROLLBACK']);
    expect(released()).toBe(1);
  });

  it('rolls back a table transaction and commits on success', async () => {
    const failing = fakePool();
    const users = sqlTable('users', failing.pool);
    await expect(users.transaction(async () => {
      throw new Error('nope');
    })).rejects.toThrow('nope');
    expect(failing.calls.map((call) => call.sql)).toEqual(['BEGIN', 'ROLLBACK']);

    const ok = fakePool();
    const value = await transaction(async (tx) => {
      await tx.table('accounts').query('UPDATE "accounts" SET "balance" = $1', [90]);
      return 'saved';
    }, ok.pool);
    expect(value).toBe('saved');
    expect(ok.calls.map((call) => call.sql)).toEqual([
      'BEGIN',
      'UPDATE "accounts" SET "balance" = $1',
      'COMMIT',
    ]);
    expect(ok.calls[1]?.params).toEqual([90]);
    expect(ok.released()).toBe(1);
  });
});

function fakeClient(rows: SqlRow[] = [{ id: 1 }]) {
  const calls: Call[] = [];
  const client = {
    async query(sql: string, params: unknown[] = []) {
      calls.push({ sql, params });
      if (sql.startsWith('SELECT COUNT')) {
        return { rows: [{ count: rows[0]?.count ?? 0 }], rowCount: 1 };
      }
      return { rows, rowCount: rows.length };
    },
  };
  return { client, calls };
}

function fakePool() {
  const calls: Call[] = [];
  let releases = 0;
  const client = {
    async query(sql: string, params: unknown[] = []) {
      calls.push({ sql, params });
      return { rows: [], rowCount: 0 };
    },
    release() {
      releases += 1;
    },
  };
  const pool: SqlPool = {
    query: client.query,
    async connect() {
      return client;
    },
    async end() {
      return undefined;
    },
  };
  return { pool, calls, released: () => releases };
}
