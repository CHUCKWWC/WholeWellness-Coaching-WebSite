-- Multi-Assessment System Database Schema for WholeWellness Platform
-- Execute this SQL in your Supabase SQL Editor to enable the assessment system

-- ============================================
-- ASSESSMENT TYPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assessment_types (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL, -- "weight_loss_intake", "attachment_style", etc.
  display_name VARCHAR NOT NULL, -- "Weight Loss Intake", "Attachment Style Assessment"
  category VARCHAR NOT NULL, -- "health", "relationships", "career", etc.
  description TEXT,
  version INTEGER DEFAULT 1,
  fields JSONB NOT NULL, -- Field definitions for the form
  coach_types TEXT[], -- Which AI coaches can access this data
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- USER ASSESSMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_assessments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  assessment_type_id TEXT NOT NULL REFERENCES assessment_types(id),
  responses JSONB NOT NULL, -- All form responses
  summary TEXT, -- AI-generated summary of responses
  tags TEXT[], -- Extracted tags for search/matching
  completed_at TIMESTAMP DEFAULT NOW(),
  last_accessed_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- COACH INTERACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS coach_interactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  coach_type VARCHAR NOT NULL, -- "weight_loss", "relationship", etc.
  accessed_assessments TEXT[], -- Array of assessment IDs used
  interaction_summary TEXT,
  session_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ASSESSMENT FORMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assessment_forms (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_type_id TEXT NOT NULL REFERENCES assessment_types(id),
  form_data JSONB NOT NULL, -- Complete form structure
  validation_rules JSONB, -- Field validation rules
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id ON user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_type ON user_assessments(assessment_type_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_active ON user_assessments(is_active);
CREATE INDEX IF NOT EXISTS idx_coach_interactions_user ON coach_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_interactions_type ON coach_interactions(coach_type);
CREATE INDEX IF NOT EXISTS idx_assessment_types_active ON assessment_types(is_active);
CREATE INDEX IF NOT EXISTS idx_assessment_types_category ON assessment_types(category);

-- ============================================
-- SEED DATA - ASSESSMENT TYPES
-- ============================================

-- Weight Loss Intake Assessment
INSERT INTO assessment_types (id, name, display_name, category, description, fields, coach_types) VALUES (
  'weight-loss-intake',
  'weight_loss_intake',
  'Weight Loss Intake',
  'health',
  'Comprehensive intake form for weight loss coaching',
  '{
    "fields": [
      {"name": "currentWeight", "type": "number", "label": "Current Weight (lbs)", "required": true},
      {"name": "goalWeight", "type": "number", "label": "Goal Weight (lbs)", "required": true},
      {"name": "height", "type": "text", "label": "Height", "required": true},
      {"name": "age", "type": "number", "label": "Age", "required": true},
      {"name": "activityLevel", "type": "select", "label": "Activity Level", "options": ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"], "required": true},
      {"name": "dietaryRestrictions", "type": "textarea", "label": "Dietary Restrictions/Preferences"},
      {"name": "medicalConditions", "type": "textarea", "label": "Medical Conditions"},
      {"name": "previousAttempts", "type": "textarea", "label": "Previous Weight Loss Attempts"},
      {"name": "motivation", "type": "textarea", "label": "What motivates you?"},
      {"name": "challenges", "type": "textarea", "label": "Biggest challenges with weight loss"}
    ]
  }',
  ARRAY['weight_loss', 'nutritionist', 'fitness_trainer', 'meal_prep_assistant']
) ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  fields = EXCLUDED.fields,
  coach_types = EXCLUDED.coach_types,
  updated_at = NOW();

-- Attachment Style Assessment
INSERT INTO assessment_types (id, name, display_name, category, description, fields, coach_types) VALUES (
  'attachment-style',
  'attachment_style',
  'Attachment Style Assessment',
  'relationships',
  'Assessment to determine attachment patterns in relationships',
  '{
    "fields": [
      {"name": "relationshipStatus", "type": "select", "label": "Current Relationship Status", "options": ["Single", "Dating", "In a Relationship", "Married", "Divorced", "Widowed"], "required": true},
      {"name": "relationshipHistory", "type": "textarea", "label": "Describe your relationship history"},
      {"name": "communicationStyle", "type": "select", "label": "How do you typically communicate in relationships?", "options": ["Direct and open", "Indirect/hints", "Avoid difficult topics", "Explosive/emotional"], "required": true},
      {"name": "conflictResolution", "type": "textarea", "label": "How do you handle conflicts?"},
      {"name": "trustIssues", "type": "select", "label": "Do you struggle with trust?", "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "required": true},
      {"name": "intimacyComfort", "type": "select", "label": "How comfortable are you with emotional intimacy?", "options": ["Very comfortable", "Somewhat comfortable", "Neutral", "Somewhat uncomfortable", "Very uncomfortable"], "required": true},
      {"name": "abandonmentFears", "type": "select", "label": "Do you fear being abandoned?", "options": ["Never", "Rarely", "Sometimes", "Often", "Always"], "required": true},
      {"name": "independenceNeed", "type": "select", "label": "How important is independence to you?", "options": ["Not important", "Slightly important", "Moderately important", "Very important", "Extremely important"], "required": true},
      {"name": "parentalRelationship", "type": "textarea", "label": "Describe your relationship with your parents/caregivers growing up"},
      {"name": "relationshipGoals", "type": "textarea", "label": "What are your relationship goals?"}
    ]
  }',
  ARRAY['relationship', 'behavior_coach', 'wellness_coordinator']
) ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  fields = EXCLUDED.fields,
  coach_types = EXCLUDED.coach_types,
  updated_at = NOW();

-- Mental Health Screening
INSERT INTO assessment_types (id, name, display_name, category, description, fields, coach_types) VALUES (
  'mental-health-screening',
  'mental_health_screening',
  'Mental Health Screening',
  'mental_health',
  'Basic mental health and wellness screening',
  '{
    "fields": [
      {"name": "moodRating", "type": "range", "label": "Rate your overall mood (1-10)", "min": 1, "max": 10, "required": true},
      {"name": "stressLevel", "type": "range", "label": "Rate your stress level (1-10)", "min": 1, "max": 10, "required": true},
      {"name": "sleepQuality", "type": "select", "label": "How is your sleep quality?", "options": ["Excellent", "Good", "Fair", "Poor", "Very Poor"], "required": true},
      {"name": "anxietySymptoms", "type": "checkbox", "label": "Anxiety symptoms (check all that apply)", "options": ["Racing thoughts", "Physical tension", "Panic attacks", "Avoidance", "Sleep issues", "None"], "required": false},
      {"name": "depressionSymptoms", "type": "checkbox", "label": "Depression symptoms (check all that apply)", "options": ["Low mood", "Loss of interest", "Fatigue", "Sleep changes", "Appetite changes", "Concentration issues", "None"], "required": false},
      {"name": "copingStrategies", "type": "textarea", "label": "What helps you cope with stress?"},
      {"name": "supportSystem", "type": "textarea", "label": "Describe your support system"},
      {"name": "previousTherapy", "type": "select", "label": "Have you had therapy before?", "options": ["Never", "In the past", "Currently", "Considering it"], "required": true},
      {"name": "traumaHistory", "type": "select", "label": "Any significant trauma history?", "options": ["No", "Yes - prefer not to discuss", "Yes - willing to discuss"], "required": true},
      {"name": "wellnessGoals", "type": "textarea", "label": "What are your wellness goals?"}
    ]
  }',
  ARRAY['wellness_coordinator', 'behavior_coach', 'relationship']
) ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  fields = EXCLUDED.fields,
  coach_types = EXCLUDED.coach_types,
  updated_at = NOW();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE assessment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_forms ENABLE ROW LEVEL SECURITY;

-- Assessment Types: Public read access
CREATE POLICY "assessment_types_read_policy" ON assessment_types
  FOR SELECT USING (is_active = true);

-- Assessment Types: Admin write access
CREATE POLICY "assessment_types_write_policy" ON assessment_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- User Assessments: Users can only access their own assessments
CREATE POLICY "user_assessments_read_policy" ON user_assessments
  FOR SELECT USING (
    user_id = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role IN ('admin', 'coach')
    )
  );

CREATE POLICY "user_assessments_write_policy" ON user_assessments
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Coach Interactions: Coaches and admins can access
CREATE POLICY "coach_interactions_policy" ON coach_interactions
  FOR ALL USING (
    user_id = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role IN ('admin', 'coach')
    )
  );

-- Assessment Forms: Public read for active forms
CREATE POLICY "assessment_forms_read_policy" ON assessment_forms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessment_types 
      WHERE assessment_types.id = assessment_forms.assessment_type_id 
      AND assessment_types.is_active = true
    )
  );

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'Multi-Assessment System tables created successfully!' as status;