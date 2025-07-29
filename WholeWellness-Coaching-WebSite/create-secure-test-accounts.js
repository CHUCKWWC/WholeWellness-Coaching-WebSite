import bcrypt from 'bcrypt';
import { pool } from './server/db.js';

async function createTestAccounts() {
  const hashedPassword = await bcrypt.hash('chucknice1', 12);
  
  try {
    // Create coach account
    await pool.query(`
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, role, 
        membership_level, reward_points, donation_total, 
        profile_completed, email_verified, is_active, 
        created_at, updated_at
      ) VALUES (
        'coach-chuck-123', 'coachchuck@wwctest.com', $1, 'Chuck', 'Coach', 'coach',
        'platinum', 1000, 250.00,
        true, true, true,
        NOW(), NOW()
      ) ON CONFLICT (email) DO UPDATE SET
        password_hash = $1,
        role = 'coach',
        updated_at = NOW()
    `, [hashedPassword]);
    
    // Create member account
    await pool.query(`
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, role, 
        membership_level, reward_points, donation_total, 
        profile_completed, email_verified, is_active, 
        created_at, updated_at
      ) VALUES (
        'member-chuck-456', 'memberchuck@wwctest.com', $1, 'Chuck', 'Member', 'user',
        'gold', 500, 100.00,
        true, true, true,
        NOW(), NOW()
      ) ON CONFLICT (email) DO UPDATE SET
        password_hash = $1,
        role = 'user',
        updated_at = NOW()
    `, [hashedPassword]);
    
    console.log('✅ Test accounts created successfully');
    console.log('Coach: coachchuck@wwctest.com (role: coach)');
    console.log('Member: memberchuck@wwctest.com (role: user)');
    console.log('Password: chucknice1');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestAccounts();