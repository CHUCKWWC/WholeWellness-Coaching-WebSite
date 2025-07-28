import { storage } from './server/storage.js';
import bcrypt from 'bcrypt';

async function createCoachAccounts() {
  console.log('🏥 Creating New Coach Accounts');
  
  const coaches = [
    {
      id: 'dasha_coach_001',
      email: 'dasha.lazaryuk@wholewellness-coaching.org',
      firstName: 'Dasha',
      lastName: 'Lazaryuk',
      password: 'DashaCoach2025!',
      specialization: 'Weight Loss & Nutrition'
    },
    {
      id: 'dr_csmith_002',
      email: 'Dr.CSmith@wholewellness-coaching.org',
      firstName: 'Dr. Christina',
      lastName: 'Smith',
      password: 'DrSmith2025!',
      specialization: 'Clinical Psychology'
    },
    {
      id: 'lisa_coach_003',
      email: 'LisaLivingHappy@gmail.com',
      firstName: 'Lisa',
      lastName: 'Jones',
      password: 'LisaHappy2025!',
      specialization: 'Life Coaching & Wellness'
    }
  ];

  for (const coach of coaches) {
    try {
      console.log(`\n➤ Creating coach: ${coach.firstName} ${coach.lastName}`);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(coach.password, 12);
      
      // Create user with coach role
      const userData = {
        id: coach.id,
        email: coach.email,
        firstName: coach.firstName,
        lastName: coach.lastName,
        passwordHash: hashedPassword,
        role: 'coach',
        membershipLevel: 'coach',
        donationTotal: '99.00', // Meets coach threshold
        isActive: true,
        emailVerified: true
      };

      const newUser = await storage.createUser(userData);
      console.log(`✅ User created: ${coach.email}`);

      // Create coach profile
      const coachProfile = {
        userId: coach.id,
        specializations: [coach.specialization],
        bio: `Experienced ${coach.specialization} specialist dedicated to helping clients achieve their wellness goals.`,
        hourlyRate: 75.00,
        availability: {
          monday: ['09:00', '17:00'],
          tuesday: ['09:00', '17:00'],
          wednesday: ['09:00', '17:00'],
          thursday: ['09:00', '17:00'],
          friday: ['09:00', '17:00']
        },
        credentials: ['Certified Wellness Coach', 'Licensed Professional'],
        yearsExperience: 5,
        isAvailable: true,
        videoCallLink: `https://meet.google.com/${coach.id}`
      };

      await storage.createCoachProfile(coachProfile);
      console.log(`✅ Coach profile created: ${coach.firstName} ${coach.lastName}`);
      console.log(`   Email: ${coach.email}`);
      console.log(`   Password: ${coach.password}`);
      console.log(`   Specialization: ${coach.specialization}`);

    } catch (error) {
      console.error(`❌ Error creating ${coach.email}:`, error.message);
    }
  }

  console.log('\n🎉 Coach account creation completed!');
  console.log('\n📋 LOGIN CREDENTIALS:');
  coaches.forEach(coach => {
    console.log(`\n${coach.firstName} ${coach.lastName}:`);
    console.log(`  Email: ${coach.email}`);
    console.log(`  Password: ${coach.password}`);
    console.log(`  Specialization: ${coach.specialization}`);
  });
}

// Run the script
createCoachAccounts().catch(console.error);