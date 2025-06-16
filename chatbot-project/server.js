import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Environment variables
const PORT = process.env.PORT || 3001;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize Supabase client (shared database)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://localhost:3000',
    process.env.MAIN_WEBSITE_URL,
    /\.replit\.app$/
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// AI Coaching System Prompt
const COACHING_SYSTEM_PROMPT = `You are an AI wellness coach for WholeWellness Coaching, a nonprofit organization dedicated to holistic health and wellness. Your role is to provide supportive, evidence-based guidance on:

1. Nutrition and healthy eating habits
2. Fitness and exercise routines
3. Mental health and stress management
4. Sleep optimization
5. Goal setting and accountability
6. Motivational support

Guidelines:
- Always provide encouraging, non-judgmental responses
- Offer practical, actionable advice
- Suggest professional help when appropriate
- Focus on sustainable lifestyle changes
- Be empathetic and understanding
- Ask follow-up questions to better understand user needs
- Remind users that you're an AI coach and not a replacement for medical advice

Keep responses conversational, helpful, and focused on empowering users to achieve their wellness goals.`;

// Store active chat sessions
const chatSessions = new Map();

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'WholeWellness Chatbot',
    timestamp: new Date().toISOString()
  });
});

// Start new chat session
app.post('/api/chat/start', async (req, res) => {
  try {
    const sessionId = uuidv4();
    const { userId, userEmail } = req.body;
    
    // Create session in database
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        session_id: sessionId,
        user_id: userId,
        user_email: userEmail,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to create chat session' });
    }
    
    // Store session in memory
    chatSessions.set(sessionId, {
      messages: [],
      userId,
      userEmail,
      createdAt: new Date()
    });
    
    res.json({ 
      sessionId, 
      message: 'Chat session started successfully',
      welcomeMessage: 'Hello! I\'m your AI wellness coach. How can I help you on your wellness journey today?'
    });
    
  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message to chat
app.post('/api/chat/message', async (req, res) => {
  try {
    const { sessionId, message, userId } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Session ID and message are required' });
    }
    
    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    // Add user message to session
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    session.messages.push(userMessage);
    
    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: COACHING_SYSTEM_PROMPT },
      ...session.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];
    
    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7
    });
    
    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      return res.status(500).json({ error: 'Failed to generate AI response' });
    }
    
    // Add AI response to session
    const aiMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };
    
    session.messages.push(aiMessage);
    
    // Save conversation to database
    await supabase
      .from('chat_messages')
      .insert([
        {
          session_id: sessionId,
          message_id: userMessage.id,
          role: 'user',
          content: message,
          user_id: userId,
          created_at: userMessage.timestamp
        },
        {
          session_id: sessionId,
          message_id: aiMessage.id,
          role: 'assistant',
          content: aiResponse,
          user_id: userId,
          created_at: aiMessage.timestamp
        }
      ]);
    
    res.json({
      response: aiResponse,
      messageId: aiMessage.id,
      timestamp: aiMessage.timestamp
    });
    
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get chat history
app.get('/api/chat/:sessionId/history', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch chat history' });
    }
    
    res.json({ messages: data || [] });
    
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// End chat session
app.post('/api/chat/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Update session status in database
    await supabase
      .from('chat_sessions')
      .update({ 
        status: 'ended',
        ended_at: new Date().toISOString()
      })
      .eq('session_id', sessionId);
    
    // Remove from memory
    chatSessions.delete(sessionId);
    
    res.json({ message: 'Chat session ended successfully' });
    
  } catch (error) {
    console.error('Error ending chat session:', error);
    res.status(500).json({ error: 'Failed to end chat session' });
  }
});

// Get user's chat sessions
app.get('/api/user/:userId/chats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch user chats' });
    }
    
    res.json({ sessions: data || [] });
    
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// WebSocket connection for real-time chat
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'chat_message') {
        const { sessionId, content, userId } = data;
        
        // Process message similar to REST API
        const session = chatSessions.get(sessionId);
        if (!session) {
          ws.send(JSON.stringify({ error: 'Session not found' }));
          return;
        }
        
        // Add user message
        const userMessage = {
          id: uuidv4(),
          role: 'user',
          content: content,
          timestamp: new Date().toISOString()
        };
        
        session.messages.push(userMessage);
        
        // Get AI response
        const messages = [
          { role: 'system', content: COACHING_SYSTEM_PROMPT },
          ...session.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ];
        
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: messages,
          max_tokens: 500,
          temperature: 0.7
        });
        
        const aiResponse = completion.choices[0]?.message?.content;
        
        if (aiResponse) {
          const aiMessage = {
            id: uuidv4(),
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString()
          };
          
          session.messages.push(aiMessage);
          
          // Save to database
          await supabase
            .from('chat_messages')
            .insert([
              {
                session_id: sessionId,
                message_id: userMessage.id,
                role: 'user',
                content: content,
                user_id: userId,
                created_at: userMessage.timestamp
              },
              {
                session_id: sessionId,
                message_id: aiMessage.id,
                role: 'assistant',
                content: aiResponse,
                user_id: userId,
                created_at: aiMessage.timestamp
              }
            ]);
          
          // Send response back
          ws.send(JSON.stringify({
            type: 'chat_response',
            response: aiResponse,
            messageId: aiMessage.id,
            timestamp: aiMessage.timestamp
          }));
        }
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({ error: 'Failed to process message' }));
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`WholeWellness Chatbot Server running on port ${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});