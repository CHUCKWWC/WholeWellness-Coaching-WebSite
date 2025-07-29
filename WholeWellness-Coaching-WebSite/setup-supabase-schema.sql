-- Setup script for Supabase database schema
-- Run this in your Supabase SQL editor

-- Users table
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

-- Bookings table
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

-- Weight loss intakes table
CREATE TABLE IF NOT EXISTS weight_loss_intakes (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    age INTEGER NOT NULL,
    height TEXT NOT NULL,
    current_weight TEXT NOT NULL,
    goal_weight TEXT NOT NULL,
    medical_conditions TEXT,
    medications TEXT,
    allergies TEXT,
    digestive_issues TEXT,
    physical_limitations TEXT,
    weight_loss_medications TEXT,
    weight_history TEXT,
    previous_attempts TEXT,
    challenging_aspects TEXT,
    current_eating_habits TEXT,
    lifestyle TEXT,
    activity_level TEXT,
    mindset_factors TEXT,
    goals_expectations TEXT,
    interested_in_supplements BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials table
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

-- Resources table
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

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content pages table
CREATE TABLE IF NOT EXISTS content_pages (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    is_published BOOLEAN DEFAULT false,
    featured_image TEXT,
    author TEXT,
    page_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content blocks table
CREATE TABLE IF NOT EXISTS content_blocks (
    id SERIAL PRIMARY KEY,
    page_id INTEGER REFERENCES content_pages(id) ON DELETE CASCADE,
    block_type TEXT NOT NULL,
    title TEXT,
    content TEXT,
    image_url TEXT,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media library table
CREATE TABLE IF NOT EXISTS media_library (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    url TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    alt_text TEXT,
    category TEXT,
    uploaded_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Navigation menus table
CREATE TABLE IF NOT EXISTS navigation_menus (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    parent_id INTEGER REFERENCES navigation_menus(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_external BOOLEAN DEFAULT false,
    menu_location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    type TEXT,
    description TEXT,
    category TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample data for testing
INSERT INTO testimonials (name, initial, category, content, rating, is_approved) VALUES
('Sarah Johnson', 'S.J.', 'Life Coaching', 'Amazing coaching experience! Life-changing results.', 5, true),
('Mike Davis', 'M.D.', 'Weight Loss', 'Professional and supportive. Highly recommend!', 5, true)
ON CONFLICT DO NOTHING;

INSERT INTO resources (title, type, category, content, url, is_free) VALUES
('Healthy Eating Guide', 'guide', 'nutrition', 'Complete guide to nutritious eating', '/resources/healthy-eating', true),
('Workout Routines', 'workout', 'fitness', 'Beginner-friendly exercise plans', '/resources/workouts', true)
ON CONFLICT DO NOTHING;

INSERT INTO content_pages (title, slug, content, is_published) VALUES
('About Us', 'about', 'Learn about our mission and values', true),
('Services', 'services', 'Discover our coaching services', true)
ON CONFLICT DO NOTHING;