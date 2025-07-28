#!/usr/bin/env node

// Deploy missing assessment tables directly via Supabase client
const deployMissingTables = async () => {
  console.log('🚀 Deploying Missing Assessment Tables\n');
  
  try {
    // Import Supabase client
    const { supabase } = await import('./server/supabase.js');
    
    console.log('Step 1: Creating assessment_types table...');
    
    // Create assessment_types table
    const { error: createTypesError } = await supabase.rpc('create_assessment_types_table');
    
    if (createTypesError && !createTypesError.message.includes('already exists')) {
      console.log('Creating table via raw SQL...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS assessment_types (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR NOT NULL,
          display_name VARCHAR NOT NULL,
          category VARCHAR NOT NULL,
          description TEXT,
          version INTEGER DEFAULT 1,
          fields JSONB NOT NULL,
          coach_types TEXT[],
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `;
      
      const { error: sqlError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      console.log(`Assessment types table: ${sqlError ? '❌' : '✅'}`);
    } else {
      console.log('✅ Assessment types table ready');
    }
    
    console.log('\nStep 2: Creating user_assessments table...');
    
    const createUserAssessmentsSQL = `
      CREATE TABLE IF NOT EXISTS user_assessments (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL REFERENCES users(id),
        assessment_type_id TEXT NOT NULL,
        responses JSONB NOT NULL,
        summary TEXT,
        tags TEXT[],
        completed_at TIMESTAMP DEFAULT NOW(),
        last_accessed_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    const { error: userAssessmentsError } = await supabase.rpc('exec_sql', { sql: createUserAssessmentsSQL });
    console.log(`User assessments table: ${userAssessmentsError ? '❌' : '✅'}`);
    
    console.log('\nStep 3: Creating coach_interactions table...');
    
    const createCoachInteractionsSQL = `
      CREATE TABLE IF NOT EXISTS coach_interactions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL REFERENCES users(id),
        coach_type VARCHAR NOT NULL,
        accessed_assessments TEXT[],
        interaction_summary TEXT,
        session_id VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    const { error: coachInteractionsError } = await supabase.rpc('exec_sql', { sql: createCoachInteractionsSQL });
    console.log(`Coach interactions table: ${coachInteractionsError ? '❌' : '✅'}`);
    
    console.log('\nStep 4: Seeding assessment types...');
    
    const assessmentTypes = [
      {
        id: 'weight-loss-intake',
        name: 'weight_loss_intake',
        display_name: 'Weight Loss Intake Assessment',
        category: 'health',
        description: 'Comprehensive intake form for weight loss coaching',
        fields: {
          fields: [
            { name: 'currentWeight', type: 'number', label: 'Current Weight (lbs)', required: true },
            { name: 'goalWeight', type: 'number', label: 'Goal Weight (lbs)', required: true },
            { name: 'timeline', type: 'select', label: 'Timeline', options: ['3 months', '6 months', '1 year', '2+ years'], required: true },
            { name: 'previousAttempts', type: 'textarea', label: 'Previous Weight Loss Attempts', required: false },
            { name: 'medicalConditions', type: 'textarea', label: 'Medical Conditions', required: false },
            { name: 'currentActivity', type: 'select', label: 'Current Activity Level', options: ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'], required: true }
          ]
        },
        coach_types: ['weight_loss', 'nutrition', 'fitness'],
        is_active: true
      },
      {
        id: 'attachment-style',
        name: 'attachment_style',
        display_name: 'Relationship Attachment Style Assessment',
        category: 'relationships',
        description: 'Assessment to determine relationship attachment patterns',
        fields: {
          fields: [
            { name: 'relationshipStatus', type: 'select', label: 'Current Relationship Status', options: ['Single', 'Dating', 'In a relationship', 'Married', 'Divorced', 'Widowed'], required: true },
            { name: 'pastRelationships', type: 'number', label: 'Number of serious relationships', required: true },
            { name: 'communicationStyle', type: 'select', label: 'Communication Style', options: ['Direct', 'Indirect', 'Passive', 'Aggressive', 'Mixed'], required: true },
            { name: 'conflictHandling', type: 'textarea', label: 'How do you handle conflict?', required: true },
            { name: 'trustIssues', type: 'select', label: 'Trust Level', options: ['Very trusting', 'Somewhat trusting', 'Cautious', 'Have trust issues'], required: true }
          ]
        },
        coach_types: ['relationship', 'behavior'],
        is_active: true
      },
      {
        id: 'mental-health-screening',
        name: 'mental_health_screening',
        display_name: 'Mental Health & Wellness Screening',
        category: 'mental_health',
        description: 'Initial mental health and wellness assessment',
        fields: {
          fields: [
            { name: 'moodRating', type: 'range', label: 'Overall mood (1-10)', min: 1, max: 10, required: true },
            { name: 'stressLevel', type: 'range', label: 'Stress level (1-10)', min: 1, max: 10, required: true },
            { name: 'sleepQuality', type: 'select', label: 'Sleep Quality', options: ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor'], required: true },
            { name: 'supportSystem', type: 'textarea', label: 'Describe your support system', required: true },
            { name: 'copingStrategies', type: 'textarea', label: 'Current coping strategies', required: true },
            { name: 'goals', type: 'textarea', label: 'Mental wellness goals', required: true }
          ]
        },
        coach_types: ['wellness', 'behavior', 'mental_health'],
        is_active: true
      }
    ];
    
    for (const assessmentType of assessmentTypes) {
      const { error: insertError } = await supabase
        .from('assessment_types')
        .upsert(assessmentType);
      
      console.log(`${assessmentType.display_name}: ${insertError ? '❌' : '✅'}`);
    }
    
    console.log('\nStep 5: Creating test user...');
    
    const testUser = {
      id: 'coach_chuck_test',
      email: 'chuck@test.com',
      first_name: 'Chuck',
      last_name: 'TestCoach',
      password_hash: '$2b$12$dummy.hash.for.testing',
      role: 'coach',
      membership_level: 'coach',
      is_active: true
    };
    
    const { error: userError } = await supabase
      .from('users')
      .upsert(testUser);
    
    console.log(`Test user: ${userError ? '❌' : '✅'}`);
    
    console.log('\n🎉 Deployment Complete!');
    console.log('Assessment system should now be fully operational.');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.log('\n💡 ALTERNATIVE: Execute the SQL script manually in Supabase dashboard');
    console.log('   Copy the contents of fix-assessment-database.sql');
    console.log('   Paste into Supabase SQL Editor and run');
  }
};

deployMissingTables();