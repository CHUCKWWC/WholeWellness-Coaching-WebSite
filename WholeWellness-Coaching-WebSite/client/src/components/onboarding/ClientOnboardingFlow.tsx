import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from './OnboardingContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import step components
import WelcomeExplanationStep from './steps/WelcomeExplanationStep';
import CoachingNeedsStep from './steps/CoachingNeedsStep';
import ProfilingGoalsStep from './steps/ProfilingGoalsStep';
import LifestyleSchedulingStep from './steps/LifestyleSchedulingStep';
import ConsentPrivacyStep from './steps/ConsentPrivacyStep';
import AccountPaymentStep from './steps/AccountPaymentStep';
import CoachMatchingStep from './steps/CoachMatchingStep';
import SessionSchedulingStep from './steps/SessionSchedulingStep';

const steps = [
  { title: 'Welcome', component: WelcomeExplanationStep },
  { title: 'Coaching Needs', component: CoachingNeedsStep },
  { title: 'Your Profile & Goals', component: ProfilingGoalsStep },
  { title: 'Lifestyle & Scheduling', component: LifestyleSchedulingStep },
  { title: 'Consent & Privacy', component: ConsentPrivacyStep },
  { title: 'Account & Payment', component: AccountPaymentStep },
  { title: 'Coach Matching', component: CoachMatchingStep },
  { title: 'Schedule Session', component: SessionSchedulingStep }
];

export default function ClientOnboardingFlow() {
  const { 
    currentStep, 
    totalSteps, 
    progress, 
    nextStep, 
    previousStep,
    saveProgress,
    isLoading 
  } = useOnboarding();

  const [isValidStep, setIsValidStep] = useState(false);

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = async () => {
    if (isValidStep) {
      try {
        await saveProgress();
        nextStep();
        setIsValidStep(false);
      } catch (error) {
        // Error is handled in context
      }
    }
  };

  const handlePrevious = () => {
    previousStep();
    setIsValidStep(true); // Previous steps are already valid
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">Your Personalized Coaching Journey</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.location.href = '/'}
              className="text-gray-500 hover:text-gray-700"
            >
              Skip Onboarding
            </Button>
          </div>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Step Content */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>
            {currentStep === 0 ? 
              'Learn how WholeWellnessCoaching.org works and the value of finding the right coach.' :
              'This information helps us match you with the perfect coach for your needs.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
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

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={!isValidStep || isLoading}
          className="flex items-center gap-2"
        >
          {currentStep === totalSteps - 1 ? 'Complete Registration' : 'Next'}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Help Text */}
      <div className="mt-8 text-center text-sm text-gray-600">
        <p>Need help? Contact us at support@wholewellnesscoaching.org</p>
        <p>Your information is secure and confidential.</p>
      </div>
    </div>
  );
}