import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend with role field for attendee vs staff/admin distinction.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["attendee", "staff", "admin"]).default("attendee").notNull(),
  venueId: int("venueId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Venues table - represents a stadium or arena
 */
export const venues = mysqlTable("venues", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  capacity: int("capacity"),
  mapUrl: text("mapUrl"), // URL to venue map image or GeoJSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Venue = typeof venues.$inferSelect;
export type InsertVenue = typeof venues.$inferInsert;

/**
 * Zones/Sections table - represents sections within a venue
 */
export const zones = mysqlTable("zones", {
  id: int("id").autoincrement().primaryKey(),
  venueId: int("venueId").notNull(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Section 101", "Lower Bowl North"
  zoneType: mysqlEnum("zoneType", ["seating", "concourse", "entrance", "exit"]).notNull(),
  coordinates: json("coordinates"), // { x, y, width, height } for map overlay
  crowdDensity: mysqlEnum("crowdDensity", ["low", "medium", "high"]).default("low").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Zone = typeof zones.$inferSelect;
export type InsertZone = typeof zones.$inferInsert;

/**
 * Facilities table - represents concessions, restrooms, first-aid, etc.
 */
export const facilities = mysqlTable("facilities", {
  id: int("id").autoincrement().primaryKey(),
  venueId: int("venueId").notNull(),
  zoneId: int("zoneId"),
  name: varchar("name", { length: 255 }).notNull(),
  facilityType: mysqlEnum("facilityType", [
    "concession",
    "restroom",
    "first_aid",
    "information",
    "parking",
    "entrance",
    "exit",
  ]).notNull(),
  coordinates: json("coordinates"), // { x, y } for map positioning
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Facility = typeof facilities.$inferSelect;
export type InsertFacility = typeof facilities.$inferInsert;

/**
 * Wait times table - real-time wait time tracking for facilities
 */
export const waitTimes = mysqlTable("waitTimes", {
  id: int("id").autoincrement().primaryKey(),
  facilityId: int("facilityId").notNull(),
  venueId: int("venueId").notNull(),
  waitMinutes: int("waitMinutes").default(0).notNull(),
  status: mysqlEnum("status", ["low", "medium", "high"]).default("low").notNull(),
  updatedBy: int("updatedBy"), // Staff member who updated this
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WaitTime = typeof waitTimes.$inferSelect;
export type InsertWaitTime = typeof waitTimes.$inferInsert;

/**
 * Crowd density table - tracks crowd levels in zones over time
 */
export const crowdDensity = mysqlTable("crowdDensity", {
  id: int("id").autoincrement().primaryKey(),
  zoneId: int("zoneId").notNull(),
  venueId: int("venueId").notNull(),
  density: mysqlEnum("density", ["low", "medium", "high"]).default("low").notNull(),
  estimatedCount: int("estimatedCount").default(0),
  updatedBy: int("updatedBy"), // Staff member who updated this
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrowdDensity = typeof crowdDensity.$inferSelect;
export type InsertCrowdDensity = typeof crowdDensity.$inferInsert;

/**
 * Events table - represents events happening at the venue
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  venueId: int("venueId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  eventType: mysqlEnum("eventType", ["sports", "concert", "conference", "other"]).notNull(),
  status: mysqlEnum("status", ["scheduled", "live", "completed"]).default("scheduled").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Event moments table - key moments during a live event (goals, scores, etc.)
 */
export const eventMoments = mysqlTable("eventMoments", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  timestamp: timestamp("timestamp").notNull(),
  momentType: mysqlEnum("momentType", [
    "goal",
    "score",
    "timeout",
    "period_end",
    "announcement",
  ]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventMoment = typeof eventMoments.$inferSelect;
export type InsertEventMoment = typeof eventMoments.$inferInsert;

/**
 * Alerts table - venue-wide announcements and alerts
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  venueId: int("venueId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  alertType: mysqlEnum("alertType", [
    "announcement",
    "gate_change",
    "emergency",
    "special_offer",
    "info",
  ]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  targetZones: json("targetZones"), // Array of zone IDs or null for venue-wide
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy").notNull(), // Staff member who created this
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * User preferences table - stores user-specific settings and saved locations
 */
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  venueId: int("venueId"),
  savedSeatSection: varchar("savedSeatSection", { length: 255 }),
  savedSeatNumber: varchar("savedSeatNumber", { length: 255 }),
  notificationsEnabled: boolean("notificationsEnabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Seats table - represents individual seats in the venue
 */
export const seats = mysqlTable("seats", {
  id: int("id").autoincrement().primaryKey(),
  venueId: int("venueId").notNull(),
  zoneId: int("zoneId").notNull(),
  sectionNumber: varchar("sectionNumber", { length: 50 }).notNull(),
  rowNumber: varchar("rowNumber", { length: 50 }).notNull(),
  seatNumber: varchar("seatNumber", { length: 50 }).notNull(),
  coordinates: json("coordinates"), // { x, y } for map positioning
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Seat = typeof seats.$inferSelect;
export type InsertSeat = typeof seats.$inferInsert;
