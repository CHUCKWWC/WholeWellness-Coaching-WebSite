-- Admin Authentication Schema for Supabase
-- Run this SQL in the Supabase SQL Editor

-- Update users table with admin fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user',
ADD COLUMN IF NOT EXISTS permissions JSONB;

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  session_token VARCHAR NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);

-- Admin activity log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  action VARCHAR NOT NULL,
  resource VARCHAR,
  resource_id VARCHAR,
  details JSONB,
  ip_address VARCHAR,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_user_id ON admin_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_timestamp ON admin_activity_log(timestamp);

-- Role permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role VARCHAR NOT NULL,
  permission VARCHAR NOT NULL,
  resource VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);

-- Insert default role permissions
INSERT INTO role_permissions (role, permission) VALUES
-- Moderator permissions
('moderator', 'view_users'),
('moderator', 'view_donations'),
('moderator', 'view_coaches'),
('moderator', 'view_bookings'),
('moderator', 'view_content'),

-- Coach permissions
('coach', 'view_users'),
('coach', 'view_bookings'),
('coach', 'view_content'),
('coach', 'edit_content'),

-- Admin permissions
('admin', 'view_users'),
('admin', 'edit_users'),
('admin', 'export_users'),
('admin', 'view_donations'),
('admin', 'process_donations'),
('admin', 'view_coaches'),
('admin', 'manage_coaches'),
('admin', 'view_bookings'),
('admin', 'assign_coaches'),
('admin', 'view_content'),
('admin', 'edit_content'),
('admin', 'publish_content'),
('admin', 'view_analytics'),
('admin', 'bulk_operations'),
('admin', 'view_logs'),

-- Super admin permissions
('super_admin', 'full_access'),
('super_admin', 'manage_admins'),
('super_admin', 'system_settings')
ON CONFLICT DO NOTHING;