# CRITICAL: Google OAuth Database Schema Fix Required

## Issue Identified
The Google OAuth authentication is failing because the `google_id` and `provider` columns are missing from the actual database table, even though they exist in our code schema.

## Error Message
```
"Could not find the 'google_id' column of 'users' in the schema cache"
```

## Root Cause
**Schema Mismatch**: The code defines columns in `shared/schema.ts`:
- `googleId: varchar("google_id")` (line 35)
- `provider: varchar("provider").default("local")` (line 36)

But these columns don't exist in the actual database table.

## Solution: SQL Migration Required

### Step 1: Execute Database Migration
You need to run the SQL commands in `fix-google-id-column.sql` on your Supabase database:

```sql
-- Add missing columns for Google OAuth
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'email';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
```

### Step 2: How to Execute (Supabase)
1. Go to your Supabase dashboard
2. Navigate to "SQL Editor" 
3. Copy and paste the SQL from `fix-google-id-column.sql`
4. Click "Run" to execute the migration

### Step 3: Verify Fix
After running the SQL, the OAuth error should disappear and Google authentication will work correctly.

## Alternative: Database Push (If Connection Fixed)
If database connectivity is restored, you can also run:
```bash
npm run db:push
```

This will sync the Drizzle schema to the actual database.

## Expected Result
After fixing the database schema:
✅ Google OAuth will work seamlessly
✅ Users can sign in with "Continue with Google"
✅ Custom domain OAuth flow will be fully functional
✅ No more "google_id column" errors

## Files Created
- `fix-google-id-column.sql` - Ready-to-execute SQL migration
- `CRITICAL_DATABASE_FIX.md` - This documentation

## Priority: HIGH
This is the final step needed to make Google OAuth fully operational with your custom domain.