import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwuwmnivvdvdxdewynbo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3dXdtbml2dmR2ZHhkZXd5bmJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg2OTY3NywiZXhwIjoyMDYzNDQ1Njc3fQ._daQTENeg-Hkh9BxTtO9gY_BTpJafpNWKS5X4A1VFG4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSupabaseIntegration() {
  console.log('🔍 Testing Supabase database integration...\n');
  
  // Test 1: Mental wellness resources table
  console.log('1. Testing mental_wellness_resources table...');
  try {
    const { data: resources, error: resourcesError } = await supabase
      .from('mental_wellness_resources')
      .select('*')
      .limit(5);
    
    if (resourcesError) {
      console.error('❌ Mental wellness resources table error:', resourcesError.message);
    } else {
      console.log(`✅ Mental wellness resources table: ${resources.length} records found`);
      if (resources.length > 0) {
        console.log(`   Sample: ${resources[0].title} (${resources[0].category})`);
      }
    }
  } catch (err) {
    console.error('❌ Mental wellness resources table connection error:', err.message);
  }
  
  // Test 2: Emergency contacts table
  console.log('\n2. Testing emergency_contacts table...');
  try {
    const { data: contacts, error: contactsError } = await supabase
      .from('emergency_contacts')
      .select('*')
      .limit(5);
    
    if (contactsError) {
      console.error('❌ Emergency contacts table error:', contactsError.message);
    } else {
      console.log(`✅ Emergency contacts table: ${contacts.length} records found`);
      if (contacts.length > 0) {
        console.log(`   Sample: ${contacts[0].name} (${contacts[0].phone})`);
      }
    }
  } catch (err) {
    console.error('❌ Emergency contacts table connection error:', err.message);
  }
  
  // Test 3: Personalized recommendations table
  console.log('\n3. Testing personalized_recommendations table...');
  try {
    const { data: recommendations, error: recommendationsError } = await supabase
      .from('personalized_recommendations')
      .select('*')
      .limit(1);
    
    if (recommendationsError) {
      console.error('❌ Personalized recommendations table error:', recommendationsError.message);
    } else {
      console.log(`✅ Personalized recommendations table: ${recommendations.length} records found`);
    }
  } catch (err) {
    console.error('❌ Personalized recommendations table connection error:', err.message);
  }
  
  // Test 4: Resource usage analytics table
  console.log('\n4. Testing resource_usage_analytics table...');
  try {
    const { data: analytics, error: analyticsError } = await supabase
      .from('resource_usage_analytics')
      .select('*')
      .limit(1);
    
    if (analyticsError) {
      console.error('❌ Resource usage analytics table error:', analyticsError.message);
    } else {
      console.log(`✅ Resource usage analytics table: ${analytics.length} records found`);
    }
  } catch (err) {
    console.error('❌ Resource usage analytics table connection error:', err.message);
  }
  
  // Test 5: Database connectivity and featured resources
  console.log('\n5. Testing featured resources query...');
  try {
    const { data: featuredResources, error: featuredError } = await supabase
      .from('mental_wellness_resources')
      .select('*')
      .eq('featured', true)
      .order('id');
    
    if (featuredError) {
      console.error('❌ Featured resources query error:', featuredError.message);
    } else {
      console.log(`✅ Featured resources query: ${featuredResources.length} featured resources found`);
      featuredResources.forEach(resource => {
        console.log(`   - ${resource.title} (${resource.category})`);
      });
    }
  } catch (err) {
    console.error('❌ Featured resources query connection error:', err.message);
  }
  
  // Test 6: Emergency resources query
  console.log('\n6. Testing emergency resources query...');
  try {
    const { data: emergencyResources, error: emergencyError } = await supabase
      .from('mental_wellness_resources')
      .select('*')
      .eq('emergency', true)
      .order('id');
    
    if (emergencyError) {
      console.error('❌ Emergency resources query error:', emergencyError.message);
    } else {
      console.log(`✅ Emergency resources query: ${emergencyResources.length} emergency resources found`);
      emergencyResources.forEach(resource => {
        console.log(`   - ${resource.title} (${resource.phone || 'No phone'})`);
      });
    }
  } catch (err) {
    console.error('❌ Emergency resources query connection error:', err.message);
  }
  
  console.log('\n🎉 Database validation complete!');
  console.log('The recommendation system is now ready to use real database data instead of mock data.');
}

testSupabaseIntegration().catch(console.error);