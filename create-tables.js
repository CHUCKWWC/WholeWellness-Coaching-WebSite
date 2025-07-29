import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwuwmnivvdvdxdewynbo.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('Creating database tables...');

  try {
    // Create testimonials table first since it's causing the immediate error
    const { data, error } = await supabase.rpc('sql', {
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

        INSERT INTO testimonials (name, initial, category, content, rating, is_approved) VALUES
        ('Sarah Johnson', 'S.J.', 'Life Coaching', 'Amazing coaching experience! Life-changing results.', 5, true),
        ('Mike Davis', 'M.D.', 'Weight Loss', 'Professional and supportive. Highly recommend!', 5, true)
        ON CONFLICT DO NOTHING;
      `
    });

    if (error) {
      console.error('Error creating testimonials table:', error);
    } else {
      console.log('Testimonials table created successfully');
    }

    // Create other essential tables
    const { data: tablesData, error: tablesError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS bookings (
          id SERIAL PRIMARY KEY,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          coaching_area TEXT NOT NULL,
          message TEXT,
          status TEXT DEFAULT 'pending',
          scheduled_date TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS resources (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          category TEXT NOT NULL,
          content TEXT NOT NULL,
          url TEXT,
          is_free BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS contacts (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          subject TEXT NOT NULL,
          message TEXT NOT NULL,
          status TEXT DEFAULT 'new',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        INSERT INTO resources (title, type, category, content, url, is_free) VALUES
        ('Healthy Eating Guide', 'guide', 'nutrition', 'Complete guide to nutritious eating', '/resources/healthy-eating', true),
        ('Workout Routines', 'workout', 'fitness', 'Beginner-friendly exercise plans', '/resources/workouts', true)
        ON CONFLICT DO NOTHING;
      `
    });

    if (tablesError) {
      console.error('Error creating other tables:', tablesError);
    } else {
      console.log('All tables created successfully');
    }

  } catch (error) {
    console.error('Database setup failed:', error);
  }
}

createTables();