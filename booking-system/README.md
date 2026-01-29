# Mobile Autoworks NZ - Booking System

Production-ready booking and conversion engine for Mobile Autoworks NZ mobile mechanic service.

## Features

- **Instant Vehicle Lookup**: MotorWeb mTLS integration with 90-day caching
- **Band-Based Pricing**: Automatic pricing based on fuel type and engine size
- **Slot-Based Booking**: 30-minute increments, Mon-Fri 9am-5pm
- **Prepayment**: Stripe Checkout with Afterpay support
- **Gearbox Integration**: Automatic job sync to operational system

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  Fastify API    │────▶│   PostgreSQL    │
│   (Frontend)    │     │   (Backend)     │     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
              ┌─────────┐ ┌─────────┐ ┌─────────┐
              │  Redis  │ │MotorWeb │ │ Stripe  │
              │ (Cache) │ │ (mTLS)  │ │(Payment)│
              └─────────┘ └─────────┘ └─────────┘
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- MotorWeb API credentials (client certificate)
- Stripe account

### Installation

```bash
# Clone and install
cd booking-system
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Setup database
npx prisma db push
npx prisma generate

# Start development
npm run dev
```

### Railway Deployment (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and init
railway login
railway init

# Add PostgreSQL and Redis
railway add --plugin postgresql
railway add --plugin redis

# Set environment variables
railway variables set MOTORWEB_CERT_PATH=/app/certs/client.crt
railway variables set MOTORWEB_KEY_PATH=/app/certs/client.key
# ... set other env vars

# Deploy
railway up
```

### Docker Deployment

```bash
# Build and run
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

### Gearbox Integration

The booking system automatically syncs confirmed bookings to Gearbox:

```
POST https://gearbox-workshop-production.up.railway.app/api/public/bookings/ingest
```

Set `GEARBOX_API_KEY` in your environment variables.

## API Endpoints

### Vehicle Lookup

```
POST /api/vehicle/lookup
{
  "plate": "ABC123",
  "email": "user@example.com"
}
```

### Generate Quote

```
POST /api/quote
{
  "vehicle": { ... },
  "serviceType": "BASIC" | "COMPREHENSIVE",
  "extras": ["ENGINE_FLUSH"]
}
```

### Get Availability

```
GET /api/booking/availability?serviceType=BASIC&days=14
```

### Create Booking

```
POST /api/booking
{
  "quoteId": "...",
  "customerName": "John Smith",
  "customerEmail": "john@example.com",
  "customerPhone": "027 123 4567",
  "address": "123 Main St",
  "suburb": "Takapuna",
  "slotDate": "2026-02-01",
  "slotTime": "09:00"
}
```

### Create Payment Session

```
POST /api/payment/checkout
{
  "bookingId": "..."
}
```

### Stripe Webhook

```
POST /api/webhook/stripe
```

## Pricing Structure

### Basic Service (1 hour)

| Engine Size | Petrol | Diesel |
|-------------|--------|--------|
| <2000cc     | $275   | $305   |
| 2000-3000cc | $295   | $315   |
| >3000cc     | $325   | $345   |

### Comprehensive Service (2 hours)

| Engine Size | Petrol | Diesel |
|-------------|--------|--------|
| <2000cc     | $385   | $415   |
| 2000-3000cc | $405   | $435   |
| >3000cc     | $445   | $465   |

### Extras

- Engine Flush: $49
- Air Fragrance: $20
- Extra Oil: $22/litre (beyond 5L included)

*All prices GST-inclusive*

## Security

### MotorWeb Cost Controls

- **Caching**: 90-day plate cache (Redis + PostgreSQL)
- **Rate Limiting**: 20 lookups/IP/day, 10 lookups/browser/day
- **Honeypot**: Hidden field to catch bots
- **Validation**: Plate format validation before API call
- **Email Gate**: Email required before lookup

### Certificate Security

- Client certificates stored in `/secure/certs/`
- Never exposed to frontend
- Read-only mount in Docker

### Payment Security

- Stripe Checkout (PCI compliant)
- Webhook signature verification
- Idempotent payment handling

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `MOTORWEB_CERT_PATH` | Path to client certificate | Yes |
| `MOTORWEB_KEY_PATH` | Path to private key | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |
| `GEARBOX_API_URL` | Gearbox API endpoint | Yes |
| `GEARBOX_API_KEY` | Gearbox API key | Yes |
| `NEXT_PUBLIC_BASE_URL` | Public URL | Yes |

See `.env.example` for full list.

## Database Schema

### Tables

- `plate_cache` - MotorWeb lookup cache
- `quote` - Generated pricing quotes
- `booking` - Customer bookings
- `payment` - Stripe payment records
- `lookup_log` - Rate limiting audit
- `gearbox_sync_log` - Integration audit

## Monitoring

### Health Check

```
GET /health
```

### Failed Gearbox Syncs

Check `gearbox_sync_log` table for failed syncs requiring manual review.

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

## License

Proprietary - Mobile Autoworks NZ
