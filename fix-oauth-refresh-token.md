# Fix OAuth2 Refresh Token Issue

## Current Status
✅ OAuth2 credentials are configured correctly  
✅ Email system is detecting OAuth2 authentication  
❌ Refresh token is invalid or expired  

## The "invalid_grant" Error
This error means the refresh token is either:
- Expired (Google refresh tokens can expire after 7 days if not used)
- Invalid format
- Generated for a different account
- Generated with wrong scopes

## Solution: Generate New Refresh Token

### Step 1: Go to OAuth Playground
Visit: https://developers.google.com/oauthplayground

### Step 2: Configure Settings
1. Click settings gear (⚙️) in top right
2. Check "Use your own OAuth credentials"  
3. Enter:
   - OAuth Client ID: `69500810131-qbh0549lkmau91vmihq0c757407lk5ba.apps.googleusercontent.com`
   - OAuth Client Secret: `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`

### Step 3: Important - Select Correct Scope
1. In left panel, find "Gmail API v1"
2. Select EXACTLY this scope: `https://mail.google.com/`
3. Click "Authorize APIs"

### Step 4: Sign In
- Use: `charles.watson@wholewellness-coaching.org`
- Grant all requested permissions

### Step 5: Get New Token
1. After authorization, you'll be redirected back
2. Click "Exchange authorization code for tokens"
3. Copy the NEW refresh token (starts with `1//`)

### Step 6: Update Replit Secret
- Update the `GOOGLE_REFRESH_TOKEN` secret with the new token
- The system will automatically use the new token

## What Makes This Work
- Using your exact OAuth credentials
- Correct Gmail API scope
- Fresh refresh token
- Proper account authorization

Once updated, the email system will work for:
- User registration welcome emails
- Password reset emails  
- Account verification emails
- All automated notifications