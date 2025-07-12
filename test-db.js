const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').single();
    console.log('Connection test result:', { data, error });
    
    // Try to create tables directly with SQL
    console.log('Creating onboarding tables...');
    
    // Create each table separately
    const tables = [
      {
        name: 'password_reset_tokens',
        sql: `
          CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "userId" TEXT NOT NULL,
            token TEXT NOT NULL UNIQUE,
            "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            used BOOLEAN DEFAULT FALSE
          );
        `
      },
      {
        name: 'email_verification_tokens',
        sql: `
          CREATE TABLE IF NOT EXISTS email_verification_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "userId" TEXT NOT NULL,
            token TEXT NOT NULL UNIQUE,
            "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            used BOOLEAN DEFAULT FALSE
          );
        `
      },
      {
        name: 'user_onboarding_steps',
        sql: `
          CREATE TABLE IF NOT EXISTS user_onboarding_steps (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "userId" TEXT NOT NULL,
            step_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            "order" INTEGER NOT NULL,
            completed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE("userId", step_id)
          );
        `
      }
    ];
    
    for (const table of tables) {
      console.log(`Creating ${table.name} table...`);
      const { error } = await supabase.rpc('exec_sql', { sql: table.sql });
      
      if (error) {
        console.error(`Error creating ${table.name} table:`, error);
      } else {
        console.log(`✓ ${table.name} table created successfully`);
      }
    }
    
    // Add missing columns to users table
    console.log('Adding missing columns to users table...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS coaching_preferences TEXT[];
        ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_at TIMESTAMP WITH TIME ZONE;
      `
    });
    
    if (alterError) {
      console.error('Error adding columns to users table:', alterError);
    } else {
      console.log('✓ Users table columns added successfully');
    }
    
    console.log('🎉 Database setup completed!');
    
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testDatabase();