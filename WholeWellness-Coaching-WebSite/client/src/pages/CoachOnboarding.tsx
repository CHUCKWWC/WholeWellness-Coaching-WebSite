import { OnboardingProvider } from '@/components/onboarding/OnboardingContext';
import CoachOnboardingFlow from '@/components/onboarding/CoachOnboardingFlow';

export default function CoachOnboarding() {
  return (
    <OnboardingProvider onboardingType="coach">
      <div className="min-h-screen bg-gray-50 py-8">
        <CoachOnboardingFlow />
      </div>
    </OnboardingProvider>
  );
}