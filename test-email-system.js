import { EmailService } from './server/email-service.ts';

async function testEmailSystem() {
  console.log('🔧 Testing Email System Configuration...');
  
  // Check environment variables
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'];
  console.log('\n📋 Environment Variables Check:');
  
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`✅ ${envVar}: ${envVar.includes('PASS') ? '***' : value}`);
    } else {
      console.log(`❌ ${envVar}: NOT SET`);
    }
  }
  
  // Test email service initialization
  try {
    const emailService = new EmailService();
    console.log('\n✅ Email Service initialized successfully');
    
    // Test sending a welcome email
    console.log('\n📧 Testing Welcome Email...');
    await emailService.sendWelcomeEmail('test@example.com', 'Test User');
    console.log('✅ Welcome email sent successfully');
    
    // Test password reset email
    console.log('\n🔑 Testing Password Reset Email...');
    await emailService.sendPasswordResetEmail('test@example.com', 'test-reset-token-123');
    console.log('✅ Password reset email sent successfully');
    
    // Test verification email
    console.log('\n✉️ Testing Verification Email...');
    await emailService.sendVerificationEmail('test@example.com', 'test-verify-token-456');
    console.log('✅ Verification email sent successfully');
    
    console.log('\n🎉 All email tests passed! Email system is fully operational.');
    
  } catch (error) {
    console.error('\n❌ Email system test failed:', error.message);
    
    if (error.message.includes('authentication')) {
      console.error('💡 Possible solutions:');
      console.error('   - Check SMTP_USER and SMTP_PASS credentials');
      console.error('   - Verify Gmail account has "Less secure app access" enabled');
      console.error('   - Consider using Gmail App Password instead of regular password');
    }
    
    if (error.message.includes('connection')) {
      console.error('💡 Possible solutions:');
      console.error('   - Check SMTP_HOST and SMTP_PORT settings');
      console.error('   - Verify network connectivity');
      console.error('   - Check firewall settings');
    }
  }
}

testEmailSystem();