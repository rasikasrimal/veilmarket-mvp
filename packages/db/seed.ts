import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

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
      description: 'Ethanol',
    },
  });

  const eNumberIdentifier = await prisma.materialIdentifier.upsert({
    where: { scheme_value: { scheme: 'EC_NUMBER', value: 'E330' } },
    update: {},
    create: {
      scheme: 'EC_NUMBER',
      value: 'E330',
      description: 'Citric acid',
    },
  });

  // Create organizations
  const acmeOrg = await prisma.organization.upsert({
    where: { handle: 'acme-ingredients-xyz' },
    update: {},
    create: {
      handle: 'acme-ingredients-xyz',
      legalName: 'Acme Ingredients Corp',
      website: 'https://acme-ingredients.example.com',
      country: 'US',
      tier: 'PREMIUM',
      isVerified: true,
    },
  });

  const brightChemOrg = await prisma.organization.upsert({
    where: { handle: 'brightchem-abc' },
    update: {},
    create: {
      handle: 'brightchem-abc',
      legalName: 'BrightChem Solutions',
      website: 'https://brightchem.example.com',
      country: 'DE',
      tier: 'FREE',
      isVerified: true,
    },
  });

  // Create premium subscription for Acme
  await prisma.subscription.upsert({
    where: { organizationId: acmeOrg.id },
    update: {},
    create: {
      organizationId: acmeOrg.id,
      tier: 'PREMIUM',
      renewalAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
  });

  // Create users
  const acmeOwner = await prisma.user.upsert({
    where: { email: 'owner@acme.example.com' },
    update: {},
    create: {
      email: 'owner@acme.example.com',
      firstName: 'John',
      lastName: 'Smith',
      role: 'OWNER',
      organizationId: acmeOrg.id,
    },
  });

  const acmeAdmin = await prisma.user.upsert({
    where: { email: 'admin@acme.example.com' },
    update: {},
    create: {
      email: 'admin@acme.example.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'ADMIN',
      organizationId: acmeOrg.id,
    },
  });

  const brightChemOwner = await prisma.user.upsert({
    where: { email: 'owner@brightchem.example.com' },
    update: {},
    create: {
      email: 'owner@brightchem.example.com',
      firstName: 'Klaus',
      lastName: 'Mueller',
      role: 'OWNER',
      organizationId: brightChemOrg.id,
    },
  });

  // Create listings
  const sellListing = await prisma.listing.upsert({
    where: { id: 'sell-listing-1' },
    update: {},
    create: {
      id: 'sell-listing-1',
      title: 'High-Quality Ethanol - Food Grade',
      description: 'Premium food-grade ethanol suitable for pharmaceutical and food applications. 99.5% purity guaranteed. Available in bulk quantities with flexible delivery options.',
      type: 'SELL',
      materialIdentifierId: casIdentifier.id,
      quantity: '10000',
      unit: 'L',
      location: 'Texas, USA',
      publishedAt: new Date(),
      organizationId: acmeOrg.id,
      createdById: acmeOwner.id,
    },
  });

  const buyListing = await prisma.listing.upsert({
    where: { id: 'buy-listing-1' },
    update: {},
    create: {
      id: 'buy-listing-1',
      title: 'Seeking Citric Acid - USP Grade',
      description: 'Looking for high-quality citric acid meeting USP standards for pharmaceutical formulations. Need consistent monthly supply of 5000kg minimum.',
      type: 'BUY_REQUEST',
      materialIdentifierId: eNumberIdentifier.id,
      quantity: '5000',
      unit: 'kg',
      location: 'Berlin, Germany',
      publishedAt: new Date(),
      organizationId: brightChemOrg.id,
      createdById: brightChemOwner.id,
    },
  });

  // Create offer thread and offers
  const offerThread = await prisma.offerThread.create({
    data: {
      listingId: sellListing.id,
    },
  });

  const initialOffer = await prisma.offer.create({
    data: {
      threadId: offerThread.id,
      organizationId: brightChemOrg.id,
      state: 'OPEN',
      price: 2.50,
      quantity: '1000 L',
      terms: 'Payment: 30 days net',
      message: 'We are interested in a trial order of 1000L. Could you provide a sample?',
    },
  });

  // Create a promotion (5 days from now)
  await prisma.promotion.create({
    data: {
      listingId: sellListing.id,
      organizationId: acmeOrg.id,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  // Create sample notifications
  await prisma.notification.create({
    data: {
      userId: acmeOwner.id,
      organizationId: acmeOrg.id,
      type: 'OFFER_RECEIVED',
      title: 'New Offer Received',
      message: 'BrightChem has made an offer on your Ethanol listing',
      payload: { offerId: initialOffer.id, listingId: sellListing.id },
    },
  });

  await prisma.notification.create({
    data: {
      userId: brightChemOwner.id,
      organizationId: brightChemOrg.id,
      type: 'LISTING_PROMOTED',
      title: 'Listing Promoted',
      message: 'Your Citric Acid listing is now promoted for 5 days',
      payload: { listingId: buyListing.id },
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📧 Demo credentials:');
  console.log('Acme Ingredients (PREMIUM):');
  console.log('  Owner: owner@acme.example.com');
  console.log('  Admin: admin@acme.example.com');
  console.log('\nBrightChem (FREE):');
  console.log('  Owner: owner@brightchem.example.com');
  console.log('\n🔗 Sample data:');
  console.log(`  Sell Listing: ${sellListing.id}`);
  console.log(`  Buy Request: ${buyListing.id}`);
  console.log(`  Offer Thread: ${offerThread.id}`);
  console.log(`  Initial Offer: ${initialOffer.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });