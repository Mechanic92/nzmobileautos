import { POST as stripeWebhookPost } from "@/app/api/stripe/webhook/route";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return stripeWebhookPost(req);
}
