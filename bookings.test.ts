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
  res: { clearCookie?: () => void };
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(user?: AuthenticatedUser): TrpcContext {
  const ctx: TrpcContext = {
    user: user || null,
    req: {
      protocol: "https",
      headers: {},
    },
    res: {
      clearCookie: () => {},
    },
  };

  return ctx;
}

describe("bookings", () => {
  it("disables booking creation via API (bookings are handled by Mechanic Desk)", async () => {
    const user: AuthenticatedUser = {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const ctx = createTestContext(user);
    const caller = appRouter.createCaller(ctx as any);

    await expect(
      caller.bookings.create({
        customerName: "John Doe",
        email: "john@example.com",
        phone: "0211234567",
        address: "123 Test St",
        suburb: "Henderson",
        serviceType: "General Service",
        vehicleMake: "Toyota",
        vehicleModel: "Camry",
        vehicleYear: 2020,
        vehicleRego: "ABC123",
        appointmentDate: new Date("2025-01-15"),
        appointmentTime: "10:00 AM",
        notes: "Test booking",
      })
    ).rejects.toThrow(/mechanic desk|not available through the api|not_implemented/i);
  });

  it("prevents unauthenticated users from listing bookings", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx as any);

    await expect(caller.bookings.list()).rejects.toThrow();
  });

  it("disables booking admin status updates via API (bookings are handled by Mechanic Desk)", async () => {
    const admin: AuthenticatedUser = {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const ctx = createTestContext(admin);
    const caller = appRouter.createCaller(ctx as any);

    await expect(
      caller.bookings.updateStatus({
        id: 1,
        status: "confirmed",
        adminNotes: "Test update",
      })
    ).rejects.toThrow(/mechanic desk|not available through the api|not_implemented/i);
  });
});
