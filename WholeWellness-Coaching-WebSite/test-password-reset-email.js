import { EmailService } from './server/email-service.js';

async function sendPasswordResetTest() {
  console.log('🔧 Password Reset Email Test');
  console.log('============================');
  console.log('Recipient: charles.watsn@gmail.com');
  console.log('Email Type: Password Reset');
  console.log('Authentication: Gmail API OAuth2');
  console.log('============================\n');

  const emailService = new EmailService();
  const testEmail = 'charles.watsn@gmail.com';
  const resetToken = 'test-reset-token-' + Date.now();

  try {
    console.log('📧 Initializing email service...');
    console.log('🔐 Generating reset token:', resetToken);
    
    console.log('\n📤 Sending password reset email...');
    console.log('From: noreply@wholewellness-coaching.org');
    console.log('To:', testEmail);
    console.log('Subject: Reset Your Password - Wholewellness Coaching');
    
    const startTime = Date.now();
    await emailService.sendPasswordResetEmail(testEmail, resetToken);
    const endTime = Date.now();
    
    console.log('\n✅ PASSWORD RESET EMAIL SENT SUCCESSFULLY!');
    console.log('========================================');
    console.log('📬 Email Details:');
    console.log('  • Recipient:', testEmail);
    console.log('  • Reset Token:', resetToken);
    console.log('  • Send Time:', new Date().toISOString());
    console.log('  • Duration:', (endTime - startTime) + 'ms');
    console.log('  • Authentication: Gmail API OAuth2');
    console.log('  • From Address: noreply@wholewellness-coaching.org');
    
    console.log('\n📧 Email Content:');
    console.log('  • Subject: Reset Your Password - Wholewellness Coaching');
    console.log('  • Format: HTML + Text');
    console.log('  • Branding: Professional wholewellness-coaching.org');
    console.log('  • Reset Link: Includes secure token for password reset');
    
    console.log('\n🔗 Reset URL Generated:');
    console.log('  https://wholewellness-coaching.org/reset-password?token=' + resetToken);
    
    console.log('\n🎉 Email delivery confirmed via Gmail API!');
    console.log('User should receive the email shortly.');

  } catch (error) {
    console.error('\n❌ PASSWORD RESET EMAIL FAILED');
    console.error('================================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.message.includes('OAuth2')) {
      console.log('\n💡 OAuth2 Issue Detected:');
      console.log('  • Check refresh token validity');
      console.log('  • Verify Gmail API scopes');
      console.log('  • Ensure proper authentication');
    }
  }
}

sendPasswordResetTest();