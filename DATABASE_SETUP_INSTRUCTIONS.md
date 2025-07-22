# WholeWellness Platform - Database Setup Guide

## Overview
This guide will walk you through creating the missing database tables in your Supabase database to enable full platform functionality.

## Current Status
- ✅ Core authentication and user management working
- ✅ Payment processing and Stripe integration active
- ✅ Content management and testimonials functional
- ⚠️ Missing 4 key tables for advanced features

## What You'll Enable
After completing this setup, these features will immediately work:
- AI coaching session persistence and memory
- Mental wellness resource recommendations
- Discovery quiz with coach matching
- Volunteer application management
- Complete user analytics and tracking

## Step-by-Step Instructions

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query" to create a new SQL script

### Step 2: Execute the Database Schema
Copy and paste the following SQL script into the SQL Editor:

```sql
-- =====================================================
-- WHOLEWELLNESS PLATFORM - MISSING TABLES SETUP
-- Execute this script in Supabase SQL Editor
-- =====================================================

BEGIN;

-- 1. Chat Sessions Table (AI Coaching Memory)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  coach_type TEXT NOT NULL,
  session_title TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- 2. Chat Messages Table (Conversation History)
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES chat_sessions(id),
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  coach_type TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  message_type TEXT DEFAULT 'user'
);

-- 3. Mental Wellness Resources Table
CREATE TABLE IF NOT EXISTS mental_wellness_resources (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  resource_type TEXT NOT NULL,
  category TEXT NOT NULL,
  crisis_level INTEGER DEFAULT 0,
  target_audience TEXT[],
  tags TEXT[],
  external_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Discovery Quiz Results Table
CREATE TABLE IF NOT EXISTS discovery_quiz_results (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
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

-- 5. Coach Match Tags Table
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

-- 6. AI Coaching Profiles Table
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

-- 7. Volunteer Applications Table
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
  application_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Crisis Resources Table
CREATE TABLE IF NOT EXISTS crisis_resources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT,
  website_url TEXT,
  description TEXT,
  availability TEXT,
  location_specific BOOLEAN DEFAULT false,
  location TEXT,
  resource_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Performance Indices
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_mental_wellness_category ON mental_wellness_resources(category);
CREATE INDEX IF NOT EXISTS idx_mental_wellness_active ON mental_wellness_resources(is_active);
CREATE INDEX IF NOT EXISTS idx_discovery_quiz_user_id ON discovery_quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_status ON volunteer_applications(application_status);

COMMIT;
```

### Step 3: Populate Initial Data
After creating the tables, run this script to add essential data:

```sql
-- =====================================================
-- INITIAL DATA POPULATION
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
  persona_prompt = EXCLUDED.persona_prompt;

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
```

### Step 4: Verify Installation
After executing both scripts, run this verification query:

```sql
-- Verify all tables were created successfully
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'chat_sessions', 
    'mental_wellness_resources', 
    'discovery_quiz_results', 
    'ai_coaching_profiles', 
    'volunteer_applications',
    'crisis_resources',
    'coach_match_tags'
  )
ORDER BY table_name;
```

You should see all 7 tables listed.

## What Happens After Setup

### Immediate Feature Activation
Once you complete the database setup, these features will automatically work:

1. **AI Coaching Memory**: Chat sessions will persist across visits
2. **Mental Wellness Hub**: Crisis resources and educational content will load
3. **Discovery Quiz**: Personalized coach matching will function
4. **Volunteer Portal**: Application management will be operational
5. **Analytics**: Complete user journey tracking will activate

### Testing the New Features
After setup, you can test:
- Visit `/ai-coaching` to see persistent chat sessions
- Check `/mental-wellness` for crisis resources
- Try `/assessments` for the discovery quiz
- View `/volunteer` for application forms

## Troubleshooting

### If Tables Already Exist
The scripts use `CREATE TABLE IF NOT EXISTS` so they're safe to run multiple times.

### If You Get Permission Errors
Make sure you're logged into Supabase as the project owner or have database admin permissions.

### If Data Doesn't Load
Check the browser console for any error messages and verify the table names match exactly.

## Need Help?
If you encounter any issues during setup, the error messages will guide you to the specific problem. All the application code is already prepared and waiting for these tables to exist.

---

**Next Steps**: After completing this setup, your WholeWellness Platform will have full functionality and be ready for production deployment!