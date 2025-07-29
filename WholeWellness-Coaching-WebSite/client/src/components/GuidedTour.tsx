import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, ArrowRight, ArrowLeft, Star, Sparkles, Target, Brain, Users, Award } from 'lucide-react';
import { Link } from 'wouter';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  ctaText: string;
  ctaLink: string;
  features: string[];
  badge?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'ai-coaching',
    title: 'AI Coaching - Start Here',
    description: 'Meet our 6 specialized AI coaches ready to help with nutrition, fitness, wellness, and more. Perfect for immediate support and guidance.',
    icon: <Brain className="h-8 w-8 text-blue-500" />,
    ctaText: 'Try AI Coaching',
    ctaLink: '/ai-coaching',
    features: ['6 Specialized Coaches', 'Instant Responses', 'Persistent Memory', 'Suggested Prompts'],
    badge: 'Most Popular'
  },
  {
    id: 'wellness-journey',
    title: 'Wellness Journey Planner',
    description: 'Get personalized wellness recommendations, set goals, track milestones, and receive AI insights tailored to your unique needs.',
    icon: <Target className="h-8 w-8 text-green-500" />,
    ctaText: 'Plan Your Journey',
    ctaLink: '/wellness-journey',
    features: ['Personalized Plans', 'Goal Tracking', 'Progress Analytics', 'AI Insights'],
    badge: 'New'
  },
  {
    id: 'assessments',
    title: 'Take an Assessment',
    description: 'Complete our comprehensive assessments to understand your wellness needs better and get matched with the right coaching approach.',
    icon: <Sparkles className="h-8 w-8 text-purple-500" />,
    ctaText: 'Start Assessment',
    ctaLink: '/assessments',
    features: ['Weight Loss', 'Mental Health', 'Attachment Style', 'Personalized Results']
  },
  {
    id: 'certification',
    title: 'Professional Development',
    description: 'Access certification courses to enhance your skills, whether you\'re a coach or looking to develop personally.',
    icon: <Award className="h-8 w-8 text-orange-500" />,
    ctaText: 'Browse Courses',
    ctaLink: '/coach-certifications',
    features: ['Professional Courses', 'Progress Tracking', 'Digital Certificates', 'CE Credits']
  },
  {
    id: 'coaching',
    title: 'Live Coaching Sessions',
    description: 'Ready for personalized 1-on-1 coaching? Get matched with a professional coach who understands your unique situation.',
    icon: <Users className="h-8 w-8 text-red-500" />,
    ctaText: 'Get Started',
    ctaLink: '/digital-onboarding',
    features: ['Professional Coaches', 'Personalized Matching', '50-min Sessions', 'Flexible Pricing']
  }
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuidedTour({ isOpen, onClose }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    localStorage.setItem('hasSeenTour', 'true');
    onClose();
  };

  const currentTourStep = tourSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Welcome to WholeWellness Platform
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={skipTour}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full transition-colors ${
                  index === currentStep ? 'bg-blue-500' : 
                  index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Current Step */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                {currentTourStep.icon}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{currentTourStep.title}</CardTitle>
                    {currentTourStep.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {currentTourStep.badge}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                {currentTourStep.description}
              </p>

              <div className="grid grid-cols-2 gap-2">
                {currentTourStep.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Link href={currentTourStep.ctaLink}>
                  <Button onClick={onClose} className="flex-1">
                    {currentTourStep.ctaText}
                  </Button>
                </Link>
                <Button variant="outline" onClick={nextStep} disabled={currentStep === tourSteps.length - 1}>
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <span className="text-sm text-gray-500">
              {currentStep + 1} of {tourSteps.length}
            </span>

            <Button
              onClick={nextStep}
              disabled={currentStep === tourSteps.length - 1}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Skip/Finish */}
          <div className="text-center pt-2">
            <Button variant="ghost" onClick={skipTour} className="text-sm">
              {currentStep === tourSteps.length - 1 ? 'Finish Tour' : 'Skip Tour'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}