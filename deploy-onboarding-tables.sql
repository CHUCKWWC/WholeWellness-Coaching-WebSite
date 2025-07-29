-- Onboarding System Tables for Whole Wellness Coaching Platform
-- Run this script in your Supabase SQL Editor

-- Create onboarding_progress table
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER NOT NULL,
  data JSONB DEFAULT '{}',
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_intake table
CREATE TABLE IF NOT EXISTS client_intake (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  primary_goal TEXT,
  specific_challenges JSONB DEFAULT '[]',
  previous_support TEXT,
  urgency_level VARCHAR,
  health_concerns JSONB DEFAULT '[]',
  medications TEXT,
  sleep_quality INTEGER,
  stress_level INTEGER,
  exercise_frequency VARCHAR,
  coaching_style JSONB DEFAULT '[]',
  session_frequency VARCHAR,
  preferred_days JSONB DEFAULT '[]',
  preferred_times JSONB DEFAULT '[]',
  communication_preference VARCHAR,
  emergency_contact JSONB,
  current_safety_level INTEGER,
  needs_immediate_support BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coach_applications table
CREATE TABLE IF NOT EXISTS coach_applications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  bio TEXT,
  location VARCHAR,
  linked_in VARCHAR,
  certifications JSONB DEFAULT '[]',
  specializations JSONB DEFAULT '[]',
  years_of_experience INTEGER,
  availability JSONB,
  banking_info JSONB,
  background_check_consent BOOLEAN DEFAULT FALSE,
  status VARCHAR DEFAULT 'pending', -- pending, under_review, approved, rejected
  review_notes TEXT,
  reviewed_by VARCHAR REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_client_intake_user_id ON client_intake(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_applications_user_id ON coach_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_applications_status ON coach_applications(status);

-- Success message
SELECT 'Onboarding tables created successfully!' AS message;