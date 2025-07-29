// Fix Database Schema - Add Missing Columns
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://aws-0-us-east-2.pooler.supabase.com',
  process.env.SUPABASE_KEY
);

async function fixDatabaseSchema() {
  console.log('🔧 Starting database schema fix...');
  
  try {
    // Check current table structure
    console.log('📊 Checking current users table structure...');
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'users');
    
    if (columnError) {
      console.error('❌ Error checking table structure:', columnError);
      return;
    }
    
    console.log('📋 Current columns:', columns?.map(c => c.column_name));
    
    // List of required columns
    const requiredColumns = [
      'donation_total',
      'reward_points', 
      'stripe_customer_id',
      'membership_level',
      'email_verified',
      'role',
      'permissions',
      'is_active',
      'join_date',
      'last_login',
      'profile_image_url'
    ];
    
    const existingColumns = columns?.map(c => c.column_name) || [];
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('✅ All required columns already exist!');
      return;
    }
    
    console.log('🔍 Missing columns:', missingColumns);
    
    // Add missing columns using SQL
    const alterStatements = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS donation_total DECIMAL DEFAULT 0;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 0;", 
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_level TEXT DEFAULT 'free';",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;"
    ];
    
    console.log('🔨 Adding missing columns...');
    
    for (const statement of alterStatements) {
      console.log(`Executing: ${statement}`);
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error) {
        console.error('❌ Error executing SQL:', error);
        // Try direct approach
        const { error: directError } = await supabase
          .from('users')
          .insert({})
          .select()
          .limit(0);
        console.log('Direct approach result:', directError);
      } else {
        console.log('✅ Column added successfully');
      }
    }
    
    // Update existing users with default values
    console.log('🔄 Updating existing users with default values...');
    const updateSQL = `
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
    `;
    
    const { error: updateError } = await supabase.rpc('exec_sql', { sql: updateSQL });
    if (updateError) {
      console.error('❌ Error updating existing users:', updateError);
    } else {
      console.log('✅ Existing users updated successfully');
    }
    
    // Verify the fix
    console.log('🔍 Verifying the fix...');
    const { data: newColumns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'users');
    
    if (verifyError) {
      console.error('❌ Error verifying fix:', verifyError);
    } else {
      console.log('✅ Updated table structure:');
      newColumns?.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
    }
    
    console.log('🎉 Database schema fix completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
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