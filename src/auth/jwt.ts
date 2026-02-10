import { createHmac, timingSafeEqual } from 'crypto';
import { RequestHandler } from 'express';
import { createLogger } from '../utils/logger';
import { HTTP_STATUS } from '../constants';
import type { JwtOptions, JwtPayload } from './types';

const logger = createLogger('auth');

function base64UrlEncode(data: string | Buffer): string {
  const base64 = Buffer.isBuffer(data) 
    ? data.toString('base64')
    : Buffer.from(data).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = str.length % 4;
  if (padding) {
    str += '='.repeat(4 - padding);
  }
  return Buffer.from(str, 'base64').toString('utf8');
}

function getAlgorithm(alg: string): 'sha256' | 'sha384' | 'sha512' {
  const map: Record<string, 'sha256' | 'sha384' | 'sha512'> = {
    HS256: 'sha256',
    HS384: 'sha384',
    HS512: 'sha512',
  };
  return map[alg] || 'sha256';
}

export class JWT {
  private secret: string;
  private algorithm: string;
  private defaultExpiry: number;
  private issuer?: string;
  private audience?: string;

  constructor(options: JwtOptions) {
    this.secret = options.secret;
    this.algorithm = options.algorithm || 'HS256';
    this.defaultExpiry = options.expiresIn || 3600;
    this.issuer = options.issuer;
    this.audience = options.audience;
  }

  sign(payload: JwtPayload, expiresIn?: number): string {
    const header = { alg: this.algorithm, typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);

    const fullPayload: JwtPayload = {
      ...payload,
      iat: now,
      exp: now + (expiresIn || this.defaultExpiry),
    };

    if (this.issuer) fullPayload.iss = this.issuer;
    if (this.audience) fullPayload.aud = this.audience;

    const headerB64 = base64UrlEncode(JSON.stringify(header));
    const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
    const signature = this.createSignature(`${headerB64}.${payloadB64}`);

    return `${headerB64}.${payloadB64}.${signature}`;
  }

  verify(token: string): JwtPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [headerB64, payloadB64, signature] = parts;

    const expectedSignature = this.createSignature(`${headerB64}.${payloadB64}`);
    if (!this.safeCompare(signature, expectedSignature)) {
      throw new Error('Invalid signature');
    }

    const payload: JwtPayload = JSON.parse(base64UrlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }

    if (payload.nbf && payload.nbf > now) {
      throw new Error('Token not yet valid');
    }

    if (this.issuer && payload.iss !== this.issuer) {
      throw new Error('Invalid issuer');
    }

    if (this.audience && payload.aud !== this.audience) {
      throw new Error('Invalid audience');
    }

    return payload;
  }

  decode(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(base64UrlDecode(parts[1]));
    } catch {
      return null;
    }
  }

  private createSignature(data: string): string {
    const hmac = createHmac(getAlgorithm(this.algorithm), this.secret);
    hmac.update(data);
    return base64UrlEncode(hmac.digest());
  }

  private safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }
}

export function jwtAuth(jwt: JWT, options: { optional?: boolean } = {}): RequestHandler {
  return (req, res, next) => {
    const authHeader = req.get('Authorization');
    
    if (!authHeader) {
      if (options.optional) {
        return next();
      }
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: { message: 'No authorization header' },
      });
    }

    const [scheme, token] = authHeader.split(' ');
    
    if (scheme.toLowerCase() !== 'bearer' || !token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: { message: 'Invalid authorization format' },
      });
    }

    try {
      const payload = jwt.verify(token);
      (req as any).user = payload;
      (req as any).token = token;
      next();
    } catch (err) {
      const error = err as Error;
      logger.debug(`JWT verification failed: ${error.message}`);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: { message: error.message },
      });
    }
  };
}

export function createJwt(options: JwtOptions): JWT {
  return new JWT(options);
}

