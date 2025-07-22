#!/usr/bin/env node
// Direct database table creation for WholeWellness Platform

import pkg from 'pg';
const { Client } = pkg;

async function deployMissingTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();

    console.log('📋 Creating missing tables...');

    // Essential tables needed for platform functionality
    const tables = [
      // Chat Sessions (fixing user_id column missing error)
      {
        name: 'chat_sessions',
        sql: `CREATE TABLE IF NOT EXISTS chat_sessions (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          coach_type TEXT NOT NULL,
          session_title TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          is_active BOOLEAN DEFAULT true
        )`
      },
      
      // Mental Wellness Resources (fixing is_active column missing error)
      {
        name: 'mental_wellness_resources',
        sql: `CREATE TABLE IF NOT EXISTS mental_wellness_resources (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          content TEXT,
          resource_type TEXT NOT NULL,
          category TEXT NOT NULL,
          crisis_level INTEGER DEFAULT 0,
          target_audience TEXT[],
          tags TEXT[],
          external_url TEXT,
          is_active BOOLEAN DEFAULT true,
          is_featured BOOLEAN DEFAULT false,
          view_count INTEGER DEFAULT 0,
          rating DECIMAL(3,2) DEFAULT 0.0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )`
      },
      
      // Discovery Quiz Results  
      {
        name: 'discovery_quiz_results',
        sql: `CREATE TABLE IF NOT EXISTS discovery_quiz_results (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT,
          session_id TEXT,
          current_needs TEXT[],
          situation_details JSONB,
          support_preference TEXT,
          readiness_level TEXT,
          recommended_path JSONB,
          quiz_version TEXT DEFAULT 'v1',
          completed BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )`
      },
      
      // Coach Match Tags
      {
        name: 'coach_match_tags',
        sql: `CREATE TABLE IF NOT EXISTS coach_match_tags (
          id SERIAL PRIMARY KEY,
          tag_combination TEXT NOT NULL,
          primary_coach TEXT,
          supporting_coaches TEXT[],
          ai_tools TEXT[],
          group_support BOOLEAN DEFAULT false,
          priority INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT NOW()
        )`
      },
      
      // AI Coaching Profiles
      {
        name: 'ai_coaching_profiles',
        sql: `CREATE TABLE IF NOT EXISTS ai_coaching_profiles (
          id SERIAL PRIMARY KEY,
          coach_name TEXT NOT NULL,
          coach_type TEXT NOT NULL UNIQUE,
          description TEXT,
          specialties TEXT[],
          greeting_message TEXT,
          persona_prompt TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW()
        )`
      },
      
      // Volunteer Applications
      {
        name: 'volunteer_applications',
        sql: `CREATE TABLE IF NOT EXISTS volunteer_applications (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          motivation TEXT NOT NULL,
          experience TEXT,
          availability TEXT[],
          skills TEXT[],
          background_check_consent BOOLEAN DEFAULT false,
          application_status TEXT DEFAULT 'pending',
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )`
      }
    ];

    // Create tables
    for (const table of tables) {
      try {
        await client.query(table.sql);
        console.log(`✅ Created/verified table: ${table.name}`);
      } catch (error) {
        console.warn(`⚠️ Issue with ${table.name}: ${error.message}`);
      }
    }

    // Create indices for performance
    const indices = [
      'CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_mental_wellness_category ON mental_wellness_resources(category)',
      'CREATE INDEX IF NOT EXISTS idx_mental_wellness_active ON mental_wellness_resources(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_discovery_quiz_user_id ON discovery_quiz_results(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_volunteer_applications_status ON volunteer_applications(application_status)'
    ];

    console.log('📊 Creating performance indices...');
    for (const indexSql of indices) {
      try {
        await client.query(indexSql);
      } catch (error) {
        console.warn(`⚠️ Index creation warning: ${error.message}`);
      }
    }

    // Populate with essential data
    console.log('📝 Populating with essential data...');
    
    // AI Coaching Profiles
    const aiCoaches = [
      ['Dasha', 'weight-loss', 'Weight Loss Specialist', '{"weight management", "nutrition", "lifestyle changes"}', 'Hi! I\'m Dasha, your weight loss specialist. I\'m here to support you on your wellness journey!'],
      ['Dr. Sarah', 'nutritionist', 'Nutritionist & Wellness Expert', '{"nutrition", "meal planning", "wellness"}', 'Hello! I\'m Dr. Sarah, your nutrition expert. Let\'s work together on your wellness goals!'],
      ['Marcus', 'fitness', 'Fitness & Movement Coach', '{"fitness", "exercise", "movement", "strength"}', 'Hey there! I\'m Marcus, your fitness coach. Ready to get moving towards your goals?'],
      ['Dr. Lisa', 'behavioral', 'Behavioral Change Specialist', '{"behavior change", "habits", "psychology"}', 'Hi! I\'m Dr. Lisa, here to help you build lasting positive changes in your life.'],
      ['Emma', 'wellness', 'Wellness Coordinator', '{"holistic wellness", "self-care", "balance"}', 'Welcome! I\'m Emma, your wellness coordinator. Let\'s create balance in your life together.'],
      ['Alex', 'accountability', 'Accountability Partner', '{"goal setting", "motivation", "tracking"}', 'Hi! I\'m Alex, your accountability partner. I\'m here to keep you motivated and on track!']
    ];

    for (const coach of aiCoaches) {
      try {
        await client.query(`
          INSERT INTO ai_coaching_profiles (coach_name, coach_type, description, specialties, greeting_message) 
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (coach_type) DO UPDATE SET
            coach_name = EXCLUDED.coach_name,
            description = EXCLUDED.description,
            specialties = EXCLUDED.specialties,
            greeting_message = EXCLUDED.greeting_message
        `, coach);
      } catch (error) {
        console.warn(`⚠️ AI coach insert warning: ${error.message}`);
      }
    }

    // Mental wellness resources
    const resources = [
      ['Crisis Support Resources', 'Immediate help for crisis situations', 'If you are in immediate danger, call 911. For mental health crises, contact the National Suicide Prevention Lifeline at 988.', 'crisis', 'crisis', 2, '{"general","survivors"}', '{"crisis","emergency","suicide prevention","immediate help"}'],
      ['Understanding Trauma Responses', 'Learn about common trauma responses and healing', 'Trauma responses are normal reactions to abnormal situations. Understanding these responses is the first step in healing.', 'article', 'trauma', 0, '{"survivors","general"}', '{"trauma","healing","recovery","education"}'],
      ['Building Healthy Relationships', 'Guide to creating supportive relationships', 'Healthy relationships are built on trust, respect, and communication. Learn how to identify and build these connections.', 'article', 'relationships', 0, '{"general","survivors"}', '{"relationships","communication","trust","healthy boundaries"}']
    ];

    for (const resource of resources) {
      try {
        await client.query(`
          INSERT INTO mental_wellness_resources (title, description, content, resource_type, category, crisis_level, target_audience, tags, is_active, is_featured) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, true)
          ON CONFLICT DO NOTHING
        `, resource);
      } catch (error) {
        console.warn(`⚠️ Resource insert warning: ${error.message}`);
      }
    }

    console.log('🎉 Database initialization completed successfully!');
    console.log('📊 Tables created and populated with essential data');
    
    // Verify table creation
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('chat_sessions', 'mental_wellness_resources', 'discovery_quiz_results', 'ai_coaching_profiles', 'volunteer_applications')
      ORDER BY table_name
    `);
    
    console.log('✅ Verified tables:', result.rows.map(r => r.table_name));

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the deployment
deployMissingTables()
  .then(() => {
    console.log('🏁 Database setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });

export default deployMissingTables;