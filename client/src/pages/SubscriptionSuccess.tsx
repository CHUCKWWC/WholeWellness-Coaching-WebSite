import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Home, Calendar, Star, Users } from 'lucide-react';
import { useLocation } from 'wouter';

export default function SubscriptionSuccess() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="border-purple-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-purple-700">Subscription Activated!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Welcome to your coaching subscription! Your payment has been processed successfully.
              </p>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-purple-900">
                    You're all set!
                  </h3>
                </div>
                <p className="text-purple-700">
                  Your subscription is now active and your coach matching process has begun.
                  You'll receive an email confirmation and coach assignment within 24-48 hours.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">What happens next?</h3>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Confirmation Email</h4>
                    <p className="text-sm text-gray-600">
                      You'll receive a subscription confirmation email with all the details.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Coach Matching</h4>
                    <p className="text-sm text-gray-600">
                      We'll match you with a qualified coach based on your preferences and needs.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">First Session</h4>
                    <p className="text-sm text-gray-600">
                      Your coach will reach out to schedule your first session within 48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Your Subscription Benefits</h4>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Professional coaching sessions as per your plan</li>
                <li>• Unlimited messaging between sessions</li>
                <li>• Access to resource library and tools</li>
                <li>• Progress tracking and personalized plans</li>
                <li>• Priority support and crisis assistance</li>
                <li>• Monthly progress reports</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => setLocation('/member-portal')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Member Portal
              </Button>
              
              <Button 
                onClick={() => setLocation('/ai-coaching')}
                variant="outline"
                className="w-full"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Start with AI Coaching
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                You can manage your subscription anytime from your member portal.
              </p>
              <p className="text-xs text-gray-500">
                Need help? Contact us at{' '}
                <a href="mailto:hello@wholewellnesscoaching.org" className="text-purple-600 hover:underline">
                  hello@wholewellnesscoaching.org
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}