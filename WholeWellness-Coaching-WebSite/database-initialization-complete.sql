-- =====================================================
-- WHOLEWELLNESS PLATFORM - COMPLETE DATABASE INITIALIZATION
-- This script creates all missing tables to enable full platform functionality
-- Run Date: July 22, 2025
-- =====================================================

BEGIN;

-- =====================================================
-- 1. CHAT SESSIONS & AI COACHING TABLES
-- =====================================================

-- Chat Sessions Table (fixing the missing column error)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  coach_type TEXT NOT NULL,
  session_title TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES chat_sessions(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  response TEXT,
  coach_type TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  message_type TEXT DEFAULT 'user' -- 'user' or 'coach'
);

-- AI Coaching Profiles Table
CREATE TABLE IF NOT EXISTS ai_coaching_profiles (
  id SERIAL PRIMARY KEY,
  coach_name TEXT NOT NULL,
  coach_type TEXT NOT NULL UNIQUE,
  description TEXT,
  specialties TEXT[],
  greeting_message TEXT,
  persona_prompt TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. DISCOVERY QUIZ & MATCHING SYSTEM
-- =====================================================

-- Discovery Quiz Results Table
CREATE TABLE IF NOT EXISTS discovery_quiz_results (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id),
  session_id TEXT,
  current_needs TEXT[],
  situation_details JSONB,
  support_preference TEXT,
  readiness_level TEXT,
  recommended_path JSONB,
  quiz_version TEXT DEFAULT 'v1',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Coach Match Tags Table
CREATE TABLE IF NOT EXISTS coach_match_tags (
  id SERIAL PRIMARY KEY,
  tag_combination TEXT NOT NULL,
  primary_coach TEXT,
  supporting_coaches TEXT[],
  ai_tools TEXT[],
  group_support BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. MENTAL WELLNESS RESOURCES
-- =====================================================

-- Mental Wellness Resources Table (fixing the missing column error)
CREATE TABLE IF NOT EXISTS mental_wellness_resources (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  resource_type TEXT NOT NULL, -- 'article', 'video', 'audio', 'tool', 'crisis'
  category TEXT NOT NULL, -- 'anxiety', 'depression', 'trauma', 'relationships', 'crisis'
  crisis_level INTEGER DEFAULT 0, -- 0=normal, 1=urgent, 2=crisis
  target_audience TEXT[], -- 'survivors', 'general', 'professionals'
  tags TEXT[],
  external_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crisis Resources Table
CREATE TABLE IF NOT EXISTS crisis_resources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT,
  website_url TEXT,
  description TEXT,
  availability TEXT, -- '24/7', 'business_hours', etc.
  location_specific BOOLEAN DEFAULT false,
  location TEXT,
  resource_type TEXT NOT NULL, -- 'hotline', 'website', 'text', 'chat'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. RECOMMENDATIONS & ANALYTICS
-- =====================================================

-- User Recommendation Profiles Table
CREATE TABLE IF NOT EXISTS user_recommendation_profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  age_range TEXT,
  current_challenges TEXT[],
  wellness_goals TEXT[],
  support_preferences TEXT[],
  crisis_indicators TEXT[],
  readiness_level TEXT,
  last_assessment TIMESTAMP DEFAULT NOW(),
  profile_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Recommendation Results Table
CREATE TABLE IF NOT EXISTS recommendation_results (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  profile_id TEXT NOT NULL REFERENCES user_recommendation_profiles(id),
  recommendations JSONB NOT NULL,
  recommendation_scores JSONB,
  context_data JSONB,
  feedback_rating INTEGER,
  feedback_comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Recommendation Analytics Table
CREATE TABLE IF NOT EXISTS recommendation_analytics (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  recommendation_id TEXT NOT NULL REFERENCES recommendation_results(id),
  action_type TEXT NOT NULL, -- 'viewed', 'clicked', 'completed', 'dismissed'
  resource_id TEXT,
  resource_type TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  session_data JSONB
);

-- =====================================================
-- 5. KNOWLEDGE BASE & CONTENT MANAGEMENT
-- =====================================================

-- Knowledge Base Articles Table
CREATE TABLE IF NOT EXISTS knowledge_base_articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  tags TEXT[],
  difficulty_level TEXT DEFAULT 'beginner',
  reading_time INTEGER,
  search_keywords TEXT,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  author TEXT DEFAULT 'WholeWellness Team',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge Base Search Analytics
CREATE TABLE IF NOT EXISTS knowledge_base_search_analytics (
  id SERIAL PRIMARY KEY,
  search_query TEXT NOT NULL,
  results_found INTEGER DEFAULT 0,
  user_id TEXT REFERENCES users(id),
  selected_article_id INTEGER REFERENCES knowledge_base_articles(id),
  search_timestamp TIMESTAMP DEFAULT NOW(),
  user_agent TEXT,
  session_id TEXT
);

-- =====================================================
-- 6. VOLUNTEER & APPLICATION MANAGEMENT
-- =====================================================

-- Volunteer Applications Table
CREATE TABLE IF NOT EXISTS volunteer_applications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  motivation TEXT NOT NULL,
  experience TEXT,
  availability TEXT[],
  skills TEXT[],
  background_check_consent BOOLEAN DEFAULT false,
  application_status TEXT DEFAULT 'pending', -- 'pending', 'reviewing', 'approved', 'rejected'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 7. INDICES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Chat Sessions Indices
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);

-- Discovery Quiz Indices
CREATE INDEX IF NOT EXISTS idx_discovery_quiz_user_id ON discovery_quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_discovery_quiz_session_id ON discovery_quiz_results(session_id);
CREATE INDEX IF NOT EXISTS idx_coach_match_tags_combination ON coach_match_tags(tag_combination);

-- Mental Wellness Resources Indices
CREATE INDEX IF NOT EXISTS idx_mental_wellness_category ON mental_wellness_resources(category);
CREATE INDEX IF NOT EXISTS idx_mental_wellness_active ON mental_wellness_resources(is_active);
CREATE INDEX IF NOT EXISTS idx_mental_wellness_crisis ON mental_wellness_resources(crisis_level);

-- Recommendations Indices
CREATE INDEX IF NOT EXISTS idx_recommendation_profiles_user_id ON user_recommendation_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_results_user_id ON recommendation_results(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_analytics_user_id ON recommendation_analytics(user_id);

-- Knowledge Base Indices
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base_articles(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_published ON knowledge_base_articles(is_published);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_slug ON knowledge_base_articles(slug);

-- Volunteer Applications Indices
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_status ON volunteer_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_created ON volunteer_applications(created_at);

-- =====================================================
-- 8. INITIAL DATA POPULATION
-- =====================================================

-- AI Coaching Profiles
INSERT INTO ai_coaching_profiles (coach_name, coach_type, description, specialties, greeting_message, persona_prompt) VALUES
('Dasha', 'weight-loss', 'Weight Loss Specialist', '{"weight management", "nutrition", "lifestyle changes"}', 'Hi! I''m Dasha, your weight loss specialist. I''m here to support you on your wellness journey!', 'You are Dasha, a compassionate weight loss specialist focused on sustainable lifestyle changes.'),
('Dr. Sarah', 'nutritionist', 'Nutritionist & Wellness Expert', '{"nutrition", "meal planning", "wellness"}', 'Hello! I''m Dr. Sarah, your nutrition expert. Let''s work together on your wellness goals!', 'You are Dr. Sarah, a professional nutritionist with expertise in holistic wellness approaches.'),
('Marcus', 'fitness', 'Fitness & Movement Coach', '{"fitness", "exercise", "movement", "strength"}', 'Hey there! I''m Marcus, your fitness coach. Ready to get moving towards your goals?', 'You are Marcus, an encouraging fitness coach who makes exercise accessible and fun for everyone.'),
('Dr. Lisa', 'behavioral', 'Behavioral Change Specialist', '{"behavior change", "habits", "psychology"}', 'Hi! I''m Dr. Lisa, here to help you build lasting positive changes in your life.', 'You are Dr. Lisa, a behavioral change specialist who helps people develop sustainable healthy habits.'),
('Emma', 'wellness', 'Wellness Coordinator', '{"holistic wellness", "self-care", "balance"}', 'Welcome! I''m Emma, your wellness coordinator. Let''s create balance in your life together.', 'You are Emma, a holistic wellness coordinator focused on helping people achieve life balance.'),
('Alex', 'accountability', 'Accountability Partner', '{"goal setting", "motivation", "tracking"}', 'Hi! I''m Alex, your accountability partner. I''m here to keep you motivated and on track!', 'You are Alex, an encouraging accountability partner who helps people stay committed to their goals.')
ON CONFLICT (coach_type) DO UPDATE SET
  coach_name = EXCLUDED.coach_name,
  description = EXCLUDED.description,
  specialties = EXCLUDED.specialties,
  greeting_message = EXCLUDED.greeting_message,
  persona_prompt = EXCLUDED.persona_prompt,
  updated_at = NOW();

-- Coach Match Tags
INSERT INTO coach_match_tags (tag_combination, primary_coach, supporting_coaches, ai_tools, group_support) VALUES
('relationships', 'Relationship Coach', '{"Mindset Coach"}', '{"Daily AI Reflection Journals","Goal Mapping Tools"}', false),
('career', 'Career Coach', '{"Mindset Coach"}', '{"Goal Mapping Tools","Progress Tracking Dashboard"}', false),
('trauma', 'Trauma-Informed Coach', '{"Mindset Coach"}', '{"Gentle Check-in Assistant","Daily AI Reflection Journals"}', true),
('confidence', 'Mindset Coach', '{"Relationship Coach"}', '{"Daily AI Reflection Journals","Goal Mapping Tools"}', false),
('financial', 'Financial Coach', '{"Career Coach"}', '{"Goal Mapping Tools","Progress Tracking Dashboard"}', false),
('purpose', 'Life Purpose Coach', '{"Mindset Coach"}', '{"Goal Mapping Tools","Progress Tracking Dashboard"}', false),
('weight-loss', 'Weight Loss Specialist', '{"Nutritionist","Fitness Coach"}', '{"Progress Tracking","Meal Planning Tools"}', false),
('relationships+confidence', 'Relationship Coach', '{"Mindset Coach","Life Purpose Coach"}', '{"Daily AI Reflection Journals","Goal Mapping Tools","Progress Tracking Dashboard"}', false),
('trauma+confidence', 'Trauma-Informed Coach', '{"Mindset Coach"}', '{"Gentle Check-in Assistant","Daily AI Reflection Journals","Goal Mapping Tools"}', true)
ON CONFLICT DO NOTHING;

-- Mental Wellness Resources
INSERT INTO mental_wellness_resources (title, description, content, resource_type, category, crisis_level, target_audience, tags, is_active, is_featured) VALUES
('Crisis Support Resources', 'Immediate help for crisis situations', 'If you are in immediate danger, call 911. For mental health crises, contact the National Suicide Prevention Lifeline at 988.', 'crisis', 'crisis', 2, '{"general","survivors"}', '{"crisis","emergency","suicide prevention","immediate help"}', true, true),
('Understanding Trauma Responses', 'Learn about common trauma responses and healing', 'Trauma responses are normal reactions to abnormal situations. Understanding these responses is the first step in healing.', 'article', 'trauma', 0, '{"survivors","general"}', '{"trauma","healing","recovery","education"}', true, true),
('Building Healthy Relationships', 'Guide to creating supportive relationships', 'Healthy relationships are built on trust, respect, and communication. Learn how to identify and build these connections.', 'article', 'relationships', 0, '{"general","survivors"}', '{"relationships","communication","trust","healthy boundaries"}', true, true),
('Anxiety Management Techniques', 'Practical tools for managing anxiety', 'Learn breathing exercises, grounding techniques, and other tools to manage anxiety in daily life.', 'tool', 'anxiety', 0, '{"general"}', '{"anxiety","coping skills","breathing","grounding"}', true, false),
('Self-Care for Survivors', 'Gentle self-care practices for healing', 'Self-care looks different for everyone. Explore gentle practices that support your healing journey.', 'article', 'self-care', 0, '{"survivors"}', '{"self-care","healing","wellness","recovery"}', true, true)
ON CONFLICT DO NOTHING;

-- Crisis Resources
INSERT INTO crisis_resources (name, phone_number, website_url, description, availability, resource_type, is_active) VALUES
('National Suicide Prevention Lifeline', '988', 'https://suicidepreventionlifeline.org/', 'Free and confidential emotional support for people in suicidal crisis or emotional distress', '24/7', 'hotline', true),
('Crisis Text Line', '741741', 'https://www.crisistextline.org/', 'Free, 24/7 support for those in crisis. Text HOME to 741741', '24/7', 'text', true),
('National Domestic Violence Hotline', '1-800-799-7233', 'https://www.thehotline.org/', 'Confidential support for domestic violence survivors and their families', '24/7', 'hotline', true),
('RAINN National Sexual Assault Hotline', '1-800-656-4673', 'https://www.rainn.org/', 'Support for survivors of sexual violence', '24/7', 'hotline', true),
('SAMHSA National Helpline', '1-800-662-4357', 'https://www.samhsa.gov/find-help/national-helpline', 'Treatment referral and information service for mental health and substance abuse', '24/7', 'hotline', true)
ON CONFLICT DO NOTHING;

-- Knowledge Base Articles
INSERT INTO knowledge_base_articles (title, slug, content, excerpt, category, tags, difficulty_level, is_published, is_featured) VALUES
('Getting Started with WholeWellness', 'getting-started', 'Welcome to your wellness journey! This guide will help you navigate our platform and make the most of your experience.', 'Learn how to get started with our coaching platform', 'getting-started', '{"onboarding","new user","guide"}', 'beginner', true, true),
('Understanding Different Types of Coaching', 'types-of-coaching', 'We offer various types of coaching including AI-powered sessions and professional human coaches. Learn which approach might work best for you.', 'Explore our different coaching options', 'coaching', '{"coaching types","AI coaching","human coaching"}', 'beginner', true, true),
('Creating Your Wellness Action Plan', 'wellness-action-plan', 'A wellness action plan is your roadmap to achieving your goals. Learn how to create an effective plan that works for you.', 'Build a personalized wellness action plan', 'wellness', '{"planning","goals","action plan"}', 'intermediate', true, false)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Database initialization completed successfully! All tables created and populated with initial data.' as status;

COMMIT;