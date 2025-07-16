# Gmail OAuth2 Setup Guide

## Step 1: Get Refresh Token

1. **Go to Google OAuth Playground**
   - Visit: https://developers.google.com/oauthplayground

2. **Configure OAuth Credentials**
   - Click the settings gear (⚙️) in the top right
   - Check "Use your own OAuth credentials"
   - Enter:
     - **OAuth Client ID**: `69500810131-qbh0549lkmau91vmihq0c757407lk5ba.apps.googleusercontent.com`
     - **OAuth Client Secret**: `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`

3. **Authorize Gmail API**
   - In "Step 1", find "Gmail API v1" in the left panel
   - Select: `https://mail.google.com/`
   - Click "Authorize APIs"
   - Sign in with: `charles.watson@wholewellness-coaching.org`
   - Allow the requested permissions

4. **Get Tokens**
   - In "Step 2", click "Exchange authorization code for tokens"
   - Copy the **Refresh Token** (starts with `1//`)
   - You can also copy the **Access Token** (optional)

## Step 2: Add Secrets to Replit

Add these three secrets to your Replit project:

```
GOOGLE_CLIENT_ID = 69500810131-qbh0549lkmau91vmihq0c757407lk5ba.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = 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
GOOGLE_REFRESH_TOKEN = [paste the refresh token from step 1]
```

## Step 3: Test the System

Once the secrets are added, the email system will automatically use OAuth2 authentication instead of SMTP passwords.

## How It Works

The system checks for OAuth credentials first:
- If `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` exist → Uses OAuth2
- If not → Falls back to SMTP with App Password

OAuth2 is more secure because:
- No password storage required
- Tokens can be revoked if needed
- Better suited for production applications
- Automatic token refresh handling