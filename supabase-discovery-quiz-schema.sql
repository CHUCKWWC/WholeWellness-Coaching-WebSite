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

-- Index for better query performance
CREATE INDEX IF NOT EXISTS idx_discovery_quiz_user_id ON discovery_quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_discovery_quiz_session_id ON discovery_quiz_results(session_id);
CREATE INDEX IF NOT EXISTS idx_coach_match_tags_combination ON coach_match_tags(tag_combination);

-- Insert sample coach matching data
INSERT INTO coach_match_tags (tag_combination, primary_coach, supporting_coaches, ai_tools, group_support) VALUES
('relationships', 'Relationship Coach', '{"Mindset Coach"}', '{"Daily AI Reflection Journals","Goal Mapping Tools"}', false),
('career', 'Career Coach', '{"Mindset Coach"}', '{"Goal Mapping Tools","Progress Tracking Dashboard"}', false),
('trauma', 'Trauma-Informed Coach', '{"Mindset Coach"}', '{"Gentle Check-in Assistant","Daily AI Reflection Journals"}', true),
('confidence', 'Mindset Coach', '{"Relationship Coach"}', '{"Daily AI Reflection Journals","Goal Mapping Tools"}', false),
('financial', 'Financial Coach', '{"Career Coach"}', '{"Goal Mapping Tools","Progress Tracking Dashboard"}', false),
('purpose', 'Life Purpose Coach', '{"Mindset Coach"}', '{"Goal Mapping Tools","Progress Tracking Dashboard"}', false),
('relationships+confidence', 'Relationship Coach', '{"Mindset Coach","Life Purpose Coach"}', '{"Daily AI Reflection Journals","Goal Mapping Tools","Progress Tracking Dashboard"}', false),
('trauma+confidence', 'Trauma-Informed Coach', '{"Mindset Coach"}', '{"Gentle Check-in Assistant","Daily AI Reflection Journals","Goal Mapping Tools"}', true)
ON CONFLICT DO NOTHING;