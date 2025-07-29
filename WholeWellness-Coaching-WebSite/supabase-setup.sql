-- Supabase Database Configuration for Chat Sessions
-- Run these commands in your Supabase SQL Editor

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  agent_type VARCHAR(50),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active',
  title VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  message_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  agent_response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_activity ON chat_sessions(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions
CREATE POLICY "Users can read own sessions" ON chat_sessions
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own sessions" ON chat_sessions
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own sessions" ON chat_sessions
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Service role full access sessions" ON chat_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for chat_messages
CREATE POLICY "Users can read own messages" ON chat_messages
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert messages to own sessions" ON chat_messages
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Service role full access messages" ON chat_messages
  FOR ALL USING (auth.role() = 'service_role');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to chat_sessions
CREATE TRIGGER update_chat_sessions_updated_at 
  BEFORE UPDATE ON chat_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get user chat history
CREATE OR REPLACE FUNCTION get_user_chat_sessions(user_uuid TEXT)
RETURNS TABLE (
  session_id UUID,
  session_identifier VARCHAR(255),
  agent_type VARCHAR(50),
  title VARCHAR(255),
  started_at TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE,
  message_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.session_id,
    cs.agent_type,
    cs.title,
    cs.started_at,
    cs.last_activity,
    COUNT(cm.id) as message_count
  FROM chat_sessions cs
  LEFT JOIN chat_messages cm ON cs.id = cm.session_id
  WHERE cs.user_id = user_uuid AND cs.status = 'active'
  GROUP BY cs.id, cs.session_id, cs.agent_type, cs.title, cs.started_at, cs.last_activity
  ORDER BY cs.last_activity DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get session messages
CREATE OR REPLACE FUNCTION get_session_messages(session_uuid UUID)
RETURNS TABLE (
  message_id VARCHAR(255),
  content TEXT,
  is_user BOOLEAN,
  timestamp TIMESTAMP WITH TIME ZONE,
  agent_response_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.message_id,
    cm.content,
    cm.is_user,
    cm.timestamp,
    cm.agent_response_data
  FROM chat_messages cm
  WHERE cm.session_id = session_uuid
  ORDER BY cm.timestamp ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;