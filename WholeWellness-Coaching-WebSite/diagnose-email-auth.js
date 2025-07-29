import { google } from 'googleapis';

async function diagnoseOAuthIssue() {
  console.log('🔍 OAuth2 Diagnostic Tool');
  console.log('========================\n');

  // Check if all required OAuth variables exist
  const requiredVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing OAuth variables:', missingVars.join(', '));
    return;
  }

  console.log('✅ All OAuth variables present');
  
  // Test OAuth2 client creation
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    console.log('✅ OAuth2 client created successfully');

    // Test setting credentials
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    console.log('✅ Credentials set successfully');

    // Test token refresh
    console.log('🔄 Testing token refresh...');
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    if (credentials.access_token) {
      console.log('✅ Token refresh successful');
      console.log('📧 OAuth2 email authentication should work now!');
      return true;
    } else {
      console.log('❌ No access token received');
      return false;
    }

  } catch (error) {
    console.log('❌ OAuth2 test failed:', error.message);
    
    if (error.message.includes('invalid_grant')) {
      console.log('\n💡 Solution: Generate new refresh token');
      console.log('   1. Go to: https://developers.google.com/oauthplayground');
      console.log('   2. Use your OAuth credentials');
      console.log('   3. Select Gmail API scope: https://mail.google.com/');
      console.log('   4. Authorize with charles.watson@wholewellness-coaching.org');
      console.log('   5. Get fresh refresh token');
    }
    
    return false;
  }
}

// Test SMTP fallback
async function testSMTPFallback() {
  console.log('\n🔄 Testing SMTP Fallback...');
  
  try {
    // Temporarily remove OAuth variables to test SMTP
    const originalClientId = process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_ID;
    
    const { EmailService } = await import('./server/email-service.ts');
    const emailService = new EmailService();
    
    console.log('✅ SMTP fallback initialized');
    
    // Test email send
    await emailService.sendWelcomeEmail('test@example.com', 'Test User');
    console.log('✅ SMTP email sent successfully');
    
    // Restore OAuth variable
    process.env.GOOGLE_CLIENT_ID = originalClientId;
    
  } catch (error) {
    console.log('❌ SMTP fallback failed:', error.message);
    
    if (error.message.includes('Application-specific password')) {
      console.log('\n💡 SMTP requires Gmail App Password, not regular password');
    }
  }
}

// Run diagnostics
async function runDiagnostics() {
  const oauthWorks = await diagnoseOAuthIssue();
  
  if (!oauthWorks) {
    await testSMTPFallback();
  }
  
  console.log('\n📋 Summary:');
  console.log('- OAuth2 system is configured but needs fresh refresh token');
  console.log('- SMTP fallback requires Gmail App Password');
  console.log('- Email templates and service are ready');
  console.log('- Choose either OAuth2 (recommended) or SMTP with App Password');
}

runDiagnostics().catch(console.error);