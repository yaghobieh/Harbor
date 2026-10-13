import { SQL_BEGIN, SQL_COMMIT, SQL_ROLLBACK } from './const/generals';
import type { SqlExecutor, SqlPool } from './types';

export async function withTransaction<T>(
  pool: SqlPool,
  fn: (executor: SqlExecutor) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query(SQL_BEGIN);
    const result = await fn(client);
    await client.query(SQL_COMMIT);
    return result;
  } catch (error) {
    try {
      await client.query(SQL_ROLLBACK);
    } catch {
      // Keep the original error when rollback fails.
    }
    throw error;
  } finally {
    client.release();
  }
}
