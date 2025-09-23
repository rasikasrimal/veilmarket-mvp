import { nanoid } from 'nanoid';

export function generateHandle(legalName: string): string {
  // Create anonymized handle from legal name
  const base = legalName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 20);
  
  const suffix = nanoid(6).toLowerCase();
  return `${base}-${suffix}`;
}

export function generateInviteToken(): string {
  return nanoid(32);
}

export function isEarlyAccessRestricted(publishedAt: Date, userTier: 'FREE' | 'PREMIUM'): boolean {
  if (userTier === 'PREMIUM') return false;
  
  const now = new Date();
  const timeDiff = now.getTime() - publishedAt.getTime();
  const hoursElapsed = timeDiff / (1000 * 60 * 60);
  
  return hoursElapsed < 48;
}

export function isPinned(promotion: { expiresAt: Date } | null): boolean {
  if (!promotion) return false;
  return new Date() < promotion.expiresAt;
}

export function createPromotionExpiry(): Date {
  const now = new Date();
  return new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000)); // 5 days
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Watermark text generation
export function generateWatermarkText(listingId: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `Confidential · VeilMarket · Listing ${listingId} · ${date}`;
}

// Error handling
export class VeilMarketError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public fields?: Record<string, string>
  ) {
    super(message);
    this.name = 'VeilMarketError';
  }
}

export class ValidationError extends VeilMarketError {
  constructor(message: string, fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400, fields);
  }
}

export class AuthenticationError extends VeilMarketError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends VeilMarketError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends VeilMarketError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends VeilMarketError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}