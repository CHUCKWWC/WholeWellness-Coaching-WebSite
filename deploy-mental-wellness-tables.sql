-- Mental Wellness Hub Database Deployment Script
-- Run this in your Supabase SQL Editor to deploy the mental wellness tables

-- 1. Create Mental Wellness Resources Table
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

-- 2. Create Emergency Contacts Table
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

-- 3. Create Wellness Assessments Table
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

-- 4. Create Personalized Recommendations Table
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

-- 5. Create Resource Usage Analytics Table
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

-- 6. Create RPC Function to increment resource usage
CREATE OR REPLACE FUNCTION increment_resource_usage(resource_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE mental_wellness_resources 
  SET usage_count = usage_count + 1, updated_at = NOW()
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Enable Row Level Security
ALTER TABLE mental_wellness_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_usage_analytics ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies
CREATE POLICY IF NOT EXISTS "Mental wellness resources are publicly viewable" ON mental_wellness_resources
  FOR SELECT USING (is_active = true);

CREATE POLICY IF NOT EXISTS "Emergency contacts are publicly viewable" ON emergency_contacts
  FOR SELECT USING (is_active = true);

CREATE POLICY IF NOT EXISTS "Users can access their own wellness assessments" ON wellness_assessments
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY IF NOT EXISTS "Users can access their own personalized recommendations" ON personalized_recommendations
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY IF NOT EXISTS "Users can access their own resource usage analytics" ON resource_usage_analytics
  FOR ALL USING (auth.uid()::text = user_id);

-- 9. Insert Sample Mental Wellness Resources
INSERT INTO mental_wellness_resources (title, description, category, resource_type, phone_number, is_emergency, availability, languages, cost_info, target_audience, rating, tags, is_featured) VALUES
  ('National Suicide Prevention Lifeline', 'Free and confidential emotional support to people in suicidal crisis or emotional distress 24/7.', 'crisis', 'hotline', '988', true, '24/7', '["English", "Spanish"]', 'free', 'general', 4.8, '["suicide", "crisis", "support"]', true),
  ('Crisis Text Line', 'Text-based mental health crisis support service available 24/7.', 'crisis', 'hotline', '741741', true, '24/7', '["English", "Spanish"]', 'free', 'general', 4.7, '["crisis", "text", "support"]', true),
  ('SAMHSA National Helpline', 'Treatment referral and information service for individuals and families facing mental health and substance use disorders.', 'crisis', 'hotline', '1-800-662-4357', false, '24/7', '["English", "Spanish"]', 'free', 'general', 4.6, '["mental health", "substance abuse", "treatment"]', true),
  ('Anxiety and Depression Association of America', 'Comprehensive resource for anxiety and depression information, self-help tools, and professional support.', 'anxiety', 'website', NULL, false, '24/7', '["English"]', 'free', 'general', 4.5, '["anxiety", "depression", "self-help"]', true),
  ('National Alliance on Mental Illness (NAMI)', 'Education, support, and advocacy for individuals and families affected by mental illness.', 'depression', 'website', NULL, false, '24/7', '["English", "Spanish"]', 'free', 'general', 4.7, '["depression", "support", "advocacy"]', true),
  ('National Domestic Violence Hotline', 'Confidential support for domestic violence survivors and their loved ones.', 'relationship', 'hotline', '1-800-799-7233', true, '24/7', '["English", "Spanish"]', 'free', 'women', 4.9, '["domestic violence", "safety", "support"]', true),
  ('Mindfulness-Based Stress Reduction (MBSR)', 'Evidence-based program for reducing stress and improving well-being through mindfulness meditation.', 'stress', 'program', NULL, false, 'Varies by location', '["English"]', 'varies', 'general', 4.4, '["mindfulness", "stress", "meditation"]', false),
  ('BetterHelp Online Therapy', 'Professional online therapy and counseling with licensed therapists.', 'therapy', 'website', NULL, false, '24/7', '["English", "Spanish"]', 'paid', 'general', 4.3, '["therapy", "counseling", "online"]', true),
  ('Talkspace Therapy', 'Online therapy platform connecting you with licensed therapists via text, voice, and video.', 'therapy', 'website', NULL, false, '24/7', '["English"]', 'paid', 'general', 4.2, '["therapy", "online", "text"]', false),
  ('Headspace Meditation App', 'Guided meditation and mindfulness app with programs for stress, sleep, and focus.', 'mindfulness', 'app', NULL, false, '24/7', '["English", "Spanish", "French"]', 'freemium', 'general', 4.5, '["meditation", "mindfulness", "app"]', true)
ON CONFLICT DO NOTHING;

-- 10. Insert Sample Emergency Contacts
INSERT INTO emergency_contacts (name, organization, phone_number, text_support, description, availability, languages, specialty, is_national, sort_order) VALUES
  ('National Suicide Prevention Lifeline', 'National Suicide Prevention Lifeline', '988', NULL, 'Free and confidential emotional support to people in suicidal crisis or emotional distress 24/7.', '24/7', '["English", "Spanish"]', 'suicide', true, 1),
  ('Crisis Text Line', 'Crisis Text Line', '741741', 'Text HOME to 741741', 'Free, 24/7 crisis support via text message.', '24/7', '["English", "Spanish"]', 'crisis', true, 2),
  ('National Domestic Violence Hotline', 'National Domestic Violence Hotline', '1-800-799-7233', NULL, 'Confidential support for domestic violence survivors and their loved ones.', '24/7', '["English", "Spanish"]', 'domestic-violence', true, 3),
  ('SAMHSA National Helpline', 'SAMHSA', '1-800-662-4357', NULL, 'Treatment referral and information service for individuals and families facing mental health and substance use disorders.', '24/7', '["English", "Spanish"]', 'mental-health', true, 4),
  ('National Sexual Assault Hotline', 'RAINN', '1-800-656-4673', NULL, 'Free, confidential support for survivors of sexual violence and their loved ones.', '24/7', '["English", "Spanish"]', 'sexual-assault', true, 5)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Mental wellness hub database tables deployed successfully!' AS message;