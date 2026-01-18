import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${uuidv4().replace(/-/g, '')}`;
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Calculate token expiration date
 */
export function calculateExpiry(duration: string): Date {
  const matches = duration.match(/^(\d+)([smhd])$/);
  if (!matches || matches.length < 3) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const value = matches[1]!;
  const unit = matches[2]!;
  const numValue = parseInt(value, 10);
  const now = new Date();

  switch (unit) {
    case 's':
      return new Date(now.getTime() + numValue * 1000);
    case 'm':
      return new Date(now.getTime() + numValue * 60 * 1000);
    case 'h':
      return new Date(now.getTime() + numValue * 60 * 60 * 1000);
    case 'd':
      return new Date(now.getTime() + numValue * 24 * 60 * 60 * 1000);
    default:
      throw new Error(`Invalid duration unit: ${unit}`);
  }
}

/**
 * Convert cents to dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Convert dollars to cents
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }
  return '*'.repeat(data.length - visibleChars) + data.slice(-visibleChars);
}

/**
 * Sleep utility for retry logic
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 100, maxDelayMs = 5000 } = options;
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxAttempts) {
        const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
        const jitter = Math.random() * 100;
        await sleep(delay + jitter);
      }
    }
  }

  throw lastError;
}
