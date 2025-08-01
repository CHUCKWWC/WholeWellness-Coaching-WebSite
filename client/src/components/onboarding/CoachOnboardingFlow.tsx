import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from './OnboardingContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import coach-specific step components
import CoachPersonalInfoStep from './steps/coach/CoachPersonalInfoStep';
import CoachPaymentStep from './steps/coach/CoachPaymentStep';
import CoachQualificationsStep from './steps/coach/CoachQualificationsStep';
import CoachSpecializationsStep from './steps/coach/CoachSpecializationsStep';
import CoachAvailabilityStep from './steps/coach/CoachAvailabilityStep';
import CoachBankingStep from './steps/coach/CoachBankingStep';
import CoachReviewStep from './steps/coach/CoachReviewStep';

const steps = [
  { title: 'Personal Information', component: CoachPersonalInfoStep },
  { title: 'Application Payment', component: CoachPaymentStep },
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
    isLoading,
    data,
    updateData
  } = useOnboarding();

  const [isValidStep, setIsValidStep] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  const CurrentStepComponent = steps[currentStep].component;

  // Listen for payment completion
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

  // Check if payment is already completed
  useEffect(() => {
    if (data.applicationFeePaid) {
      setPaymentVerified(true);
    }
  }, [data.applicationFeePaid]);

  const handleNext = async () => {
    // For payment step (step 1), require payment verification
    if (currentStep === 1 && !paymentVerified) {
      return;
    }

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
              Exit Application
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