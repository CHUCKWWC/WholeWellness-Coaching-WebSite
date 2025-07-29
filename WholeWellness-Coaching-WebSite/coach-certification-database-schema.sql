-- ===========================================
-- COACH CERTIFICATION COURSE SYSTEM SCHEMA
-- ===========================================
-- This file creates the complete database schema for the coach certification course system
-- Run these commands in your Supabase SQL editor to set up the certification system

-- ===========================================
-- 1. CERTIFICATION COURSES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS certification_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR NOT NULL, -- wellness, nutrition, relationship, behavior, etc.
  level VARCHAR NOT NULL, -- beginner, intermediate, advanced, master
  duration INTEGER NOT NULL, -- in hours
  credit_hours DECIMAL NOT NULL, -- CE credit hours
  price DECIMAL NOT NULL,
  instructor_name VARCHAR NOT NULL,
  instructor_bio TEXT,
  course_image_url VARCHAR,
  preview_video_url VARCHAR,
  syllabus JSONB, -- Course modules and lessons
  requirements TEXT[], -- Prerequisites
  learning_objectives TEXT[],
  accreditation VARCHAR, -- Accrediting body
  tags TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  enrollment_limit INTEGER, -- null = unlimited
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 2. COACH ENROLLMENTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS coach_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id VARCHAR NOT NULL, -- References users.id where role = 'coach'
  course_id UUID NOT NULL REFERENCES certification_courses(id),
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR DEFAULT 'enrolled', -- enrolled, in_progress, completed, withdrawn, failed
  progress DECIMAL DEFAULT 0, -- 0-100
  current_module INTEGER DEFAULT 1,
  completed_modules INTEGER[] DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  certificate_issued BOOLEAN DEFAULT FALSE,
  certificate_number VARCHAR,
  final_grade DECIMAL, -- 0-100
  total_time_spent INTEGER DEFAULT 0, -- in minutes
  payment_status VARCHAR DEFAULT 'pending', -- pending, paid, refunded
  stripe_payment_intent_id VARCHAR,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 3. COURSE MODULES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES certification_courses(id),
  module_number INTEGER NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  content_type VARCHAR NOT NULL, -- video, text, interactive, quiz, assignment
  content_url VARCHAR, -- video URL, document URL, etc.
  content TEXT, -- text content or HTML
  quiz JSONB, -- Quiz questions and answers
  assignment JSONB, -- Assignment details
  resources JSONB, -- Additional learning resources
  is_required BOOLEAN DEFAULT TRUE,
  passing_score DECIMAL DEFAULT 70, -- For quizzes/assignments
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 4. MODULE PROGRESS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES coach_enrollments(id),
  module_id UUID NOT NULL REFERENCES course_modules(id),
  status VARCHAR DEFAULT 'not_started', -- not_started, in_progress, completed, passed, failed
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER DEFAULT 0, -- in minutes
  attempts INTEGER DEFAULT 0,
  score DECIMAL, -- For quizzes/assignments
  submission_data JSONB, -- Quiz answers, assignment submissions
  feedback TEXT, -- Instructor feedback
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 5. COACH CERTIFICATES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS coach_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id VARCHAR NOT NULL, -- References users.id where role = 'coach'
  course_id UUID NOT NULL REFERENCES certification_courses(id),
  enrollment_id UUID NOT NULL REFERENCES coach_enrollments(id),
  certificate_number VARCHAR NOT NULL UNIQUE,
  issued_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiration_date TIMESTAMP WITH TIME ZONE, -- Some certifications expire
  credential_url VARCHAR, -- Link to verify certificate
  certificate_pdf_url VARCHAR, -- PDF download
  digital_badge_url VARCHAR, -- LinkedIn badge, etc.
  status VARCHAR DEFAULT 'active', -- active, expired, revoked
  revoked_reason TEXT,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 6. CONTINUING EDUCATION CREDITS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS ce_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id VARCHAR NOT NULL, -- References users.id where role = 'coach'
  course_id UUID REFERENCES certification_courses(id),
  certificate_id UUID REFERENCES coach_certificates(id),
  credit_hours DECIMAL NOT NULL,
  credit_type VARCHAR NOT NULL, -- course, workshop, conference, self_study
  provider VARCHAR NOT NULL,
  completion_date TIMESTAMP WITH TIME ZONE NOT NULL,
  verification_status VARCHAR DEFAULT 'pending', -- pending, verified, rejected
  document_url VARCHAR, -- Supporting documentation
  description TEXT,
  category VARCHAR, -- wellness, ethics, clinical, etc.
  accreditation_body VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 7. INDEXES FOR PERFORMANCE
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_coach_enrollments_coach_id ON coach_enrollments(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_enrollments_course_id ON coach_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_enrollment_id ON module_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_coach_certificates_coach_id ON coach_certificates(coach_id);
CREATE INDEX IF NOT EXISTS idx_ce_credits_coach_id ON ce_credits(coach_id);

-- ===========================================
-- 8. ROW LEVEL SECURITY POLICIES
-- ===========================================
-- Enable RLS on all tables
ALTER TABLE certification_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ce_credits ENABLE ROW LEVEL SECURITY;

-- Certification courses are publicly readable
CREATE POLICY "Certification courses are publicly readable" ON certification_courses
  FOR SELECT USING (is_active = TRUE);

-- Coaches can view their own enrollments
CREATE POLICY "Coaches can view their own enrollments" ON coach_enrollments
  FOR SELECT USING (coach_id = auth.uid());

-- Coaches can create their own enrollments
CREATE POLICY "Coaches can create their own enrollments" ON coach_enrollments
  FOR INSERT WITH CHECK (coach_id = auth.uid());

-- Course modules are readable by enrolled coaches
CREATE POLICY "Course modules are readable by enrolled coaches" ON course_modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM coach_enrollments 
      WHERE course_id = course_modules.course_id 
      AND coach_id = auth.uid()
    )
  );

-- Module progress is managed by the enrolled coach
CREATE POLICY "Module progress is managed by enrolled coach" ON module_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM coach_enrollments 
      WHERE id = module_progress.enrollment_id 
      AND coach_id = auth.uid()
    )
  );

-- Coaches can view their own certificates
CREATE POLICY "Coaches can view their own certificates" ON coach_certificates
  FOR SELECT USING (coach_id = auth.uid());

-- Coaches can view their own CE credits
CREATE POLICY "Coaches can view their own CE credits" ON ce_credits
  FOR SELECT USING (coach_id = auth.uid());

-- ===========================================
-- 9. SAMPLE DATA INSERTION
-- ===========================================
-- Insert sample certification courses
INSERT INTO certification_courses (
  id, title, description, category, level, duration, credit_hours, price, 
  instructor_name, instructor_bio, course_image_url, requirements, 
  learning_objectives, accreditation, tags, enrollment_limit, 
  start_date, end_date
) VALUES 
(
  'course-1',
  'Advanced Wellness Coaching Certification',
  'Comprehensive training in holistic wellness coaching techniques, covering nutrition, fitness, mental health, and lifestyle optimization strategies.',
  'wellness',
  'intermediate',
  40,
  35.0,
  799.00,
  'Dr. Sarah Mitchell',
  'Licensed therapist with 15+ years in wellness coaching',
  'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400',
  ARRAY['Basic coaching certification', '1+ year experience'],
  ARRAY['Master advanced coaching techniques', 'Understand wellness psychology', 'Develop personalized wellness plans'],
  'International Coach Federation (ICF)',
  ARRAY['wellness', 'holistic', 'lifestyle'],
  50,
  '2025-08-01T00:00:00Z',
  '2025-12-15T00:00:00Z'
),
(
  'course-2',
  'Nutrition Coaching Fundamentals',
  'Evidence-based nutrition coaching principles, meal planning strategies, and behavior change techniques for sustainable dietary improvements.',
  'nutrition',
  'beginner',
  25,
  20.0,
  599.00,
  'Rachel Davis, RD',
  'Registered Dietitian and certified nutrition coach',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
  ARRAY[]::TEXT[],
  ARRAY['Understand nutritional science basics', 'Learn meal planning techniques', 'Master behavior change strategies'],
  'Academy of Nutrition and Dietetics',
  ARRAY['nutrition', 'meal-planning', 'behavior-change'],
  NULL,
  '2025-07-15T00:00:00Z',
  '2025-11-30T00:00:00Z'
),
(
  'course-3',
  'Relationship Counseling Techniques',
  'Professional training in couples counseling, communication strategies, conflict resolution, and building healthy relationship dynamics.',
  'relationship',
  'advanced',
  60,
  45.0,
  1299.00,
  'Dr. Michael Thompson',
  'Licensed Marriage and Family Therapist with 20+ years experience',
  'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400',
  ARRAY['Master''s degree in counseling', 'Licensed therapist'],
  ARRAY['Advanced couples therapy techniques', 'Conflict resolution strategies', 'Family systems theory application'],
  'American Association for Marriage and Family Therapy',
  ARRAY['relationship', 'counseling', 'therapy'],
  25,
  '2025-09-01T00:00:00Z',
  '2026-02-28T00:00:00Z'
),
(
  'course-4',
  'Behavior Modification Strategies',
  'Scientific approaches to behavior change, habit formation, goal setting, and overcoming psychological barriers to personal development.',
  'behavior',
  'intermediate',
  30,
  25.0,
  699.00,
  'Dr. Lisa Chen',
  'Behavioral psychologist specializing in habit formation',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
  ARRAY['Basic psychology knowledge'],
  ARRAY['Understanding behavior change science', 'Habit formation techniques', 'Goal setting and achievement strategies'],
  'Association for Applied and Therapeutic Humor',
  ARRAY['behavior', 'habits', 'psychology'],
  40,
  '2025-08-15T00:00:00Z',
  '2025-12-01T00:00:00Z'
)
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
DO $$
BEGIN
  RAISE NOTICE 'Coach Certification Course System database schema created successfully!';
  RAISE NOTICE 'Tables created: certification_courses, coach_enrollments, course_modules, module_progress, coach_certificates, ce_credits';
  RAISE NOTICE 'Sample certification courses inserted';
  RAISE NOTICE 'RLS policies enabled for data security';
  RAISE NOTICE 'System ready for coach certification course management';
END $$;