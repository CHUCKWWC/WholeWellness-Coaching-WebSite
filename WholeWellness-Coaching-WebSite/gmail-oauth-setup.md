# Gmail OAuth Setup for Email System

## Current OAuth Credentials
From your provided file, we have:
- **Client ID**: `69500810131-qbh0549lkmau91vmihq0c757407lk5ba.apps.googleusercontent.com`
- **Client Secret**: `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`
- **Authorized Origins**: `https://wholewellnesscoaching.org`

## Option 1: Use OAuth2 (Recommended)
This is more secure and doesn't require app passwords.

### Steps to Complete OAuth Setup:

1. **Generate Refresh Token**
   - Go to: https://developers.google.com/oauthplayground
   - Click settings gear → Use your own OAuth credentials
   - Enter your Client ID and Client Secret
   - In Step 1, select "Gmail API v1" → "https://mail.google.com/"
   - Click "Authorize APIs"
   - Sign in with charles.watson@wholewellnesscoaching.org
   - In Step 2, click "Exchange authorization code for tokens"
   - Copy the **Refresh Token**

2. **Add OAuth Secrets to Replit**
   ```
   GOOGLE_CLIENT_ID: 69500810131-qbh0549lkmau91vmihq0c757407lk5ba.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET: 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
   GOOGLE_REFRESH_TOKEN: [from step 1]
   ```

## Option 2: Use App Password (Simpler)
If you prefer the simpler approach:

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Enable 2-step verification

2. **Generate App Password**
   - Search for "App passwords" in Google Account settings
   - Generate password for "Mail"
   - Update SMTP_PASS secret with the 16-character code

## Current Email System Features
- ✅ Welcome emails for new users
- ✅ Password reset emails
- ✅ Account verification emails
- ✅ Professional email templates
- ✅ Fallback authentication methods
- ✅ Error handling and logging

## Test the Email System
Once configured, the system will automatically:
- Send welcome emails after user registration
- Send password reset emails when requested
- Send verification emails for new accounts