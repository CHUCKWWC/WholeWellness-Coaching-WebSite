import { useEffect, useState } from 'react';
import { useOnboarding } from '../OnboardingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Video, Phone, MessageSquare, Clock, CheckCircle } from 'lucide-react';

interface SessionSchedulingStepProps {
  onValidChange: (isValid: boolean) => void;
}

export default function SessionSchedulingStep({ onValidChange }: SessionSchedulingStepProps) {
  const { data, updateData } = useOnboarding();
  const [sessionPreference, setSessionPreference] = useState(data.sessionPreference || '');

  useEffect(() => {
    // This step is always valid as it's the final confirmation
    onValidChange(true);
  }, [onValidChange]);

  useEffect(() => {
    updateData({
      sessionPreference
    });
  }, [sessionPreference, updateData]);

  const sessionTypes = [
    {
      id: 'video',
      icon: <Video className="h-6 w-6" />,
      title: 'Video Sessions',
      description: 'Face-to-face connection from anywhere',
      features: ['Most personal experience', 'Visual cues and body language', 'Screen sharing for resources']
    },
    {
      id: 'phone',
      icon: <Phone className="h-6 w-6" />,
      title: 'Phone Sessions',
      description: 'Convenient voice coaching',
      features: ['No camera needed', 'Walk and talk option', 'Great for busy schedules']
    },
    {
      id: 'chat',
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'Chat Sessions',
      description: 'Text-based coaching sessions',
      features: ['Written record of insights', 'Time to reflect on responses', 'Perfect for written processors']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Almost There!</h2>
        <p className="text-gray-600">
          Choose how you'd like to connect with your coach for sessions.
        </p>
      </div>

      <Alert className="border-purple-200 bg-purple-50">
        <Calendar className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-800">
          Once matched with your coach, you'll have access to our scheduling system to book sessions at times that work for both of you.
        </AlertDescription>
      </Alert>

      {/* Session Type Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Preferred Session Type</h3>
        <p className="text-sm text-gray-600">You can change this anytime based on your needs.</p>
        
        {sessionTypes.map((type) => (
          <Card 
            key={type.id}
            className={`cursor-pointer transition-all ${
              sessionPreference === type.id 
                ? 'border-purple-500 bg-purple-50 shadow-md' 
                : 'hover:border-gray-300'
            }`}
            onClick={() => setSessionPreference(type.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  sessionPreference === type.id ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  {type.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{type.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                  <ul className="text-sm space-y-1">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* What to Expect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            What to Expect Next
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold mb-1">Immediate Access</h4>
            <p className="text-sm text-gray-600">
              As soon as you're matched, you'll have access to:
            </p>
            <ul className="mt-2 ml-4 text-sm text-gray-600 space-y-1 list-disc">
              <li>Your secure messaging portal with your coach</li>
              <li>Online scheduling system for sessions</li>
              <li>Journaling tools and progress tracking</li>
              <li>Resource library and self-help materials</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-1">First Session</h4>
            <p className="text-sm text-gray-600">
              Your first session will focus on getting to know each other, understanding your goals in depth, and creating an initial action plan for your coaching journey.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Ongoing Support</h4>
            <p className="text-sm text-gray-600">
              Between sessions, you can message your coach anytime through the platform. They typically respond within 24 hours during business days.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Final Confirmation */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              You're All Set!
            </h3>
            <p className="text-sm text-green-700">
              Click "Complete Registration" below to finalize your onboarding. You'll receive a confirmation email with all the details about your account and next steps.
            </p>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          <strong>Remember:</strong> If you're not satisfied with your coach match, we'll work with you to find someone who's a better fit. Your success is our priority!
        </AlertDescription>
      </Alert>
    </div>
  );
}