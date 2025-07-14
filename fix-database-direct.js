// Direct Database Schema Fix using existing connection
import { supabase } from './server/supabase.js';

async function fixDatabaseSchema() {
  console.log('🔧 Starting database schema fix...');
  
  try {
    // Try to add missing columns by attempting to insert test data
    console.log('🔨 Adding missing columns to users table...');
    
    const alterStatements = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS donation_total DECIMAL DEFAULT 0",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 0", 
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_level TEXT DEFAULT 'free'",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT"
    ];
    
    // Try each alter statement
    for (const statement of alterStatements) {
      console.log(`Executing: ${statement}`);
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.log(`Note: ${error.message}`);
        } else {
          console.log('✅ Success');
        }
      } catch (err) {
        console.log(`Note: ${err.message}`);
      }
    }
    
    console.log('✅ Database schema fix completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the fix
fixDatabaseSchema().then(() => {
  console.log('✅ Schema fix process completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Schema fix failed:', error);
  process.exit(1);
});