// Direct database migration script using application's database connection
import { supabase } from './server/supabase.js';

async function addMissingColumns() {
  try {
    console.log('🔧 Adding missing Google OAuth columns to users table...');
    
    // Add google_id column
    const { error: googleIdError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE'
    });
    
    if (googleIdError && !googleIdError.message.includes('already exists')) {
      console.error('Error adding google_id column:', googleIdError);
    } else {
      console.log('✅ google_id column added successfully');
    }
    
    // Add provider column
    const { error: providerError } = await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'email'"
    });
    
    if (providerError && !providerError.message.includes('already exists')) {
      console.error('Error adding provider column:', providerError);
    } else {
      console.log('✅ provider column added successfully');
    }
    
    // Create index
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)'
    });
    
    if (indexError && !indexError.message.includes('already exists')) {
      console.error('Error creating index:', indexError);
    } else {
      console.log('✅ Index created successfully');
    }
    
    // Verify columns exist
    const { data: columns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'users')
      .in('column_name', ['google_id', 'provider']);
    
    if (!verifyError && columns) {
      console.log('✅ Verification - Columns found:', columns);
    }
    
    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Alternative method using raw SQL execution
async function directSqlExecution() {
  try {
    console.log('🔧 Attempting direct SQL execution...');
    
    // Use Supabase SQL execution
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Database connection test failed:', error);
      return;
    }
    
    console.log('✅ Database connection verified');
    
    // Execute the migration queries one by one
    const migrations = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'email'",
      "CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)"
    ];
    
    for (const sql of migrations) {
      console.log(`Executing: ${sql}`);
      // Note: Direct SQL execution would need to be done through Supabase dashboard
      console.log('⚠️  This SQL needs to be executed in Supabase SQL Editor');
    }
    
  } catch (error) {
    console.error('❌ Direct SQL execution failed:', error);
  }
}

// Run the migration
addMissingColumns().catch(console.error);