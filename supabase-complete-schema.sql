-- Complete Supabase Database Schema for Nonprofit Life Coaching Platform
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (main user accounts)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4()::text,
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
    join_date TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bookings table (coaching session bookings)
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    coaching_area TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    scheduled_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Weight loss intakes table
CREATE TABLE IF NOT EXISTS weight_loss_intakes (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    age INTEGER,
    current_weight TEXT,
    goal_weight TEXT,
    height TEXT,
    activity_level TEXT,
    dietary_restrictions TEXT[],
    health_conditions TEXT[],
    motivation TEXT,
    experience TEXT,
    challenges TEXT,
    goals TEXT[],
    timeline TEXT,
    budget TEXT,
    preferred_contact TEXT,
    best_time TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    initial TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    url TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Content pages table (CMS)
CREATE TABLE IF NOT EXISTS content_pages (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    content TEXT,
    meta_title TEXT,
    meta_description TEXT,
    is_published BOOLEAN DEFAULT false,
    template TEXT DEFAULT 'default',
    author_id VARCHAR REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Content blocks table (CMS components)
CREATE TABLE IF NOT EXISTS content_blocks (
    id SERIAL PRIMARY KEY,
    page_id INTEGER REFERENCES content_pages(id) ON DELETE CASCADE,
    block_type TEXT NOT NULL,
    title TEXT,
    content TEXT,
    image_url TEXT,
    link_url TEXT,
    link_text TEXT,
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    settings JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Media table (file uploads)
CREATE TABLE IF NOT EXISTS media (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    alt_text TEXT,
    category TEXT,
    uploaded_by VARCHAR REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Navigation menus table
CREATE TABLE IF NOT EXISTS navigation_menus (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    parent_id INTEGER REFERENCES navigation_menus(id),
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_external BOOLEAN DEFAULT false,
    menu_location TEXT DEFAULT 'header',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR UNIQUE NOT NULL,
    value TEXT,
    type TEXT DEFAULT 'text',
    description TEXT,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR REFERENCES users(id),
    amount TEXT NOT NULL,
    currency VARCHAR DEFAULT 'USD',
    donation_type TEXT NOT NULL,
    payment_method TEXT,
    stripe_payment_intent_id VARCHAR,
    stripe_customer_id VARCHAR,
    message TEXT,
    status TEXT DEFAULT 'pending',
    is_recurring BOOLEAN DEFAULT false,
    recurring_interval TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    title TEXT NOT NULL,
    description TEXT,
    goal_amount DECIMAL,
    current_amount DECIMAL DEFAULT 0,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Reward transactions table
CREATE TABLE IF NOT EXISTS reward_transactions (
    id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR REFERENCES users(id),
    donation_id VARCHAR REFERENCES donations(id),
    type TEXT NOT NULL,
    points INTEGER NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Member benefits table
CREATE TABLE IF NOT EXISTS member_benefits (
    id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    membership_level TEXT NOT NULL,
    benefit_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Impact metrics table
CREATE TABLE IF NOT EXISTS impact_metrics (
    id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR REFERENCES users(id),
    metric_type TEXT NOT NULL,
    value DECIMAL NOT NULL,
    description TEXT,
    date_recorded TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Donation presets table
CREATE TABLE IF NOT EXISTS donation_presets (
    id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    amount TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    is_popular BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Coaches table
CREATE TABLE IF NOT EXISTS coaches (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id),
    coach_id VARCHAR UNIQUE NOT NULL,
    email VARCHAR NOT NULL,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'active',
    phone VARCHAR,
    profile_image VARCHAR,
    bio TEXT,
    specialties TEXT[],
    certifications TEXT[],
    experience_years INTEGER,
    hourly_rate DECIMAL,
    languages VARCHAR[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Coach credentials table
CREATE TABLE IF NOT EXISTS coach_credentials (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER REFERENCES coaches(id) ON DELETE CASCADE,
    credential_type VARCHAR NOT NULL,
    credential_name VARCHAR NOT NULL,
    issuing_organization VARCHAR,
    issue_date DATE,
    expiry_date DATE,
    credential_number VARCHAR,
    verification_status VARCHAR DEFAULT 'pending',
    document_url VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Coach banking table
CREATE TABLE IF NOT EXISTS coach_banking (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER REFERENCES coaches(id) ON DELETE CASCADE,
    bank_name VARCHAR,
    account_holder_name VARCHAR,
    account_number VARCHAR,
    routing_number VARCHAR,
    account_type VARCHAR DEFAULT 'checking',
    payment_method VARCHAR DEFAULT 'direct_deposit',
    tax_id VARCHAR,
    quickbooks_vendor_id VARCHAR,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Coach availability table
CREATE TABLE IF NOT EXISTS coach_availability (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER REFERENCES coaches(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR DEFAULT 'America/New_York',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Coach clients table
CREATE TABLE IF NOT EXISTS coach_clients (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER REFERENCES coaches(id) ON DELETE CASCADE,
    client_id VARCHAR NOT NULL,
    assignment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR DEFAULT 'active',
    specialty_area VARCHAR,
    notes TEXT,
    last_contact_date DATE,
    next_scheduled_session TIMESTAMP,
    total_sessions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Coach session notes table
CREATE TABLE IF NOT EXISTS coach_session_notes (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER REFERENCES coaches(id) ON DELETE CASCADE,
    client_id VARCHAR NOT NULL,
    session_date TIMESTAMP NOT NULL,
    session_type VARCHAR DEFAULT 'coaching',
    duration_minutes INTEGER,
    notes TEXT,
    goals_discussed TEXT[],
    homework_assigned TEXT,
    next_session_planned TIMESTAMP,
    client_mood_rating INTEGER CHECK (client_mood_rating >= 1 AND client_mood_rating <= 10),
    session_rating INTEGER CHECK (session_rating >= 1 AND session_rating <= 5),
    follow_up_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Coach message templates table
CREATE TABLE IF NOT EXISTS coach_message_templates (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER REFERENCES coaches(id) ON DELETE CASCADE,
    template_name VARCHAR NOT NULL,
    template_type VARCHAR NOT NULL,
    subject VARCHAR,
    message_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Coach client communications table
CREATE TABLE IF NOT EXISTS coach_client_communications (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER REFERENCES coaches(id) ON DELETE CASCADE,
    client_id VARCHAR NOT NULL,
    communication_type VARCHAR NOT NULL,
    subject VARCHAR,
    message_content TEXT,
    sent_date TIMESTAMP DEFAULT NOW(),
    delivery_status VARCHAR DEFAULT 'sent',
    response_received BOOLEAN DEFAULT false,
    n8n_workflow_id VARCHAR,
    external_message_id VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Coach metrics table
CREATE TABLE IF NOT EXISTS coach_metrics (
    id SERIAL PRIMARY KEY,
    coach_id INTEGER REFERENCES coaches(id) ON DELETE CASCADE,
    metric_date DATE DEFAULT CURRENT_DATE,
    total_clients INTEGER DEFAULT 0,
    active_clients INTEGER DEFAULT 0,
    sessions_completed INTEGER DEFAULT 0,
    total_revenue DECIMAL DEFAULT 0,
    average_session_rating DECIMAL,
    response_time_hours DECIMAL,
    client_retention_rate DECIMAL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample data for testing
INSERT INTO testimonials (name, initial, category, content, rating, is_approved) VALUES
('Sarah Johnson', 'S.J.', 'Life Coaching', 'Amazing coaching experience! Life-changing results.', 5, true),
('Mike Davis', 'M.D.', 'Weight Loss', 'Professional and supportive. Highly recommend!', 5, true),
('Emily Chen', 'E.C.', 'Career Coaching', 'Helped me find my true calling and build confidence.', 5, true);

INSERT INTO resources (title, description, type, category, url, is_featured) VALUES
('Healthy Eating Guide', 'Complete guide to nutritious eating', 'guide', 'nutrition', '/resources/healthy-eating', true),
('Workout Routines', 'Beginner-friendly exercise plans', 'workout', 'fitness', '/resources/workouts', true),
('Mindfulness Meditation', 'Daily meditation practices for mental wellness', 'audio', 'mental-health', '/resources/meditation', true);

INSERT INTO donation_presets (amount, label, description, is_popular, sort_order, is_active) VALUES
('25', '$25', 'Support one coaching session', false, 1, true),
('50', '$50', 'Fund wellness resources', true, 2, true),
('100', '$100', 'Sponsor a month of coaching', true, 3, true),
('250', '$250', 'Champion supporter level', false, 4, true);

INSERT INTO campaigns (title, description, goal_amount, current_amount, is_active, sort_order) VALUES
('Mental Health Support', 'Provide free coaching sessions to those in need', 10000, 2500, true, 1),
('Wellness Resource Library', 'Build comprehensive wellness resources', 5000, 1200, true, 2),
('Community Outreach Program', 'Expand coaching services to underserved communities', 15000, 3500, true, 3);

INSERT INTO site_settings (key, value, type, description, category) VALUES
('site_title', 'Whole Wellness Nonprofit', 'text', 'Main site title', 'general'),
('site_description', 'Empowering lives through holistic wellness coaching', 'text', 'Site description for SEO', 'general'),
('contact_email', 'hello@wholewellness.org', 'email', 'Main contact email', 'contact'),
('contact_phone', '(555) 123-4567', 'text', 'Main contact phone', 'contact'),
('stripe_public_key', '', 'text', 'Stripe publishable key', 'payment'),
('stripe_secret_key', '', 'password', 'Stripe secret key', 'payment');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_coaches_user_id ON coaches(user_id);
CREATE INDEX IF NOT EXISTS idx_coaches_status ON coaches(status);
CREATE INDEX IF NOT EXISTS idx_coach_clients_coach_id ON coach_clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_clients_client_id ON coach_clients(client_id);

-- Enable Row Level Security (RLS) for better security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (you may want to customize these)
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid()::text = id);

-- Allow public read access to approved testimonials and resources
CREATE POLICY "Public can view approved testimonials" ON testimonials FOR SELECT USING (is_approved = true);
CREATE POLICY "Public can view resources" ON resources FOR SELECT USING (true);

-- Allow public insert for bookings and contacts (contact forms)
CREATE POLICY "Public can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create contacts" ON contacts FOR INSERT WITH CHECK (true);

COMMENT ON TABLE users IS 'Main user accounts for the platform';
COMMENT ON TABLE bookings IS 'Coaching session booking requests';
COMMENT ON TABLE testimonials IS 'Client testimonials and reviews';
COMMENT ON TABLE resources IS 'Educational resources and content';
COMMENT ON TABLE donations IS 'Donation transactions and records';
COMMENT ON TABLE coaches IS 'Certified coaches on the platform';
COMMENT ON TABLE campaigns IS 'Fundraising campaigns';