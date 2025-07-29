# Google OAuth HTTPS Configuration Guide

## Current Configuration Status

✅ **Updated**: OAuth callback URL now uses HTTPS for production security
✅ **Environment-aware**: Automatically detects production vs development environment
✅ **Security compliant**: Uses secure HTTPS protocol for production callbacks

## Callback URL Configuration

### Production (HTTPS)
- **URL**: `https://wholewellnesscoaching.org/auth/google/callback`
- **Security**: SSL/TLS encrypted
- **Environment**: `NODE_ENV=production`

### Development (HTTP)
- **URL**: `/auth/google/callback` (relative URL for local development)
- **Security**: Local development only
- **Environment**: `NODE_ENV=development`

## Google Cloud Console Setup

To complete the HTTPS configuration, update your Google Cloud Console:

### 1. Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `wholewellness-coaching-platform`
3. Navigate to **APIs & Services** → **Credentials**

### 2. Update OAuth 2.0 Client
1. Find your OAuth 2.0 Client ID: `69500810131-qbh0549lkmau91vmihq0c757407lk5ba.apps.googleusercontent.com`
2. Click the **Edit** button (pencil icon)
3. In **Authorized redirect URIs**, add:
   ```
   https://wholewellnesscoaching.org/auth/google/callback
   ```
4. Keep existing development URIs if needed:
   ```
   http://localhost:5000/auth/google/callback
   ```
5. Click **Save**

### 3. SSL Certificate Verification
Ensure your domain has a valid SSL certificate:
- ✅ Certificate Authority: Let's Encrypt, Comodo, or similar
- ✅ Certificate covers: `wholewellnesscoaching.org` and `www.wholewellnesscoaching.org`
- ✅ HTTPS redirect: HTTP traffic automatically redirects to HTTPS
- ✅ Security headers: HSTS, CSP, and other security headers configured

## Security Benefits

### HTTPS OAuth Callback
- **Data Protection**: All OAuth tokens encrypted in transit
- **Man-in-the-Middle Prevention**: SSL/TLS prevents token interception
- **Google Requirements**: Google recommends HTTPS for all OAuth callbacks
- **User Trust**: HTTPS indicator builds user confidence

### Additional Security Measures
- **HTTP-Only Cookies**: Session tokens stored securely
- **CSRF Protection**: Cross-site request forgery prevention
- **Secure Cookie Flags**: Cookies marked as secure in production
- **HSTS Headers**: HTTP Strict Transport Security enabled

## Testing OAuth Flow

### Production Testing
1. Navigate to: `https://wholewellnesscoaching.org`
2. Click "Login with Google" button
3. Verify redirect to: `https://accounts.google.com/oauth/authorize...`
4. After authorization, verify callback to: `https://wholewellnesscoaching.org/auth/google/callback`
5. Confirm successful login and session creation

### Development Testing
1. Navigate to: `http://localhost:5000`
2. Click "Login with Google" button
3. OAuth flow works locally for development

## Environment Variables

Ensure proper environment configuration:

```bash
# Production
NODE_ENV=production
GOOGLE_CLIENT_ID=69500810131-qbh0549lkmau91vmihq0c757407lk5ba.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Session security
SESSION_SECRET=your-secure-session-secret
```

## Troubleshooting

### Common Issues
1. **"redirect_uri_mismatch" Error**
   - Verify Google Cloud Console has exact HTTPS callback URL
   - Check spelling and protocol (https://)

2. **SSL Certificate Issues**
   - Verify certificate is valid and not expired
   - Test SSL with tools like SSL Labs

3. **Mixed Content Warnings**
   - Ensure all resources load over HTTPS
   - Update any HTTP references to HTTPS

### Error Handling
The OAuth system includes comprehensive error handling:
- Invalid credentials → Redirect to login with error message
- Network errors → Graceful fallback with retry option
- SSL/certificate errors → Clear error messages for debugging

## Next Steps

1. **Update Google Cloud Console** with HTTPS callback URL
2. **Test OAuth flow** in production environment
3. **Monitor SSL certificate** expiration dates
4. **Review security headers** and implement additional protections as needed

The application is now configured for secure HTTPS OAuth callbacks, meeting Google's security requirements and protecting user authentication data.