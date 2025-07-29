import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const supabaseUrl = process.env.DATABASE_URL ? 
  process.env.DATABASE_URL.replace('postgresql://', 'https://').replace(':5432/', '.supabase.co') :
  'your-supabase-url';

const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

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
      
      // Insert into users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: coach.id,
          email: coach.email,
          first_name: coach.firstName,
          last_name: coach.lastName,
          password_hash: hashedPassword,
          role: 'coach',
          membership_level: 'coach',
          donation_total: 99.00, // Meets coach threshold
          is_active: true,
          created_at: new Date(),
          email_verified: true
        })
        .select()
        .single();

      if (userError) {
        console.error(`❌ Error creating user ${coach.email}:`, userError);
        continue;
      }

      console.log(`✅ User created: ${coach.email}`);

      // Create coach profile
      const { data: coachData, error: coachError } = await supabase
        .from('coach_profiles')
        .insert({
          user_id: coach.id,
          specializations: [coach.specialization],
          bio: `Experienced ${coach.specialization} specialist dedicated to helping clients achieve their wellness goals.`,
          hourly_rate: 75.00,
          availability: {
            monday: ['09:00', '17:00'],
            tuesday: ['09:00', '17:00'],
            wednesday: ['09:00', '17:00'],
            thursday: ['09:00', '17:00'],
            friday: ['09:00', '17:00']
          },
          credentials: ['Certified Wellness Coach', 'Licensed Professional'],
          years_experience: 5,
          is_available: true,
          video_call_link: `https://meet.google.com/${coach.id}`,
          created_at: new Date()
        });

      if (coachError) {
        console.error(`❌ Error creating coach profile for ${coach.email}:`, coachError);
        continue;
      }

      console.log(`✅ Coach profile created: ${coach.firstName} ${coach.lastName}`);
      console.log(`   Email: ${coach.email}`);
      console.log(`   Password: ${coach.password}`);
      console.log(`   Specialization: ${coach.specialization}`);

    } catch (error) {
      console.error(`❌ Unexpected error for ${coach.email}:`, error);
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