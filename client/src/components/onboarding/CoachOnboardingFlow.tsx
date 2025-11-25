import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOnboarding } from './OnboardingContext';
import { ChevronLeft, ChevronRight, Save, HelpCircle, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedProgressBar from './EnhancedProgressBar';
import MilestoneBanner from './MilestoneBanner';
import TestimonialsCarousel from './TestimonialsCarousel';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

import CoachPersonalInfoStep from './steps/coach/CoachPersonalInfoStep';
import CoachPaymentStep from './steps/coach/CoachPaymentStep';
import CoachQualificationsStep from './steps/coach/CoachQualificationsStep';
import CoachSpecializationsStep from './steps/coach/CoachSpecializationsStep';
import CoachAvailabilityStep from './steps/coach/CoachAvailabilityStep';
import CoachBankingStep from './steps/coach/CoachBankingStep';
import CoachReviewStep from './steps/coach/CoachReviewStep';

const steps = [
  { title: 'Personal Info', component: CoachPersonalInfoStep, estimatedMinutes: 3, helpText: 'Tell us about yourself and your coaching background.' },
  { title: 'Application Fee', component: CoachPaymentStep, estimatedMinutes: 2, helpText: 'A one-time fee to cover background verification and processing.' },
  { title: 'Qualifications', component: CoachQualificationsStep, estimatedMinutes: 3, helpText: 'Share your certifications and professional experience.' },
  { title: 'Specializations', component: CoachSpecializationsStep, estimatedMinutes: 2, helpText: 'Select the areas where you excel at helping clients.' },
  { title: 'Availability', component: CoachAvailabilityStep, estimatedMinutes: 2, helpText: 'Set your working hours and session preferences.' },
  { title: 'Banking', component: CoachBankingStep, estimatedMinutes: 2, helpText: 'Set up how you want to receive your earnings.' },
  { title: 'Review', component: CoachReviewStep, estimatedMinutes: 1, helpText: 'Review your application before submitting.' }
];

const milestoneSteps = [2, 4, 6];

export default function CoachOnboardingFlow() {
  const { 
    currentStep, 
    totalSteps, 
    nextStep, 
    previousStep,
    saveProgress,
    isLoading,
    data,
    updateData
  } = useOnboarding();

  const [isValidStep, setIsValidStep] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const CurrentStepComponent = steps[currentStep].component;
  const userName = data.firstName;

  useEffect(() => {
    const handlePaymentComplete = (event: CustomEvent) => {
      if (event.detail.paid) {
        setPaymentVerified(true);
        updateData({ applicationFeePaid: true });
      }
    };

    window.addEventListener('coachPaymentComplete' as any, handlePaymentComplete);
    return () => {
      window.removeEventListener('coachPaymentComplete' as any, handlePaymentComplete);
    };
  }, [updateData]);

  useEffect(() => {
    if (data.applicationFeePaid) {
      setPaymentVerified(true);
    }
  }, [data.applicationFeePaid]);

  useEffect(() => {
    if (milestoneSteps.includes(currentStep) && currentStep > 0) {
      const hasSeenMilestone = sessionStorage.getItem(`coach_milestone_${currentStep}`);
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
    if (currentStep === 1 && !paymentVerified) {
      return;
    }

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
    sessionStorage.setItem(`coach_milestone_${currentStep}`, 'true');
    setShowMilestone(false);
  };

  const getPersonalizedMessage = () => {
    if (currentStep === 0) {
      return userName 
        ? `Welcome, ${userName}! Let's start your coach application.`
        : "Let's get you started as a wellness coach.";
    }
    const messages = [
      "Thank you for wanting to make a difference!",
      "Your investment helps us maintain high standards.",
      "Your expertise will help so many people.",
      "These skills make you uniquely qualified.",
      "Set a schedule that works for your life.",
      "Almost done with your application!",
      "Review everything before we submit."
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
              onboardingType="coach"
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
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Award className="h-6 w-6 text-blue-600" />
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
              data-testid="button-exit-application"
            >
              Exit Application
            </Button>
          </div>
        </motion.div>

        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {steps[currentStep].title}
                  <Badge variant="secondary" className="text-xs">
                    ~{steps[currentStep].estimatedMinutes} min
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  Join our team of professional wellness coaches making a difference.
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
            disabled={!isValidStep || isLoading || (currentStep === 1 && !paymentVerified)}
            className="flex items-center justify-center gap-2 py-6 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            data-testid="button-next"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <>
                {currentStep === totalSteps - 1 ? 'Submit Application' : 'Continue'}
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
            <TestimonialsCarousel type="coach" />
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
          <p>Questions? Email us at coaches@wholewellnesscoaching.org</p>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
