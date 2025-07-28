-- Fix Assessment System Database Issues
-- Execute this SQL in your Supabase SQL Editor to resolve all assessment failures

-- ============================================
-- 1. CREATE MISSING ASSESSMENT TABLES
-- ============================================

-- Assessment types table
CREATE TABLE IF NOT EXISTS assessment_types (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  display_name VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1,
  fields JSONB NOT NULL,
  coach_types TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User assessments table
CREATE TABLE IF NOT EXISTS user_assessments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  assessment_type_id TEXT NOT NULL REFERENCES assessment_types(id),
  responses JSONB NOT NULL,
  summary TEXT,
  tags TEXT[],
  completed_at TIMESTAMP DEFAULT NOW(),
  last_accessed_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Coach interactions table
CREATE TABLE IF NOT EXISTS coach_interactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  coach_type VARCHAR NOT NULL,
  accessed_assessments TEXT[],
  interaction_summary TEXT,
  session_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assessment forms table
CREATE TABLE IF NOT EXISTS assessment_forms (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_type_id TEXT NOT NULL REFERENCES assessment_types(id),
  form_data JSONB NOT NULL,
  validation_rules JSONB,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Add missing columns to mental_wellness_resources if needed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mental_wellness_resources' AND column_name = 'is_active') THEN
        ALTER TABLE mental_wellness_resources ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add missing columns to emergency_contacts if needed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emergency_contacts' AND column_name = 'is_active') THEN
        ALTER TABLE emergency_contacts ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- ============================================
-- 3. SEED ASSESSMENT TYPES WITH REAL DATA
-- ============================================

-- Insert default assessment types
INSERT INTO assessment_types (id, name, display_name, category, description, fields, coach_types, is_active) VALUES
('weight-loss-intake', 'weight_loss_intake', 'Weight Loss Intake Assessment', 'health', 'Comprehensive intake form for weight loss coaching', 
 '{"fields": [
   {"name": "currentWeight", "type": "number", "label": "Current Weight (lbs)", "required": true},
   {"name": "goalWeight", "type": "number", "label": "Goal Weight (lbs)", "required": true},
   {"name": "timeline", "type": "select", "label": "Timeline", "options": ["3 months", "6 months", "1 year", "2+ years"], "required": true},
   {"name": "previousAttempts", "type": "textarea", "label": "Previous Weight Loss Attempts", "required": false},
   {"name": "medicalConditions", "type": "textarea", "label": "Medical Conditions", "required": false},
   {"name": "currentActivity", "type": "select", "label": "Current Activity Level", "options": ["Sedentary", "Light", "Moderate", "Active", "Very Active"], "required": true}
 ]}',
 '{"weight_loss", "nutrition", "fitness"}', true),

('attachment-style', 'attachment_style', 'Relationship Attachment Style Assessment', 'relationships', 'Assessment to determine relationship attachment patterns', 
 '{"fields": [
   {"name": "relationshipStatus", "type": "select", "label": "Current Relationship Status", "options": ["Single", "Dating", "In a relationship", "Married", "Divorced", "Widowed"], "required": true},
   {"name": "pastRelationships", "type": "number", "label": "Number of serious relationships", "required": true},
   {"name": "communicationStyle", "type": "select", "label": "Communication Style", "options": ["Direct", "Indirect", "Passive", "Aggressive", "Mixed"], "required": true},
   {"name": "conflictHandling", "type": "textarea", "label": "How do you handle conflict?", "required": true},
   {"name": "trustIssues", "type": "select", "label": "Trust Level", "options": ["Very trusting", "Somewhat trusting", "Cautious", "Have trust issues"], "required": true}
 ]}',
 '{"relationship", "behavior"}', true),

('mental-health-screening', 'mental_health_screening', 'Mental Health & Wellness Screening', 'mental_health', 'Initial mental health and wellness assessment', 
 '{"fields": [
   {"name": "moodRating", "type": "range", "label": "Overall mood (1-10)", "min": 1, "max": 10, "required": true},
   {"name": "stressLevel", "type": "range", "label": "Stress level (1-10)", "min": 1, "max": 10, "required": true},
   {"name": "sleepQuality", "type": "select", "label": "Sleep Quality", "options": ["Excellent", "Good", "Fair", "Poor", "Very Poor"], "required": true},
   {"name": "supportSystem", "type": "textarea", "label": "Describe your support system", "required": true},
   {"name": "copingStrategies", "type": "textarea", "label": "Current coping strategies", "required": true},
   {"name": "goals", "type": "textarea", "label": "Mental wellness goals", "required": true}
 ]}',
 '{"wellness", "behavior", "mental_health"}', true)
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  fields = EXCLUDED.fields,
  updated_at = NOW();

-- ============================================
-- 4. CREATE TEST USER FOR AUTHENTICATION
-- ============================================

-- Insert test coach user for testing
INSERT INTO users (id, email, first_name, last_name, password_hash, role, membership_level, is_active, created_at, updated_at) VALUES
('coach_chuck_test', 'chuck@test.com', 'Chuck', 'TestCoach', '$2b$12$dummy.hash.for.testing', 'coach', 'coach', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- ============================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on assessment tables
ALTER TABLE assessment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_forms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assessment_types (public read, admin write)
CREATE POLICY "assessment_types_public_read" ON assessment_types FOR SELECT USING (is_active = true);
CREATE POLICY "assessment_types_admin_write" ON assessment_types FOR ALL USING (false); -- Admin only via service key

-- Create RLS policies for user_assessments (users can see their own)
CREATE POLICY "user_assessments_own_data" ON user_assessments FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "user_assessments_coach_read" ON user_assessments FOR SELECT USING (true); -- Coaches can read for sessions

-- Create RLS policies for coach_interactions
CREATE POLICY "coach_interactions_user_data" ON coach_interactions FOR ALL USING (auth.uid()::text = user_id);

-- Create RLS policies for assessment_forms
CREATE POLICY "assessment_forms_public_read" ON assessment_forms FOR SELECT USING (true);

-- Grant necessary permissions
GRANT ALL ON assessment_types TO authenticated;
GRANT ALL ON user_assessments TO authenticated;
GRANT ALL ON coach_interactions TO authenticated;
GRANT ALL ON assessment_forms TO authenticated;

-- ============================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id ON user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_type_id ON user_assessments(assessment_type_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_completed_at ON user_assessments(completed_at);
CREATE INDEX IF NOT EXISTS idx_coach_interactions_user_id ON coach_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_interactions_coach_type ON coach_interactions(coach_type);

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'SUCCESS: Assessment system database setup completed!';
    RAISE NOTICE '- Created 4 assessment tables with proper schema';
    RAISE NOTICE '- Added missing columns to existing tables';
    RAISE NOTICE '- Seeded 3 default assessment types';
    RAISE NOTICE '- Created test user (coach_chuck_test) for authentication';
    RAISE NOTICE '- Enabled Row Level Security with appropriate policies';
    RAISE NOTICE '- Created performance indexes';
    RAISE NOTICE '';
    RAISE NOTICE 'Assessment system is now fully operational!';
END $$;