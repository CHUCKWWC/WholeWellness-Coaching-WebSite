# Gmail OAuth2 Setup Guide

## Current Status
✅ OAuth2 credentials configured  
❌ Insufficient Gmail API scopes  
⚠️ Email address mismatch possible  

## Issue Analysis
The OAuth2 refresh token has insufficient permissions for Gmail API access. This is common when:
- OAuth2 was generated with limited scopes
- Account security settings restrict API access
- Email address doesn't match OAuth2 account

## Recommended Solution: Gmail App Password

### Steps to Enable Gmail App Password:

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Security → 2-Step Verification
   - Follow setup instructions

2. **Generate App Password**
   - Go to Google Account settings
   - Security → App passwords
   - Select "Mail" and "Other (custom name)"
   - Enter "Wholewellness Coaching Platform"
   - Copy the 16-character password

3. **Update Environment Variables**
   ```bash
   SMTP_PASS=your-16-character-app-password
   ```

4. **Test Email System**
   - System will automatically use SMTP with App Password
   - More reliable than OAuth2 for production

### Alternative: Fix OAuth2 Scopes

If you prefer OAuth2, regenerate credentials with these scopes:
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/gmail.readonly`
- `https://mail.google.com/`

Generate new OAuth2 credentials at:
https://developers.google.com/oauthplayground

## Email System Features Ready
- Welcome emails for new users
- Password reset functionality
- Account verification emails
- Professional wholewellness-coaching.org branding
- Automatic fallback between OAuth2 and SMTP

Choose either approach and the email system will work immediately.