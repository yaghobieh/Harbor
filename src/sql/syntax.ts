import { SQL_ASC, SQL_DESC } from './const/generals';
import { ZERO } from './const/numbers';
import { SQL_OPERATORS } from './sql.const';

export function normalizeOperator(operator: string): string {
  const normalized = operator.trim().toUpperCase();
  if (!(SQL_OPERATORS as readonly string[]).includes(normalized)) {
    throw new Error(`Invalid SQL operator: ${operator}`);
  }
  return normalized;
}

export function normalizeDirection(direction?: string): 'ASC' | 'DESC' {
  if (!direction) return SQL_ASC;
  const normalized = direction.trim().toUpperCase();
  if (normalized === SQL_ASC || normalized === SQL_DESC) return normalized;
  throw new Error(`Invalid SQL order: ${direction}`);
}

export function assertLimit(value: number, label: string): number {
  if (!Number.isInteger(value) || value < ZERO) {
    throw new Error(`${label} must be a non-negative integer`);
  }
  return value;
}
