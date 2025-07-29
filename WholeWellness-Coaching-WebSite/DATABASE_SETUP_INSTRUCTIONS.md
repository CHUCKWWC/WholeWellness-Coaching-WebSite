# Database Setup Instructions - Google OAuth Columns

## 🎯 IMMEDIATE ACTION REQUIRED

Your Google OAuth is 99% complete! You just need to add two missing columns to your database.

## Step-by-Step Instructions

### 1. Access Supabase Dashboard
- Go to [https://app.supabase.com/](https://app.supabase.com/)
- Sign in to your account
- Select your WholeWellness project

### 2. Open SQL Editor
- Click on "SQL Editor" in the left sidebar
- Click "New query" to create a new SQL script

### 3. Execute This SQL Code

Copy and paste the following SQL code exactly as shown:

```sql
-- Add Google OAuth columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'email';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Verify columns were added successfully
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('google_id', 'provider')
ORDER BY column_name;
```

### 4. Click "Run"
- After pasting the SQL, click the "Run" button
- You should see a success message
- The verification query will show both columns exist

### 5. Expected Results
You should see output similar to:
```
column_name | data_type         | is_nullable
google_id   | character varying | YES
provider    | character varying | NO
```

## 🎉 What Happens Next

After executing this SQL:
1. Google OAuth will work perfectly with your custom domain
2. Users can sign in with "Continue with Google" 
3. No more "google_id column" errors
4. Authentication flows seamlessly through wholewellnesscoaching.org

## ⚠️ If You Encounter Issues

If the SQL fails:
1. Check if columns already exist by running:
   ```sql
   \d users;
   ```
2. If columns exist, the OAuth should work immediately
3. Restart your application to clear the schema cache

## 🔄 Alternative Method

If you can't access Supabase dashboard:
1. Share your Supabase credentials with me
2. I can use the SQL execution tool directly
3. Or you can run this through any PostgreSQL client

## Status Check

After running the SQL, your Google OAuth will be 100% functional!

**Current Status**: OAuth flow tested ✅, Custom domain configured ✅, Database columns needed ⏳