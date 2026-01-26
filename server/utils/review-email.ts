/**
 * Review Request Email Template
 * Sends a follow-up email asking customers to leave a Google review
 */

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.FROM_EMAIL || 'bookings@mobileautoworksnz.com';

// Configure your Google Business Profile review link
const GOOGLE_REVIEW_URL = process.env.GOOGLE_REVIEW_URL || 'https://g.page/r/mobileautoworksnz/review';
const REVIEW_PAGE_URL = 'https://www.mobileautoworksnz.com/review';

interface ReviewRequestData {
  customerName: string;
  customerEmail: string;
  serviceType: string;
  vehicleInfo?: string;
  appointmentDate?: string;
}

/**
 * Send a review request email to a customer after job completion
 */
export async function sendReviewRequestEmail(data: ReviewRequestData): Promise<boolean> {
  if (!resend) {
    console.warn('[Email] Resend not configured, logging review request instead');
    console.log('[Email] Review request for:', data.customerEmail);
    return false;
  }

  try {
    const firstName = data.customerName.split(' ')[0];

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>How did we do?</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                Mobile Autoworks NZ
              </h1>
            </td>
          </tr>

          <!-- Stars -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <div style="font-size: 40px; letter-spacing: 4px;">⭐⭐⭐⭐⭐</div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 28px; font-weight: 700; text-align: center;">
                Hi ${firstName}, how did we do?
              </h2>
              <p style="margin: 0 0 24px; color: #64748b; font-size: 16px; line-height: 1.6; text-align: center;">
                Thank you for choosing Mobile Autoworks NZ for your ${data.serviceType.toLowerCase()}. 
                We hope you had a great experience!
              </p>
              <p style="margin: 0 0 32px; color: #64748b; font-size: 16px; line-height: 1.6; text-align: center;">
                Your feedback helps other Aucklanders find reliable mobile mechanic services. 
                Would you mind taking 30 seconds to leave us a Google review?
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <a href="${GOOGLE_REVIEW_URL}" 
                 style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: 600;">
                Leave a Review on Google
              </a>
              <p style="margin: 16px 0 0; color: #94a3b8; font-size: 14px;">
                Or visit: <a href="${REVIEW_PAGE_URL}" style="color: #2563eb;">${REVIEW_PAGE_URL}</a>
              </p>
            </td>
          </tr>

          <!-- What to mention -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px;">
                <p style="margin: 0 0 12px; color: #1e293b; font-size: 14px; font-weight: 600;">
                  💡 What to mention in your review:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 14px; line-height: 1.8;">
                  <li>The service you received (${data.serviceType})</li>
                  <li>How convenient the mobile service was</li>
                  <li>Your overall experience</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">
                Thank you for your business!
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                Mobile Autoworks NZ • 027 642 1824 • chris@mobileautoworksnz.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const text = `
Hi ${firstName},

Thank you for choosing Mobile Autoworks NZ for your ${data.serviceType.toLowerCase()}. We hope you had a great experience!

Your feedback helps other Aucklanders find reliable mobile mechanic services. Would you mind taking 30 seconds to leave us a Google review?

Leave a review: ${GOOGLE_REVIEW_URL}

Or visit: ${REVIEW_PAGE_URL}

What to mention:
- The service you received (${data.serviceType})
- How convenient the mobile service was
- Your overall experience

Thank you for your business!

Mobile Autoworks NZ
027 642 1824
chris@mobileautoworksnz.com
    `.trim();

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `How was your ${data.serviceType}? We'd love your feedback! ⭐`,
      html,
      text,
    });

    console.log(`[Email] Review request sent to ${data.customerEmail}`);
    return true;
  } catch (error: any) {
    console.error('[Email] Failed to send review request:', error.message);
    return false;
  }
}

/**
 * Schedule a review request email to be sent after a delay
 * In production, this would use a job queue like Bull or a cron service
 */
export function scheduleReviewRequest(data: ReviewRequestData, delayHours: number = 24): void {
  // For now, just log that we would schedule this
  // In production, integrate with a job queue or scheduling service
  console.log(`[Review] Would schedule review request for ${data.customerEmail} in ${delayHours} hours`);
  
  // Simple setTimeout for demo (not production-ready - won't survive server restart)
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      sendReviewRequestEmail(data);
    }, delayHours * 60 * 60 * 1000);
  }
}
