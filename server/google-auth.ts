import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { storage } from './supabase-client-storage';
import { AuthService } from './auth';

// Google OAuth Configuration - Read from environment variables for security
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

export function setupGoogleAuth() {
  // Validate required environment variables
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn('[Google Auth] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables. Google OAuth will not work.');
    return;
  }

  // Use REPLIT_DEV_DOMAIN for development or custom domain for production
  const baseUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : process.env.GOOGLE_CALENDAR_REDIRECT_URI?.replace('/api/google-calendar/callback', '') 
    || 'https://wholewellnesscoaching.org';
  const callbackURL = `${baseUrl}/auth/google/callback`;
    
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
    scope: ['profile', 'email'],
    passReqToCallback: false
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth Profile:', profile);
      
      // Check if user exists with this Google ID
      let user = await storage.getUserByGoogleId(profile.id);
      
      if (user) {
        return done(null, user);
      }

      // Check if user exists with this email
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await storage.getUserByEmail(email);
        
        if (user) {
          // Link Google account to existing user
          user = await storage.updateUserGoogleId(user.id, profile.id);
          return done(null, user);
        }
      }

      // Create new user from Google profile
      if (email) {
        const newUser = await storage.createUser({
          email: email,
          passwordHash: '', // Empty password hash for OAuth users
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          profileImageUrl: profile.photos?.[0]?.value || null,
          googleId: profile.id,
          provider: 'google',
          role: 'user'
        });
        
        return done(null, newUser);
      }

      return done(new Error('No email provided by Google'));
      
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

export function generateGoogleAuthToken(user: any) {
  return AuthService.generateToken({
    id: user.id,
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    role: user.role || 'user',
    membershipLevel: user.membershipLevel || 'free',
    isActive: user.isActive !== false
  });
}