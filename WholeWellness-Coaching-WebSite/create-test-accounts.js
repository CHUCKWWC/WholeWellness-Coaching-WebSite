import bcrypt from 'bcrypt';
import { storage } from './server/supabase-client-storage.js';

async function createTestAccounts() {
  try {
    console.log('Creating test accounts...');

    // Hash the password
    const hashedPassword = await bcrypt.hash('chucknice1', 12);

    // Create coach account
    const coachData = {
      email: 'coachchuck@wwctest.com',
      passwordHash: hashedPassword,
      firstName: 'Chuck',
      lastName: 'Coach',
      membershipLevel: 'platinum',
      rewardPoints: 1000,
      donationTotal: '250.00',
      role: 'coach',
      profileCompleted: true,
      emailVerified: true,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    // Create member account
    const memberData = {
      email: 'memberchuck@wwctest.com',
      passwordHash: hashedPassword,
      firstName: 'Chuck',
      lastName: 'Member',
      membershipLevel: 'gold',
      rewardPoints: 500,
      donationTotal: '100.00',
      role: 'user',
      profileCompleted: true,
      emailVerified: true,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    // Create the accounts
    const coach = await storage.createUser(coachData);
    console.log('✅ Coach account created:', coach.email);

    const member = await storage.createUser(memberData);
    console.log('✅ Member account created:', member.email);

    console.log('\n🎉 Test accounts created successfully!');
    console.log('\nLogin Credentials:');
    console.log('Coach Experience:');
    console.log('  Email: coachchuck@wwctest.com');
    console.log('  Password: chucknice1');
    console.log('  Role: coach');
    console.log('  Features: Coach dashboard, certification courses, client management');
    
    console.log('\nMember Experience:');
    console.log('  Email: memberchuck@wwctest.com');
    console.log('  Password: chucknice1');
    console.log('  Role: user');
    console.log('  Features: AI coaching, assessments, donation portal, onboarding');

  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
    
    // If accounts already exist, that's okay
    if (error.message && error.message.includes('already exists')) {
      console.log('✅ Test accounts already exist and are ready to use');
    }
  }
}

createTestAccounts();