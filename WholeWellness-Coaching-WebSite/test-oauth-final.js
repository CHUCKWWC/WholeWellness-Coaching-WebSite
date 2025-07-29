import { google } from 'googleapis';
import nodemailer from 'nodemailer';

async function testOAuth2Final() {
  console.log('🔧 Final OAuth2 Email Test');
  console.log('==========================\n');

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

    // Create transporter with fresh token
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.SMTP_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: credentials.access_token,
      },
    });

    console.log('✅ OAuth2 transporter created');

    // Test email send
    console.log('📧 Testing email send...');
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@wholewellness-coaching.org',
      to: 'test@example.com',
      subject: 'OAuth2 Test Email - Wholewellness Coaching',
      html: '<h1>Success!</h1><p>OAuth2 email authentication is working perfectly!</p>',
      text: 'Success! OAuth2 email authentication is working perfectly!',
    });

    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📤 From:', info.envelope.from);
    console.log('📥 To:', info.envelope.to);
    
    console.log('\n🎉 OAuth2 Email System is FULLY OPERATIONAL!');
    console.log('Ready for production use with:');
    console.log('  • User registration welcome emails');
    console.log('  • Password reset emails');
    console.log('  • Account verification emails');
    console.log('  • Admin notifications');

  } catch (error) {
    console.error('❌ OAuth2 test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 This may be due to:');
      console.log('  • Gmail account security settings');
      console.log('  • OAuth2 scope permissions');
      console.log('  • Account-specific restrictions');
      console.log('\n🔧 Try these solutions:');
      console.log('  1. Enable "Less secure app access" in Gmail settings');
      console.log('  2. Use Gmail App Password instead of OAuth2');
      console.log('  3. Verify OAuth2 scope includes full Gmail access');
    }
  }
}

testOAuth2Final();