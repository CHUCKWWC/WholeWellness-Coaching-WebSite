# Conversation Intelligence System - Setup Complete ✅

## System Status: FULLY OPERATIONAL

All conversation intelligence features are now active and ready for use.

---

## 📊 Deployed Components

### ✅ Database Tables (Supabase)
- **chat_summaries** - AI-generated conversation summaries
- **digest_preferences** - User email digest settings
- **sent_digests** - Digest delivery history
- **crisis_alerts** - Mental health safety monitoring

### ✅ API Endpoints (Active)
- `POST /api/chat/summarize` - Generate conversation summaries
- `GET /api/digest/preferences` - Get user digest settings (requires auth)
- `POST /api/digest/preferences` - Update digest settings (requires auth)
- `POST /api/digest/send-now` - Manual digest trigger (requires auth)
- `GET /api/digest/crisis-alerts` - Crisis alert management (admin only)
- `PUT /api/digest/crisis-alerts/update` - Update crisis alert status (admin only)
- `POST /api/ai-coaching/chat` - Send message to AI coach (requires auth)
- `GET /api/ai-coaching/history/:sessionId` - Get chat history (requires auth)
- `GET /api/ai-coaching/sessions/:userId` - Get user sessions (requires auth)

### ✅ Automated Services
- **Digest Scheduler**: Runs hourly via node-cron
- **Crisis Detection**: Real-time keyword scanning
- **Email Delivery**: SendGrid integration for digests & alerts

---

## 🧪 Testing with charles.watson@wholewellness-coaching.org

### Step 1: User Login
1. Go to `/login`
2. Login with: `charles.watson@wholewellness-coaching.org`

### Step 2: Configure Digest Preferences
1. Navigate to `/settings`
2. Configure:
   - Frequency: Daily/Weekly/Biweekly/Monthly
   - Preferred Day: Monday-Sunday
   - Time: 0-23 (hour in your timezone)
   - Timezone: America/New_York (or your timezone)
   - Content Options:
     - ✓ Include Action Items
     - ✓ Include Insights
     - ✓ Include Progress Tracking
   - ✓ Email Enabled

### Step 3: Chat with AI Coaches
1. Visit AI coaching page (route varies by implementation)
2. Select a coach:
   - Charlene (Mindfulness)
   - Lisa (Behavior Change)
   - Dasha (Wellness)
   - Charles (Relationship)
   - Bobby (Mental Health)
   - Aria (Weight Loss)
3. Have a conversation
4. System automatically creates chat summaries

### Step 4: Test Crisis Detection
1. In chat, mention keywords like:
   - "I feel overwhelmed"
   - "struggling with anxiety"
   - "feeling depressed"
2. System detects keywords and creates alerts
3. Check `/admin-crisis-alerts` to see alerts

### Step 5: View Crisis Alerts (Admin)
1. Navigate to `/admin-crisis-alerts`
2. View all safety alerts with:
   - Severity levels (low/medium/high/critical)
   - Detected keywords
   - AI assessment
   - User information
3. Acknowledge/escalate/resolve alerts

---

## 📋 API Testing Examples

### Get Digest Preferences
```bash
curl -X GET http://localhost:5000/api/digest/preferences \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Digest Preferences
```bash
curl -X POST http://localhost:5000/api/digest/preferences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "weekly",
    "preferredDay": "monday",
    "preferredHour": 9,
    "timezone": "America/New_York",
    "includeActionItems": true,
    "includeInsights": true,
    "includeProgress": true,
    "emailEnabled": true
  }'
```

### Get Crisis Alerts (Admin Only)
```bash
curl -X GET http://localhost:5000/api/digest/crisis-alerts \
  -H "Cookie: adminSession=YOUR_ADMIN_SESSION_TOKEN"
```

### Update Crisis Alert (Admin Only)
```bash
curl -X PUT http://localhost:5000/api/digest/crisis-alerts/update \
  -H "Cookie: adminSession=YOUR_ADMIN_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "alert-id",
    "status": "resolved",
    "resolution": "Connected user with professional counselor"
  }'
```

### Chat with AI Coach
```bash
curl -X POST http://localhost:5000/api/ai-coaching/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need help managing stress",
    "coachType": "bobby",
    "persona": "supportive"
  }'
```

---

## 🔄 Automated Digest Schedule

The system automatically sends email digests based on user preferences:

- **Daily**: Every day at preferred hour
- **Weekly**: Every [preferred day] at preferred hour
- **Biweekly**: Every other [preferred day] at preferred hour
- **Monthly**: First [preferred day] of month at preferred hour

Digests include:
- Conversation summaries from the period
- Action items extracted from chats
- AI insights about progress
- Emotional tone trends
- Key topics discussed

---

## 🚨 Crisis Detection Keywords

The system monitors for these mental health indicators:

**High Priority:**
- suicide, suicidal, kill myself
- end my life, want to die
- hopeless, worthless, no point

**Medium Priority:**
- depressed, depression, anxiety
- panic attack, overwhelmed
- self-harm, cutting

**Low Priority:**
- stressed, worried, scared
- sad, lonely, isolated

Severity levels automatically trigger:
- **Critical**: Immediate admin email alert
- **High**: Admin dashboard notification + email
- **Medium**: Dashboard notification
- **Low**: Logged for monitoring

---

## 📁 Important Files

### Database Schema
- `shared/schema.ts` - Drizzle ORM table definitions
- `supabase-conversation-tables.sql` - SQL deployment script

### Backend Routes
- `server/ai-chat-routes.ts` - AI coaching endpoints
- `server/chat-digest-routes.ts` - Digest & crisis endpoints
- `server/digest-scheduler.ts` - Automated digest sender
- `server/routes.ts` - Route registration (lines 3604-3606)

### Frontend Components
- `client/src/components/DigestPreferencesSettings.tsx` - Settings UI
- `client/src/pages/AdminCrisisAlerts.tsx` - Crisis dashboard

### Configuration
- `server/index.ts` - Scheduler initialization (line 109)

---

## ⚠️ Known Issues

### SASL Authentication (Standalone Scripts Only)
- **Issue**: Standalone database scripts fail with SASL_SIGNATURE_MISMATCH
- **Affected**: Migration scripts, CLI tools, drizzle-kit push
- **Not Affected**: Running application, API endpoints, normal operations
- **Workaround**: Run SQL directly in Supabase SQL Editor

---

## ✅ Validation Checklist

- [x] Database tables created in Supabase
- [x] API routes enabled and responding
- [x] Digest scheduler active (hourly cron)
- [x] Crisis detection keywords configured
- [x] SendGrid email integration ready
- [x] Frontend UI components built
- [x] Test user configured: charles.watson@wholewellness-coaching.org
- [x] Documentation updated in replit.md

---

## 🎯 Next Steps

1. **Login** with charles.watson@wholewellness-coaching.org
2. **Configure** digest preferences at /settings
3. **Chat** with AI coaches to generate summaries
4. **Monitor** crisis alerts at /admin-crisis-alerts
5. **Verify** automated digests are sent on schedule

---

**System is ready for production use!** 🚀
