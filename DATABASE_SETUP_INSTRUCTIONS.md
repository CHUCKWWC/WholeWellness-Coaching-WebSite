# Database Setup Instructions - Knowledge Base Tables

## Current Status
✅ Database connection is working  
✅ User authentication is functional  
❌ Knowledge base tables need to be created  

## Required Action
You need to manually create the knowledge base tables in your Supabase dashboard. The automated deployment scripts are encountering SASL authentication issues due to connection pooling limitations.

## Step-by-Step Instructions

### 1. Access Your Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Navigate to your project dashboard

### 2. Open SQL Editor
1. In the left sidebar, click on **SQL Editor**
2. Click **New query** to create a new SQL script

### 3. Run the Knowledge Base Schema
1. Copy the entire contents of `supabase-knowledge-base-schema.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the script

### 4. Verify Table Creation
After running the script, you should see:
- ✅ `knowledge_base` table created
- ✅ `knowledge_base_categories` table created  
- ✅ `knowledge_base_feedback` table created
- ✅ `knowledge_base_views` table created
- ✅ `knowledge_base_search` table created
- ✅ Sample categories and articles inserted

### 5. Test the Setup
Run the test script to verify everything is working:
```bash
npx tsx test-database-connection.js
```

Expected output:
```
✅ Database connection successful
✅ Users table accessible
✅ Knowledge base table exists!
📊 Articles found: 4
```

## What the Schema Includes

### Tables Created:
- **knowledge_base**: Main articles and documentation
- **knowledge_base_categories**: Content organization
- **knowledge_base_feedback**: User ratings and feedback
- **knowledge_base_views**: Analytics and usage tracking
- **knowledge_base_search**: Search query analytics

### Sample Data:
- 8 categories (FAQ, Getting Started, Coaching, etc.)
- 4 starter articles with comprehensive content
- Proper indexing for performance
- Full-text search capabilities

### Security Features:
- Row Level Security (RLS) enabled
- Public articles viewable by everyone
- Admin-only management capabilities
- User feedback tracking

## Troubleshooting

### If SQL Script Fails:
1. Check that your database user has sufficient permissions
2. Verify the `users` table exists (required for foreign keys)
3. Run sections of the script individually if needed

### If Tables Are Missing:
1. Check the **Table Editor** in Supabase dashboard
2. Look for any error messages in the SQL Editor
3. Verify all foreign key relationships are satisfied

### Connection Issues:
The current SASL_SIGNATURE_MISMATCH errors are related to connection pooling and authentication. The manual approach via Supabase dashboard avoids these issues entirely.

## Next Steps
Once the tables are created successfully, we can:
1. ✅ Verify the database schema is working
2. ✅ Create the frontend knowledge base interface
3. ✅ Add API endpoints for content management
4. ✅ Implement search functionality
5. ✅ Add user feedback features

## Files Ready for Deployment:
- `supabase-knowledge-base-schema.sql` - Complete database schema
- `shared/schema.ts` - Updated with knowledge base types
- `test-database-connection.js` - Connection verification script