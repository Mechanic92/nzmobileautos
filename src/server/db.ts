import crypto from "crypto";

export type BookingKind = "DIAGNOSTICS";
export type BookingStatus = "NEW" | "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "IN_PROGRESS" | "COMPLETED";

export type QuoteCategory = "BRAKES" | "WOF_REPAIRS" | "SERVICING" | "OTHER";
export type QuoteUrgency = "TODAY" | "THIS_WEEK" | "FLEXIBLE";
export type QuoteRequestStatus = "NEW" | "CONTACTED" | "BOOKED" | "IN_PROGRESS" | "COMPLETED" | "CLOSED";

export type BookingRecord = {
  id: string;
  publicId: string;
  kind: BookingKind;
  status: BookingStatus;

  customerId: string;
  addressId: string;
  vehicleId: string | null;

  slotStart: Date;
  slotEnd: Date;
  afterHours: boolean;

  symptomPreset: string | null;
  notes: string | null;

  pricingSnapshotJson: any;

  stripeSessionId: string | null;
  paymentExpiresAt: Date | null;

  serviceM8JobId: string | null;
  serviceM8Url: string | null;

  createdAt: Date;
  updatedAt: Date;
};

export type QuoteRequestRecord = {
  id: string;
  publicId: string;
  status: QuoteRequestStatus;
  category: QuoteCategory;
  urgency: QuoteUrgency;

  customerId: string;
  addressId: string;
  vehicleId: string | null;

  symptoms: any;
  description: string | null;
  pricingSnapshotJson: any;

  serviceM8JobId: string | null;
  serviceM8Url: string | null;

  createdAt: Date;
  updatedAt: Date;
};

export type CreateDiagnosticsBookingInput = {
  customer: {
    fullName: string;
    email?: string | null;
    phone?: string | null;
  };
  address: {
    line1: string;
    suburb: string;
    city: string;
    postcode?: string | null;
    lat?: number | null;
    lng?: number | null;
    travelBand?: string | null;
  };
  vehicle: {
    plate?: string | null;
    make?: string | null;
    model?: string | null;
    year?: number | null;
    fuel?: string | null;
    odometer?: string | null;
  };
  slotStart: Date;
  slotEnd: Date;
  afterHours: boolean;
  symptomPreset?: string | null;
  notes?: string | null;
  pricingSnapshotJson: any;
  paymentExpiresAt: Date | null;
};

export type CreateQuoteRequestInput = {
  category: QuoteCategory;
  urgency: QuoteUrgency;
  customer: {
    fullName: string;
    email?: string | null;
    phone?: string | null;
  };
  address: {
    line1: string;
    suburb: string;
    city: string;
    postcode?: string | null;
    lat?: number | null;
    lng?: number | null;
    travelBand?: string | null;
  };
  vehicle: {
    plate?: string | null;
    make?: string | null;
    model?: string | null;
    year?: number | null;
    fuel?: string | null;
    odometer?: string | null;
  };
  symptoms: string[];
  description: string;
  pricingSnapshotJson: any;
};

function randomPublicId(prefix: string) {
  // URL-safe short id: 10 chars approx (base64url)
  const id = crypto.randomBytes(8).toString("base64url");
  return `${prefix}_${id}`;
}

function hasDbEnv() {
  return Boolean(process.env.DATABASE_URL);
}

export function isDevNoDb() {
  return process.env.DEV_NO_DB === "true" || !hasDbEnv();
}

type DbAdapter = {
  createDiagnosticsBooking(input: CreateDiagnosticsBookingInput): Promise<BookingRecord>;
  createQuoteRequest(input: CreateQuoteRequestInput): Promise<QuoteRequestRecord>;
  updateQuoteRequestStatus(where: { id: string }, input: { status: QuoteRequestStatus }): Promise<QuoteRequestRecord>;
  updateBookingStripeSession(where: { id: string }, input: { stripeSessionId: string | null }): Promise<BookingRecord>;
  updateBookingStatus(where: { id: string }, input: { status: BookingStatus }): Promise<BookingRecord>;
  getBookingById(id: string): Promise<BookingRecord | null>;
  listBookings(limit: number): Promise<BookingRecord[]>;
  listQuoteRequests(limit: number): Promise<QuoteRequestRecord[]>;
  expirePendingBookings(now: Date): Promise<number>;
  createIdempotencyKeyOnce(input: {
    scope: string;
    key: string;
    requestHash?: string | null;
    responseJson?: any;
  }): Promise<{ created: boolean }>;
};

declare global {
  // eslint-disable-next-line no-var
  var __devNoDbStore:
    | {
        bookings: Map<string, BookingRecord>;
        quoteRequests: Map<string, QuoteRequestRecord>;
        idempotency: Map<string, { scope: string; key: string; createdAt: Date }>;
      }
    | undefined;
}

const mem =
  global.__devNoDbStore ||
  (global.__devNoDbStore = {
    bookings: new Map<string, BookingRecord>(),
    quoteRequests: new Map<string, QuoteRequestRecord>(),
    idempotency: new Map<string, { scope: string; key: string; createdAt: Date }>(),
  });

function idemMapKey(scope: string, key: string) {
  return `${scope}:${key}`;
}

const memoryAdapter: DbAdapter = {
  async createDiagnosticsBooking(input) {
    const id = crypto.randomUUID();
    const now = new Date();
    const rec: BookingRecord = {
      id,
      publicId: randomPublicId("bk"),
      kind: "DIAGNOSTICS",
      status: "PENDING_PAYMENT",

      customerId: randomPublicId("cust"),
      addressId: randomPublicId("addr"),
      vehicleId: randomPublicId("veh"),

      slotStart: input.slotStart,
      slotEnd: input.slotEnd,
      afterHours: input.afterHours,

      symptomPreset: input.symptomPreset ?? null,
      notes: input.notes ?? null,

      pricingSnapshotJson: input.pricingSnapshotJson,

      stripeSessionId: null,
      paymentExpiresAt: input.paymentExpiresAt,

      serviceM8JobId: null,
      serviceM8Url: null,

      createdAt: now,
      updatedAt: now,
    };
    mem.bookings.set(id, rec);
    return rec;
  },

  async createQuoteRequest(input) {
    const id = crypto.randomUUID();
    const now = new Date();
    const rec: QuoteRequestRecord = {
      id,
      publicId: randomPublicId("qr"),
      status: "NEW",
      category: input.category,
      urgency: input.urgency,

      customerId: randomPublicId("cust"),
      addressId: randomPublicId("addr"),
      vehicleId: randomPublicId("veh"),

      symptoms: input.symptoms,
      description: input.description,
      pricingSnapshotJson: input.pricingSnapshotJson,

      serviceM8JobId: null,
      serviceM8Url: null,

      createdAt: now,
      updatedAt: now,
    };
    mem.quoteRequests.set(id, rec);
    return rec;
  },

  async updateQuoteRequestStatus(where, input) {
    const existing = mem.quoteRequests.get(where.id);
    if (!existing) throw new Error("Quote request not found");
    const updated: QuoteRequestRecord = {
      ...existing,
      status: input.status,
      updatedAt: new Date(),
    };
    mem.quoteRequests.set(where.id, updated);
    return updated;
  },

  async listQuoteRequests(limit) {
    return Array.from(mem.quoteRequests.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  },

  async updateBookingStatus(where, input) {
    const existing = mem.bookings.get(where.id);
    if (!existing) throw new Error("Booking not found");
    const updated: BookingRecord = {
      ...existing,
      status: input.status,
      updatedAt: new Date(),
    };
    mem.bookings.set(where.id, updated);
    return updated;
  },

  async updateBookingStripeSession(where, input) {
    const existing = mem.bookings.get(where.id);
    if (!existing) throw new Error("Booking not found");
    const updated: BookingRecord = {
      ...existing,
      stripeSessionId: input.stripeSessionId,
      updatedAt: new Date(),
    };
    mem.bookings.set(where.id, updated);
    return updated;
  },

  async getBookingById(id) {
    return mem.bookings.get(id) ?? null;
  },

  async listBookings(limit) {
    return Array.from(mem.bookings.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  },

  async expirePendingBookings(now) {
    let count = 0;
    for (const b of mem.bookings.values()) {
      if (b.status === "PENDING_PAYMENT" && b.paymentExpiresAt && b.paymentExpiresAt.getTime() <= now.getTime()) {
        mem.bookings.set(b.id, { ...b, status: "EXPIRED", updatedAt: new Date() });
        count++;
      }
    }
    return count;
  },

  async createIdempotencyKeyOnce(input) {
    const k = idemMapKey(input.scope, input.key);
    if (mem.idempotency.has(k)) return { created: false };
    mem.idempotency.set(k, { scope: input.scope, key: input.key, createdAt: new Date() });
    return { created: true };
  },
};

const prismaAdapter: DbAdapter = {
  async createDiagnosticsBooking(input) {
    const { prisma } = await import("@/server/prisma");
    const booking = await (prisma as any).$transaction(async (tx: any) => {
      const email = (input.customer.email ?? "").trim().toLowerCase() || null;
      const phone = (input.customer.phone ?? "").trim() || null;

      const existingCustomer = await tx.customer.findFirst({
        where: {
          OR: [
            ...(email ? [{ email }] : []),
            ...(phone ? [{ phone }] : []),
          ],
        },
      });

      const customer =
        existingCustomer ??
        (await tx.customer.create({
          data: {
            publicId: randomPublicId("cust"),
            fullName: input.customer.fullName,
            email,
            phone,
          },
        }));

      const address = await tx.address.create({
        data: {
          publicId: randomPublicId("addr"),
          customerId: customer.id,
          line1: input.address.line1,
          suburb: input.address.suburb,
          city: input.address.city,
          postcode: input.address.postcode ?? null,
          lat: input.address.lat ?? null,
          lng: input.address.lng ?? null,
          travelBand: input.address.travelBand ?? null,
        },
      });

      const vehicle = await tx.vehicle.create({
        data: {
          publicId: randomPublicId("veh"),
          customerId: customer.id,
          plate: input.vehicle.plate ?? null,
          make: input.vehicle.make ?? null,
          model: input.vehicle.model ?? null,
          year: input.vehicle.year ?? null,
          fuel: input.vehicle.fuel ?? null,
          odometer: input.vehicle.odometer ?? null,
        },
      });

      return tx.booking.create({
        data: {
          publicId: randomPublicId("bk"),
          kind: "DIAGNOSTICS",
          status: "PENDING_PAYMENT",
          customerId: customer.id,
          addressId: address.id,
          vehicleId: vehicle.id,
          slotStart: input.slotStart,
          slotEnd: input.slotEnd,
          afterHours: input.afterHours,
          symptomPreset: input.symptomPreset ?? null,
          notes: input.notes ?? null,
          pricingSnapshotJson: input.pricingSnapshotJson,
          paymentExpiresAt: input.paymentExpiresAt,
        },
      });
    });

    return booking as any;
  },

  async createQuoteRequest(input) {
    const { prisma } = await import("@/server/prisma");
    const quote = await (prisma as any).$transaction(async (tx: any) => {
      const email = (input.customer.email ?? "").trim().toLowerCase() || null;
      const phone = (input.customer.phone ?? "").trim() || null;

      const existingCustomer = await tx.customer.findFirst({
        where: {
          OR: [
            ...(email ? [{ email }] : []),
            ...(phone ? [{ phone }] : []),
          ],
        },
      });

      const customer =
        existingCustomer ??
        (await tx.customer.create({
          data: {
            publicId: randomPublicId("cust"),
            fullName: input.customer.fullName,
            email,
            phone,
          },
        }));

      const address = await tx.address.create({
        data: {
          publicId: randomPublicId("addr"),
          customerId: customer.id,
          line1: input.address.line1,
          suburb: input.address.suburb,
          city: input.address.city,
          postcode: input.address.postcode ?? null,
          lat: input.address.lat ?? null,
          lng: input.address.lng ?? null,
          travelBand: input.address.travelBand ?? null,
        },
      });

      const vehicle = await tx.vehicle.create({
        data: {
          publicId: randomPublicId("veh"),
          customerId: customer.id,
          plate: input.vehicle.plate ?? null,
          make: input.vehicle.make ?? null,
          model: input.vehicle.model ?? null,
          year: input.vehicle.year ?? null,
          fuel: input.vehicle.fuel ?? null,
          odometer: input.vehicle.odometer ?? null,
        },
      });

      return tx.quoteRequest.create({
        data: {
          publicId: randomPublicId("qr"),
          status: "NEW",
          category: input.category,
          urgency: input.urgency,
          customerId: customer.id,
          addressId: address.id,
          vehicleId: vehicle.id,
          symptoms: input.symptoms,
          description: input.description,
          pricingSnapshotJson: input.pricingSnapshotJson,
        },
      });
    });
    return quote as any;
  },

  async updateQuoteRequestStatus(where, input) {
    const { prisma } = await import("@/server/prisma");
    const quote = await (prisma as any).quoteRequest.update({
      where: { id: where.id },
      data: { status: input.status },
    });
    return quote as any;
  },

  async listQuoteRequests(limit) {
    const { prisma } = await import("@/server/prisma");
    const rows = await (prisma as any).quoteRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows as any;
  },

  async updateBookingStatus(where, input) {
    const { prisma } = await import("@/server/prisma");
    const booking = await (prisma as any).booking.update({
      where: { id: where.id },
      data: { status: input.status },
    });
    return booking as any;
  },

  async updateBookingStripeSession(where, input) {
    const { prisma } = await import("@/server/prisma");
    const booking = await prisma.booking.update({
      where: { id: where.id },
      data: {
        stripeSessionId: input.stripeSessionId,
      },
    });
    return booking as any;
  },

  async getBookingById(id) {
    const { prisma } = await import("@/server/prisma");
    return (await prisma.booking.findUnique({ where: { id } })) as any;
  },

  async listBookings(limit) {
    const { prisma } = await import("@/server/prisma");
    return (await prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: limit })) as any;
  },

  async expirePendingBookings(now) {
    const { prisma } = await import("@/server/prisma");
    const res = await (prisma as any).booking.updateMany({
      where: { status: "PENDING_PAYMENT", paymentExpiresAt: { lte: now } },
      data: { status: "EXPIRED" },
    });
    return res.count;
  },

  async createIdempotencyKeyOnce(input) {
    const { prisma } = await import("@/server/prisma");
    try {
      await (prisma as any).idempotencyKey.create({
        data: {
          scope: input.scope,
          key: input.key,
          requestHash: input.requestHash ?? null,
          responseJson: input.responseJson ?? null,
        },
      });
      return { created: true };
    } catch {
      return { created: false };
    }
  },
};

export function db(): DbAdapter {
  return isDevNoDb() ? memoryAdapter : prismaAdapter;
}
