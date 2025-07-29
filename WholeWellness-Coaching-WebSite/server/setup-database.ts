import { supabase } from "./supabase";

async function setupDatabase() {
  console.log('Setting up Supabase database schema...');

  try {
    // Create users table
    const { error: usersError } = await supabase.rpc('exec', {
      query: `
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
          email VARCHAR UNIQUE NOT NULL,
          password_hash VARCHAR NOT NULL,
          first_name VARCHAR,
          last_name VARCHAR,
          membership_level VARCHAR DEFAULT 'free',
          donation_total DECIMAL DEFAULT 0,
          reward_points INTEGER DEFAULT 0,
          stripe_customer_id VARCHAR,
          profile_image_url VARCHAR,
          is_active BOOLEAN DEFAULT true,
          join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_login TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (usersError) console.error('Users table error:', usersError);

    // Create testimonials table
    const { error: testimonialsError } = await supabase.rpc('exec', {
      query: `
        CREATE TABLE IF NOT EXISTS testimonials (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          initial TEXT NOT NULL,
          category TEXT NOT NULL,
          content TEXT NOT NULL,
          rating INTEGER NOT NULL,
          is_approved BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (testimonialsError) console.error('Testimonials table error:', testimonialsError);

    // Insert sample testimonials
    const { error: sampleDataError } = await supabase
      .from('testimonials')
      .upsert([
        {
          name: 'Sarah Johnson',
          initial: 'S.J.',
          category: 'Life Coaching',
          content: 'Amazing coaching experience! Life-changing results.',
          rating: 5,
          is_approved: true
        },
        {
          name: 'Mike Davis',
          initial: 'M.D.',
          category: 'Weight Loss',
          content: 'Professional and supportive. Highly recommend!',
          rating: 5,
          is_approved: true
        }
      ], { onConflict: 'name' });

    if (sampleDataError) console.error('Sample data error:', sampleDataError);

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Database setup failed:', error);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

export { setupDatabase };