import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

export function hashPassword(password: string, salt = randomBytes(16).toString('hex')): { hash: string; salt: string } {
  const hash = createHmac('sha512', salt).update(password).digest('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: computed } = hashPassword(password, salt);
  return timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
}

