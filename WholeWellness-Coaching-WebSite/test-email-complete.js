import { EmailService } from './server/email-service.ts';

async function testEmailConfiguration() {
  console.log('🔧 Email System Configuration Test');
  console.log('=====================================\n');

  // Check current environment variables
  const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS ? '***' : undefined,
    from: process.env.FROM_EMAIL
  };

  const oauthConfig = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? '***' : undefined,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN ? '***' : undefined
  };

  console.log('📋 Current Configuration:');
  console.log('SMTP Settings:');
  Object.entries(smtpConfig).forEach(([key, value]) => {
    console.log(`  ${key}: ${value || 'NOT SET'}`);
  });

  console.log('\nOAuth Settings:');
  Object.entries(oauthConfig).forEach(([key, value]) => {
    console.log(`  ${key}: ${value || 'NOT SET'}`);
  });

  // Determine authentication method
  const hasOAuth = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
  const hasSmtp = process.env.SMTP_USER && process.env.SMTP_PASS;

  console.log('\n🔍 Authentication Method Detection:');
  if (hasOAuth && process.env.GOOGLE_REFRESH_TOKEN) {
    console.log('✅ OAuth2 authentication will be used (recommended)');
  } else if (hasSmtp) {
    console.log('⚠️  SMTP authentication will be used (requires App Password)');
  } else {
    console.log('❌ No valid authentication method configured');
    return;
  }

  // Test email service
  console.log('\n📧 Testing Email Service...');
  try {
    const emailService = new EmailService();
    console.log('✅ Email service initialized successfully');

    // Test with a safe email address
    const testEmail = 'test@example.com';
    
    if (hasOAuth && process.env.GOOGLE_REFRESH_TOKEN) {
      console.log('\n🔒 Testing OAuth2 Authentication...');
      await emailService.sendWelcomeEmail(testEmail, 'OAuth Test User');
      console.log('✅ OAuth2 email sent successfully');
    } else if (hasSmtp) {
      console.log('\n🔑 Testing SMTP Authentication...');
      await emailService.sendWelcomeEmail(testEmail, 'SMTP Test User');
      console.log('✅ SMTP email sent successfully');
    }

    console.log('\n🎉 Email system is fully operational!');
    console.log('Ready to send:');
    console.log('  • Welcome emails to new users');
    console.log('  • Password reset emails');
    console.log('  • Account verification emails');

  } catch (error) {
    console.error('\n❌ Email test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Solution: Set up OAuth2 credentials or use Gmail App Password');
    } else if (error.message.includes('OAuth')) {
      console.log('\n💡 Solution: Generate refresh token from Google OAuth Playground');
    } else {
      console.log('\n💡 Check email configuration and network connectivity');
    }
  }
}

// Run the test
testEmailConfiguration().catch(console.error);