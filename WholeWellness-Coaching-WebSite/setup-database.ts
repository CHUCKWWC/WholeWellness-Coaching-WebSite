import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function setupDatabase() {
  console.log('Setting up database tables...');
  
  try {
    // Create all necessary tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY,
        email VARCHAR NOT NULL UNIQUE,
        password_hash VARCHAR NOT NULL,
        first_name VARCHAR,
        last_name VARCHAR,
        membership_level VARCHAR,
        donation_total VARCHAR,
        reward_points INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        email VARCHAR NOT NULL,
        phone VARCHAR,
        service VARCHAR NOT NULL,
        preferred_date TIMESTAMP,
        message TEXT,
        status VARCHAR DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        content TEXT NOT NULL,
        rating INTEGER,
        is_approved BOOLEAN DEFAULT false,
        location VARCHAR,
        service_type VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS resources (
        id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        description TEXT,
        type VARCHAR NOT NULL,
        category VARCHAR,
        url VARCHAR,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        email VARCHAR NOT NULL,
        subject VARCHAR,
        message TEXT NOT NULL,
        status VARCHAR DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS weight_loss_intakes (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        email VARCHAR NOT NULL,
        age INTEGER,
        current_weight DECIMAL,
        goal_weight DECIMAL,
        height VARCHAR,
        activity_level VARCHAR,
        dietary_restrictions TEXT[],
        health_conditions TEXT[],
        medications TEXT[],
        goals TEXT[],
        timeline VARCHAR,
        budget_range VARCHAR,
        previous_attempts TEXT,
        motivation TEXT,
        support_system VARCHAR,
        challenges TEXT[],
        preferred_contact VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // CMS tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS content_pages (
        id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        slug VARCHAR NOT NULL UNIQUE,
        content TEXT,
        meta_title VARCHAR,
        meta_description TEXT,
        is_published BOOLEAN DEFAULT false,
        author_id VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS content_blocks (
        id SERIAL PRIMARY KEY,
        page_id INTEGER REFERENCES content_pages(id) ON DELETE CASCADE,
        type VARCHAR NOT NULL,
        content TEXT,
        order_index INTEGER DEFAULT 0,
        settings JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS media_library (
        id SERIAL PRIMARY KEY,
        filename VARCHAR NOT NULL,
        original_name VARCHAR NOT NULL,
        mime_type VARCHAR NOT NULL,
        size INTEGER NOT NULL,
        alt_text VARCHAR,
        caption TEXT,
        category VARCHAR,
        url VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS navigation_menus (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        url VARCHAR NOT NULL,
        label VARCHAR NOT NULL,
        is_active BOOLEAN DEFAULT true,
        order_index INTEGER DEFAULT 0,
        parent_id INTEGER REFERENCES navigation_menus(id),
        is_external BOOLEAN DEFAULT false,
        menu_location VARCHAR DEFAULT 'header',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        key VARCHAR PRIMARY KEY,
        value TEXT,
        category VARCHAR DEFAULT 'general',
        description TEXT,
        data_type VARCHAR DEFAULT 'string',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample data for testing
    await db.execute(sql`
      INSERT INTO testimonials (name, content, rating, is_approved, location, service_type) 
      VALUES 
        ('Sarah Johnson', 'Amazing coaching experience! Life-changing results.', 5, true, 'New York', 'Life Coaching'),
        ('Mike Davis', 'Professional and supportive. Highly recommend!', 5, true, 'California', 'Weight Loss')
      ON CONFLICT DO NOTHING
    `);

    await db.execute(sql`
      INSERT INTO resources (title, description, type, category, url, is_featured)
      VALUES
        ('Healthy Eating Guide', 'Complete guide to nutritious eating', 'guide', 'nutrition', '/resources/healthy-eating', true),
        ('Workout Routines', 'Beginner-friendly exercise plans', 'workout', 'fitness', '/resources/workouts', true)
      ON CONFLICT DO NOTHING
    `);

    await db.execute(sql`
      INSERT INTO content_pages (title, slug, content, is_published)
      VALUES
        ('About Us', 'about', 'Learn about our mission and values', true),
        ('Services', 'services', 'Discover our coaching services', true)
      ON CONFLICT DO NOTHING
    `);

    console.log('Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();