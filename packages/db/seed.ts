import { PrismaClient } from './generated/client';
import { OrganizationTier, SeatRole, ListingType, ListingStatus, OfferState } from '@veilmarket/core';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create material identifiers
  const casIdentifier = await prisma.materialIdentifier.upsert({
    where: { scheme_value: { scheme: 'CAS', value: '64-17-5' } },
    update: {},
    create: {
      scheme: 'CAS',
      value: '64-17-5',
      name: 'Ethanol',
    },
  });

  const eNumberIdentifier = await prisma.materialIdentifier.upsert({
    where: { scheme_value: { scheme: 'E-number', value: 'E200' } },
    update: {},
    create: {
      scheme: 'E-number',
      value: 'E200',
      name: 'Sorbic acid',
    },
  });

  // Create organizations
  const acmeOrg = await prisma.organization.upsert({
    where: { slug: 'acme-ingredients' },
    update: {},
    create: {
      name: 'Acme Ingredients',
      slug: 'acme-ingredients',
      legalName: 'Acme Ingredients Ltd.',
      website: 'https://acme-ingredients.com',
      country: 'US',
      description: 'Leading supplier of industrial chemicals and food additives',
      tier: OrganizationTier.PREMIUM,
      verifiedStatus: 'VERIFIED',
    },
  });

  const brightChemOrg = await prisma.organization.upsert({
    where: { slug: 'brightchem' },
    update: {},
    create: {
      name: 'BrightChem',
      slug: 'brightchem',
      legalName: 'BrightChem Solutions Inc.',
      website: 'https://brightchem.com',
      country: 'DE',
      description: 'Specialty chemicals manufacturer and distributor',
      tier: OrganizationTier.FREE,
      verifiedStatus: 'VERIFIED',
    },
  });

  // Create users
  const johnUser = await prisma.user.upsert({
    where: { email: 'john@acme-ingredients.com' },
    update: {},
    create: {
      email: 'john@acme-ingredients.com',
      name: 'John Smith',
      emailVerified: new Date(),
    },
  });

  const sarahUser = await prisma.user.upsert({
    where: { email: 'sarah@brightchem.com' },
    update: {},
    create: {
      email: 'sarah@brightchem.com',
      name: 'Sarah Johnson',
      emailVerified: new Date(),
    },
  });

  // Create seats (org memberships)
  await prisma.seat.upsert({
    where: { userId_orgId: { userId: johnUser.id, orgId: acmeOrg.id } },
    update: {},
    create: {
      userId: johnUser.id,
      orgId: acmeOrg.id,
      role: SeatRole.OWNER,
    },
  });

  await prisma.seat.upsert({
    where: { userId_orgId: { userId: sarahUser.id, orgId: brightChemOrg.id } },
    update: {},
    create: {
      userId: sarahUser.id,
      orgId: brightChemOrg.id,
      role: SeatRole.ADMIN,
    },
  });

  // Create listings
  const ethanolListing = await prisma.listing.create({
    data: {
      title: 'Industrial Grade Ethanol - 99.9% Purity',
      description: 'High-quality industrial ethanol suitable for pharmaceutical and chemical applications.',
      type: ListingType.SELL,
      status: ListingStatus.PUBLISHED,
      quantity: '1000',
      unit: 'L',
      priceIndicative: '$2.50/L',
      location: 'Houston, TX',
      orgId: acmeOrg.id,
      materialIdentifierId: casIdentifier.id,
      publishedAt: new Date(),
      specs: {
        purity: '99.9%',
        grade: 'Industrial',
        packaging: 'IBC containers',
        certifications: ['ISO 9001', 'GMP'],
      },
    },
  });

  const sorbicAcidListing = await prisma.listing.create({
    data: {
      title: 'Food Grade Sorbic Acid - Preservative',
      description: 'High-quality sorbic acid for food preservation applications.',
      type: ListingType.BUY_REQ,
      status: ListingStatus.PUBLISHED,
      quantity: '500',
      unit: 'kg',
      priceIndicative: 'Market price',
      location: 'Berlin, Germany',
      orgId: brightChemOrg.id,
      materialIdentifierId: eNumberIdentifier.id,
      publishedAt: new Date(),
      specs: {
        grade: 'Food Grade',
        packaging: '25kg bags',
        certifications: ['EU regulation compliant'],
      },
    },
  });

  // Create offer thread and offers
  const offerThread = await prisma.offerThread.create({
    data: {
      listingId: ethanolListing.id,
      buyerOrgId: brightChemOrg.id,
      sellerOrgId: acmeOrg.id,
    },
  });

  const initialOffer = await prisma.offer.create({
    data: {
      threadId: offerThread.id,
      state: OfferState.OPEN,
      price: 2.30,
      quantity: '500',
      unit: 'L',
      terms: 'Payment within 30 days, FOB Houston',
      message: 'We are interested in a smaller quantity for initial testing.',
    },
  });

  // Create a promotion (pinned listing)
  await prisma.promotion.create({
    data: {
      listingId: ethanolListing.id,
      amount: 99.99,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    },
  });

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: johnUser.id,
      type: 'OFFER_CREATED',
      title: 'New offer received',
      message: 'BrightChem has made an offer on your ethanol listing',
      payload: {
        offerId: initialOffer.id,
        listingId: ethanolListing.id,
      },
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('🏢 Organizations created:');
  console.log(`  - ${acmeOrg.name} (${acmeOrg.tier}) - ${acmeOrg.slug}`);
  console.log(`  - ${brightChemOrg.name} (${brightChemOrg.tier}) - ${brightChemOrg.slug}`);
  console.log('');
  console.log('👥 Users created:');
  console.log(`  - ${johnUser.email} (${acmeOrg.name} Owner)`);
  console.log(`  - ${sarahUser.email} (${brightChemOrg.name} Admin)`);
  console.log('');
  console.log('📦 Listings created:');
  console.log(`  - ${ethanolListing.title}`);
  console.log(`  - ${sorbicAcidListing.title}`);
  console.log('');
  console.log('💰 Offers created:');
  console.log(`  - Initial offer: $${initialOffer.price}/L for ${initialOffer.quantity}L`);
  console.log('');
  console.log('🎯 Promoted listing expires in 5 days');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });