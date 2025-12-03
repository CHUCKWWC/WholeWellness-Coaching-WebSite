import { Router } from "express";
import { db } from "./db";
import bcrypt from "bcrypt";
import { 
  videoSessions, 
  sessionParticipants, 
  sessionTranscripts,
  workshopDetails,
  bookings,
  users,
  coaches,
  insertVideoSessionSchema,
  insertSessionParticipantSchema,
  insertSessionTranscriptSchema,
  insertWorkshopDetailsSchema
} from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { log as logger } from "./logger";
import { 
  createMeetEvent,
  updateMeetEvent,
  cancelMeetEvent,
  isCalendarConnected,
  getCalendarConnectionStatus,
  getAuthUrl,
  handleOAuthCallback,
  disconnectCalendar,
  generateRoomCode
} from "./google-calendar-service";

logger.info("[VIDEO-ROUTES] Video-routes module loaded successfully (Google Meet integration)");
import OpenAI from "openai";
import { requireAuth, requireCoachRole, type AuthenticatedRequest } from "./auth";
import { getUncachableSendGridClient } from "./sendgrid-service";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Health check endpoint
router.get("/health", async (req, res) => {
  try {
    logger.info("[VIDEO-HEALTH] Health check called");
    res.json({ 
      status: "ok", 
      provider: "google-meet",
      message: "Google Meet integration active"
    });
  } catch (error: any) {
    logger.error("[VIDEO-HEALTH] ✗ Health check failed:", error);
    res.json({ 
      status: "error", 
      provider: "google-meet",
      error: error.message
    });
  }
});

// Google Calendar OAuth - initiate connection
router.get("/google/calendar/auth", requireCoachRole, async (req: AuthenticatedRequest, res) => {
  try {
    const coachId = req.user!.id;
    const authUrl = getAuthUrl(coachId);
    res.json({ authUrl });
  } catch (error: any) {
    logger.error("[GOOGLE-OAUTH] Error generating auth URL:", error);
    res.status(500).json({ error: "Failed to generate Google auth URL" });
  }
});

// Google Calendar OAuth callback
router.get("/google/calendar/callback", async (req, res) => {
  try {
    const { code, state: coachId } = req.query;
    
    if (!code || !coachId || typeof code !== 'string' || typeof coachId !== 'string') {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: #dc2626;">Error</h1>
            <p>Invalid authorization request. Please try again.</p>
            <a href="/coach-dashboard" style="color: #7c3aed;">Return to Dashboard</a>
          </body>
        </html>
      `);
    }

    await handleOAuthCallback(code, coachId);
    
    res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: #16a34a;">✓ Google Calendar Connected!</h1>
          <p>Your Google Calendar is now connected. You can create video sessions with Google Meet.</p>
          <script>
            setTimeout(() => {
              window.close();
              if (!window.closed) {
                window.location.href = '/coach-dashboard';
              }
            }, 2000);
          </script>
          <a href="/coach-dashboard" style="color: #7c3aed;">Return to Dashboard</a>
        </body>
      </html>
    `);
  } catch (error: any) {
    logger.error("[GOOGLE-OAUTH] Callback error:", error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: #dc2626;">Connection Failed</h1>
          <p>${error.message || 'Failed to connect Google Calendar'}</p>
          <a href="/coach-dashboard" style="color: #7c3aed;">Return to Dashboard</a>
        </body>
      </html>
    `);
  }
});

// Get Google Calendar connection status
router.get("/google/calendar/status", requireCoachRole, async (req: AuthenticatedRequest, res) => {
  try {
    const coachId = req.user!.id;
    const status = await getCalendarConnectionStatus(coachId);
    res.json(status);
  } catch (error: any) {
    logger.error("[GOOGLE-CALENDAR] Error getting status:", error);
    res.status(500).json({ error: "Failed to get calendar status" });
  }
});

// Disconnect Google Calendar
router.post("/google/calendar/disconnect", requireCoachRole, async (req: AuthenticatedRequest, res) => {
  try {
    const coachId = req.user!.id;
    await disconnectCalendar(coachId);
    res.json({ success: true, message: "Google Calendar disconnected" });
  } catch (error: any) {
    logger.error("[GOOGLE-CALENDAR] Error disconnecting:", error);
    res.status(500).json({ error: "Failed to disconnect calendar" });
  }
});

// Log connection errors
router.post("/log-error", async (req, res) => {
  try {
    const { 
      type, 
      error, 
      message, 
      sessionId, 
      userAgent, 
      platform, 
      deviceType,
      timestamp 
    } = req.body;
    
    logger.error("[VIDEO-CONNECTION-ERROR]", {
      errorType: type,
      errorMessage: message,
      sessionId,
      timestamp,
      deviceType: deviceType || 'unknown',
      platform,
      userAgent,
      fullError: error,
    });
    
    res.json({ 
      success: true,
      loggedAt: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error("[VIDEO-LOG-ERROR] Failed to log connection error:", error);
    res.status(500).json({ error: "Failed to log error" });
  }
});

// Create instant video session (coach-only)
router.post("/sessions/instant", requireCoachRole, async (req: AuthenticatedRequest, res) => {
  try {
    const coachId = req.user!.id;
    const { 
      title = "Instant Video Session",
      description = "Quick video call",
      maxParticipants = 10,
      recordingEnabled = true,
      clientEmail
    } = req.body;
    
    // Check if coach has Google Calendar connected
    const isConnected = await isCalendarConnected(coachId);
    
    let meetUrl: string | null = null;
    let googleEventId: string | null = null;
    const roomCode = generateRoomCode();
    const roomId = `wwc_instant_${Date.now()}`;
    
    if (isConnected) {
      try {
        const startTime = new Date();
        const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
        
        const meetEvent = await createMeetEvent(coachId, {
          title,
          description,
          startTime,
          endTime,
          attendeeEmails: clientEmail ? [clientEmail] : undefined,
        });
        
        meetUrl = meetEvent.meetUrl;
        googleEventId = meetEvent.eventId;
        
        logger.info(`[INSTANT-SESSION] Created Google Meet: ${meetUrl}`);
      } catch (meetError: any) {
        logger.warn(`[INSTANT-SESSION] Google Meet creation failed, continuing without:`, meetError.message);
      }
    } else {
      logger.info(`[INSTANT-SESSION] Coach ${coachId} has not connected Google Calendar`);
    }

    // Create session in database
    const [session] = await db.insert(videoSessions).values({
      coachId,
      sessionType: "instant",
      title,
      description,
      roomId,
      roomCode,
      meetUrl,
      googleEventId,
      scheduledStartTime: new Date(),
      scheduledEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      maxParticipants,
      recordingEnabled,
      transcriptEnabled: true,
      aiSummaryEnabled: true,
      status: "in_progress",
      actualStartTime: new Date()
    }).returning();

    // Generate join link
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = process.env.FRONTEND_URL || `${protocol}://${host}`;
    const joinLink = meetUrl || `${baseUrl}/join/${session.roomCode}`;

    res.json({ 
      success: true, 
      session,
      joinLink,
      meetUrl,
      roomCode: session.roomCode,
      hostUrl: meetUrl || `/session/${session.id}/join`,
      calendarConnected: isConnected
    });
  } catch (error: any) {
    logger.error("[INSTANT-SESSION] ✗ Error creating session:", error);
    res.status(500).json({ 
      error: "Failed to create instant session",
      details: error?.message || "Unknown error"
    });
  }
});

// Create a new video session (coach-only)
router.post("/sessions/create", requireCoachRole, async (req: AuthenticatedRequest, res) => {
  try {
    const { 
      bookingId,
      clientId,
      clientEmail,
      sessionType, 
      title, 
      description,
      scheduledStartTime,
      scheduledEndTime,
      maxParticipants = 1,
      recordingEnabled = true,
      transcriptEnabled = true,
      aiSummaryEnabled = true
    } = req.body;

    const coachId = req.user!.id;

    // AUTHORIZATION: If booking is specified, verify coach owns it
    if (bookingId) {
      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId));

      if (booking && booking.coachId !== coachId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: "Unauthorized: This booking is not assigned to you" });
      }
    }
    
    const roomCode = generateRoomCode();
    const roomId = `wwc_scheduled_${Date.now()}`;
    
    // Check if coach has Google Calendar connected
    const isConnected = await isCalendarConnected(coachId);
    
    let meetUrl: string | null = null;
    let googleEventId: string | null = null;
    
    if (isConnected) {
      try {
        const meetEvent = await createMeetEvent(coachId, {
          title,
          description,
          startTime: new Date(scheduledStartTime),
          endTime: new Date(scheduledEndTime),
          attendeeEmails: clientEmail ? [clientEmail] : undefined,
        });
        
        meetUrl = meetEvent.meetUrl;
        googleEventId = meetEvent.eventId;
        
        logger.info(`[SESSION-CREATE] Created Google Meet: ${meetUrl}`);
      } catch (meetError: any) {
        logger.warn(`[SESSION-CREATE] Google Meet creation failed:`, meetError.message);
      }
    }

    // Create session in database
    const [session] = await db.insert(videoSessions).values({
      bookingId,
      coachId,
      sessionType,
      title,
      description,
      roomId,
      roomCode,
      meetUrl,
      googleEventId,
      scheduledStartTime: new Date(scheduledStartTime),
      scheduledEndTime: new Date(scheduledEndTime),
      maxParticipants,
      recordingEnabled,
      transcriptEnabled,
      aiSummaryEnabled,
    }).returning();

    // If this is a workshop, create workshop details
    if (sessionType === "workshop") {
      await db.insert(workshopDetails).values({
        sessionId: session.id,
        topic: title,
      });
    }

    // Add client as participant if provided
    if (clientId) {
      await db.insert(sessionParticipants).values({
        sessionId: session.id,
        userId: clientId,
        role: "participant",
        isActive: true,
        authToken: null,
      });
    }

    // Update booking if this session is linked to one
    if (bookingId) {
      try {
        const meetingUrl = meetUrl || `/session/${session.id}/join`;
        await db.update(videoSessions).set({
          status: "confirmed"
        }).where(eq(videoSessions.id, session.id));
        
        await db.update(bookings).set({
          meetingUrl,
          status: "confirmed",
          updatedAt: new Date()
        }).where(eq(bookings.id, bookingId));
      } catch (updateError) {
        console.error("Error updating booking:", updateError);
      }
    }

    res.json({ 
      success: true, 
      session,
      joinUrl: meetUrl || `/session/${session.id}/join`,
      meetUrl,
      roomCode: session.roomCode,
      calendarConnected: isConnected
    });
  } catch (error) {
    console.error("Error creating video session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// Get session details
router.get("/sessions/:sessionId", async (req: AuthenticatedRequest | any, res) => {
  try {
    const { sessionId } = req.params;
    
    let userId: string | null = null;
    if (req.user && req.user.id) {
      userId = req.user.id;
    }
    
    const [session] = await db
      .select()
      .from(videoSessions)
      .where(eq(videoSessions.id, sessionId));

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // For instant sessions, allow public viewing
    if (session.sessionType === "instant") {
      // Anyone can view basic session info for instant sessions
    } else {
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const isCoach = session.coachId === userId;
      const isAdmin = req.user && req.user.role === 'admin';
      
      const [participant] = await db
        .select()
        .from(sessionParticipants)
        .where(and(
          eq(sessionParticipants.sessionId, sessionId),
          eq(sessionParticipants.userId, userId)
        ));
      
      const isParticipant = !!participant;

      if (!isCoach && !isParticipant && !isAdmin) {
        return res.status(403).json({ error: "Unauthorized: You don't have access to this session" });
      }
    }

    const participants = await db
      .select()
      .from(sessionParticipants)
      .where(eq(sessionParticipants.sessionId, sessionId));

    res.json({ session, participants });
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// Public join endpoint - join with room code
router.post("/sessions/join-public", async (req, res) => {
  try {
    const { roomCode, name } = req.body;

    if (!roomCode || !name) {
      return res.status(400).json({ error: "Room code and name are required" });
    }

    // Find session by room code
    const [session] = await db
      .select()
      .from(videoSessions)
      .where(sql`LOWER(${videoSessions.roomCode}) = LOWER(${roomCode})`);

    if (!session) {
      return res.status(404).json({ error: "Invalid room code" });
    }

    if (session.status === "completed" || session.status === "cancelled") {
      return res.status(400).json({ error: "This session has ended" });
    }

    // If session has Google Meet URL, redirect there
    if (session.meetUrl) {
      return res.json({ 
        success: true, 
        meetUrl: session.meetUrl,
        sessionId: session.id,
        sessionTitle: session.title,
        redirectToMeet: true
      });
    }

    // Fallback: Create guest user and participant record
    const guestId = `guest_${name.replace(/\s+/g, '_')}_${Date.now()}`;
    
    try {
      const dummyPasswordHash = await bcrypt.hash(`guest_${Date.now()}`, 10);
      
      await db.insert(users).values({
        id: guestId,
        email: `${guestId}@guest.wholewellness.com`,
        passwordHash: dummyPasswordHash,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || 'Guest',
        role: "user",
        provider: "guest",
        hasCompletedOnboarding: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (userError) {
      console.warn("Guest user creation warning:", userError);
    }

    await db.insert(sessionParticipants).values({
      sessionId: session.id,
      userId: guestId,
      role: "participant",
      authToken: null,
      isActive: true,
    });

    res.json({ 
      success: true, 
      sessionId: session.id,
      sessionTitle: session.title,
      meetUrl: session.meetUrl,
      redirectToMeet: !!session.meetUrl
    });
  } catch (error) {
    console.error("Error joining session publicly:", error);
    res.status(500).json({ error: "Failed to join session" });
  }
});

// Get session config (for joining)
router.post("/sessions/:sessionId/config", async (req: AuthenticatedRequest | any, res) => {
  try {
    const { sessionId } = req.params;
    
    const [session] = await db
      .select()
      .from(videoSessions)
      .where(eq(videoSessions.id, sessionId));

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.status === 'completed' || session.status === 'cancelled') {
      return res.status(400).json({ error: "This session has ended" });
    }

    res.json({
      sessionId: session.id,
      title: session.title,
      meetUrl: session.meetUrl,
      roomCode: session.roomCode,
      status: session.status,
      hasGoogleMeet: !!session.meetUrl
    });
  } catch (error: any) {
    logger.error("[SESSION-CONFIG] Error:", error);
    res.status(500).json({ error: "Failed to get session configuration" });
  }
});

// Generate join token for participant
router.post("/sessions/:sessionId/join-token", async (req: AuthenticatedRequest | any, res) => {
  try {
    const { sessionId } = req.params;
    
    let userId: string | null = null;
    let userName: string = "Guest";
    
    if (req.user && req.user.id) {
      userId = req.user.id;
      userName = req.user.firstName || "User";
    } else {
      const { participantName } = req.body;
      if (participantName) {
        userName = participantName;
        userId = `guest_${participantName.replace(/\s+/g, '_')}_${Date.now()}`;
      }
    }

    const [session] = await db
      .select()
      .from(videoSessions)
      .where(eq(videoSessions.id, sessionId));

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // For instant sessions, allow guests
    if (session.sessionType !== "instant" && !userId) {
      return res.status(401).json({ error: "Authentication required for this session type" });
    }

    // Return Meet URL if available
    res.json({ 
      success: true, 
      meetUrl: session.meetUrl,
      roomCode: session.roomCode,
      sessionId: session.id,
      hasGoogleMeet: !!session.meetUrl
    });
  } catch (error) {
    console.error("Error generating join token:", error);
    res.status(500).json({ error: "Failed to generate join token" });
  }
});

// Start session
router.post("/sessions/:sessionId/start", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.id;

    const [session] = await db
      .select()
      .from(videoSessions)
      .where(eq(videoSessions.id, sessionId));

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.coachId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized: Only the session coach can start this session" });
    }

    await db.update(videoSessions)
      .set({ 
        status: "in_progress",
        actualStartTime: new Date()
      })
      .where(eq(videoSessions.id, sessionId));

    res.json({ success: true, meetUrl: session.meetUrl });
  } catch (error) {
    console.error("Error starting session:", error);
    res.status(500).json({ error: "Failed to start session" });
  }
});

// End session
router.post("/sessions/:sessionId/end", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;
    const { transcript } = req.body;
    const userId = req.user!.id;

    const [session] = await db
      .select()
      .from(videoSessions)
      .where(eq(videoSessions.id, sessionId));

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.coachId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized: Only the session coach can end this session" });
    }

    // Update session status
    await db.update(videoSessions)
      .set({ 
        status: "completed",
        actualEndTime: new Date()
      })
      .where(eq(videoSessions.id, sessionId));

    // Save transcript if provided
    if (transcript && session.transcriptEnabled) {
      let aiSummary = null;
      let keyPoints: string[] = [];

      if (session.aiSummaryEnabled) {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: "You are an expert at analyzing coaching session transcripts. Provide a concise summary and extract key discussion points and action items."
              },
              {
                role: "user",
                content: `Analyze this coaching session transcript and provide:\n1. A brief summary (2-3 sentences)\n2. Key points discussed (bullet points)\n3. Action items for the client\n\nTranscript:\n${transcript}`
              }
            ],
          });

          aiSummary = completion.choices[0].message.content;
          keyPoints = aiSummary?.match(/[-•]\s*(.+)/g)?.map(p => p.trim()) || [];
        } catch (error) {
          console.error("Error generating AI summary:", error);
        }
      }

      await db.insert(sessionTranscripts).values({
        sessionId,
        transcript,
        aiSummary,
        keyPoints,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error ending session:", error);
    res.status(500).json({ error: "Failed to end session" });
  }
});

// Cancel session
router.post("/sessions/:sessionId/cancel", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.id;

    const [session] = await db
      .select()
      .from(videoSessions)
      .where(eq(videoSessions.id, sessionId));

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.coachId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Cancel Google Calendar event if exists
    if (session.googleEventId) {
      try {
        await cancelMeetEvent(userId, session.googleEventId);
        logger.info(`[SESSION-CANCEL] Google Calendar event cancelled: ${session.googleEventId}`);
      } catch (cancelError: any) {
        logger.warn(`[SESSION-CANCEL] Failed to cancel Google event:`, cancelError.message);
      }
    }

    await db.update(videoSessions)
      .set({ status: "cancelled" })
      .where(eq(videoSessions.id, sessionId));

    res.json({ success: true });
  } catch (error) {
    console.error("Error cancelling session:", error);
    res.status(500).json({ error: "Failed to cancel session" });
  }
});

// Get session transcript
router.get("/sessions/:sessionId/transcript", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.id;

    const [session] = await db
      .select()
      .from(videoSessions)
      .where(eq(videoSessions.id, sessionId));

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const isCoach = session.coachId === userId;
    const isAdmin = req.user!.role === 'admin';
    
    const [participant] = await db
      .select()
      .from(sessionParticipants)
      .where(and(
        eq(sessionParticipants.sessionId, sessionId),
        eq(sessionParticipants.userId, userId)
      ));
    
    const isParticipant = !!participant;

    if (!isCoach && !isParticipant && !isAdmin) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const [transcript] = await db
      .select()
      .from(sessionTranscripts)
      .where(eq(sessionTranscripts.sessionId, sessionId));

    if (!transcript) {
      return res.status(404).json({ error: "Transcript not found" });
    }

    res.json(transcript);
  } catch (error) {
    console.error("Error fetching transcript:", error);
    res.status(500).json({ error: "Failed to fetch transcript" });
  }
});

// List coach's sessions
router.get("/sessions", requireCoachRole, async (req: AuthenticatedRequest, res) => {
  try {
    const coachId = req.user!.id;
    const { status } = req.query;

    const statusFilter = typeof status === "string" && status.length > 0
      ? status
      : undefined;

    const sessions = await db
      .select()
      .from(videoSessions)
      .where(
        statusFilter
          ? and(
              eq(videoSessions.coachId, coachId),
              eq(videoSessions.status, statusFilter),
            )
          : eq(videoSessions.coachId, coachId),
      );

    res.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// Create session from booking
router.post("/sessions/from-booking/:bookingId", requireCoachRole, async (req: AuthenticatedRequest, res) => {
  try {
    const { bookingId } = req.params;
    const coachId = req.user!.id;

    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(bookingId)));

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.coachId !== coachId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const roomCode = generateRoomCode();
    const roomId = `wwc_booking_${Date.now()}`;
    
    // Check if coach has Google Calendar connected
    const isConnected = await isCalendarConnected(coachId);
    
    let meetUrl: string | null = null;
    let googleEventId: string | null = null;
    
    if (isConnected) {
      try {
        const startTime = booking.scheduledDate || new Date();
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        
        const meetEvent = await createMeetEvent(coachId, {
          title: `${booking.serviceType} session with ${booking.fullName}`,
          description: booking.message || undefined,
          startTime,
          endTime,
          attendeeEmails: booking.email ? [booking.email] : undefined,
        });
        
        meetUrl = meetEvent.meetUrl;
        googleEventId = meetEvent.eventId;
      } catch (meetError: any) {
        logger.warn(`[SESSION-FROM-BOOKING] Google Meet creation failed:`, meetError.message);
      }
    }

    const [session] = await db.insert(videoSessions).values({
      bookingId: booking.id,
      coachId,
      sessionType: "one-on-one",
      title: `${booking.serviceType} session`,
      description: booking.message,
      roomId,
      roomCode,
      meetUrl,
      googleEventId,
      scheduledStartTime: booking.scheduledDate || new Date(),
      scheduledEndTime: new Date(Date.now() + 60 * 60 * 1000),
      maxParticipants: 1,
      recordingEnabled: true,
      transcriptEnabled: true,
      aiSummaryEnabled: true,
    }).returning();

    const meetingUrl = meetUrl || `/session/${session.id}/join`;
    
    await db.update(bookings)
      .set({ 
        meetingUrl,
        status: "confirmed"
      })
      .where(eq(bookings.id, booking.id));

    res.json({ 
      success: true, 
      session,
      joinUrl: meetingUrl,
      meetUrl,
      roomCode: session.roomCode,
      calendarConnected: isConnected
    });
  } catch (error) {
    console.error("Error creating session from booking:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// Send video session invite email
router.post("/sessions/:sessionId/invite", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.params;
    const { email, recipientName } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return res.status(400).json({ error: "Recipient email is required" });
    }
    if (typeof email !== 'string' || !emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address format" });
    }

    const [session] = await db
      .select()
      .from(videoSessions)
      .where(eq(videoSessions.id, sessionId));

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.coachId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const [coach] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.coachId));

    const coachName = coach?.fullName || "Your Coach";
    
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = process.env.FRONTEND_URL || `${protocol}://${host}`;
    
    // Use Meet URL if available, otherwise use room code join
    const joinLink = session.meetUrl || `${baseUrl}/join/${session.roomCode}`;
    const isGoogleMeet = !!session.meetUrl;

    const emailSubject = `${coachName} invites you to: ${session.title}`;
    const recipientDisplayName = recipientName || "there";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
              Video Session Invitation
            </h1>
          </div>

          <div style="padding: 40px 30px;">
            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Hi ${recipientDisplayName},
            </p>

            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              <strong>${coachName}</strong> has invited you to join a video coaching session:
            </p>

            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h2 style="color: #667eea; margin: 0 0 10px 0; font-size: 20px;">
                ${session.title}
              </h2>
              ${session.description ? `
                <p style="color: #666666; margin: 0; font-size: 14px; line-height: 1.5;">
                  ${session.description}
                </p>
              ` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${joinLink}" 
                 style="background-color: ${isGoogleMeet ? '#1a73e8' : '#667eea'}; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                ${isGoogleMeet ? 'Join with Google Meet' : 'Join Video Session'}
              </a>
            </div>

            ${!isGoogleMeet ? `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0; text-align: center;">
                <strong>Or join manually:</strong>
              </p>
              <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0; text-align: center;">
                Visit <a href="${baseUrl}/join" style="color: #667eea;">${baseUrl}/join</a> and enter room code:
              </p>
              <div style="background-color: #ffffff; padding: 12px; border: 2px dashed #667eea; border-radius: 6px; text-align: center;">
                <code style="font-size: 20px; font-weight: bold; color: #667eea; letter-spacing: 2px;">
                  ${session.roomCode}
                </code>
              </div>
            </div>
            ` : ''}

            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
              ${isGoogleMeet ? 'Click the button above to join via Google Meet!' : 'No account needed - join as a guest instantly!'}
            </p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #999999; font-size: 12px; margin: 0;">
              WholeWellness Coaching Platform<br>
              Empowering wellness journeys
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
Hi ${recipientDisplayName},

${coachName} has invited you to join a video coaching session:

Session: ${session.title}
${session.description ? `Description: ${session.description}\n` : ''}

JOIN NOW:
${isGoogleMeet ? `Join with Google Meet: ${joinLink}` : `Click here to join: ${joinLink}\n\nOr visit ${baseUrl}/join and enter room code: ${session.roomCode}`}

---
WholeWellness Coaching Platform
Empowering wellness journeys
    `;

    try {
      const { client, fromEmail } = await getUncachableSendGridClient();
      await client.send({
        to: email,
        from: fromEmail,
        subject: emailSubject,
        html: emailHtml,
        text: emailText
      });

      logger.info(`[VIDEO-INVITE] Email sent successfully to ${email} for session ${sessionId}`);
      
      res.json({ 
        success: true, 
        message: "Invitation email sent successfully"
      });
    } catch (emailError: any) {
      logger.error(`[VIDEO-INVITE] Failed to send email:`, emailError);
      res.status(500).json({ 
        error: "Failed to send invitation email",
        details: emailError.message 
      });
    }
  } catch (error: any) {
    logger.error(`[VIDEO-INVITE] Error processing invite:`, error);
    res.status(500).json({ error: "Failed to send invitation" });
  }
});

export default router;
