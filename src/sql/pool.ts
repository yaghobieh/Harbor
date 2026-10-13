import type { PostgresConnectOptions, SqlConnectOptions, SqlPool, SqlQueryResult, SqlRow } from './types';

let active: SqlPool | null = null;

export function getSqlPool(): SqlPool {
  if (!active) {
    throw new Error('Not connected to Postgres. Call connectToPostgres() or connectToSql().');
  }
  return active;
}

function usePool(pool: SqlPool): SqlPool {
  active = pool;
  return pool;
}

function adaptResult<T>(result: { rows: T[]; rowCount: number | null }): SqlQueryResult<T> {
  return { rows: result.rows, rowCount: result.rowCount ?? 0 };
}

async function openPool(config: Record<string, unknown>): Promise<SqlPool> {
  const { Pool } = await import('pg');
  const pool = new Pool(config);
  return usePool({
    query: async <T = SqlRow>(sql: string, params?: unknown[]): Promise<SqlQueryResult<T>> => (
      adaptResult(await pool.query<T>(sql, params))
    ),
    connect: async () => {
      const client = await pool.connect();
      return {
        query: async <T = SqlRow>(sql: string, params?: unknown[]): Promise<SqlQueryResult<T>> => (
          adaptResult(await client.query<T>(sql, params))
        ),
        release: () => client.release(),
      };
    },
    end: () => pool.end(),
  });
}

export async function connectToPostgres(input: string | PostgresConnectOptions): Promise<SqlPool> {
  if (typeof input === 'string') {
    return openPool({ connectionString: input });
  }
  return openPool({
    host: input.host,
    port: input.port,
    user: input.user,
    password: input.password,
    database: input.database,
    ssl: input.ssl,
  });
}

export async function connectToSql(options: SqlConnectOptions): Promise<SqlPool> {
  if (options.driver !== 'postgres') {
    throw new Error(`Unsupported SQL driver: ${options.driver}`);
  }
  return connectToPostgres({
    host: options.host,
    port: options.port,
    user: options.user,
    password: options.password,
    database: options.database,
    ssl: options.ssl,
  });
}
