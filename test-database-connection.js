import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwuwmnivvdvdxdewynbo.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Testing database connection...');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

if (!supabaseKey) {
  console.error('SUPABASE_KEY environment variable is not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Check if we can connect to the database
    const { data, error } = await supabase.from('users').select('count').limit(1);
    console.log('Database connection test:');
    console.log('Data:', data);
    console.log('Error:', error);

    // Test 2: Try to create mental wellness resources table
    const { data: createData, error: createError } = await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS mental_wellness_resources (
        id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR NOT NULL,
        resource_type VARCHAR NOT NULL,
        url TEXT,
        phone_number VARCHAR,
        is_emergency BOOLEAN DEFAULT FALSE,
        availability VARCHAR,
        languages JSONB DEFAULT '["English"]',
        cost_info VARCHAR,
        target_audience VARCHAR,
        rating DECIMAL(3,2),
        usage_count INTEGER DEFAULT 0,
        tags JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        verification_status VARCHAR DEFAULT 'verified',
        last_verified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`
    });
    console.log('Create table test:');
    console.log('Data:', createData);
    console.log('Error:', createError);

  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection();