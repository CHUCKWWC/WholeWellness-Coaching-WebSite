import OnboardingFlow from "@/components/onboarding-flow";

export default function Onboarding() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Client Onboarding</h1>
        <p className="text-gray-600 mt-2">Create and manage your client onboarding experience.</p>
      </div>

      <OnboardingFlow />
    </main>
  );
}
