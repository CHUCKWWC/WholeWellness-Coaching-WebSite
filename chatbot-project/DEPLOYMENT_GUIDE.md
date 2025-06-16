# WholeWellness Chatbot Deployment Guide

## Overview
This chatbot can be deployed separately from the main website while sharing the same Supabase database. Here are the deployment options:

## Option 1: Separate Replit Project

### Steps:
1. Create a new Replit project
2. Upload the `chatbot-project` folder contents
3. Set environment variables in Replit Secrets:
   ```
   SUPABASE_URL=https://pwuwmnivvdvdxdewynbo.supabase.co
   SUPABASE_KEY=your_supabase_key
   OPENAI_API_KEY=your_openai_key
   PORT=3000
   ```
4. Configure run command: `node server.js`
5. Deploy to get a separate .replit.app domain

### Benefits:
- Independent scaling
- Separate resource allocation
- Different update cycles
- Isolated from main website issues

## Option 2: Subdomain Deployment

### Steps:
1. Deploy chatbot to Railway/Heroku/Render
2. Configure custom domain: `chat.yourdomain.com`
3. Set CORS to allow main website access
4. Embed in main website via iframe:
   ```html
   <iframe src="https://chat.yourdomain.com" width="400" height="600"></iframe>
   ```

### Benefits:
- Professional subdomain
- Easy embedding in main site
- Independent infrastructure
- Scalable based on chat usage

## Option 3: API-Only Deployment

### Steps:
1. Deploy chatbot as API service only
2. Remove the web interface (`public/index.html`)
3. Use API endpoints in main website:
   ```javascript
   // Start chat session
   const response = await fetch('https://api.yourdomain.com/api/chat/start', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ userId, userEmail })
   });
   
   // Send messages
   const chatResponse = await fetch('https://api.yourdomain.com/api/chat/message', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ sessionId, message, userId })
   });
   ```

### Benefits:
- Microservice architecture
- Custom UI integration
- Better performance control
- Easier A/B testing

## Database Configuration

### Shared Tables:
- `users` - User accounts (shared with main website)
- `donations` - Donation history (shared)
- `testimonials` - User testimonials (shared)
- `chat_sessions` - Chat session metadata (chatbot only)
- `chat_messages` - Individual messages (chatbot only)
- `chat_analytics` - Usage analytics (chatbot only)

### Environment Variables:
```env
# Same Supabase database as main website
SUPABASE_URL=https://pwuwmnivvdvdxdewynbo.supabase.co
SUPABASE_KEY=your_anon_key

# OpenAI for AI responses
OPENAI_API_KEY=your_openai_key

# Server configuration
PORT=3001
NODE_ENV=production

# CORS for main website integration
ALLOWED_ORIGINS=https://yourmainwebsite.com,https://www.yourmainwebsite.com
```

## Security Considerations

### Database Access:
- Uses same Row Level Security (RLS) as main website
- Shared authentication context
- User data isolation maintained

### API Security:
- CORS configured for known domains
- Rate limiting recommended for production
- Session validation for user actions

### Environment Security:
- Store API keys in secure environment variables
- Use HTTPS in production
- Monitor API usage and costs

## Monitoring and Analytics

### Health Checks:
```bash
curl https://your-chatbot-domain.com/health
```

### Database Stats:
```bash
curl https://your-chatbot-domain.com/api/database/info
```

### Usage Analytics:
- Track chat sessions per user
- Monitor AI API costs
- Measure response times
- Analyze conversation topics

## Cost Optimization

### OpenAI Usage:
- Set token limits per message
- Implement conversation history trimming
- Use GPT-3.5-turbo for cost efficiency
- Cache common responses

### Infrastructure:
- Auto-scaling based on usage
- Connection pooling for database
- CDN for static assets
- Monitoring and alerting

## Integration Examples

### React Component Integration:
```jsx
import { useState, useEffect } from 'react';

function ChatWidget() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // Start chat session
    fetch('https://chat.yourdomain.com/api/chat/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    })
    .then(res => res.json())
    .then(data => setSessionId(data.sessionId));
  }, []);
  
  const sendMessage = async (message) => {
    const response = await fetch('https://chat.yourdomain.com/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message, userId: currentUser.id })
    });
    const data = await response.json();
    setMessages(prev => [...prev, { user: message, bot: data.response }]);
  };
  
  return (
    <div className="chat-widget">
      {/* Chat UI implementation */}
    </div>
  );
}
```

### WordPress Plugin Integration:
```php
// WordPress shortcode for chatbot
function wholewellness_chatbot_shortcode($atts) {
    $domain = 'https://chat.yourdomain.com';
    return '<iframe src="' . $domain . '" width="400" height="600" frameborder="0"></iframe>';
}
add_shortcode('wholewellness_chat', 'wholewellness_chatbot_shortcode');
```

## Production Checklist

### Before Deployment:
- [ ] Set all environment variables
- [ ] Test database connectivity
- [ ] Configure CORS properly
- [ ] Set up monitoring
- [ ] Test AI API responses
- [ ] Configure rate limiting
- [ ] Set up logging
- [ ] Test error handling

### After Deployment:
- [ ] Verify health endpoints
- [ ] Test chat functionality
- [ ] Monitor resource usage
- [ ] Check database queries
- [ ] Validate security headers
- [ ] Test from main website
- [ ] Monitor costs and usage
- [ ] Set up alerts and notifications