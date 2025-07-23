-- Fix missing google_id column in users table
-- Run this SQL in your Supabase SQL editor

-- Check if google_id column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'google_id'
    ) THEN
        -- Add google_id column if it doesn't exist
        ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
        PRINT 'Added google_id column to users table';
    ELSE
        PRINT 'google_id column already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'google_id';