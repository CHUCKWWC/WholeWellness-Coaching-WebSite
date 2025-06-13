// Quick database connection test
const { db } = require('./server/db.ts');
const { users, testimonials } = require('./shared/schema.ts');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await db.select().from(users).limit(1);
    console.log('Database connected successfully');
    
    // Test testimonials table
    const testimonialsResult = await db.select().from(testimonials).limit(1);
    console.log('Testimonials table accessible');
    
    console.log('Database test completed successfully');
  } catch (error) {
    console.error('Database test failed:', error.message);
    
    // Try to create tables if they don't exist
    try {
      console.log('Attempting to create missing tables...');
      
      // Create users table
      await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR PRIMARY KEY,
          email VARCHAR NOT NULL UNIQUE,
          password_hash VARCHAR NOT NULL,
          first_name VARCHAR,
          last_name VARCHAR,
          membership_level VARCHAR,
          donation_total VARCHAR,
          reward_points INTEGER,
          is_active BOOLEAN DEFAULT true,
          join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create testimonials table
      await db.execute(`
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
      
      console.log('Tables created successfully');
      
    } catch (createError) {
      console.error('Failed to create tables:', createError.message);
    }
  }
}

testDatabase();