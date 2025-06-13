import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwuwmnivvdvdxdewynbo.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseIntegration() {
  console.log('Testing Supabase integration...');

  try {
    // Test 1: Create and test testimonials table
    console.log('\n1. Testing testimonials functionality...');
    
    // Try to insert a test testimonial
    const { data: testimonialData, error: testimonialError } = await supabase
      .from('testimonials')
      .insert({
        name: 'Test User',
        initial: 'T.U.',
        category: 'Life Coaching',
        content: 'This is a test testimonial',
        rating: 5,
        is_approved: true
      })
      .select()
      .single();

    if (testimonialError) {
      console.error('Testimonials table error:', testimonialError);
      // Table doesn't exist, this is expected for a fresh database
    } else {
      console.log('✓ Testimonials table works:', testimonialData);
    }

    // Test 2: Check what tables exist
    console.log('\n2. Checking existing tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
    } else {
      console.log('Existing tables:', tables?.map(t => t.table_name) || []);
    }

    // Test 3: Test basic connectivity
    console.log('\n3. Testing basic Supabase connectivity...');
    const { data: testData, error: testError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .limit(5);

    if (testError) {
      console.error('Connectivity test failed:', testError);
    } else {
      console.log('✓ Supabase connection successful');
      console.log('Available system tables:', testData?.length || 0);
    }

    // Test 4: Test storage interface directly
    console.log('\n4. Testing storage interface...');
    
    // Import and test our storage implementation
    const { SupabaseClientStorage } = await import('./server/supabase-client-storage.js');
    const storage = new SupabaseClientStorage();
    
    try {
      const testimonials = await storage.getApprovedTestimonials();
      console.log('✓ Storage interface works, testimonials found:', testimonials.length);
    } catch (storageError) {
      console.log('Storage interface error (expected for new DB):', storageError.message);
    }

    console.log('\n✅ Supabase integration test completed');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSupabaseIntegration();