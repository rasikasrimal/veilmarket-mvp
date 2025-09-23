import { z } from 'zod';
import { router, publicProcedure } from './trpc';
import { db } from '@veilmarket/db/client';

export const appRouter = router({
  // Health check
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Get all organizations (with privacy - only handles)
  organizations: publicProcedure.query(async () => {
    const { rows } = await db.query(`
      SELECT id, handle, tier, created_at
      FROM organizations 
      WHERE is_verified = true
      ORDER BY created_at DESC
    `);
    return rows;
  }),

  // Get all listings with privacy masking
  listings: publicProcedure
    .input(z.object({
      type: z.enum(['SELL', 'BUY_REQUEST']).optional(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ input }) => {
      const typeFilter = input.type ? `AND l.type = $1` : '';
      const params = input.type ? [input.type] : [];
      
      const { rows } = await db.query(`
        SELECT 
          l.id,
          l.title,
          l.description,
          l.type,
          l.quantity,
          l.unit,
          l.location,
          l.published_at,
          o.handle as organization_handle,
          o.tier as organization_tier,
          mi.scheme as material_scheme,
          mi.value as material_value,
          mi.description as material_description
        FROM listings l
        JOIN organizations o ON l.organization_id = o.id
        JOIN material_identifiers mi ON l.material_identifier_id = mi.id
        WHERE l.published_at IS NOT NULL 
        AND l.is_active = true
        ${typeFilter}
        ORDER BY l.published_at DESC
        LIMIT ${input.limit}
      `, params);
      return rows;
    }),

  // Get listing details
  listing: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { rows } = await db.query(`
        SELECT 
          l.id,
          l.title,
          l.description,
          l.type,
          l.quantity,
          l.unit,
          l.location,
          l.published_at,
          l.created_at,
          o.handle as organization_handle,
          o.tier as organization_tier,
          mi.scheme as material_scheme,
          mi.value as material_value,
          mi.description as material_description
        FROM listings l
        JOIN organizations o ON l.organization_id = o.id
        JOIN material_identifiers mi ON l.material_identifier_id = mi.id
        WHERE l.id = $1 AND l.published_at IS NOT NULL AND l.is_active = true
      `, [input.id]);
      
      if (rows.length === 0) {
        throw new Error('Listing not found');
      }
      
      return rows[0];
    }),

  // Get material identifiers
  materialIdentifiers: publicProcedure.query(async () => {
    const { rows } = await db.query(`
      SELECT id, scheme, value, description
      FROM material_identifiers 
      WHERE is_active = true
      ORDER BY scheme, value
    `);
    return rows;
  }),

  // Get offers for a listing (placeholder - would require auth)
  offers: publicProcedure
    .input(z.object({ listingId: z.string() }))
    .query(async ({ input }) => {
      // This would normally require authentication to see offers
      // For now, return a placeholder
      return {
        message: 'Authentication required to view offers',
        listingId: input.listingId,
      };
    }),
});

export type AppRouter = typeof appRouter;