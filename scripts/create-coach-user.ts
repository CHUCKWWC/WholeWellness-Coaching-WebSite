import bcrypt from 'bcrypt';
import { db } from '../server/db';
import { users } from '../shared/schema';
import { v4 as uuidv4 } from 'uuid';

async function createCoachUser() {
  try {
    console.log('Creating coach user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('chucknice1', 10);
    
    // Create the coach user
    const coachUser = await db.insert(users).values({
      id: uuidv4(),
      email: 'coachchuck@wwctest.com',
      passwordHash: hashedPassword,
      firstName: 'Chuck',
      lastName: 'Coach',
      role: 'coach',
      permissions: ['view_clients', 'manage_sessions', 'view_assessments', 'manage_coaching'],
      membershipLevel: 'coach',
      rewardPoints: 0,
      donationTotal: '0',
      emailVerified: true,
      joinDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    console.log('✅ Coach user created successfully!');
    console.log('Email: coachchuck@wwctest.com');
    console.log('Password: chucknice1');
    console.log('Role: coach');
    console.log('User ID:', coachUser[0].id);
    
    process.exit(0);
  } catch (error: any) {
    if (error.code === '23505') {
      console.error('❌ User with email coachchuck@wwctest.com already exists');
    } else {
      console.error('❌ Error creating coach user:', error);
    }
    process.exit(1);
  }
}

createCoachUser();