import { db } from './server/db.ts';
import { knowledgeBase } from './shared/schema.ts';

async function testKnowledgeBase() {
  try {
    console.log('Testing knowledge base table...');
    
    // Test if knowledge_base table exists by trying to select from it
    const articles = await db.select().from(knowledgeBase).limit(1);
    console.log('✅ Knowledge base table exists!');
    console.log('Articles found:', articles.length);
    
    if (articles.length > 0) {
      console.log('Sample article:', articles[0]);
    }
    
  } catch (error) {
    console.error('❌ Error testing knowledge base:', error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('🔧 Knowledge base table does not exist yet');
      console.log('📋 Please run the following SQL in your Supabase dashboard:');
      console.log('   1. Open your Supabase project dashboard');
      console.log('   2. Go to SQL Editor');
      console.log('   3. Run the contents of supabase-knowledge-base-schema.sql');
    }
  }
}

testKnowledgeBase();