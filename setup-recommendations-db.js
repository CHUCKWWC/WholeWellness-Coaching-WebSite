import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('Creating missing database tables...');
  
  try {
    // Create mental wellness resources table
    const { error: mentalWellnessError } = await supabase.rpc('exec_sql', {
      sql: `
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

    console.log('Mental wellness resources table result:', mentalWellnessError);

    // Create emergency contacts table
    const { error: emergencyError } = await supabase.rpc('exec_sql', {
      sql: `
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

    console.log('Emergency contacts table result:', emergencyError);

    // Create personalized recommendations table
    const { error: recommendationsError } = await supabase.rpc('exec_sql', {
      sql: `
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

    console.log('Personalized recommendations table result:', recommendationsError);

    // Insert sample data
    await insertSampleData();

  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

async function insertSampleData() {
  console.log('Inserting sample data...');
  
  // Insert mental wellness resources
  const { error: insertError } = await supabase
    .from('mental_wellness_resources')
    .upsert([
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
        title: 'National Domestic Violence Hotline',
        description: '24/7 support for domestic violence survivors',
        category: 'safety',
        resource_type: 'hotline',
        contact_info: 'Call 1-800-799-7233 for confidential support',
        phone: '1-800-799-7233',
        website: 'https://thehotline.org',
        emergency: true,
        crisis_support: true,
        featured: true,
        specialties: ['domestic violence', 'safety planning'],
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
      },
      {
        title: 'Headspace',
        description: 'Meditation and mindfulness app',
        category: 'mindfulness',
        resource_type: 'app',
        contact_info: 'Download the Headspace app',
        phone: null,
        website: 'https://headspace.com',
        emergency: false,
        crisis_support: false,
        featured: true,
        specialties: ['meditation', 'mindfulness', 'sleep'],
        languages: ['English']
      },
      {
        title: 'BetterHelp',
        description: 'Online therapy platform',
        category: 'therapy',
        resource_type: 'website',
        contact_info: 'Visit BetterHelp.com to connect with licensed therapists',
        phone: null,
        website: 'https://betterhelp.com',
        emergency: false,
        crisis_support: false,
        featured: true,
        specialties: ['therapy', 'counseling'],
        languages: ['English']
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
    .upsert([
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
      },
      {
        name: 'National Domestic Violence Hotline',
        phone: '1-800-799-7233',
        description: '24/7 support for domestic violence survivors',
        specialty: 'Domestic Violence',
        location: 'United States',
        available_24_7: true
      },
      {
        name: 'SAMHSA National Helpline',
        phone: '1-800-662-4357',
        description: 'Treatment referral service for mental health and substance use',
        specialty: 'Treatment Referral',
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

// Direct SQL execution for tables that need to be created
async function createTablesDirectly() {
  console.log('Creating tables using direct SQL...');
  
  const queries = [
    `
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
    `,
    `
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
    `,
    `
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
    `,
    `
    CREATE TABLE IF NOT EXISTS resource_usage_analytics (
      id SERIAL PRIMARY KEY,
      resource_id INTEGER REFERENCES mental_wellness_resources(id),
      user_id VARCHAR(255),
      session_id VARCHAR(255),
      access_duration INTEGER,
      was_helpful BOOLEAN,
      feedback TEXT,
      follow_up_action VARCHAR(100),
      user_agent TEXT,
      referrer TEXT,
      device_type VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `
  ];

  for (const query of queries) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) {
        console.error('Error executing query:', error);
      } else {
        console.log('Query executed successfully');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  }
}

// Run the setup
createTablesDirectly().then(() => {
  console.log('Database setup complete');
  insertSampleData().then(() => {
    console.log('Sample data insertion complete');
  });
}).catch(console.error);