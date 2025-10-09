import { Router } from "express";
import OpenAI from "openai";
import { requireAuth } from "./auth";

const router = Router();

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Coach configurations with OpenAI Assistant IDs
const COACH_CONFIGS: Record<string, { name: string; assistantId: string; description: string }> = {
  charlene: {
    name: "Charlene - Mindfulness Coach",
    assistantId: "asst_abc123", // Replace with actual assistant ID
    description: "Mindfulness and meditation specialist"
  },
  lisa: {
    name: "Lisa - Behavior Coach",
    assistantId: "asst_def456", // Replace with actual assistant ID
    description: "Behavioral change and habit formation expert"
  },
  dasha: {
    name: "Dasha - Wellness Coach",
    assistantId: "asst_ghi789", // Replace with actual assistant ID
    description: "Holistic wellness and lifestyle coach"
  },
  charles: {
    name: "Charles - Relationship Coach",
    assistantId: "asst_jkl012", // Replace with actual assistant ID
    description: "Relationship and communication specialist"
  },
  bobby: {
    name: "Bobby - Mental Health Coach",
    assistantId: "asst_mno345", // Replace with actual assistant ID
    description: "Mental health and emotional wellbeing expert"
  },
  aria: {
    name: "Aria - Weight Loss Coach",
    assistantId: "asst_pqr678", // Replace with actual assistant ID
    description: "Weight management and healthy lifestyle coach"
  }
};

// POST /api/ai-coaching/chat - Send message to AI coach
router.post("/chat", requireAuth, async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ 
        error: "AI coaching service is not configured. Please set OPENAI_API_KEY." 
      });
    }

    const { message, coachType, persona = "supportive", sessionId } = req.body;
    const userId = req.user!.id;

    if (!message || !coachType) {
      return res.status(400).json({ error: "Message and coach type are required" });
    }

    const coach = COACH_CONFIGS[coachType.toLowerCase()];
    if (!coach) {
      return res.status(400).json({ error: `Invalid coach type: ${coachType}` });
    }

    // For now, use chat completions instead of assistants API for simpler setup
    // This can be upgraded to use Assistants API with threads for persistent memory
    const systemPrompt = `You are ${coach.name}, a professional ${coach.description}. 
Your tone should be ${persona}. Provide helpful, empathetic guidance while maintaining professional boundaries.
Keep responses concise (2-3 paragraphs) and actionable.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "I apologize, I couldn't generate a response. Please try again.";

    // TODO: Save conversation to database for history/summaries
    // This would require chat_messages table

    res.json({ 
      response,
      coachType,
      sessionId: sessionId || `session_${Date.now()}`,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Error in AI chat:", error);
    res.status(500).json({ 
      error: "Failed to get AI response",
      details: error.message 
    });
  }
});

// GET /api/chat/history/:sessionId - Get chat history for a session
router.get("/history/:sessionId", requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.id;

    // TODO: Implement when chat_messages table exists
    // For now, return empty array
    res.json([]);

  } catch (error: any) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// GET /api/chat/sessions/:userId - Get user's chat sessions
router.get("/sessions/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user can only access their own sessions
    if (req.user!.id !== userId && req.user!.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // TODO: Implement when chat_sessions table exists
    // For now, return empty array
    res.json([]);

  } catch (error: any) {
    console.error("Error fetching chat sessions:", error);
    res.status(500).json({ error: "Failed to fetch chat sessions" });
  }
});

export default router;
