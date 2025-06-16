import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';

const PORT = 3001;

// Simple AI coaching responses for demonstration
const coachingResponses = {
  nutrition: [
    "Focus on whole foods like vegetables, fruits, lean proteins, and whole grains. What specific nutrition goals are you working on?",
    "Try meal prepping with colorful vegetables and balanced macros. Would you like specific meal ideas?",
    "Sustainable nutrition changes work better than extreme diets. What's one small change you could make this week?"
  ],
  fitness: [
    "Start with activities you enjoy - even 10 minutes of movement counts. What type of exercise interests you?",
    "Consistency beats intensity when starting a fitness routine. How many days per week can you commit to movement?",
    "Mix cardio, strength, and flexibility work for balanced fitness. What's your current activity level?"
  ],
  mental: [
    "Mental health is just as important as physical health. Practice mindfulness and get quality sleep.",
    "Stress management techniques like deep breathing or meditation can be very helpful. What stressors are you dealing with?",
    "Building resilience takes time and practice. Focus on one self-care activity today. What brings you joy?"
  ],
  general: [
    "I'm here to support your wellness journey! Whether it's nutrition, fitness, or mental health, small steps lead to big changes.",
    "Wellness is personal - what works for others might not work for you. What aspect of health would you like to focus on?",
    "Remember to be patient with yourself. Progress isn't always linear. How can I help you today?"
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

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Serve static files
  if (pathname === '/' || pathname === '/index.html') {
    fs.readFile(path.join(process.cwd(), 'public', 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }
  
  // Health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'WholeWellness Chatbot',
      timestamp: new Date().toISOString(),
      database: 'Shares Supabase database with main website',
      port: PORT
    }));
    return;
  }
  
  // Chat API endpoints
  if (pathname === '/api/chat/start' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        sessionId,
        message: 'Chat session started successfully',
        welcomeMessage: 'Hello! I\'m your AI wellness coach. How can I help you on your wellness journey today?',
        databaseNote: 'This chatbot shares the same Supabase database as the main WholeWellness website'
      }));
    });
    return;
  }
  
  if (pathname === '/api/chat/message' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const { sessionId, message } = JSON.parse(body);
        
        if (!sessionId || !message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Session ID and message are required' }));
          return;
        }
        
        const aiResponse = getCoachingResponse(message);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          response: aiResponse,
          messageId: `msg_${Date.now()}`,
          timestamp: new Date().toISOString(),
          note: 'Demo responses - Connect OpenAI API for full AI functionality'
        }));
        
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to process message' }));
      }
    });
    return;
  }
  
  // Database integration info
  if (pathname === '/api/database/info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      database: 'Shared WholeWellness Supabase Database',
      url: 'https://pwuwmnivvdvdxdewynbo.supabase.co',
      sharedWith: 'Main website at http://localhost:5000',
      tables: ['users', 'donations', 'testimonials', 'bookings', 'chat_sessions', 'chat_messages'],
      integration: 'Both applications can read and write to the same database',
      deployment: 'Can be deployed separately while maintaining data consistency'
    }));
    return;
  }
  
  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found' }));
});

server.listen(PORT, () => {
  console.log(`🤖 WholeWellness Chatbot running on http://localhost:${PORT}`);
  console.log(`🔗 Shares database with main website at http://localhost:5000`);
  console.log(`📋 Available endpoints:`);
  console.log(`   - Web Interface: http://localhost:${PORT}`);
  console.log(`   - Health Check: http://localhost:${PORT}/health`);
  console.log(`   - Database Info: http://localhost:${PORT}/api/database/info`);
  console.log(`   - Chat API: POST http://localhost:${PORT}/api/chat/start`);
  console.log(`   - Send Message: POST http://localhost:${PORT}/api/chat/message`);
});