import {
  GROUP_BY_REQUIRES_COLUMN,
  INSERT_NO_ROW,
  ROW_NOT_FOUND,
  SELECT_REQUIRES_COLUMN,
  SQL_AND,
  SQL_CONDITIONS,
  SQL_EQ,
  SQL_HAVING,
  SQL_INNER,
  SQL_LEFT,
  SQL_OR,
  TRANSACTION_NEEDS_POOL,
  UPSERT_NO_ROW,
} from './const/generals';
import { ONE, ZERO } from './const/numbers';
import { SQL_ID_COLUMN } from './sql.const';
import { assertIdentifier, quoteQualified } from './identifiers';
import { assertLimit, normalizeDirection, normalizeOperator } from './syntax';
import {
  compileAggregate,
  compileCount,
  compileCreateIndex,
  compileDelete,
  compileDistinct,
  compileDropIndex,
  compileExists,
  compileInsert,
  compileListIndexes,
  compileSelect,
  compileUpdate,
  compileUpsert,
} from './compile';
import { getSqlPool } from './pool';
import { withTransaction } from './transaction';
import type {
  CompiledSql,
  SqlExecutor,
  SqlIndexInfo,
  SqlIndexOptions,
  SqlPool,
  SqlQueryResult,
  SqlClauseTarget,
  SqlJoiner,
  SqlQueryState,
  SqlRow,
  SqlTx,
} from './types';

function emptyState(): SqlQueryState {
  return {
    select: null,
    conditions: [],
    joins: [],
    groupBy: [],
    having: [],
    orderBy: [],
  };
}

function cloneState(state: SqlQueryState): SqlQueryState {
  return {
    select: state.select ? [...state.select] : null,
    conditions: state.conditions.map((condition) => ({ ...condition })),
    joins: state.joins.map((join) => ({ ...join })),
    groupBy: [...state.groupBy],
    having: state.having.map((condition) => ({ ...condition })),
    orderBy: state.orderBy.map((order) => ({ ...order })),
    limit: state.limit,
    offset: state.offset,
  };
}

function isPool(executor: SqlExecutor): executor is SqlPool {
  return typeof (executor as SqlPool).connect === 'function';
}

function asTx(executor: SqlExecutor): SqlTx {
  return {
    query(sql, params) {
      return executor.query(sql, params);
    },
    table(name) {
      return sqlTable(name, executor);
    },
  };
}

export async function transaction<T>(fn: (tx: SqlTx) => Promise<T>, pool?: SqlPool): Promise<T> {
  const source = pool ?? getSqlPool();
  return withTransaction(source, (executor) => fn(asTx(executor)));
}

export class SqlTable<T extends SqlRow = SqlRow> {
  private readonly tableName: string;
  private readonly bound?: SqlExecutor;
  private readonly state: SqlQueryState;

  constructor(tableName: string, bound?: SqlExecutor, state?: SqlQueryState) {
    assertIdentifier(tableName);
    this.tableName = tableName;
    this.bound = bound;
    this.state = state ?? emptyState();
  }

  private clone(): SqlTable<T> {
    return new SqlTable<T>(this.tableName, this.bound, cloneState(this.state));
  }

  private executor(): SqlExecutor {
    return this.bound ?? getSqlPool();
  }

  private async run<R>(compiled: CompiledSql): Promise<SqlQueryResult<R>> {
    return this.executor().query<R>(compiled.text, compiled.values);
  }

  private push(
    target: SqlClauseTarget,
    joiner: SqlJoiner,
    column: string,
    op: string,
    value: unknown,
  ): SqlTable<T> {
    quoteQualified(column);
    const next = this.clone();
    next.state[target].push({ joiner, column, op, value });
    return next;
  }

  private comparison(
    target: SqlClauseTarget,
    joiner: SqlJoiner,
    column: string,
    operatorOrValue: unknown,
    rest: unknown[],
  ): SqlTable<T> {
    const hasOperator = rest.length > ZERO;
    const op = hasOperator ? normalizeOperator(String(operatorOrValue)) : SQL_EQ;
    const value = hasOperator ? rest[ZERO] : operatorOrValue;
    return this.push(target, joiner, column, op, value);
  }

  private applyFilter(filter?: SqlRow): SqlTable<T> {
    if (!filter) return this;
    let next: SqlTable<T> = this;
    for (const [column, value] of Object.entries(filter)) {
      if (value !== undefined) next = next.where(column, value);
    }
    return next;
  }

  where(column: string, operatorOrValue: unknown, ...rest: unknown[]): SqlTable<T> {
    return this.comparison(SQL_CONDITIONS, SQL_AND, column, operatorOrValue, rest);
  }

  and(column: string, operatorOrValue: unknown, ...rest: unknown[]): SqlTable<T> {
    return this.comparison(SQL_CONDITIONS, SQL_AND, column, operatorOrValue, rest);
  }

  or(column: string, operatorOrValue: unknown, ...rest: unknown[]): SqlTable<T> {
    return this.comparison(SQL_CONDITIONS, SQL_OR, column, operatorOrValue, rest);
  }

  select(...columns: string[]): SqlTable<T> {
    if (columns.length === ZERO) {
      throw new Error(SELECT_REQUIRES_COLUMN);
    }
    columns.forEach((column) => quoteQualified(column));
    const next = this.clone();
    next.state.select = [...columns];
    return next;
  }

  orderBy(column: string, direction?: string): SqlTable<T> {
    quoteQualified(column);
    const next = this.clone();
    next.state.orderBy.push({ column, direction: normalizeDirection(direction) });
    return next;
  }

  limit(value: number): SqlTable<T> {
    const next = this.clone();
    next.state.limit = assertLimit(value, 'limit');
    return next;
  }

  offset(value: number): SqlTable<T> {
    const next = this.clone();
    next.state.offset = assertLimit(value, 'offset');
    return next;
  }

  join(table: string, left: string, right: string): SqlTable<T> {
    return this.addJoin(SQL_INNER, table, left, right);
  }

  leftJoin(table: string, left: string, right: string): SqlTable<T> {
    return this.addJoin(SQL_LEFT, table, left, right);
  }

  private addJoin(kind: 'inner' | 'left', table: string, left: string, right: string): SqlTable<T> {
    assertIdentifier(table);
    quoteQualified(left);
    quoteQualified(right);
    const next = this.clone();
    next.state.joins.push({ kind, table, left, right });
    return next;
  }

  groupBy(...columns: string[]): SqlTable<T> {
    if (columns.length === ZERO) {
      throw new Error(GROUP_BY_REQUIRES_COLUMN);
    }
    columns.forEach((column) => quoteQualified(column));
    const next = this.clone();
    next.state.groupBy.push(...columns);
    return next;
  }

  having(column: string, operatorOrValue: unknown, ...rest: unknown[]): SqlTable<T> {
    return this.comparison(SQL_HAVING, SQL_AND, column, operatorOrValue, rest);
  }

  async find(filter?: SqlRow): Promise<T[]> {
    const query = this.applyFilter(filter);
    const result = await query.run<T>(compileSelect(query.tableName, query.state));
    return result.rows;
  }

  async findOne(filter?: SqlRow): Promise<T | null> {
    const query = this.applyFilter(filter);
    const state = { ...query.state, limit: ONE };
    const result = await query.run<T>(compileSelect(query.tableName, state));
    return result.rows[0] ?? null;
  }

  async findById(id: string | number): Promise<T | null> {
    return this.where(SQL_ID_COLUMN, id).findOne();
  }

  async findAndCount(filter?: SqlRow): Promise<{ rows: T[]; count: number }> {
    const query = this.applyFilter(filter);
    const listed = await query.run<T>(compileSelect(query.tableName, query.state));
    const counted = await query.run<{ count: number | string }>(compileCount(query.tableName, query.state));
    return { rows: listed.rows, count: Number(counted.rows[ZERO]?.count ?? ZERO) };
  }

  async count(filter?: SqlRow): Promise<number> {
    const query = this.applyFilter(filter);
    const result = await query.run<{ count: number | string }>(compileCount(query.tableName, query.state));
    return Number(result.rows[ZERO]?.count ?? ZERO);
  }

  async exists(filter?: SqlRow): Promise<boolean> {
    const query = this.applyFilter(filter);
    const result = await query.run(compileExists(query.tableName, query.state));
    return result.rows.length > ZERO;
  }

  async distinct(column: string): Promise<unknown[]> {
    const result = await this.run<{ value: unknown }>(compileDistinct(this.tableName, this.state, column));
    return result.rows.map((row) => row.value);
  }

  async create(data: SqlRow): Promise<T> {
    const result = await this.run<T>(compileInsert(this.tableName, [data]));
    const row = result.rows[0];
    if (!row) throw new Error(INSERT_NO_ROW);
    return row;
  }

  async insertMany(rows: SqlRow[]): Promise<T[]> {
    const result = await this.run<T>(compileInsert(this.tableName, rows));
    return result.rows;
  }

  async save(data: SqlRow): Promise<T> {
    if (data.id == null) {
      return this.create(data);
    }
    const { id, ...rest } = data;
    if (Object.keys(rest).length === ZERO) {
      const existing = await this.findById(id as string | number);
      if (!existing) throw new Error(ROW_NOT_FOUND);
      return existing;
    }
    const updated = await this.updateOne({ id }, rest);
    if (!updated) throw new Error(ROW_NOT_FOUND);
    return updated;
  }

  async updateOne(filter: SqlRow, data: SqlRow): Promise<T | null> {
    const query = this.applyFilter(filter);
    const result = await query.run<T>(compileUpdate(query.tableName, data, query.state.conditions));
    return result.rows[ZERO] ?? null;
  }

  async updateMany(filter: SqlRow, data: SqlRow): Promise<T[]> {
    const query = this.applyFilter(filter);
    const result = await query.run<T>(compileUpdate(query.tableName, data, query.state.conditions));
    return result.rows;
  }

  async deleteOne(filter: SqlRow): Promise<T | null> {
    const query = this.applyFilter(filter);
    const result = await query.run<T>(compileDelete(query.tableName, query.state.conditions));
    return result.rows[ZERO] ?? null;
  }

  async deleteMany(filter: SqlRow): Promise<T[]> {
    const query = this.applyFilter(filter);
    const result = await query.run<T>(compileDelete(query.tableName, query.state.conditions));
    return result.rows;
  }

  async remove(filter: SqlRow): Promise<T | null> {
    return this.deleteOne(filter);
  }

  async findOneAndUpdate(
    filter: SqlRow,
    data: SqlRow,
    options?: { upsert?: boolean },
  ): Promise<T | null> {
    if (options?.upsert) {
      return this.upsert({ ...filter, ...data }, Object.keys(filter));
    }
    return this.updateOne(filter, data);
  }

  async upsert(data: SqlRow, conflict: string | string[]): Promise<T> {
    const columns = Array.isArray(conflict) ? conflict : [conflict];
    const result = await this.run<T>(compileUpsert(this.tableName, data, columns));
    const row = result.rows[0];
    if (!row) throw new Error(UPSERT_NO_ROW);
    return row;
  }

  async sum(column: string): Promise<number | null> {
    return this.aggregate('SUM', 'sum', column);
  }

  async avg(column: string): Promise<number | null> {
    return this.aggregate('AVG', 'avg', column);
  }

  async min(column: string): Promise<number | null> {
    return this.aggregate('MIN', 'min', column);
  }

  async max(column: string): Promise<number | null> {
    return this.aggregate('MAX', 'max', column);
  }

  private async aggregate(
    fn: 'SUM' | 'AVG' | 'MIN' | 'MAX',
    alias: string,
    column: string,
  ): Promise<number | null> {
    const compiled = compileAggregate(this.tableName, this.state, fn, alias, column);
    const result = await this.run<Record<string, unknown>>(compiled);
    const value = result.rows[ZERO]?.[alias];
    if (value == null) return null;
    return Number(value);
  }

  async createIndex(columns: string | string[], options?: SqlIndexOptions): Promise<void> {
    const list = Array.isArray(columns) ? columns : [columns];
    await this.run(compileCreateIndex(this.tableName, list, options));
  }

  async dropIndex(name: string): Promise<void> {
    await this.run(compileDropIndex(name));
  }

  async listIndexes(): Promise<SqlIndexInfo[]> {
    const result = await this.run<SqlIndexInfo>(compileListIndexes(this.tableName));
    return result.rows;
  }

  async query<R = SqlRow>(sql: string, params: unknown[] = []): Promise<SqlQueryResult<R>> {
    return this.executor().query<R>(sql, params);
  }

  async transaction<R>(fn: (tx: SqlTx) => Promise<R>): Promise<R> {
    const executor = this.executor();
    if (!isPool(executor)) {
      throw new Error(TRANSACTION_NEEDS_POOL);
    }
    return withTransaction(executor, (client) => fn(asTx(client)));
  }
}

export function sqlTable<T extends SqlRow = SqlRow>(name: string, executor?: SqlExecutor): SqlTable<T> {
  return new SqlTable<T>(name, executor);
}

export function defineSqlModel<T extends SqlRow = SqlRow>(name: string, executor?: SqlExecutor): SqlTable<T> {
  return sqlTable<T>(name, executor);
}
