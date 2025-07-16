import { OnboardingProvider } from '@/components/onboarding/OnboardingContext';
import ClientOnboardingFlow from '@/components/onboarding/ClientOnboardingFlow';

export default function DigitalOnboarding() {
  // Direct to client onboarding questionnaire flow
  return (
    <OnboardingProvider onboardingType="client">
      <ClientOnboardingFlow />
    </OnboardingProvider>
  );
}