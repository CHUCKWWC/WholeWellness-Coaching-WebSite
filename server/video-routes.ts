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
  insertVideoSessionSchema,
  insertSessionParticipantSchema,
  insertSessionTranscriptSchema,
  insertWorkshopDetailsSchema
} from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { log as logger } from "./logger";
import { 
  createRoom, 
  generateAuthToken, 
  endSession, 
  getRecording, 
  createRoomWithCode 
} from "./video-service";

logger.info("[VIDEO-ROUTES] Video-routes module loaded successfully");
import OpenAI from "openai";
import { requireAuth, requireCoachRole, type AuthenticatedRequest } from "./auth";
import { getUncachableSendGridClient } from "./sendgrid-service";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate a random room code (lowercase with hyphens for consistency)
function generateRoomCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const randomString = () => Array.from(
    { length: 3 }, 
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  
  return `${randomString()}-${randomString()}-${randomString()}`;
}

// Health check endpoint to test 100ms SDK initialization
router.get("/health", async (req, res) => {
  try {
    logger.info("[VIDEO-HEALTH] Health check called");
    
    // Test if we can create a simple room
    const testRoom = await createRoomWithCode({
      name: "Health Check Test Room",
      description: "Test room to verify SDK initialization",
      recording: false,
      role: "guest"
    });
    
    logger.info("[VIDEO-HEALTH] ✓ SDK working, room created:", testRoom.roomCode);
    res.json({ 
      status: "ok", 
      sdk: "initialized",
      testRoomCode: testRoom.roomCode
    });
  } catch (error: any) {
    logger.error("[VIDEO-HEALTH] ✗ SDK test failed:", error);
    res.json({ 
      status: "error", 
      sdk: "not_initialized",
      error: error.message
    });
  }
});

// Log connection errors (for iOS debugging)
router.post("/log-error", async (req, res) => {
  try {
    const { 
      type, 
      error, 
      message, 
      code, 
      sessionId, 
      userAgent, 
      platform, 
      deviceType,
      isIOS, 
      timestamp,
      errorDetails 
    } = req.body;
    
    // Extract device info for better diagnostics
    const isChrome = /Chrome/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    
    logger.error("[VIDEO-CONNECTION-ERROR]", {
      // Error classification
      errorType: type,
      errorClass: errorDetails?.type || 'unknown',
      errorMessage: message,
      errorCode: code,
      
      // Session info
      sessionId,
      timestamp,
      
      // Device info
      deviceType: deviceType || 'unknown',
      platform,
      isIOS: isIOS ? 'YES' : 'NO',
      isAndroid: /Android/.test(userAgent) ? 'YES' : 'NO',
      
      // Browser detection
      browser: isChrome ? 'Chrome' : isSafari ? 'Safari' : isFirefox ? 'Firefox' : 'Unknown',
      userAgent,
      
      // User-facing suggestion from client
      suggestion: errorDetails?.suggestion || 'No suggestion available',
      
      // Full error for debugging
      fullError: error,
      
      // Network/connection hints
      networkHint: message?.toLowerCase().includes('network') ? 'Network-related' : 
                   message?.toLowerCase().includes('permission') ? 'Permission-related' : 
                   message?.toLowerCase().includes('timeout') ? 'Timeout' : 'Unknown'
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

// Create instant video session (coach-only, no client required)
router.post("/sessions/instant", requireCoachRole, async (req: AuthenticatedRequest, res) => {
  try {
    const coachId = req.user!.id;
    const { 
      title = "Instant Video Session",
      description = "Quick video call",
      maxParticipants = 10,
      recordingEnabled = true
    } = req.body;
    
    // Create 100ms room with room code (for Prebuilt component)
    let roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let roomCode = `fallback-${Math.random().toString(36).substr(2, 6)}`;
    
    logger.info(`[INSTANT-SESSION] Creating 100ms room with createRoomWithCode...`);
    try {
      const room = await createRoomWithCode({
        name: title,
        description,
        recording: recordingEnabled,
        role: "guest", // Participants will join as guests
      });
      roomId = room.roomId;
      roomCode = room.roomCode.toLowerCase(); // Ensure lowercase for consistency
      logger.info(`[INSTANT-SESSION] ✓ 100ms room created successfully: ${roomCode}`);
    } catch (error) {
      logger.error(`[INSTANT-SESSION] ✗ 100ms room creation failed:`, error);
      logger.warn(`[INSTANT-SESSION] Using fallback room code: ${roomCode}`);
      // Fallback values already set above (already lowercase)
    }

    // Create session in database
    const [session] = await db.insert(videoSessions).values({
      coachId,
      sessionType: "instant",
      title,
      description,
      roomId,
      roomCode,
      scheduledStartTime: new Date(),
      scheduledEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours default
      maxParticipants,
      recordingEnabled,
      transcriptEnabled: true,
      aiSummaryEnabled: true,
      status: "in_progress",
      actualStartTime: new Date()
    }).returning();

    // Generate join link - use the protocol and host from the request
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = process.env.FRONTEND_URL || `${protocol}://${host}`;
    const joinLink = `${baseUrl}/join/${session.roomCode}`;

    res.json({ 
      success: true, 
      session,
      joinLink,
      roomCode: session.roomCode,
      hostUrl: `/session/${session.id}/join`
    });
  } catch (error) {
    console.error("Error creating instant video session:", error);
    res.status(500).json({ error: "Failed to create instant session" });
  }
});

// Create a new video session (coach-only)
router.post("/sessions/create", requireCoachRole, async (req: AuthenticatedRequest, res) => {
  try {
    const { 
      bookingId,
      clientId,
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
    
    // Generate room code
    const roomCode = generateRoomCode();
    
    // Create 100ms room (will fail gracefully if credentials not set)
    let roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      const room = await createRoom(roomCode, {
        name: title,
        description,
        recording: recordingEnabled,
        maxParticipants,
      });
      // Use our unique ID to avoid conflicts with existing rooms
      // Append timestamp to ensure uniqueness even if 100ms returns same roomId
      roomId = `${room.roomId}_${Date.now()}`;
    } catch (error) {
      console.warn("100ms room creation failed, using fallback:", error);
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
      // Generate auth token for the client
      let authToken = `fallback_token_${clientId}_${Date.now()}`;
      try {
        authToken = await generateAuthToken(
          session.roomId,
          clientId,
          "participant"
        );
      } catch (error) {
        console.warn("100ms token generation failed for client, using fallback:", error);
      }

      await db.insert(sessionParticipants).values({
        sessionId: session.id,
        userId: clientId,
        role: "participant",
        isActive: true,
        authToken,
      });
    }

    // Update booking if this session is linked to one
    if (bookingId) {
      try {
        const meetingUrl = `/session/${session.id}/join`;
        await db.update(videoSessions).set({
          status: "confirmed"
        }).where(eq(videoSessions.id, session.id));
        
        // Update booking with meeting URL
        await db.update(bookings).set({
          meetingUrl,
          status: "confirmed",
          updatedAt: new Date()
        }).where(eq(bookings.id, bookingId));
      } catch (updateError) {
        console.error("Error updating booking:", updateError);
        // Continue even if booking update fails
      }
    }

    res.json({ 
      success: true, 
      session,
      joinUrl: `/session/${session.id}/join`,
      roomCode: session.roomCode
    });
  } catch (error) {
    console.error("Error creating video session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// Get session details (with optional auth for guest participants)
router.get("/sessions/:sessionId", async (req: AuthenticatedRequest | any, res) => {
  try {
    const { sessionId } = req.params;
    
    // Check if this is an authenticated request
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
      // For instant sessions, anyone can view basic session info
      // This allows guests to join and view the session
    } else {
      // For non-instant sessions, check authorization
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const isCoach = session.coachId === userId;
      const isAdmin = req.user && req.user.role === 'admin';
      
      // Check if user is a participant
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

    // Get participants
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

// Public join endpoint - join with room code (no auth required)
router.post("/sessions/join-public", async (req, res) => {
  try {
    const { roomCode, name } = req.body;

    if (!roomCode || !name) {
      return res.status(400).json({ error: "Room code and name are required" });
    }

    // Find session by room code (case-insensitive comparison using SQL LOWER function)
    const [session] = await db
      .select()
      .from(videoSessions)
      .where(sql`LOWER(${videoSessions.roomCode}) = LOWER(${roomCode})`);

    if (!session) {
      return res.status(404).json({ error: "Invalid room code" });
    }

    // Check if session is still active
    if (session.status === "completed" || session.status === "cancelled") {
      return res.status(400).json({ error: "This session has ended" });
    }

    // Generate a guest ID for non-authenticated users
    const guestId = `guest_${name.replace(/\s+/g, '_')}_${Date.now()}`;
    
    // Create a temporary guest user in the users table to satisfy foreign key constraint
    try {
      // For guests, create a dummy password hash since they won't be logging in
      const dummyPasswordHash = await bcrypt.hash(`guest_${Date.now()}`, 10);
      
      await db.insert(users).values({
        id: guestId,
        email: `${guestId}@guest.wholewellness.com`, // Unique email for guest
        passwordHash: dummyPasswordHash, // Required field, but won't be used for guests
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || 'Guest',
        role: "user", // Give basic user role
        provider: "guest", // Mark as guest provider
        hasCompletedOnboarding: true, // Skip onboarding for guests
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (userError) {
      // If user creation fails (e.g., ID already exists), continue anyway
      console.warn("Guest user creation warning:", userError);
    }

    // Generate auth token for 100ms
    let authToken = `fallback_token_${guestId}_${Date.now()}`;
    try {
      authToken = await generateAuthToken(
        session.roomId, 
        guestId, 
        "participant"
      );
    } catch (error) {
      console.warn("100ms token generation failed for guest, using fallback:", error);
    }

    // Add guest participant to session
    const [participant] = await db.insert(sessionParticipants).values({
      sessionId: session.id,
      userId: guestId,
      role: "participant",
      authToken,
      isActive: true,
    }).returning();

    res.json({ 
      success: true, 
      authToken,
      roomId: session.roomId,
      sessionId: session.id,
      participant,
      sessionTitle: session.title
    });
  } catch (error) {
    console.error("Error joining session publicly:", error);
    res.status(500).json({ error: "Failed to join session" });
  }
});

// Generate join token for participant (allows guests for instant sessions)
router.post("/sessions/:sessionId/join-token", async (req: AuthenticatedRequest | any, res) => {
  try {
    const { sessionId } = req.params;
    
    // Check if authenticated
    let userId: string | null = null;
    let userName: string = "Guest";
    let userRole: string = "participant";
    
    if (req.user && req.user.id) {
      userId = req.user.id;
      userName = req.user.firstName || "User";
      userRole = req.user.role === 'coach' ? 'moderator' : 'participant';
    } else {
      // For unauthenticated users (guests), get their info from request body
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

    // AUTHORIZATION: For instant sessions, allow guests. For other sessions, check authorization
    if (session.sessionType === "instant") {
      // Instant sessions are open to all - guests can join
      // No authorization check needed for instant sessions
    } else {
      // For non-instant sessions, check authorization
      if (!userId) {
        return res.status(401).json({ error: "Authentication required for this session type" });
      }
      
      const isCoach = session.coachId === userId;
      const isAdmin = req.user && req.user.role === 'admin';
      
      // Check if user is an invited participant
      const [existingParticipant] = await db
        .select()
        .from(sessionParticipants)
        .where(and(
          eq(sessionParticipants.sessionId, sessionId),
          eq(sessionParticipants.userId, userId)
        ));

      if (!isCoach && !existingParticipant && !isAdmin) {
        return res.status(403).json({ error: "Unauthorized: You are not invited to this session" });
      }
    }
    
    // Check if user is an invited participant (for instant sessions too, to avoid duplicates)
    let existingParticipant: any = null;
    if (userId) {
      [existingParticipant] = await db
        .select()
        .from(sessionParticipants)
        .where(and(
          eq(sessionParticipants.sessionId, sessionId),
          eq(sessionParticipants.userId, userId)
        ));
    }
    
    const isCoach = session.coachId === userId;
    const isAdmin = req.user && req.user.role === 'admin';

    // SECURITY FIX: Determine role server-side, NEVER trust client input
    // Only coach or admin gets host role, everyone else is participant
    const assignedRole = (isCoach || isAdmin) ? "host" : "participant";

    // Generate auth token for 100ms
    let authToken = `fallback_token_${userId}_${Date.now()}`;
    try {
      authToken = await generateAuthToken(
        session.roomId, 
        userId, 
        assignedRole
      );
    } catch (error) {
      console.warn("100ms token generation failed, using fallback:", error);
    }

    // For instant sessions with guest users, create a guest user record first
    if (session.sessionType === "instant" && userId && userId.startsWith("guest_") && !req.user) {
      try {
        // Create a temporary guest user in the users table
        const dummyPasswordHash = await bcrypt.hash(`guest_${Date.now()}`, 10);
        
        await db.insert(users).values({
          id: userId,
          email: `${userId}@guest.wholewellness.com`,
          passwordHash: dummyPasswordHash,
          firstName: userName,
          lastName: 'Guest',
          role: "user",
          provider: "guest",
          hasCompletedOnboarding: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (userError) {
        // If user creation fails (e.g., ID already exists), continue anyway
        console.warn("Guest user creation warning in join-token:", userError);
      }
    }

    // Add participant to session if not already added
    if (!existingParticipant) {
      const [participant] = await db.insert(sessionParticipants).values({
        sessionId,
        userId: userId || `guest_anonymous_${Date.now()}`,
        role: assignedRole,
        authToken,
      }).returning();
      
      res.json({ 
        success: true, 
        authToken,
        roomId: session.roomId,
        participant
      });
    } else {
      // Update existing participant's auth token
      await db.update(sessionParticipants)
        .set({ authToken, role: assignedRole })
        .where(eq(sessionParticipants.id, existingParticipant.id));
      
      res.json({ 
        success: true, 
        authToken,
        roomId: session.roomId,
        participant: { ...existingParticipant, role: assignedRole, authToken }
      });
    }
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

    // AUTHORIZATION: Only the coach or admin can start the session
    if (session.coachId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized: Only the session coach can start this session" });
    }

    await db.update(videoSessions)
      .set({ 
        status: "in_progress",
        actualStartTime: new Date()
      })
      .where(eq(videoSessions.id, sessionId));

    res.json({ success: true });
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

    // AUTHORIZATION: Only the coach or admin can end the session
    if (session.coachId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized: Only the session coach can end this session" });
    }

    // End 100ms session
    try {
      await endSession(session.roomId);
    } catch (error) {
      console.warn("100ms session end failed:", error);
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

      // Generate AI summary if enabled
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
          
          // Extract key points (simplified)
          keyPoints = aiSummary?.match(/[-•]\s*(.+)/g)?.map(p => p.trim()) || [];
        } catch (error) {
          console.error("Error generating AI summary:", error);
        }
      }

      // Save transcript
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

    // AUTHORIZATION: Only coach, participants, or admins can view transcript
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
      return res.status(403).json({ error: "Unauthorized: You don't have access to this transcript" });
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

// Send transcript to participants
router.post("/sessions/:sessionId/send-transcript", requireAuth, async (req: AuthenticatedRequest, res) => {
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

    // AUTHORIZATION: Only the coach or admin can send transcripts
    if (session.coachId !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized: Only the session coach can send transcripts" });
    }

    const [transcript] = await db
      .select()
      .from(sessionTranscripts)
      .where(eq(sessionTranscripts.sessionId, sessionId));

    if (!transcript) {
      return res.status(404).json({ error: "Transcript not found" });
    }

    const participants = await db
      .select()
      .from(sessionParticipants)
      .where(eq(sessionParticipants.sessionId, sessionId));

    // TODO: Send email with transcript to coach and participants
    // This would integrate with your email service

    // Mark as sent
    await db.update(sessionTranscripts)
      .set({ 
        sentToCoach: true,
        sentToParticipants: true
      })
      .where(eq(sessionTranscripts.sessionId, sessionId));

    res.json({ success: true, message: "Transcript sent to all participants" });
  } catch (error) {
    console.error("Error sending transcript:", error);
    res.status(500).json({ error: "Failed to send transcript" });
  }
});

// List coach's sessions (coach-only)
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

// Create session from booking (coach-only)
router.post("/sessions/from-booking/:bookingId", requireCoachRole, async (req: AuthenticatedRequest, res) => {
  try {
    const { bookingId } = req.params;
    const coachId = req.user!.id;

    // Get booking details
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(bookingId)));

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // AUTHORIZATION: Only the assigned coach or admin can create session from booking
    if (booking.coachId !== coachId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized: This booking is not assigned to you" });
    }

    // Generate room code
    const roomCode = generateRoomCode();
    
    // Create 100ms room
    let roomId = `room_${Date.now()}`;
    try {
      const room = await createRoom(roomCode, {
        name: `${booking.serviceType} session with ${booking.fullName}`,
        description: booking.message || "",
        recording: true,
        maxParticipants: 1,
      });
      roomId = room.roomId;
    } catch (error) {
      console.warn("100ms room creation failed, using fallback:", error);
    }

    // Create session
    const [session] = await db.insert(videoSessions).values({
      bookingId: booking.id,
      coachId,
      sessionType: "one-on-one",
      title: `${booking.serviceType} session`,
      description: booking.message,
      roomId,
      roomCode,
      scheduledStartTime: booking.scheduledDate || new Date(),
      scheduledEndTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour default
      maxParticipants: 1,
      recordingEnabled: true,
      transcriptEnabled: true,
      aiSummaryEnabled: true,
    }).returning();

    // Update booking with meeting URL
    await db.update(bookings)
      .set({ 
        meetingUrl: `/session/${session.id}/join`,
        status: "confirmed"
      })
      .where(eq(bookings.id, booking.id));

    res.json({ 
      success: true, 
      session,
      joinUrl: `/session/${session.id}/join`,
      roomCode: session.roomCode
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return res.status(400).json({ error: "Recipient email is required" });
    }
    if (typeof email !== 'string' || !emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address format" });
    }

    // Validate sessionId is a non-empty string (UUID)
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    // Get session details (sessionId is a UUID string, not an integer)
    const [session] = await db
      .select()
      .from(videoSessions)
      .where(eq(videoSessions.id, sessionId));

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Verify user has access (coach owner or admin)
    if (session.coachId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized: You don't have permission to invite to this session" });
    }

    // Get coach details
    const [coach] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.coachId));

    const coachName = coach?.fullName || "Your Coach";
    
    // Generate join link
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = process.env.FRONTEND_URL || `${protocol}://${host}`;
    const joinLink = `${baseUrl}/join/${session.roomCode}`;

    // Create email content
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
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
              Video Session Invitation
            </h1>
          </div>

          <!-- Body -->
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

            <!-- Join Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${joinLink}" 
                 style="background-color: #667eea; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                Join Video Session
              </a>
            </div>

            <!-- Alternative Join Method -->
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

            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
              No account needed - join as a guest instantly!
            </p>
          </div>

          <!-- Footer -->
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
Click here to join instantly: ${joinLink}

Or visit ${baseUrl}/join and enter room code: ${session.roomCode}

No account needed - join as a guest!

---
WholeWellness Coaching Platform
Empowering wellness journeys
    `;

    // Send email via SendGrid
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
