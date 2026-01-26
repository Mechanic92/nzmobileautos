import { and, eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertMagicLink,
  InsertQuoteRequest,
  InsertUser,
  magicLinks,
  quoteRequests,
  testimonials,
  users,
  serviceAreas,
  inspectionReports,
  InsertInspectionReport,
} from "./schema";
import { nanoid } from "nanoid";
import { ENV } from './server/_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function createMagicLinkToken(options: {
  email?: string;
  phone?: string;
  openId: string;
  ttlMinutes?: number;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const ttlMinutes = typeof options.ttlMinutes === "number" ? options.ttlMinutes : 15;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
  const token = nanoid(48);

  const record: InsertMagicLink = {
    token,
    openId: options.openId,
    email: options.email,
    phone: options.phone,
    expiresAt,
  };

  await db.insert(magicLinks).values(record);
  return { token, expiresAt };
}

export async function consumeMagicLinkToken(token: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const rows = await db
    .select()
    .from(magicLinks)
    .where(and(eq(magicLinks.token, token), isNull(magicLinks.consumedAt)))
    .limit(1);

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  if (new Date(row.expiresAt).getTime() < Date.now()) {
    return null;
  }

  await db
    .update(magicLinks)
    .set({ consumedAt: new Date() })
    .where(eq(magicLinks.id, row.id));

  return row;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    const normalizedEmail = (user.email || "").trim().toLowerCase();
    const normalizedPhone = (user.phone || "").trim();
    const ownerEmail = (ENV.ownerEmail || "").trim().toLowerCase();
    const ownerPhone = (ENV.ownerPhone || "").trim();

    const isOwner =
      (!!ownerEmail && !!normalizedEmail && normalizedEmail === ownerEmail) ||
      (!!ownerPhone && !!normalizedPhone && normalizedPhone === ownerPhone) ||
      (!!ENV.ownerOpenId && user.openId === ENV.ownerOpenId);

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (isOwner) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Quote Requests
export async function createQuoteRequest(data: InsertQuoteRequest) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(quoteRequests).values(data);
  return result;
}

export async function getAllQuoteRequests() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(quoteRequests).orderBy(quoteRequests.createdAt);
}

// Testimonials
export async function getApprovedTestimonials() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(testimonials).where(eq(testimonials.isApproved, true)).orderBy(testimonials.createdAt);
}

// Service Areas
export async function getActiveServiceAreas() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(serviceAreas).where(eq(serviceAreas.isActive, true));
}

// Blog Posts
export async function getPublishedBlogPosts() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const { blogPosts } = await import("./schema");
  return await db.select().from(blogPosts).where(eq(blogPosts.isPublished, true)).orderBy(blogPosts.createdAt);
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const { blogPosts } = await import("./schema");
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Bookings
export async function createBooking(data: any) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { bookings } = await import("./schema");
  const result = await db.insert(bookings).values(data);
  return result;
}

export async function getAllBookings() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const { bookings } = await import("./schema");
  return await db.select().from(bookings).orderBy(bookings.appointmentDate);
}

export async function getBookingsByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const { bookings } = await import("./schema");
  return await db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(bookings.appointmentDate);
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const { bookings } = await import("./schema");
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateBookingStatus(
  id: number,
  status: string,
  adminNotes?: string,
  estimatedCost?: number,
  actualCost?: number,
  paymentStatus?: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { bookings } = await import("./schema");
  const updateData: any = { status };
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
  if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost;
  if (actualCost !== undefined) updateData.actualCost = actualCost;
  if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

  await db.update(bookings).set(updateData).where(eq(bookings.id, id));
}

export async function updateBookingStripeInfo(id: number, stripeSessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { bookings } = await import("./schema");
  await db.update(bookings).set({ stripeSessionId }).where(eq(bookings.id, id));
}

// Service History
export async function createServiceHistory(data: any) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { serviceHistory } = await import("./schema");
  const result = await db.insert(serviceHistory).values(data);
  return result;
}

export async function getServiceHistoryByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const { serviceHistory } = await import("./schema");
  return await db.select().from(serviceHistory).where(eq(serviceHistory.userId, userId)).orderBy(serviceHistory.serviceDate);
}

// Chat Conversations
export async function createChatConversation(data: any) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { chatConversations } = await import("./schema");
  const result = await db.insert(chatConversations).values(data);
  return result;
}

export async function getChatConversationBySessionId(sessionId: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const { chatConversations } = await import("./schema");
  const result = await db.select().from(chatConversations).where(eq(chatConversations.sessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateChatConversation(sessionId: string, messages: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { chatConversations } = await import("./schema");
  await db.update(chatConversations).set({ messages, updatedAt: new Date() }).where(eq(chatConversations.sessionId, sessionId));
}

// Availability Slots
export async function getAvailabilitySlots(date: string) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const { availabilitySlots } = await import("./schema");
  return await db.select().from(availabilitySlots).where(eq(availabilitySlots.date, date));
}

export async function updateAvailabilitySlot(date: string, timeSlot: string, increment: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { availabilitySlots } = await import("./schema");
  const slots = await db.select().from(availabilitySlots).where(eq(availabilitySlots.date, date)).limit(1);

  if (slots.length > 0) {
    const currentBookings = slots[0].currentBookings + increment;
    const isAvailable = currentBookings < slots[0].maxBookings;
    await db.update(availabilitySlots).set({ currentBookings, isAvailable }).where(eq(availabilitySlots.date, date));
  }
}

// Inspection Reports
export async function createInspectionReport(data: {
  bookingId: number;
  type?: "pre_purchase" | "service";
  schemaVersion?: string;
  data: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const reportData: InsertInspectionReport = {
    bookingId: data.bookingId,
    type: (data.type ?? "pre_purchase") as any,
    schemaVersion: data.schemaVersion ?? "v1",
    data: data.data,
    publicToken: nanoid(32),
  };

  const result = await db.insert(inspectionReports).values(reportData);
  return result;
}

export async function getInspectionReportByBookingId(bookingId: number) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const rows = await db
    .select()
    .from(inspectionReports)
    .where(eq(inspectionReports.bookingId, bookingId))
    .limit(1);

  return rows.length > 0 ? rows[0] : undefined;
}

export async function updateInspectionReport(id: number, data: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(inspectionReports)
    .set({ data, updatedAt: new Date() })
    .where(eq(inspectionReports.id, id));
}

export async function getInspectionReportByPublicToken(token: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const rows = await db
    .select()
    .from(inspectionReports)
    .where(eq(inspectionReports.publicToken, token))
    .limit(1);

  return rows.length > 0 ? rows[0] : undefined;
}

export async function seedBlogPosts() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot seed blog posts: database not available");
    return;
  }

  const { blogPosts } = await import("./schema");
  const { BLOG_POSTS } = await import("./server/_core/blog-data");

  for (const post of BLOG_POSTS) {
    const existing = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, post.slug))
      .limit(1);

    if (existing.length === 0) {
      console.log(`[Database] Seeding blog post: ${post.title}`);
      await db.insert(blogPosts).values(post);
    }
  }
}
