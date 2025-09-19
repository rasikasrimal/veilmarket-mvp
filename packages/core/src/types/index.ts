export type OrgTier = 'FREE' | 'PREMIUM';
export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type IdentifierScheme = 'CAS' | 'EC_NUMBER' | 'UN_NUMBER' | 'INTERNAL_SKU';
export type ListingType = 'SELL' | 'BUY_REQUEST';
export type OfferState = 'DRAFT' | 'OPEN' | 'COUNTER' | 'ACCEPTED' | 'REJECTED' | 'SUPERSEDED' | 'EXPIRED';
export type NotificationType = 'OFFER_RECEIVED' | 'OFFER_ACCEPTED' | 'OFFER_REJECTED' | 'OFFER_COUNTERED' | 'LISTING_PROMOTED' | 'IDENTITY_REVEALED' | 'INVITE_RECEIVED';
export type QAVisibility = 'PUBLIC' | 'REVEAL_GATED';

export interface CreateOrganizationRequest {
  legalName: string;
  website?: string;
  country: string;
  ownerEmail: string;
  ownerFirstName: string;
  ownerLastName: string;
}

export interface CreateListingRequest {
  title: string;
  description: string;
  type: ListingType;
  materialIdentifierId: string;
  quantity?: string;
  unit?: string;
  location?: string;
}

export interface CreateOfferRequest {
  threadId?: string; // If undefined, creates new thread
  listingId: string;
  price?: number;
  quantity?: string;
  terms?: string;
  message?: string;
}

export interface SearchListingsRequest {
  query?: string;
  type?: ListingType;
  identifierScheme?: IdentifierScheme;
  identifierValue?: string;
  limit?: number;
  cursor?: string;
}

export interface InviteUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface PromotionCheckoutRequest {
  listingId: string;
  successUrl: string;
  cancelUrl: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  nextCursor?: string;
  total?: number;
}

// Privacy-related types
export interface VeiledOrganization {
  id: string;
  handle: string;
  tier: OrgTier;
  // Legal name, website hidden until reveal
}

export interface RevealedOrganization extends VeiledOrganization {
  legalName: string;
  website?: string;
  country: string;
}

export interface MaskedContact {
  email?: string; // e.g., "•••@masked"
  phone?: string; // e.g., "+•••••••••"
}

// Document types
export interface DocumentUploadRequest {
  filename: string;
  contentType: string;
  listingId: string;
}

export interface SignedUploadUrl {
  uploadUrl: string;
  documentId: string;
  expiresAt: string;
}