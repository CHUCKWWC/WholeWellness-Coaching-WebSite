import { google } from 'googleapis';

async function sendPasswordResetDirect() {
  console.log('🔧 Direct Gmail API Password Reset Test');
  console.log('======================================');
  console.log('Target: charles.watsn@gmail.com');
  console.log('======================================\n');

  try {
    // OAuth2 client setup
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    // Gmail API setup
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Email content
    const resetToken = 'prod-reset-' + Date.now();
    const senderEmail = 'noreply@wholewellness-coaching.org';
    const recipientEmail = 'charles.watsn@gmail.com';
    const subject = 'Reset Your Password - Wholewellness Coaching';
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Password Reset - Wholewellness Coaching</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2c3e50; margin-bottom: 10px;">Wholewellness Coaching</h1>
    <p style="color: #7f8c8d; margin: 0;">Supporting your journey to wellness</p>
  </div>
  
  <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
    <h2 style="color: #2c3e50; margin-bottom: 20px;">Password Reset Request</h2>
    
    <p style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">
      We received a request to reset your password for your Wholewellness Coaching account.
    </p>
    
    <p style="color: #34495e; line-height: 1.6; margin-bottom: 30px;">
      Click the button below to reset your password. This link will expire in 1 hour for security.
    </p>
    
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="https://wholewellness-coaching.org/reset-password?token=${resetToken}" 
         style="background-color: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        Reset Password
      </a>
    </div>
    
    <p style="color: #7f8c8d; font-size: 14px; line-height: 1.4;">
      If you didn't request this password reset, please ignore this email. Your account security is important to us.
    </p>
  </div>
  
  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #7f8c8d; font-size: 12px; margin: 0;">
      © 2025 Wholewellness Coaching<br>
      12370 Potranco Rd, Suite 207 PMB 1209, San Antonio, TX 78253-4260
    </p>
  </div>
</body>
</html>`;

    // Construct email message
    const message = [
      `From: ${senderEmail}`,
      `To: ${recipientEmail}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      htmlContent
    ].join('\n');

    // Encode message
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    console.log('📧 Sending password reset email...');
    console.log('From:', senderEmail);
    console.log('To:', recipientEmail);
    console.log('Subject:', subject);
    console.log('Token:', resetToken);
    console.log('');

    // Send email
    const startTime = Date.now();
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    const endTime = Date.now();

    console.log('✅ PASSWORD RESET EMAIL SENT SUCCESSFULLY!');
    console.log('==========================================');
    console.log('📬 Gmail API Response:');
    console.log('  Message ID:', response.data.id);
    console.log('  Thread ID:', response.data.threadId);
    console.log('  Send Duration:', (endTime - startTime) + 'ms');
    console.log('');
    console.log('📧 Email Details:');
    console.log('  Recipient:', recipientEmail);
    console.log('  Reset Token:', resetToken);
    console.log('  Send Time:', new Date().toISOString());
    console.log('  Reset URL:', `https://wholewellness-coaching.org/reset-password?token=${resetToken}`);
    console.log('');
    console.log('🎉 Email delivery confirmed via Gmail API!');
    console.log('Check charles.watsn@gmail.com for the password reset email.');

  } catch (error) {
    console.error('❌ PASSWORD RESET EMAIL FAILED');
    console.error('===============================');
    console.error('Error:', error.message);
    
    if (error.code === 403) {
      console.log('\n💡 OAuth2 Permissions Issue:');
      console.log('  • Gmail API scope insufficient');
      console.log('  • Need gmail.send permission');
    } else if (error.code === 401) {
      console.log('\n💡 Authentication Issue:');
      console.log('  • Refresh token expired');
      console.log('  • Need to reauthorize OAuth2');
    }
  }
}

sendPasswordResetDirect();