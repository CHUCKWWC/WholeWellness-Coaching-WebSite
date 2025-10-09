// Quick test to verify tables exist by counting rows
import express from 'express';
import { registerRoutes } from '../server/routes';

const app = express();

async function testTablesViaAPI() {
  try {
    console.log('Testing conversation intelligence table access...\n');
    
    // Register routes to access the database
    await registerRoutes(app);
    
    // Import db directly
    const { db } = await import('../server/db.js');
    const { sql } = await import('drizzle-orm');
    
    // Test each table
    const tables = ['chat_summaries', 'digest_preferences', 'sent_digests', 'crisis_alerts'];
    
    for (const table of tables) {
      try {
        const result = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${table}`));
        console.log(`✅ ${table}: ${result[0]?.count || 0} rows`);
      } catch (error: any) {
        console.log(`❌ ${table}: ${error.message}`);
      }
    }
    
    console.log('\n✅ Table validation complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testTablesViaAPI();
