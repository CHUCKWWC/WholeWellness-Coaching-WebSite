# Deploy WholeWellness Chatbot to Replit

## Quick Deployment Steps

1. **Create New Replit**
   - Go to https://replit.com/new
   - Choose "Node.js" template
   - Name: `wholewellness-chatbot`

2. **Upload Files**
   - Copy all files from `chatbot-project/` folder
   - Include: `simple-chatbot.js`, `package.json`, `public/index.html`

3. **Environment Variables**
   - Add to Replit Secrets:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_KEY`: Your Supabase service role key
     - `OPENAI_API_KEY`: Your OpenAI API key

4. **Run Command**
   - Set run command to: `node simple-chatbot.js`

5. **Access Chatbot**
   - Your chatbot will be available at: `https://wholewellness-chatbot.yourusername.repl.co`

## File Structure to Upload
```
chatbot-project/
├── simple-chatbot.js     # Main server file
├── package.json          # Dependencies
├── public/
│   └── index.html        # Chat interface
└── README.md            # Documentation
```

## Environment Variables Needed
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase service role key  
- `OPENAI_API_KEY` - Your OpenAI API key for AI responses

## Post-Deployment
- Test the chatbot at your new Replit URL
- Update the testing button link in your main website to point to the new URL