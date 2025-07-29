// Simple Admin User Creation Script
// Creates admin user directly in existing users table

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const supabaseUrl = 'https://pwuwmnivvdvdxdewynbo.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  try {
    const adminEmail = 'admin@wholewellness.org';
    const adminPassword = 'AdminPass123!';
    const adminId = randomUUID();
    
    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    
    // Check if admin user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', adminEmail)
      .single();
    
    if (existingUser) {
      console.log('Admin user already exists:', adminEmail);
      return;
    }
    
    // Create admin user
    const { error } = await supabase
      .from('users')
      .insert({
        id: adminId,
        email: adminEmail,
        password_hash: passwordHash,
        first_name: 'Admin',
        last_name: 'User',
        membership_level: 'guardian',
        donation_total: '0',
        reward_points: 0,
        is_active: true,
        join_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error creating admin user:', error);
      return;
    }
    
    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('ID:', adminId);
    
  } catch (error) {
    console.error('Failed to create admin user:', error);
  }
}

createAdminUser();