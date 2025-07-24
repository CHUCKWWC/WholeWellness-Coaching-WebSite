import type { Express } from "express";
import { storage } from "./supabase-client-storage";

export function registerAIChatRoutes(app: Express) {
  // Create or get chat session
  app.post("/api/chat/session", async (req, res) => {
    try {
      const { userId, coachType } = req.body;
      
      if (!userId || !coachType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const session = await storage.createChatSession({
        userId,
        coachType,
        sessionTitle: `${coachType} Session`,
        sessionContext: {
          userGoals: [],
          preferences: {},
          coachingStyle: "supportive"
        }
      });

      res.json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  // Get chat history for a session
  app.get("/api/chat/history/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const history = await storage.getChatHistory(sessionId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Get user's chat sessions
  app.get("/api/chat/sessions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const sessions = await storage.getUserChatSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  // Enhanced AI coaching with memory
  app.post("/api/ai-coaching/chat", async (req, res) => {
    try {
      const { message, coachType, sessionId, persona = "supportive" } = req.body;
      
      if (!message || !coachType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get chat history for context if sessionId provided
      let conversationContext = "";
      if (sessionId) {
        const history = await storage.getChatHistory(sessionId);
        if (history.length > 0) {
          conversationContext = history
            .slice(-10) // Last 10 messages for context
            .map((msg: any) => `${msg.is_user === 'true' ? 'User' : 'Coach'}: ${msg.message_text}`)
            .join('\n');
        }
      }

      // Build persona-aware prompt
      const personaPrompts = {
        supportive: "Respond with warmth, empathy, and encouragement. Use supportive language and acknowledge emotions.",
        motivational: "Be energetic, inspiring, and goal-focused. Use motivational language and actionable advice.",
        analytical: "Provide data-driven, logical responses. Break down problems systematically and offer clear solutions.",
        gentle: "Use calm, patient language. Take a nurturing approach and emphasize that progress takes time."
      };

      const systemPrompt = `You are ${coachType} AI coach providing ${persona} guidance. ${personaPrompts[persona as keyof typeof personaPrompts] || personaPrompts.supportive}

Previous conversation context:
${conversationContext}

Respond to the user's message in character as their ${coachType} coach with the ${persona} personality style.`;

      // Simulate AI response (replace with actual OpenAI call)
      const aiResponse = generateAIResponse(message, coachType, persona, conversationContext);

      // Save both user message and AI response
      if (sessionId) {
        await storage.saveChatMessage({
          sessionId,
          text: message,
          isUser: true,
          context: { persona, coachType }
        });

        await storage.saveChatMessage({
          sessionId,
          text: aiResponse,
          isUser: false,
          context: { persona, coachType }
        });
      }

      res.json({ response: aiResponse, sessionId });
    } catch (error) {
      console.error("Error in AI coaching chat:", error);
      res.status(500).json({ message: "Failed to process AI coaching request" });
    }
  });
}

// Enhanced AI response generator with memory and persona awareness
function generateAIResponse(message: string, coachType: string, persona: string, context: string): string {
  const responses = {
    "nutritionist": {
      supportive: [
        "I understand nutrition can feel overwhelming. Let's take this one step at a time. What specific area would you like to focus on first?",
        "Your willingness to improve your nutrition shows real self-care. I'm here to support you through every step of this journey.",
        "Remember, small changes can lead to big results. What's one healthy change you feel ready to make this week?"
      ],
      motivational: [
        "You've got this! Nutrition is your fuel for success. Let's create a power-packed plan that energizes your goals!",
        "Every healthy choice you make is an investment in your future self. Ready to make some game-changing nutrition moves?",
        "Transform your energy, transform your life! What nutrition goal are we crushing today?"
      ],
      analytical: [
        "Let's analyze your current nutritional intake systematically. What are your main meals typically composed of?",
        "Based on nutritional science, we can optimize your diet for better health outcomes. What specific health goals are you targeting?",
        "Data shows that balanced nutrition significantly impacts energy and mood. Let's create a structured plan based on your needs."
      ],
      gentle: [
        "Take your time with nutrition changes - lasting habits develop slowly and naturally. What feels manageable for you right now?",
        "Your body deserves nourishment and care. Let's explore gentle ways to improve your relationship with food.",
        "Remember, every small step toward better nutrition is worth celebrating. What would feel nurturing for you today?"
      ]
    },
    "fitness-trainer": {
      supportive: [
        "I believe in your strength, even when you don't feel it yourself. Every movement is a step toward a healthier you.",
        "Your body is capable of amazing things. Let's find ways to move that feel good and sustainable for you.",
        "Fitness is a journey of self-discovery. I'm here to cheer you on every step of the way!"
      ],
      motivational: [
        "Time to unleash your inner warrior! Your body is ready for this challenge - let's make it happen!",
        "Champions aren't made in comfort zones. Ready to push your limits and discover what you're capable of?",
        "Your strongest self is waiting to be unleashed. What fitness goal are we conquering today?"
      ],
      analytical: [
        "Let's assess your current fitness level and create a progressive training plan. What activities do you currently engage in?",
        "Based on exercise science, we can design a program that maximizes your results efficiently. What are your primary fitness objectives?",
        "Research shows consistent movement patterns lead to sustainable fitness gains. Let's structure your routine strategically."
      ],
      gentle: [
        "Listen to your body - it knows what it needs. Let's find gentle movements that bring you joy and energy.",
        "Fitness should enhance your life, not stress you. What types of movement make you feel good?",
        "Your pace is perfect. Every gentle step toward movement is nurturing your overall wellbeing."
      ]
    },
    "behavior-coach": {
      supportive: [
        "Change is challenging, and recognizing that takes courage. I'm here to support you through every step of your growth journey.",
        "Your awareness of wanting change is already a huge step forward. Let's explore what patterns you'd like to shift together.",
        "You have the inner wisdom to create positive change. Sometimes we just need support to access it."
      ],
      motivational: [
        "You have the power to rewrite your story! Let's identify the behaviors that will catapult you toward your dreams!",
        "Break free from limiting patterns! Your breakthrough moment is closer than you think - let's make it happen!",
        "Transform your habits, transform your life! What behavior change will create your biggest impact?"
      ],
      analytical: [
        "Let's examine your behavior patterns systematically. What triggers typically precede the behaviors you want to change?",
        "Behavioral science shows that understanding our patterns is key to sustainable change. What specific behaviors concern you?",
        "We can create a structured approach to behavior modification. What's your primary behavioral goal?"
      ],
      gentle: [
        "Change happens naturally when we're ready. What small shift feels achievable and kind to yourself right now?",
        "Be patient with yourself as you grow. What behavior change would feel most nurturing to explore?",
        "Your journey of change is uniquely yours. Let's honor your pace and celebrate every small victory."
      ]
    },
    "wellness-coordinator": {
      supportive: [
        "Your whole-person wellness matters deeply. I'm here to help you create a life that feels balanced and fulfilling.",
        "Wellness is about finding what works uniquely for you. Let's explore all dimensions of your wellbeing together.",
        "You deserve to feel well in every area of your life. What aspect of wellness would you like to focus on first?"
      ],
      motivational: [
        "Your wellness journey is your path to an extraordinary life! Let's optimize every dimension of your health and happiness!",
        "Unleash your full potential through comprehensive wellness! Which area of your life is ready for a breakthrough?",
        "Create the vibrant, balanced life you deserve! What wellness goal will make the biggest impact on your happiness?"
      ],
      analytical: [
        "Let's assess your wellness across multiple dimensions: physical, mental, emotional, and social. Where do you see the biggest gaps?",
        "Comprehensive wellness requires a systematic approach. What are your current wellness practices and desired outcomes?",
        "Research supports an integrated approach to wellbeing. Let's create a structured wellness plan based on evidence-based practices."
      ],
      gentle: [
        "Wellness unfolds naturally when we listen to our needs. What would feel most nourishing for your wellbeing right now?",
        "Your wellness journey is sacred and personal. Let's explore gentle practices that honor where you are today.",
        "True wellness includes being kind to yourself. What aspect of self-care would feel most supportive?"
      ]
    }
  };

  const coachResponses = responses[coachType as keyof typeof responses];
  if (!coachResponses) {
    return "I'm here to support you on your wellness journey. How can I help you today?";
  }

  const personaResponses = coachResponses[persona as keyof typeof coachResponses];
  if (!personaResponses) {
    return coachResponses.supportive[0];
  }

  // Add context awareness
  let contextualResponse = personaResponses[Math.floor(Math.random() * personaResponses.length)];
  
  if (context && context.length > 0) {
    contextualResponse = `I remember our previous conversation. ${contextualResponse}`;
  }

  return contextualResponse;
}