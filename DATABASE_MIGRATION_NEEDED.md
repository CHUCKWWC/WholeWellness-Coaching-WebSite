# Manual Database Migration Required

## Problem
The direct PostgreSQL connection to Supabase is failing with a SASL authentication error, preventing automated schema migrations via `npm run db:push`.

## Root Cause
- Drizzle Kit cannot connect directly to Supabase's PostgreSQL pooler
- SASL error: `SCRAM-SERVER-FINAL-MESSAGE: server signature is missing`
- This is a known issue with certain Supabase connection configurations
- The Supabase JavaScript client (REST API) works fine for the application, but doesn't support raw SQL execution for security reasons

## Solution: Manual Table Creation

You need to create the `programs` table manually using the Supabase Dashboard.

### Steps:

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select your project: `wholewellness`

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Paste and Run This SQL:**

```sql
-- Create programs table for assessment system
CREATE TABLE IF NOT EXISTS "programs" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" varchar NOT NULL,
  "assessment_type" varchar(50) NOT NULL,
  "status" varchar(20) DEFAULT 'in_progress',
  "completion_percentage" integer DEFAULT 0,
  "paid" boolean DEFAULT false,
  "payment_intent_id" varchar,
  "responses" jsonb,
  "result" jsonb,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "programs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS "programs_user_id_idx" ON "programs" ("user_id");

-- Verify table was created
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'programs' 
ORDER BY ordinal_position;
```

4. **Click "Run" or press `Ctrl+Enter`**

5. **Verify Success**
   - You should see a success message
   - The verification query at the end will show all columns if the table was created successfully

### After Creating the Table

Once you've created the table, run the test script to verify everything works:

```bash
node test-assessment-flow.js
```

This should complete successfully without errors.

## What This Table Does

The `programs` table stores user assessment data:
- **user_id**: Links to the user taking the assessment
- **assessment_type**: Type of assessment (wellness_personality, mental_health, stress, etc.)
- **status**: Current status (in_progress, completed, abandoned)
- **completion_percentage**: How much of the assessment is done (0-100)
- **paid**: Whether this assessment was paid for
- **payment_intent_id**: Stripe payment ID if paid
- **responses**: User's answers (stored as JSON)
- **result**: Assessment results/scores (stored as JSON)

## Pricing Logic
- First 3 assessments: FREE (paid = false)
- Subsequent assessments: $9.99 each (paid = true)

## Why Manual Migration Is Needed

The automated migration tools (Drizzle Kit) require a direct PostgreSQL connection, which is currently blocked by authentication issues. While this could potentially be fixed by:
- Resetting the database password
- Using a different connection string format
- Configuring SSL certificates

...the manual approach is faster and more reliable for getting you unblocked immediately.

## Future Migrations

For future schema changes, you may need to continue using the SQL Editor manually, or we can investigate fixing the direct PostgreSQL connection issue when there's more time.

---

**Status**: ⏳ Waiting for manual table creation  
**Next Step**: Create table in Supabase Dashboard, then run `node test-assessment-flow.js`
