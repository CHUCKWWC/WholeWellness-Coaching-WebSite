import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowRight, Mail, User, Brain, BookOpen } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  order: number;
}

interface CoachingSpecialty {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategories?: string[];
  icon: string;
  color: string;
}

interface CoachingFlow {
  message: string;
  options: { id: string; text: string }[];
  nextStep: string;
}

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [coachingFlow, setCoachingFlow] = useState<CoachingFlow | null>(null);
  const [flowResponses, setFlowResponses] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get onboarding progress
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/onboarding/progress'],
    retry: false,
  });

  // Get coaching specialties
  const { data: specialtiesData } = useQuery({
    queryKey: ['/api/onboarding/coaching-specialties'],
  });

  // Get welcome coaching flow
  const { data: welcomeFlow } = useQuery({
    queryKey: ['/api/onboarding/welcome-message'],
  });

  const progress = progressData?.progress || [];
  const specialties = specialtiesData?.specialties || [];

  // Complete step mutation
  const completeStepMutation = useMutation({
    mutationFn: async (stepId: string) => {
      return apiRequest(`/api/onboarding/complete-step/${stepId}`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding/progress'] });
      toast({
        title: "Step Completed",
        description: "Great progress! Moving to the next step.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete step. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Coaching selection mutation
  const coachingSelectionMutation = useMutation({
    mutationFn: async (specialties: string[]) => {
      return apiRequest('/api/onboarding/coaching-selection', {
        method: 'POST',
        body: JSON.stringify({ specialties }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding/progress'] });
      toast({
        title: "Preferences Saved",
        description: "Your coaching preferences have been updated!",
      });
      setCurrentStep(currentStep + 1);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Calculate overall progress
  const completedSteps = progress.filter((step: OnboardingStep) => step.completed).length;
  const totalSteps = progress.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // Initialize coaching flow
  useEffect(() => {
    if (welcomeFlow && !coachingFlow) {
      setCoachingFlow(welcomeFlow);
    }
  }, [welcomeFlow, coachingFlow]);

  const handleCoachingFlowResponse = async (responseId: string) => {
    const newResponses = [...flowResponses, responseId];
    setFlowResponses(newResponses);

    try {
      const response = await apiRequest('/api/onboarding/coaching-flow', {
        method: 'POST',
        body: JSON.stringify({ step: 'category_selected', response: responseId }),
      });
      setCoachingFlow(response);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSpecialtyToggle = (specialtyId: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialtyId) 
        ? prev.filter(id => id !== specialtyId)
        : [...prev, specialtyId]
    );
  };

  const handleSaveCoachingSelection = () => {
    if (selectedSpecialties.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one coaching specialty.",
        variant: "destructive",
      });
      return;
    }
    coachingSelectionMutation.mutate(selectedSpecialties);
  };

  const handleCompleteStep = (stepId: string) => {
    completeStepMutation.mutate(stepId);
  };

  const getStepIcon = (step: OnboardingStep) => {
    switch (step.id) {
      case 'email_verification':
        return <Mail className="h-5 w-5" />;
      case 'profile_setup':
        return <User className="h-5 w-5" />;
      case 'coaching_selection':
        return <Brain className="h-5 w-5" />;
      case 'ai_coach_intro':
        return <Brain className="h-5 w-5" />;
      case 'resource_exploration':
        return <BookOpen className="h-5 w-5" />;
      default:
        return <Circle className="h-5 w-5" />;
    }
  };

  if (progressLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your onboarding progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-secondary/5 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Welcome to Whole Wellness Coaching
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Let's personalize your wellness journey. Complete these steps to get the most out of our platform.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completedSteps} of {totalSteps} completed</span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </div>

        {/* Onboarding Steps */}
        <div className="grid gap-6 mb-8">
          {progress.map((step: OnboardingStep, index: number) => (
            <Card key={step.id} className={`${step.completed ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      step.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {step.completed ? <CheckCircle className="h-5 w-5" /> : getStepIcon(step)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                  {step.completed ? (
                    <Badge variant="default" className="bg-green-500">
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Pending
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              {!step.completed && step.id === 'coaching_selection' && (
                <CardContent>
                  <div className="space-y-6">
                    {/* Coaching Flow */}
                    {coachingFlow && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-gray-700 mb-4">{coachingFlow.message}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {coachingFlow.options.map((option) => (
                            <Button
                              key={option.id}
                              variant="outline"
                              onClick={() => handleCoachingFlowResponse(option.id)}
                              className="justify-start h-auto p-4 text-left"
                            >
                              {option.text}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Coaching Specialties Selection */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Select Your Areas of Interest:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {specialties.map((specialty: CoachingSpecialty) => (
                          <Card 
                            key={specialty.id}
                            className={`cursor-pointer transition-all duration-200 ${
                              selectedSpecialties.includes(specialty.id) 
                                ? 'ring-2 ring-primary bg-primary/5' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleSpecialtyToggle(specialty.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                <div className="text-2xl">{specialty.icon}</div>
                                <div className="flex-1">
                                  <h5 className="font-semibold text-gray-900">{specialty.name}</h5>
                                  <p className="text-sm text-gray-600 mb-2">{specialty.description}</p>
                                  {specialty.subcategories && (
                                    <div className="flex flex-wrap gap-1">
                                      {specialty.subcategories.map((sub, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                          {sub}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      {selectedSpecialties.length > 0 && (
                        <div className="mt-6">
                          <Button 
                            onClick={handleSaveCoachingSelection}
                            disabled={coachingSelectionMutation.isPending}
                            className="w-full"
                          >
                            Save My Preferences
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}

              {!step.completed && step.id === 'email_verification' && (
                <CardContent>
                  <div className="text-center py-4">
                    <Mail className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      We've sent a verification email to your address. Please check your inbox and click the verification link.
                    </p>
                    <Button variant="outline" size="sm">
                      Resend Verification Email
                    </Button>
                  </div>
                </CardContent>
              )}

              {!step.completed && step.id === 'profile_setup' && (
                <CardContent>
                  <div className="text-center py-4">
                    <Button 
                      onClick={() => handleCompleteStep(step.id)}
                      disabled={completeStepMutation.isPending}
                    >
                      Complete Profile Setup
                    </Button>
                  </div>
                </CardContent>
              )}

              {!step.completed && step.id === 'ai_coach_intro' && (
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">
                      Ready to meet your AI coaches? Let's introduce you to our intelligent coaching system.
                    </p>
                    <Button 
                      onClick={() => handleCompleteStep(step.id)}
                      disabled={completeStepMutation.isPending}
                    >
                      Meet My AI Coaches
                    </Button>
                  </div>
                </CardContent>
              )}

              {!step.completed && step.id === 'resource_exploration' && (
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">
                      Explore our resource library to discover wellness tools, guides, and educational content.
                    </p>
                    <Button 
                      onClick={() => handleCompleteStep(step.id)}
                      disabled={completeStepMutation.isPending}
                    >
                      Explore Resources
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Completion Message */}
        {progressPercentage === 100 && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                Congratulations! 🎉
              </h3>
              <p className="text-green-700 mb-6">
                You've completed your onboarding. You're all set to begin your wellness journey with us!
              </p>
              <Button 
                size="lg"
                onClick={() => window.location.href = '/ai-coaching'}
              >
                Start Your Coaching Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}