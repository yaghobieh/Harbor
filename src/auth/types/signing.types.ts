export interface SigningOptions {
  secret: string;
  algorithm?: 'sha256' | 'sha384' | 'sha512';
  header?: string;
  timestampHeader?: string;
  maxAge?: number;
}

