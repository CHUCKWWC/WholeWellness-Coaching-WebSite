# 🔐 Gmail OAuth2 Setup - Visual Guide

## Quick Start (5 minutes)

### 🌐 Step 1: Open OAuth Playground
Go to: **https://developers.google.com/oauthplayground**

### ⚙️ Step 2: Configure Your Credentials
1. Click the **Settings Gear** (⚙️) in the top right
2. Check **"Use your own OAuth credentials"**
3. Enter your credentials:
   ```
   OAuth Client ID: 69500810131-qbh0549lkmau91vmihq0c757407lk5ba.apps.googleusercontent.com
   OAuth Client Secret: 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
   ```

### 📧 Step 3: Select Gmail Scope
1. In the left panel, find **"Gmail API v1"**
2. Check the box for: **`https://mail.google.com/`**
3. Click **"Authorize APIs"**

### 🔑 Step 4: Authorize & Get Token
1. Sign in with: **charles.watson@wholewellness-coaching.org**
2. Grant the requested permissions
3. You'll be redirected back to the playground
4. Click **"Exchange authorization code for tokens"**
5. Copy the **Refresh Token** (starts with `1//`)

### 🔒 Step 5: Add to Replit Secrets
Add these three secrets to your Replit project:
```
GOOGLE_CLIENT_ID = 69500810131-qbh0549lkmau91vmihq0c757407lk5ba.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = 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
GOOGLE_REFRESH_TOKEN = [paste the refresh token from step 4]
```

## ✅ What Happens Next

Once you add the secrets, the email system will:
- Automatically detect OAuth2 credentials
- Switch from SMTP to OAuth2 authentication
- Send emails securely through Gmail API
- Handle token refresh automatically

## 🧪 Testing

After adding the secrets, run this test:
```bash
tsx test-email-complete.js
```

You should see:
- ✅ OAuth2 authentication detected
- ✅ Email service initialized
- ✅ Test email sent successfully

## 🎯 Benefits of OAuth2

- **More Secure**: No passwords stored
- **Production Ready**: Designed for applications
- **Auto Refresh**: Tokens refresh automatically
- **Better Rates**: Higher sending limits
- **Revocable**: Can be revoked if needed

The system is ready - just need the OAuth credentials!