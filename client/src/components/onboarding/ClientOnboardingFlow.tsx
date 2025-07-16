import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from './OnboardingContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import step components
import PersonalInfoStep from './steps/PersonalInfoStep';
import GoalsAndNeedsStep from './steps/GoalsAndNeedsStep';
import HealthAssessmentStep from './steps/HealthAssessmentStep';
import SupportPreferencesStep from './steps/SupportPreferencesStep';
import SafetyAssessmentStep from './steps/SafetyAssessmentStep';
import WelcomePacketStep from './steps/WelcomePacketStep';
import SchedulingStep from './steps/SchedulingStep';
import ReviewAndSubmitStep from './steps/ReviewAndSubmitStep';

const steps = [
  { title: 'Personal Information', component: PersonalInfoStep },
  { title: 'Goals & Needs', component: GoalsAndNeedsStep },
  { title: 'Health Assessment', component: HealthAssessmentStep },
  { title: 'Support Preferences', component: SupportPreferencesStep },
  { title: 'Safety Assessment', component: SafetyAssessmentStep },
  { title: 'Welcome Packet', component: WelcomePacketStep },
  { title: 'Schedule Discovery Call', component: SchedulingStep },
  { title: 'Review & Submit', component: ReviewAndSubmitStep }
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
          <h2 className="text-2xl font-bold">Welcome to Your Wellness Journey</h2>
          <span className="text-sm text-gray-600">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Step Content */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>
            Please provide accurate information to help us create the best support plan for you.
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
          {currentStep === totalSteps - 1 ? 'Complete' : 'Next'}
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