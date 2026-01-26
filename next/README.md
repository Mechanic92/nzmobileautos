# Mobile Autoworks NZ (Next.js)

This folder contains the production Next.js 15 App Router application.

## Local dev

1) Install deps (repo uses pnpm)

2) Copy env:

- Copy `.env.example` to `.env.local` and fill values.

### DEV_NO_DB mode (no database)

If you want to run the app without Postgres/Prisma for now:

- Set `DEV_NO_DB=true`
- Do NOT set `DATABASE_URL`

In this mode:

- Bookings are stored in-memory (reset on server restart)
- Stripe Checkout is bypassed (you are redirected to `/checkout/success`)
- Resend is optional (emails are logged to the server console if `RESEND_API_KEY` is missing)

3) Prisma

- If using Postgres:

  - `pnpm db:generate`
  - `pnpm db:migrate`

- If using DEV_NO_DB: skip Prisma commands.

4) Run

- `pnpm dev`

## Production (Vercel + Neon + Prisma) runbook

### Required environment variables

Set these in **Vercel** for **Production** and **Preview** (and optionally Development):

- `DATABASE_URL`
  - Must be the **Neon pooled** connection string for serverless.
  - This is the value Prisma uses at runtime.
- `DIRECT_URL`
  - Must be the **Neon direct** (non-pooled) connection string.
  - This is used for migrations.
- `APP_URL`
  - Public base URL (example: `https://nzmobileauto.vercel.app`).
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `BUSINESS_EMAIL`
  - Where booking confirmations / fallback booking requests / orphan-payment alerts are sent.
- Email provider config (one of the following):
  - `RESEND_API_KEY` + `EMAIL_FROM`
  - or SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`

Notes:

- Prisma schema is configured to support both `DATABASE_URL` and `DIRECT_URL`.
- For Neon, **pooled** is recommended for serverless runtimes to reduce connection churn.

### Health check

Use:

- `GET /api/health`

It returns:

- `db.ok` + `db.latencyMs`
- `stripeConfigured`, `stripeWebhookConfigured`
- `envOk`

### Degraded mode behavior

If the database is unreachable (Neon paused/sleeping, bad URL, transient network failure):

- Booking create returns `503` with JSON `{ degraded: true, ... }`.
- The booking UI shows a friendly banner and:
  - Call/Text CTA
  - “Send booking request” button which posts to `/api/bookings/fallback` (email-based, no DB).
- Stripe payment is **blocked** when DB is unhealthy (prevents orphan charges).

### Stripe flow correctness

- Booking is persisted first as `PENDING_PAYMENT`.
- Checkout Session is created with `metadata.bookingId`.
- Webhook `checkout.session.completed` marks booking `CONFIRMED`.
- Webhook returns `503` when DB is unavailable so Stripe retries.
- Webhook is idempotent via `IdempotencyKey` table.

### Migrations

Run migrations against the direct connection string:

- Ensure `DIRECT_URL` is set
- `pnpm db:generate`
- `pnpm db:migrate`

### End-to-end test plan

1) **DB up**:
   - Create booking on `/book/diagnostics`
   - Redirect to Stripe Checkout
   - Complete payment
   - Webhook receives `checkout.session.completed`
   - Booking status becomes `CONFIRMED`

2) **DB down** (simulate by pausing Neon or using an invalid `DATABASE_URL` in Preview):
   - Booking page does not crash
   - API returns degraded response (503)
   - Payment is unavailable
   - Fallback “Send booking request” succeeds (sends business email)

3) **Webhook duplicate**:
   - Re-send same Stripe event
   - Webhook responds `{ duplicate: true }` and does not double-update

## Stripe webhook

Create a webhook endpoint in Stripe pointing to:

- `${APP_URL}/api/stripe/webhook`

Enable at least:

- `checkout.session.completed`

Set `STRIPE_WEBHOOK_SECRET` from Stripe.

## Notes

- MotorWeb integration is behind `FEATURE_MOTORWEB`.
- Report PDFs and photos are intended to be stored in Cloudflare R2.
