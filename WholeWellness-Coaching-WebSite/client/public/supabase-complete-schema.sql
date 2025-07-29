-- Complete Database Schema Setup for Whole Wellness Coaching Platform
-- Run this script in your Supabase SQL Editor

-- ===========================================
-- 1. ONBOARDING TABLES (Previously created)
-- ===========================================

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

-- ===========================================
-- 2. ADMIN SYSTEM TABLES (Missing)
-- ===========================================

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin activity log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  resource TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL,
  permission TEXT NOT NULL,
  resource TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 3. DONATION SYSTEM TABLES (Missing)
-- ===========================================

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  donation_type TEXT NOT NULL, -- one-time, monthly, yearly
  payment_method TEXT, -- stripe, paypal, etc
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  dedicated_to TEXT, -- person or cause
  is_anonymous BOOLEAN DEFAULT FALSE,
  message TEXT,
  campaign_id TEXT,
  reward_points_earned INTEGER DEFAULT 0,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  goal_amount DECIMAL NOT NULL,
  raised_amount DECIMAL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  category TEXT, -- emergency, program, general
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reward transactions table
CREATE TABLE IF NOT EXISTS reward_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  points INTEGER NOT NULL,
  type TEXT NOT NULL, -- earned, redeemed
  reason TEXT NOT NULL, -- donation, milestone, redemption
  donation_id TEXT REFERENCES donations(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Member benefits table
CREATE TABLE IF NOT EXISTS member_benefits (
  id TEXT PRIMARY KEY,
  membership_level TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- Sessions table (for user sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Impact metrics table
CREATE TABLE IF NOT EXISTS impact_metrics (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  metric TEXT NOT NULL, -- lives_impacted, sessions_funded, etc
  value INTEGER NOT NULL,
  period TEXT DEFAULT 'all-time', -- monthly, yearly, all-time
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donation presets table
CREATE TABLE IF NOT EXISTS donation_presets (
  id TEXT PRIMARY KEY,
  amount DECIMAL NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_popular BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- ===========================================
-- 4. COACH SYSTEM TABLES (Missing)
-- ===========================================

-- Coaches table
CREATE TABLE IF NOT EXISTS coaches (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  coach_id TEXT UNIQUE NOT NULL, -- Professional coach ID
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  profile_image TEXT,
  bio TEXT,
  specialties JSONB DEFAULT '[]',
  experience INTEGER, -- years of experience
  status TEXT DEFAULT 'pending', -- pending, approved, active, suspended
  is_verified BOOLEAN DEFAULT FALSE,
  hourly_rate DECIMAL(10,2),
  timezone TEXT,
  languages JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coach credentials table
CREATE TABLE IF NOT EXISTS coach_credentials (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER REFERENCES coaches(id) NOT NULL,
  credential_type TEXT NOT NULL, -- license, certification, degree
  title TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  issue_date TIMESTAMP WITH TIME ZONE,
  expiration_date TIMESTAMP WITH TIME ZONE,
  credential_number TEXT,
  document_url TEXT, -- uploaded document
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coach banking table
CREATE TABLE IF NOT EXISTS coach_banking (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER REFERENCES coaches(id) NOT NULL,
  bank_name TEXT,
  account_type TEXT, -- checking, savings
  account_number TEXT, -- encrypted
  routing_number TEXT,
  account_holder_name TEXT,
  quickbooks_vendor_id TEXT,
  quickbooks_account_id TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coach availability table
CREATE TABLE IF NOT EXISTS coach_availability (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER REFERENCES coaches(id) NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coach clients table
CREATE TABLE IF NOT EXISTS coach_clients (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER REFERENCES coaches(id) NOT NULL,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  specialty_area TEXT NOT NULL,
  session_frequency TEXT DEFAULT 'weekly',
  session_duration INTEGER DEFAULT 60, -- minutes
  status TEXT DEFAULT 'active', -- active, inactive, completed
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coach session notes table
CREATE TABLE IF NOT EXISTS coach_session_notes (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER REFERENCES coaches(id) NOT NULL,
  client_id TEXT NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  session_duration INTEGER NOT NULL, -- minutes
  session_type TEXT NOT NULL, -- video, phone, in-person
  notes TEXT NOT NULL,
  goals_discussed TEXT,
  action_items TEXT,
  client_mood TEXT,
  session_rating INTEGER, -- 1-5 scale
  requires_follow_up BOOLEAN DEFAULT FALSE,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  billing_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coach message templates table
CREATE TABLE IF NOT EXISTS coach_message_templates (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER REFERENCES coaches(id) NOT NULL,
  template_name TEXT NOT NULL,
  message_type TEXT NOT NULL, -- reminder, check-in, crisis, motivation
  message_content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coach client communications table
CREATE TABLE IF NOT EXISTS coach_client_communications (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER REFERENCES coaches(id) NOT NULL,
  client_id TEXT NOT NULL,
  communication_type TEXT NOT NULL, -- sms, email, call, in-person
  direction TEXT NOT NULL, -- inbound, outbound
  content TEXT,
  template_id INTEGER REFERENCES coach_message_templates(id),
  is_automated BOOLEAN DEFAULT FALSE,
  n8n_workflow_id TEXT, -- for automation tracking
  delivery_status TEXT, -- sent, delivered, read, failed
  client_response TEXT,
  requires_follow_up BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coach metrics table
CREATE TABLE IF NOT EXISTS coach_metrics (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER REFERENCES coaches(id) NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  average_session_rating DECIMAL(3,2),
  client_retention_rate DECIMAL(5,2),
  response_time INTEGER, -- average response time in minutes
  completed_goals INTEGER DEFAULT 0,
  crisis_sessions INTEGER DEFAULT 0,
  client_satisfaction_score DECIMAL(3,2),
  hours_worked DECIMAL(8,2),
  revenue DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 5. CMS SYSTEM TABLES (Missing)
-- ===========================================

-- Content pages table
CREATE TABLE IF NOT EXISTS content_pages (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  featured_image TEXT,
  author TEXT DEFAULT 'Admin',
  page_type TEXT DEFAULT 'page', -- page, blog, service
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content blocks table
CREATE TABLE IF NOT EXISTS content_blocks (
  id SERIAL PRIMARY KEY,
  page_id INTEGER REFERENCES content_pages(id),
  block_type TEXT NOT NULL, -- hero, text, image, testimonial, cta
  title TEXT,
  content TEXT,
  image_url TEXT,
  button_text TEXT,
  button_url TEXT,
  background_color TEXT,
  text_color TEXT,
  "order" INTEGER DEFAULT 0,
  settings JSONB, -- Additional flexible settings
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media library table
CREATE TABLE IF NOT EXISTS media_library (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  category TEXT DEFAULT 'general', -- testimonial, hero, service, resource
  uploaded_by TEXT DEFAULT 'Admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Navigation menus table
CREATE TABLE IF NOT EXISTS navigation_menus (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  parent_id INTEGER,
  "order" INTEGER DEFAULT 0,
  is_external BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  menu_location TEXT DEFAULT 'main', -- main, footer, sidebar
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  type TEXT DEFAULT 'text', -- text, boolean, json, number
  category TEXT DEFAULT 'general', -- general, seo, contact, social
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 6. ADD MISSING COLUMNS TO EXISTING TABLES
-- ===========================================

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS coaching_preferences TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_level TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS donation_total DECIMAL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- ===========================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ===========================================

-- Onboarding indexes
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens("userId");
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens("expiresAt");
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens("userId");
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens("expiresAt");
CREATE INDEX IF NOT EXISTS idx_user_onboarding_steps_user_id ON user_onboarding_steps("userId");
CREATE INDEX IF NOT EXISTS idx_user_onboarding_steps_completed ON user_onboarding_steps(completed);

-- Admin indexes
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_user_id ON admin_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_timestamp ON admin_activity_log(timestamp);

-- Donation indexes
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_is_active ON campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_reward_transactions_user_id ON reward_transactions(user_id);

-- Coach indexes
CREATE INDEX IF NOT EXISTS idx_coaches_user_id ON coaches(user_id);
CREATE INDEX IF NOT EXISTS idx_coaches_status ON coaches(status);
CREATE INDEX IF NOT EXISTS idx_coach_clients_coach_id ON coach_clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_clients_status ON coach_clients(status);

-- CMS indexes
CREATE INDEX IF NOT EXISTS idx_content_pages_slug ON content_pages(slug);
CREATE INDEX IF NOT EXISTS idx_content_pages_is_published ON content_pages(is_published);
CREATE INDEX IF NOT EXISTS idx_content_blocks_page_id ON content_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_navigation_menus_parent_id ON navigation_menus(parent_id);

-- ===========================================
-- 8. ENABLE ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS for sensitive tables
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_session_notes ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 9. CREATE RLS POLICIES
-- ===========================================

-- Policies for password_reset_tokens
CREATE POLICY IF NOT EXISTS "Users can access their own password reset tokens" ON password_reset_tokens
  FOR ALL USING (auth.uid()::text = "userId");

-- Policies for email_verification_tokens
CREATE POLICY IF NOT EXISTS "Users can access their own email verification tokens" ON email_verification_tokens
  FOR ALL USING (auth.uid()::text = "userId");

-- Policies for user_onboarding_steps
CREATE POLICY IF NOT EXISTS "Users can access their own onboarding steps" ON user_onboarding_steps
  FOR ALL USING (auth.uid()::text = "userId");

-- Policies for donations
CREATE POLICY IF NOT EXISTS "Users can access their own donations" ON donations
  FOR ALL USING (auth.uid()::text = user_id);

-- Policies for reward_transactions
CREATE POLICY IF NOT EXISTS "Users can access their own reward transactions" ON reward_transactions
  FOR ALL USING (auth.uid()::text = user_id);

-- ===========================================
-- 10. INSERT DEFAULT DATA
-- ===========================================

-- Insert default onboarding steps
INSERT INTO user_onboarding_steps ("userId", step_id, title, description, "order") VALUES
  ('default', 'welcome', 'Welcome to Whole Wellness Coaching', 'Complete your profile and learn about our platform', 1),
  ('default', 'profile', 'Complete Your Profile', 'Add your personal information and wellness goals', 2),
  ('default', 'specialty', 'Choose Your Coaching Specialty', 'Select the areas where you need support', 3),
  ('default', 'preferences', 'Set Your Preferences', 'Configure your communication and session preferences', 4),
  ('default', 'completion', 'Welcome Complete!', 'You are ready to start your wellness journey', 5)
ON CONFLICT ("userId", step_id) DO NOTHING;

-- Insert default donation presets
INSERT INTO donation_presets (id, amount, label, description, is_popular, sort_order, is_active) VALUES
  ('preset_1', 25.00, 'Supporter', 'Help fund one coaching session', false, 1, true),
  ('preset_2', 50.00, 'Advocate', 'Support weekly coaching for someone in need', true, 2, true),
  ('preset_3', 100.00, 'Champion', 'Fund a month of coaching sessions', true, 3, true),
  ('preset_4', 250.00, 'Guardian', 'Support comprehensive coaching program', false, 4, true)
ON CONFLICT (id) DO NOTHING;

-- Insert default member benefits
INSERT INTO member_benefits (id, membership_level, title, description, icon, is_active, sort_order) VALUES
  ('benefit_1', 'free', 'Community Access', 'Access to community resources and support', 'users', true, 1),
  ('benefit_2', 'supporter', 'Priority Support', 'Priority access to coaching sessions', 'star', true, 2),
  ('benefit_3', 'champion', 'Exclusive Content', 'Access to premium coaching materials', 'lock', true, 3),
  ('benefit_4', 'guardian', 'One-on-One Sessions', 'Personal coaching sessions with certified coaches', 'heart', true, 4)
ON CONFLICT (id) DO NOTHING;

-- Insert default role permissions
INSERT INTO role_permissions (role, permission, resource) VALUES
  ('admin', 'view_dashboard', 'admin'),
  ('admin', 'view_users', 'users'),
  ('admin', 'edit_users', 'users'),
  ('admin', 'view_donations', 'donations'),
  ('admin', 'view_coaches', 'coaches'),
  ('admin', 'edit_coaches', 'coaches'),
  ('admin', 'view_logs', 'logs'),
  ('admin', 'content_management', 'content'),
  ('super_admin', 'system_admin', 'system'),
  ('super_admin', 'manage_admins', 'admins'),
  ('super_admin', 'data_export', 'data'),
  ('coach', 'view_clients', 'clients'),
  ('coach', 'edit_clients', 'clients'),
  ('coach', 'view_sessions', 'sessions'),
  ('coach', 'edit_sessions', 'sessions')
ON CONFLICT (role, permission, resource) DO NOTHING;

-- Success message
SELECT 'Complete database schema setup completed successfully!' AS message;