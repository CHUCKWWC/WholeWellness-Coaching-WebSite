import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('Creating mental wellness and recommendations tables...');
  
  // Create mental wellness resources table
  const { error: mentalWellnessError } = await supabase.rpc('create_mental_wellness_resources_table', {
    table_sql: `
      CREATE TABLE IF NOT EXISTS mental_wellness_resources (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        resource_type VARCHAR(50),
        contact_info TEXT,
        phone VARCHAR(20),
        website VARCHAR(255),
        email VARCHAR(255),
        address TEXT,
        hours TEXT,
        specialties TEXT[],
        languages TEXT[],
        emergency BOOLEAN DEFAULT FALSE,
        crisis_support BOOLEAN DEFAULT FALSE,
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  });

  if (mentalWellnessError) {
    console.error('Error creating mental wellness resources table:', mentalWellnessError);
  } else {
    console.log('Mental wellness resources table created successfully');
  }

  // Create emergency contacts table
  const { error: emergencyError } = await supabase.rpc('create_emergency_contacts_table', {
    table_sql: `
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        description TEXT,
        specialty VARCHAR(100),
        location VARCHAR(255),
        available_24_7 BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  });

  if (emergencyError) {
    console.error('Error creating emergency contacts table:', emergencyError);
  } else {
    console.log('Emergency contacts table created successfully');
  }

  // Create personalized recommendations table
  const { error: recommendationsError } = await supabase.rpc('create_personalized_recommendations_table', {
    table_sql: `
      CREATE TABLE IF NOT EXISTS personalized_recommendations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        resource_id INTEGER REFERENCES mental_wellness_resources(id),
        recommendation_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        reasoning TEXT,
        priority INTEGER DEFAULT 1,
        estimated_time INTEGER,
        action_steps TEXT[],
        follow_up_suggestions TEXT[],
        personalized_score DECIMAL(3,2),
        crisis_level BOOLEAN DEFAULT FALSE,
        was_accessed BOOLEAN DEFAULT FALSE,
        was_helpful BOOLEAN,
        feedback TEXT,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        accessed_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  });

  if (recommendationsError) {
    console.error('Error creating personalized recommendations table:', recommendationsError);
  } else {
    console.log('Personalized recommendations table created successfully');
  }

  // Insert sample data
  await insertSampleData();
}

async function insertSampleData() {
  console.log('Inserting sample data...');
  
  // Insert sample mental wellness resources
  const { error: insertError } = await supabase
    .from('mental_wellness_resources')
    .insert([
      {
        title: 'National Suicide Prevention Lifeline',
        description: 'Free 24/7 crisis support for people in suicidal crisis or emotional distress',
        category: 'crisis',
        resource_type: 'hotline',
        contact_info: 'Call 988 for immediate crisis support',
        phone: '988',
        website: 'https://suicidepreventionlifeline.org',
        emergency: true,
        crisis_support: true,
        featured: true,
        specialties: ['suicide prevention', 'crisis intervention'],
        languages: ['English', 'Spanish']
      },
      {
        title: 'Crisis Text Line',
        description: 'Free 24/7 text-based crisis support',
        category: 'crisis',
        resource_type: 'hotline',
        contact_info: 'Text HOME to 741741',
        phone: '741741',
        website: 'https://crisistextline.org',
        emergency: true,
        crisis_support: true,
        featured: true,
        specialties: ['crisis intervention', 'text support'],
        languages: ['English', 'Spanish']
      },
      {
        title: 'SAMHSA National Helpline',
        description: 'Free 24/7 treatment referral service for mental health and substance use disorders',
        category: 'treatment',
        resource_type: 'hotline',
        contact_info: 'Call 1-800-662-4357 for treatment referrals',
        phone: '1-800-662-4357',
        website: 'https://samhsa.gov',
        emergency: false,
        crisis_support: false,
        featured: true,
        specialties: ['treatment referral', 'substance abuse'],
        languages: ['English', 'Spanish']
      }
    ]);

  if (insertError) {
    console.error('Error inserting sample data:', insertError);
  } else {
    console.log('Sample data inserted successfully');
  }

  // Insert emergency contacts
  const { error: emergencyInsertError } = await supabase
    .from('emergency_contacts')
    .insert([
      {
        name: 'National Suicide Prevention Lifeline',
        phone: '988',
        description: 'Free 24/7 crisis support for people in suicidal crisis',
        specialty: 'Crisis Intervention',
        location: 'United States',
        available_24_7: true
      },
      {
        name: 'Crisis Text Line',
        phone: '741741',
        description: 'Free 24/7 text-based crisis support',
        specialty: 'Crisis Intervention',
        location: 'United States',
        available_24_7: true
      }
    ]);

  if (emergencyInsertError) {
    console.error('Error inserting emergency contacts:', emergencyInsertError);
  } else {
    console.log('Emergency contacts inserted successfully');
  }
}

createTables().catch(console.error);