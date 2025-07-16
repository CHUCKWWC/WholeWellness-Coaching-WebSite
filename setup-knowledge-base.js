import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.DATABASE_URL.replace('postgresql://', '').replace('postgres://', '');
const [credentials, hostAndDb] = supabaseUrl.split('@');
const [username, password] = credentials.split(':');
const [hostAndPort, database] = hostAndDb.split('/');
const [host, port] = hostAndPort.split(':');

console.log('Setting up Knowledge Base tables...');

// Create Supabase client
const supabase = createClient(
  `https://${host.replace('.pooler.supabase.co', '.supabase.co')}`,
  process.env.SUPABASE_ANON_KEY || 'your-anon-key',
  {
    auth: {
      persistSession: false
    }
  }
);

async function setupKnowledgeBase() {
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync(join(__dirname, 'supabase-knowledge-base-schema.sql'), 'utf8');
    
    // Split SQL commands (basic splitting - you might need to enhance this)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`Executing ${commands.length} SQL commands...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.length > 0) {
        try {
          console.log(`Executing command ${i + 1}/${commands.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: command });
          if (error) {
            console.error(`Error executing command ${i + 1}:`, error);
            // Continue with next command
          } else {
            console.log(`✓ Command ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`Error executing command ${i + 1}:`, err);
          // Continue with next command
        }
      }
    }
    
    console.log('Knowledge Base setup completed!');
    
  } catch (error) {
    console.error('Error setting up Knowledge Base:', error);
  }
}

// Alternative approach: Direct table creation
async function createKnowledgeBaseTables() {
  try {
    console.log('Creating knowledge base tables directly...');
    
    // Create main knowledge_base table
    const { error: kbError } = await supabase
      .from('knowledge_base')
      .select('*')
      .limit(1);
    
    if (kbError && kbError.message.includes('relation "knowledge_base" does not exist')) {
      console.log('Creating knowledge_base table...');
      
      // Since we can't execute DDL directly, we'll create a simple version
      // In a real scenario, you would run the SQL script in Supabase dashboard
      console.log('Please run the SQL script in your Supabase dashboard:');
      console.log('1. Go to your Supabase project dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the contents of supabase-knowledge-base-schema.sql');
      console.log('4. The script will create all necessary tables and sample data');
      
      // Create a simple test to verify connection
      console.log('Testing database connection...');
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Database connection error:', error);
      } else {
        console.log('✓ Database connection verified');
      }
      
    } else {
      console.log('✓ Knowledge base table already exists');
    }
    
  } catch (error) {
    console.error('Error creating knowledge base tables:', error);
  }
}

// Run the setup
createKnowledgeBaseTables();