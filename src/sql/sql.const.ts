export const SQL_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

export const SQL_ID_COLUMN = 'id';

export const SQL_OPERATORS = [
  '=',
  '!=',
  '<>',
  '<',
  '>',
  '<=',
  '>=',
  'LIKE',
  'ILIKE',
  'IN',
  'NOT IN',
  'IS',
  'IS NOT',
] as const;
