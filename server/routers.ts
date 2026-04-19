import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "staff") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Venue management
  venue: router({
    getById: publicProcedure
      .input(z.object({ venueId: z.number() }))
      .query(async ({ input }) => {
        return db.getVenueById(input.venueId);
      }),

    getZones: publicProcedure
      .input(z.object({ venueId: z.number() }))
      .query(async ({ input }) => {
        return db.getZonesByVenue(input.venueId);
      }),

    getFacilities: publicProcedure
      .input(z.object({ venueId: z.number() }))
      .query(async ({ input }) => {
        return db.getFacilitiesByVenue(input.venueId);
      }),
  }),

  // Wait times
  waitTimes: router({
    getByVenue: publicProcedure
      .input(z.object({ venueId: z.number() }))
      .query(async ({ input }) => {
        return db.getWaitTimesByVenue(input.venueId);
      }),

    update: adminProcedure
      .input(
        z.object({
          facilityId: z.number(),
          waitMinutes: z.number().min(0),
          status: z.enum(["low", "medium", "high"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await db.updateWaitTime(
          input.facilityId,
          input.waitMinutes,
          input.status,
          ctx.user.id
        );
        return { success: true };
      }),
  }),

  // Data import
  dataImport: router({
    importCrowdDensityBatch: adminProcedure
      .input(
        z.object({
          venueId: z.number(),
          records: z.array(
            z.object({
              zoneCode: z.string(),
              zoneName: z.string(),
              crowdDensity: z.number(),
              avgWaitTimeSec: z.number(),
              entryFlowPerMin: z.number(),
              exitFlowPerMin: z.number(),
              incidentFlag: z.number(),
              staffRequired: z.number(),
              temperatureCelsius: z.number(),
              timestamp: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return db.importCrowdDensityBatch(
          input.venueId,
          input.records,
          ctx.user.id
        );
      }),
  }),

  // Crowd density
  crowdDensity: router({
    getByZone: publicProcedure
      .input(z.object({ zoneId: z.number() }))
      .query(async ({ input }) => {
        return db.getCrowdDensityByZone(input.zoneId);
      }),

    update: adminProcedure
      .input(
        z.object({
          zoneId: z.number(),
          density: z.enum(["low", "medium", "high"]),
          estimatedCount: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await db.updateCrowdDensity(
          input.zoneId,
          input.density,
          input.estimatedCount,
          ctx.user.id
        );
        return { success: true };
      }),
  }),

  // Alerts
  alerts: router({
    getByVenue: publicProcedure
      .input(z.object({ venueId: z.number() }))
      .query(async ({ input }) => {
        return db.getActiveAlertsByVenue(input.venueId);
      }),

    create: adminProcedure
      .input(
        z.object({
          venueId: z.number(),
          title: z.string(),
          content: z.string(),
          alertType: z.enum([
            "announcement",
            "gate_change",
            "emergency",
            "special_offer",
            "info",
          ]),
          priority: z.enum(["low", "medium", "high"]),
          targetZones: z.array(z.number()).optional(),
          expiresAt: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await db.createAlert(
          input.venueId,
          input.title,
          input.content,
          input.alertType,
          input.priority,
          ctx.user.id,
          input.targetZones,
          input.expiresAt
        );
        return { success: true };
      }),
  }),

  // Events
  events: router({
    getByVenue: publicProcedure
      .input(z.object({ venueId: z.number() }))
      .query(async ({ input }) => {
        return db.getEventsByVenue(input.venueId);
      }),

    getMoments: publicProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ input }) => {
        return db.getEventMomentsByEvent(input.eventId);
      }),
  }),

  // Seats
  seats: router({
    getBySection: publicProcedure
      .input(z.object({ venueId: z.number(), sectionNumber: z.string() }))
      .query(async ({ input }) => {
        return db.getSeatsBySection(input.venueId, input.sectionNumber);
      }),
  }),

  // User preferences
  userPreferences: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserPreferences(ctx.user.id);
    }),

    update: protectedProcedure
      .input(
        z.object({
          venueId: z.number().optional(),
          savedSeatSection: z.string().optional(),
          savedSeatNumber: z.string().optional(),
          notificationsEnabled: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await db.updateUserPreferences(ctx.user.id, input);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
