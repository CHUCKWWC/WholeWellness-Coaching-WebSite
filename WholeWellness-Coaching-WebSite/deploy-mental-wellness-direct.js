import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwuwmnivvdvdxdewynbo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dXdtbml2dmR2ZHhkZXd5bmJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg2OTY3NywiZXhwIjoyMDYzNDQ1Njc3fQ._daQTENeg-Hkh9BxTtO9gY_BTpJafpNWKS5X4A1VFG4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deployMentalWellnessTables() {
  console.log('Creating mental wellness database tables...');
  
  try {
    // First, let's check if tables exist and create them if they don't
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    console.log('Existing tables:', tables?.map(t => t.table_name));

    // Create mental wellness resources table via raw SQL
    const createMentalWellnessTable = `
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
    `;

    // Create emergency contacts table
    const createEmergencyTable = `
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
    `;

    // Create personalized recommendations table
    const createRecommendationsTable = `
      CREATE TABLE IF NOT EXISTS personalized_recommendations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        resource_id INTEGER,
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
    `;

    // Create resource usage analytics table
    const createAnalyticsTable = `
      CREATE TABLE IF NOT EXISTS resource_usage_analytics (
        id SERIAL PRIMARY KEY,
        resource_id INTEGER,
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
    `;

    // Try to create tables using the SQL editor approach
    const queries = [
      createMentalWellnessTable,
      createEmergencyTable,
      createRecommendationsTable,
      createAnalyticsTable
    ];

    for (const query of queries) {
      console.log('Executing query...');
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: query });
        if (error) {
          console.log('RPC method not available, trying direct insert...');
          // If RPC doesn't work, we'll have to manually insert sample data
        }
      } catch (err) {
        console.log('RPC method failed, continuing with data insertion...');
      }
    }

    // Insert sample data directly
    await insertSampleData();

  } catch (error) {
    console.error('Error in deployment:', error);
  }
}

async function insertSampleData() {
  console.log('Inserting sample mental wellness resources...');
  
  // Try to insert mental wellness resources
  try {
    const { data: resourcesData, error: resourcesError } = await supabase
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
          website: 'https://betterhelp.com',
          emergency: false,
          crisis_support: false,
          featured: true,
          specialties: ['therapy', 'counseling'],
          languages: ['English']
        },
        {
          title: 'Psychology Today',
          description: 'Find therapists and mental health professionals',
          category: 'therapy',
          resource_type: 'website',
          contact_info: 'Search for therapists in your area',
          website: 'https://psychologytoday.com',
          emergency: false,
          crisis_support: false,
          featured: true,
          specialties: ['therapy', 'counseling'],
          languages: ['English']
        },
        {
          title: 'NAMI',
          description: 'National Alliance on Mental Illness support and resources',
          category: 'support',
          resource_type: 'website',
          contact_info: 'Visit NAMI.org for mental health resources',
          website: 'https://nami.org',
          emergency: false,
          crisis_support: false,
          featured: true,
          specialties: ['mental health education', 'support groups'],
          languages: ['English']
        }
      ]);

    if (resourcesError) {
      console.error('Error inserting mental wellness resources:', resourcesError);
    } else {
      console.log('Mental wellness resources inserted successfully');
    }
  } catch (err) {
    console.error('Error with mental wellness resources:', err);
  }

  // Try to insert emergency contacts
  try {
    const { data: contactsData, error: contactsError } = await supabase
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
        },
        {
          name: 'National Child Abuse Hotline',
          phone: '1-800-4-A-CHILD',
          description: '24/7 crisis counseling for child abuse',
          specialty: 'Child Abuse',
          location: 'United States',
          available_24_7: true
        },
        {
          name: 'Trans Lifeline',
          phone: '877-565-8860',
          description: 'Crisis support for transgender people',
          specialty: 'LGBTQ+ Support',
          location: 'United States',
          available_24_7: true
        },
        {
          name: 'RAINN National Sexual Assault Hotline',
          phone: '1-800-656-4673',
          description: '24/7 support for sexual assault survivors',
          specialty: 'Sexual Assault',
          location: 'United States',
          available_24_7: true
        },
        {
          name: 'Veterans Crisis Line',
          phone: '1-800-273-8255',
          description: '24/7 crisis support for veterans',
          specialty: 'Veterans Support',
          location: 'United States',
          available_24_7: true
        }
      ]);

    if (contactsError) {
      console.error('Error inserting emergency contacts:', contactsError);
    } else {
      console.log('Emergency contacts inserted successfully');
    }
  } catch (err) {
    console.error('Error with emergency contacts:', err);
  }

  console.log('Sample data insertion complete!');
}

// Run the deployment
deployMentalWellnessTables().catch(console.error);