import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../server/routers";

/**
 * tRPC React client - used throughout the frontend
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get the base URL for API calls
 */
function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Browser:
    // - Prefer an explicit API origin when deployed separately (e.g. https://api.example.com)
    // - Fallback to same-origin relative URLs (e.g. Netlify/Vite proxy)
    return (import.meta as any).env?.VITE_API_URL ?? "";
  }
  // SSR: use localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * tRPC client configuration
 */
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers() {
        const token = localStorage.getItem("auth_token");
        // In this mock setup, we use the user_data's ID/OpenID as the token
        // In a real app with JWTs, this would be different.
        // Based on server/_core/trpc.ts, it expects "x-user-openid"
        const userDataStr = localStorage.getItem("user_data");
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            // Assuming the mock user has an ID that maps to openId in the DB
            // In useAuth.tsx, id is "1". In DB, openId is varchar.
            // Let's use the 'id' from user_data as the openId header for now.
            return {
              "x-user-openid": userData.id || userData.openId,
            };
          } catch (e) {
            return {};
          }
        }
        return {};
      },
    }),
  ],
});
