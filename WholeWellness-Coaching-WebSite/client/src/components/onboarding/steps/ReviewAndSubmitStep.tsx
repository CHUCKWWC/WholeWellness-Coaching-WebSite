import { useEffect, useState } from 'react';
import { useOnboarding } from '../OnboardingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Edit, User, Target, Heart, Calendar, Shield, FileText } from 'lucide-react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ReviewAndSubmitStepProps {
  onValidChange: (isValid: boolean) => void;
}

export default function ReviewAndSubmitStep({ onValidChange }: ReviewAndSubmitStepProps) {
  const { data, completeOnboarding, goToStep } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    onValidChange(true); // Review step is always valid
  }, [onValidChange]);

  const submitMutation = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast({
        title: "Welcome to Whole Wellness Coaching!",
        description: "Your onboarding is complete. Check your email for next steps.",
      });
      navigate('/dashboard');
    },
    onError: () => {
      toast({
        title: "Submission failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  const handleSubmit = () => {
    setIsSubmitting(true);
    submitMutation.mutate();
  };

  const sections = [
    {
      title: 'Personal Information',
      icon: <User className="h-5 w-5" />,
      step: 0,
      items: [
        { label: 'Name', value: `${data.firstName} ${data.lastName}` },
        { label: 'Email', value: data.email },
        { label: 'Phone', value: data.phone },
        { label: 'Pronouns', value: data.pronouns }
      ]
    },
    {
      title: 'Goals & Needs',
      icon: <Target className="h-5 w-5" />,
      step: 1,
      items: [
        { label: 'Primary Goal', value: data.primaryGoal },
        { label: 'Areas of Support', value: data.specificChallenges?.join(', ') },
        { label: 'Urgency', value: data.urgencyLevel }
      ]
    },
    {
      title: 'Health & Wellness',
      icon: <Heart className="h-5 w-5" />,
      step: 2,
      items: [
        { label: 'Health Concerns', value: data.healthConcerns?.join(', ') || 'None specified' },
        { label: 'Sleep Quality', value: `${data.sleepQuality}/10` },
        { label: 'Stress Level', value: `${data.stressLevel}/10` },
        { label: 'Exercise', value: data.exerciseFrequency }
      ]
    },
    {
      title: 'Support Preferences',
      icon: <Calendar className="h-5 w-5" />,
      step: 3,
      items: [
        { label: 'Coaching Style', value: data.coachingStyle?.join(', ') },
        { label: 'Session Frequency', value: data.sessionFrequency },
        { label: 'Preferred Days', value: data.preferredDays?.join(', ') },
        { label: 'Communication', value: data.communicationPreference }
      ]
    },
    {
      title: 'Safety & Emergency',
      icon: <Shield className="h-5 w-5" />,
      step: 4,
      items: [
        { label: 'Emergency Contact', value: data.emergencyContact?.name },
        { label: 'Safety Level', value: `${data.currentSafetyLevel}/10` }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Please review your information before submitting. You can edit any section if needed.
        </AlertDescription>
      </Alert>

      {sections.map((section, index) => (
        <Card key={section.title}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {section.icon}
                {section.title}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToStep(section.step)}
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {section.items
                .filter(item => item.value)
                .map((item, itemIndex) => (
                  <div key={itemIndex} className="flex justify-between py-1">
                    <span className="text-sm text-gray-600">{item.label}:</span>
                    <span className="text-sm font-medium text-right max-w-[60%]">
                      {item.value}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Separator />

      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">What happens after you submit?</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <span>You'll receive a confirmation email with your scheduled discovery call details</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <span>Your assigned coach will review your information before your call</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <span>You'll get access to your client portal with resources and tools</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <span>We'll send you preparation materials for your first coaching session</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="min-w-[200px]"
        >
          {isSubmitting ? 'Submitting...' : 'Complete Onboarding'}
        </Button>
      </div>
    </div>
  );
}