/**
 * Validate MongoDB ObjectId format
 */
export function validateObjectId(id: string): boolean {
  const objectIdRegex = /^[a-fA-F0-9]{24}$/;
  return objectIdRegex.test(id);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

