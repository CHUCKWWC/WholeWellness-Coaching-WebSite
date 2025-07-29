import { supabase } from './server/supabase.js';

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection with users table (which we know exists)
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (userError) {
      console.error('Connection error:', userError.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    console.log('✅ Users table accessible');
    
    // Test if knowledge_base table exists
    const { data: kbData, error: kbError } = await supabase
      .from('knowledge_base')
      .select('*')
      .limit(1);
    
    if (kbError) {
      if (kbError.message.includes('does not exist')) {
        console.log('❌ Knowledge base table does not exist');
        console.log('📋 You need to create the knowledge base tables manually');
        console.log('📄 Run the SQL script: supabase-knowledge-base-schema.sql');
        console.log('📍 In your Supabase dashboard > SQL Editor');
        return false;
      } else {
        console.error('Knowledge base error:', kbError.message);
        return false;
      }
    } else {
      console.log('✅ Knowledge base table exists!');
      console.log('📊 Articles found:', kbData.length);
      return true;
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

testDatabaseConnection();