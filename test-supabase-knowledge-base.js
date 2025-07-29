import { supabase } from './server/supabase.js';

async function testAndCreateKnowledgeBase() {
  try {
    console.log('🔍 Testing knowledge base table connection...');
    
    // Test if knowledge_base table exists
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('❌ Knowledge base table does not exist');
        console.log('📋 Creating knowledge base tables...');
        
        // We'll run the SQL directly via RPC if possible
        await createKnowledgeBaseTables();
        
      } else {
        console.error('❌ Database error:', error.message);
      }
    } else {
      console.log('✅ Knowledge base table exists!');
      console.log('📊 Found', data.length, 'articles');
      
      if (data.length > 0) {
        console.log('📄 Sample article:', data[0].title);
      }
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

async function createKnowledgeBaseTables() {
  try {
    console.log('🏗️  Creating knowledge base tables...');
    
    // Create main knowledge_base table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS knowledge_base (
        id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        slug VARCHAR UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        category VARCHAR NOT NULL,
        subcategory VARCHAR,
        tags JSONB DEFAULT '[]'::jsonb,
        status VARCHAR DEFAULT 'published',
        priority INTEGER DEFAULT 0,
        difficulty VARCHAR,
        estimated_read_time INTEGER,
        view_count INTEGER DEFAULT 0,
        helpful_count INTEGER DEFAULT 0,
        not_helpful_count INTEGER DEFAULT 0,
        search_keywords TEXT,
        related_articles JSONB DEFAULT '[]'::jsonb,
        featured_image TEXT,
        meta_description TEXT,
        meta_keywords TEXT,
        author_id VARCHAR REFERENCES users(id),
        author_name VARCHAR DEFAULT 'Admin',
        last_reviewed_by VARCHAR REFERENCES users(id),
        last_reviewed_at TIMESTAMP WITH TIME ZONE,
        is_public BOOLEAN DEFAULT TRUE,
        requires_auth BOOLEAN DEFAULT FALSE,
        target_audience VARCHAR DEFAULT 'general',
        language VARCHAR DEFAULT 'en',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // Try to execute via RPC or direct SQL
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      console.error('❌ Error creating table:', error.message);
      console.log('📋 Please manually run the SQL script in your Supabase dashboard:');
      console.log('   File: supabase-knowledge-base-schema.sql');
    } else {
      console.log('✅ Knowledge base table created successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  }
}

testAndCreateKnowledgeBase();