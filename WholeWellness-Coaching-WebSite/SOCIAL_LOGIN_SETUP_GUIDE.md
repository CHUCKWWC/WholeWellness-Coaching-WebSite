# Social Login Setup Guide - WholeWellness Platform

## Overview
This guide covers setting up OAuth social login providers for the WholeWellness platform to improve user registration and authentication experience.

## Required Providers for Mental Health Platform

### 1. Google OAuth Setup
**Best for**: Professional users, Gmail integration

**Steps to get credentials**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API and Google OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `https://wholewellnesscoaching.org/auth/google/callback`
   - `https://whole-wellness-coaching.replit.app/auth/google/callback` (for testing)

**Required Environment Variables**:
```
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### 2. Facebook/Meta OAuth Setup
**Best for**: Broad user reach, social sharing

**Steps to get credentials**:
1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Create a new app → "Consumer" → "Add Facebook Login"
3. In Facebook Login settings, add Valid OAuth Redirect URIs:
   - `https://wholewellnesscoaching.org/auth/facebook/callback`
   - `https://whole-wellness-coaching.replit.app/auth/facebook/callback`
4. Copy App ID and App Secret

**Required Environment Variables**:
```
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
```

### 3. Apple Sign-In Setup
**Best for**: iOS users, privacy-focused users

**Steps to get credentials**:
1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Create App ID with "Sign In with Apple" capability
3. Create Services ID for web authentication
4. Generate private key for authentication
5. Configure return URLs:
   - `https://wholewellnesscoaching.org/auth/apple/callback`

**Required Environment Variables**:
```
APPLE_CLIENT_ID=your_services_id_here
APPLE_TEAM_ID=your_team_id_here
APPLE_KEY_ID=your_key_id_here
APPLE_PRIVATE_KEY=your_private_key_here
```

## Implementation Requirements

### Package Dependencies
You'll need to install these OAuth packages:
```bash
npm install passport-google-oauth20 passport-facebook passport-apple
```

### Database Schema Updates
Add social login fields to users table:
```sql
ALTER TABLE users ADD COLUMN google_id VARCHAR(255);
ALTER TABLE users ADD COLUMN facebook_id VARCHAR(255);
ALTER TABLE users ADD COLUMN apple_id VARCHAR(255);
ALTER TABLE users ADD COLUMN provider VARCHAR(50);
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
```

### OAuth Strategy Configuration
Each provider needs a Passport.js strategy configured in your authentication system:

**Google Strategy Example**:
```javascript
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  // Handle user creation/login
}));
```

### Required Routes
Add these authentication routes:
```javascript
// Google OAuth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }));

// Facebook OAuth  
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }));

// Apple OAuth
app.get('/auth/apple', passport.authenticate('apple'));
app.get('/auth/apple/callback', passport.authenticate('apple', { failureRedirect: '/login' }));
```

## Frontend Integration

### Login Button Components
Add social login buttons to your login/registration forms:

```jsx
<div className="social-login-section">
  <Button onClick={() => window.location.href = '/auth/google'} 
          className="w-full flex items-center justify-center gap-2">
    <GoogleIcon /> Continue with Google
  </Button>
  
  <Button onClick={() => window.location.href = '/auth/facebook'} 
          className="w-full flex items-center justify-center gap-2">
    <FacebookIcon /> Continue with Facebook
  </Button>
  
  <Button onClick={() => window.location.href = '/auth/apple'} 
          className="w-full flex items-center justify-center gap-2">
    <AppleIcon /> Continue with Apple
  </Button>
</div>
```

## Privacy & Compliance Considerations

### HIPAA Compliance
Since this is a mental health platform:
- Ensure OAuth providers meet HIPAA requirements
- Implement additional consent forms for health data
- Consider limiting social data collection to name/email only

### Data Handling
- Store minimal social profile data
- Allow users to disconnect social accounts
- Provide clear privacy notices about social login data usage

### Terms of Service Updates
Update your terms to cover:
- Social login data usage
- Third-party provider policies
- User rights regarding social account data

## Testing Requirements

### Development Testing
Test each provider with:
- New user registration via social login
- Existing user linking social accounts
- Account unlinking functionality
- Error handling (cancelled auth, network issues)

### Production Validation
- Verify SSL certificates on callback URLs
- Test with real social accounts
- Validate consent flows
- Check data privacy compliance

## Security Best Practices

### OAuth Security
- Use HTTPS for all callback URLs
- Implement CSRF protection
- Validate state parameters
- Set appropriate OAuth scopes (minimal required data)

### Session Management
- Generate secure session tokens after social login
- Implement session expiration
- Provide logout from all devices functionality

## Recommended Priority Order

For WholeWellness platform, implement in this order:

1. **Google OAuth** - Most trusted, professional users
2. **Apple Sign-In** - Privacy-focused, mobile users  
3. **Facebook OAuth** - Broader reach, but consider privacy concerns

## Cost Considerations

- **Google**: Free for most usage levels
- **Facebook**: Free for basic authentication
- **Apple**: Requires Apple Developer account ($99/year)

## Support Resources

- **Google OAuth**: [Google Identity Documentation](https://developers.google.com/identity)
- **Facebook Login**: [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- **Apple Sign-In**: [Apple Sign-In Documentation](https://developer.apple.com/sign-in-with-apple/)

---

*This setup guide ensures secure, compliant social login integration that maintains user trust while reducing registration friction for your mental health platform.*