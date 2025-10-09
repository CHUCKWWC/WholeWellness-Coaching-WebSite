import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Creates chat summarization and digest tables on application startup
 * Workaround for Supabase pooler SASL authentication issues
 */
export async function migrateChatSchema() {
  try {
    console.log('🔄 Starting chat schema migration...');

    // Create chat_summaries table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chat_summaries (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        coach_type VARCHAR NOT NULL,
        conversation_date TIMESTAMP NOT NULL,
        message_count INTEGER NOT NULL,
        summary TEXT NOT NULL,
        key_topics TEXT[],
        emotional_tone VARCHAR,
        action_items JSONB,
        insights TEXT,
        full_transcript TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ chat_summaries table ready');

    // Create digest_preferences table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS digest_preferences (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id),
        frequency VARCHAR NOT NULL DEFAULT 'weekly',
        preferred_day VARCHAR,
        preferred_hour INTEGER DEFAULT 9,
        timezone VARCHAR NOT NULL DEFAULT 'America/New_York',
        include_action_items BOOLEAN DEFAULT true,
        include_insights BOOLEAN DEFAULT true,
        include_progress BOOLEAN DEFAULT true,
        email_enabled BOOLEAN DEFAULT true,
        last_sent_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ digest_preferences table ready');

    // Create sent_digests table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sent_digests (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        digest_type VARCHAR NOT NULL,
        period_start TIMESTAMP NOT NULL,
        period_end TIMESTAMP NOT NULL,
        summary_count INTEGER NOT NULL,
        content JSONB NOT NULL,
        sent_at TIMESTAMP DEFAULT NOW(),
        opened BOOLEAN DEFAULT false,
        opened_at TIMESTAMP
      );
    `);
    console.log('✓ sent_digests table ready');

    // Create crisis_alerts table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS crisis_alerts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        coach_type VARCHAR NOT NULL,
        trigger_message TEXT NOT NULL,
        severity_level VARCHAR NOT NULL,
        detected_keywords TEXT[],
        ai_assessment TEXT,
        status VARCHAR DEFAULT 'new',
        escalated_to VARCHAR,
        resolution TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        resolved_at TIMESTAMP
      );
    `);
    console.log('✓ crisis_alerts table ready');

    // Create indexes for performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_chat_summaries_user_date 
      ON chat_summaries(user_id, conversation_date DESC);
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_crisis_alerts_user_status 
      ON crisis_alerts(user_id, status);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_sent_digests_user_period 
      ON sent_digests(user_id, period_end DESC);
    `);

    console.log('✅ Chat schema migration completed successfully');
  } catch (error) {
    console.error('❌ Chat schema migration failed:', error);
    // Don't throw - let app continue, tables might already exist
  }
}
