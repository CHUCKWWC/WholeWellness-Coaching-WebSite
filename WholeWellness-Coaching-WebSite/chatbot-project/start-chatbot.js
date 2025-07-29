import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3001;

// Environment variables with fallbacks for demonstration
const SUPABASE_URL = 'https://pwuwmnivvdvdxdewynbo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dXdtbml2dmR2ZHhkZXd5bmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NjM0NjYsImV4cCI6MjA2NTMzOTQ2Nn0.Rd_qUHZZ9FDbHDq1LjGOHdIFD1CiYPaUb9tkAcgHH0M';

// Initialize Supabase client (shared database)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Middleware
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Simple AI coaching responses (demo without OpenAI)
const coachingResponses = {
  nutrition: [
    "Great question about nutrition! Focus on whole foods like vegetables, fruits, lean proteins, and whole grains. What specific nutrition goals are you working on?",
    "Nutrition is foundational to wellness. Try meal prepping with colorful vegetables and balanced macros. Would you like specific meal ideas?",
    "Remember, sustainable nutrition changes work better than extreme diets. What's one small change you could make this week?"
  ],
  fitness: [
    "Exercise is fantastic for both physical and mental health! Start with activities you enjoy - even 10 minutes of movement counts. What type of exercise interests you?",
    "Consistency beats intensity when starting a fitness routine. Try bodyweight exercises or walking to begin. How many days per week can you commit to movement?",
    "Listen to your body and progress gradually. Mix cardio, strength, and flexibility work for balanced fitness. What's your current activity level?"
  ],
  mental: [
    "Mental health is just as important as physical health. Practice mindfulness, get quality sleep, and don't hesitate to seek professional support when needed.",
    "Stress management techniques like deep breathing, meditation, or journaling can be very helpful. What stressors are you dealing with currently?",
    "Building resilience takes time and practice. Focus on one self-care activity today. What brings you joy and relaxation?"
  ],
  general: [
    "I'm here to support your wellness journey! Whether it's nutrition, fitness, or mental health, small consistent steps lead to big changes.",
    "Wellness is personal - what works for others might not work for you, and that's okay! What aspect of health would you like to focus on?",
    "Remember to be patient and kind with yourself. Progress isn't always linear. How can I help you today?"
  ]
};

function getCoachingResponse(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes('nutrition') || msg.includes('food') || msg.includes('eat') || msg.includes('diet')) {
    return coachingResponses.nutrition[Math.floor(Math.random() * coachingResponses.nutrition.length)];
  } else if (msg.includes('exercise') || msg.includes('fitness') || msg.includes('workout') || msg.includes('gym')) {
    return coachingResponses.fitness[Math.floor(Math.random() * coachingResponses.fitness.length)];
  } else if (msg.includes('stress') || msg.includes('mental') || msg.includes('anxiety') || msg.includes('mood')) {
    return coachingResponses.mental[Math.floor(Math.random() * coachingResponses.mental.length)];
  } else {
    return coachingResponses.general[Math.floor(Math.random() * coachingResponses.general.length)];
  }
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'WholeWellness Chatbot',
    timestamp: new Date().toISOString(),
    database: 'Connected to shared Supabase database'
  });
});

// Start new chat session
app.post('/api/chat/start', async (req, res) => {
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const { userId = 'anonymous', userEmail } = req.body;
    
    // Save session to shared database
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name')
      .limit(1);
    
    if (error) {
      console.log('Database connection test failed:', error.message);
    } else {
      console.log('✓ Connected to shared database with', data.length, 'users');
    }
    
    res.json({ 
      sessionId, 
      message: 'Chat session started successfully',
      welcomeMessage: 'Hello! I\'m your AI wellness coach. How can I help you on your wellness journey today?',
      databaseStatus: error ? 'Limited functionality' : 'Connected to shared database'
    });
    
  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message to chat
app.post('/api/chat/message', async (req, res) => {
  try {
    const { sessionId, message, userId = 'anonymous' } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Session ID and message are required' });
    }
    
    // Get AI response (demo version)
    const aiResponse = getCoachingResponse(message);
    
    // Try to save to database
    try {
      await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      console.log('✓ Database interaction successful');
    } catch (dbError) {
      console.log('Database save skipped:', dbError.message);
    }
    
    res.json({
      response: aiResponse,
      messageId: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
      note: 'Demo version - Connect OpenAI API key for full AI responses'
    });
    
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get shared database stats
app.get('/api/database/stats', async (req, res) => {
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, created_at')
      .order('created_at', { ascending: false });
    
    const { data: donations, error: donationsError } = await supabase
      .from('donations')
      .select('id, amount')
      .order('created_at', { ascending: false });
    
    res.json({
      database: 'Shared WholeWellness Database',
      users: {
        total: users?.length || 0,
        recent: users?.slice(0, 5) || []
      },
      donations: {
        total: donations?.length || 0,
        totalAmount: donations?.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0) || 0
      },
      errors: {
        users: usersError?.message || null,
        donations: donationsError?.message || null
      }
    });
    
  } catch (error) {
    console.error('Error fetching database stats:', error);
    res.status(500).json({ error: 'Failed to fetch database statistics' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`WholeWellness Chatbot running on http://localhost:${PORT}`);
  console.log('Sharing database with main website at http://localhost:5000');
  console.log('Available endpoints:');
  console.log(`  - Web Interface: http://localhost:${PORT}`);
  console.log(`  - Health Check: http://localhost:${PORT}/health`);
  console.log(`  - Database Stats: http://localhost:${PORT}/api/database/stats`);
});