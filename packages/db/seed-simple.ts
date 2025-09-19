import { db } from './client';
import { nanoid } from 'nanoid';

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // Create material identifiers
    const casId = `mid_${nanoid(24)}`;
    const eNumberId = `mid_${nanoid(24)}`;

    await db.query(`
      INSERT INTO material_identifiers (id, scheme, value, description) 
      VALUES ($1, 'CAS', '64-17-5', 'Ethanol')
      ON CONFLICT (scheme, value) DO NOTHING
    `, [casId]);

    await db.query(`
      INSERT INTO material_identifiers (id, scheme, value, description) 
      VALUES ($1, 'EC_NUMBER', 'E330', 'Citric acid')
      ON CONFLICT (scheme, value) DO NOTHING
    `, [eNumberId]);

    // Get the actual identifiers (in case they already existed)
    const { rows: identifiers } = await db.query(`
      SELECT id, scheme, value FROM material_identifiers 
      WHERE (scheme = 'CAS' AND value = '64-17-5') OR (scheme = 'EC_NUMBER' AND value = 'E330')
    `);

    const casIdentifier = identifiers.find(i => i.scheme === 'CAS');
    const eNumberIdentifier = identifiers.find(i => i.scheme === 'EC_NUMBER');

    // Create organizations
    const acmeOrgId = `org_${nanoid(24)}`;
    const brightChemOrgId = `org_${nanoid(24)}`;

    await db.query(`
      INSERT INTO organizations (id, handle, legal_name, website, country, tier, is_verified) 
      VALUES ($1, 'acme-ingredients-xyz', 'Acme Ingredients Corp', 'https://acme-ingredients.example.com', 'US', 'PREMIUM', true)
      ON CONFLICT (handle) DO NOTHING
    `, [acmeOrgId]);

    await db.query(`
      INSERT INTO organizations (id, handle, legal_name, website, country, tier, is_verified) 
      VALUES ($1, 'brightchem-abc', 'BrightChem Solutions', 'https://brightchem.example.com', 'DE', 'FREE', true)
      ON CONFLICT (handle) DO NOTHING
    `, [brightChemOrgId]);

    // Get the actual organizations
    const { rows: orgs } = await db.query(`
      SELECT id, handle FROM organizations 
      WHERE handle IN ('acme-ingredients-xyz', 'brightchem-abc')
    `);

    const acmeOrg = orgs.find(o => o.handle === 'acme-ingredients-xyz');
    const brightChemOrg = orgs.find(o => o.handle === 'brightchem-abc');

    // Create users
    const acmeOwnerId = `usr_${nanoid(24)}`;
    const acmeAdminId = `usr_${nanoid(24)}`;
    const brightChemOwnerId = `usr_${nanoid(24)}`;

    await db.query(`
      INSERT INTO users (id, email, first_name, last_name, role, organization_id) 
      VALUES ($1, 'owner@acme.example.com', 'John', 'Smith', 'OWNER', $2)
      ON CONFLICT (email) DO NOTHING
    `, [acmeOwnerId, acmeOrg.id]);

    await db.query(`
      INSERT INTO users (id, email, first_name, last_name, role, organization_id) 
      VALUES ($1, 'admin@acme.example.com', 'Sarah', 'Johnson', 'ADMIN', $2)
      ON CONFLICT (email) DO NOTHING
    `, [acmeAdminId, acmeOrg.id]);

    await db.query(`
      INSERT INTO users (id, email, first_name, last_name, role, organization_id) 
      VALUES ($1, 'owner@brightchem.example.com', 'Klaus', 'Mueller', 'OWNER', $2)
      ON CONFLICT (email) DO NOTHING
    `, [brightChemOwnerId, brightChemOrg.id]);

    // Get the actual users
    const { rows: users } = await db.query(`
      SELECT id, email FROM users 
      WHERE email IN ('owner@acme.example.com', 'owner@brightchem.example.com')
    `);

    const acmeOwner = users.find(u => u.email === 'owner@acme.example.com');
    const brightChemOwner = users.find(u => u.email === 'owner@brightchem.example.com');

    // Create listings
    const sellListingId = `lst_${nanoid(24)}`;
    const buyListingId = `lst_${nanoid(24)}`;

    await db.query(`
      INSERT INTO listings (id, title, description, type, material_identifier_id, quantity, unit, location, published_at, organization_id, created_by_id) 
      VALUES ($1, 'High-Quality Ethanol - Food Grade', 
              'Premium food-grade ethanol suitable for pharmaceutical and food applications. 99.5% purity guaranteed. Available in bulk quantities with flexible delivery options.',
              'SELL', $2, '10000', 'L', 'Texas, USA', NOW(), $3, $4)
    `, [sellListingId, casIdentifier.id, acmeOrg.id, acmeOwner.id]);

    await db.query(`
      INSERT INTO listings (id, title, description, type, material_identifier_id, quantity, unit, location, published_at, organization_id, created_by_id) 
      VALUES ($1, 'Seeking Citric Acid - USP Grade',
              'Looking for high-quality citric acid meeting USP standards for pharmaceutical formulations. Need consistent monthly supply of 5000kg minimum.',
              'BUY_REQUEST', $2, '5000', 'kg', 'Berlin, Germany', NOW(), $3, $4)
    `, [buyListingId, eNumberIdentifier.id, brightChemOrg.id, brightChemOwner.id]);

    // Create offer thread and offer
    const offerThreadId = `thr_${nanoid(24)}`;
    const initialOfferId = `off_${nanoid(24)}`;

    await db.query(`
      INSERT INTO offer_threads (id, listing_id) VALUES ($1, $2)
    `, [offerThreadId, sellListingId]);

    await db.query(`
      INSERT INTO offers (id, thread_id, organization_id, state, price, quantity, terms, message) 
      VALUES ($1, $2, $3, 'OPEN', 2.50, '1000 L', 'Payment: 30 days net', 'We are interested in a trial order of 1000L. Could you provide a sample?')
    `, [initialOfferId, offerThreadId, brightChemOrg.id]);

    // Create sample notifications
    const notificationId1 = `not_${nanoid(24)}`;
    const notificationId2 = `not_${nanoid(24)}`;

    await db.query(`
      INSERT INTO notifications (id, user_id, organization_id, type, title, message, payload) 
      VALUES ($1, $2, $3, 'OFFER_RECEIVED', 'New Offer Received', 'BrightChem has made an offer on your Ethanol listing', $4)
    `, [notificationId1, acmeOwner.id, acmeOrg.id, JSON.stringify({ offerId: initialOfferId, listingId: sellListingId })]);

    await db.query(`
      INSERT INTO notifications (id, user_id, organization_id, type, title, message, payload) 
      VALUES ($1, $2, $3, 'LISTING_PROMOTED', 'Listing Promoted', 'Your Citric Acid listing is now promoted for 5 days', $4)
    `, [notificationId2, brightChemOwner.id, brightChemOrg.id, JSON.stringify({ listingId: buyListingId })]);

    console.log('✅ Database seeded successfully!');
    console.log('\n📧 Demo credentials:');
    console.log('Acme Ingredients (PREMIUM):');
    console.log('  Owner: owner@acme.example.com');
    console.log('  Admin: admin@acme.example.com');
    console.log('\nBrightChem (FREE):');
    console.log('  Owner: owner@brightchem.example.com');
    console.log('\n🔗 Sample data:');
    console.log(`  Sell Listing: ${sellListingId}`);
    console.log(`  Buy Request: ${buyListingId}`);
    console.log(`  Offer Thread: ${offerThreadId}`);
    console.log(`  Initial Offer: ${initialOfferId}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await db.end();
  }
}

main();