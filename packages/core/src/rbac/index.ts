import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';

export type AppAbility = MongoAbility;

export interface User {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  organizationId: string;
}

export interface Subject {
  __typename?: string;
  id?: string;
  organizationId?: string;
  createdById?: string;
}

export function defineAbilityFor(user: User): AppAbility {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  // All authenticated users can read their own organization
  can('read', 'Organization', { id: user.organizationId });
  can('read', 'User', { organizationId: user.organizationId });

  // All users can create listings for their organization
  can('create', 'Listing');
  can('read', 'Listing'); // Public listings
  can('update', 'Listing', { organizationId: user.organizationId });
  can('delete', 'Listing', { organizationId: user.organizationId });

  // Document access
  can('create', 'Document');
  can('read', 'Document'); // Previews are public
  can('read', 'Document', { 'listing.organizationId': user.organizationId }); // Full access to own

  // Offers
  can('create', 'Offer');
  can('read', 'Offer', { organizationId: user.organizationId });
  can('update', 'Offer', { organizationId: user.organizationId });

  // Material identifiers (read-only for members)
  can('read', 'MaterialIdentifier');

  // Notifications
  can('read', 'Notification', { organizationId: user.organizationId });
  can('update', 'Notification', { organizationId: user.organizationId });

  // Q&A
  can('create', 'QAItem');
  can('read', 'QAItem'); // Public Q&A
  can('update', 'QAItem', { 'listing.organizationId': user.organizationId });

  if (user.role === 'ADMIN' || user.role === 'OWNER') {
    // Admins and owners can invite users
    can('create', 'User');
    can('update', 'User', { organizationId: user.organizationId });
    can('delete', 'User', { organizationId: user.organizationId });

    // Can manage organization
    can('update', 'Organization', { id: user.organizationId });

    // Can manage promotions
    can('create', 'Promotion');
    can('read', 'Promotion', { organizationId: user.organizationId });

    // Can manage material identifiers
    can('create', 'MaterialIdentifier');
    can('update', 'MaterialIdentifier');
  }

  if (user.role === 'OWNER') {
    // Owners have full control over their organization
    can('delete', 'Organization', { id: user.organizationId });
    can('manage', 'Subscription', { organizationId: user.organizationId });

    // Cannot delete themselves if they're the only owner
    cannot('delete', 'User', { id: user.id, role: 'OWNER' });
  }

  // Global restrictions
  cannot('read', 'User', ['email', 'phone']); // Personal contact info stays private
  cannot('update', 'Offer', { state: { $in: ['ACCEPTED', 'REJECTED', 'SUPERSEDED', 'EXPIRED'] } });

  return build();
}

export function checkAbility(ability: AppAbility, action: string, subject: string | Subject, field?: string) {
  return ability.can(action, subject, field);
}

export function requireAbility(ability: AppAbility, action: string, subject: string | Subject, field?: string) {
  if (!checkAbility(ability, action, subject, field)) {
    throw new Error(`Insufficient permissions for ${action} on ${typeof subject === 'string' ? subject : subject.__typename}`);
  }
}