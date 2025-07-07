# WholeWellness AI Coaching Chatbot

A standalone AI wellness coaching chatbot that provides personalized nutrition, fitness, and mental health guidance.

## Features

- **AI-Powered Coaching**: Uses OpenAI GPT-4 for intelligent wellness advice
- **Real-time Chat**: Instant messaging with typing indicators
- **Database Integration**: Shares Supabase database with main WholeWellness platform
- **Responsive Design**: Works on desktop and mobile devices
- **Session Management**: Maintains conversation history

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: Supabase PostgreSQL
- **AI**: OpenAI GPT-4 API
- **Frontend**: Pure HTML/CSS/JavaScript
- **Deployment**: Replit-ready

## Environment Variables

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

## Installation

1. Clone or download the chatbot files
2. Install dependencies: `npm install`
3. Set environment variables
4. Start server: `npm start`
5. Access at `http://localhost:3001`

## API Endpoints

- `GET /` - Chat interface
- `GET /health` - Health check
- `GET /api/database/info` - Database connection info
- `POST /api/chat/start` - Start new chat session
- `POST /api/chat/message` - Send message to AI coach

## Deployment

See `deploy-to-replit.md` for detailed deployment instructions.

## Usage

The chatbot provides personalized wellness coaching including:
- Nutrition planning and meal suggestions
- Fitness routines and exercise guidance
- Mental health support and stress management
- Goal setting and progress tracking
- Lifestyle optimization tips

## Database Integration

Shares the same Supabase database as the main WholeWellness platform with these tables:
- `chat_sessions` - Chat session tracking
- `chat_messages` - Message history
- `users` - User profiles (shared)
- `testimonials` - User testimonials (shared)
- `donations` - Donation records (shared)

## Support

For technical support or questions, contact the WholeWellness Coaching team.