#!/usr/bin/env tsx

// This script fixes the SASL error by properly URL-encoding special characters in the password

const originalUrl = process.env.DATABASE_URL!;

if (!originalUrl) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

console.log('🔧 Fixing DATABASE_URL encoding...\n');

try {
  // Parse the URL to extract components
  // Format: postgresql://user:password@host:port/database?params
  const urlMatch = originalUrl.match(/^postgresql:\/\/([^:]+):([^@]+)@(.+)$/);
  
  if (!urlMatch) {
    console.error('❌ Could not parse DATABASE_URL format');
    process.exit(1);
  }

  const [, user, password, hostAndRest] = urlMatch;
  
  // URL-encode the password (this handles special characters like @, #, $, %, &, !, etc.)
  const encodedPassword = encodeURIComponent(password);
  
  // Reconstruct the URL with encoded password
  const fixedUrl = `postgresql://${user}:${encodedPassword}@${hostAndRest}`;
  
  console.log('Original URL format:', originalUrl.replace(/:[^:@]+@/, ':***@'));
  console.log('Fixed URL format:   ', fixedUrl.replace(/:[^:@]+@/, ':***@'));
  console.log('\n✅ Password encoded successfully');
  console.log('\nTo use this URL:');
  console.log('---');
  console.log(`export DATABASE_URL="${fixedUrl}"`);
  console.log('npm run db:push');
  console.log('---\n');
  console.log('Or run this command directly:');
  console.log(`DATABASE_URL="${fixedUrl}" npm run db:push`);
  
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
