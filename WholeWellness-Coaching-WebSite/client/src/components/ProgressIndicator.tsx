import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Star, Target, Brain } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  completed: boolean;
  badge?: string;
}

export default function ProgressIndicator() {
  const { user, isAuthenticated } = useAuth();
  const [steps, setSteps] = useState<ProgressStep[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Check completion status from localStorage or user data
      const hasUsedAI = localStorage.getItem(`hasUsedAI_${user.id}`) === 'true';
      const hasWellnessJourney = localStorage.getItem(`hasWellnessJourney_${user.id}`) === 'true';
      const hasAssessment = localStorage.getItem(`hasAssessment_${user.id}`) === 'true';
      const hasCoaching = localStorage.getItem(`hasCoaching_${user.id}`) === 'true';

      const userSteps: ProgressStep[] = [
        {
          id: 'ai-coaching',
          title: 'Try AI Coaching',
          description: 'Chat with our specialized AI coaches',
          icon: <Brain className="h-4 w-4" />,
          link: '/ai-coaching',
          completed: hasUsedAI,
          badge: 'Quick Start'
        },
        {
          id: 'wellness-journey',
          title: 'Create Wellness Plan',
          description: 'Set up your personalized journey',
          icon: <Target className="h-4 w-4" />,
          link: '/wellness-journey',
          completed: hasWellnessJourney,
          badge: 'Recommended'
        },
        {
          id: 'assessment',
          title: 'Take Assessment',
          description: 'Complete wellness evaluation',
          icon: <Star className="h-4 w-4" />,
          link: '/assessments',
          completed: hasAssessment
        },
        {
          id: 'coaching',
          title: 'Book Live Coaching',
          description: 'Connect with professional coach',
          icon: <CheckCircle className="h-4 w-4" />,
          link: '/digital-onboarding',
          completed: hasCoaching,
          badge: 'Premium'
        }
      ];

      setSteps(userSteps);
      
      const completed = userSteps.filter(step => step.completed).length;
      setCompletionPercentage((completed / userSteps.length) * 100);
    }
  }, [user, isAuthenticated]);

  // Mark step as completed when user visits link
  const markStepCompleted = (stepId: string) => {
    if (user) {
      localStorage.setItem(`has${stepId.charAt(0).toUpperCase() + stepId.slice(1)}_${user.id}`, 'true');
      setSteps(prev => prev.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      ));
      
      const newCompleted = steps.filter(step => step.completed || step.id === stepId).length;
      setCompletionPercentage((newCompleted / steps.length) * 100);
    }
  };

  if (!isAuthenticated || steps.length === 0) return null;

  return null;
}