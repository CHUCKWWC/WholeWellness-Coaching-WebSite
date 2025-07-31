import type { Express } from "express";
import { storage } from "./supabase-client-storage";
import { assistantsService } from "./openai-assistants-service";
import { getCoachById } from "./ai-coaches-config";

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

      try {
        // Use OpenAI Assistants API
        const chatResponse = await assistantsService.sendMessage(
          coachType,
          message,
          sessionId || `temp_${Date.now()}`,
          persona
        );

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
            text: chatResponse.response,
            isUser: false,
            context: { persona, coachType, threadId: chatResponse.threadId }
          });
        }

        res.json({ 
          response: chatResponse.response, 
          sessionId,
          threadId: chatResponse.threadId 
        });
      } catch (openAIError: any) {
        console.error("OpenAI Assistant error:", openAIError);
        console.error("Error details:", openAIError.message, openAIError.stack);
        
        // Fallback to template-based response
        console.log(`Falling back to template response for coach: ${coachType}`);
        const fallbackResponse = generateAIResponse(message, coachType, persona, conversationContext);
        
        if (sessionId) {
          await storage.saveChatMessage({
            sessionId,
            text: message,
            isUser: true,
            context: { persona, coachType }
          });

          await storage.saveChatMessage({
            sessionId,
            text: fallbackResponse,
            isUser: false,
            context: { persona, coachType, fallback: true }
          });
        }

        res.json({ 
          response: fallbackResponse, 
          sessionId,
          fallback: true 
        });
      }
    } catch (error) {
      console.error("Error in AI coaching chat:", error);
      res.status(500).json({ message: "Failed to process AI coaching request" });
    }
  });
}

// Enhanced AI response generator with memory and persona awareness
function generateAIResponse(message: string, coachType: string, persona: string, context: string): string {
  const responses = {
    "mindfulness": {
      supportive: [
        "I sense you're seeking peace and clarity. Let's explore this together with compassion and understanding.",
        "Your journey to mindfulness is sacred. I'm here to guide you gently through whatever you're experiencing.",
        "Take a deep breath with me. Whatever brought you here today, we'll navigate it mindfully together."
      ],
      motivational: [
        "Ready to transform your inner world? Let's harness the power of mindfulness to create the life you desire!",
        "Your mind is your most powerful tool - let's unlock its full potential through mindfulness practice!",
        "Every moment is an opportunity for growth. What mindfulness breakthrough are we creating today?"
      ],
      analytical: [
        "Research shows mindfulness practice restructures the brain positively. Let's design a systematic approach for you.",
        "Let's analyze your current stress patterns and create evidence-based mindfulness strategies.",
        "Studies demonstrate measurable benefits from consistent practice. What specific outcomes are you targeting?"
      ],
      gentle: [
        "There's no rush on this journey. Let's explore mindfulness at a pace that feels comfortable for you.",
        "Be kind to yourself as you learn. What gentle practice would feel most nurturing right now?",
        "Your path to peace unfolds naturally. What small mindful moment can we create together?"
      ]
    },
    "behavior": {
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
    "wellness": {
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
    },
    "relationship": {
      supportive: [
        "Building healthy relationships takes courage and vulnerability. I'm here to support you through every step.",
        "Your relationships reflect your growth journey. Let's explore how to create deeper, more meaningful connections.",
        "Every relationship teaches us something valuable. What would you like to work on in your connections with others?"
      ],
      motivational: [
        "Transform your relationships, transform your life! Let's build the meaningful connections you deserve!",
        "You have the power to create extraordinary relationships! What relationship goal are we achieving today?",
        "Break through barriers and build bridges! Your best relationships are waiting to be discovered!"
      ],
      analytical: [
        "Let's analyze your relationship patterns objectively. What recurring themes do you notice in your interactions?",
        "Research shows specific communication techniques improve relationship satisfaction. Which areas need the most attention?",
        "Healthy relationships follow predictable patterns. Let's identify where improvements can create the biggest impact."
      ],
      gentle: [
        "Relationships heal at their own pace. What gentle step toward connection feels right for you today?",
        "Be patient with yourself and others. What relationship aspect would you like to explore with compassion?",
        "Every small gesture of connection matters. What feels most nurturing in your relationships right now?"
      ]
    },
    "mentalhealth": {
      supportive: [
        "Your mental health is precious, and seeking support shows incredible strength. I'm here to listen and help.",
        "Whatever you're going through, you don't have to face it alone. Let's work through this together.",
        "Your feelings are valid and important. I'm here to provide a safe space for whatever you need to express."
      ],
      motivational: [
        "You are stronger than you know! Let's harness that inner strength to overcome any challenge!",
        "Every day is a new opportunity for mental wellness! What positive change are we creating today?",
        "Your resilience is remarkable! Let's build on it to create the mental wellbeing you deserve!"
      ],
      analytical: [
        "Let's examine your mental health patterns systematically. What specific symptoms or challenges are you experiencing?",
        "Research indicates various evidence-based approaches for mental wellness. What strategies have you tried?",
        "Understanding your triggers and patterns is key. Let's create a structured approach to improving your mental health."
      ],
      gentle: [
        "Healing happens in its own time. What small, comforting step can we take together today?",
        "Be gentle with yourself on difficult days. What would feel most soothing for your mind right now?",
        "Your journey is unique and valid. Let's find the softest path forward together."
      ]
    },
    "weightloss": {
      supportive: [
        "Your weight loss journey is about so much more than numbers. I'm here to support your whole-person transformation.",
        "Every body is different, and your path will be unique. Let's find what works sustainably for you.",
        "You're taking a brave step toward better health. I'll be with you every step of this journey."
      ],
      motivational: [
        "You've got the power to transform your body and life! Let's make those weight loss goals a reality!",
        "Every healthy choice is a victory! Ready to crush your weight loss goals and feel amazing?",
        "Your healthiest, happiest self is waiting! What breakthrough are we creating today?"
      ],
      analytical: [
        "Let's analyze your current habits and create a data-driven weight loss plan. What's your typical daily routine?",
        "Science shows sustainable weight loss requires specific strategies. What are your primary obstacles?",
        "Effective weight management follows proven principles. Let's design a systematic approach for your success."
      ],
      gentle: [
        "Weight loss is a journey of self-love, not punishment. What kind approach feels right for you today?",
        "Your body deserves patience and care. What gentle change would feel manageable right now?",
        "Progress comes in many forms. Let's celebrate every positive step, no matter how small."
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