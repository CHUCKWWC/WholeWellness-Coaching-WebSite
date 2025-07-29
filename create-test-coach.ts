import bcrypt from 'bcrypt';
import { db } from './server/db';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';

async function createTestCoach() {
  try {
    // Check if user already exists with email 'chuck'
    const existingUser = await db.select().from(users).where(eq(users.email, 'chuck'));
    
    if (existingUser.length > 0) {
      console.log('Coach account already exists for username: chuck');
      process.exit(0);
    }

    // Hash the password
    const passwordHash = await bcrypt.hash('chucknice1', 12);

    // Create the test coach account using email field for username
    const newCoach = await db.insert(users).values({
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

    console.log('✓ Test coach account created successfully!');
    console.log('Username: chuck');
    console.log('Password: chucknice1');
    console.log('Role: coach');
    console.log('Coach ID:', newCoach[0].id);

  } catch (error) {
    console.error('Error creating test coach:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

createTestCoach();