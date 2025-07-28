// Migration script to add missing OAuth columns
import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase connection
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://aws-0-us-east-2.pooler.supabase.com';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ Supabase key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addOAuthColumns() {
  try {
    console.log('🔧 Adding missing Google OAuth columns to users table...');
    
    // Test database connection first
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      console.log('📋 Manual SQL required. Execute this in Supabase SQL Editor:');
      console.log('---');
      console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;');
      console.log("ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'email';");
      console.log('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);');
      console.log('---');
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Check if columns already exist
    const { data: columns, error: columnsError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'users' 
          AND column_name IN ('google_id', 'provider')
        `
      });
    
    if (columnsError) {
      console.log('⚠️ Could not check existing columns. Proceeding with manual SQL...');
      printManualSQL();
      return;
    }
    
    console.log('📋 Current columns check completed');
    console.log('🔄 Executing manual SQL migration required...');
    printManualSQL();
    
  } catch (error) {
    console.error('❌ Migration script failed:', error);
    printManualSQL();
  }
}

function printManualSQL() {
  console.log('\n🎯 EXECUTE THIS SQL IN SUPABASE SQL EDITOR:');
  console.log('=' .repeat(50));
  console.log('-- Add Google OAuth columns to users table');
  console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;');
  console.log("ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'email';");
  console.log('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);');
  console.log('');
  console.log('-- Verify columns were added');
  console.log(`SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('google_id', 'provider')
ORDER BY column_name;`);
  console.log('=' .repeat(50));
  console.log('');
  console.log('📍 Steps:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste the SQL above');
  console.log('4. Click "Run" to execute');
  console.log('5. Restart the application to clear schema cache');
}

// Run the migration
addOAuthColumns();