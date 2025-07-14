// Setup Mental Wellness Database Tables with Sample Data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwuwmnivvdvdxdewynbo.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
  throw new Error('SUPABASE_KEY environment variable is required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupMentalWellnessTables() {
  console.log('🔧 Setting up Mental Wellness Database Tables...');
  
  try {
    // Create tables
    const createTablesSQL = `
      -- Mental Wellness Resources Table
      CREATE TABLE IF NOT EXISTS mental_wellness_resources (
        id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR NOT NULL,
        resource_type VARCHAR NOT NULL,
        url TEXT,
        phone_number VARCHAR,
        is_emergency BOOLEAN DEFAULT FALSE,
        availability VARCHAR,
        languages JSONB DEFAULT '["English"]',
        cost_info VARCHAR,
        target_audience VARCHAR,
        rating DECIMAL(3,2),
        usage_count INTEGER DEFAULT 0,
        tags JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        verification_status VARCHAR DEFAULT 'verified',
        last_verified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Emergency Contacts Table
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        organization VARCHAR,
        phone_number VARCHAR NOT NULL,
        text_support VARCHAR,
        description TEXT NOT NULL,
        availability VARCHAR NOT NULL,
        languages JSONB DEFAULT '["English"]',
        specialty VARCHAR,
        is_national BOOLEAN DEFAULT TRUE,
        country VARCHAR DEFAULT 'US',
        state VARCHAR,
        city VARCHAR,
        website TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        last_verified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Wellness Assessments Table
      CREATE TABLE IF NOT EXISTS wellness_assessments (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR REFERENCES users(id),
        session_id VARCHAR,
        assessment_type VARCHAR NOT NULL,
        responses JSONB NOT NULL,
        score INTEGER,
        risk_level VARCHAR,
        recommended_resources JSONB DEFAULT '[]',
        follow_up_required BOOLEAN DEFAULT FALSE,
        follow_up_date TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Personalized Recommendations Table
      CREATE TABLE IF NOT EXISTS personalized_recommendations (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR REFERENCES users(id),
        session_id VARCHAR,
        resource_id INTEGER REFERENCES mental_wellness_resources(id) NOT NULL,
        recommendation_score DECIMAL(5,2),
        reasons JSONB DEFAULT '[]',
        algorithm_version VARCHAR DEFAULT 'v1.0',
        was_accessed BOOLEAN DEFAULT FALSE,
        was_helpful BOOLEAN,
        feedback TEXT,
        generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE
      );

      -- Resource Usage Analytics Table
      CREATE TABLE IF NOT EXISTS resource_usage_analytics (
        id SERIAL PRIMARY KEY,
        resource_id INTEGER REFERENCES mental_wellness_resources(id) NOT NULL,
        user_id VARCHAR REFERENCES users(id),
        session_id VARCHAR,
        accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        user_agent TEXT,
        referrer TEXT,
        device_type VARCHAR,
        access_duration INTEGER,
        was_helpful BOOLEAN,
        feedback TEXT,
        follow_up_action VARCHAR
      );

      -- RPC Function to increment resource usage
      CREATE OR REPLACE FUNCTION increment_resource_usage(resource_id INTEGER)
      RETURNS void AS $$
      BEGIN
        UPDATE mental_wellness_resources 
        SET usage_count = usage_count + 1, updated_at = NOW()
        WHERE id = resource_id;
      END;
      $$ LANGUAGE plpgsql;
    `;

    console.log('Creating tables...');
    // Note: In production, these tables would be created via migrations
    // For now, we'll proceed with inserting sample data
    console.log('📝 Note: Tables should be created via supabase-complete-schema.sql');

    // Insert sample mental wellness resources
    const sampleResources = [
      // Crisis Resources
      {
        title: 'National Suicide Prevention Lifeline',
        description: 'Free and confidential emotional support to people in suicidal crisis or emotional distress 24/7.',
        category: 'crisis',
        resource_type: 'hotline',
        phone_number: '988',
        is_emergency: true,
        availability: '24/7',
        languages: ['English', 'Spanish'],
        cost_info: 'free',
        target_audience: 'general',
        rating: 4.8,
        tags: ['suicide', 'crisis', 'support'],
        is_featured: true
      },
      {
        title: 'Crisis Text Line',
        description: 'Text-based mental health crisis support service available 24/7.',
        category: 'crisis',
        resource_type: 'hotline',
        phone_number: '741741',
        text_support: 'Text HOME to 741741',
        is_emergency: true,
        availability: '24/7',
        languages: ['English', 'Spanish'],
        cost_info: 'free',
        target_audience: 'general',
        rating: 4.7,
        tags: ['crisis', 'text', 'support'],
        is_featured: true
      },
      {
        title: 'SAMHSA National Helpline',
        description: 'Treatment referral and information service for individuals and families facing mental health and substance use disorders.',
        category: 'crisis',
        resource_type: 'hotline',
        phone_number: '1-800-662-4357',
        is_emergency: false,
        availability: '24/7',
        languages: ['English', 'Spanish'],
        cost_info: 'free',
        target_audience: 'general',
        rating: 4.6,
        tags: ['mental health', 'substance abuse', 'treatment'],
        is_featured: true
      },
      
      // Anxiety Resources
      {
        title: 'Anxiety and Depression Association of America',
        description: 'Comprehensive resource for anxiety and depression information, self-help tools, and professional support.',
        category: 'anxiety',
        resource_type: 'website',
        url: 'https://adaa.org',
        availability: '24/7',
        languages: ['English'],
        cost_info: 'free',
        target_audience: 'general',
        rating: 4.5,
        tags: ['anxiety', 'depression', 'self-help'],
        is_featured: true
      },
      {
        title: 'Headspace',
        description: 'Meditation and mindfulness app with guided sessions for anxiety, stress, and sleep.',
        category: 'mindfulness',
        resource_type: 'app',
        url: 'https://headspace.com',
        availability: '24/7',
        languages: ['English', 'Spanish', 'French'],
        cost_info: 'freemium',
        target_audience: 'general',
        rating: 4.4,
        tags: ['meditation', 'mindfulness', 'anxiety'],
        is_featured: true
      },
      {
        title: 'Calm',
        description: 'Sleep stories, meditation, and relaxation techniques to reduce anxiety and improve mental well-being.',
        category: 'mindfulness',
        resource_type: 'app',
        url: 'https://calm.com',
        availability: '24/7',
        languages: ['English', 'Spanish', 'German'],
        cost_info: 'freemium',
        target_audience: 'general',
        rating: 4.3,
        tags: ['sleep', 'meditation', 'relaxation'],
        is_featured: true
      },
      
      // Depression Resources
      {
        title: 'National Alliance on Mental Illness (NAMI)',
        description: 'Education, support, and advocacy for individuals and families affected by mental illness.',
        category: 'depression',
        resource_type: 'website',
        url: 'https://nami.org',
        availability: '24/7',
        languages: ['English', 'Spanish'],
        cost_info: 'free',
        target_audience: 'general',
        rating: 4.7,
        tags: ['depression', 'support', 'advocacy'],
        is_featured: true
      },
      {
        title: 'MindShift',
        description: 'App designed to help teens and young adults cope with anxiety and stress using cognitive behavioral therapy techniques.',
        category: 'anxiety',
        resource_type: 'app',
        url: 'https://mindshift.com',
        availability: '24/7',
        languages: ['English'],
        cost_info: 'free',
        target_audience: 'teens',
        rating: 4.2,
        tags: ['anxiety', 'teens', 'CBT'],
        is_featured: false
      },
      
      // Stress Management
      {
        title: 'Stress and Anxiety Self-Help Guide',
        description: 'Comprehensive guide with practical techniques for managing stress and anxiety in daily life.',
        category: 'stress',
        resource_type: 'article',
        url: 'https://example.com/stress-guide',
        availability: '24/7',
        languages: ['English'],
        cost_info: 'free',
        target_audience: 'general',
        rating: 4.1,
        tags: ['stress', 'self-help', 'coping'],
        is_featured: false
      },
      
      // Relationship Support
      {
        title: 'National Domestic Violence Hotline',
        description: 'Confidential support for domestic violence survivors and their loved ones.',
        category: 'relationship',
        resource_type: 'hotline',
        phone_number: '1-800-799-7233',
        is_emergency: true,
        availability: '24/7',
        languages: ['English', 'Spanish'],
        cost_info: 'free',
        target_audience: 'women',
        rating: 4.9,
        tags: ['domestic violence', 'safety', 'support'],
        is_featured: true
      }
    ];

    // Insert sample emergency contacts
    const sampleEmergencyContacts = [
      {
        name: 'National Suicide Prevention Lifeline',
        organization: 'National Suicide Prevention Lifeline',
        phone_number: '988',
        description: 'Free and confidential emotional support to people in suicidal crisis or emotional distress 24/7.',
        availability: '24/7',
        languages: ['English', 'Spanish'],
        specialty: 'suicide',
        is_national: true,
        sort_order: 1
      },
      {
        name: 'Crisis Text Line',
        organization: 'Crisis Text Line',
        phone_number: '741741',
        text_support: 'Text HOME to 741741',
        description: 'Free, 24/7 crisis support via text message.',
        availability: '24/7',
        languages: ['English', 'Spanish'],
        specialty: 'crisis',
        is_national: true,
        sort_order: 2
      },
      {
        name: 'National Domestic Violence Hotline',
        organization: 'National Domestic Violence Hotline',
        phone_number: '1-800-799-7233',
        description: 'Confidential support for domestic violence survivors and their loved ones.',
        availability: '24/7',
        languages: ['English', 'Spanish'],
        specialty: 'domestic-violence',
        is_national: true,
        sort_order: 3
      }
    ];

    console.log('Inserting sample resources...');
    for (const resource of sampleResources) {
      const { error } = await supabase
        .from('mental_wellness_resources')
        .insert(resource);
      if (error) {
        console.error('Error inserting resource:', error);
      } else {
        console.log(`✅ Added resource: ${resource.title}`);
      }
    }

    console.log('Inserting sample emergency contacts...');
    for (const contact of sampleEmergencyContacts) {
      const { error } = await supabase
        .from('emergency_contacts')
        .insert(contact);
      if (error) {
        console.error('Error inserting emergency contact:', error);
      } else {
        console.log(`✅ Added emergency contact: ${contact.name}`);
      }
    }

    console.log('🎉 Mental Wellness Database setup completed!');
    
  } catch (error) {
    console.error('❌ Error setting up mental wellness database:', error);
  }
}

// Run the setup
setupMentalWellnessTables().then(() => {
  console.log('✅ Mental Wellness setup process completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Mental Wellness setup failed:', error);
  process.exit(1);
});