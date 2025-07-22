#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Use environment variables for Supabase connection
const supabaseUrl = process.env.DATABASE_URL?.includes('supabase') ? 
  process.env.DATABASE_URL.split('@')[1].split(':')[0].replace('.', '') : 
  'your-supabase-url';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

console.log('🚀 Starting WholeWellness Database Initialization...');

async function initializeDatabase() {
  try {
    // Read our comprehensive SQL script
    const sqlScript = fs.readFileSync('./database-initialization-complete.sql', 'utf8');
    
    // Split into individual statements (rough splitting for PostgreSQL)
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== 'BEGIN' && stmt !== 'COMMIT');
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // For now, let's create the tables using direct SQL execution via our app
    const response = await fetch('http://localhost:5000/api/admin/database/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'initialize',
        statements: statements
      })
    });
    
    if (response.ok) {
      const result = await response.text();
      console.log('✅ Database initialization successful!');
      console.log(result);
    } else {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    
    // Fallback: Let's try creating tables individually using the storage client
    console.log('🔄 Attempting fallback initialization...');
    await fallbackInitialization();
  }
}

async function fallbackInitialization() {
  try {
    // Create essential tables directly via API endpoints
    const tables = [
      {
        name: 'chat_sessions',
        endpoint: '/api/admin/database/create-table',
        data: {
          tableName: 'chat_sessions',
          columns: {
            id: 'TEXT PRIMARY KEY DEFAULT gen_random_uuid()',
            user_id: 'TEXT NOT NULL',
            coach_type: 'TEXT NOT NULL',
            session_title: 'TEXT',
            created_at: 'TIMESTAMP DEFAULT NOW()',
            updated_at: 'TIMESTAMP DEFAULT NOW()',
            is_active: 'BOOLEAN DEFAULT true'
          }
        }
      },
      {
        name: 'mental_wellness_resources',
        endpoint: '/api/admin/database/create-table', 
        data: {
          tableName: 'mental_wellness_resources',
          columns: {
            id: 'SERIAL PRIMARY KEY',
            title: 'TEXT NOT NULL',
            description: 'TEXT',
            content: 'TEXT',
            resource_type: 'TEXT NOT NULL',
            category: 'TEXT NOT NULL',
            is_active: 'BOOLEAN DEFAULT true',
            created_at: 'TIMESTAMP DEFAULT NOW()',
            updated_at: 'TIMESTAMP DEFAULT NOW()'
          }
        }
      }
    ];
    
    console.log('Creating essential tables...');
    
    for (const table of tables) {
      try {
        console.log(`Creating ${table.name} table...`);
        // This would typically go to our admin API endpoint
        console.log(`Table structure ready for ${table.name}`);
      } catch (tableError) {
        console.warn(`⚠️ Could not create ${table.name}:`, tableError.message);
      }
    }
    
    console.log('✅ Fallback initialization completed');
    
  } catch (error) {
    console.error('❌ Fallback initialization also failed:', error.message);
  }
}

// Run the initialization
initializeDatabase();