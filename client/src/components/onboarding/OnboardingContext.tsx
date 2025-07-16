import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface OnboardingData {
  // Personal Info
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  pronouns?: string;

  // Goals & Needs
  primaryGoal?: string;
  specificChallenges?: string[];
  previousSupport?: string;
  urgencyLevel?: string;

  // Health & Wellness
  healthConcerns?: string[];
  medications?: string;
  sleepQuality?: number;
  stressLevel?: number;
  exerciseFrequency?: string;

  // Support Preferences
  coachingStyle?: string[];
  sessionFrequency?: string;
  preferredDays?: string[];
  preferredTimes?: string[];
  communicationPreference?: string;

  // Safety & Emergency
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  currentSafetyLevel?: number;
  needsImmediateSupport?: boolean;

  // Coach-specific (for coach onboarding)
  certifications?: string[];
  specializations?: string[];
  yearsOfExperience?: number;
  availability?: any;
  bankingInfo?: any;
  backgroundCheckConsent?: boolean;
}

interface OnboardingContextType {
  currentStep: number;
  totalSteps: number;
  onboardingType: 'client' | 'coach';
  data: OnboardingData;
  progress: number;
  updateData: (newData: Partial<OnboardingData>) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  saveProgress: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
  onboardingType: 'client' | 'coach';
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ 
  children, 
  onboardingType 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = onboardingType === 'client' ? 8 : 6;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Load saved progress from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`onboarding_${onboardingType}_data`);
    const savedStep = localStorage.getItem(`onboarding_${onboardingType}_step`);
    
    if (savedData) {
      setData(JSON.parse(savedData));
    }
    if (savedStep) {
      setCurrentStep(parseInt(savedStep, 10));
    }
  }, [onboardingType]);

  // Save progress to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(`onboarding_${onboardingType}_data`, JSON.stringify(data));
    localStorage.setItem(`onboarding_${onboardingType}_step`, currentStep.toString());
  }, [data, currentStep, onboardingType]);

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  const saveProgress = async () => {
    // For now, we'll only save progress locally since the user isn't authenticated yet
    // The actual saving to database will happen when they create their account
    setIsLoading(true);
    setError(null);
    
    try {
      // Save to localStorage
      localStorage.setItem(`onboarding_${onboardingType}_data`, JSON.stringify(data));
      localStorage.setItem(`onboarding_${onboardingType}_step`, currentStep.toString());
      
      // We'll save to the database after account creation in the AccountPaymentStep
      setIsLoading(false);
    } catch (err) {
      setError('Failed to save progress. Please try again.');
      throw err;
    }
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Only attempt to save to database if user is authenticated
      // This will be called after account creation in the AccountPaymentStep
      const sessionToken = document.cookie.split('; ').find(row => row.startsWith('session_token='));
      
      if (sessionToken) {
        await apiRequest('POST', '/api/onboarding/complete', {
          type: onboardingType,
          data
        });
      }
      
      // Clear localStorage after successful completion
      localStorage.removeItem(`onboarding_${onboardingType}_data`);
      localStorage.removeItem(`onboarding_${onboardingType}_step`);
    } catch (err) {
      setError('Failed to complete onboarding. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: OnboardingContextType = {
    currentStep,
    totalSteps,
    onboardingType,
    data,
    progress,
    updateData,
    nextStep,
    previousStep,
    goToStep,
    saveProgress,
    completeOnboarding,
    isLoading,
    error
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};