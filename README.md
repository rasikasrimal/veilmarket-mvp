# VeilMarket (Privacy-First B2B Ingredients Marketplace · MVP)

> **Next.js + TypeScript + Node + Postgres** · Identities stay private until an offer is accepted.  
> Phase 1 foundation: orgs & RBAC, listings & docs with watermarked previews + masking, offers engine with strict "latest-offer-only" integrity, search/filters, premium early access, promoted placements (Stripe), notifications, seeds, tests, and staging deploy.

---

## TL;DR

```bash
# 1) Clone & bootstrap
pnpm i

# 2) Bring up local deps (Postgres, MinIO, Mailpit)
cd infra/local && docker compose up -d

# 3) Create env files from samples
cp apps/web/.env.local.sample apps/web/.env.local
cp apps/api/.env.sample apps/api/.env

# 4) Database setup
cd packages/db && pnpm db:migrate && pnpm db:seed

# 5) Start dev servers
pnpm dev
```

Browse to `http://localhost:3000` for web, `http://localhost:4000` for API.

---

## Architecture overview

```
apps/
  web/        # Next.js front-end (App Router)
  api/        # Fastify API (tRPC + REST adaptors), Stripe webhooks, workers
packages/
  db/         # Prisma schema, migrations, seeders
  core/       # Domain models, RBAC policies, validators (Zod), shared types
  email/      # Email templates + sender
  ui/         # Shared UI components (design system)
infra/
  local/      # docker-compose, MinIO, Mailpit, scripts
  deploy/     # staging one-click script, IaC stubs (Terraform optional)
```

### Key flows

* **Identity veil**: Public pages show anonymized org handles and generic avatars. On **offer acceptance**, system reveals *only* company profile (legal name, website), **never** personal emails/phones.
* **Document pipeline**: Originals go to a private bucket. A worker generates:

  * Watermarked preview (listing ID, timestamp, "VeilMarket").
  * **Auto-mask** email/phone in preview with high-precision regex + heuristics; originals remain untouched.
* **Offers integrity**: An offer thread enforces *single open* invariant. Only the most recent **OPEN** offer can transition to **ACCEPTED**.

---

## Scope ↔ Deliverables map

* **Foundation & Auth**: Organizations, user seats, roles/permissions (RBAC), email invite flow, basic company verification, admin skeleton.
* **Listings & Documents**: Standardized **material identifiers** enforced; secure S3-compatible uploads; watermarked previews; **auto-mask** visible emails/phones.
* **Offers Engine (core)**: Accept / reject / counter; **only the latest open offer is acceptable**; acceptance reveals *company* identity only (no personal contact leakage).
* **Search & Filters**: Fast search by precise identifiers; paginated lists; detail pages + Q&A.
* **Premium & Promoted**: 48-hour early access for paid tier; **Stripe Checkout** for promoted placements; promoted items pinned 5 days.
* **Notifications**: In-app + email for offer/counter/accept events.
* **Quality & Ops**: Repo + README/runbook; DB schema & migrations; seed data; tests for core flows; staging deploy with one-click updates; production-readiness checklist.

---

## Tech stack

* **Frontend**: Next.js (App Router) + React + TypeScript, Tailwind, Zod, React Query.
* **API**: Node.js + TypeScript (Fastify), tRPC/REST, Zod validation.
* **DB/ORM**: PostgreSQL + Prisma (migrations & schema).
* **Storage**: S3-compatible (MinIO locally, S3 in prod), signed URLs.
* **Email**: SendGrid or Mailgun (transactional).
* **Payments**: Stripe (promoted placements only).
* **Auth**: NextAuth (Email + OAuth optional) + Org/Seat model, RBAC via CASL (or custom policy gates).
* **Infra**: Docker, GitHub Actions CI, staging on your cloud of choice (AWS/Azure/GCP). Basic metrics/logging via pino, OpenTelemetry hooks ready.

---

## Data model (Prisma excerpt)

* **Organization**: `id`, `handle` (anonymized), `legalName`, `website`, `tier` (`FREE|PREMIUM`)
* **User**: `id`, `email`, `role` (`OWNER|ADMIN|MEMBER`), `organizationId`
* **MaterialIdentifier**: `id`, `scheme` (`CAS|EC_NUMBER|UN_NUMBER|INTERNAL_SKU`), `value`
* **Listing**: `id`, `title`, `type` (`SELL|BUY_REQUEST`), `materialIdentifierId`, `publishedAt`
* **Document**: `id`, `originalPath`, `previewPath`, `hasMaskedContent`
* **OfferThread**: `id`, `listingId`
* **Offer**: `id`, `threadId`, `state` (`OPEN|REJECTED|ACCEPTED|SUPERSEDED|EXPIRED`), `price`, `qty`, `terms`

  * **Constraint**: `unique where (threadId, state='OPEN')` at most one
* **Promotion**: `id`, `listingId`, `purchasedAt`, `expiresAt` (5 days pinned)
* **Subscription**: `orgId`, `tier`, `renewalAt`
* **Notification**: `id`, `userId`, `type`, `payload`, `readAt`
* **QA**: `id`, `listingId`, `authorOrgId`, `question`, `answer`, `visibility`

---

## Offers engine · state model

```
DRAFT -> OPEN -> (COUNTER emits)
               -> REJECTED (terminal)
               -> ACCEPTED (terminal; triggers company identity reveal)
               -> EXPIRED  (terminal based on TTL)

COUNTER RULE:
- Posting a counter creates a new Offer with state=OPEN
- The previous OPEN offer transitions to SUPERSEDED automatically
- Invariant: At most **one** OPEN per thread (DB constraint + transaction)
ACCEPT RULE:
- Only the latest OPEN can be ACCEPTED (guard in transaction; otherwise 409)
```

**Transaction outline** (pseudocode):

```ts
await db.$transaction(async (tx) => {
  const current = await tx.offer.findFirst({ where: { threadId, state: 'OPEN' }, orderBy: { createdAt: 'desc' } });
  if (!current || current.id !== offerId) throw new Conflict('Only the latest open offer can be accepted');
  await tx.offer.update({ where: { id: offerId }, data: { state: 'ACCEPTED' } });
  await tx.offer.updateMany({ where: { threadId, state: 'OPEN', id: { not: offerId } }, data: { state: 'SUPERSEDED' } });
  await revealCompanyIdentity({ threadId, tx });
});
```

---

## Identity reveal flow

1. Buyer accepts latest OPEN offer in thread.
2. Server validates invariant & records **ACCEPTED**.
3. System **reveals org-level profile** (legal name, country, website) to both sides.
4. Personal contact fields remain masked everywhere; messaging continues in-app.
5. Audit log event + notifications (in-app + email).

---

## Document watermark & masking pipeline

* **Upload**: Client obtains signed PUT URL → upload original to `s3://veil-originals/{listing}/{uuid}`.
* **Process** (worker):

  * Virus scan (ClamAV optional).
  * Render preview (PDF → images, images → normalized).
  * Overlay watermark (listing ID + "Confidential · VeilMarket" + date).
  * **Mask**: run regex heuristics for emails/phones; replace with `•••@masked` and `+•••••••••`.
  * Store preview to `s3://veil-previews/{listing}/{uuid}`; mark `masked=true`.
* **Serve**: Public detail page only loads **preview** via short-lived signed GET. Originals require authenticated, role-gated access and are blocked until acceptance.

---

## Search & early access gating

* **Material identifiers**: Create listing requires a valid identifier (`scheme+value` exists). Backend validates; UI blocks publish without it.
* **Search**: Exact match boost on identifiers; Postgres `tsvector` for text; pagination via cursor.
* **Premium**: `PREMIUM` orgs see new listings **48 hours earlier**.

  * Rule: `(now - listing.publishedAt) < 48h` → restrict to `PREMIUM`.
  * Non-premium get results excluding early-access items.

---

## Promoted placements (Stripe)

* Stripe Checkout for a one-off "Promote listing 5 days".
* Webhook (`/webhooks/stripe`) marks `Promotion.expiresAt = purchasedAt + 5d`.
* UI pins promoted listings to the top of search & category pages until expiry.

---

## Notifications

* **In-app**: Real-time feed; mark read/unread; filter by type.
* **Email**: Transactional for key events (offers, acceptance, identity reveal).
* **Types**: `OFFER_RECEIVED`, `OFFER_ACCEPTED`, `OFFER_REJECTED`, `OFFER_COUNTERED`, `LISTING_PROMOTED`, `IDENTITY_REVEALED`, `INVITE_RECEIVED`.

---

## RBAC

```ts
// Owner: full org control, cannot delete self if sole owner
// Admin: invite/manage users, create/edit listings, manage promotions
// Member: create/edit own listings, make offers, view notifications

defineAbilityFor(user) {
  can('read', 'Listing'); // public
  can('create', 'Listing'); 
  can('update', 'Listing', { organizationId: user.organizationId });
  
  if (role === 'ADMIN' || role === 'OWNER') {
    can('create', 'User'); // invite
    can('update', 'User', { organizationId: user.organizationId });
  }
  
  cannot('read', 'User', ['email', 'phone']); // privacy
}
```

---

## API surface (high level)

* `POST /auth/orgs` create org + owner seat
* `POST /auth/invite` invite user to org
* `POST /listings` create (requires valid material identifier)
* `GET /listings` search + filter (premium window gating)
* `POST /uploads/sign` get signed URL (S3 compatible)
* `POST /offers` create/counter (creates/updates thread)
* `POST /offers/:id/accept` accept **only latest OPEN**
* `POST /stripe/checkout` start promoted placement
* `POST /webhooks/stripe` handle success → pin 5 days
* `GET /notifications` in-app feed

All endpoints validated by Zod; errors standardized (`code`, `message`, `fields?`).

---

## Local development

### Prereqs

* Node 20+, pnpm 9+, Docker
* Stripe CLI (for webhook testing, optional)

### Env files

`apps/api/.env.sample`

```
DATABASE_URL=postgresql://veilmarket:veilmarket123@localhost:5432/veilmarket
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=veilmarket
S3_SECRET_KEY=veilmarket123
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Feature flags
FEATURE_ADMIN=true
```

`apps/web/.env.local.sample`

```
NEXT_PUBLIC_APP_NAME=VeilMarket
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Docker compose (local)

```bash
cd infra/local
docker compose up -d
```

Provides: Postgres (`:5432`), MinIO (`:9000`, console `:9001`), Mailpit (`:8025`).

### Commands

```bash
# Install deps
pnpm i

# Database
cd packages/db
pnpm db:migrate  # apply schema
pnpm db:seed     # sample data
pnpm db:studio   # browse data

# Development
pnpm dev         # start all apps in watch mode

# Production build
pnpm build
```

---

## Seeding

`pnpm db:seed` creates:

* **Orgs**: `Acme Ingredients (PREMIUM)`, `BrightChem (FREE)`
* **Users**: demo owner/admin/member seats
* **Identifiers**: example CAS#/E-numbers
* **Listings**: SELL and BUY_REQ
* **Offers**: threads with OPEN + COUNTER states to demo acceptance guard
* **Promotions**: one pinned listing (expires 5 days from seed)

Credentials & sample links are printed to console.

---

## Tests (what we cover in Phase 1)

* **RBAC**: signup → invite → role gating (API + UI guards).
* **Identifiers enforced**: cannot publish listing without valid material identifier.
* **Previews**: watermark present; emails/phones masked in preview.
* **Offers integrity**: only the latest OPEN is acceptable; others 409.
* **Identity reveal**: org identity revealed on acceptance; *no personal contact leakage*.
* **Premium window**: 48-hour gating for non-premium searchers.
* **Promotions**: purchasing pins item for exactly 5 days.
* **Notifications**: events trigger in-app + email.

Run: `pnpm test && pnpm test:e2e`

---

## Staging deployment (one-click)

```bash
cd infra/deploy
./deploy-staging.sh
```

* Provisions cloud infra (DB, storage, app hosting).
* Pushes latest `main`, runs migrations, seeds.
* Outputs staging URL + admin credentials.

Environment variables sourced from `staging.env`. Supports AWS/Azure/GCP.

---

## Production-readiness checklist (Phase 1)

* ✅ **Schema & migrations** solid; constraints enforced.
* ✅ **RBAC & privacy** tested; personal data properly masked.
* ✅ **Offers integrity** with proper transaction isolation.
* ✅ **S3 storage** configured; signed URLs + bucket permissions.
* ✅ **Stripe integration** tested (sandbox); webhook security.
* ✅ **Email delivery** via reliable service (SendGrid/Mailgun).
* ✅ **Error handling** standardized; proper HTTP status codes.
* ✅ **Logging** structured; sensitive data redacted.
* ✅ **Rate limiting** on API endpoints.
* ✅ **DB backups** automated.
* ⏳ **SSL termination** (reverse proxy/CDN).
* ⏳ **Monitoring** hooks (metrics, alerting).

---

## Security & privacy notes

* **Principle of least privilege** across roles, buckets, and DB.
* **No personal emails/phones** shown pre-acceptance; masked in previews and UI.
* Originals stored encrypted at rest; previews are derived assets with watermark + masking.
* All "reveal" actions are **audited**.
* Stripe handled client→Checkout; sensitive PCI data never touches our servers.

---

## Assumptions & open questions

* Identifier schemes in scope for Phase 1? (CAS#, E-number, UN number, internal SKUs?)
* Company verification: what data source (docs upload vs. third-party)?
* Premium definition: org-tier only (no per-seat add-on) for now?
* Q&A visibility rules (public vs. reveal-gated)?
* Staging cloud preference (AWS/Azure/GCP) and region?
* Any brand/legal copy for watermark text?

---

## License

Commercial. All rights reserved. (Can switch to a custom license once contract is signed.)

---

## Credits

Built with ❤️ on Next.js, Fastify, Prisma, Postgres, and Stripe.