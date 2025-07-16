import { google } from 'googleapis';
import fetch from 'node-fetch';

async function testGmailAPIDirect() {
  console.log('🔧 Gmail API Direct Test');
  console.log('========================\n');

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
    console.log('✅ Access token obtained');

    // Create Gmail API instance
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Test email message
    const senderEmail = process.env.SMTP_USER || 'noreply@wholewellness-coaching.org';
    const recipientEmail = 'test@example.com';
    const subject = 'OAuth2 Test - Wholewellness Coaching';
    const body = `
<html>
<body>
  <h1>Email System Test</h1>
  <p>This email was sent successfully using OAuth2 authentication!</p>
  <p>From: Wholewellness Coaching Platform</p>
  <p>System: Production-ready email service</p>
</body>
</html>
    `;

    // Construct raw email message
    const message = [
      `From: ${senderEmail}`,
      `To: ${recipientEmail}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      body
    ].join('\n');

    // Encode message
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email via Gmail API
    console.log('📧 Sending email via Gmail API...');
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', response.data.id);
    console.log('📤 Thread ID:', response.data.threadId);
    
    console.log('\n🎉 Gmail API OAuth2 is WORKING!');
    console.log('Ready for production use with:');
    console.log('  • Welcome emails for new users');
    console.log('  • Password reset functionality');
    console.log('  • Account verification emails');
    console.log('  • Professional wholewellness-coaching.org branding');

  } catch (error) {
    console.error('❌ Gmail API test failed:', error.message);
    
    if (error.code === 403) {
      console.log('\n💡 OAuth2 scope issue:');
      console.log('  • Need https://www.googleapis.com/auth/gmail.send scope');
      console.log('  • Regenerate OAuth2 credentials with proper scopes');
    }
    
    if (error.code === 401) {
      console.log('\n💡 Authentication issue:');
      console.log('  • Refresh token may be expired');
      console.log('  • Need to reauthorize OAuth2 access');
    }
  }
}

testGmailAPIDirect();