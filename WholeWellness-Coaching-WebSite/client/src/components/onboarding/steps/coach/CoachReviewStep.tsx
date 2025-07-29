import { useEffect, useState } from 'react';
import { useOnboarding } from '../../OnboardingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Edit, User, GraduationCap, Heart, Calendar, DollarSign } from 'lucide-react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface CoachReviewStepProps {
  onValidChange: (isValid: boolean) => void;
}

export default function CoachReviewStep({ onValidChange }: CoachReviewStepProps) {
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
        title: "Application Submitted!",
        description: "We'll review your application and contact you within 48 hours.",
      });
      navigate('/coach-portal');
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
        { label: 'Location', value: (data as any).location },
        { label: 'LinkedIn', value: (data as any).linkedIn || 'Not provided' }
      ]
    },
    {
      title: 'Qualifications',
      icon: <GraduationCap className="h-5 w-5" />,
      step: 1,
      items: [
        { label: 'Years of Experience', value: `${(data as any).yearsOfExperience} years` },
        { label: 'Certifications', value: `${(data as any).certifications?.length || 0} certifications` },
        { label: 'Background Check', value: (data as any).backgroundCheckConsent ? 'Consented' : 'Not consented' }
      ]
    },
    {
      title: 'Specializations',
      icon: <Heart className="h-5 w-5" />,
      step: 2,
      items: [
        { label: 'Areas of Focus', value: (data as any).specializations?.join(', ') || 'None selected' }
      ]
    },
    {
      title: 'Availability',
      icon: <Calendar className="h-5 w-5" />,
      step: 3,
      items: [
        { label: 'Available Days', value: (data as any).availability?.filter((d: any) => d.available).map((d: any) => d.day).join(', ') || 'None' },
        { label: 'Session Types', value: (data as any).sessionTypesOffered?.join(', ') || 'None' },
        { label: 'Client Capacity', value: `${(data as any).minClientsPerWeek}-${(data as any).maxClientsPerWeek} per week` },
        { label: 'Timezone', value: (data as any).timezone }
      ]
    },
    {
      title: 'Payment Setup',
      icon: <DollarSign className="h-5 w-5" />,
      step: 4,
      items: [
        { label: 'Payment Method', value: (data as any).paymentMethod === 'direct_deposit' ? 'Direct Deposit' : 'Paper Check' },
        { label: 'Bank', value: (data as any).bankingInfo?.bankName || 'N/A' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Please review your application before submitting. You can edit any section if needed.
        </AlertDescription>
      </Alert>

      {sections.map((section) => (
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
                .filter(item => item.value && item.value !== 'None')
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
              <span>Our team will review your application within 48 hours</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <span>We'll schedule a video interview to discuss your experience and approach</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <span>Background verification will be initiated with your consent</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <span>Once approved, you'll receive onboarding materials and training resources</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-600">
        <p>
          By submitting this application, you agree to our coach agreement and code of conduct.
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="min-w-[200px]"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </div>
  );
}