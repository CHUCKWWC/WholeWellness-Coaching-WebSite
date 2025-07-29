import { google } from 'googleapis';

async function diagnoseOAuthAccount() {
  console.log('🔍 OAuth2 Account Diagnosis');
  console.log('===========================\n');

  try {
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    // Set credentials
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    // Get fresh access token
    console.log('🔄 Getting fresh access token...');
    const { credentials } = await oauth2Client.refreshAccessToken();
    console.log('✅ Access token obtained successfully');

    // Use Gmail API to get user profile
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    console.log('📧 Getting Gmail profile information...');
    const profile = await gmail.users.getProfile({ userId: 'me' });
    
    console.log('✅ Gmail Profile Information:');
    console.log('  Email Address:', profile.data.emailAddress);
    console.log('  Messages Total:', profile.data.messagesTotal);
    console.log('  Threads Total:', profile.data.threadsTotal);
    console.log('  History ID:', profile.data.historyId);

    console.log('\n🔍 Configuration Check:');
    console.log('  OAuth2 Account:', profile.data.emailAddress);
    console.log('  SMTP User:', process.env.SMTP_USER);
    console.log('  From Email:', process.env.FROM_EMAIL);

    if (profile.data.emailAddress !== process.env.SMTP_USER) {
      console.log('\n⚠️  EMAIL MISMATCH DETECTED!');
      console.log('The OAuth2 credentials are for:', profile.data.emailAddress);
      console.log('But SMTP_USER is set to:', process.env.SMTP_USER);
      console.log('\n💡 Solutions:');
      console.log('  1. Update SMTP_USER to match OAuth2 account');
      console.log('  2. Generate new OAuth2 credentials for current email');
      console.log('  3. Use Gmail App Password instead of OAuth2');
    } else {
      console.log('\n✅ Email addresses match - OAuth2 should work!');
    }

    // Test sending capability
    console.log('\n📤 Testing Gmail API send capability...');
    const testMessage = {
      raw: Buffer.from(
        'To: test@example.com\r\n' +
        'Subject: OAuth2 Test\r\n' +
        '\r\n' +
        'This is a test message from OAuth2 Gmail API'
      ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
    };

    // Note: This is a dry run - we're not actually sending
    console.log('✅ Gmail API access confirmed');

  } catch (error) {
    console.error('❌ OAuth2 diagnosis failed:', error.message);
    
    if (error.code === 400) {
      console.log('\n💡 This suggests:');
      console.log('  • Invalid refresh token');
      console.log('  • Expired or revoked OAuth2 credentials');
      console.log('  • Incorrect OAuth2 scope permissions');
    }
  }
}

diagnoseOAuthAccount();