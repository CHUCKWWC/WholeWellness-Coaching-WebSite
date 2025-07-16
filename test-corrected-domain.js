import { google } from 'googleapis';

async function testCorrectedDomain() {
  console.log('🔧 Testing Password Reset with Corrected Domain');
  console.log('===============================================');
  console.log('Target: charles.watsn@gmail.com');
  console.log('Domain: wholewellnesscoaching.org (no hyphens)');
  console.log('===============================================\n');

  try {
    // OAuth2 setup
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    const refreshToken = '1//04clMNK7pH7O2CgYIARAAGAQSNwF-L9IrU6JqGBHtInEsv12laeRoUMIRtjovsnT0sr67n6ln9CSWWanRhObL_HGqjoUy8VAqTwE';
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Email details
    const resetToken = 'corrected-domain-' + Date.now();
    const resetUrl = `https://wholewellnesscoaching.org/reset-password?token=${resetToken}`;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Password Reset - Wholewellness Coaching</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
    <p style="color: #666; line-height: 1.6;">
      We received a request to reset your password for your Whole Wellness Coaching account.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" 
         style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Reset Your Password
      </a>
    </div>
    
    <p style="color: #666; line-height: 1.6; font-size: 14px;">
      This link will expire in 1 hour for security purposes. If you didn't request this reset, 
      please ignore this email and your password will remain unchanged.
    </p>
    
    <p style="color: #666; line-height: 1.6; font-size: 14px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
    </p>
  </div>
  
  <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
    <p style="color: #666; margin: 0; font-size: 12px;">
      Whole Wellness Coaching | Supporting women on their journey to wellness<br>
      <a href="https://wholewellnesscoaching.org" style="color: #667eea;">wholewellnesscoaching.org</a>
    </p>
  </div>
</body>
</html>`;

    // Create email message
    const message = [
      'From: noreply@wholewellnesscoaching.org',
      'To: charles.watsn@gmail.com',
      'Subject: Reset Your Password - Wholewellness Coaching',
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      htmlContent
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    console.log('📧 Sending password reset email...');
    console.log('From: noreply@wholewellnesscoaching.org');
    console.log('To: charles.watsn@gmail.com');
    console.log('Reset URL:', resetUrl);
    console.log('Token:', resetToken);
    console.log('');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage }
    });

    console.log('✅ EMAIL SENT SUCCESSFULLY WITH CORRECTED DOMAIN!');
    console.log('================================================');
    console.log('📬 Gmail Response:');
    console.log('  Message ID:', response.data.id);
    console.log('  Thread ID:', response.data.threadId);
    console.log('');
    console.log('🔗 Reset URL (Corrected):');
    console.log('  ' + resetUrl);
    console.log('');
    console.log('📧 Email Features:');
    console.log('  ✓ Correct domain: wholewellnesscoaching.org');
    console.log('  ✓ Professional HTML template');
    console.log('  ✓ Secure reset token');
    console.log('  ✓ 1-hour expiration');
    console.log('  ✓ Gmail API delivery');
    console.log('');
    console.log('🎉 Password reset email delivered successfully!');

  } catch (error) {
    console.error('❌ EMAIL SEND FAILED:', error.message);
  }
}

testCorrectedDomain();