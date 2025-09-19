export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 2 
    ? local.charAt(0) + '•'.repeat(local.length - 2) + local.charAt(local.length - 1)
    : '•'.repeat(local.length);
  return `${maskedLocal}@masked`;
}

export function maskPhone(phone: string): string {
  // Simple masking for phone numbers
  return '+•••••••••';
}

export function maskText(text: string): string {
  // Basic email and phone masking using regex
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match) => maskEmail(match))
    .replace(/(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g, maskPhone);
}

export function isEarlyAccess(publishedAt: Date): boolean {
  const now = new Date();
  const diffHours = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);
  return diffHours < 48;
}

export function generateWatermarkText(listingId: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `Confidential · VeilMarket · ${listingId} · ${date}`;
}

export function createAuditLogEntry(
  action: string,
  entityType: string,
  entityId: string,
  userId?: string,
  orgId?: string,
  metadata?: any,
  request?: { ip?: string; userAgent?: string }
) {
  return {
    action,
    entityType,
    entityId,
    userId,
    orgId,
    metadata,
    ipAddress: request?.ip,
    userAgent: request?.userAgent,
  };
}

export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public fields?: Record<string, string>;

  constructor(
    code: string,
    message: string,
    statusCode: number = 400,
    fields?: Record<string, string>
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.fields = fields;
    this.name = 'AppError';
  }

  static badRequest(message: string, fields?: Record<string, string>) {
    return new AppError('BAD_REQUEST', message, 400, fields);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new AppError('UNAUTHORIZED', message, 401);
  }

  static forbidden(message: string = 'Forbidden') {
    return new AppError('FORBIDDEN', message, 403);
  }

  static notFound(message: string = 'Not found') {
    return new AppError('NOT_FOUND', message, 404);
  }

  static conflict(message: string) {
    return new AppError('CONFLICT', message, 409);
  }

  static internal(message: string = 'Internal server error') {
    return new AppError('INTERNAL_ERROR', message, 500);
  }
}