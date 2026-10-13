import {
  DELETE_REQUIRES_FILTER,
  INDEX_REQUIRES_COLUMN,
  IN_EXPECTS_ARRAY,
  IN_EXPECTS_VALUE,
  INSERT_REQUIRES_COLUMN,
  INSERT_REQUIRES_ROW,
  INSERT_SAME_COLUMNS,
  SQL_COMMA,
  SQL_COUNT_HEAD,
  SQL_CREATE_INDEX,
  SQL_EQ,
  SQL_DO_UPDATE,
  SQL_DROP_INDEX,
  SQL_EXCLUDED,
  SQL_EXISTS_HEAD,
  SQL_GROUP_BY,
  SQL_HAVING_PREFIX,
  SQL_IDX_SUFFIX,
  SQL_INDEX,
  SQL_INDEX_LIST,
  SQL_IN,
  SQL_IS,
  SQL_IS_NOT,
  SQL_IS_NOT_NULL,
  SQL_IS_NULL,
  SQL_JOIN,
  SQL_LEFT,
  SQL_LEFT_JOIN,
  SQL_LIMIT_ONE,
  SQL_LIMIT_PREFIX,
  SQL_NE,
  SQL_NE_ALT,
  SQL_NOT_IN,
  SQL_OFFSET_PREFIX,
  SQL_ON,
  SQL_ON_CONFLICT,
  SQL_ORDER_BY,
  SQL_PLACEHOLDER,
  SQL_RETURNING_STAR,
  SQL_STAR,
  SQL_UNIQUE,
  SQL_WHERE_PREFIX,
  UPDATE_REQUIRES_COLUMN,
  UPDATE_REQUIRES_FILTER,
  UPSERT_CONFLICT_MISSING,
  UPSERT_REQUIRES_CONFLICT,
} from './const/generals';
import { ZERO } from './const/numbers';
import { quoteIdent, quoteQualified } from './identifiers';
import type { CompiledSql, SqlCondition, SqlIndexOptions, SqlJoin, SqlQueryState, SqlRow } from './types';

function bind(values: unknown[], value: unknown): string {
  values.push(value === undefined ? null : value);
  return `${SQL_PLACEHOLDER}${values.length}`;
}

function compilePredicate(condition: SqlCondition, values: unknown[]): string {
  const column = quoteQualified(condition.column);
  const op = condition.op;
  const value = condition.value;

  const isNullish = value === null || value === undefined;
  const isNullOp = op === SQL_EQ || op === SQL_IS;
  const isNotNullOp = op === SQL_NE || op === SQL_NE_ALT || op === SQL_IS_NOT;
  if (isNullish && isNullOp) return `${column} ${SQL_IS_NULL}`;
  if (isNullish && isNotNullOp) return `${column} ${SQL_IS_NOT_NULL}`;
  const isListOp = op === SQL_IN || op === SQL_NOT_IN;
  if (isListOp) {
    if (!Array.isArray(value)) throw new Error(`${op} ${IN_EXPECTS_ARRAY}`);
    if (value.length === ZERO) throw new Error(`${op} ${IN_EXPECTS_VALUE}`);
    const placeholders = value.map((entry) => bind(values, entry));
    return `${column} ${op} (${placeholders.join(SQL_COMMA)})`;
  }
  return `${column} ${op} ${bind(values, value)}`;
}

function compileConditions(conditions: SqlCondition[], values: unknown[]): string {
  return conditions.map((condition, index) => {
    const predicate = compilePredicate(condition, values);
    if (index === ZERO) return predicate;
    return `${condition.joiner} ${predicate}`;
  }).join(' ');
}

function whereSql(conditions: SqlCondition[], values: unknown[]): string {
  const compiled = compileConditions(conditions, values);
  return compiled ? `${SQL_WHERE_PREFIX}${compiled}` : '';
}

function compileJoinSql(joins: SqlJoin[]): string {
  return joins.map((join) => {
    const keyword = join.kind === SQL_LEFT ? SQL_LEFT_JOIN : SQL_JOIN;
    return ` ${keyword} ${quoteIdent(join.table)} ON ${quoteQualified(join.left)} = ${quoteQualified(join.right)}`;
  }).join('');
}

function definedRow(data: SqlRow): SqlRow {
  const values: SqlRow = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) values[key] = value;
  }
  return values;
}

export function compileSelect(table: string, state: SqlQueryState): CompiledSql {
  const values: unknown[] = [];
  const columns = state.select === null
    ? SQL_STAR
    : state.select.map((column) => quoteQualified(column)).join(SQL_COMMA);
  let text = `SELECT ${columns} FROM ${quoteIdent(table)}`;
  text += compileJoinSql(state.joins);
  text += whereSql(state.conditions, values);
  if (state.groupBy.length > ZERO) {
    text += `${SQL_GROUP_BY}${state.groupBy.map((column) => quoteQualified(column)).join(SQL_COMMA)}`;
  }
  const having = compileConditions(state.having, values);
  if (having) text += `${SQL_HAVING_PREFIX}${having}`;
  if (state.orderBy.length > ZERO) {
    const order = state.orderBy
      .map((item) => `${quoteQualified(item.column)} ${item.direction}`)
      .join(SQL_COMMA);
    text += `${SQL_ORDER_BY}${order}`;
  }
  if (state.limit !== undefined) {
    values.push(state.limit);
    text += `${SQL_LIMIT_PREFIX}${values.length}`;
  }
  if (state.offset !== undefined) {
    values.push(state.offset);
    text += `${SQL_OFFSET_PREFIX}${values.length}`;
  }
  return { text, values };
}

export function compileCount(table: string, state: SqlQueryState): CompiledSql {
  const values: unknown[] = [];
  let text = `${SQL_COUNT_HEAD}${quoteIdent(table)}`;
  text += compileJoinSql(state.joins);
  text += whereSql(state.conditions, values);
  return { text, values };
}

export function compileExists(table: string, state: SqlQueryState): CompiledSql {
  const values: unknown[] = [];
  let text = `${SQL_EXISTS_HEAD}${quoteIdent(table)}`;
  text += compileJoinSql(state.joins);
  text += whereSql(state.conditions, values);
  text += SQL_LIMIT_ONE;
  return { text, values };
}

export function compileDistinct(table: string, state: SqlQueryState, column: string): CompiledSql {
  const values: unknown[] = [];
  let text = `SELECT DISTINCT ${quoteQualified(column)} AS "value" FROM ${quoteIdent(table)}`;
  text += compileJoinSql(state.joins);
  text += whereSql(state.conditions, values);
  return { text, values };
}

export function compileAggregate(
  table: string,
  state: SqlQueryState,
  fn: 'SUM' | 'AVG' | 'MIN' | 'MAX',
  alias: string,
  column: string,
): CompiledSql {
  const values: unknown[] = [];
  let text = `SELECT ${fn}(${quoteQualified(column)}) AS ${quoteIdent(alias)} FROM ${quoteIdent(table)}`;
  text += compileJoinSql(state.joins);
  text += whereSql(state.conditions, values);
  return { text, values };
}

export function compileInsert(table: string, rows: SqlRow[], returning = true): CompiledSql {
  if (rows.length === ZERO) throw new Error(INSERT_REQUIRES_ROW);
  const normalized = rows.map((row) => definedRow(row));
  const columns = Object.keys(normalized[ZERO] ?? {});
  if (columns.length === ZERO) throw new Error(INSERT_REQUIRES_COLUMN);
  for (const row of normalized) {
    const keys = Object.keys(row);
    const sameShape = keys.length === columns.length && columns.every((column) => keys.includes(column));
    if (!sameShape) throw new Error(INSERT_SAME_COLUMNS);
  }
  const values: unknown[] = [];
  const tuples = normalized.map((row) => {
    const placeholders = columns.map((column) => bind(values, row[column]));
    return `(${placeholders.join(SQL_COMMA)})`;
  });
  const quoted = columns.map((column) => quoteIdent(column)).join(SQL_COMMA);
  const tail = returning ? SQL_RETURNING_STAR : '';
  return {
    text: `INSERT INTO ${quoteIdent(table)} (${quoted}) VALUES ${tuples.join(SQL_COMMA)}${tail}`,
    values,
  };
}

export function compileUpdate(table: string, data: SqlRow, conditions: SqlCondition[]): CompiledSql {
  const row = definedRow(data);
  const columns = Object.keys(row);
  if (columns.length === ZERO) throw new Error(UPDATE_REQUIRES_COLUMN);
  if (conditions.length === ZERO) throw new Error(UPDATE_REQUIRES_FILTER);
  const values: unknown[] = [];
  const assignments = columns.map((column) => `${quoteIdent(column)} = ${bind(values, row[column])}`);
  const text = `UPDATE ${quoteIdent(table)} SET ${assignments.join(SQL_COMMA)}${whereSql(conditions, values)}${SQL_RETURNING_STAR}`;
  return { text, values };
}

export function compileDelete(table: string, conditions: SqlCondition[]): CompiledSql {
  if (conditions.length === ZERO) throw new Error(DELETE_REQUIRES_FILTER);
  const values: unknown[] = [];
  return {
    text: `DELETE FROM ${quoteIdent(table)}${whereSql(conditions, values)}${SQL_RETURNING_STAR}`,
    values,
  };
}

export function compileUpsert(table: string, data: SqlRow, conflict: string[]): CompiledSql {
  if (conflict.length === ZERO) throw new Error(UPSERT_REQUIRES_CONFLICT);
  const row = definedRow(data);
  const columns = Object.keys(row);
  for (const column of conflict) {
    quoteIdent(column);
    if (!columns.includes(column)) {
      throw new Error(`${UPSERT_CONFLICT_MISSING}: ${column}`);
    }
  }
  const insert = compileInsert(table, [row], false);
  const updateColumns = columns.filter((column) => !conflict.includes(column));
  const assigned = updateColumns.length > ZERO ? updateColumns : columns;
  const assignments = assigned
    .map((column) => `${quoteIdent(column)} = ${SQL_EXCLUDED}${quoteIdent(column)}`)
    .join(SQL_COMMA);
  const conflictColumns = conflict.map((column) => quoteIdent(column)).join(SQL_COMMA);
  return {
    text: `${insert.text}${SQL_ON_CONFLICT}${conflictColumns}${SQL_DO_UPDATE}${assignments}${SQL_RETURNING_STAR}`,
    values: insert.values,
  };
}

export function compileCreateIndex(table: string, columns: string[], options?: SqlIndexOptions): CompiledSql {
  if (columns.length === ZERO) throw new Error(INDEX_REQUIRES_COLUMN);
  const quotedColumns = columns.map((column) => quoteIdent(column));
  const name = options?.name ?? `${table}_${columns.join('_')}${SQL_IDX_SUFFIX}`;
  const unique = options?.unique ? SQL_UNIQUE : '';
  return {
    text: `${SQL_CREATE_INDEX}${unique}${SQL_INDEX}${quoteIdent(name)}${SQL_ON}${quoteIdent(table)} (${quotedColumns.join(SQL_COMMA)})`,
    values: [],
  };
}

export function compileDropIndex(name: string): CompiledSql {
  return { text: `${SQL_DROP_INDEX}${quoteIdent(name)}`, values: [] };
}

export function compileListIndexes(table: string): CompiledSql {
  quoteIdent(table);
  return {
    text: SQL_INDEX_LIST,
    values: [table],
  };
}
