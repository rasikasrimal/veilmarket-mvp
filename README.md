# VeilMarket (Privacy-First B2B Ingredients Marketplace · MVP)

> **Next.js + TypeScript + Node + Postgres** · Identities stay private until an offer is accepted.  
> Phase 1 foundation: orgs & RBAC, listings & docs with watermarked previews + masking, offers engine with strict "latest-offer-only" integrity, search/filters, premium early access, promoted placements (Stripe), notifications, seeds, tests, and staging deploy.

---

## TL;DR

```bash
# 1) Clone & bootstrap
pnpm i

# 2) Bring up local deps (Postgres, MinIO, Mailpit)
docker compose up -d

# 3) Create env files from samples
cp apps/web/.env.local.sample apps/web/.env.local
cp apps/api/.env.sample apps/api/.env
cp infra/local/.env.sample infra/local/.env

# 4) Generate DB & seed
pnpm db:migrate
pnpm db:seed

# 5) Run everything
pnpm dev
```

---

## Scope ↔ Deliverables map

* **Foundation & Auth**: Organizations, user seats, roles/permissions (RBAC), email invite flow, basic company verification, admin skeleton.
* **Listings & Documents**: Standardized **material identifiers** enforced; secure S3-compatible uploads; watermarked previews; **auto-mask** visible emails/phones.
* **Offers Engine (core)**: Accept / reject / counter; **only the latest open offer is acceptable**; acceptance reveals *company* identity only (no personal contact leakage).
* **Search & Filters**: Fast search by precise identifiers; paginated lists; detail pages + Q\&A.
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

## Data model (Prisma excerpt)

> Full schema lives in `packages/db/schema.prisma`. Highlights:

* **Organization**: `id`, `name`, `slug`, `verified_status`, `tier` (`FREE|PREMIUM`)
* **User**: `id`, `email`, `name`, `avatar`, `orgMemberships[]`
* **Seat**: junction with `role` (`OWNER|ADMIN|MEMBER|VIEWER`)
* **MaterialIdentifier**: `id`, `scheme` (e.g., CAS#, E-number), `value` (unique per scheme)
* **Listing**: `id`, `orgId`, `materialIdentifierId`, `type` (`SELL|BUY_REQ`), `title`, `specs`, `status`
* **Document**: `id`, `listingId`, `key_original`, `key_preview`, `masked` (bool), `checksum`
* **OfferThread**: `id`, `listingId`, `buyerOrgId`, `sellerOrgId`
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

* In-app (Notification table) + email via SendGrid/Mailgun.
* Events: `OFFER_CREATED`, `OFFER_COUNTERED`, `OFFER_ACCEPTED`, `OFFER_REJECTED`.
* Batched email digests optional; transactional for offer actions is immediate.

---

## RBAC

Roles per Seat: `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`.

* **Publish listing**: `ADMIN|MEMBER` of the org.
* **Invite seats**: `OWNER|ADMIN`.
* **View masked previews**: all signed-in; originals only post-acceptance and scoped to the two orgs.
* **Admin skeleton**: site-wide moderation & company verification tools (feature-flagged).

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

Copy from samples and fill values:

`apps/api/.env.sample`

```
# Core
NODE_ENV=development
PORT=4000
APP_URL=http://localhost:3000
API_URL=http://localhost:4000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/veilmarket

# Auth
NEXTAUTH_SECRET=changeme
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=changeme

# Storage (MinIO local; S3 in prod)
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET_ORIGINALS=veil-originals
S3_BUCKET_PREVIEWS=veil-previews

# Email
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=changeme
MAIL_FROM="VeilMarket <noreply@veil.example>"

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PRICE_PROMOTION=price_xxx
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

* **Postgres** on 5432
* **MinIO (S3)** on 9000/9001
* **Mailpit** (email sandbox) on 8025/8026

`infra/local/docker-compose.yml` (provided in repo)

### Commands

```bash
# Migrations & DB
pnpm db:generate   # prisma generate
pnpm db:migrate    # prisma migrate dev
pnpm db:reset      # reset & migrate
pnpm db:seed       # seed demo data (orgs, listings, offers)

# Dev servers
pnpm dev           # api + web concurrently
pnpm dev:web
pnpm dev:api

# Tests
pnpm test          # unit & integration (Vitest)
pnpm test:e2e      # Playwright

# Lint & typecheck
pnpm lint
pnpm typecheck
```

---

## Seeding

`pnpm db:seed` creates:

* **Orgs**: `Acme Ingredients (PREMIUM)`, `BrightChem (FREE)`
* **Users**: demo owner/admin/member seats
* **Identifiers**: example CAS#/E-numbers
* **Listings**: SELL and BUY\_REQ
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

* GitHub Actions workflow: on `main`, build Docker images, run DB migrations, deploy API + Web to the staging environment.
* Script: `infra/deploy/staging.sh` expects:

  * `DATABASE_URL` to managed Postgres (e.g., RDS/Azure PG/Flexible Server/Cloud SQL)
  * `S3_*` to real S3 (or compatible) + buckets pre-created
  * `SENDGRID_API_KEY` or `MAILGUN_*`
  * `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
* On deploy success, workflow posts the staging URL and a **one-click update** link in the run summary.

---

## Production-readiness checklist (Phase 1)

* [ ] Secrets in managed vault (AWS Secrets Manager/Azure KV/GCP SM)
* [ ] DB: automated backups, PITR, connection pooling (pgBouncer/Neon pooling)
* [ ] HTTPS (TLS termination) + HSTS
* [ ] CORS & CSRF correct; session hardening
* [ ] S3 bucket policies: private by default; previews via short-lived signed URLs
* [ ] Stripe webhooks verified + retries handled idempotently
* [ ] Email DMARC/SPF/DKIM configured
* [ ] Logging: structured (`pino`), request IDs; basic metrics, error alerting (Sentry/OTel -> Grafana)
* [ ] DPA/NDA templates stored; basic audit log for sensitive actions
* [ ] Access review: admin endpoints behind feature flag and RBAC checks
* [ ] Load test smoke on search & offers flows

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
* Q\&A visibility rules (public vs. reveal-gated)?
* Staging cloud preference (AWS/Azure/GCP) and region?
* Any brand/legal copy for watermark text?

---

## License

Commercial. All rights reserved. (Can switch to a custom license once contract is signed.)

---

## Credits

Built with ❤️ on Next.js, Fastify, Prisma, Postgres, and Stripe.