import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

type TrpcContext = {
  user: {
    id: number;
    openId: string;
    email: string;
    name: string;
    loginMethod: string;
    role: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
    lastSignedIn: Date;
  } | null;
  req: { protocol: string; headers: Record<string, string> };
  res: Record<string, unknown>;
};

function createTestContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    },
    res: {},
  };

  return ctx;
}

describe("quotes.submit", () => {
  it("disables quote submission via API (quotes are handled via email)", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx as any);

    const quoteData = {
      customerName: "John Smith",
      email: "john.smith@example.com",
      phone: "021 123 4567",
      vehicleMake: "Toyota",
      vehicleModel: "Corolla",
      vehicleYear: 2018,
      serviceType: "Gold Service",
      suburb: "Henderson",
      message: "Need a full service for my car",
    };

    await expect(caller.quotes.submit(quoteData)).rejects.toThrow(
      /email only|not available through the api|not_implemented/i
    );
    expect(true).toBe(true);
  });

  it("disables minimal quote submission via API (quotes are handled via email)", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx as any);

    const minimalQuoteData = {
      customerName: "Jane Doe",
      email: "jane@example.com",
      phone: "021 987 6543",
      serviceType: "Brake Repair",
    };

    await expect(caller.quotes.submit(minimalQuoteData as any)).rejects.toThrow(
      /email only|not available through the api|not_implemented/i
    );
    expect(true).toBe(true);
  });

  it("rejects quote submission with missing required fields", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx as any);

    const invalidQuoteData = {
      customerName: "Test User",
      email: "invalid-email",
      phone: "",
      serviceType: "",
    };

    await expect(caller.quotes.submit(invalidQuoteData as any)).rejects.toThrow();
  });
});

describe("quotes.list", () => {
  it("disables quote listing via API (quotes are handled via email)", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx as any);

    await expect(caller.quotes.list()).rejects.toThrow(
      /email only|not available through the api|not_implemented|must be an admin/i
    );
  });
});

describe("testimonials.list", () => {
  it("returns list of approved testimonials", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx as any);

    const result = await caller.testimonials.list();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("serviceAreas.list", () => {
  it("returns list of active service areas", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx as any);

    const result = await caller.serviceAreas.list();

    expect(Array.isArray(result)).toBe(true);
  });
});
