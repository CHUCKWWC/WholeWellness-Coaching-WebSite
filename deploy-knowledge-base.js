import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// Create connection
const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 20,
  idle_timeout: 30,
  connect_timeout: 60,
  prepare: false
});

console.log('🚀 Setting up Knowledge Base tables...');

async function deployKnowledgeBaseTables() {
  try {
    // Drop tables if they exist (for clean setup)
    console.log('📋 Dropping existing knowledge base tables if they exist...');
    await sql`DROP TABLE IF EXISTS knowledge_base_search CASCADE`;
    await sql`DROP TABLE IF EXISTS knowledge_base_views CASCADE`;
    await sql`DROP TABLE IF EXISTS knowledge_base_feedback CASCADE`;
    await sql`DROP TABLE IF EXISTS knowledge_base_categories CASCADE`;
    await sql`DROP TABLE IF EXISTS knowledge_base CASCADE`;
    
    // Create knowledge_base table
    console.log('📝 Creating knowledge_base table...');
    await sql`
      CREATE TABLE knowledge_base (
        id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        slug VARCHAR UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        category VARCHAR NOT NULL,
        subcategory VARCHAR,
        tags JSONB DEFAULT '[]'::jsonb,
        status VARCHAR DEFAULT 'published',
        priority INTEGER DEFAULT 0,
        difficulty VARCHAR,
        estimated_read_time INTEGER,
        view_count INTEGER DEFAULT 0,
        helpful_count INTEGER DEFAULT 0,
        not_helpful_count INTEGER DEFAULT 0,
        search_keywords TEXT,
        related_articles JSONB DEFAULT '[]'::jsonb,
        featured_image TEXT,
        meta_description TEXT,
        meta_keywords TEXT,
        author_id VARCHAR REFERENCES users(id),
        author_name VARCHAR DEFAULT 'Admin',
        last_reviewed_by VARCHAR REFERENCES users(id),
        last_reviewed_at TIMESTAMP WITH TIME ZONE,
        is_public BOOLEAN DEFAULT TRUE,
        requires_auth BOOLEAN DEFAULT FALSE,
        target_audience VARCHAR DEFAULT 'general',
        language VARCHAR DEFAULT 'en',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    // Create knowledge_base_categories table
    console.log('📂 Creating knowledge_base_categories table...');
    await sql`
      CREATE TABLE knowledge_base_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        slug VARCHAR UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR,
        color VARCHAR,
        parent_id INTEGER REFERENCES knowledge_base_categories(id),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    // Create knowledge_base_feedback table
    console.log('💬 Creating knowledge_base_feedback table...');
    await sql`
      CREATE TABLE knowledge_base_feedback (
        id SERIAL PRIMARY KEY,
        article_id INTEGER REFERENCES knowledge_base(id) NOT NULL,
        user_id VARCHAR REFERENCES users(id),
        session_id VARCHAR,
        was_helpful BOOLEAN NOT NULL,
        feedback TEXT,
        improvement_suggestions TEXT,
        user_agent TEXT,
        ip_address VARCHAR,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    // Create knowledge_base_views table
    console.log('👀 Creating knowledge_base_views table...');
    await sql`
      CREATE TABLE knowledge_base_views (
        id SERIAL PRIMARY KEY,
        article_id INTEGER REFERENCES knowledge_base(id) NOT NULL,
        user_id VARCHAR REFERENCES users(id),
        session_id VARCHAR,
        view_duration INTEGER,
        completed_reading BOOLEAN DEFAULT FALSE,
        exit_point VARCHAR,
        referrer TEXT,
        user_agent TEXT,
        ip_address VARCHAR,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    // Create knowledge_base_search table
    console.log('🔍 Creating knowledge_base_search table...');
    await sql`
      CREATE TABLE knowledge_base_search (
        id SERIAL PRIMARY KEY,
        query TEXT NOT NULL,
        user_id VARCHAR REFERENCES users(id),
        session_id VARCHAR,
        results_count INTEGER DEFAULT 0,
        selected_result_id INTEGER REFERENCES knowledge_base(id),
        was_successful BOOLEAN DEFAULT FALSE,
        user_agent TEXT,
        ip_address VARCHAR,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    // Create indexes
    console.log('📊 Creating indexes for better performance...');
    await sql`CREATE INDEX idx_knowledge_base_category ON knowledge_base(category)`;
    await sql`CREATE INDEX idx_knowledge_base_status ON knowledge_base(status)`;
    await sql`CREATE INDEX idx_knowledge_base_slug ON knowledge_base(slug)`;
    await sql`CREATE INDEX idx_knowledge_base_tags ON knowledge_base USING GIN(tags)`;
    await sql`CREATE INDEX idx_knowledge_base_created_at ON knowledge_base(created_at)`;
    await sql`CREATE INDEX idx_knowledge_base_priority ON knowledge_base(priority DESC)`;
    await sql`CREATE INDEX idx_knowledge_base_view_count ON knowledge_base(view_count DESC)`;
    
    await sql`CREATE INDEX idx_knowledge_base_categories_parent ON knowledge_base_categories(parent_id)`;
    await sql`CREATE INDEX idx_knowledge_base_categories_slug ON knowledge_base_categories(slug)`;
    await sql`CREATE INDEX idx_knowledge_base_categories_active ON knowledge_base_categories(is_active)`;
    
    await sql`CREATE INDEX idx_knowledge_base_feedback_article ON knowledge_base_feedback(article_id)`;
    await sql`CREATE INDEX idx_knowledge_base_feedback_user ON knowledge_base_feedback(user_id)`;
    await sql`CREATE INDEX idx_knowledge_base_feedback_helpful ON knowledge_base_feedback(was_helpful)`;
    
    await sql`CREATE INDEX idx_knowledge_base_views_article ON knowledge_base_views(article_id)`;
    await sql`CREATE INDEX idx_knowledge_base_views_user ON knowledge_base_views(user_id)`;
    await sql`CREATE INDEX idx_knowledge_base_views_created ON knowledge_base_views(created_at)`;
    
    await sql`CREATE INDEX idx_knowledge_base_search_query ON knowledge_base_search(query)`;
    await sql`CREATE INDEX idx_knowledge_base_search_user ON knowledge_base_search(user_id)`;
    await sql`CREATE INDEX idx_knowledge_base_search_created ON knowledge_base_search(created_at)`;
    
    // Create full-text search index
    console.log('🔍 Creating full-text search index...');
    await sql`
      CREATE INDEX idx_knowledge_base_search_content ON knowledge_base 
      USING GIN(to_tsvector('english', title || ' ' || content || ' ' || COALESCE(excerpt, '') || ' ' || COALESCE(search_keywords, '')))
    `;
    
    // Create trigger function for updated_at
    console.log('⚙️  Creating trigger function for updated_at...');
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    
    // Create triggers
    await sql`
      CREATE TRIGGER update_knowledge_base_updated_at 
      BEFORE UPDATE ON knowledge_base
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `;
    
    await sql`
      CREATE TRIGGER update_knowledge_base_categories_updated_at 
      BEFORE UPDATE ON knowledge_base_categories
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `;
    
    console.log('✅ Knowledge base tables created successfully!');
    console.log('📚 Inserting sample data...');
    
    // Insert sample categories
    await sql`
      INSERT INTO knowledge_base_categories (name, slug, description, icon, color, sort_order) VALUES
      ('FAQ', 'faq', 'Frequently Asked Questions', '❓', '#3B82F6', 1),
      ('Getting Started', 'getting-started', 'Guides for new users', '🚀', '#10B981', 2),
      ('Coaching', 'coaching', 'Information about coaching services', '🎯', '#8B5CF6', 3),
      ('Account Management', 'account-management', 'Managing your account and profile', '👤', '#F59E0B', 4),
      ('Payment & Billing', 'payment-billing', 'Payment processing and billing information', '💳', '#EF4444', 5),
      ('Technical Support', 'technical-support', 'Technical help and troubleshooting', '🔧', '#6B7280', 6),
      ('Privacy & Security', 'privacy-security', 'Privacy policy and security information', '🔒', '#374151', 7),
      ('Resources', 'resources', 'Educational resources and tools', '📚', '#059669', 8)
    `;
    
    // Insert sample knowledge base articles
    await sql`
      INSERT INTO knowledge_base (title, slug, content, excerpt, category, subcategory, tags, difficulty, estimated_read_time, search_keywords, is_public, target_audience, author_name) VALUES
      (
        'How to Get Started with Whole Wellness Coaching',
        'getting-started-guide',
        '<h2>Welcome to Whole Wellness Coaching</h2>
        <p>Getting started with our platform is easy and designed to help you begin your wellness journey right away.</p>
        
        <h3>Step 1: Create Your Account</h3>
        <p>Visit our homepage and click "Get Started" to begin the registration process. You''ll need to provide basic information and create a secure password.</p>
        
        <h3>Step 2: Complete Your Profile</h3>
        <p>Fill out your wellness profile to help us understand your goals and preferences. This information helps us match you with the right coach and resources.</p>
        
        <h3>Step 3: Choose Your Services</h3>
        <p>Select from our AI coaching options or book a session with a professional coach. We offer both individual and group coaching sessions.</p>
        
        <h3>Step 4: Start Your Journey</h3>
        <p>Begin with our personalized recommendations and start engaging with your chosen coaching services.</p>
        
        <p>If you need help at any point, our support team is here to assist you.</p>',
        'Learn how to get started with our wellness coaching platform in just a few simple steps.',
        'Getting Started',
        'new-user',
        '["getting started", "onboarding", "new user", "setup"]',
        'beginner',
        3,
        'getting started new user onboarding setup account registration',
        true,
        'general',
        'Support Team'
      ),
      (
        'What is AI Coaching?',
        'what-is-ai-coaching',
        '<h2>Understanding AI Coaching</h2>
        <p>AI Coaching at Whole Wellness Coaching combines artificial intelligence with evidence-based coaching techniques to provide personalized support.</p>
        
        <h3>How It Works</h3>
        <p>Our AI coaches are trained on proven wellness methodologies and can provide 24/7 support for various aspects of your wellness journey including:</p>
        <ul>
            <li>Weight loss and nutrition guidance</li>
            <li>Fitness and exercise planning</li>
            <li>Behavioral change support</li>
            <li>Wellness coordination</li>
            <li>Accountability and motivation</li>
            <li>Meal prep assistance</li>
        </ul>
        
        <h3>Benefits of AI Coaching</h3>
        <ul>
            <li>Available 24/7 for instant support</li>
            <li>Personalized recommendations based on your profile</li>
            <li>Consistent tracking and progress monitoring</li>
            <li>Cost-effective wellness support</li>
            <li>Complements professional coaching services</li>
        </ul>
        
        <h3>Getting Started</h3>
        <p>To begin with AI coaching, simply visit our AI Coaching page and select the coach that best matches your needs. Each AI coach specializes in different areas of wellness.</p>',
        'Learn about our AI coaching services and how they can support your wellness journey.',
        'Coaching',
        'ai-coaching',
        '["AI coaching", "artificial intelligence", "wellness", "24/7 support"]',
        'beginner',
        5,
        'AI coaching artificial intelligence wellness support 24/7 personalized',
        true,
        'general',
        'Coaching Team'
      ),
      (
        'Understanding Our Membership Levels',
        'membership-levels',
        '<h2>Membership Levels and Benefits</h2>
        <p>Whole Wellness Coaching offers different membership levels to provide flexible support options for your wellness journey.</p>
        
        <h3>Free Membership</h3>
        <p>All users start with a free membership that includes:</p>
        <ul>
            <li>Access to basic AI coaching features</li>
            <li>Limited professional coaching sessions</li>
            <li>Basic wellness resources</li>
            <li>Community forum access</li>
        </ul>
        
        <h3>Supporter Level ($25/month)</h3>
        <p>Enhanced features for regular users:</p>
        <ul>
            <li>Unlimited AI coaching sessions</li>
            <li>Priority booking for professional coaches</li>
            <li>Access to premium wellness resources</li>
            <li>Monthly group coaching sessions</li>
            <li>Personalized meal planning</li>
        </ul>
        
        <h3>Champion Level ($50/month)</h3>
        <p>Comprehensive support for dedicated users:</p>
        <ul>
            <li>All Supporter benefits</li>
            <li>Weekly one-on-one coaching sessions</li>
            <li>Custom wellness plan development</li>
            <li>Priority customer support</li>
            <li>Access to specialized workshops</li>
        </ul>
        
        <h3>Guardian Level ($100/month)</h3>
        <p>Premium support for intensive wellness programs:</p>
        <ul>
            <li>All Champion benefits</li>
            <li>Unlimited professional coaching</li>
            <li>24/7 crisis support line</li>
            <li>Family wellness planning</li>
            <li>VIP access to all platform features</li>
        </ul>
        
        <h3>Upgrading Your Membership</h3>
        <p>You can upgrade your membership at any time through your account settings. Upgrades take effect immediately, and you''ll only pay the prorated difference.</p>',
        'Learn about our different membership levels and their benefits.',
        'Account Management',
        'memberships',
        '["membership", "benefits", "pricing", "upgrade"]',
        'beginner',
        3,
        'membership levels benefits pricing upgrade supporter champion guardian',
        true,
        'general',
        'Support Team'
      ),
      (
        'Privacy and Data Security',
        'privacy-data-security',
        '<h2>Your Privacy and Data Security</h2>
        <p>At Whole Wellness Coaching, we take your privacy and data security seriously. This guide explains how we protect your information.</p>
        
        <h3>Data Collection</h3>
        <p>We collect information that you provide to us, including:</p>
        <ul>
            <li>Account registration information</li>
            <li>Wellness assessments and goals</li>
            <li>Coaching session notes and progress</li>
            <li>Communication preferences</li>
        </ul>
        
        <h3>Data Protection</h3>
        <p>Your data is protected through:</p>
        <ul>
            <li>End-to-end encryption for all communications</li>
            <li>Secure servers with regular security audits</li>
            <li>Multi-factor authentication options</li>
            <li>Limited access controls for staff</li>
        </ul>
        
        <h3>Data Usage</h3>
        <p>We use your data only for:</p>
        <ul>
            <li>Providing coaching services</li>
            <li>Personalizing your experience</li>
            <li>Improving our platform</li>
            <li>Communicating important updates</li>
        </ul>
        
        <h3>Your Rights</h3>
        <p>You have the right to:</p>
        <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and data</li>
            <li>Export your data</li>
            <li>Opt out of non-essential communications</li>
        </ul>
        
        <h3>Contact Us</h3>
        <p>For privacy concerns or data requests, contact our privacy team at privacy@wholewellnesscoaching.org</p>',
        'Information about how we protect your privacy and secure your data.',
        'Privacy & Security',
        'privacy-policy',
        '["privacy", "security", "data protection", "GDPR"]',
        'intermediate',
        6,
        'privacy security data protection GDPR rights encryption',
        true,
        'general',
        'Legal Team'
      )
    `;
    
    console.log('✅ Sample data inserted successfully!');
    console.log('🎉 Knowledge base setup complete!');
    console.log('📊 Tables created:');
    console.log('  - knowledge_base (main articles)');
    console.log('  - knowledge_base_categories (organization)');
    console.log('  - knowledge_base_feedback (user feedback)');
    console.log('  - knowledge_base_views (analytics)');
    console.log('  - knowledge_base_search (search tracking)');
    
  } catch (error) {
    console.error('❌ Error setting up knowledge base:', error);
  } finally {
    await sql.end();
  }
}

// Run the deployment
deployKnowledgeBaseTables();