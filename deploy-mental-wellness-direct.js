import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwuwmnivvdvdxdewynbo.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
  throw new Error('SUPABASE_KEY environment variable is required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deployMentalWellnessTables() {
  console.log('🚀 Deploying Mental Wellness Tables...');

  try {
    // Insert sample mental wellness resources
    console.log('Inserting sample mental wellness resources...');
    const resources = [
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
      {
        title: 'Anxiety and Depression Association of America',
        description: 'Comprehensive resource for anxiety and depression information, self-help tools, and professional support.',
        category: 'anxiety',
        resource_type: 'website',
        url: 'https://adaa.org',
        is_emergency: false,
        availability: '24/7',
        languages: ['English'],
        cost_info: 'free',
        target_audience: 'general',
        rating: 4.5,
        tags: ['anxiety', 'depression', 'self-help'],
        is_featured: true
      },
      {
        title: 'National Alliance on Mental Illness (NAMI)',
        description: 'Education, support, and advocacy for individuals and families affected by mental illness.',
        category: 'depression',
        resource_type: 'website',
        url: 'https://nami.org',
        is_emergency: false,
        availability: '24/7',
        languages: ['English', 'Spanish'],
        cost_info: 'free',
        target_audience: 'general',
        rating: 4.7,
        tags: ['depression', 'support', 'advocacy'],
        is_featured: true
      },
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
      },
      {
        title: 'Mindfulness-Based Stress Reduction (MBSR)',
        description: 'Evidence-based program for reducing stress and improving well-being through mindfulness meditation.',
        category: 'stress',
        resource_type: 'program',
        url: 'https://www.mindfulnesscds.com',
        is_emergency: false,
        availability: 'Varies by location',
        languages: ['English'],
        cost_info: 'varies',
        target_audience: 'general',
        rating: 4.4,
        tags: ['mindfulness', 'stress', 'meditation'],
        is_featured: false
      },
      {
        title: 'BetterHelp Online Therapy',
        description: 'Professional online therapy and counseling with licensed therapists.',
        category: 'therapy',
        resource_type: 'website',
        url: 'https://www.betterhelp.com',
        is_emergency: false,
        availability: '24/7',
        languages: ['English', 'Spanish'],
        cost_info: 'paid',
        target_audience: 'general',
        rating: 4.3,
        tags: ['therapy', 'counseling', 'online'],
        is_featured: true
      },
      {
        title: 'Headspace Meditation App',
        description: 'Guided meditation and mindfulness app with programs for stress, sleep, and focus.',
        category: 'mindfulness',
        resource_type: 'app',
        url: 'https://www.headspace.com',
        is_emergency: false,
        availability: '24/7',
        languages: ['English', 'Spanish', 'French'],
        cost_info: 'freemium',
        target_audience: 'general',
        rating: 4.5,
        tags: ['meditation', 'mindfulness', 'app'],
        is_featured: true
      }
    ];

    const { data: resourcesData, error: resourcesError } = await supabase
      .from('mental_wellness_resources')
      .insert(resources);

    if (resourcesError) {
      console.error('Error inserting resources:', resourcesError);
    } else {
      console.log('✅ Mental wellness resources inserted successfully');
    }

    // Insert sample emergency contacts
    console.log('Inserting sample emergency contacts...');
    const emergencyContacts = [
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
      },
      {
        name: 'SAMHSA National Helpline',
        organization: 'SAMHSA',
        phone_number: '1-800-662-4357',
        description: 'Treatment referral and information service for individuals and families facing mental health and substance use disorders.',
        availability: '24/7',
        languages: ['English', 'Spanish'],
        specialty: 'mental-health',
        is_national: true,
        sort_order: 4
      },
      {
        name: 'National Sexual Assault Hotline',
        organization: 'RAINN',
        phone_number: '1-800-656-4673',
        description: 'Free, confidential support for survivors of sexual violence and their loved ones.',
        availability: '24/7',
        languages: ['English', 'Spanish'],
        specialty: 'sexual-assault',
        is_national: true,
        sort_order: 5
      }
    ];

    const { data: contactsData, error: contactsError } = await supabase
      .from('emergency_contacts')
      .insert(emergencyContacts);

    if (contactsError) {
      console.error('Error inserting emergency contacts:', contactsError);
    } else {
      console.log('✅ Emergency contacts inserted successfully');
    }

    console.log('🎉 Mental wellness hub deployment completed successfully!');
    
  } catch (error) {
    console.error('Deployment failed:', error);
  }
}

deployMentalWellnessTables();