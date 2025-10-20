import { Router } from "express";
import { db } from "./db";
import { 
  events, 
  eventRegistrations,
  users,
  insertEventSchema,
  insertEventRegistrationSchema,
  type Event,
  type EventRegistration
} from "@shared/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { requireAuth, requireCoachRole, optionalAuth, type AuthenticatedRequest } from "./auth";
import { z } from "zod";

const router = Router();

// ============================================
// PUBLIC ROUTES (anyone can access)
// ============================================

// Get all public upcoming events
router.get("/", optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { 
      category, 
      eventType, 
      isFeatured, 
      coachId,
      upcoming = "true",
      limit = "50"
    } = req.query;

    let query = db
      .select({
        event: events,
        coachName: users.firstName,
        coachLastName: users.lastName,
        coachProfileImage: users.profileImageUrl,
      })
      .from(events)
      .leftJoin(users, eq(events.coachId, users.id))
      .where(eq(events.isPublic, true))
      .$dynamic();

    // Filter by upcoming events
    if (upcoming === "true") {
      query = query.where(
        and(
          gte(events.startTime, new Date()),
          eq(events.status, "upcoming")
        )
      );
    }

    // Additional filters
    if (category) {
      query = query.where(eq(events.category, category as string));
    }
    if (eventType) {
      query = query.where(eq(events.eventType, eventType as string));
    }
    if (isFeatured) {
      query = query.where(eq(events.isFeatured, true));
    }
    if (coachId) {
      query = query.where(eq(events.coachId, coachId as string));
    }

    const results = await query
      .orderBy(events.startTime)
      .limit(parseInt(limit as string));

    // Format response
    const formattedEvents = results.map(r => ({
      ...r.event,
      coach: {
        name: `${r.coachName || ""} ${r.coachLastName || ""}`.trim(),
        profileImage: r.coachProfileImage,
      }
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Get single event details
router.get("/:eventId", optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { eventId } = req.params;

    const [result] = await db
      .select({
        event: events,
        coachName: users.firstName,
        coachLastName: users.lastName,
        coachEmail: users.email,
        coachProfileImage: users.profileImageUrl,
        coachBio: users.bio,
      })
      .from(events)
      .leftJoin(users, eq(events.coachId, users.id))
      .where(eq(events.id, eventId));

    if (!result) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if event is public or if user is coach/admin
    const isCoach = req.user?.id === result.event.coachId;
    const isAdmin = req.user?.role === "admin";
    
    if (!result.event.isPublic && !isCoach && !isAdmin) {
      return res.status(403).json({ error: "This event is private" });
    }

    // Get registration count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId));

    // Check if current user is registered
    let userRegistration = null;
    if (req.user) {
      const [reg] = await db
        .select()
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, eventId),
            eq(eventRegistrations.userId, req.user.id)
          )
        );
      userRegistration = reg || null;
    }

    res.json({
      ...result.event,
      coach: {
        name: `${result.coachName || ""} ${result.coachLastName || ""}`.trim(),
        email: result.coachEmail,
        profileImage: result.coachProfileImage,
        bio: result.coachBio,
      },
      registrationCount: count,
      spotsRemaining: result.event.maxParticipants 
        ? result.event.maxParticipants - Number(count)
        : null,
      userRegistration,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

// ============================================
// REGISTRATION ROUTES
// ============================================

// Register for an event
router.post("/:eventId/register", optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { eventId } = req.params;
    const { userName, userEmail, notes } = req.body;

    // Get event details
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if event is full
    if (event.maxParticipants) {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(eventRegistrations)
        .where(eq(eventRegistrations.eventId, eventId));

      if (Number(count) >= event.maxParticipants) {
        return res.status(400).json({ error: "Event is full" });
      }
    }

    // Check if already registered (for logged-in users)
    if (req.user) {
      const [existing] = await db
        .select()
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, eventId),
            eq(eventRegistrations.userId, req.user.id)
          )
        );

      if (existing) {
        return res.status(400).json({ error: "Already registered for this event" });
      }
    }

    // Create registration
    const [registration] = await db
      .insert(eventRegistrations)
      .values({
        eventId,
        userId: req.user?.id,
        userName: req.user ? `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() : userName,
        userEmail: req.user?.email || userEmail,
        notes,
        paymentStatus: event.isPaid ? "pending" : "completed",
      })
      .returning();

    // Update participant count
    await db
      .update(events)
      .set({
        currentParticipants: sql`${events.currentParticipants} + 1`,
      })
      .where(eq(events.id, eventId));

    res.json({
      success: true,
      registration,
      message: "Successfully registered for event",
    });
  } catch (error) {
    console.error("Error registering for event:", error);
    res.status(500).json({ error: "Failed to register for event" });
  }
});

// Cancel registration
router.post("/:eventId/registrations/:registrationId/cancel", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { eventId, registrationId } = req.params;
    const userId = req.user!.id;

    const [registration] = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.id, registrationId));

    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    // Authorization: only the user who registered or coach/admin can cancel
    const isOwner = registration.userId === userId;
    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    const isCoach = event?.coachId === userId;
    const isAdmin = req.user!.role === "admin";

    if (!isOwner && !isCoach && !isAdmin) {
      return res.status(403).json({ error: "Unauthorized to cancel this registration" });
    }

    // Delete registration
    await db
      .delete(eventRegistrations)
      .where(eq(eventRegistrations.id, registrationId));

    // Update participant count
    await db
      .update(events)
      .set({
        currentParticipants: sql`GREATEST(${events.currentParticipants} - 1, 0)`,
      })
      .where(eq(events.id, eventId));

    res.json({ success: true, message: "Registration cancelled" });
  } catch (error) {
    console.error("Error cancelling registration:", error);
    res.status(500).json({ error: "Failed to cancel registration" });
  }
});

// ============================================
// COACH ROUTES (coach-only access)
// ============================================

// Create new event (coach only)
router.post("/", requireCoachRole, async (req: AuthenticatedRequest, res) => {
  try {
    const coachId = req.user!.id;
    const eventData = insertEventSchema.parse(req.body);

    const [event] = await db
      .insert(events)
      .values({
        ...eventData,
        coachId,
        coachName: `${req.user!.firstName || ""} ${req.user!.lastName || ""}`.trim(),
      })
      .returning();

    res.json({ success: true, event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid event data", details: error.errors });
    }
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// Update event (coach only)
router.put("/:eventId", requireCoachRole, async (req: AuthenticatedRequest, res) => {
  try {
    const { eventId } = req.params;
    const coachId = req.user!.id;

    // Verify ownership
    const [existingEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    if (!existingEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (existingEvent.coachId !== coachId && req.user!.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized to update this event" });
    }

    const updateData = insertEventSchema.partial().parse(req.body);
    
    const [updatedEvent] = await db
      .update(events)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId))
      .returning();

    res.json({ success: true, event: updatedEvent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid event data", details: error.errors });
    }
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// Delete/cancel event (coach only)
router.delete("/:eventId", requireCoachRole, async (req: AuthenticatedRequest, res) => {
  try {
    const { eventId } = req.params;
    const coachId = req.user!.id;

    // Verify ownership
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.coachId !== coachId && req.user!.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized to delete this event" });
    }

    // Instead of deleting, mark as cancelled
    await db
      .update(events)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(events.id, eventId));

    res.json({ success: true, message: "Event cancelled" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

// Get coach's events
router.get("/coach/my-events", requireCoachRole, async (req: AuthenticatedRequest, res) => {
  try {
    const coachId = req.user!.id;
    const { status } = req.query;

    let query = db
      .select()
      .from(events)
      .where(eq(events.coachId, coachId))
      .$dynamic();

    if (status) {
      query = query.where(eq(events.status, status as string));
    }

    const coachEvents = await query.orderBy(desc(events.startTime));

    res.json(coachEvents);
  } catch (error) {
    console.error("Error fetching coach events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Get event registrations (coach only)
router.get("/:eventId/registrations", requireCoachRole, async (req: AuthenticatedRequest, res) => {
  try {
    const { eventId } = req.params;
    const coachId = req.user!.id;

    // Verify ownership
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.coachId !== coachId && req.user!.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized to view registrations" });
    }

    const registrations = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId))
      .orderBy(eventRegistrations.registeredAt);

    res.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

export default router;
