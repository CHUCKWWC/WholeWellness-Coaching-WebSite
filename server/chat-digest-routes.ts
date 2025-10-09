import { Router } from "express";
import { db } from "./db";
import { digestPreferences, crisisAlerts } from "../shared/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

// GET /api/digest/preferences - Get user's digest preferences
router.get("/preferences", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;

    const prefs = await db
      .select()
      .from(digestPreferences)
      .where(eq(digestPreferences.userId, userId))
      .limit(1);

    if (prefs.length === 0) {
      // Return default preferences if none exist
      return res.json({
        frequency: "weekly",
        preferredDay: "monday",
        preferredHour: 9,
        timezone: "America/New_York",
        emailEnabled: true,
        includeActionItems: true,
        includeInsights: true,
        includeProgress: true,
      });
    }

    res.json(prefs[0]);
  } catch (error: any) {
    console.error("Error fetching digest preferences:", error);
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

// POST /api/digest/preferences - Update user's digest preferences
router.post("/preferences", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const {
      frequency,
      preferredDay,
      preferredHour,
      timezone,
      emailEnabled,
      includeActionItems,
      includeInsights,
      includeProgress,
    } = req.body;

    // Check if preferences exist
    const existing = await db
      .select()
      .from(digestPreferences)
      .where(eq(digestPreferences.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing preferences
      const updated = await db
        .update(digestPreferences)
        .set({
          frequency,
          preferredDay,
          preferredHour,
          timezone,
          emailEnabled,
          includeActionItems,
          includeInsights,
          includeProgress,
        })
        .where(eq(digestPreferences.userId, userId))
        .returning();

      return res.json(updated[0]);
    } else {
      // Create new preferences
      const created = await db
        .insert(digestPreferences)
        .values({
          userId,
          frequency,
          preferredDay,
          preferredHour,
          timezone,
          emailEnabled,
          includeActionItems,
          includeInsights,
          includeProgress,
        })
        .returning();

      return res.json(created[0]);
    }
  } catch (error: any) {
    console.error("Error saving digest preferences:", error);
    res.status(500).json({ error: "Failed to save preferences" });
  }
});

// GET /api/digest/crisis-alerts - Get crisis alerts (admin only)
router.get("/crisis-alerts", async (req, res) => {
  try {
    const statusFilter = req.query.status as string;

    let query = db.select().from(crisisAlerts);

    if (statusFilter && statusFilter !== "all") {
      query = query.where(eq(crisisAlerts.status, statusFilter as any));
    }

    const alerts = await query.orderBy(crisisAlerts.createdAt);

    res.json(alerts);
  } catch (error: any) {
    console.error("Error fetching crisis alerts:", error);
    res.status(500).json({ error: "Failed to fetch crisis alerts" });
  }
});

// PUT /api/digest/crisis-alerts/update - Update crisis alert status (admin only)
router.put("/crisis-alerts/update", async (req, res) => {
  try {
    const { id, status, resolution } = req.body;

    const updated = await db
      .update(crisisAlerts)
      .set({
        status,
        resolution: resolution || undefined,
        resolvedAt: status === "resolved" ? new Date() : undefined,
      })
      .where(eq(crisisAlerts.id, id))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    console.error("Error updating crisis alert:", error);
    res.status(500).json({ error: "Failed to update crisis alert" });
  }
});

export default router;
