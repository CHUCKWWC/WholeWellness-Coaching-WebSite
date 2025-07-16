import { supabase } from './server/supabase.js';

async function verifyDatabaseSetup() {
  console.log('🔍 Verifying database setup for knowledge base...\n');
  
  try {
    // Test basic connection
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (userError) {
      console.error('❌ Database connection failed:', userError.message);
      return;
    }
    
    console.log('✅ Database connection: OK');
    
    // Check if knowledge_base table exists
    const { data: kbData, error: kbError } = await supabase
      .from('knowledge_base')
      .select('id, title, category')
      .limit(5);
    
    if (kbError) {
      if (kbError.message.includes('does not exist')) {
        console.log('❌ Knowledge base tables: NOT FOUND');
        console.log('\n📋 MANUAL SETUP REQUIRED:');
        console.log('1. Open your Supabase dashboard');
        console.log('2. Go to SQL Editor');
        console.log('3. Copy and run the contents of: supabase-knowledge-base-schema.sql');
        console.log('4. This will create all tables and sample data');
        console.log('\n📄 The script includes:');
        console.log('   - 5 database tables for content management');
        console.log('   - 8 categories (FAQ, Getting Started, etc.)');
        console.log('   - 4 starter articles with full content');
        console.log('   - Analytics and feedback tracking');
        console.log('   - Full-text search capabilities');
        return false;
      } else {
        console.error('❌ Knowledge base error:', kbError.message);
        return false;
      }
    }
    
    console.log('✅ Knowledge base tables: OK');
    console.log(`📊 Articles found: ${kbData.length}`);
    
    if (kbData.length > 0) {
      console.log('\n📄 Sample articles:');
      kbData.forEach(article => {
        console.log(`   - ${article.title} (${article.category})`);
      });
    }
    
    // Check categories
    const { data: categories, error: catError } = await supabase
      .from('knowledge_base_categories')
      .select('name, slug')
      .order('sort_order');
    
    if (!catError && categories.length > 0) {
      console.log('\n📂 Categories available:');
      categories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.slug})`);
      });
    }
    
    console.log('\n✅ Knowledge base is ready for use!');
    console.log('🚀 You can now proceed with frontend implementation');
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Run verification
verifyDatabaseSetup()
  .then(success => {
    if (success) {
      console.log('\n🎉 Database setup verification completed successfully!');
    } else {
      console.log('\n⚠️  Database setup needs attention. Please follow the manual setup instructions.');
    }
  })
  .catch(error => {
    console.error('❌ Verification failed:', error.message);
  });