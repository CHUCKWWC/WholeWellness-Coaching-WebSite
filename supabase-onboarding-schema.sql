-- Onboarding Database Schema Setup
-- Run this script in your Supabase SQL Editor

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

-- Create email verification tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

-- Create user onboarding steps table
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

-- Add missing columns to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS coaching_preferences TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens("userId");
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens("expiresAt");
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens("userId");
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens("expiresAt");
CREATE INDEX IF NOT EXISTS idx_user_onboarding_steps_user_id ON user_onboarding_steps("userId");
CREATE INDEX IF NOT EXISTS idx_user_onboarding_steps_completed ON user_onboarding_steps(completed);

-- Enable Row Level Security (RLS)
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_steps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for password_reset_tokens
CREATE POLICY "Users can access their own password reset tokens" ON password_reset_tokens
  FOR ALL USING (auth.uid()::text = "userId");

-- Create RLS policies for email_verification_tokens
CREATE POLICY "Users can access their own email verification tokens" ON email_verification_tokens
  FOR ALL USING (auth.uid()::text = "userId");

-- Create RLS policies for user_onboarding_steps
CREATE POLICY "Users can access their own onboarding steps" ON user_onboarding_steps
  FOR ALL USING (auth.uid()::text = "userId");

-- Insert default onboarding steps for new users
INSERT INTO user_onboarding_steps ("userId", step_id, title, description, "order") VALUES
  ('default', 'welcome', 'Welcome to Whole Wellness Coaching', 'Complete your profile and learn about our platform', 1),
  ('default', 'profile', 'Complete Your Profile', 'Add your personal information and wellness goals', 2),
  ('default', 'specialty', 'Choose Your Coaching Specialty', 'Select the areas where you need support', 3),
  ('default', 'preferences', 'Set Your Preferences', 'Configure your communication and session preferences', 4),
  ('default', 'completion', 'Welcome Complete!', 'You are ready to start your wellness journey', 5)
ON CONFLICT ("userId", step_id) DO NOTHING;

-- Success message
SELECT 'Onboarding database schema setup completed successfully!' AS message;