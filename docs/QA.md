# Mobile Autoworks NZ - QA Checklist

## Production Readiness Verification

Last updated: December 2024

---

## 1. Diagnostics Flow (Pay-to-Confirm)

### Happy Path
1. Navigate to `/book/diagnostics`
2. Fill in all required fields:
   - Date/time
   - Address
   - Rego/Plate (REQUIRED)
   - Symptoms/notes
   - Name, Email, Phone
3. Click "Continue to payment"
4. Complete Stripe checkout
5. Verify redirect to `/checkout/success`
6. Confirm booking shows "Confirmed" status

### Cancel/Fail Path
1. Start booking flow as above
2. At Stripe checkout, click back or close
3. Verify redirect to `/checkout/cancelled`
4. Confirm "Try again" button works
5. Confirm booking is NOT confirmed in admin

### Edge Cases
- [ ] Double-submit prevention (button disabled during submission)
- [ ] Refresh during payment (booking remains in pending state)
- [ ] Expired payment link (60 minute expiry)

---

## 2. Quote Flow (Quote-First, No Payment)

### Happy Path
1. Navigate to `/book/quote`
2. Fill in all required fields:
   - Category
   - Urgency
   - Address
   - Rego/Plate (REQUIRED)
   - Description (min 10 chars)
   - Name, Phone
3. Click "Submit quote request"
4. Verify success message with reference ID
5. Confirm submit button is hidden after success
6. Verify quote appears in admin dashboard

### Validation Checks
- [ ] Rego/Plate required (shows error if empty)
- [ ] Description minimum length enforced
- [ ] Phone number minimum length enforced
- [ ] Email optional but validated if provided

### Resubmit Prevention
- [ ] After success, submit button is hidden
- [ ] Form cannot be resubmitted without page refresh

---

## 3. Mobile UX Verification

### Viewport Checks (test on 375px width)
- [ ] No horizontal scroll on any page
- [ ] Headings not cut off by sticky header
- [ ] Form inputs fully visible when focused
- [ ] Submit buttons visible above keyboard
- [ ] Chat widget doesn't cover CTAs

### Touch Targets
- [ ] All buttons at least 44x44px touch area
- [ ] Form inputs have adequate tap targets
- [ ] Links have sufficient spacing

### iOS Specific
- [ ] Safe area padding on bottom (home indicator)
- [ ] No zoom on input focus (font-size >= 16px)

---

## 4. Pricing Display Audit

### Portal (next/) - NO pricing should appear
- [x] `/` (homepage) - No dollar amounts
- [x] `/book` - No dollar amounts
- [x] `/book/diagnostics` - No dollar amounts
- [x] `/book/quote` - No dollar amounts
- [x] `/checkout/success` - No dollar amounts
- [x] `/checkout/cancelled` - No dollar amounts
- [x] Footer - No "All prices in NZD"

### Marketing Site (root) - NO pricing should appear
- [x] Home.tsx - No dollar amounts
- [x] Services.tsx - No "Transparent pricing"
- [x] App.tsx SEO meta - No pricing mentions

### Internal Only (backend)
- [x] `pricing.ts` - $140 diagnostics total (14000 cents)
- [x] `quotes/create/route.ts` - Updated pricing snapshot
- [x] Stripe line items show "Mobile Diagnostics" (no itemized breakdown)

### Email Templates
- [ ] Booking confirmation email - No amounts displayed
- [ ] (Stripe receipts may show amounts - this is legally required)

---

## 5. Required Environment Variables

### Portal (next/)
```
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
RESEND_API_KEY=re_...
EMAIL_FROM=Mobile Autoworks <bookings@mobileautoworksnz.com>
APP_URL=https://app.mobileautoworksnz.com
ADMIN_AUTH_SECRET=<random-32-char-string>
ADMIN_EMAIL=<admin-email>
ADMIN_PASSWORD=<admin-password>
```

### Marketing Site (root)
```
VITE_APP_PORTAL_ORIGIN=https://nzmobileauto.vercel.app
```

---

## 6. Deployment Checklist

### Before Deploy
- [ ] All TypeScript errors resolved (`pnpm check`)
- [ ] Build succeeds locally (`pnpm build`)
- [ ] Environment variables set in Vercel/Netlify

### After Deploy
- [ ] Homepage loads correctly
- [ ] Booking flow works end-to-end
- [ ] Quote flow works end-to-end
- [ ] Admin login works
- [ ] SSL certificate valid

---

## 7. Known Limitations

1. **Photo upload**: Not yet implemented for quote requests (placeholder text shown)
2. **Vehicle lookup**: CarJam/NZTA integration pending API key
3. **SMS notifications**: Not yet implemented
4. **Stripe webhooks**: Payment confirmation relies on redirect, not webhook verification

---

## Release Notes

### Changes Made (December 2024)

#### Pricing Removal (User-Facing)
- Removed all dollar amounts from portal homepage
- Removed pricing from `/book` selection page
- Removed pricing hint from diagnostics booking form
- Removed "All prices in NZD" from footer
- Removed "Transparent pricing" from marketing site
- Updated SEO meta descriptions to remove pricing mentions

#### Internal Pricing Update
- Diagnostics: $140 total (was $120 + $75 call-out)
- Labour: $110/hr standard
- Diagnostics labour: $120/hr
- Call-out: $75 (internal only)
- After-hours surcharge: +25% on labour
- Shop supplies: 3% capped at $25
- Diagnostics waived if repairs over $500

#### Flow Improvements
- Improved checkout success page with clear next steps
- Improved checkout cancelled page with retry path
- Quote form hides submit button after success (prevents resubmits)
- Added success confirmation with checkmark icon

#### Mobile UX
- Added iOS safe area padding
- Added sticky submit buttons on mobile
- Added scroll margin for anchor links

---

## Verification Statement

**Confirmed: No pricing is displayed anywhere user-facing on the website.**

All pricing values exist only in:
- Backend pricing configuration (`pricing.ts`)
- Database pricing snapshots
- Stripe checkout (legally required)
