import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Passwordless authentication tokens (magic links) sent via SMS/email.
 */
export const magicLinks = mysqlTable("magic_links", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  openId: varchar("openId", { length: 64 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  expiresAt: timestamp("expiresAt").notNull(),
  consumedAt: timestamp("consumedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MagicLink = typeof magicLinks.$inferSelect;
export type InsertMagicLink = typeof magicLinks.$inferInsert;

/**
 * Quote requests from customers
 */
export const quoteRequests = mysqlTable("quote_requests", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  vehicleMake: varchar("vehicleMake", { length: 100 }),
  vehicleModel: varchar("vehicleModel", { length: 100 }),
  vehicleYear: int("vehicleYear"),
  serviceType: varchar("serviceType", { length: 100 }).notNull(),
  suburb: varchar("suburb", { length: 100 }),
  message: text("message"),
  status: mysqlEnum("status", ["pending", "contacted", "completed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type InsertQuoteRequest = typeof quoteRequests.$inferInsert;

/**
 * Customer testimonials and reviews
 */
export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  rating: int("rating").notNull(), // 1-5 stars
  review: text("review").notNull(),
  serviceType: varchar("serviceType", { length: 100 }),
  isApproved: boolean("isApproved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

/**
 * Service areas coverage
 */
export const serviceAreas = mysqlTable("service_areas", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  additionalCharge: boolean("additionalCharge").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
});

export type ServiceArea = typeof serviceAreas.$inferSelect;
export type InsertServiceArea = typeof serviceAreas.$inferInsert;

/**
 * Blog posts
 */
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  category: varchar("category", { length: 100 }),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Customer bookings for services
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // Optional: links to authenticated user
  customerName: varchar("customerName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  vehicleMake: varchar("vehicleMake", { length: 100 }).notNull(),
  vehicleModel: varchar("vehicleModel", { length: 100 }).notNull(),
  vehicleYear: int("vehicleYear").notNull(),
  vehicleRego: varchar("vehicleRego", { length: 50 }),
  serviceType: varchar("serviceType", { length: 100 }).notNull(),
  servicePackage: varchar("servicePackage", { length: 50 }), // Bronze, Silver, Gold
  appointmentDate: timestamp("appointmentDate").notNull(),
  appointmentTime: varchar("appointmentTime", { length: 20 }).notNull(), // e.g., "09:00-11:00"
  suburb: varchar("suburb", { length: 100 }).notNull(),
  address: text("address").notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "confirmed", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  estimatedCost: int("estimatedCost"),
  actualCost: int("actualCost"),
  adminNotes: text("adminNotes"),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Service history for completed work
 */
export const serviceHistory = mysqlTable("service_history", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  userId: int("userId"),
  serviceDate: timestamp("serviceDate").notNull(),
  serviceType: varchar("serviceType", { length: 100 }).notNull(),
  vehicleMake: varchar("vehicleMake", { length: 100 }).notNull(),
  vehicleModel: varchar("vehicleModel", { length: 100 }).notNull(),
  vehicleRego: varchar("vehicleRego", { length: 50 }),
  workPerformed: text("workPerformed").notNull(),
  partsUsed: text("partsUsed"),
  totalCost: int("totalCost").notNull(),
  nextServiceDue: timestamp("nextServiceDue"),
  invoiceUrl: varchar("invoiceUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ServiceHistory = typeof serviceHistory.$inferSelect;
export type InsertServiceHistory = typeof serviceHistory.$inferInsert;

/**
 * AI Chatbot conversation history
 */
export const chatConversations = mysqlTable("chat_conversations", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 255 }).notNull(),
  userId: int("userId"),
  customerName: varchar("customerName", { length: 255 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  messages: text("messages").notNull(), // JSON array of messages
  isResolved: boolean("isResolved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;

/**
 * Availability slots for booking calendar
 */
export const availabilitySlots = mysqlTable("availability_slots", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 20 }).notNull(), // YYYY-MM-DD format
  timeSlot: varchar("timeSlot", { length: 20 }).notNull(), // e.g., "09:00-11:00"
  isAvailable: boolean("isAvailable").default(true).notNull(),
  maxBookings: int("maxBookings").default(1).notNull(),
  currentBookings: int("currentBookings").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;
export type InsertAvailabilitySlot = typeof availabilitySlots.$inferInsert;

/**
 * Structured inspection reports (e.g. pre-purchase inspections) linked to bookings
 */
export const inspectionReports = mysqlTable("inspection_reports", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  type: mysqlEnum("type", ["pre_purchase", "service"]).default("pre_purchase").notNull(),
  schemaVersion: varchar("schemaVersion", { length: 20 }).default("v1").notNull(),
  /**
   * JSON-encoded structure of sections, items, statuses, comments, and photos
   */
  data: text("data").notNull(),
  /**
   * Public token used to generate a customer-facing link to this report
   */
  publicToken: varchar("publicToken", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InspectionReport = typeof inspectionReports.$inferSelect;
export type InsertInspectionReport = typeof inspectionReports.$inferInsert;
