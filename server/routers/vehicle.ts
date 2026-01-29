import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import fs from "fs";
import { Agent } from "undici";

type MotorWebTokenCache = {
  accessToken: string;
  // epoch ms
  expiresAt: number;
};

let motorWebTokenCache: MotorWebTokenCache | null = null;

function getMotorWebApiBaseUrl() {
  // Defaults to production as per MotorWeb docs
  return (process.env.MOTORWEB_API_BASE_URL || "https://api.motorweb.app").replace(/\/$/, "");
}

async function getMotorWebAccessToken() {
  const baseUrl = getMotorWebApiBaseUrl();
  const clientId = process.env.MOTORWEB_CLIENT_ID;
  const clientSecret = process.env.MOTORWEB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "MotorWeb OAuth credentials not configured. Set MOTORWEB_CLIENT_ID and MOTORWEB_CLIENT_SECRET",
    });
  }

  const now = Date.now();
  // Refresh a minute early to avoid edge-of-expiry failures
  if (motorWebTokenCache && motorWebTokenCache.expiresAt - 60_000 > now) {
    return motorWebTokenCache.accessToken;
  }

  if (typeof fetch !== "function") {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Server fetch() is not available. Upgrade Node.js to v18+ or provide a fetch polyfill.",
    });
  }

  const tokenUrl = `${baseUrl}/auth/v1/token`;
  const body = new URLSearchParams();
  body.set("grant_type", "client_credentials");
  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: `MotorWeb token endpoint error (${res.status}). ${text}`.trim(),
    });
  }

  const json = (await res.json()) as any;
  const accessToken: string | undefined = json?.access_token;
  const expiresInSeconds: number | undefined = typeof json?.expires_in === "number" ? json.expires_in : undefined;

  if (!accessToken || !expiresInSeconds) {
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: "MotorWeb token response missing access_token/expires_in",
    });
  }

  motorWebTokenCache = {
    accessToken,
    expiresAt: now + expiresInSeconds * 1000,
  };

  return accessToken;
}

async function motorWebGetJson(options: {
  baseUrl: string;
  bearerToken: string;
  path: string;
  query?: Record<string, string | undefined>;
}) {
  if (typeof fetch !== "function") {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Server fetch() is not available. Upgrade Node.js to v18+ or provide a fetch polyfill.",
    });
  }

  const query = new URLSearchParams();
  if (options.query) {
    for (const [k, v] of Object.entries(options.query)) {
      if (v) query.set(k, v);
    }
  }

  const url = `${options.baseUrl}${options.path}${query.size ? `?${query.toString()}` : ""}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: options.bearerToken.toLowerCase().startsWith("bearer ")
      ? options.bearerToken
      : `Bearer ${options.bearerToken}`,
  };

  const res = await fetch(url, { method: "GET", headers });
  if (res.status === 404) {
    throw new TRPCError({ code: "NOT_FOUND", message: "MotorWeb: resource not found" });
  }
  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: `MotorWeb error (${res.status}). ${bodyText}`.trim(),
    });
  }
  return (await res.json()) as any;
}

function getMotorWebRobotAgent() {
  const p12Base64 = process.env.MOTORWEB_ROBOT_P12_BASE64;
  const p12Path = process.env.MOTORWEB_ROBOT_P12_PATH;
  const passphrase = process.env.MOTORWEB_ROBOT_P12_PASSPHRASE;

  if (!passphrase) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "MOTORWEB_ROBOT_P12_PASSPHRASE is not configured on the server",
    });
  }

  let pfx: Buffer;
  if (p12Base64) {
    pfx = Buffer.from(p12Base64, "base64");
  } else if (p12Path) {
    pfx = fs.readFileSync(p12Path);
  } else {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "MotorWeb mTLS certificate not configured. Set MOTORWEB_ROBOT_P12_BASE64 or MOTORWEB_ROBOT_P12_PATH",
    });
  }

  return new Agent({
    connect: {
      pfx,
      passphrase,
    },
  });
}

async function motorWebRobotRequest(options: {
  baseUrl: string;
  path: string;
  query?: Record<string, string | undefined>;
}) {
  const query = new URLSearchParams();
  if (options.query) {
    for (const [k, v] of Object.entries(options.query)) {
      if (v) query.set(k, v);
    }
  }

  const url = `${options.baseUrl}${options.path}${query.size ? `?${query.toString()}` : ""}`;
  const dispatcher = getMotorWebRobotAgent();

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json, text/xml, application/xml, */*",
    },
    // Node fetch is undici-based; dispatcher is how we attach an mTLS agent.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    dispatcher,
  });

  if (res.status === 404) {
    throw new TRPCError({ code: "NOT_FOUND", message: "MotorWeb: resource not found" });
  }
  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: `MotorWeb error (${res.status}). ${bodyText}`.trim(),
    });
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return {
      contentType,
      data: (await res.json()) as any,
      text: null as string | null,
    };
  }

  return {
    contentType,
    data: null as any,
    text: await res.text(),
  };
}

export const vehicleRouter = router({
  /**
   * Admin-only reports. These are intentionally NOT used for public quote/booking auto-fill.
   */
  basicVehicleInfo: adminProcedure
    .input(
      z.object({
        plate: z.string().optional(),
        vin: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const motorWebRobotBaseUrl = (process.env.MOTORWEB_ROBOT_BASE_URL || "https://robot.motorweb.co.nz").replace(/\/$/, "");

      const plate = input.plate ? input.plate.toUpperCase().replace(/[^A-Z0-9]/g, "") : undefined;
      const vin = input.vin ? input.vin.toUpperCase().replace(/[^A-Z0-9]/g, "") : undefined;
      if (!plate && !vin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Provide either plate or vin",
        });
      }

      const plateOrVin = plate ?? vin;
      const result = await motorWebRobotRequest({
        baseUrl: motorWebRobotBaseUrl,
        path: "/b2b/bvi/generate/4.0",
        query: {
          plateOrVin,
        },
      });

      const raw = result.data ?? result.text;
      const vehicle = result.data?.vehicle;
      const summary = {
        plate: vehicle?.currentPlate?.plateNumber ?? vehicle?.plates?.[0]?.plateNumber ?? plate ?? null,
        vin: vehicle?.vin ?? vin ?? null,
        make: vehicle?.make ?? null,
        model: vehicle?.model ?? null,
        year: vehicle?.yearOfManufacture ?? null,
        transmission: vehicle?.transmission?.type?.description ?? null,
        fuel: vehicle?.fuelType?.description ?? null,
        wofExpiry: vehicle?.wof?.expiryDate ?? null,
        regoExpiry: vehicle?.licence?.expiryDate ?? null,
        alerts: result.data?.alerts ?? [],
      };

      return { provider: "motorweb_robot" as const, summary, raw, contentType: result.contentType };
    }),

  assetCheck: adminProcedure
    .input(
      z.object({
        plate: z.string().optional(),
        vin: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const motorWebRobotBaseUrl = (process.env.MOTORWEB_ROBOT_BASE_URL || "https://robot.motorweb.co.nz").replace(/\/$/, "");

      const plate = input.plate ? input.plate.toUpperCase().replace(/[^A-Z0-9]/g, "") : undefined;
      const vin = input.vin ? input.vin.toUpperCase().replace(/[^A-Z0-9]/g, "") : undefined;
      if (!plate && !vin) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Provide either plate or vin" });
      }

      const plateOrVin = plate ?? vin;
      const result = await motorWebRobotRequest({
        baseUrl: motorWebRobotBaseUrl,
        path: "/b2b/vir/generate/4.0",
        query: {
          plateOrVin,
        },
      });

      const raw = result.data ?? result.text;
      const vehicle = result.data?.vehicle;
      const summary = {
        plate: vehicle?.currentPlate?.plateNumber ?? vehicle?.plates?.[0]?.plateNumber ?? plate ?? null,
        vin: vehicle?.vin ?? vin ?? null,
        make: vehicle?.make ?? null,
        model: vehicle?.model ?? null,
        year: vehicle?.yearOfManufacture ?? null,
        reportedStolen: vehicle?.reportedStolen ?? null,
        numberOfOwners: vehicle?.numberOfOwners ?? null,
        alerts: result.data?.alerts ?? [],
      };

      return { provider: "motorweb_robot" as const, summary, raw, contentType: result.contentType };
    }),

  chassisCheckPlusRedbook: adminProcedure
    .input(
      z.object({
        plate: z.string().optional(),
        vin: z.string().optional(),
        widen: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const motorWebRobotBaseUrl = (process.env.MOTORWEB_ROBOT_BASE_URL || "https://robot.motorweb.co.nz").replace(/\/$/, "");

      const plate = input.plate ? input.plate.toUpperCase().replace(/[^A-Z0-9]/g, "") : undefined;
      const vin = input.vin ? input.vin.toUpperCase().replace(/[^A-Z0-9]/g, "") : undefined;
      if (!plate && !vin) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Provide either plate or vin" });
      }

      const plateOrVin = plate ?? vin;
      const result = await motorWebRobotRequest({
        baseUrl: motorWebRobotBaseUrl,
        path: "/b2b/ccr/generate/4.0",
        query: {
          plateOrVin,
          widen: input.widen === undefined ? undefined : String(input.widen),
        },
      });

      const raw = result.data ?? result.text;
      const vehicle = result.data?.vehicle;
      const summary = {
        plate: vehicle?.currentPlate?.plateNumber ?? vehicle?.plates?.[0]?.plateNumber ?? plate ?? null,
        vin: vehicle?.vin ?? vin ?? null,
        make: vehicle?.make ?? null,
        model: vehicle?.model ?? null,
        year: vehicle?.yearOfManufacture ?? null,
        redbookCodes: result.data?.redbookCodes ?? [],
        alerts: result.data?.alerts ?? [],
      };

      return { provider: "motorweb_robot" as const, summary, raw, contentType: result.contentType };
    }),

  chassisCheck: adminProcedure
    .input(
      z.object({
        plateOrVin: z.string(),
      })
    )
    .query(async ({ input }) => {
      const motorWebRobotBaseUrl = (process.env.MOTORWEB_ROBOT_BASE_URL || "https://robot.motorweb.co.nz").replace(/\/$/, "");

      const normalizedInput = input.plateOrVin.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (!normalizedInput) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Provide a valid plate or vin" });
      }

      const result = await motorWebRobotRequest({
        baseUrl: motorWebRobotBaseUrl,
        path: "/b2b/chassischeck/generate/4.0",
        query: {
          plateOrVin: normalizedInput,
        },
      });

      const raw = result.data ?? result.text;
      
      return { 
        provider: "motorweb_robot" as const, 
        raw, 
        contentType: result.contentType 
      };
    }),

  lookup: publicProcedure
    .input(z.object({ plate: z.string() }))
    .mutation(async ({ input }) => {
      const normalizedPlate = input.plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (!normalizedPlate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Registration plate is required",
        });
      }

      const hasOAuth = !!(process.env.MOTORWEB_CLIENT_ID && process.env.MOTORWEB_CLIENT_SECRET);
      const marketDataBaseUrl = `${getMotorWebApiBaseUrl()}/market-data`;

      // If OAuth credentials are configured, use MotorWeb market-data API.
      if (hasOAuth) {
        const bearer = await getMotorWebAccessToken();
        const data = await motorWebGetJson({
          baseUrl: marketDataBaseUrl,
          bearerToken: bearer,
          path: `/v1/vehicles/plate/${encodeURIComponent(normalizedPlate)}`,
        });

        const vehicle = data?.vehicle;
        const make = vehicle?.make ?? null;
        const model = vehicle?.model ?? null;
        const year = vehicle?.year ?? null;

        const confidence: string | undefined =
          data?.confidence ?? vehicle?.confidence ?? vehicle?.confidence_score ?? data?.confidence_score;
        const upstreamVehicle: string | undefined = data?.upstream_vehicle ?? vehicle?.upstream_vehicle;

        if (!make || !model || !year) {
          throw new TRPCError({
            code: "UNPROCESSABLE_CONTENT",
            message: upstreamVehicle
              ? `Vehicle match failed/unsupported. Upstream vehicle: ${upstreamVehicle}`
              : "Vehicle match failed/unsupported",
          });
        }

        return {
          make,
          model,
          year,
          fuelType: vehicle?.fuel_type ?? vehicle?.fuel ?? null,
          transmission: vehicle?.transmission ?? null,
          bodyType: vehicle?.body_type ?? null,
          title: vehicle?.title ?? null,
          confidence: confidence ?? "standard",
          upstreamVehicle: upstreamVehicle ?? null,
          provider: "motorweb_oauth" as const,
        };
      }

      // No key configured: deterministic mock fallback so the site remains usable.
      console.log(`[VehicleLookup] MotorWeb OAuth not configured. Using mock vehicle lookup for plate: ${normalizedPlate}`);

      await new Promise((resolve) => setTimeout(resolve, 400));

      if (normalizedPlate === "ERROR") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vehicle not found",
        });
      }

      if (normalizedPlate.includes("TESLA") || normalizedPlate === "EV123") {
        return {
          make: "Tesla",
          model: "Model 3",
          year: 2023,
          fuelType: "Electric",
          transmission: "Automatic",
          bodyType: "Sedan",
          title: "2023 Tesla Model 3",
          confidence: "standard",
          upstreamVehicle: null,
          provider: "mock" as const,
        };
      }

      if (normalizedPlate.includes("RANGER") || normalizedPlate === "UTE456") {
        return {
          make: "Ford",
          model: "Ranger",
          year: 2021,
          fuelType: "Diesel",
          transmission: "Automatic",
          bodyType: "Ute",
          title: "2021 Ford Ranger",
          confidence: "standard",
          upstreamVehicle: null,
          provider: "mock" as const,
        };
      }

      return {
        make: "Toyota",
        model: "Corolla",
        year: 2018,
        fuelType: "Petrol",
        transmission: "Automatic",
        bodyType: "Hatchback",
        title: "2018 Toyota Corolla",
        confidence: "reduced",
        upstreamVehicle: null,
        provider: "mock" as const,
      };
    }),
});
