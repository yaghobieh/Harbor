export interface CodeBlockProps {
  code: string;
  filename?: string;
  className?: string;
}

export interface Token {
  type: TokenType;
  value: string;
}

export type TokenType = 
  | 'keyword' 
  | 'string' 
  | 'comment' 
  | 'number' 
  | 'function' 
  | 'property' 
  | 'operator' 
  | 'punctuation' 
  | 'text';

