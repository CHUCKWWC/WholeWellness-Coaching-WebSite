import { Router } from 'express';
import { requireAuth, optionalAuth, type AuthenticatedRequest } from './auth';
import { onboardingService } from './onboarding-service';
import { storage } from './supabase-client-storage';
import { z } from 'zod';

const router = Router();

// Schemas for validation
const coachingSelectionSchema = z.object({
  specialties: z.array(z.string()).min(1, 'At least one specialty must be selected')
});

const passwordResetRequestSchema = z.object({
  email: z.string().email('Valid email is required')
});

const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
});

const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
});

const coachingFlowSchema = z.object({
  step: z.string().min(1, 'Step is required'),
  response: z.string().optional()
});

// Get user onboarding progress
router.get('/progress', requireAuth as any, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const progress = await onboardingService.getUserOnboardingProgress(req.user.id);
    res.json({ progress });
  } catch (error) {
    console.error('Error getting onboarding progress:', error);
    res.status(500).json({ error: 'Failed to get onboarding progress' });
  }
});

// Complete onboarding step
router.post('/complete-step/:stepId', requireAuth as any, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { stepId } = req.params;
    await onboardingService.completeOnboardingStep(req.user.id, stepId);
    
    res.json({ success: true, message: 'Step completed successfully' });
  } catch (error) {
    console.error('Error completing onboarding step:', error);
    res.status(500).json({ error: 'Failed to complete step' });
  }
});

// Get coaching specialties
router.get('/coaching-specialties', async (req, res) => {
  try {
    const specialties = onboardingService.getCoachingSpecialties();
    res.json({ specialties });
  } catch (error) {
    console.error('Error getting coaching specialties:', error);
    res.status(500).json({ error: 'Failed to get coaching specialties' });
  }
});

// Get coaching specialties by category
router.get('/coaching-specialties/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const specialties = onboardingService.getCoachingSpecialtiesByCategory(category as any);
    res.json({ specialties });
  } catch (error) {
    console.error('Error getting coaching specialties by category:', error);
    res.status(500).json({ error: 'Failed to get coaching specialties' });
  }
});

// Process coaching selection
router.post('/coaching-selection', requireAuth as any, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { specialties } = coachingSelectionSchema.parse(req.body);
    await onboardingService.processCoachingSelection(req.user.id, specialties);
    
    res.json({ success: true, message: 'Coaching preferences updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    
    console.error('Error processing coaching selection:', error);
    res.status(500).json({ error: 'Failed to process coaching selection' });
  }
});

// Coaching flow conversation
router.post('/coaching-flow', async (req, res) => {
  try {
    const { step, response } = coachingFlowSchema.parse(req.body);
    const flow = onboardingService.createCoachingFlow(response || step);
    
    res.json(flow);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    
    console.error('Error processing coaching flow:', error);
    res.status(500).json({ error: 'Failed to process coaching flow' });
  }
});

// Generate coaching recommendations
router.post('/coaching-recommendations', requireAuth as any, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const responses = req.body;
    const recommendations = onboardingService.generateCoachingRecommendation(responses);
    
    res.json({ recommendations });
  } catch (error) {
    console.error('Error generating coaching recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Request password reset
router.post('/password-reset-request', async (req, res) => {
  try {
    const { email } = passwordResetRequestSchema.parse(req.body);
    await onboardingService.requestPasswordReset(email);
    
    // Always return success for security (don't reveal if email exists)
    res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid email format', details: error.errors });
    }
    
    console.error('Error requesting password reset:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset password with token
router.post('/password-reset', async (req, res) => {
  try {
    const { token, newPassword } = passwordResetSchema.parse(req.body);
    await onboardingService.resetPassword(token, newPassword);
    
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    
    if (error instanceof Error && error.message.includes('Invalid or expired')) {
      return res.status(400).json({ error: error.message });
    }
    
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Verify email with token
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = emailVerificationSchema.parse(req.body);
    await onboardingService.verifyEmail(token);
    
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid token format', details: error.errors });
    }
    
    if (error instanceof Error && error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }
    
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// Resend verification email
router.post('/resend-verification', requireAuth as any, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await storage.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.email_verified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Initialize onboarding which includes sending verification email
    await onboardingService.initializeUserOnboarding(user.id, user.email, user.firstName || 'User');
    
    res.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// Get onboarding welcome message
router.get('/welcome-message', optionalAuth as any, async (req: AuthenticatedRequest, res) => {
  try {
    const welcomeFlow = onboardingService.createCoachingFlow('welcome');
    res.json(welcomeFlow);
  } catch (error) {
    console.error('Error getting welcome message:', error);
    res.status(500).json({ error: 'Failed to get welcome message' });
  }
});

// Mark profile setup as complete
router.post('/complete-profile', requireAuth as any, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await onboardingService.completeOnboardingStep(req.user.id, 'profile_setup');
    res.json({ success: true, message: 'Profile setup completed' });
  } catch (error) {
    console.error('Error completing profile setup:', error);
    res.status(500).json({ error: 'Failed to complete profile setup' });
  }
});

// Mark AI coach introduction as complete
router.post('/complete-ai-intro', requireAuth as any, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await onboardingService.completeOnboardingStep(req.user.id, 'ai_coach_intro');
    res.json({ success: true, message: 'AI coach introduction completed' });
  } catch (error) {
    console.error('Error completing AI intro:', error);
    res.status(500).json({ error: 'Failed to complete AI introduction' });
  }
});

// Mark resource exploration as complete
router.post('/complete-resources', requireAuth as any, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await onboardingService.completeOnboardingStep(req.user.id, 'resource_exploration');
    res.json({ success: true, message: 'Resource exploration completed' });
  } catch (error) {
    console.error('Error completing resource exploration:', error);
    res.status(500).json({ error: 'Failed to complete resource exploration' });
  }
});

export { router as onboardingRoutes };