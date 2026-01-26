# Payments & Booking Confirmation

## Overview
After a successful Stripe payment, the system automatically:
1. Verifies payment completion
2. Creates a Google Calendar event with booking details
3. Sends an admin confirmation email
4. Updates the booking status to "confirmed" and "paid"

## Required Environment Variables

### Stripe
```bash
STRIPE_SECRET_KEY=sk_test_...  # or sk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_...  # Optional, for webhook verification
```

### Email (Resend)
```bash
RESEND_API_KEY=re_...
ADMIN_EMAIL=your-email@example.com
FROM_EMAIL=bookings@yourdomain.com
```

### Google Calendar
```bash
# Service account JSON (as a single-line string)
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}

# Calendar ID to create events in
GOOGLE_CALENDAR_ID=primary  # or a specific calendar ID
```

## Google Calendar Setup

### 1. Create a Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Go to "IAM & Admin" > "Service Accounts"
5. Click "Create Service Account"
6. Give it a name (e.g., "Mobile Autoworks Bookings")
7. Click "Create and Continue"
8. Skip granting roles (click "Continue")
9. Click "Done"

### 2. Create a Key
1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the JSON file

### 3. Share Your Calendar
1. Open Google Calendar
2. Find the calendar you want to use for bookings (or create a new one)
3. Click the three dots next to the calendar name
4. Click "Settings and sharing"
5. Scroll to "Share with specific people"
6. Click "Add people"
7. Enter the service account email (found in the JSON file, looks like `xxx@xxx.iam.gserviceaccount.com`)
8. Give it "Make changes to events" permission
9. Click "Send"

### 4. Get the Calendar ID
1. In the same calendar settings page
2. Scroll to "Integrate calendar"
3. Copy the "Calendar ID" (looks like `xxx@group.calendar.google.com` or your email for primary calendar)

### 5. Set Environment Variables
```bash
# Convert the JSON file to a single line (remove newlines)
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project",...}'

# Use the calendar ID you copied
GOOGLE_CALENDAR_ID=xxx@group.calendar.google.com
```

## Testing

### Test Mode (Stripe Test Keys)
- Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- Any ZIP code

### Verify Confirmation Flow
1. Create a booking and complete payment
2. You should be redirected to `/success?session_id=...`
3. Check that:
   - Booking reference is displayed
   - Calendar event was created (check Google Calendar)
   - Admin email was sent (check ADMIN_EMAIL inbox)
   - Booking status is "confirmed" and payment status is "paid"

## Idempotency
- Refreshing the success page will NOT create duplicate calendar events
- The system checks if the Stripe session has already been confirmed
- Confirmation status is stored in Stripe session metadata

## Graceful Failure
- If calendar creation fails, the customer still sees success
- Admin email includes `calendar_failed=true` flag
- Admin can manually add the booking to the calendar

## Production Checklist
- [ ] Replace Stripe test keys with live keys
- [ ] Update `PUBLIC_APP_URL` to your production domain
- [ ] Verify `ADMIN_EMAIL` is correct
- [ ] Test the complete flow in production mode
- [ ] Set up Stripe webhook endpoint (optional, for additional reliability)
- [ ] Monitor logs for any errors

## Troubleshooting

### Calendar events not being created
- Verify service account email has access to the calendar
- Check that `GOOGLE_SERVICE_ACCOUNT_JSON` is valid JSON
- Ensure Google Calendar API is enabled in Google Cloud Console
- Check server logs for specific error messages

### Emails not sending
- Verify `RESEND_API_KEY` is valid
- Check that `FROM_EMAIL` domain is verified in Resend
- Ensure `ADMIN_EMAIL` is correct
- Check Resend dashboard for delivery status

### Payment confirmation fails
- Verify `STRIPE_SECRET_KEY` is correct
- Check that the session_id in the URL is valid
- Look for errors in server logs
- Ensure the Stripe session has `payment_status === "paid"`
