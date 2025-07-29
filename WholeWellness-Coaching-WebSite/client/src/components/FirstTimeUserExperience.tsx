import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, Sparkles, Target, Brain, Star, Users, Gift } from 'lucide-react';
import { Link } from 'wouter';

interface WelcomeStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  ctaText: string;
  ctaLink: string;
  benefit: string;
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium';
}

const welcomeSteps: WelcomeStep[] = [
  {
    id: 'quick-start',
    title: 'Start with AI Coaching',
    description: 'Get instant support from our specialized AI coaches. Perfect for immediate guidance and answers.',
    icon: <Brain className="h-6 w-6 text-blue-500" />,
    ctaText: 'Try AI Coaching',
    ctaLink: '/ai-coaching',
    benefit: 'Instant results',
    estimatedTime: '2 minutes',
    difficulty: 'Easy'
  },
  {
    id: 'assessment',
    title: 'Discover Your Needs',
    description: 'Take a quick assessment to understand your wellness priorities and get personalized recommendations.',
    icon: <Star className="h-6 w-6 text-purple-500" />,
    ctaText: 'Take Assessment',
    ctaLink: '/assessments',
    benefit: 'Personalized insights',
    estimatedTime: '5 minutes',
    difficulty: 'Easy'
  },
  {
    id: 'wellness-plan',
    title: 'Create Your Plan',
    description: 'Build a personalized wellness journey with goals, milestones, and AI-powered guidance.',
    icon: <Target className="h-6 w-6 text-green-500" />,
    ctaText: 'Build Plan',
    ctaLink: '/wellness-journey',
    benefit: 'Structured approach',
    estimatedTime: '10 minutes',
    difficulty: 'Easy'
  },
  {
    id: 'professional-coaching',
    title: 'Connect with a Coach',
    description: 'Ready for personalized support? Get matched with a professional coach for 1-on-1 sessions.',
    icon: <Users className="h-6 w-6 text-red-500" />,
    ctaText: 'Find Your Coach',
    ctaLink: '/digital-onboarding',
    benefit: 'Expert guidance',
    estimatedTime: '15 minutes',
    difficulty: 'Medium'
  }
];

interface FirstTimeUserExperienceProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FirstTimeUserExperience({ isOpen, onClose }: FirstTimeUserExperienceProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => [...prev, stepId]);
    localStorage.setItem('completedWelcomeSteps', JSON.stringify([...completedSteps, stepId]));
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    onClose();
  };

  const handleStart = (stepId: string) => {
    handleStepComplete(stepId);
    localStorage.setItem('hasSeenWelcome', 'true');
    onClose();
  };

  const currentWelcomeStep = welcomeSteps[currentStep];
  const progress = ((currentStep + 1) / welcomeSteps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleSkip}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-blue-500" />
            Welcome to WholeWellness Platform!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Welcome Message */}
          <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Your Wellness Journey Starts Here
            </h3>
            <p className="text-gray-600">
              Choose your preferred starting point. You can explore all features anytime.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Getting Started</span>
              <span>{currentStep + 1} of {welcomeSteps.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Step */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {currentWelcomeStep.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg text-gray-900">
                    {currentWelcomeStep.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {currentWelcomeStep.difficulty}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      ⏱️ {currentWelcomeStep.estimatedTime}
                    </span>
                    <span className="text-xs text-green-600">
                      ✨ {currentWelcomeStep.benefit}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {currentWelcomeStep.description}
              </p>
              
              <div className="flex gap-3">
                <Link href={currentWelcomeStep.ctaLink}>
                  <Button 
                    onClick={() => handleStart(currentWelcomeStep.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {currentWelcomeStep.ctaText}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (currentStep < welcomeSteps.length - 1) {
                      setCurrentStep(currentStep + 1);
                    } else {
                      handleSkip();
                    }
                  }}
                >
                  {currentStep === welcomeSteps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Other Options Preview */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-600">Other Options</h4>
            <div className="grid grid-cols-1 gap-2">
              {welcomeSteps
                .filter((_, index) => index !== currentStep)
                .slice(0, 2)
                .map((step) => (
                <Link key={step.id} href={step.ctaLink}>
                  <Card 
                    className="cursor-pointer hover:bg-gray-50 transition-colors p-3 border"
                    onClick={() => handleStart(step.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400">
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {step.estimatedTime} • {step.benefit}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Skip Option */}
          <div className="text-center pt-4 border-t">
            <Button variant="ghost" onClick={handleSkip} className="text-sm">
              I'll explore on my own
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}