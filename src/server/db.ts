import crypto from "crypto";

export type BookingKind = "DIAGNOSTICS";
export type BookingStatus = "NEW" | "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "IN_PROGRESS" | "COMPLETED";

export type QuoteCategory = "BRAKES" | "WOF_REPAIRS" | "SERVICING" | "OTHER";
export type QuoteUrgency = "TODAY" | "THIS_WEEK" | "FLEXIBLE";
export type QuoteRequestStatus = "NEW" | "CONTACTED" | "BOOKED" | "IN_PROGRESS" | "COMPLETED" | "CLOSED";

export type JobStatus = "NEW" | "NEEDS_QUOTE" | "QUOTED" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type ServiceReportType = "DIAGNOSTICS" | "PPI";
export type ServiceReportStatus = "DRAFT" | "FINAL";

export type ServiceReportRecord = {
  id: string;
  bookingId: string;
  type: ServiceReportType;
  status: ServiceReportStatus;
  dataJson: any;
  publicToken: string;
  emailedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type JobRecord = {
  id: string;
  publicId: string;
  status: JobStatus;

  title: string;
  description: string | null;
  internalNotes: string | null;

  customerId: string;
  addressId: string;
  vehicleId: string | null;

  quoteRequestId: string | null;
  bookingId: string | null;

  scheduledStart: Date | null;
  scheduledEnd: Date | null;

  createdAt: Date;
  updatedAt: Date;
};

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

export type CreateJobInput = {
  status?: JobStatus | null;
  title: string;
  description?: string | null;
  internalNotes?: string | null;
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
  vehicle?: {
    plate?: string | null;
    make?: string | null;
    model?: string | null;
    year?: number | null;
    fuel?: string | null;
    odometer?: string | null;
  } | null;
};

function randomPublicId(prefix: string) {
  // URL-safe short id: 10 chars approx (base64url)
  const id = crypto.randomBytes(8).toString("base64url");
  return `${prefix}_${id}`;
}

function hasDbEnv() {
  return Boolean(process.env.DATABASE_URL);
}

export type DbHealthResult = {
  ok: boolean;
  latencyMs: number;
  error?: string;
};

export class DbUnavailableError extends Error {
  readonly code = "DB_UNAVAILABLE";
  constructor(message: string) {
    super(message);
    this.name = "DbUnavailableError";
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isLikelyDbConnectivityError(err: unknown) {
  const msg = String((err as any)?.message || "");
  const code = String((err as any)?.code || "");

  // Prisma + Postgres connectivity failures commonly show as:
  // - P1001 / P1002
  // - "Can't reach database server"
  // - "ECONNREFUSED" / "ETIMEDOUT" / "ENOTFOUND"
  return (
    code === "P1001" ||
    code === "P1002" ||
    msg.toLowerCase().includes("can't reach database server") ||
    msg.toLowerCase().includes("cant reach database server") ||
    msg.toLowerCase().includes("econnrefused") ||
    msg.toLowerCase().includes("etimedout") ||
    msg.toLowerCase().includes("enotfound") ||
    msg.toLowerCase().includes("connection terminated")
  );
}

async function withDbRetries<T>(fn: () => Promise<T>): Promise<T> {
  // Short, bounded retry with jitter-like increasing delays.
  const delays = [0, 120, 300];
  let lastErr: unknown;
  for (let attempt = 0; attempt < delays.length; attempt++) {
    if (delays[attempt] > 0) await sleep(delays[attempt]);
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isLikelyDbConnectivityError(err) || attempt === delays.length - 1) throw err;
    }
  }
  throw lastErr;
}

export async function dbHealthCheck(): Promise<DbHealthResult> {
  if (isDevNoDb()) return { ok: true, latencyMs: 0 };
  if (!hasDbEnv()) return { ok: false, latencyMs: 0, error: "Missing DATABASE_URL" };

  const started = Date.now();
  try {
    const { prisma } = await import("@/server/prisma");

    const timeoutMs = Number(process.env.DB_HEALTHCHECK_TIMEOUT_MS || "5000") || 5000;
    await withDbRetries(async () => {
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error("DB healthcheck timeout")), timeoutMs)),
      ]);
    });

    return { ok: true, latencyMs: Date.now() - started };
  } catch (err: any) {
    const msg = String(err?.message || "DB healthcheck failed");
    return { ok: false, latencyMs: Date.now() - started, error: msg };
  }
}

export async function assertDbHealthyOrThrow() {
  const health = await dbHealthCheck();
  if (!health.ok) {
    throw new DbUnavailableError(health.error || "Database is currently unavailable");
  }
  return health;
}

export function isDevNoDb() {
  return process.env.DEV_NO_DB === "true" || !hasDbEnv();
}

type DbAdapter = {
  createDiagnosticsBooking(input: CreateDiagnosticsBookingInput): Promise<BookingRecord>;
  createQuoteRequest(input: CreateQuoteRequestInput): Promise<QuoteRequestRecord>;
  createJob(input: CreateJobInput): Promise<JobRecord>;
  listJobs(limit: number): Promise<JobRecord[]>;
  updateJobStatus(where: { id: string }, input: { status: JobStatus }): Promise<JobRecord>;
  getJobById(id: string): Promise<JobRecord | null>;
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

  createOrGetServiceReportForBooking(input: { bookingId: string; type: ServiceReportType }): Promise<ServiceReportRecord>;
  updateServiceReportData(where: { id: string }, input: { status?: ServiceReportStatus; dataJson: any }): Promise<ServiceReportRecord>;
  markServiceReportEmailed(where: { id: string }, input: { emailedAt: Date }): Promise<ServiceReportRecord>;
  getServiceReportByPublicToken(token: string): Promise<ServiceReportRecord | null>;
};

declare global {
  // eslint-disable-next-line no-var
  var __devNoDbStore:
    | {
        bookings: Map<string, BookingRecord>;
        quoteRequests: Map<string, QuoteRequestRecord>;
        jobs: Map<string, JobRecord>;
        serviceReports: Map<string, ServiceReportRecord>;
        idempotency: Map<string, { scope: string; key: string; createdAt: Date }>;
      }
    | undefined;
}

const mem =
  global.__devNoDbStore ||
  (global.__devNoDbStore = {
    bookings: new Map<string, BookingRecord>(),
    quoteRequests: new Map<string, QuoteRequestRecord>(),
    jobs: new Map<string, JobRecord>(),
    serviceReports: new Map<string, ServiceReportRecord>(),
    idempotency: new Map<string, { scope: string; key: string; createdAt: Date }>(),
  });

function idemMapKey(scope: string, key: string) {
  return `${scope}:${key}`;
}

function randomPublicToken() {
  return crypto.randomBytes(24).toString("base64url");
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

  async createJob(input) {
    const id = crypto.randomUUID();
    const now = new Date();
    const rec: JobRecord = {
      id,
      publicId: randomPublicId("job"),
      status: (input.status ?? "NEW") as any,
      title: input.title,
      description: input.description ?? null,
      internalNotes: input.internalNotes ?? null,
      customerId: randomPublicId("cust"),
      addressId: randomPublicId("addr"),
      vehicleId: input.vehicle ? randomPublicId("veh") : null,
      quoteRequestId: null,
      bookingId: null,
      scheduledStart: null,
      scheduledEnd: null,
      createdAt: now,
      updatedAt: now,
    };
    mem.jobs.set(id, rec);
    return rec;
  },

  async listJobs(limit) {
    return Array.from(mem.jobs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  },

  async updateJobStatus(where, input) {
    const existing = mem.jobs.get(where.id);
    if (!existing) throw new Error("Job not found");
    const updated: JobRecord = {
      ...existing,
      status: input.status,
      updatedAt: new Date(),
    };
    mem.jobs.set(where.id, updated);
    return updated;
  },

  async getJobById(id) {
    return mem.jobs.get(id) ?? null;
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

  async createOrGetServiceReportForBooking(input) {
    const existing = Array.from(mem.serviceReports.values()).find((r) => r.bookingId === input.bookingId && r.type === input.type);
    if (existing) return existing;
    const id = crypto.randomUUID();
    const now = new Date();
    const rec: ServiceReportRecord = {
      id,
      bookingId: input.bookingId,
      type: input.type,
      status: "DRAFT",
      dataJson: {
        version: 1,
        type: input.type,
        title: input.type === "DIAGNOSTICS" ? "Diagnostics Report" : "Pre-Purchase Inspection Report",
        summary: "",
        contentMarkdown: "",
        attachments: [],
      },
      publicToken: randomPublicToken(),
      emailedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    mem.serviceReports.set(id, rec);
    return rec;
  },

  async updateServiceReportData(where, input) {
    const existing = mem.serviceReports.get(where.id);
    if (!existing) throw new Error("Service report not found");
    const updated: ServiceReportRecord = {
      ...existing,
      status: input.status ?? existing.status,
      dataJson: input.dataJson,
      updatedAt: new Date(),
    };
    mem.serviceReports.set(where.id, updated);
    return updated;
  },

  async markServiceReportEmailed(where, input) {
    const existing = mem.serviceReports.get(where.id);
    if (!existing) throw new Error("Service report not found");
    const updated: ServiceReportRecord = {
      ...existing,
      emailedAt: input.emailedAt,
      updatedAt: new Date(),
    };
    mem.serviceReports.set(where.id, updated);
    return updated;
  },

  async getServiceReportByPublicToken(token) {
    return Array.from(mem.serviceReports.values()).find((r) => r.publicToken === token) ?? null;
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

  async createJob(input) {
    const { prisma } = await import("@/server/prisma");
    const job = await (prisma as any).$transaction(async (tx: any) => {
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

      const vehicle = input.vehicle
        ? await tx.vehicle.create({
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
          })
        : null;

      return tx.job.create({
        data: {
          publicId: randomPublicId("job"),
          status: (input.status ?? "NEW") as any,
          title: input.title,
          description: input.description ?? null,
          internalNotes: input.internalNotes ?? null,
          customerId: customer.id,
          addressId: address.id,
          vehicleId: vehicle?.id ?? null,
        },
      });
    });
    return job as any;
  },

  async listJobs(limit) {
    const { prisma } = await import("@/server/prisma");
    const rows = await (prisma as any).job.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows as any;
  },

  async updateJobStatus(where, input) {
    const { prisma } = await import("@/server/prisma");
    const job = await (prisma as any).job.update({
      where: { id: where.id },
      data: { status: input.status },
    });
    return job as any;
  },

  async getJobById(id) {
    const { prisma } = await import("@/server/prisma");
    return (await (prisma as any).job.findUnique({ where: { id } })) as any;
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

  async createOrGetServiceReportForBooking(input) {
    const { prisma } = await import("@/server/prisma");
    const existing = await (prisma as any).serviceReport.findFirst({
      where: { bookingId: input.bookingId, type: input.type },
    });
    if (existing) return existing as any;

    const dataJson = {
      version: 1,
      type: input.type,
      title: input.type === "DIAGNOSTICS" ? "Diagnostics Report" : "Pre-Purchase Inspection Report",
      summary: "",
      contentMarkdown: "",
      attachments: [],
    };

    const created = await (prisma as any).serviceReport.create({
      data: {
        bookingId: input.bookingId,
        type: input.type,
        status: "DRAFT",
        dataJson,
        publicToken: randomPublicToken(),
      },
    });
    return created as any;
  },

  async updateServiceReportData(where, input) {
    const { prisma } = await import("@/server/prisma");
    const updated = await (prisma as any).serviceReport.update({
      where: { id: where.id },
      data: {
        status: input.status,
        dataJson: input.dataJson,
      },
    });
    return updated as any;
  },

  async markServiceReportEmailed(where, input) {
    const { prisma } = await import("@/server/prisma");
    const updated = await (prisma as any).serviceReport.update({
      where: { id: where.id },
      data: { emailedAt: input.emailedAt },
    });
    return updated as any;
  },

  async getServiceReportByPublicToken(token) {
    const { prisma } = await import("@/server/prisma");
    return (await (prisma as any).serviceReport.findUnique({ where: { publicToken: token } })) as any;
  },
};

export function db(): DbAdapter {
  return isDevNoDb() ? memoryAdapter : prismaAdapter;
}
