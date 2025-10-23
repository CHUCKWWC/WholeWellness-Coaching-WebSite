import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface UserPreferences {
  role: 'member' | 'coach' | 'admin' | 'visitor';
  interests: string[];
  experience: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  communicationStyle: 'supportive' | 'direct' | 'analytical' | 'motivational';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  availableTime: string;
  triggers?: string;
  preferences: {
    notifications: boolean;
    publicProfile: boolean;
    dataSharing: boolean;
  };
}

interface OnboardingProgress {
  isCompleted: boolean;
  currentStep: number;
  completedTutorials: string[];
  skippedSteps: string[];
  preferences?: UserPreferences;
}

export function useOnboarding() {
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);
  const [progress, setProgress] = useState<OnboardingProgress>({
    isCompleted: false,
    currentStep: 0,
    completedTutorials: [],
    skippedSteps: []
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load onboarding progress from localStorage and server
  useEffect(() => {
    loadOnboardingProgress();
  }, []);

  const loadOnboardingProgress = async () => {
    setIsLoading(true);
    try {
      // Try to load from server first
      const serverProgress = await apiRequest<OnboardingProgress>(
        'GET',
        '/api/user/onboarding-progress'
      );
      setProgress(serverProgress);

      // Save to localStorage as backup
      localStorage.setItem('onboarding-progress', JSON.stringify(serverProgress));
    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
      // Fallback to localStorage
      const localProgress = localStorage.getItem('onboarding-progress');
      if (localProgress) {
        setProgress(JSON.parse(localProgress));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveOnboardingProgress = async (newProgress: OnboardingProgress) => {
    setProgress(newProgress);
    
    // Save to localStorage immediately
    localStorage.setItem('onboarding-progress', JSON.stringify(newProgress));
    
    // Try to save to server
    try {
      await apiRequest('POST', '/api/user/onboarding-progress', newProgress);
    } catch (error) {
      console.error('Failed to save onboarding progress to server:', error);
      // Continue with localStorage backup
    }
  };

  const startOnboarding = () => {
    setIsOnboardingVisible(true);
  };

  const completeOnboarding = async (preferences: UserPreferences) => {
    const completedProgress: OnboardingProgress = {
      ...progress,
      isCompleted: true,
      preferences
    };
    
    await saveOnboardingProgress(completedProgress);
    
    // Save user preferences to profile
    try {
      await apiRequest('POST', '/api/user/preferences', preferences);
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
    
    setIsOnboardingVisible(false);
    
    // Store user role for route preloading
    localStorage.setItem('userRole', preferences.role);
    
    return completedProgress;
  };

  const skipOnboarding = async () => {
    const skippedProgress: OnboardingProgress = {
      ...progress,
      isCompleted: true,
      skippedSteps: ['all']
    };
    
    await saveOnboardingProgress(skippedProgress);
    setIsOnboardingVisible(false);
    
    return skippedProgress;
  };

  const markTutorialCompleted = async (tutorialId: string) => {
    const updatedProgress = {
      ...progress,
      completedTutorials: [...progress.completedTutorials, tutorialId]
    };
    
    await saveOnboardingProgress(updatedProgress);
  };

  const updateStep = async (step: number) => {
    const updatedProgress = {
      ...progress,
      currentStep: step
    };
    
    await saveOnboardingProgress(updatedProgress);
  };

  const resetOnboarding = async () => {
    const resetProgress: OnboardingProgress = {
      isCompleted: false,
      currentStep: 0,
      completedTutorials: [],
      skippedSteps: []
    };
    
    await saveOnboardingProgress(resetProgress);
    localStorage.removeItem('userRole');
  };

  const shouldShowOnboarding = () => {
    // Show onboarding if:
    // 1. User is not authenticated (show basic intro)
    // 2. User is authenticated but hasn't completed onboarding
    // 3. User specifically requests to see onboarding again
    
    if (isLoading) return false;
    
    const hasUser = localStorage.getItem('userRole');
    return !progress.isCompleted && (!hasUser || hasUser === 'visitor');
  };

  const getRecommendedTutorials = (userRole?: string, interests?: string[]) => {
    const roleTutorials: Record<string, string[]> = {
      'member': ['platform-basics', 'ai-coaching-intro', 'wellness-tracking', 'goal-setting'],
      'coach': ['coach-dashboard', 'client-management', 'session-booking', 'certification-system'],
      'admin': ['admin-overview', 'user-management', 'analytics-dashboard', 'content-management'],
      'visitor': ['platform-basics', 'ai-coaching-intro']
    };
    
    const interestTutorials: Record<string, string[]> = {
      'weight-loss': ['nutrition-tracking', 'fitness-plans', 'weight-loss-coaching'],
      'mental-health': ['mindfulness-practices', 'therapy-tools', 'mood-tracking'],
      'relationships': ['communication-skills', 'relationship-coaching', 'conflict-resolution'],
      'mindfulness': ['meditation-guide', 'breathing-exercises', 'stress-management']
    };
    
    let recommended = roleTutorials[userRole || 'visitor'] || [];
    
    if (interests) {
      interests.forEach(interest => {
        if (interestTutorials[interest]) {
          recommended = [...recommended, ...interestTutorials[interest]];
        }
      });
    }
    
    // Remove duplicates and filter out already completed
    return Array.from(new Set(recommended)).filter(
      tutorial => !progress.completedTutorials.includes(tutorial)
    );
  };

  const getOnboardingStats = () => {
    const totalSteps = 7; // Based on OnboardingExperience steps
    const completionPercentage = progress.isCompleted 
      ? 100 
      : (progress.currentStep / totalSteps) * 100;
    
    return {
      completionPercentage,
      completedTutorials: progress.completedTutorials.length,
      totalSteps,
      currentStep: progress.currentStep,
      isCompleted: progress.isCompleted
    };
  };

  return {
    // State
    isOnboardingVisible,
    progress,
    isLoading,
    
    // Actions
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    markTutorialCompleted,
    updateStep,
    resetOnboarding,
    
    // Utilities
    shouldShowOnboarding,
    getRecommendedTutorials,
    getOnboardingStats,
    
    // Control
    setIsOnboardingVisible
  };
}

export default useOnboarding;