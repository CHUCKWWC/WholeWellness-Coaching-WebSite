import { db } from './db';
import { sql } from 'drizzle-orm';

export async function migrateVideoSchema() {
  try {
    console.log('Starting video schema migration...');

    // Create video_sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS video_sessions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id INTEGER,
        coach_id INTEGER NOT NULL,
        room_code VARCHAR NOT NULL UNIQUE,
        session_type VARCHAR NOT NULL CHECK (session_type IN ('one-on-one', 'workshop', 'group')),
        title VARCHAR NOT NULL,
        description TEXT,
        scheduled_start_time TIMESTAMP NOT NULL,
        actual_start_time TIMESTAMP,
        end_time TIMESTAMP,
        status VARCHAR NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
        recording_url VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ video_sessions table created/verified');

    // Create session_participants table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS session_participants (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR NOT NULL REFERENCES video_sessions(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        role VARCHAR NOT NULL CHECK (role IN ('host', 'participant', 'moderator')),
        joined_at TIMESTAMP,
        left_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ session_participants table created/verified');

    // Create session_transcripts table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS session_transcripts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR NOT NULL REFERENCES video_sessions(id) ON DELETE CASCADE,
        transcript TEXT NOT NULL,
        summary TEXT,
        ai_insights TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ session_transcripts table created/verified');

    // Create workshop_details table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS workshop_details (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR NOT NULL REFERENCES video_sessions(id) ON DELETE CASCADE,
        max_participants INTEGER NOT NULL,
        current_participants INTEGER DEFAULT 0,
        topics TEXT[] DEFAULT '{}',
        materials_url VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ workshop_details table created/verified');

    // Create indexes for performance
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_video_sessions_coach_id ON video_sessions(coach_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_video_sessions_booking_id ON video_sessions(booking_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_session_participants_session_id ON session_participants(session_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_session_participants_user_id ON session_participants(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_session_transcripts_session_id ON session_transcripts(session_id)`);
    console.log('✓ Indexes created/verified');

    console.log('Video schema migration completed successfully!');
    return { success: true, message: 'Video schema migration completed' };
  } catch (error) {
    console.error('Error migrating video schema:', error);
    throw error;
  }
}
