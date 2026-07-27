export interface JwtOptions {
  secret: string;
  algorithm?: 'HS256' | 'HS384' | 'HS512';
  expiresIn?: number;
  issuer?: string;
  audience?: string;
}

export interface JwtPayload {
  sub?: string;
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
  [key: string]: unknown;
}

