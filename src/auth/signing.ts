import { RequestHandler } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { HTTP_STATUS } from '../constants';
import type { SigningOptions } from './types';

export function verifySignature(options: SigningOptions): RequestHandler {
  const {
    secret,
    algorithm = 'sha256',
    header = 'X-Signature',
    timestampHeader = 'X-Timestamp',
    maxAge = 300000,
  } = options;

  return (req, res, next) => {
    const signature = req.get(header);
    const timestamp = req.get(timestampHeader);

    if (!signature) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: { message: 'Missing signature' },
      });
    }

    if (timestamp) {
      const age = Date.now() - parseInt(timestamp, 10);
      if (age > maxAge) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: { message: 'Request too old' },
        });
      }
    }

    const payload = timestamp
      ? `${timestamp}.${JSON.stringify(req.body)}`
      : JSON.stringify(req.body);
    
    const hmac = createHmac(algorithm, secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: { message: 'Invalid signature' },
      });
    }

    next();
  };
}

