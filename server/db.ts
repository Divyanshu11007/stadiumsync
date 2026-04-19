import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  venues,
  zones,
  facilities,
  waitTimes,
  crowdDensity,
  alerts,
  events,
  eventMoments,
  userPreferences,
  seats,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

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
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
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

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Venue queries
export async function getVenueById(venueId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(venues).where(eq(venues.id, venueId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Zone queries
export async function getZonesByVenue(venueId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(zones).where(eq(zones.venueId, venueId));
}

// Facility queries
export async function getFacilitiesByVenue(venueId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(facilities).where(eq(facilities.venueId, venueId));
}

// Wait time queries
export async function getWaitTimesByVenue(venueId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(waitTimes).where(eq(waitTimes.venueId, venueId));
}

export async function updateWaitTime(
  facilityId: number,
  waitMinutes: number,
  status: "low" | "medium" | "high",
  updatedBy?: number
) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await db
    .select()
    .from(waitTimes)
    .where(eq(waitTimes.facilityId, facilityId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(waitTimes)
      .set({ waitMinutes, status, updatedBy, updatedAt: new Date() })
      .where(eq(waitTimes.facilityId, facilityId));
  }
}

// Crowd density queries
export async function getCrowdDensityByZone(zoneId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(crowdDensity)
    .where(eq(crowdDensity.zoneId, zoneId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCrowdDensity(
  zoneId: number,
  density: "low" | "medium" | "high",
  estimatedCount?: number,
  updatedBy?: number
) {
  const db = await getDb();
  if (!db) return;

  const existing = await db
    .select()
    .from(crowdDensity)
    .where(eq(crowdDensity.zoneId, zoneId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(crowdDensity)
      .set({ density, estimatedCount, updatedBy, updatedAt: new Date() })
      .where(eq(crowdDensity.zoneId, zoneId));
  }
}

// Alert queries
export async function getActiveAlertsByVenue(venueId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(alerts)
    .where(and(eq(alerts.venueId, venueId), eq(alerts.isActive, true)));
}

export async function createAlert(
  venueId: number,
  title: string,
  content: string,
  alertType: "announcement" | "gate_change" | "emergency" | "special_offer" | "info",
  priority: "low" | "medium" | "high",
  createdBy: number,
  targetZones?: number[],
  expiresAt?: Date
) {
  const db = await getDb();
  if (!db) return;

  await db.insert(alerts).values({
    venueId,
    title,
    content,
    alertType,
    priority,
    createdBy,
    targetZones: targetZones ? JSON.stringify(targetZones) : null,
    expiresAt,
    isActive: true,
  });
}

// Event queries
export async function getEventsByVenue(venueId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(events).where(eq(events.venueId, venueId));
}

export async function getEventMomentsByEvent(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(eventMoments).where(eq(eventMoments.eventId, eventId));
}

// Seat queries
export async function getSeatsBySection(venueId: number, sectionNumber: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(seats)
    .where(and(eq(seats.venueId, venueId), eq(seats.sectionNumber, sectionNumber)));
}

// User preferences queries
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserPreferences(
  userId: number,
  preferences: Partial<{
    venueId: number;
    savedSeatSection: string;
    savedSeatNumber: string;
    notificationsEnabled: boolean;
  }>
) {
  const db = await getDb();
  if (!db) return;

  const existing = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(userPreferences)
      .set({ ...preferences, updatedAt: new Date() })
      .where(eq(userPreferences.userId, userId));
  } else {
    await db.insert(userPreferences).values({
      userId,
      ...preferences,
    });
  }
}

// Bulk data import
export async function importCrowdDensityBatch(
  venueId: number,
  records: Array<{
    zoneCode: string;
    zoneName: string;
    crowdDensity: number;
    avgWaitTimeSec: number;
    entryFlowPerMin: number;
    exitFlowPerMin: number;
    incidentFlag: number;
    staffRequired: number;
    temperatureCelsius: number;
    timestamp: string;
  }>,
  importedBy: number
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Create or get zones
    const zoneMap: Record<string, number> = {};
    const uniqueZonesSet = new Set(records.map(r => r.zoneCode));
    const uniqueZones = Array.from(uniqueZonesSet);

    for (const zoneCode of uniqueZones) {
      const zoneRecord = records.find(r => r.zoneCode === zoneCode);
      const zoneName = zoneRecord?.zoneName || zoneCode;

      const existing = await db
        .select()
        .from(zones)
        .where(and(eq(zones.venueId, venueId), eq(zones.name, zoneName)))
        .limit(1);

      if (existing.length > 0) {
        zoneMap[zoneCode] = existing[0].id;
      } else {
        const result = await db.insert(zones).values({
          venueId,
          name: zoneName,
          zoneType: "seating",
        });
        zoneMap[zoneCode] = result[0].insertId as number;
      }
    }

    // Create or get facilities
    const facilityMap: Record<string, number> = {};

    for (const zoneCode of uniqueZones) {
      const zoneId = zoneMap[zoneCode];
      const zoneRecord = records.find(r => r.zoneCode === zoneCode);
      const zoneName = zoneRecord?.zoneName || zoneCode;

      // Determine facility type
      let facilityType = "other";
      if (zoneName.includes("Entrance") || zoneName.includes("Gate")) facilityType = "entrance";
      else if (zoneName.includes("Food") || zoneName.includes("Court")) facilityType = "concession";
      else if (zoneName.includes("Restroom")) facilityType = "restroom";
      else if (zoneName.includes("Seating")) facilityType = "seating";
      else if (zoneName.includes("VIP")) facilityType = "vip";

      const existing = await db
        .select()
        .from(facilities)
        .where(and(eq(facilities.zoneId, zoneId), eq(facilities.name, zoneName)))
        .limit(1);

      if (existing.length > 0) {
        facilityMap[zoneCode] = existing[0].id;
      } else {
        const result = await db.insert(facilities).values({
          venueId,
          zoneId,
          name: zoneName,
          facilityType: facilityType as any,
        });
        facilityMap[zoneCode] = result[0].insertId as number;
      }
    }

    // Insert crowd density records
    let importedCount = 0;
    for (const record of records) {
      const zoneId = zoneMap[record.zoneCode];
      if (!zoneId) continue;

      const crowdStatus = record.crowdDensity >= 0.7 ? "high" : record.crowdDensity >= 0.4 ? "medium" : "low";
      const estimatedCount = Math.round(record.crowdDensity * 1000);

      await db.insert(crowdDensity).values({
        zoneId,
        venueId,
        density: crowdStatus,
        estimatedCount,
        updatedBy: importedBy,
      });

      importedCount++;
    }

    // Update wait times with latest data
    for (const [zoneCode, facilityId] of Object.entries(facilityMap)) {
      const latestRecord = records
        .filter(r => r.zoneCode === zoneCode)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      if (latestRecord) {
        const waitMinutes = Math.ceil(latestRecord.avgWaitTimeSec / 60);
        const status = waitMinutes >= 15 ? "high" : waitMinutes >= 5 ? "medium" : "low";

        const existing = await db
          .select()
          .from(waitTimes)
          .where(eq(waitTimes.facilityId, facilityId))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(waitTimes)
            .set({ waitMinutes, status, updatedBy: importedBy, updatedAt: new Date() })
            .where(eq(waitTimes.facilityId, facilityId));
        } else {
          await db.insert(waitTimes).values({
            venueId,
            facilityId,
            waitMinutes,
            status,
            updatedBy: importedBy,
          });
        }
      }
    }

    return {
      success: true,
      imported: importedCount,
      zones: uniqueZones.length,
      facilities: Object.keys(facilityMap).length,
    };
  } catch (error) {
    console.error("[Database] Import failed:", error);
    throw error;
  }
}
