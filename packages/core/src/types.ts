export enum OrganizationTier {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum SeatRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export enum ListingType {
  SELL = 'SELL',
  BUY_REQ = 'BUY_REQ',
}

export enum ListingStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum OfferState {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
  SUPERSEDED = 'SUPERSEDED',
  EXPIRED = 'EXPIRED',
}

export enum NotificationType {
  OFFER_CREATED = 'OFFER_CREATED',
  OFFER_COUNTERED = 'OFFER_COUNTERED',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_REJECTED = 'OFFER_REJECTED',
  LISTING_PUBLISHED = 'LISTING_PUBLISHED',
  IDENTITY_REVEALED = 'IDENTITY_REVEALED',
}

export interface ApiError {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface SearchParams extends PaginationParams {
  query?: string;
  materialScheme?: string;
  materialValue?: string;
  type?: ListingType;
  location?: string;
  orgTier?: OrganizationTier;
}

export interface CreateListingRequest {
  title: string;
  description?: string;
  specs?: Record<string, any>;
  type: ListingType;
  quantity?: string;
  unit?: string;
  priceIndicative?: string;
  location?: string;
  materialIdentifierId: string;
}

export interface CreateOfferRequest {
  threadId?: string;
  listingId: string;
  price?: number;
  quantity?: string;
  unit?: string;
  terms?: string;
  message?: string;
  expiresAt?: Date;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  legalName?: string;
  website?: string;
  country?: string;
  description?: string;
}

export interface InviteUserRequest {
  email: string;
  role: SeatRole;
  orgId: string;
}