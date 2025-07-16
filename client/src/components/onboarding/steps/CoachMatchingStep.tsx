import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, CheckCircle, Users, MessageSquare } from 'lucide-react';

interface CoachMatchingStepProps {
  onValidChange: (isValid: boolean) => void;
}

export default function CoachMatchingStep({ onValidChange }: CoachMatchingStepProps) {
  useEffect(() => {
    // This is an informational step, always valid
    onValidChange(true);
  }, [onValidChange]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center">
          <Users className="h-10 w-10 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Thank You for Completing Your Profile!</h2>
        <p className="text-gray-600">
          Your payment has been processed and we're now working on finding your perfect coach match.
        </p>
      </div>

      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your account has been created successfully and your first billing cycle has begun.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            What Happens Next?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-purple-600">1</span>
            </div>
            <div>
              <h4 className="font-semibold">Profile Review (0-24 hours)</h4>
              <p className="text-sm text-gray-600">
                Our matching team carefully reviews your profile, preferences, and goals to identify coaches who specialize in your areas of focus.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-purple-600">2</span>
            </div>
            <div>
              <h4 className="font-semibold">Coach Selection (24-48 hours)</h4>
              <p className="text-sm text-gray-600">
                We personally match you with a coach based on expertise, availability, and your specific preferences. Quality matching takes time!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-purple-600">3</span>
            </div>
            <div>
              <h4 className="font-semibold">Match Notification</h4>
              <p className="text-sm text-gray-600">
                You'll receive an email with your coach's profile, including their background, approach, and initial message to you.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-purple-600">4</span>
            </div>
            <div>
              <h4 className="font-semibold">Start Your Journey</h4>
              <p className="text-sm text-gray-600">
                Once matched, you can immediately start messaging your coach and schedule your first session at a time that works for both of you.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <MessageSquare className="h-5 w-5" />
            While You Wait
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-800 mb-3">
            Check your email for your welcome packet which includes:
          </p>
          <ul className="space-y-2 text-sm text-blue-700">
            <li className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5"></div>
              Tips for preparing for your first coaching session
            </li>
            <li className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5"></div>
              Access to our resource library and self-help tools
            </li>
            <li className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5"></div>
              Community guidelines and getting the most from coaching
            </li>
            <li className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5"></div>
              Information about group workshops and additional resources
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-600">
        <p>
          Questions? Contact us at support@wholewellnesscoaching.org
        </p>
        <p className="mt-2">
          We're excited to support you on your wellness journey!
        </p>
      </div>
    </div>
  );
}