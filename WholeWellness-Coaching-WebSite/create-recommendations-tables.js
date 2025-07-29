import { supabase } from './server/supabase.js';

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

    if (mentalWellnessError) {
      console.error('Error creating mental wellness resources table:', mentalWellnessError);
    } else {
      console.log('Mental wellness resources table created successfully');
    }

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

    if (emergencyError) {
      console.error('Error creating emergency contacts table:', emergencyError);
    } else {
      console.log('Emergency contacts table created successfully');
    }

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
      }
    ]);

  if (emergencyInsertError) {
    console.error('Error inserting emergency contacts:', emergencyInsertError);
  } else {
    console.log('Emergency contacts inserted successfully');
  }
}

createTables().catch(console.error);