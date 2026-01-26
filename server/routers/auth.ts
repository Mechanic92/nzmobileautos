import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { consumeMagicLinkToken, createMagicLinkToken, getUserByOpenId, upsertUser } from "../../db";
import { ENV } from "../_core/env";

function normalizePhone(phone: string) {
  return phone.replace(/[^0-9+]/g, "");
}

function getPublicAppUrlFromCtx(ctx: any) {
  const envUrl = (ENV.publicAppUrl || "").trim().replace(/\/$/, "");
  if (envUrl) return envUrl;
  const host = ctx?.req?.headers?.host;
  const protocol = ctx?.req?.protocol || "http";
  if (host) return `${protocol}://${host}`;
  return "";
}

async function sendSms(toPhone: string, message: string) {
  // Provider-ready stub.
  // Replace this with Twilio/MessageBird/etc. in production.
  console.log(`[SMS to ${toPhone}] ${message}`);
}

export const authRouter = router({
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().optional(),
      openId: z.string(),
    }))
    .mutation(async ({ input }) => {
      await upsertUser({
        openId: input.openId,
        email: input.email,
        name: input.name,
        loginMethod: "email",
      });
      return { success: true };
    }),

  requestMagicLink: publicProcedure
    .input(
      z.object({
        phone: z.string().min(6).optional(),
        email: z.string().email().optional(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const phone = input.phone ? normalizePhone(input.phone) : undefined;
      const email = input.email ? input.email.trim().toLowerCase() : undefined;

      if (!phone && !email) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Provide phone or email" });
      }

      // Stable openId derived from the contact channel.
      // (We keep it short-ish and deterministic.)
      const openId = phone
        ? `phone_${phone.replace(/[^0-9]/g, "").slice(-12)}`
        : `email_${(email || "").replace(/[^a-z0-9]/g, "").slice(-32)}`;

      await upsertUser({
        openId,
        email,
        phone,
        name: input.name,
        loginMethod: "magic_link",
      });

      const { token, expiresAt } = await createMagicLinkToken({
        openId,
        email,
        phone,
        ttlMinutes: 15,
      });

      const baseUrl = getPublicAppUrlFromCtx(ctx);
      const link = baseUrl ? `${baseUrl}/magic/${token}` : `/magic/${token}`;
      const msg = `Mobile Autoworks NZ login link (valid 15 min): ${link}`;

      if (phone) {
        await sendSms(phone, msg);
      } else {
        // Email provider-ready stub.
        console.log(`[MagicLink email to ${email}] ${msg}`);
      }

      return { success: true, expiresAt };
    }),

  consumeMagicLink: publicProcedure
    .input(z.object({ token: z.string().min(10) }))
    .mutation(async ({ input }) => {
      const tokenRow = await consumeMagicLinkToken(input.token);
      if (!tokenRow) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Magic link is invalid or expired" });
      }

      await upsertUser({
        openId: tokenRow.openId,
        email: tokenRow.email || undefined,
        phone: tokenRow.phone || undefined,
        loginMethod: "magic_link",
        lastSignedIn: new Date(),
      });

      const user = await getUserByOpenId(tokenRow.openId);
      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found" });
      }

      return {
        openId: user.openId,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
      };
    }),
});
