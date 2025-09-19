import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';
import { SeatRole, OrganizationTier } from './types';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';
export type Subject = 'Organization' | 'User' | 'Listing' | 'Offer' | 'Document' | 'Notification' | 'all';

export type AppAbility = MongoAbility<[Action, Subject]>;

export interface User {
  id: string;
  email: string;
  seats: Array<{
    role: SeatRole;
    orgId: string;
    org: {
      id: string;
      tier: OrganizationTier;
    };
  }>;
}

export function defineAbilityFor(user: User | null): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (!user) {
    // Anonymous users can only read published listings
    can('read', 'Listing', { status: 'PUBLISHED' });
    return build();
  }

  // Authenticated users can read their own profile
  can('read', 'User', { id: user.id });
  can('update', 'User', { id: user.id });

  // Organization-based permissions
  user.seats.forEach(seat => {
    const { role, orgId, org } = seat;

    // Organization permissions based on role
    switch (role) {
      case SeatRole.OWNER:
        can('manage', 'Organization', { id: orgId });
        can('create', 'User'); // Can invite users
        can('manage', 'Listing', { orgId });
        can('manage', 'Offer', { $or: [{ buyerOrgId: orgId }, { sellerOrgId: orgId }] });
        break;

      case SeatRole.ADMIN:
        can('read', 'Organization', { id: orgId });
        can('update', 'Organization', { id: orgId });
        can('create', 'User'); // Can invite users
        can('manage', 'Listing', { orgId });
        can('manage', 'Offer', { $or: [{ buyerOrgId: orgId }, { sellerOrgId: orgId }] });
        break;

      case SeatRole.MEMBER:
        can('read', 'Organization', { id: orgId });
        can('create', 'Listing', { orgId });
        can('update', 'Listing', { orgId, status: 'DRAFT' });
        can('manage', 'Offer', { $or: [{ buyerOrgId: orgId }, { sellerOrgId: orgId }] });
        break;

      case SeatRole.VIEWER:
        can('read', 'Organization', { id: orgId });
        can('read', 'Listing', { orgId });
        can('read', 'Offer', { $or: [{ buyerOrgId: orgId }, { sellerOrgId: orgId }] });
        break;
    }

    // Premium tier benefits
    if (org.tier === OrganizationTier.PREMIUM) {
      // Can see early access listings (within 48 hours)
      can('read', 'Listing', { 
        status: 'PUBLISHED',
        publishedAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
      });
    }
  });

  // General authenticated user permissions
  can('read', 'Listing', { status: 'PUBLISHED' });
  can('read', 'Notification', { userId: user.id });
  can('update', 'Notification', { userId: user.id });

  return build();
}

export function hasRole(user: User, orgId: string, roles: SeatRole[]): boolean {
  return user.seats.some(seat => seat.orgId === orgId && roles.includes(seat.role));
}

export function getOrgRole(user: User, orgId: string): SeatRole | null {
  const seat = user.seats.find(seat => seat.orgId === orgId);
  return seat?.role || null;
}

export function isOrgPremium(user: User, orgId: string): boolean {
  const seat = user.seats.find(seat => seat.orgId === orgId);
  return seat?.org.tier === OrganizationTier.PREMIUM;
}