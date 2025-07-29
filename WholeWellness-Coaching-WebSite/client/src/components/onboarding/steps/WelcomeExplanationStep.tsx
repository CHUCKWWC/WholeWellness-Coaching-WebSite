import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Heart, Users, Award } from 'lucide-react';

interface WelcomeExplanationStepProps {
  onValidChange: (isValid: boolean) => void;
}

export default function WelcomeExplanationStep({ onValidChange }: WelcomeExplanationStepProps) {
  useEffect(() => {
    // Welcome step is always valid - just informational
    onValidChange(true);
  }, [onValidChange]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Welcome to WholeWellnessCoaching.org</h2>
        <p className="text-lg text-gray-600">
          We're here to help you find the perfect coach for your personal growth journey.
        </p>
      </div>

      <Alert className="border-purple-200 bg-purple-50">
        <Heart className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-800">
          Your journey to wellness begins with finding the right support. We'll guide you through a personalized process to match you with a coach who understands your unique needs.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              100% Confidential
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Everything you share is protected by our strict confidentiality standards. Your information is secure and will only be used to find your perfect coach match.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Personalized Matching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              We carefully review your responses to match you with a coach who specializes in your areas of focus and fits your personal preferences.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Qualified Professionals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              All our coaches are thoroughly vetted professionals with proven experience in helping individuals achieve their wellness goals.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              Your Success Matters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              We're committed to your growth. If you're not satisfied with your match, we'll work with you to find a coach who's a better fit.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-700 mb-4">
          <strong>How it works:</strong>
        </p>
        <ol className="text-left max-w-2xl mx-auto space-y-2 text-sm">
          <li>1. Answer questions about your needs and preferences</li>
          <li>2. We review your profile to understand your unique situation</li>
          <li>3. You'll be matched with a coach within 24-48 hours</li>
          <li>4. Start your journey with messaging, voice, or video sessions</li>
        </ol>
      </div>

      <div className="text-center text-sm text-gray-600">
        <p>
          Please answer all questions honestly and completely. This helps us provide the best possible support for your journey.
        </p>
      </div>
    </div>
  );
}