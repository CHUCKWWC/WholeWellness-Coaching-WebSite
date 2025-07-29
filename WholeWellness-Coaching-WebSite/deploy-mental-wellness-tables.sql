-- Mental Wellness Resources Database Schema
-- Execute this in your Supabase SQL Editor to create the required tables

-- Create mental wellness resources table
CREATE TABLE IF NOT EXISTS mental_wellness_resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  resource_type VARCHAR(50),
  contact_info TEXT,
  phone VARCHAR(20),
  website VARCHAR(255),
  email VARCHAR(255),
  address TEXT,
  hours TEXT,
  specialties TEXT[],
  languages TEXT[],
  emergency BOOLEAN DEFAULT FALSE,
  crisis_support BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create emergency contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  description TEXT,
  specialty VARCHAR(100),
  location VARCHAR(255),
  available_24_7 BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create personalized recommendations table
CREATE TABLE IF NOT EXISTS personalized_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  resource_id INTEGER REFERENCES mental_wellness_resources(id),
  recommendation_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reasoning TEXT,
  priority INTEGER DEFAULT 1,
  estimated_time INTEGER,
  action_steps TEXT[],
  follow_up_suggestions TEXT[],
  personalized_score DECIMAL(3,2),
  crisis_level BOOLEAN DEFAULT FALSE,
  was_accessed BOOLEAN DEFAULT FALSE,
  was_helpful BOOLEAN,
  feedback TEXT,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accessed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create resource usage analytics table
CREATE TABLE IF NOT EXISTS resource_usage_analytics (
  id SERIAL PRIMARY KEY,
  resource_id INTEGER REFERENCES mental_wellness_resources(id),
  user_id VARCHAR(255),
  session_id VARCHAR(255),
  access_duration INTEGER,
  was_helpful BOOLEAN,
  feedback TEXT,
  follow_up_action VARCHAR(100),
  user_agent TEXT,
  referrer TEXT,
  device_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample mental wellness resources
INSERT INTO mental_wellness_resources (title, description, category, resource_type, contact_info, phone, website, emergency, crisis_support, featured, specialties, languages) VALUES
('National Suicide Prevention Lifeline', 'Free 24/7 crisis support for people in suicidal crisis or emotional distress', 'crisis', 'hotline', 'Call 988 for immediate crisis support', '988', 'https://suicidepreventionlifeline.org', TRUE, TRUE, TRUE, ARRAY['suicide prevention', 'crisis intervention'], ARRAY['English', 'Spanish']),
('Crisis Text Line', 'Free 24/7 text-based crisis support', 'crisis', 'hotline', 'Text HOME to 741741', '741741', 'https://crisistextline.org', TRUE, TRUE, TRUE, ARRAY['crisis intervention', 'text support'], ARRAY['English', 'Spanish']),
('National Domestic Violence Hotline', '24/7 support for domestic violence survivors', 'safety', 'hotline', 'Call 1-800-799-7233 for confidential support', '1-800-799-7233', 'https://thehotline.org', TRUE, TRUE, TRUE, ARRAY['domestic violence', 'safety planning'], ARRAY['English', 'Spanish']),
('SAMHSA National Helpline', 'Free 24/7 treatment referral service for mental health and substance use disorders', 'treatment', 'hotline', 'Call 1-800-662-4357 for treatment referrals', '1-800-662-4357', 'https://samhsa.gov', FALSE, FALSE, TRUE, ARRAY['treatment referral', 'substance abuse'], ARRAY['English', 'Spanish']),
('Headspace', 'Meditation and mindfulness app', 'mindfulness', 'app', 'Download the Headspace app', NULL, 'https://headspace.com', FALSE, FALSE, TRUE, ARRAY['meditation', 'mindfulness', 'sleep'], ARRAY['English']),
('Calm', 'Sleep stories, meditation, and relaxation app', 'mindfulness', 'app', 'Download the Calm app', NULL, 'https://calm.com', FALSE, FALSE, TRUE, ARRAY['meditation', 'sleep', 'relaxation'], ARRAY['English']),
('BetterHelp', 'Online therapy platform', 'therapy', 'website', 'Visit BetterHelp.com to connect with licensed therapists', NULL, 'https://betterhelp.com', FALSE, FALSE, TRUE, ARRAY['therapy', 'counseling'], ARRAY['English']),
('Psychology Today', 'Find therapists and mental health professionals', 'therapy', 'website', 'Search for therapists in your area', NULL, 'https://psychologytoday.com', FALSE, FALSE, TRUE, ARRAY['therapy', 'counseling'], ARRAY['English']),
('NAMI', 'National Alliance on Mental Illness support and resources', 'support', 'website', 'Visit NAMI.org for mental health resources', NULL, 'https://nami.org', FALSE, FALSE, TRUE, ARRAY['mental health education', 'support groups'], ARRAY['English']),
('MindShift', 'Anxiety and mood tracking app', 'anxiety', 'app', 'Download the MindShift app', NULL, 'https://mindshift.com', FALSE, FALSE, FALSE, ARRAY['anxiety management', 'mood tracking'], ARRAY['English']);

-- Insert sample emergency contacts
INSERT INTO emergency_contacts (name, phone, description, specialty, location, available_24_7) VALUES
('National Suicide Prevention Lifeline', '988', 'Free 24/7 crisis support for people in suicidal crisis', 'Crisis Intervention', 'United States', TRUE),
('Crisis Text Line', '741741', 'Free 24/7 text-based crisis support', 'Crisis Intervention', 'United States', TRUE),
('National Domestic Violence Hotline', '1-800-799-7233', '24/7 support for domestic violence survivors', 'Domestic Violence', 'United States', TRUE),
('SAMHSA National Helpline', '1-800-662-4357', 'Treatment referral service for mental health and substance use', 'Treatment Referral', 'United States', TRUE),
('National Child Abuse Hotline', '1-800-4-A-CHILD', '24/7 crisis counseling for child abuse', 'Child Abuse', 'United States', TRUE),
('Trans Lifeline', '877-565-8860', 'Crisis support for transgender people', 'LGBTQ+ Support', 'United States', TRUE),
('RAINN National Sexual Assault Hotline', '1-800-656-4673', '24/7 support for sexual assault survivors', 'Sexual Assault', 'United States', TRUE),
('Veterans Crisis Line', '1-800-273-8255', '24/7 crisis support for veterans', 'Veterans Support', 'United States', TRUE);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mental_wellness_resources_category ON mental_wellness_resources(category);
CREATE INDEX IF NOT EXISTS idx_mental_wellness_resources_emergency ON mental_wellness_resources(emergency);
CREATE INDEX IF NOT EXISTS idx_mental_wellness_resources_featured ON mental_wellness_resources(featured);
CREATE INDEX IF NOT EXISTS idx_personalized_recommendations_user_id ON personalized_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_personalized_recommendations_generated_at ON personalized_recommendations(generated_at);
CREATE INDEX IF NOT EXISTS idx_resource_usage_analytics_user_id ON resource_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_usage_analytics_resource_id ON resource_usage_analytics(resource_id);