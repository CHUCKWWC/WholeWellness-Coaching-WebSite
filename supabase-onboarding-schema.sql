-- Onboarding and Account Management Tables

-- User onboarding steps tracking
CREATE TABLE IF NOT EXISTS user_onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  step_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  "order" INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("userId", step_id)
);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

-- Add new columns to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS coaching_preferences TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_at TIMESTAMP WITH TIME ZONE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_onboarding_steps_user_id ON user_onboarding_steps("userId");
CREATE INDEX IF NOT EXISTS idx_user_onboarding_steps_completed ON user_onboarding_steps(completed);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens("userId");
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires ON email_verification_tokens("expiresAt");
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens("userId");
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires ON password_reset_tokens("expiresAt");

-- Cleanup function for expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  -- Clean up expired email verification tokens
  DELETE FROM email_verification_tokens 
  WHERE "expiresAt" < NOW();
  
  -- Clean up expired password reset tokens
  DELETE FROM password_reset_tokens 
  WHERE "expiresAt" < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a periodic cleanup job (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-tokens', '0 2 * * *', 'SELECT cleanup_expired_tokens();');

-- Insert default onboarding steps template data
INSERT INTO user_onboarding_steps (step_id, title, description, "order", completed, "userId")
VALUES 
  ('email_verification', 'Verify Your Email', 'Check your email and click the verification link to activate your account', 1, FALSE, 'template'),
  ('profile_setup', 'Complete Your Profile', 'Add your personal information and preferences to personalize your experience', 2, FALSE, 'template'),
  ('coaching_selection', 'Choose Your Coaching Focus', 'Select the areas where you need support to get personalized recommendations', 3, FALSE, 'template'),
  ('ai_coach_intro', 'Meet Your AI Coaches', 'Get introduced to our AI coaches and try your first coaching session', 4, FALSE, 'template'),
  ('resource_exploration', 'Explore Resources', 'Discover our library of wellness tools, guides, and educational content', 5, FALSE, 'template')
ON CONFLICT ("userId", step_id) DO NOTHING;

-- Enable RLS (Row Level Security) for enhanced security
ALTER TABLE user_onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_onboarding_steps
CREATE POLICY "Users can view their own onboarding steps" ON user_onboarding_steps
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own onboarding steps" ON user_onboarding_steps
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Service can insert onboarding steps" ON user_onboarding_steps
  FOR INSERT WITH CHECK (true);

-- RLS policies for email_verification_tokens
CREATE POLICY "Users can view their own verification tokens" ON email_verification_tokens
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Service can manage verification tokens" ON email_verification_tokens
  FOR ALL WITH CHECK (true);

-- RLS policies for password_reset_tokens
CREATE POLICY "Service can manage password reset tokens" ON password_reset_tokens
  FOR ALL WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_onboarding_steps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON email_verification_tokens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON password_reset_tokens TO authenticated;
GRANT USAGE ON SEQUENCE user_onboarding_steps_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE email_verification_tokens_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE password_reset_tokens_id_seq TO authenticated;