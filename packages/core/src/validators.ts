import { z } from 'zod';
import { OrganizationTier, SeatRole, ListingType, OfferState } from './types';

export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  legalName: z.string().min(1).max(200).optional(),
  website: z.string().url().optional(),
  country: z.string().min(2).max(2).optional(),
  description: z.string().max(1000).optional(),
});

export const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(SeatRole),
  orgId: z.string().cuid(),
});

export const createMaterialIdentifierSchema = z.object({
  scheme: z.string().min(1).max(50),
  value: z.string().min(1).max(100),
  name: z.string().max(200).optional(),
});

export const createListingSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  specs: z.record(z.any()).optional(),
  type: z.nativeEnum(ListingType),
  quantity: z.string().max(100).optional(),
  unit: z.string().max(50).optional(),
  priceIndicative: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  materialIdentifierId: z.string().cuid(),
});

export const createOfferSchema = z.object({
  threadId: z.string().cuid().optional(),
  listingId: z.string().cuid(),
  price: z.number().positive().optional(),
  quantity: z.string().max(100).optional(),
  unit: z.string().max(50).optional(),
  terms: z.string().max(1000).optional(),
  message: z.string().max(500).optional(),
  expiresAt: z.date().optional(),
});

export const updateOfferStateSchema = z.object({
  state: z.nativeEnum(OfferState),
  message: z.string().max(500).optional(),
});

export const searchListingsSchema = z.object({
  query: z.string().max(200).optional(),
  materialScheme: z.string().max(50).optional(),
  materialValue: z.string().max(100).optional(),
  type: z.nativeEnum(ListingType).optional(),
  location: z.string().max(200).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  cursor: z.string().optional(),
});

export const signedUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(100),
  size: z.number().int().positive().max(100 * 1024 * 1024), // 100MB max
  listingId: z.string().cuid(),
});