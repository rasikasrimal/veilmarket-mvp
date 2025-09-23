import "dotenv/config";
import {
  Prisma,
  PrismaClient,
  IdentifierScheme,
  OrgTier,
  UserRole,
  ListingType,
  OfferState,
  NotificationType,
} from "@prisma/client";

const prisma = new PrismaClient();

type IdentifierSeed = {
  key: string;
  id: string;
  scheme: IdentifierScheme;
  value: string;
  description: string;
};

type OrgSeed = {
  key: string;
  id: string;
  handle: string;
  legalName: string;
  website: string;
  country: string;
  tier: OrgTier;
  isVerified: boolean;
};

type UserSeed = {
  key: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  orgKey: string;
};

type ListingSeed = {
  key: string;
  id: string;
  title: string;
  description: string;
  type: ListingType;
  identifierKey: string;
  quantity: string;
  unit: string;
  location: string;
  orgKey: string;
  createdByKey: string;
};

const identifierSeeds: IdentifierSeed[] = [
  { key: "ethanol", id: "mid_seed_ethanol", scheme: IdentifierScheme.CAS, value: "64-17-5", description: "Ethanol" },
  { key: "citricAcid", id: "mid_seed_citric_acid", scheme: IdentifierScheme.EC_NUMBER, value: "E330", description: "Citric acid" },
  { key: "glycerin", id: "mid_seed_glycerin", scheme: IdentifierScheme.CAS, value: "56-81-5", description: "Glycerin" },
  { key: "lacticAcid", id: "mid_seed_lactic_acid", scheme: IdentifierScheme.CAS, value: "50-21-5", description: "Lactic acid" },
];

const orgSeeds: OrgSeed[] = [
  {
    key: "acme",
    id: "org_seed_acme",
    handle: "acme-ingredients-xyz",
    legalName: "Acme Ingredients Corp",
    website: "https://acme-ingredients.example.com",
    country: "US",
    tier: OrgTier.PREMIUM,
    isVerified: true,
  },
  {
    key: "brightchem",
    id: "org_seed_brightchem",
    handle: "brightchem-abc",
    legalName: "BrightChem Solutions",
    website: "https://brightchem.example.com",
    country: "DE",
    tier: OrgTier.FREE,
    isVerified: true,
  },
];

const userSeeds: UserSeed[] = [
  { key: "acmeOwner", id: "usr_seed_acme_owner", email: "owner@acme.example.com", firstName: "John", lastName: "Smith", role: UserRole.OWNER, orgKey: "acme" },
  { key: "acmeAdmin", id: "usr_seed_acme_admin", email: "admin@acme.example.com", firstName: "Sarah", lastName: "Johnson", role: UserRole.ADMIN, orgKey: "acme" },
  { key: "brightchemOwner", id: "usr_seed_brightchem_owner", email: "owner@brightchem.example.com", firstName: "Klaus", lastName: "Mueller", role: UserRole.OWNER, orgKey: "brightchem" },
];

const listingSeeds: ListingSeed[] = [
  {
    key: "acmeEthanol",
    id: "lst_seed_acme_ethanol",
    title: "High-Quality Ethanol - Food Grade",
    description:
      "Premium food-grade ethanol suitable for pharmaceutical and food applications. 99.5% purity with certificates of analysis on every batch.",
    type: ListingType.SELL,
    identifierKey: "ethanol",
    quantity: "10000",
    unit: "L",
    location: "Houston, Texas, USA",
    orgKey: "acme",
    createdByKey: "acmeOwner",
  },
  {
    key: "acmeGlycerin",
    id: "lst_seed_acme_glycerin",
    title: "Pharma-Grade Glycerin - USP",
    description:
      "USP-grade glycerin produced in ISO-certified facilities. Available in drum and tote sizes with flexible logistics support.",
    type: ListingType.SELL,
    identifierKey: "glycerin",
    quantity: "7500",
    unit: "kg",
    location: "Savannah, Georgia, USA",
    orgKey: "acme",
    createdByKey: "acmeAdmin",
  },
  {
    key: "brightchemCitric",
    id: "lst_seed_brightchem_citric",
    title: "Seeking Citric Acid - USP Grade",
    description:
      "Looking for high-quality citric acid meeting USP standards for pharmaceutical formulations. Need consistent monthly supply of 5000 kg minimum.",
    type: ListingType.BUY_REQUEST,
    identifierKey: "citricAcid",
    quantity: "5000",
    unit: "kg",
    location: "Berlin, Germany",
    orgKey: "brightchem",
    createdByKey: "brightchemOwner",
  },
  {
    key: "brightchemLactic",
    id: "lst_seed_brightchem_lactic",
    title: "Surplus Lactic Acid - Food & Beverage",
    description:
      "Food-grade lactic acid available from recent production run. Ideal for beverage acidification and dairy applications. Ships from Hamburg port.",
    type: ListingType.SELL,
    identifierKey: "lacticAcid",
    quantity: "3200",
    unit: "kg",
    location: "Hamburg, Germany",
    orgKey: "brightchem",
    createdByKey: "brightchemOwner",
  },
];

const OFFER_THREAD_ID = "thr_seed_acme_ethanol";
const OFFER_ID = "off_seed_brightchem_ethanol";
const NOTIFICATION_OFFER = "not_seed_offer_received";
const NOTIFICATION_PROMOTION = "not_seed_listing_promoted";

async function main() {
  console.log("Seeding database with demo data...");

  try {
    const identifierRecords = new Map<string, string>();
    for (const seed of identifierSeeds) {
      const record = await prisma.materialIdentifier.upsert({
        where: { scheme_value: { scheme: seed.scheme, value: seed.value } },
        update: {
          description: seed.description,
        },
        create: {
          id: seed.id,
          scheme: seed.scheme,
          value: seed.value,
          description: seed.description,
        },
      });

      identifierRecords.set(seed.key, record.id);
    }

    const organizationRecords = new Map<string, Awaited<ReturnType<typeof prisma.organization.upsert>>>();
    for (const seed of orgSeeds) {
      const record = await prisma.organization.upsert({
        where: { handle: seed.handle },
        update: {
          legalName: seed.legalName,
          website: seed.website,
          country: seed.country,
          tier: seed.tier,
          isVerified: seed.isVerified,
        },
        create: {
          id: seed.id,
          handle: seed.handle,
          legalName: seed.legalName,
          website: seed.website,
          country: seed.country,
          tier: seed.tier,
          isVerified: seed.isVerified,
        },
      });

      organizationRecords.set(seed.key, record);
    }

    const userRecords = new Map<string, Awaited<ReturnType<typeof prisma.user.upsert>>>();
    for (const seed of userSeeds) {
      const organization = organizationRecords.get(seed.orgKey);
      if (!organization) {
        throw new Error(`Missing organization for user ${seed.email}`);
      }

      const record = await prisma.user.upsert({
        where: { email: seed.email },
        update: {
          firstName: seed.firstName,
          lastName: seed.lastName,
          role: seed.role,
          organizationId: organization.id,
        },
        create: {
          id: seed.id,
          email: seed.email,
          firstName: seed.firstName,
          lastName: seed.lastName,
          role: seed.role,
          organizationId: organization.id,
        },
      });

      userRecords.set(seed.key, record);
    }

    const listingRecords = new Map<string, Awaited<ReturnType<typeof prisma.listing.upsert>>>();
    for (const seed of listingSeeds) {
      const organization = organizationRecords.get(seed.orgKey);
      const createdBy = userRecords.get(seed.createdByKey);
      const identifierId = identifierRecords.get(seed.identifierKey);

      if (!organization || !createdBy || !identifierId) {
        throw new Error(`Missing dependencies for listing ${seed.title}`);
      }

      const record = await prisma.listing.upsert({
        where: { id: seed.id },
        update: {
          title: seed.title,
          description: seed.description,
          type: seed.type,
          materialIdentifierId: identifierId,
          quantity: seed.quantity,
          unit: seed.unit,
          location: seed.location,
          publishedAt: new Date(),
          organizationId: organization.id,
          createdById: createdBy.id,
        },
        create: {
          id: seed.id,
          title: seed.title,
          description: seed.description,
          type: seed.type,
          materialIdentifierId: identifierId,
          quantity: seed.quantity,
          unit: seed.unit,
          location: seed.location,
          publishedAt: new Date(),
          organizationId: organization.id,
          createdById: createdBy.id,
        },
      });

      listingRecords.set(seed.key, record);
    }

    const sellListing = listingRecords.get("acmeEthanol");
    const brightchemOrg = organizationRecords.get("brightchem");

    if (!sellListing || !brightchemOrg) {
      throw new Error("Required records for offer thread are missing.");
    }

    const offerThread = await prisma.offerThread.upsert({
      where: { id: OFFER_THREAD_ID },
      update: {
        listingId: sellListing.id,
      },
      create: {
        id: OFFER_THREAD_ID,
        listingId: sellListing.id,
      },
    });

    await prisma.offer.upsert({
      where: { id: OFFER_ID },
      update: {
        state: OfferState.OPEN,
        price: new Prisma.Decimal("2.50"),
        quantity: "1000 L",
        terms: "Payment: 30 days net",
        message: "We are interested in a trial order of 1000 L. Could you provide a sample?",
        organizationId: brightchemOrg.id,
        threadId: offerThread.id,
      },
      create: {
        id: OFFER_ID,
        state: OfferState.OPEN,
        price: new Prisma.Decimal("2.50"),
        quantity: "1000 L",
        terms: "Payment: 30 days net",
        message: "We are interested in a trial order of 1000 L. Could you provide a sample?",
        organizationId: brightchemOrg.id,
        threadId: offerThread.id,
      },
    });

    const acmeOwner = userRecords.get("acmeOwner");
    const brightchemOwner = userRecords.get("brightchemOwner");

    if (!acmeOwner || !brightchemOwner) {
      throw new Error("Missing users for notification seeding.");
    }

    await prisma.notification.upsert({
      where: { id: NOTIFICATION_OFFER },
      update: {
        userId: acmeOwner.id,
        organizationId: acmeOwner.organizationId,
        type: NotificationType.OFFER_RECEIVED,
        title: "New Offer Received",
        message: "BrightChem has made an offer on your ethanol listing",
        payload: { offerId: OFFER_ID, listingId: sellListing.id },
      },
      create: {
        id: NOTIFICATION_OFFER,
        userId: acmeOwner.id,
        organizationId: acmeOwner.organizationId,
        type: NotificationType.OFFER_RECEIVED,
        title: "New Offer Received",
        message: "BrightChem has made an offer on your ethanol listing",
        payload: { offerId: OFFER_ID, listingId: sellListing.id },
      },
    });

    const lacticListing = listingRecords.get("brightchemLactic");
    if (!lacticListing) {
      throw new Error("Missing lactic acid listing for notification.");
    }

    await prisma.notification.upsert({
      where: { id: NOTIFICATION_PROMOTION },
      update: {
        userId: brightchemOwner.id,
        organizationId: brightchemOwner.organizationId,
        type: NotificationType.LISTING_PROMOTED,
        title: "Listing Promoted",
        message: "Your lactic acid lot is now highlighted to buyers for 5 days",
        payload: { listingId: lacticListing.id },
      },
      create: {
        id: NOTIFICATION_PROMOTION,
        userId: brightchemOwner.id,
        organizationId: brightchemOwner.organizationId,
        type: NotificationType.LISTING_PROMOTED,
        title: "Listing Promoted",
        message: "Your lactic acid lot is now highlighted to buyers for 5 days",
        payload: { listingId: lacticListing.id },
      },
    });

    console.log("Seed completed successfully.");
    console.log("\nDemo organizations:");
    console.log("  Acme Ingredients Corp (PREMIUM)");
    console.log("  BrightChem Solutions (FREE)");
    console.log("\nSample listings:");
    console.log(`  Acme: ${sellListing.id} (Ethanol)`);
    console.log(`  Acme: ${listingRecords.get("acmeGlycerin")?.id ?? "unknown"} (Glycerin)`);
    console.log(`  BrightChem: ${listingRecords.get("brightchemCitric")?.id ?? "unknown"} (Citric Acid Buy Request)`);
    console.log(`  BrightChem: ${lacticListing.id} (Lactic Acid Surplus)`);
  } catch (error) {
    console.error("Seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();