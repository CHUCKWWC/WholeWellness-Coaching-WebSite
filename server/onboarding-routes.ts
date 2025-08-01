import type { Express } from 'express';
import { z } from 'zod';

// Validation schemas
const UserPreferencesSchema = z.object({
  role: z.enum(['member', 'coach', 'admin', 'visitor']),
  interests: z.array(z.string()),
  experience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  goals: z.array(z.string()),
  communicationStyle: z.enum(['supportive', 'direct', 'analytical', 'motivational']),
  learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']).optional(),
  availableTime: z.string().optional(),
  triggers: z.string().optional(),
  preferences: z.object({
    notifications: z.boolean(),
    publicProfile: z.boolean(),
    dataSharing: z.boolean()
  })
});

const OnboardingProgressSchema = z.object({
  isCompleted: z.boolean(),
  currentStep: z.number(),
  completedTutorials: z.array(z.string()),
  skippedSteps: z.array(z.string()),
  preferences: UserPreferencesSchema.optional()
});

export function registerOnboardingRoutes(app: Express) {
  // Get user's onboarding progress
  app.get('/api/user/onboarding-progress', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // In a real app, this would fetch from database
      // For now, return a default progress state
      const defaultProgress = {
        isCompleted: false,
        currentStep: 0,
        completedTutorials: [],
        skippedSteps: [],
        preferences: undefined
      };

      res.json(defaultProgress);
    } catch (error) {
      console.error('Error fetching onboarding progress:', error);
      res.status(500).json({ message: 'Failed to fetch onboarding progress' });
    }
  });

  // Save user's onboarding progress
  app.post('/api/user/onboarding-progress', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const validatedProgress = OnboardingProgressSchema.parse(req.body);

      // In a real app, this would save to database
      // For now, just return success
      console.log('Saving onboarding progress for user:', req.user.id, validatedProgress);

      res.json({ 
        message: 'Onboarding progress saved successfully',
        progress: validatedProgress 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid onboarding progress data',
          errors: error.errors 
        });
      }
      
      console.error('Error saving onboarding progress:', error);
      res.status(500).json({ message: 'Failed to save onboarding progress' });
    }
  });

  // Save user preferences
  app.post('/api/user/preferences', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const validatedPreferences = UserPreferencesSchema.parse(req.body);

      // In a real app, this would save to database
      console.log('Saving user preferences for user:', req.user.id, validatedPreferences);

      res.json({ 
        message: 'User preferences saved successfully',
        preferences: validatedPreferences 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid user preferences data',
          errors: error.errors 
        });
      }
      
      console.error('Error saving user preferences:', error);
      res.status(500).json({ message: 'Failed to save user preferences' });
    }
  });

  // Get available tutorials
  app.get('/api/tutorials', async (req, res) => {
    try {
      const { category, difficulty, role } = req.query;
      
      // Sample tutorials data (would come from database in real app)
      const tutorials = [
        {
          id: 'platform-basics',
          title: 'Platform Basics',
          description: 'Learn to navigate the WholeWellness platform',
          category: 'basics',
          estimatedTime: 5,
          difficulty: 'beginner',
          steps: 3
        },
        {
          id: 'ai-coaching-intro',
          title: 'AI Coaching Introduction',
          description: 'Meet your AI wellness coaches and learn how to interact with them',
          category: 'ai-coaching',
          estimatedTime: 8,
          difficulty: 'beginner',
          steps: 2
        },
        {
          id: 'wellness-tracking',
          title: 'Wellness Tracking',
          description: 'Learn how to track your wellness journey and progress',
          category: 'wellness',
          estimatedTime: 6,
          difficulty: 'beginner',
          steps: 2
        },
        {
          id: 'coach-dashboard',
          title: 'Coach Dashboard',
          description: 'Navigate your coach dashboard and manage clients',
          category: 'coach',
          estimatedTime: 10,
          difficulty: 'intermediate',
          steps: 2,
          requiredRole: 'coach'
        }
      ];

      // Filter tutorials based on query parameters
      let filteredTutorials = tutorials;

      if (category && category !== 'all') {
        filteredTutorials = filteredTutorials.filter(t => t.category === category);
      }

      if (difficulty) {
        filteredTutorials = filteredTutorials.filter(t => t.difficulty === difficulty);
      }

      if (role) {
        filteredTutorials = filteredTutorials.filter(t => 
          !t.requiredRole || t.requiredRole === role
        );
      }

      res.json(filteredTutorials);
    } catch (error) {
      console.error('Error fetching tutorials:', error);
      res.status(500).json({ message: 'Failed to fetch tutorials' });
    }
  });

  // Get tutorial details
  app.get('/api/tutorials/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Sample tutorial details (would come from database in real app)
      const tutorialDetails = {
        'platform-basics': {
          id: 'platform-basics',
          title: 'Platform Basics',
          description: 'Learn to navigate the WholeWellness platform',
          category: 'basics',
          estimatedTime: 5,
          difficulty: 'beginner',
          steps: [
            {
              id: 'welcome',
              title: 'Welcome to WholeWellness',
              description: 'Your journey to wellness starts here. Let\'s explore the main navigation.',
              target: 'nav',
              action: 'hover'
            },
            {
              id: 'ai-coaching-nav',
              title: 'Find AI Coaching',
              description: 'Click on AI Coaching to access your personal wellness coaches.',
              target: 'a[href="/ai-coaching"]',
              action: 'click'
            },
            {
              id: 'member-portal',
              title: 'Access Your Dashboard',
              description: 'Your member portal contains all your personalized content.',
              target: 'a[href="/member-portal"]',
              action: 'click'
            }
          ]
        }
      };

      const tutorial = tutorialDetails[id as keyof typeof tutorialDetails];
      
      if (!tutorial) {
        return res.status(404).json({ message: 'Tutorial not found' });
      }

      res.json(tutorial);
    } catch (error) {
      console.error('Error fetching tutorial details:', error);
      res.status(500).json({ message: 'Failed to fetch tutorial details' });
    }
  });

  // Mark tutorial as completed
  app.post('/api/tutorials/:id/complete', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const { id } = req.params;
      const { completedSteps } = req.body;

      // In a real app, this would save to database
      console.log('Marking tutorial as completed:', {
        userId: req.user.id,
        tutorialId: id,
        completedSteps
      });

      res.json({ 
        message: 'Tutorial marked as completed',
        tutorialId: id,
        completedSteps 
      });
    } catch (error) {
      console.error('Error marking tutorial as completed:', error);
      res.status(500).json({ message: 'Failed to mark tutorial as completed' });
    }
  });
}

export default registerOnboardingRoutes;