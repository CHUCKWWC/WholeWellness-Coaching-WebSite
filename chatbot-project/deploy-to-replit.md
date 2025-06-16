# Deploy Chatbot to Separate Replit Project

## Quick Deployment Steps

### 1. Create New Replit Project
1. Go to https://replit.com
2. Click "Create Repl"
3. Choose "Node.js" template
4. Name it "wholewellness-chatbot"

### 2. Upload Files
Copy these files to your new Replit:
```
├── package.json
├── server.js (or simple-chatbot.js)
├── public/
│   └── index.html
├── .env
└── README.md
```

### 3. Configure Environment
In Replit Secrets, add:
```
SUPABASE_URL=https://pwuwmnivvdvdxdewynbo.supabase.co
SUPABASE_KEY=[your_supabase_key]
OPENAI_API_KEY=[your_openai_key]
PORT=3000
NODE_ENV=production
```

### 4. Set Run Command
In `.replit` file:
```toml
run = "node server.js"
language = "nodejs"

[nix]
channel = "stable-22_11"

[deployment]
publicDir = "public"
deploymentTarget = "cloudrun"
```

### 5. Install Dependencies
In Shell tab:
```bash
npm install express cors dotenv @supabase/supabase-js openai ws uuid
```

### 6. Deploy
1. Click "Deploy" button
2. Choose "Autoscale Deployment"
3. Get your `.replit.app` URL

## Integration Methods

### Method 1: Iframe Embed
Add to your main website:
```html
<div class="chat-widget">
  <iframe 
    src="https://your-chatbot.replit.app" 
    width="400" 
    height="600"
    frameborder="0"
    style="border-radius: 10px;">
  </iframe>
</div>
```

### Method 2: API Integration
Use the chatbot API in your main website:
```javascript
// Start chat session
const startChat = async (userId) => {
  const response = await fetch('https://your-chatbot.replit.app/api/chat/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  return response.json();
};

// Send message
const sendMessage = async (sessionId, message, userId) => {
  const response = await fetch('https://your-chatbot.replit.app/api/chat/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message, userId })
  });
  return response.json();
};
```

### Method 3: Custom Domain
1. Upgrade to Replit Pro
2. Add custom domain: `chat.yourdomain.com`
3. Configure DNS CNAME record
4. Update CORS settings

## Benefits of Separate Deployment

### Independent Scaling
- Chatbot usage won't affect main website performance
- Scale based on chat volume independently
- Separate resource allocation

### Development Flexibility
- Update chatbot without touching main website
- Different deployment schedules
- Easier A/B testing for chat features

### Cost Optimization
- Pay only for chatbot usage
- Optimize AI API costs separately
- Monitor chatbot-specific metrics

### Data Consistency
- Shares same Supabase database
- User authentication carries over
- Consistent user experience

## Monitoring Your Deployment

### Health Checks
```bash
curl https://your-chatbot.replit.app/health
```

### Database Connection
```bash
curl https://your-chatbot.replit.app/api/database/info
```

### Usage Analytics
Monitor through Replit dashboard:
- Request volume
- Response times
- Error rates
- Resource usage

## Security Configuration

### CORS Settings
Update your chatbot server:
```javascript
app.use(cors({
  origin: [
    'https://yourmainwebsite.com',
    'https://www.yourmainwebsite.com',
    'https://your-main-site.replit.app'
  ],
  credentials: true
}));
```

### Rate Limiting
Add to prevent abuse:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```