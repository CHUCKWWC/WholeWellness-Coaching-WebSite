import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from './OnboardingContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import coach-specific step components
import CoachPersonalInfoStep from './steps/coach/CoachPersonalInfoStep';
import CoachQualificationsStep from './steps/coach/CoachQualificationsStep';
import CoachSpecializationsStep from './steps/coach/CoachSpecializationsStep';
import CoachAvailabilityStep from './steps/coach/CoachAvailabilityStep';
import CoachBankingStep from './steps/coach/CoachBankingStep';
import CoachReviewStep from './steps/coach/CoachReviewStep';

const steps = [
  { title: 'Personal Information', component: CoachPersonalInfoStep },
  { title: 'Qualifications & Experience', component: CoachQualificationsStep },
  { title: 'Coaching Specializations', component: CoachSpecializationsStep },
  { title: 'Availability & Schedule', component: CoachAvailabilityStep },
  { title: 'Banking & Compensation', component: CoachBankingStep },
  { title: 'Review & Submit', component: CoachReviewStep }
];

export default function CoachOnboardingFlow() {
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
          <h2 className="text-2xl font-bold">Coach Application</h2>
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
            Join our team of professional wellness coaches making a difference.
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
          {currentStep === totalSteps - 1 ? 'Submit Application' : 'Next'}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Help Text */}
      <div className="mt-8 text-center text-sm text-gray-600">
        <p>Questions? Email us at coaches@wholewellnesscoaching.org</p>
        <p>All information is kept confidential and secure.</p>
      </div>
    </div>
  );
}