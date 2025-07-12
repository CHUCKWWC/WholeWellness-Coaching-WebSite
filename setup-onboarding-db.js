const { supabase } = require('./server/supabase');

async function setupOnboardingTables() {
  try {
    console.log('Setting up onboarding database tables...');
    
    // Create user_onboarding_steps table
    console.log('Creating user_onboarding_steps table...');
    const { error: stepTableError } = await supabase.rpc('exec_sql', {
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
    });
    
    if (stepTableError) {
      console.error('Error creating user_onboarding_steps table:', stepTableError);
    } else {
      console.log('✓ user_onboarding_steps table created successfully');
    }
    
    // Create email_verification_tokens table
    console.log('Creating email_verification_tokens table...');
    const { error: emailTableError } = await supabase.rpc('exec_sql', {
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
    });
    
    if (emailTableError) {
      console.error('Error creating email_verification_tokens table:', emailTableError);
    } else {
      console.log('✓ email_verification_tokens table created successfully');
    }
    
    // Create password_reset_tokens table
    console.log('Creating password_reset_tokens table...');
    const { error: resetTableError } = await supabase.rpc('exec_sql', {
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
    });
    
    if (resetTableError) {
      console.error('Error creating password_reset_tokens table:', resetTableError);
    } else {
      console.log('✓ password_reset_tokens table created successfully');
    }
    
    // Add missing columns to users table
    console.log('Adding missing columns to users table...');
    const { error: userColumnsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS coaching_preferences TEXT[];
        ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_at TIMESTAMP WITH TIME ZONE;
      `
    });
    
    if (userColumnsError) {
      console.error('Error adding columns to users table:', userColumnsError);
    } else {
      console.log('✓ Users table columns added successfully');
    }
    
    // Create indexes
    console.log('Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_user_onboarding_steps_user_id ON user_onboarding_steps("userId");
        CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens("userId");
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens("userId");
      `
    });
    
    if (indexError) {
      console.error('Error creating indexes:', indexError);
    } else {
      console.log('✓ Indexes created successfully');
    }
    
    console.log('🎉 Onboarding database setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up onboarding database:', error);
  }
}

// Run the setup
setupOnboardingTables();