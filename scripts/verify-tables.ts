import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function verifyTables() {
  try {
    console.log('Checking conversation intelligence tables...\n');

    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('chat_summaries', 'digest_preferences', 'sent_digests', 'crisis_alerts')
      ORDER BY table_name
    `);

    const foundTables = tables.map((r: any) => r.table_name);
    
    console.log('✓ Found tables:', foundTables.join(', '));
    console.log(`\n${foundTables.length}/4 tables exist`);

    if (foundTables.length === 4) {
      console.log('\n✅ All conversation intelligence tables are created successfully!');
      process.exit(0);
    } else {
      const missing = ['chat_summaries', 'digest_preferences', 'sent_digests', 'crisis_alerts']
        .filter(t => !foundTables.includes(t));
      console.log('\n❌ Missing tables:', missing.join(', '));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error verifying tables:', error);
    process.exit(1);
  }
}

verifyTables();
