-- Conversation Intelligence Tables for WholeWellness Platform
-- Run this script in Supabase SQL Editor

-- 1. Chat conversation summaries (AI-generated daily/session summaries)
CREATE TABLE IF NOT EXISTS chat_summaries (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coach_type VARCHAR NOT NULL,
  conversation_date TIMESTAMP NOT NULL,
  message_count INTEGER NOT NULL,
  summary TEXT NOT NULL,
  key_topics TEXT[],
  emotional_tone VARCHAR,
  action_items JSONB,
  insights TEXT,
  full_transcript TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. User digest preferences (email digest settings)
CREATE TABLE IF NOT EXISTS digest_preferences (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  frequency VARCHAR NOT NULL DEFAULT 'weekly',
  preferred_day VARCHAR,
  preferred_hour INTEGER DEFAULT 9,
  timezone VARCHAR NOT NULL DEFAULT 'America/New_York',
  include_action_items BOOLEAN DEFAULT TRUE,
  include_insights BOOLEAN DEFAULT TRUE,
  include_progress BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  last_sent_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Sent digest history (tracking delivered digests)
CREATE TABLE IF NOT EXISTS sent_digests (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  digest_type VARCHAR NOT NULL,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  summary_count INTEGER NOT NULL,
  content JSONB NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMP
);

-- 4. Crisis alerts (mental health safety escalation)
CREATE TABLE IF NOT EXISTS crisis_alerts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coach_type VARCHAR NOT NULL,
  trigger_message TEXT NOT NULL,
  severity_level VARCHAR NOT NULL,
  detected_keywords TEXT[],
  ai_assessment TEXT,
  status VARCHAR DEFAULT 'new',
  escalated_to VARCHAR,
  resolution TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_summaries_user_date ON chat_summaries(user_id, conversation_date DESC);
CREATE INDEX IF NOT EXISTS idx_digest_preferences_user ON digest_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_sent_digests_user ON sent_digests(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_crisis_alerts_status ON crisis_alerts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crisis_alerts_user ON crisis_alerts(user_id, created_at DESC);

-- Grant permissions (adjust if needed based on your Supabase setup)
GRANT ALL ON chat_summaries TO postgres;
GRANT ALL ON digest_preferences TO postgres;
GRANT ALL ON sent_digests TO postgres;
GRANT ALL ON crisis_alerts TO postgres;
