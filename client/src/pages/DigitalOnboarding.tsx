import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OnboardingProvider } from '@/components/onboarding/OnboardingContext';
import ClientOnboardingFlow from '@/components/onboarding/ClientOnboardingFlow';
import CoachOnboardingFlow from '@/components/onboarding/CoachOnboardingFlow';
import { Users, Briefcase, ArrowRight, Shield, Calendar, Heart } from 'lucide-react';

export default function DigitalOnboarding() {
  const [selectedType, setSelectedType] = useState<'client' | 'coach' | null>(null);

  if (selectedType) {
    return (
      <OnboardingProvider onboardingType={selectedType}>
        {selectedType === 'client' ? <ClientOnboardingFlow /> : <CoachOnboardingFlow />}
      </OnboardingProvider>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Whole Wellness Coaching
          </h1>
          <p className="text-xl text-gray-600">
            Let's get you started on your journey. Choose how you'd like to proceed:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Client Card */}
          <Card 
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-purple-500"
            onClick={() => setSelectedType('client')}
          >
            <CardHeader>
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4 mx-auto">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-center text-2xl">I'm Seeking Support</CardTitle>
              <CardDescription className="text-center">
                Start your wellness journey with personalized coaching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Heart className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Personalized wellness assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Safe, confidential support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Flexible scheduling options</span>
                </li>
              </ul>
              <Button className="w-full" size="lg">
                Get Started as a Client
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Coach Card */}
          <Card 
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-blue-500"
            onClick={() => setSelectedType('coach')}
          >
            <CardHeader>
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 mx-auto">
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-center text-2xl">I'm a Coach</CardTitle>
              <CardDescription className="text-center">
                Join our team of wellness professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Professional application process</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Access to training resources</span>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Set your own schedule</span>
                </li>
              </ul>
              <Button className="w-full" size="lg" variant="outline">
                Apply as a Coach
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-purple-600 hover:underline font-medium">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}