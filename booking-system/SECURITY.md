# Security Checklist

## Pre-Deployment Security Review

### MotorWeb mTLS

- [ ] Client certificate stored outside web root
- [ ] Private key has restricted file permissions (600)
- [ ] Certificate paths not exposed in client-side code
- [ ] Certificate expiry monitoring configured
- [ ] Fallback behavior tested (manual entry works)

### Rate Limiting

- [ ] IP-based rate limiting active (20/day)
- [ ] Browser fingerprint rate limiting active (10/day)
- [ ] Redis connection secured
- [ ] Rate limit bypass not possible via headers

### Anti-Bot Controls

- [ ] Honeypot field present on lookup form
- [ ] Email required before plate lookup
- [ ] Plate validation runs before API call
- [ ] CAPTCHA threshold configured (optional)

### Payment Security

- [ ] Stripe webhook signature verification enabled
- [ ] Webhook endpoint not publicly documented
- [ ] Idempotency keys prevent duplicate charges
- [ ] Payment amounts validated server-side
- [ ] Refund handling tested

### Data Protection

- [ ] Customer PII encrypted at rest (PostgreSQL)
- [ ] Plate numbers hashed in lookup_log
- [ ] Session data expires appropriately
- [ ] HTTPS enforced (no HTTP)
- [ ] CORS restricted to production domain

### Infrastructure

- [ ] Environment variables not in source control
- [ ] Docker secrets used for sensitive values
- [ ] Database not publicly accessible
- [ ] Redis not publicly accessible
- [ ] Firewall rules configured

### Monitoring

- [ ] Failed payment alerts configured
- [ ] Rate limit breach alerts configured
- [ ] Gearbox sync failure alerts configured
- [ ] Error logging excludes sensitive data
- [ ] Health check endpoint monitored

## Incident Response

### MotorWeb Certificate Compromise

1. Immediately revoke certificate with MotorWeb
2. Generate new certificate
3. Update certificate paths
4. Restart application
5. Review lookup_log for suspicious activity

### Rate Limit Bypass Detected

1. Block offending IP addresses
2. Review lookup_log for patterns
3. Consider enabling CAPTCHA
4. Report to MotorWeb if excessive API calls made

### Payment Fraud Detected

1. Refund affected transactions via Stripe
2. Block associated email/IP
3. Review booking patterns
4. Contact affected customers

## Compliance Notes

### PCI DSS

- Card data never touches our servers (Stripe Checkout)
- No card numbers stored in database
- Stripe handles all PCI compliance

### Privacy Act 2020 (NZ)

- Customer data collected for service delivery only
- Data retention policy: 7 years (tax records)
- Customer can request data deletion
- Privacy policy link required on booking form

### Consumer Guarantees Act

- Clear pricing displayed before payment
- Cancellation policy clearly stated
- Service description accurate
