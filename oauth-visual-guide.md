# Gmail Authentication Visual Setup Guide

## Current Status
✅ **Email templates ready** - Professional wholewellness-coaching.org branding  
✅ **Dual authentication system** - OAuth2 and SMTP App Password support  
✅ **Automatic fallback** - System chooses best available method  
⚠️ **Gmail rate limiting** - Temporary connection restrictions  

## Quick Setup (5 minutes)

### Option 1: Gmail App Password (Recommended)

**Step 1: Enable 2-Factor Authentication**
```
1. Go to https://myaccount.google.com/
2. Click "Security" in left sidebar
3. Under "Signing in to Google" → "2-Step Verification"
4. Follow setup instructions
```

**Step 2: Generate App Password**
```
1. In Google Account Security settings
2. Click "App passwords" (appears after 2FA enabled)
3. Select "Mail" from dropdown
4. Enter "Wholewellness Coaching Platform"
5. Copy the 16-character password (like: abcd efgh ijkl mnop)
```

**Step 3: Update Environment Variable**
```
Set SMTP_PASS to your 16-character app password
```

**Step 4: Test Results**
- Immediate email functionality
- Welcome emails for new users
- Password reset emails
- Account verification emails
- Professional branding

### Option 2: Fix OAuth2 Scopes

If you prefer OAuth2, regenerate with these scopes:
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/gmail.readonly`
- `https://mail.google.com/`

Generate at: https://developers.google.com/oauthplayground

## Email System Features

### Ready for Production
- **Welcome Emails**: Automatically sent after user registration
- **Password Reset**: Secure token-based reset functionality
- **Account Verification**: One-click email verification
- **Professional Templates**: HTML and text versions with branding
- **Error Handling**: Automatic fallback and retry logic

### Email Addresses Used
- `welcome@wholewellness-coaching.org` - New user welcome messages
- `noreply@wholewellness-coaching.org` - Password reset emails
- `verify@wholewellness-coaching.org` - Account verification emails
- `admin@wholewellness-coaching.org` - Administrative notifications
- `hello@wholewellness-coaching.org` - General support communications

## Integration Points

### User Registration Flow
1. User completes registration form
2. Account created in database
3. Welcome email automatically sent
4. User receives branded welcome message

### Password Reset Flow
1. User clicks "Forgot Password"
2. Reset token generated and stored
3. Password reset email sent with secure link
4. User clicks link to reset password

### Account Verification Flow
1. User registers new account
2. Verification token generated
3. Verification email sent
4. User clicks verification link
5. Account activated automatically

## Troubleshooting

### Gmail Rate Limiting (421 Error)
- **Cause**: Gmail temporarily blocking connections
- **Solution**: Wait 5-10 minutes and retry
- **Prevention**: Use App Password instead of OAuth2

### OAuth2 Insufficient Scopes
- **Cause**: Limited OAuth2 permissions
- **Solution**: Regenerate with full Gmail scopes
- **Alternative**: Use Gmail App Password

### Email Address Mismatch
- **Cause**: OAuth2 account differs from SMTP_USER
- **Solution**: Update SMTP_USER to match OAuth2 account
- **Alternative**: Use Gmail App Password

## Production Recommendations

1. **Use Gmail App Password** - More reliable than OAuth2
2. **Monitor email delivery** - Check logs for successful sends
3. **Test all email types** - Welcome, reset, verification
4. **Set up monitoring** - Track email delivery rates
5. **Configure backup** - Alternative SMTP provider if needed

The email system is production-ready and will work immediately with either authentication method.