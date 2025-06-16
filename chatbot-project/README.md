# WholeWellness AI Chatbot

A standalone AI wellness coaching chatbot that shares the same Supabase database with the main WholeWellness website. This allows for independent deployment and scaling while maintaining data consistency.

## Features

- AI-powered wellness coaching conversations
- Real-time chat via WebSocket and REST API
- Shared database with main website
- Session management and chat history
- Mobile-responsive web interface
- OpenAI GPT-4 integration

## Setup Instructions

### 1. Install Dependencies

```bash
cd chatbot-project
npm install
```

### 2. Environment Configuration

Copy the environment template:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
```env
SUPABASE_URL=https://pwuwmnivvdvdxdewynbo.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
NODE_ENV=development
MAIN_WEBSITE_URL=http://localhost:5000
```

### 3. Database Setup

Run the SQL schema in your Supabase SQL Editor:
```sql
-- Copy and paste contents of database-schema.sql
```

### 4. Start the Chatbot Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The chatbot will be available at:
- Web Interface: http://localhost:3001
- Health Check: http://localhost:3001/health
- WebSocket: ws://localhost:3001

## API Endpoints

### Chat Management
- `POST /api/chat/start` - Start new chat session
- `POST /api/chat/message` - Send message to AI coach
- `GET /api/chat/:sessionId/history` - Get chat history
- `POST /api/chat/:sessionId/end` - End chat session

### User Management
- `GET /api/user/:userId/chats` - Get user's chat sessions

### Health Check
- `GET /health` - Service health status

## Database Integration

The chatbot uses the following tables in the shared Supabase database:

- `chat_sessions` - Chat session metadata
- `chat_messages` - Individual chat messages
- `chat_analytics` - Usage analytics
- `users` - Shared user data with main website

## Deployment Options

### Option 1: Separate Replit Project
1. Create new Replit project
2. Upload chatbot-project files
3. Configure environment variables
4. Deploy as separate service

### Option 2: Subdomain Deployment
1. Deploy to chatbot.wholewellness.org
2. Configure CORS to allow main website access
3. Embed in main website via iframe or API

### Option 3: Microservice Architecture
1. Deploy to cloud platform (Heroku, Railway, etc.)
2. Use as API backend for main website
3. Scale independently based on usage

## Integration with Main Website

To integrate the chatbot into the main website, add this to any page:

```html
<iframe 
  src="http://localhost:3001" 
  width="400" 
  height="600" 
  style="border: none; border-radius: 10px;"
></iframe>
```

Or use the API endpoints to build a custom chat interface.

## Development Notes

- Uses same Supabase database as main website
- Shares user data for personalized coaching
- Independent scaling and deployment
- Can be embedded or used standalone
- WebSocket support for real-time chat
- Comprehensive error handling and logging