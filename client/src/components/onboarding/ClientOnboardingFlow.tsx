import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOnboarding } from './OnboardingContext';
import { ChevronLeft, ChevronRight, Save, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedProgressBar from './EnhancedProgressBar';
import MilestoneBanner from './MilestoneBanner';
import TestimonialsCarousel from './TestimonialsCarousel';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

import WelcomeExplanationStep from './steps/WelcomeExplanationStep';
import CoachingNeedsStep from './steps/CoachingNeedsStep';
import ProfilingGoalsStep from './steps/ProfilingGoalsStep';
import LifestyleSchedulingStep from './steps/LifestyleSchedulingStep';
import ConsentPrivacyStep from './steps/ConsentPrivacyStep';
import AccountPaymentStep from './steps/AccountPaymentStep';
import CoachMatchingStep from './steps/CoachMatchingStep';
import SessionSchedulingStep from './steps/SessionSchedulingStep';

const steps = [
  { title: 'Welcome', component: WelcomeExplanationStep, estimatedMinutes: 1, helpText: 'Learn about our matching process and what to expect.' },
  { title: 'Coaching Needs', component: CoachingNeedsStep, estimatedMinutes: 2, helpText: 'Tell us what brings you here so we can find the right support.' },
  { title: 'Your Profile', component: ProfilingGoalsStep, estimatedMinutes: 2, helpText: 'Share your goals and what you want to achieve.' },
  { title: 'Lifestyle', component: LifestyleSchedulingStep, estimatedMinutes: 1, helpText: 'Help us understand your schedule and preferences.' },
  { title: 'Privacy', component: ConsentPrivacyStep, estimatedMinutes: 1, helpText: 'Review how we protect your information.' },
  { title: 'Account', component: AccountPaymentStep, estimatedMinutes: 2, helpText: 'Create your secure account to save your progress.' },
  { title: 'Coach Match', component: CoachMatchingStep, estimatedMinutes: 1, helpText: 'See coaches who specialize in your areas of focus.' },
  { title: 'Schedule', component: SessionSchedulingStep, estimatedMinutes: 1, helpText: 'Book your first session when it works for you.' }
];

const milestoneSteps = [2, 4, 6];

export default function ClientOnboardingFlow() {
  const { 
    currentStep, 
    totalSteps, 
    nextStep, 
    previousStep,
    saveProgress,
    isLoading,
    data 
  } = useOnboarding();

  const [isValidStep, setIsValidStep] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const CurrentStepComponent = steps[currentStep].component;
  const userName = data.firstName;

  useEffect(() => {
    if (milestoneSteps.includes(currentStep) && currentStep > 0) {
      const hasSeenMilestone = sessionStorage.getItem(`milestone_${currentStep}`);
      if (!hasSeenMilestone) {
        setShowMilestone(true);
      }
    }
  }, [currentStep]);

  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      if (Object.keys(data).length > 0) {
        try {
          setIsSaving(true);
          await saveProgress();
          setLastSaved(new Date());
        } catch (error) {
        } finally {
          setIsSaving(false);
        }
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [data, saveProgress]);

  const handleNext = async () => {
    if (isValidStep) {
      try {
        await saveProgress();
        setLastSaved(new Date());
        nextStep();
        setIsValidStep(false);
      } catch (error) {
      }
    }
  };

  const handlePrevious = () => {
    previousStep();
    setIsValidStep(true);
  };

  const handleCloseMilestone = () => {
    sessionStorage.setItem(`milestone_${currentStep}`, 'true');
    setShowMilestone(false);
  };

  const getPersonalizedMessage = () => {
    if (currentStep === 0) {
      return userName 
        ? `Welcome, ${userName}! Let's find your perfect coach.`
        : "Let's find your perfect coach match.";
    }
    const messages = [
      "We're here to support you every step of the way.",
      "Your journey to wellness is unique and valuable.",
      "Take your time - there's no rush.",
      "Every answer helps us serve you better.",
      "You're making great progress!",
      "Almost there - your coach is waiting!",
      "You're so close to your first session!",
      "Let's finalize your coaching journey!"
    ];
    return userName 
      ? `${userName}, ${messages[currentStep].toLowerCase()}`
      : messages[currentStep];
  };

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <AnimatePresence>
          {showMilestone && (
            <MilestoneBanner
              milestone={currentStep}
              totalSteps={totalSteps}
              userName={userName}
              onContinue={handleCloseMilestone}
              onboardingType="client"
            />
          )}
        </AnimatePresence>

        <EnhancedProgressBar 
          currentStep={currentStep}
          steps={steps}
          userName={userName}
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        >
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {getPersonalizedMessage()}
            </h2>
            {lastSaved && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <Save className="h-3 w-3" />
                {isSaving ? 'Saving...' : `Last saved ${lastSaved.toLocaleTimeString()}`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-500"
                  data-testid="button-help"
                >
                  <HelpCircle className="h-4 w-4 mr-1" />
                  Help
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p>{steps[currentStep].helpText}</p>
              </TooltipContent>
            </Tooltip>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.location.href = '/'}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              data-testid="button-skip-onboarding"
            >
              Skip for now
            </Button>
          </div>
        </motion.div>

        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {steps[currentStep].title}
                  <Badge variant="secondary" className="text-xs">
                    ~{steps[currentStep].estimatedMinutes} min
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  {currentStep === 0 
                    ? 'Learn how WholeWellnessCoaching.org works and the value of finding the right coach.'
                    : 'This information helps us match you with the perfect coach for your needs.'
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CurrentStepComponent onValidChange={setIsValidStep} />
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center justify-center gap-2 py-6 sm:py-4"
            data-testid="button-previous"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isValidStep || isLoading}
            className="flex items-center justify-center gap-2 py-6 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            data-testid="button-next"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <>
                {currentStep === totalSteps - 1 ? 'Complete Registration' : 'Continue'}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {currentStep === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <TestimonialsCarousel type="client" />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400 space-y-1"
        >
          <p className="flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Your information is secure and encrypted
          </p>
          <p>Need help? Contact us at support@wholewellnesscoaching.org</p>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
