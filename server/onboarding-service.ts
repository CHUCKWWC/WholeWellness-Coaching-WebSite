import { emailService } from './email-service';
import { storage } from './supabase-client-storage';
import { AuthService } from './auth';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  order: number;
}

export interface CoachingSpecialty {
  id: string;
  name: string;
  description: string;
  category: 'personal' | 'financial' | 'health' | 'business' | 'relationships' | 'recovery';
  subcategories?: string[];
  icon: string;
  color: string;
}

export class OnboardingService {
  // Default onboarding steps
  private static readonly DEFAULT_STEPS: Omit<OnboardingStep, 'completed'>[] = [
    {
      id: 'email_verification',
      title: 'Verify Your Email',
      description: 'Check your email and click the verification link to activate your account',
      order: 1
    },
    {
      id: 'profile_setup',
      title: 'Complete Your Profile',
      description: 'Add your personal information and preferences to personalize your experience',
      order: 2
    },
    {
      id: 'coaching_selection',
      title: 'Choose Your Coaching Focus',
      description: 'Select the areas where you need support to get personalized recommendations',
      order: 3
    },
    {
      id: 'ai_coach_intro',
      title: 'Meet Your AI Coaches',
      description: 'Get introduced to our AI coaches and try your first coaching session',
      order: 4
    },
    {
      id: 'resource_exploration',
      title: 'Explore Resources',
      description: 'Discover our library of wellness tools, guides, and educational content',
      order: 5
    }
  ];

  // Available coaching specialties
  private static readonly COACHING_SPECIALTIES: CoachingSpecialty[] = [
    {
      id: 'weight_loss',
      name: 'Weight Loss Coaching',
      description: 'Personalized meal plans, fitness guidance, and sustainable weight management',
      category: 'health',
      subcategories: ['Meal Planning', 'Fitness Guidance', 'Nutrition Education', 'Motivation Support'],
      icon: '🏃‍♀️',
      color: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'relationship_coaching',
      name: 'Relationship Coaching',
      description: 'Build stronger, healthier connections with romantic partners, family, and friends',
      category: 'relationships',
      subcategories: ['Communication Skills', 'Conflict Resolution', 'Trust Building', 'Intimacy Enhancement'],
      icon: '💕',
      color: 'bg-pink-100 text-pink-800'
    },
    {
      id: 'mindset_coaching',
      name: 'Mindset & Life Coaching',
      description: 'Overcome limiting beliefs, build confidence, and create positive life changes',
      category: 'personal',
      subcategories: ['Self-Confidence', 'Goal Setting', 'Stress Management', 'Life Transitions'],
      icon: '🧠',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'financial_coaching',
      name: 'Financial Wellness',
      description: 'Budgeting, debt management, and financial planning for a secure future',
      category: 'financial',
      subcategories: ['Budgeting', 'Debt Management', 'Financial Planning', 'Money Mindset'],
      icon: '💰',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'business_coaching',
      name: 'Business & Career Growth',
      description: 'Entrepreneurship, career development, and professional growth strategies',
      category: 'business',
      subcategories: ['Business Strategy', 'Marketing', 'Career Development', 'Leadership'],
      icon: '👔',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'recovery_support',
      name: 'Recovery & Healing',
      description: 'Support for survivors of domestic violence and trauma recovery',
      category: 'recovery',
      subcategories: ['Trauma Recovery', 'Emotional Healing', 'Safety Planning', 'Empowerment'],
      icon: '🌱',
      color: 'bg-yellow-100 text-yellow-800'
    }
  ];

  // Initialize onboarding for new user
  static async initializeUserOnboarding(userId: string, userEmail: string, firstName: string): Promise<void> {
    try {
      // Create onboarding steps for the user
      const steps = this.DEFAULT_STEPS.map(step => ({
        ...step,
        userId,
        completed: false,
        completedAt: null
      }));

      // Store onboarding steps in database
      await storage.createUserOnboardingSteps(userId, steps);

      // Send welcome email
      await emailService.sendWelcomeEmail(userEmail, firstName);

      // Send verification email if not already verified
      const verificationToken = emailService.generateVerificationToken();
      await storage.createEmailVerificationToken(userId, verificationToken);
      await emailService.sendVerificationEmail(userEmail, verificationToken);

      console.log(`Onboarding initialized for user: ${userId}`);
    } catch (error) {
      console.error('Error initializing user onboarding:', error);
      throw error;
    }
  }

  // Get onboarding progress for user
  static async getUserOnboardingProgress(userId: string): Promise<OnboardingStep[]> {
    try {
      const steps = await storage.getUserOnboardingSteps(userId);
      return steps.sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Error getting user onboarding progress:', error);
      return [];
    }
  }

  // Mark onboarding step as completed
  static async completeOnboardingStep(userId: string, stepId: string): Promise<void> {
    try {
      await storage.updateOnboardingStep(userId, stepId, {
        completed: true,
        completedAt: new Date()
      });

      // Check if all steps are completed
      const steps = await this.getUserOnboardingProgress(userId);
      const allCompleted = steps.every(step => step.completed);

      if (allCompleted) {
        await storage.markUserOnboardingComplete(userId);
        console.log(`Onboarding completed for user: ${userId}`);
      }
    } catch (error) {
      console.error('Error completing onboarding step:', error);
      throw error;
    }
  }

  // Get coaching specialties
  static getCoachingSpecialties(): CoachingSpecialty[] {
    return this.COACHING_SPECIALTIES;
  }

  // Get coaching specialties by category
  static getCoachingSpecialtiesByCategory(category: CoachingSpecialty['category']): CoachingSpecialty[] {
    return this.COACHING_SPECIALTIES.filter(specialty => specialty.category === category);
  }

  // Process coaching selection from user
  static async processCoachingSelection(userId: string, selectedSpecialties: string[]): Promise<void> {
    try {
      // Store user's coaching preferences
      await storage.updateUserCoachingPreferences(userId, selectedSpecialties);

      // Mark coaching selection step as completed
      await this.completeOnboardingStep(userId, 'coaching_selection');

      console.log(`Coaching selection processed for user: ${userId}`);
    } catch (error) {
      console.error('Error processing coaching selection:', error);
      throw error;
    }
  }

  // Generate coaching recommendation based on user's responses
  static generateCoachingRecommendation(responses: {
    mainArea: string;
    specificNeeds: string[];
    experience: string;
    goals: string[];
  }): CoachingSpecialty[] {
    const recommendations: CoachingSpecialty[] = [];

    // Map user responses to coaching specialties
    const categoryMap: { [key: string]: CoachingSpecialty['category'] } = {
      'personal': 'personal',
      'financial': 'financial',
      'health': 'health',
      'business': 'business',
      'relationships': 'relationships',
      'recovery': 'recovery'
    };

    const category = categoryMap[responses.mainArea];
    if (category) {
      const specialties = this.getCoachingSpecialtiesByCategory(category);
      recommendations.push(...specialties);
    }

    // Add additional relevant specialties based on specific needs
    responses.specificNeeds.forEach(need => {
      const relevantSpecialty = this.COACHING_SPECIALTIES.find(specialty =>
        specialty.subcategories?.some(sub => sub.toLowerCase().includes(need.toLowerCase()))
      );
      if (relevantSpecialty && !recommendations.find(r => r.id === relevantSpecialty.id)) {
        recommendations.push(relevantSpecialty);
      }
    });

    return recommendations;
  }

  // Create coaching flow based on user's journey
  static createCoachingFlow(initialResponse: string): {
    message: string;
    options: { id: string; text: string }[];
    nextStep: string;
  } {
    const flowMap: { [key: string]: any } = {
      'welcome': {
        message: "Hello! I'm here to help you find the right type of coaching for your needs. What area are you looking for support in?",
        options: [
          { id: 'personal', text: 'Personal Development' },
          { id: 'financial', text: 'Financial Management' },
          { id: 'health', text: 'Health and Wellness' },
          { id: 'business', text: 'Business Growth' },
          { id: 'relationships', text: 'Relationships' },
          { id: 'recovery', text: 'Recovery Support' }
        ],
        nextStep: 'category_selected'
      },
      'personal': {
        message: "Are you interested in weight loss, mindset coaching, or life coaching?",
        options: [
          { id: 'weight_loss', text: 'Weight Loss Coaching' },
          { id: 'mindset', text: 'Mindset Coaching' },
          { id: 'life_coaching', text: 'General Life Coaching' }
        ],
        nextStep: 'specialty_selected'
      },
      'financial': {
        message: "Would you like support with budgeting, debt management, or financial planning?",
        options: [
          { id: 'budgeting', text: 'Budgeting Help' },
          { id: 'debt', text: 'Debt Management' },
          { id: 'planning', text: 'Financial Planning' }
        ],
        nextStep: 'specialty_selected'
      },
      'health': {
        message: "Are you looking for weight loss coaching or general health coaching?",
        options: [
          { id: 'weight_loss', text: 'Weight Loss Coaching' },
          { id: 'general_health', text: 'General Health & Wellness' }
        ],
        nextStep: 'specialty_selected'
      },
      'business': {
        message: "Do you need help with business strategies, marketing, or entrepreneurship?",
        options: [
          { id: 'strategy', text: 'Business Strategy' },
          { id: 'marketing', text: 'Marketing Support' },
          { id: 'entrepreneurship', text: 'Entrepreneurship' }
        ],
        nextStep: 'specialty_selected'
      },
      'relationships': {
        message: "Are you seeking help with a romantic relationship, friendships, or family dynamics?",
        options: [
          { id: 'romantic', text: 'Romantic Relationships' },
          { id: 'friendships', text: 'Friendships' },
          { id: 'family', text: 'Family Dynamics' }
        ],
        nextStep: 'specialty_selected'
      },
      'recovery': {
        message: "Have you experienced domestic violence, and would you like support in recovery?",
        options: [
          { id: 'trauma_recovery', text: 'Trauma Recovery' },
          { id: 'emotional_healing', text: 'Emotional Healing' },
          { id: 'safety_planning', text: 'Safety Planning' },
          { id: 'empowerment', text: 'Empowerment Support' }
        ],
        nextStep: 'specialty_selected'
      }
    };

    return flowMap[initialResponse] || flowMap['welcome'];
  }

  // Process password reset request
  static async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists for security
        return;
      }

      const resetToken = emailService.generateResetToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await storage.createPasswordResetToken(user.id, resetToken, expiresAt);
      await emailService.sendPasswordResetEmail(email, resetToken);

      console.log(`Password reset requested for: ${email}`);
    } catch (error) {
      console.error('Error processing password reset request:', error);
      throw error;
    }
  }

  // Reset password with token
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const resetData = await storage.getPasswordResetToken(token);
      if (!resetData || resetData.expiresAt < new Date()) {
        throw new Error('Invalid or expired reset token');
      }

      const hashedPassword = await AuthService.hashPassword(newPassword);
      await storage.updateUserPassword(resetData.userId, hashedPassword);
      await storage.deletePasswordResetToken(token);

      console.log(`Password reset completed for user: ${resetData.userId}`);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // Verify email with token
  static async verifyEmail(token: string): Promise<void> {
    try {
      const verificationData = await storage.getEmailVerificationToken(token);
      if (!verificationData) {
        throw new Error('Invalid verification token');
      }

      await storage.markEmailAsVerified(verificationData.userId);
      await storage.deleteEmailVerificationToken(token);
      await this.completeOnboardingStep(verificationData.userId, 'email_verification');

      console.log(`Email verified for user: ${verificationData.userId}`);
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }
}

export const onboardingService = OnboardingService;