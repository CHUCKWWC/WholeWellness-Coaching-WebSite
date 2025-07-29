const bcrypt = require('bcrypt');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { users } = require('./server/db');
const { eq } = require('drizzle-orm');
require('dotenv').config();

async function createTestCoach() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  try {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, 'chuck@wholewellnesscoaching.org'));
    
    if (existingUser.length > 0) {
      console.log('Coach account already exists for chuck@wholewellnesscoaching.org');
      await client.end();
      return;
    }

    // Hash the password
    const passwordHash = await bcrypt.hash('chucknice1', 12);

    // Create the test coach account
    const newCoach = await db.insert(users).values({
      id: 'coach_' + Date.now(),
      email: 'chuck@wholewellnesscoaching.org',
      passwordHash: passwordHash,
      firstName: 'Chuck',
      lastName: 'TestCoach',
      role: 'coach',
      permissions: JSON.stringify([
        'VIEW_COACH_DASHBOARD',
        'MANAGE_CLIENTS',
        'VIEW_SESSIONS',
        'EDIT_PROFILE',
        'VIEW_EARNINGS'
      ]),
      isActive: true,
      membershipLevel: 'coach',
    }).returning();

    console.log('✓ Test coach account created successfully!');
    console.log('Email: chuck@wholewellnesscoaching.org');
    console.log('Password: chucknice1');
    console.log('Role: coach');
    console.log('Coach ID:', newCoach[0].id);

    // Also create a simpler username-based login
    const simpleCoach = await db.insert(users).values({
      id: 'coach_chuck_' + Date.now(),
      email: 'chuck',  // Using email field for username
      passwordHash: passwordHash,
      firstName: 'Chuck',
      lastName: 'TestCoach',
      role: 'coach',
      permissions: JSON.stringify([
        'VIEW_COACH_DASHBOARD',
        'MANAGE_CLIENTS',
        'VIEW_SESSIONS',
        'EDIT_PROFILE',
        'VIEW_EARNINGS'
      ]),
      isActive: true,
      membershipLevel: 'coach',
    }).returning();

    console.log('\n✓ Alternative login created:');
    console.log('Username: chuck');
    console.log('Password: chucknice1');

  } catch (error) {
    console.error('Error creating test coach:', error);
  } finally {
    await client.end();
  }
}

createTestCoach();