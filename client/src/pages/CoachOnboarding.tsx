import { OnboardingProvider } from '@/components/onboarding/OnboardingContext';
import CoachOnboardingFlow from '@/components/onboarding/CoachOnboardingFlow';

export default function CoachOnboarding() {
  return (
    <OnboardingProvider onboardingType="coach">
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
        <CoachOnboardingFlow />
      </div>
    </OnboardingProvider>
  );
}