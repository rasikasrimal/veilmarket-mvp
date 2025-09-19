-- VeilMarket Database Schema
-- Manual setup for MVP

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id VARCHAR(30) PRIMARY KEY DEFAULT CONCAT('org_', SUBSTRING(MD5(RANDOM()::TEXT), 1, 24)),
  handle VARCHAR(100) UNIQUE NOT NULL,
  legal_name VARCHAR(200) NOT NULL,
  website VARCHAR(500),
  country VARCHAR(3) NOT NULL,
  tier VARCHAR(20) DEFAULT 'FREE' CHECK (tier IN ('FREE', 'PREMIUM')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(30) PRIMARY KEY DEFAULT CONCAT('usr_', SUBSTRING(MD5(RANDOM()::TEXT), 1, 24)),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
  is_active BOOLEAN DEFAULT TRUE,
  invite_token VARCHAR(100) UNIQUE,
  invite_expires TIMESTAMP,
  organization_id VARCHAR(30) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Material identifiers table
CREATE TABLE IF NOT EXISTS material_identifiers (
  id VARCHAR(30) PRIMARY KEY DEFAULT CONCAT('mid_', SUBSTRING(MD5(RANDOM()::TEXT), 1, 24)),
  scheme VARCHAR(20) NOT NULL CHECK (scheme IN ('CAS', 'EC_NUMBER', 'UN_NUMBER', 'INTERNAL_SKU')),
  value VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(scheme, value)
);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id VARCHAR(30) PRIMARY KEY DEFAULT CONCAT('lst_', SUBSTRING(MD5(RANDOM()::TEXT), 1, 24)),
  title VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('SELL', 'BUY_REQUEST')),
  material_identifier_id VARCHAR(30) NOT NULL REFERENCES material_identifiers(id),
  quantity VARCHAR(100),
  unit VARCHAR(50),
  location VARCHAR(200),
  published_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  organization_id VARCHAR(30) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_id VARCHAR(30) NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Offer threads table
CREATE TABLE IF NOT EXISTS offer_threads (
  id VARCHAR(30) PRIMARY KEY DEFAULT CONCAT('thr_', SUBSTRING(MD5(RANDOM()::TEXT), 1, 24)),
  listing_id VARCHAR(30) NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
  id VARCHAR(30) PRIMARY KEY DEFAULT CONCAT('off_', SUBSTRING(MD5(RANDOM()::TEXT), 1, 24)),
  thread_id VARCHAR(30) NOT NULL REFERENCES offer_threads(id) ON DELETE CASCADE,
  organization_id VARCHAR(30) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  state VARCHAR(20) DEFAULT 'DRAFT' CHECK (state IN ('DRAFT', 'OPEN', 'COUNTER', 'ACCEPTED', 'REJECTED', 'SUPERSEDED', 'EXPIRED')),
  price DECIMAL(15,2),
  quantity VARCHAR(100),
  terms TEXT,
  message TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create unique constraint for "at most one OPEN offer per thread"
CREATE UNIQUE INDEX IF NOT EXISTS unique_open_offer ON offers(thread_id, state) WHERE state = 'OPEN';

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(30) PRIMARY KEY DEFAULT CONCAT('not_', SUBSTRING(MD5(RANDOM()::TEXT), 1, 24)),
  user_id VARCHAR(30) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id VARCHAR(30) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  payload JSONB,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_org ON listings(organization_id);
CREATE INDEX IF NOT EXISTS idx_listings_material ON listings(material_identifier_id);
CREATE INDEX IF NOT EXISTS idx_listings_published ON listings(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_offers_thread ON offers(thread_id);
CREATE INDEX IF NOT EXISTS idx_offers_org ON offers(organization_id);
CREATE INDEX IF NOT EXISTS idx_offers_state ON offers(state);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;