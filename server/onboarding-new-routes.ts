import { Router } from 'express';
import { z } from 'zod';
import { db } from './db';
import { users, onboardingProgress, clientIntake, coachApplications } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from './auth';
import type { AuthenticatedRequest } from './auth';

const router = Router();

// Schema for onboarding data
const onboardingDataSchema = z.object({
  type: z.enum(['client', 'coach']),
  step: z.number(),
  data: z.any() // Will be validated based on type
});

const completeOnboardingSchema = z.object({
  type: z.enum(['client', 'coach']),
  data: z.any()
});

// Get or create onboarding progress
router.get('/api/onboarding/progress', requireAuth as any, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const [progress] = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, req.user.id));

    if (!progress) {
      // Create initial progress
      const [newProgress] = await db
        .insert(onboardingProgress)
        .values({
          userId: req.user.id,
          currentStep: 0,
          totalSteps: 8, // Default for client
          data: {},
          completed: false
        })
        .returning();
      
      return res.json(newProgress);
    }

    res.json(progress);
  } catch (error) {
    console.error('Error getting onboarding progress:', error);
    res.status(500).json({ error: 'Failed to get onboarding progress' });
  }
});

// Save onboarding progress
router.post('/api/onboarding/save-progress', requireAuth as any, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const validatedData = onboardingDataSchema.parse(req.body);

    // Update or create progress
    const [existingProgress] = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, req.user.id));

    if (existingProgress) {
      await db
        .update(onboardingProgress)
        .set({
          currentStep: validatedData.step,
          data: validatedData.data,
          updatedAt: new Date()
        })
        .where(eq(onboardingProgress.userId, req.user.id));
    } else {
      await db
        .insert(onboardingProgress)
        .values({
          userId: req.user.id,
          currentStep: validatedData.step,
          totalSteps: validatedData.type === 'client' ? 8 : 6,
          data: validatedData.data,
          completed: false
        });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving onboarding progress:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// Complete onboarding
router.post('/api/onboarding/complete', requireAuth as any, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const validatedData = completeOnboardingSchema.parse(req.body);

    if (validatedData.type === 'client') {
      // Save client intake data
      await db.insert(clientIntake).values({
        userId: req.user.id,
        primaryGoal: validatedData.data.primaryGoal,
        specificChallenges: validatedData.data.specificChallenges,
        previousSupport: validatedData.data.previousSupport,
        urgencyLevel: validatedData.data.urgencyLevel,
        healthConcerns: validatedData.data.healthConcerns,
        medications: validatedData.data.medications,
        sleepQuality: validatedData.data.sleepQuality,
        stressLevel: validatedData.data.stressLevel,
        exerciseFrequency: validatedData.data.exerciseFrequency,
        coachingStyle: validatedData.data.coachingStyle,
        sessionFrequency: validatedData.data.sessionFrequency,
        preferredDays: validatedData.data.preferredDays,
        preferredTimes: validatedData.data.preferredTimes,
        communicationPreference: validatedData.data.communicationPreference,
        emergencyContact: validatedData.data.emergencyContact,
        currentSafetyLevel: validatedData.data.currentSafetyLevel,
        needsImmediateSupport: validatedData.data.needsImmediateSupport
      });

      // Update user profile
      await db
        .update(users)
        .set({
          firstName: validatedData.data.firstName,
          lastName: validatedData.data.lastName,
          phone: validatedData.data.phone,
          updatedAt: new Date()
        })
        .where(eq(users.id, req.user.id));

    } else if (validatedData.type === 'coach') {
      // Save coach application
      await db.insert(coachApplications).values({
        userId: req.user.id,
        bio: validatedData.data.bio,
        location: validatedData.data.location,
        linkedIn: validatedData.data.linkedIn,
        certifications: validatedData.data.certifications,
        specializations: validatedData.data.specializations,
        yearsOfExperience: validatedData.data.yearsOfExperience,
        availability: validatedData.data.availability,
        status: 'pending'
      });
    }

    // Mark onboarding as complete
    await db
      .update(onboardingProgress)
      .set({
        completed: true,
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(onboardingProgress.userId, req.user.id));

    res.json({ success: true, message: 'Onboarding completed successfully' });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

// Get coaching specialties
router.get('/api/onboarding/coaching-specialties', async (req, res) => {
  const specialties = [
    {
      id: 'weight-loss',
      name: 'Weight Loss & Nutrition',
      description: 'Help clients achieve healthy weight goals through nutrition and lifestyle changes'
    },
    {
      id: 'relationships',
      name: 'Relationships & Communication',
      description: 'Support clients in building healthy relationships and improving communication'
    },
    {
      id: 'trauma-recovery',
      name: 'Trauma Recovery',
      description: 'Guide clients through healing from past trauma and building resilience'
    },
    {
      id: 'life-transitions',
      name: 'Life Transitions',
      description: 'Support during major life changes like divorce, loss, or career changes'
    },
    {
      id: 'stress-management',
      name: 'Stress & Anxiety Management',
      description: 'Teach coping strategies and mindfulness techniques'
    },
    {
      id: 'self-esteem',
      name: 'Self-Esteem & Confidence',
      description: 'Help clients build self-worth and personal empowerment'
    }
  ];

  res.json({ specialties });
});

export { router as onboardingNewRoutes };