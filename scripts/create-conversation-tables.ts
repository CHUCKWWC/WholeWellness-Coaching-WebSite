import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from "drizzle-orm";
import * as schema from "../shared/schema";

// Use Session mode (port 5432) for migrations instead of Transaction mode (6543)
const sessionUrl = process.env.DATABASE_URL?.replace(':6543', ':5432').replace(/[?&]pgbouncer=true/g, '').replace(/[?&]connection_limit=\d+/g, '') || '';

const client = postgres(sessionUrl, {
  ssl: { rejectUnauthorized: false },
  prepare: false
});

const db = drizzle(client, { schema });

async function createTables() {
  try {
    console.log("Creating conversation intelligence tables using Session mode...");

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
    console.log("✓ Created chat_summaries table");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS digest_preferences (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id),
        frequency VARCHAR NOT NULL DEFAULT 'weekly',
        preferred_day VARCHAR,
        preferred_hour INTEGER DEFAULT 9,
        timezone VARCHAR NOT NULL DEFAULT 'America/New_York',
        include_action_items BOOLEAN DEFAULT TRUE,
        include_insights BOOLEAN DEFAULT TRUE,
        include_progress BOOLEAN DEFAULT TRUE,
        email_enabled BOOLEAN DEFAULT TRUE,
        last_sent_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✓ Created digest_preferences table");

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
        opened BOOLEAN DEFAULT FALSE,
        opened_at TIMESTAMP
      );
    `);
    console.log("✓ Created sent_digests table");

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
        updated_at TIMESTAMP DEFAULT NOW(),
        resolved_at TIMESTAMP
      );
    `);
    console.log("✓ Created crisis_alerts table");

    console.log("\n✅ All conversation intelligence tables created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    process.exit(1);
  }
}

createTables();
