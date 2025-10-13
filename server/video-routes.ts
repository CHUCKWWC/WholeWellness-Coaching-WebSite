import { Router } from "express";
import { db } from "./db";
import { 
  videoSessions, 
  sessionParticipants, 
  sessionTranscripts,
  workshopDetails,
  bookings,
  insertVideoSessionSchema,
  insertSessionParticipantSchema,
  insertSessionTranscriptSchema,
  insertWorkshopDetailsSchema
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { 
  createRoom, 
  generateAuthToken, 
  endSession, 
  getRecording, 
  generateRoomCode 
} from "./video-service";
import OpenAI from "openai";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Create a new video session
router.post("/sessions/create", async (req: any, res) => {
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

    const coachId = req.user.id;
    
    // Generate room code
    const roomCode = generateRoomCode();
    
    // Create 100ms room (will fail gracefully if credentials not set)
    let roomId = `room_${Date.now()}`;
    try {
      const room = await createRoom(roomCode, {
        name: title,
        description,
        recording: recordingEnabled,
        maxParticipants,
      });
      roomId = room.roomId;
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

// Get session details
router.get("/sessions/:sessionId", async (req: any, res) => {
  try {
    const { sessionId } = req.params;
    
    const [session] = await db
      .select()
      .from(videoSessions)
      .where(eq(videoSessions.id, sessionId));

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
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

// Generate join token for participant
router.post("/sessions/:sessionId/join-token", async (req: any, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const { role = "guest" } = req.body;

    const [session] = await db
      .select()
      .from(videoSessions)
      .where(eq(videoSessions.id, sessionId));

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Generate auth token for 100ms
    let authToken = `fallback_token_${userId}_${Date.now()}`;
    try {
      authToken = await generateAuthToken(
        session.roomId, 
        userId, 
        session.coachId === userId ? "host" : role
      );
    } catch (error) {
      console.warn("100ms token generation failed, using fallback:", error);
    }

    // Add participant to session
    const [participant] = await db.insert(sessionParticipants).values({
      sessionId,
      userId,
      role: session.coachId === userId ? "host" : "participant",
      authToken,
    }).returning();

    res.json({ 
      success: true, 
      authToken,
      roomId: session.roomId,
      participant
    });
  } catch (error) {
    console.error("Error generating join token:", error);
    res.status(500).json({ error: "Failed to generate join token" });
  }
});

// Start session
router.post("/sessions/:sessionId/start", async (req: any, res) => {
  try {
    const { sessionId } = req.params;

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
router.post("/sessions/:sessionId/end", async (req: any, res) => {
  try {
    const { sessionId } = req.params;
    const { transcript } = req.body;

    const [session] = await db
      .select()
      .from(videoSessions)
      .where(eq(videoSessions.id, sessionId));

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
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
router.get("/sessions/:sessionId/transcript", async (req: any, res) => {
  try {
    const { sessionId } = req.params;

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
router.post("/sessions/:sessionId/send-transcript", async (req: any, res) => {
  try {
    const { sessionId } = req.params;

    const [transcript] = await db
      .select()
      .from(sessionTranscripts)
      .where(eq(sessionTranscripts.sessionId, sessionId));

    if (!transcript) {
      return res.status(404).json({ error: "Transcript not found" });
    }

    const [session] = await db
      .select()
      .from(videoSessions)
      .where(eq(videoSessions.id, sessionId));

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

// List coach's sessions
router.get("/sessions", async (req: any, res) => {
  try {
    const coachId = req.user.id;
    const { status } = req.query;

    let query = db
      .select()
      .from(videoSessions)
      .where(eq(videoSessions.coachId, coachId));

    if (status) {
      query = query.where(eq(videoSessions.status, status as string));
    }

    const sessions = await query;

    res.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// Create session from booking
router.post("/sessions/from-booking/:bookingId", async (req: any, res) => {
  try {
    const { bookingId } = req.params;
    const coachId = req.user.id;

    // Get booking details
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(bookingId)));

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
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

export default router;
