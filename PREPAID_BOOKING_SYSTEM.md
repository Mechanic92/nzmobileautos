# Prepaid Booking System - Mobile Autoworks NZ

## Overview

Complete prepaid booking system with Stripe Checkout, business hours enforcement, notifications, and SEO optimization.

---

## System Architecture

### Frontend Components
- `src/pages/PrepaidBooking.tsx` - Main booking form with service selection, conditional fields, add-ons
- `src/pages/BookingSuccess.tsx` - Post-payment success page
- `src/pages/BookingCancel.tsx` - Payment cancelled page
- `src/pages/MobileDiagnosticAuckland.tsx` - SEO landing page for diagnostics
- `src/pages/PrePurchaseInspectionAuckland.tsx` - SEO landing page for PPI

### Backend Components
- `server/routers/prepaid-booking.ts` - tRPC router for booking operations
- `server/utils/business-hours.ts` - Business hours validation (NZ timezone)
- `server/utils/booking-config.ts` - Service pricing and configuration
- `server/utils/booking-notifications.ts` - Email notifications
- `server/utils/sms.ts` - SMS notifications (Twilio-ready)
- `api/prepaid-booking/webhook.ts` - Stripe webhook handler (Vercel)

### Shared Types
- `shared/types/booking.ts` - TypeScript types for booking system

---

## Environment Variables

Add these to your `.env` file:

```env
# Stripe (REQUIRED)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email Notifications (REQUIRED)
RESEND_API_KEY=re_xxx
ADMIN_EMAIL=chris@mobileautoworksnz.com
FROM_EMAIL=bookings@mobileautoworksnz.com

# SMS Notifications (OPTIONAL)
SMS_PROVIDER=twilio  # or 'console' for development
OWNER_PHONE=+6427XXXXXXX
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_FROM_NUMBER=+1xxx

# Business Configuration (OPTIONAL - defaults shown)
BUSINESS_OPEN_TIME=09:00
BUSINESS_CLOSE_TIME=17:00
BUSINESS_LAST_BOOKING_TIME=15:30
JOB_DURATION_MINUTES=90
BOOKING_BUFFER_MINUTES=30
MAX_BOOKINGS_PER_DAY=4

# Service Pricing (OPTIONAL - defaults shown)
PPI_PRICE_NZD=180
ADDON_PRIORITY_PRICE_NZD=50
ADDON_OUTSIDE_AREA_PRICE_NZD=30
ADDON_AFTER_HOURS_PRICE_NZD=75

# App URL
PUBLIC_APP_URL=https://mobileautoworksnz.com
```

---

## Stripe Configuration

### 1. Enable Payment Methods in Stripe Dashboard

Go to **Settings > Payment methods** and enable:
- [x] Cards (Visa, Mastercard, Amex)
- [x] Apple Pay
- [x] Google Pay  
- [x] Afterpay/Clearpay

### 2. Configure Webhook

1. Go to **Developers > Webhooks**
2. Add endpoint: `https://yourdomain.com/api/prepaid-booking/webhook`
3. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

### 3. Test Mode

Use test keys during development:
- Test card: `4242 4242 4242 4242`
- Test Afterpay: Use Australian address

---

## Business Hours Rules

### Standard Hours (Monday-Friday)
- **Opening:** 9:00am NZT
- **Closing:** 5:00pm NZT
- **Last booking slot:** 3:30pm (allows 90min job to complete by 5pm)
- **Time slots:** 30-minute intervals from 9:00am to 3:30pm

### Weekend Bookings
- No self-serve time slots
- Customer provides preferred time window
- Status: `pending_weekend_approval`
- Admin must manually confirm time

### Validation
- Server-side validation cannot be bypassed
- Timezone: `Pacific/Auckland`
- Max booking: 60 days in advance
- Auckland-only address validation

---

## Service Configuration

### Mobile Diagnostic - $140
- Full payment upfront
- Duration: 90 minutes
- Conditional fields: Won't start?, Warning lights?, Battery age

### Pre-Purchase Inspection - $180
- Full payment upfront
- Duration: 120 minutes
- Conditional fields: Seller address, Seller contact, Urgency, Report email

### Add-ons
| Add-on | Price | Requires Approval |
|--------|-------|-------------------|
| Priority Same-Day | $50 | No |
| Outside Core Area | $30 | No |
| After-Hours | $75 | Yes |

---

## Notification Flow

### On Successful Payment (Webhook)

1. **Owner Email** - Immediate
   - Booking reference
   - Service details
   - Customer info
   - Payment confirmation
   - Weekend approval notice (if applicable)

2. **Owner SMS** - Immediate
   - Condensed booking info
   - Requires `OWNER_PHONE` and SMS provider config

3. **Customer Email** - Immediate
   - Branded confirmation
   - Booking details
   - Preparation instructions
   - Cancellation policy
   - Contact information

---

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/booking` | PrepaidBooking | Main booking form |
| `/booking/success` | BookingSuccess | Post-payment success |
| `/booking/cancel` | BookingCancel | Payment cancelled |
| `/mobile-diagnostic-auckland` | MobileDiagnosticAuckland | SEO page |
| `/pre-purchase-inspection-auckland` | PrePurchaseInspectionAuckland | SEO page |

---

## SEO Implementation

### Structured Data (JSON-LD)
- LocalBusiness schema
- Service schema
- FAQPage schema
- BreadcrumbList schema

### Meta Tags
- Unique title (≤60 chars)
- Meta description (≤155 chars)
- Canonical URLs
- Open Graph tags

### Target Keywords
- Mobile mechanic Auckland
- Mobile car diagnostic Auckland
- Car won't start Auckland
- Pre purchase car inspection Auckland
- On-site mechanic Auckland

---

## Deployment Checklist

### Pre-Deployment
- [ ] Set all environment variables
- [ ] Configure Stripe webhook endpoint
- [ ] Enable payment methods in Stripe
- [ ] Test with Stripe test keys
- [ ] Verify email sending (Resend)
- [ ] Test SMS (if configured)

### Stripe Webhook Setup
- [ ] Add webhook endpoint in Stripe Dashboard
- [ ] Copy webhook signing secret
- [ ] Test webhook with Stripe CLI: `stripe listen --forward-to localhost:3000/api/prepaid-booking/webhook`

### DNS/Domain
- [ ] Verify domain in Resend for email sending
- [ ] Configure Apple Pay domain verification (if using)

### Post-Deployment
- [ ] Test complete booking flow with real payment
- [ ] Verify owner receives email + SMS
- [ ] Verify customer receives confirmation email
- [ ] Test weekend booking flow
- [ ] Check SEO pages render correctly
- [ ] Verify structured data with Google Rich Results Test

---

## Testing Checklist

### Booking Form
- [ ] Service selection updates price
- [ ] Conditional fields show/hide correctly
- [ ] Add-ons update total price
- [ ] Date picker disables past dates
- [ ] Weekend dates show "By Appointment" message
- [ ] Time slots only show for weekdays
- [ ] Form validation works
- [ ] Auckland address validation works
- [ ] NZ phone validation works

### Payment Flow
- [ ] Checkout session created successfully
- [ ] Redirect to Stripe Checkout works
- [ ] Success page shows booking details
- [ ] Cancel page displays correctly
- [ ] Webhook processes payment correctly

### Notifications
- [ ] Owner email received
- [ ] Owner SMS received (if configured)
- [ ] Customer confirmation email received
- [ ] Weekend booking shows pending approval

### Business Hours
- [ ] Cannot book before 9am
- [ ] Cannot book after 3:30pm
- [ ] Weekend shows appointment-only message
- [ ] Timezone is Pacific/Auckland

### SEO Pages
- [ ] Mobile Diagnostic page loads
- [ ] Pre-Purchase Inspection page loads
- [ ] Structured data validates
- [ ] Meta tags present
- [ ] Internal links work

---

## Security Measures

- HTTPS enforced
- Stripe webhook signature verification
- Server-side validation (cannot be bypassed)
- No secret keys exposed client-side
- Input sanitization via Zod schemas
- Rate limiting (implement at edge/CDN level)

---

## Troubleshooting

### Webhook Not Receiving Events
1. Check webhook URL is correct in Stripe Dashboard
2. Verify `STRIPE_WEBHOOK_SECRET` is set
3. Check server logs for signature verification errors
4. Use Stripe CLI for local testing

### Emails Not Sending
1. Verify `RESEND_API_KEY` is set
2. Check domain is verified in Resend
3. Check `FROM_EMAIL` matches verified domain
4. Check server logs for Resend errors

### SMS Not Sending
1. Verify `SMS_PROVIDER` is set to `twilio`
2. Check Twilio credentials are correct
3. Verify `OWNER_PHONE` is in E.164 format
4. Check Twilio console for errors

### Business Hours Issues
1. Verify server timezone is correct
2. Check `BUSINESS_*` env vars if customized
3. Test with explicit NZ times

---

## Future Enhancements

- [ ] Database persistence for bookings
- [ ] Admin dashboard for booking management
- [ ] Google Calendar integration
- [ ] Automated reminder emails (24h before)
- [ ] Refund processing via admin panel
- [ ] Customer booking history portal
