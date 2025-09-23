import { z } from 'zod';

// Enum validators
export const orgTierSchema = z.enum(['FREE', 'PREMIUM']);
export const userRoleSchema = z.enum(['OWNER', 'ADMIN', 'MEMBER']);
export const identifierSchemeSchema = z.enum(['CAS', 'EC_NUMBER', 'UN_NUMBER', 'INTERNAL_SKU']);
export const listingTypeSchema = z.enum(['SELL', 'BUY_REQUEST']);
export const offerStateSchema = z.enum(['DRAFT', 'OPEN', 'COUNTER', 'ACCEPTED', 'REJECTED', 'SUPERSEDED', 'EXPIRED']);

// Material identifier validation
export const materialIdentifierValueSchema = z.string().refine((value) => {
  // Basic validation - can be enhanced with specific patterns per scheme
  return value.trim().length > 0;
}, 'Invalid identifier format');

// CAS number specific validation (format: XXXXXX-XX-X)
export const casNumberSchema = z.string().regex(
  /^\d{2,7}-\d{2}-\d$/,
  'CAS number must be in format XXXXXX-XX-X'
);

// E-number validation (format: E + 3-4 digits)
export const eNumberSchema = z.string().regex(
  /^E\d{3,4}$/,
  'E-number must be in format EXXX or EXXXX'
);

// Organization validation
export const createOrganizationSchema = z.object({
  legalName: z.string().min(2).max(100),
  website: z.string().url().optional(),
  country: z.string().min(2).max(3), // ISO country codes
  ownerEmail: z.string().email(),
  ownerFirstName: z.string().min(1).max(50),
  ownerLastName: z.string().min(1).max(50),
});

// User invitation validation
export const inviteUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: userRoleSchema,
});

// Listing validation
export const createListingSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  type: listingTypeSchema,
  materialIdentifierId: z.string().cuid(),
  quantity: z.string().max(50).optional(),
  unit: z.string().max(20).optional(),
  location: z.string().max(100).optional(),
});

// Offer validation
export const createOfferSchema = z.object({
  threadId: z.string().cuid().optional(),
  listingId: z.string().cuid(),
  price: z.number().positive().optional(),
  quantity: z.string().max(50).optional(),
  terms: z.string().max(2000).optional(),
  message: z.string().max(1000).optional(),
});

// Search validation
export const searchListingsSchema = z.object({
  query: z.string().max(200).optional(),
  type: listingTypeSchema.optional(),
  identifierScheme: identifierSchemeSchema.optional(),
  identifierValue: z.string().max(50).optional(),
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

// Document upload validation
export const documentUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().regex(/^[a-z]+\/[a-z0-9\-\+\.]+$/i),
  listingId: z.string().cuid(),
});

// Promotion checkout validation
export const promotionCheckoutSchema = z.object({
  listingId: z.string().cuid(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

// Email and phone masking utilities
export const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
export const phoneRegex = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;

export const maskEmail = (text: string): string => {
  return text.replace(emailRegex, '•••@masked');
};

export const maskPhone = (text: string): string => {
  return text.replace(phoneRegex, '+•••••••••');
};

export const maskContent = (text: string): string => {
  return maskPhone(maskEmail(text));
};