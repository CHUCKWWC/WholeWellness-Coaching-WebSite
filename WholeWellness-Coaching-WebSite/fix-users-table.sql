-- Fix Users Table - Add Missing Columns
-- Run this in your Supabase SQL Editor to fix registration issues

-- Add missing donation_total column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS donation_total DECIMAL DEFAULT 0;

-- Add missing reward_points column to users table  
ALTER TABLE users ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 0;

-- Add missing stripe_customer_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add missing membership_level column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_level TEXT DEFAULT 'free';

-- Add missing email_verified column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Add missing role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Add missing permissions column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB;

-- Add missing is_active column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add missing join_date column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing last_login column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Add missing profile_image_url column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Update existing users to have default values if they don't have them
UPDATE users 
SET 
  donation_total = COALESCE(donation_total, 0),
  reward_points = COALESCE(reward_points, 0),
  membership_level = COALESCE(membership_level, 'free'),
  email_verified = COALESCE(email_verified, FALSE),
  role = COALESCE(role, 'user'),
  is_active = COALESCE(is_active, TRUE),
  join_date = COALESCE(join_date, NOW())
WHERE 
  donation_total IS NULL 
  OR reward_points IS NULL 
  OR membership_level IS NULL 
  OR email_verified IS NULL 
  OR role IS NULL 
  OR is_active IS NULL 
  OR join_date IS NULL;

-- Verify the changes worked
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;