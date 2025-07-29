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

-- ===========================================
-- 11. MENTAL WELLNESS RESOURCE HUB TABLES
-- ===========================================

-- Mental Wellness Resources Table
CREATE TABLE IF NOT EXISTS mental_wellness_resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR NOT NULL,
  resource_type VARCHAR NOT NULL,
  url TEXT,
  phone_number VARCHAR,
  is_emergency BOOLEAN DEFAULT FALSE,
  availability VARCHAR,
  languages JSONB DEFAULT '["English"]',
  cost_info VARCHAR,
  target_audience VARCHAR,
  rating DECIMAL(3,2),
  usage_count INTEGER DEFAULT 0,
  tags JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR DEFAULT 'verified',
  last_verified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency Contacts Table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  organization VARCHAR,
  phone_number VARCHAR NOT NULL,
  text_support VARCHAR,
  description TEXT NOT NULL,
  availability VARCHAR NOT NULL,
  languages JSONB DEFAULT '["English"]',
  specialty VARCHAR,
  is_national BOOLEAN DEFAULT TRUE,
  country VARCHAR DEFAULT 'US',
  state VARCHAR,
  city VARCHAR,
  website TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  last_verified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wellness Assessments Table
CREATE TABLE IF NOT EXISTS wellness_assessments (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  session_id VARCHAR,
  assessment_type VARCHAR NOT NULL,
  responses JSONB NOT NULL,
  score INTEGER,
  risk_level VARCHAR,
  recommended_resources JSONB DEFAULT '[]',
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personalized Recommendations Table
CREATE TABLE IF NOT EXISTS personalized_recommendations (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  session_id VARCHAR,
  resource_id INTEGER REFERENCES mental_wellness_resources(id) NOT NULL,
  recommendation_score DECIMAL(5,2),
  reasons JSONB DEFAULT '[]',
  algorithm_version VARCHAR DEFAULT 'v1.0',
  was_accessed BOOLEAN DEFAULT FALSE,
  was_helpful BOOLEAN,
  feedback TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Resource Usage Analytics Table
CREATE TABLE IF NOT EXISTS resource_usage_analytics (
  id SERIAL PRIMARY KEY,
  resource_id INTEGER REFERENCES mental_wellness_resources(id) NOT NULL,
  user_id VARCHAR REFERENCES users(id),
  session_id VARCHAR,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT,
  device_type VARCHAR,
  access_duration INTEGER,
  was_helpful BOOLEAN,
  feedback TEXT,
  follow_up_action VARCHAR
);

-- ===========================================
-- 12. MENTAL WELLNESS FUNCTIONS
-- ===========================================

-- RPC Function to increment resource usage
CREATE OR REPLACE FUNCTION increment_resource_usage(resource_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE mental_wellness_resources 
  SET usage_count = usage_count + 1, updated_at = NOW()
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 13. MENTAL WELLNESS RLS POLICIES
-- ===========================================

-- Enable RLS for mental wellness tables
ALTER TABLE mental_wellness_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_usage_analytics ENABLE ROW LEVEL SECURITY;

-- Mental wellness resources are publicly viewable
CREATE POLICY IF NOT EXISTS "Mental wellness resources are publicly viewable" ON mental_wellness_resources
  FOR SELECT USING (is_active = true);

-- Emergency contacts are publicly viewable
CREATE POLICY IF NOT EXISTS "Emergency contacts are publicly viewable" ON emergency_contacts
  FOR SELECT USING (is_active = true);

-- Users can access their own wellness assessments
CREATE POLICY IF NOT EXISTS "Users can access their own wellness assessments" ON wellness_assessments
  FOR ALL USING (auth.uid()::text = user_id);

-- Users can access their own personalized recommendations
CREATE POLICY IF NOT EXISTS "Users can access their own personalized recommendations" ON personalized_recommendations
  FOR ALL USING (auth.uid()::text = user_id);

-- Users can access their own resource usage analytics
CREATE POLICY IF NOT EXISTS "Users can access their own resource usage analytics" ON resource_usage_analytics
  FOR ALL USING (auth.uid()::text = user_id);

-- ===========================================
-- 14. MENTAL WELLNESS SAMPLE DATA
-- ===========================================

-- Insert sample mental wellness resources
INSERT INTO mental_wellness_resources (title, description, category, resource_type, phone_number, is_emergency, availability, languages, cost_info, target_audience, rating, tags, is_featured) VALUES
  ('National Suicide Prevention Lifeline', 'Free and confidential emotional support to people in suicidal crisis or emotional distress 24/7.', 'crisis', 'hotline', '988', true, '24/7', '["English", "Spanish"]', 'free', 'general', 4.8, '["suicide", "crisis", "support"]', true),
  ('Crisis Text Line', 'Text-based mental health crisis support service available 24/7.', 'crisis', 'hotline', '741741', true, '24/7', '["English", "Spanish"]', 'free', 'general', 4.7, '["crisis", "text", "support"]', true),
  ('SAMHSA National Helpline', 'Treatment referral and information service for individuals and families facing mental health and substance use disorders.', 'crisis', 'hotline', '1-800-662-4357', false, '24/7', '["English", "Spanish"]', 'free', 'general', 4.6, '["mental health", "substance abuse", "treatment"]', true),
  ('Anxiety and Depression Association of America', 'Comprehensive resource for anxiety and depression information, self-help tools, and professional support.', 'anxiety', 'website', NULL, false, '24/7', '["English"]', 'free', 'general', 4.5, '["anxiety", "depression", "self-help"]', true),
  ('National Alliance on Mental Illness (NAMI)', 'Education, support, and advocacy for individuals and families affected by mental illness.', 'depression', 'website', NULL, false, '24/7', '["English", "Spanish"]', 'free', 'general', 4.7, '["depression", "support", "advocacy"]', true),
  ('National Domestic Violence Hotline', 'Confidential support for domestic violence survivors and their loved ones.', 'relationship', 'hotline', '1-800-799-7233', true, '24/7', '["English", "Spanish"]', 'free', 'women', 4.9, '["domestic violence", "safety", "support"]', true)
ON CONFLICT DO NOTHING;

-- Insert sample emergency contacts
INSERT INTO emergency_contacts (name, organization, phone_number, text_support, description, availability, languages, specialty, is_national, sort_order) VALUES
  ('National Suicide Prevention Lifeline', 'National Suicide Prevention Lifeline', '988', NULL, 'Free and confidential emotional support to people in suicidal crisis or emotional distress 24/7.', '24/7', '["English", "Spanish"]', 'suicide', true, 1),
  ('Crisis Text Line', 'Crisis Text Line', '741741', 'Text HOME to 741741', 'Free, 24/7 crisis support via text message.', '24/7', '["English", "Spanish"]', 'crisis', true, 2),
  ('National Domestic Violence Hotline', 'National Domestic Violence Hotline', '1-800-799-7233', NULL, 'Confidential support for domestic violence survivors and their loved ones.', '24/7', '["English", "Spanish"]', 'domestic-violence', true, 3)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Complete database schema setup completed successfully!' AS message;