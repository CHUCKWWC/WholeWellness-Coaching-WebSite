# Google OAuth Fix Instructions

## Problem
Google OAuth is showing "Access blocked: invalid action" error because the redirect URI in Google Cloud Console doesn't match our application's callback URL.

## Solution: Update Google Cloud Console

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or the project containing your OAuth credentials)

### Step 2: Navigate to OAuth Settings
1. In the left sidebar, go to "APIs & Services" → "Credentials"
2. Find your OAuth 2.0 Client ID (should start with `69500810131-`)
3. Click on the credential name to edit it

### Step 3: Add Authorized Redirect URI
In the "Authorized redirect URIs" section, add this exact URI:
```
https://whole-wellness-coaching.replit.app/auth/google/callback
```

### Step 4: Save Changes
1. Click "Save" at the bottom of the page
2. Wait a few minutes for the changes to propagate

## Current OAuth Configuration
- **Client ID**: `69500810131-qbh0549lkmau91vmihq0c757407lk5ba.apps.googleusercontent.com`
- **Expected Callback URL**: `https://whole-wellness-coaching.replit.app/auth/google/callback`

## Alternative: Use Email/Password Authentication
If Google OAuth continues to have issues, users can:
1. Click "Use Email/Password Instead" on the login form
2. Create an account with email and password
3. Use the comprehensive onboarding flow

## Testing After Fix
Once you've updated the Google Cloud Console:
1. Try signing in with Google again
2. The authentication should redirect properly to Google
3. After authorization, you'll be redirected back to the platform

## Notes
- Changes to OAuth settings can take 5-15 minutes to propagate
- Make sure you're editing the correct project in Google Cloud Console
- The redirect URI must match exactly (including https://)