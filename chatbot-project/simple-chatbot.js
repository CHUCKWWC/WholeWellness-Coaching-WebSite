const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// OpenAI setup with your Weight Loss Assistant
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const WEIGHT_LOSS_ASSISTANT_ID = 'asst_tgbv3k3i8RHdB3jzFGab9AFR';

// Supabase setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store active threads per session
const activeThreads = new Map();

// AI Coaching Functions using Weight Loss Assistant
async function getCoachingResponse(message, sessionId) {
  try {
    let threadId = activeThreads.get(sessionId);
    
    // Create new thread if none exists
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      activeThreads.set(sessionId, threadId);
    }

    // Add user message to thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message
    });

    // Run the weight loss assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: WEIGHT_LOSS_ASSISTANT_ID,
      additional_instructions: 'Focus on weight loss coaching, meal planning, and sustainable lifestyle changes.'
    });

    // Wait for completion
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    
    while (runStatus.status !== 'completed') {
      if (runStatus.status === 'failed' || runStatus.status === 'expired') {
        console.error('Assistant run failed:', runStatus.last_error);
        throw new Error(`Assistant run failed: ${runStatus.status}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }

    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(threadId);
    const assistantMessage = messages.data.find(msg => msg.role === 'assistant');
    
    return assistantMessage.content[0].text.value;
  } catch (error) {
    console.error('OpenAI Assistant API error:', error);
    
    // Fallback response for weight loss coaching
    return "I'm your weight loss coach! I can help you create meal plans, track your progress, and develop sustainable habits. What's your current weight loss goal?";
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'WholeWellness Weight Loss Chatbot',
    timestamp: new Date().toISOString(),
    database: 'Shares Supabase database with main website',
    assistant: 'OpenAI Assistant: ' + WEIGHT_LOSS_ASSISTANT_ID,
    port: PORT
  });
});

// Database info endpoint
app.get('/api/database/info', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    res.json({
      database: 'Supabase PostgreSQL',
      sharing: 'Shares database with main WholeWellness website',
      tables: ['users', 'testimonials', 'donations', 'chat_sessions', 'chat_messages'],
      connection: error ? 'Error connecting' : 'Connected',
      note: 'This chatbot connects to the same database as the main website for user data consistency'
    });
  } catch (err) {
    res.json({
      database: 'Supabase PostgreSQL',
      sharing: 'Shares database with main WholeWellness website',
      connection: 'Error connecting',
      error: err.message
    });
  }
});

// Start chat session
app.post('/api/chat/start', async (req, res) => {
  try {
    const { userId, userEmail } = req.body;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Save session to database
    const { error } = await supabase
      .from('chat_sessions')
      .insert({
        session_id: sessionId,
        user_id: userId || 'anonymous',
        user_email: userEmail,
        started_at: new Date().toISOString(),
        status: 'active'
      });
    
    if (error) {
      console.error('Database error:', error);
    }
    
    res.json({
      sessionId,
      message: 'Chat session started successfully',
      welcomeMessage: 'Hello! I\'m your AI weight loss coach. I can help you create personalized meal plans, track your progress, and develop sustainable weight loss habits. What\'s your current weight loss goal?',
      databaseNote: 'This chatbot shares the same Supabase database as the main WholeWellness website'
    });
  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({ error: 'Failed to start chat session' });
  }
});

// Send message to AI coach
app.post('/api/chat/message', async (req, res) => {
  try {
    const { sessionId, message, userId } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Session ID and message are required' });
    }
    
    // Save user message to database
    const { error: saveError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        user_id: userId || 'anonymous',
        message,
        sender: 'user',
        timestamp: new Date().toISOString()
      });
    
    if (saveError) {
      console.error('Error saving user message:', saveError);
    }
    
    // Get AI response using Weight Loss Assistant
    const aiResponse = await getCoachingResponse(message, sessionId);
    
    // Save AI response to database
    const { error: saveAiError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        user_id: userId || 'anonymous',
        message: aiResponse,
        sender: 'assistant',
        timestamp: new Date().toISOString()
      });
    
    if (saveAiError) {
      console.error('Error saving AI response:', saveAiError);
    }
    
    res.json({
      sessionId,
      message: 'Message sent successfully',
      response: aiResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 WholeWellness Weight Loss Chatbot running on http://localhost:${PORT}`);
  console.log(`🔗 Shares database with main website at http://localhost:5000`);
  console.log(`🎯 Using OpenAI Assistant: ${WEIGHT_LOSS_ASSISTANT_ID}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   - Web Interface: http://localhost:${PORT}`);
  console.log(`   - Health Check: http://localhost:${PORT}/health`);
  console.log(`   - Database Info: http://localhost:${PORT}/api/database/info`);
  console.log(`   - Chat API: POST http://localhost:${PORT}/api/chat/start`);
  console.log(`   - Send Message: POST http://localhost:${PORT}/api/chat/message`);
});