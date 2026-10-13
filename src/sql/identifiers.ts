import { SQL_DOT, SQL_INVALID_IDENTIFIER } from './const/generals';
import { SQL_QUALIFIER_MAX, SQL_QUALIFIER_MIN } from './const/numbers';
import { SQL_IDENTIFIER } from './sql.const';

export function assertIdentifier(name: string): void {
  if (!SQL_IDENTIFIER.test(name)) {
    throw new Error(`${SQL_INVALID_IDENTIFIER}: ${name}`);
  }
}

export function quoteIdent(name: string): string {
  assertIdentifier(name);
  return `"${name}"`;
}

export function quoteQualified(name: string): string {
  const parts = name.split(SQL_DOT);
  const depthOk = parts.length >= SQL_QUALIFIER_MIN && parts.length <= SQL_QUALIFIER_MAX;
  if (!depthOk) {
    throw new Error(`${SQL_INVALID_IDENTIFIER}: ${name}`);
  }
  return parts.map((part) => quoteIdent(part)).join(SQL_DOT);
}
