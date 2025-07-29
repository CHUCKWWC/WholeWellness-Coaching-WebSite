-- Fix for Google OAuth: Add missing google_id column to users table
-- This column is required for Google OAuth authentication to work properly

-- Add google_id column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Add provider column if it doesn't exist  
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'email';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('google_id', 'provider')
ORDER BY column_name;