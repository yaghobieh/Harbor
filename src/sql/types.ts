export type SqlRow = Record<string, unknown>;

export interface SqlQueryResult<T = SqlRow> {
  rows: T[];
  rowCount: number;
}

export interface SqlExecutor {
  query<T = SqlRow>(sql: string, params?: unknown[]): Promise<SqlQueryResult<T>>;
}

export interface SqlPoolClient extends SqlExecutor {
  release(): void;
}

export interface SqlPool extends SqlExecutor {
  connect(): Promise<SqlPoolClient>;
  end(): Promise<void>;
}

export interface PostgresConnectOptions {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  ssl?: boolean | Record<string, unknown>;
}

export interface SqlConnectOptions extends PostgresConnectOptions {
  driver: string;
}

export interface SqlIndexOptions {
  unique?: boolean;
  name?: string;
}

export interface SqlIndexInfo {
  indexname: string;
  indexdef: string;
}

export type SqlJoiner = 'AND' | 'OR';

export type SqlClauseTarget = 'conditions' | 'having';

export interface SqlTx {
  query<T = SqlRow>(sql: string, params?: unknown[]): Promise<SqlQueryResult<T>>;
  table<T extends SqlRow = SqlRow>(name: string): import('./table').SqlTable<T>;
}

export interface SqlCondition {
  joiner: SqlJoiner;
  column: string;
  op: string;
  value: unknown;
}

export interface SqlJoin {
  kind: 'inner' | 'left';
  table: string;
  left: string;
  right: string;
}

export interface SqlOrder {
  column: string;
  direction: 'ASC' | 'DESC';
}

export interface SqlQueryState {
  select: string[] | null;
  conditions: SqlCondition[];
  joins: SqlJoin[];
  groupBy: string[];
  having: SqlCondition[];
  orderBy: SqlOrder[];
  limit?: number;
  offset?: number;
}

export interface CompiledSql {
  text: string;
  values: unknown[];
}
