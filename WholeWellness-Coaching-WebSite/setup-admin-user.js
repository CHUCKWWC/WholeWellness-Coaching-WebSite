// Setup Admin User Script
// Creates initial admin user and required database tables

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const supabaseUrl = 'https://pwuwmnivvdvdxdewynbo.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdminTables() {
  console.log('Setting up admin tables...');
  
  // Create admin sessions table
  const { error: sessionsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        session_token VARCHAR NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        ip_address VARCHAR,
        user_agent TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
    `
  });
  
  if (sessionsError) {
    console.error('Error creating admin sessions table:', sessionsError);
  } else {
    console.log('✓ Admin sessions table created');
  }
  
  // Create admin activity log table
  const { error: activityError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS admin_activity_log (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        action VARCHAR NOT NULL,
        resource VARCHAR,
        resource_id VARCHAR,
        details JSONB,
        ip_address VARCHAR,
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_admin_activity_log_user_id ON admin_activity_log(user_id);
      CREATE INDEX IF NOT EXISTS idx_admin_activity_log_timestamp ON admin_activity_log(timestamp);
    `
  });
  
  if (activityError) {
    console.error('Error creating admin activity log table:', activityError);
  } else {
    console.log('✓ Admin activity log table created');
  }
  
  // Create role permissions table
  const { error: permissionsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS role_permissions (
        id SERIAL PRIMARY KEY,
        role VARCHAR NOT NULL,
        permission VARCHAR NOT NULL,
        resource VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
    `
  });
  
  if (permissionsError) {
    console.error('Error creating role permissions table:', permissionsError);
  } else {
    console.log('✓ Role permissions table created');
  }
}

async function updateUsersTable() {
  console.log('Updating users table with admin fields...');
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user',
      ADD COLUMN IF NOT EXISTS permissions JSONB;
      
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `
  });
  
  if (error) {
    console.error('Error updating users table:', error);
  } else {
    console.log('✓ Users table updated with admin fields');
  }
}

async function createAdminUser() {
  console.log('Creating test admin user...');
  
  const adminEmail = 'admin@wholewellness.org';
  const adminPassword = 'AdminPass123!';
  const adminId = crypto.randomUUID();
  
  // Hash password
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  
  // Check if admin user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', adminEmail)
    .single();
  
  if (existingUser) {
    console.log('Admin user already exists, updating role...');
    
    const { error } = await supabase
      .from('users')
      .update({
        role: 'super_admin',
        permissions: [
          'view_users', 'edit_users', 'delete_users', 'export_users',
          'view_donations', 'process_donations', 'refund_donations',
          'view_coaches', 'manage_coaches', 'view_bookings', 'assign_coaches',
          'view_content', 'edit_content', 'publish_content',
          'view_analytics', 'system_settings', 'bulk_operations', 'view_logs',
          'manage_admins', 'full_access'
        ]
      })
      .eq('email', adminEmail);
    
    if (error) {
      console.error('Error updating admin user:', error);
    } else {
      console.log('✓ Admin user role updated');
    }
  } else {
    console.log('Creating new admin user...');
    
    const { error } = await supabase
      .from('users')
      .insert({
        id: adminId,
        email: adminEmail,
        password_hash: passwordHash,
        first_name: 'Admin',
        last_name: 'User',
        role: 'super_admin',
        permissions: [
          'view_users', 'edit_users', 'delete_users', 'export_users',
          'view_donations', 'process_donations', 'refund_donations',
          'view_coaches', 'manage_coaches', 'view_bookings', 'assign_coaches',
          'view_content', 'edit_content', 'publish_content',
          'view_analytics', 'system_settings', 'bulk_operations', 'view_logs',
          'manage_admins', 'full_access'
        ],
        membership_level: 'guardian',
        is_active: true,
        join_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error creating admin user:', error);
    } else {
      console.log('✓ Admin user created successfully');
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Password: ${adminPassword}`);
      console.log(`  Role: super_admin`);
    }
  }
}

async function createTestUsers() {
  console.log('Creating test users for demonstration...');
  
  const testUsers = [
    {
      id: crypto.randomUUID(),
      email: 'moderator@wholewellness.org',
      password_hash: await bcrypt.hash('ModeratorPass123!', 12),
      first_name: 'Jane',
      last_name: 'Moderator',
      role: 'moderator',
      permissions: ['view_users', 'view_donations', 'view_coaches', 'view_bookings', 'view_content']
    },
    {
      id: crypto.randomUUID(),
      email: 'coach@wholewellness.org',
      password_hash: await bcrypt.hash('CoachPass123!', 12),
      first_name: 'John',
      last_name: 'Coach',
      role: 'coach',
      permissions: ['view_users', 'view_bookings', 'view_content', 'edit_content']
    },
    {
      id: crypto.randomUUID(),
      email: 'user@wholewellness.org',
      password_hash: await bcrypt.hash('UserPass123!', 12),
      first_name: 'Regular',
      last_name: 'User',
      role: 'user',
      permissions: []
    }
  ];
  
  for (const user of testUsers) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();
    
    if (!existingUser) {
      const { error } = await supabase
        .from('users')
        .insert({
          ...user,
          membership_level: user.role === 'user' ? 'free' : 'supporter',
          is_active: true,
          join_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error(`Error creating ${user.role} user:`, error);
      } else {
        console.log(`✓ ${user.role} user created: ${user.email}`);
      }
    } else {
      console.log(`${user.role} user already exists: ${user.email}`);
    }
  }
}

async function setupDefaultPermissions() {
  console.log('Setting up default role permissions...');
  
  const rolePermissions = [
    // Moderator permissions
    { role: 'moderator', permission: 'view_users' },
    { role: 'moderator', permission: 'view_donations' },
    { role: 'moderator', permission: 'view_coaches' },
    { role: 'moderator', permission: 'view_bookings' },
    { role: 'moderator', permission: 'view_content' },
    
    // Coach permissions
    { role: 'coach', permission: 'view_users' },
    { role: 'coach', permission: 'view_bookings' },
    { role: 'coach', permission: 'view_content' },
    { role: 'coach', permission: 'edit_content' },
    
    // Admin permissions
    { role: 'admin', permission: 'view_users' },
    { role: 'admin', permission: 'edit_users' },
    { role: 'admin', permission: 'export_users' },
    { role: 'admin', permission: 'view_donations' },
    { role: 'admin', permission: 'process_donations' },
    { role: 'admin', permission: 'view_coaches' },
    { role: 'admin', permission: 'manage_coaches' },
    { role: 'admin', permission: 'view_bookings' },
    { role: 'admin', permission: 'assign_coaches' },
    { role: 'admin', permission: 'view_content' },
    { role: 'admin', permission: 'edit_content' },
    { role: 'admin', permission: 'publish_content' },
    { role: 'admin', permission: 'view_analytics' },
    { role: 'admin', permission: 'bulk_operations' },
    { role: 'admin', permission: 'view_logs' },
    
    // Super admin permissions
    { role: 'super_admin', permission: 'full_access' },
    { role: 'super_admin', permission: 'manage_admins' },
    { role: 'super_admin', permission: 'system_settings' }
  ];
  
  // Clear existing permissions first
  await supabase.from('role_permissions').delete().neq('id', 0);
  
  const { error } = await supabase
    .from('role_permissions')
    .insert(rolePermissions);
  
  if (error) {
    console.error('Error setting up role permissions:', error);
  } else {
    console.log('✓ Default role permissions configured');
  }
}

async function main() {
  try {
    console.log('🚀 Setting up admin authentication system...\n');
    
    await setupAdminTables();
    await updateUsersTable();
    await createAdminUser();
    await createTestUsers();
    await setupDefaultPermissions();
    
    console.log('\n✅ Admin authentication setup completed!');
    console.log('\nTest Login Credentials:');
    console.log('📧 Super Admin: admin@wholewellness.org / AdminPass123!');
    console.log('📧 Moderator: moderator@wholewellness.org / ModeratorPass123!');
    console.log('📧 Coach: coach@wholewellness.org / CoachPass123!');
    console.log('📧 User: user@wholewellness.org / UserPass123!');
    console.log('\nAccess the admin dashboard at: /admin-login');
    
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

main();