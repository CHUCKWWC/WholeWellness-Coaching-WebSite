import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Target, CheckCircle, Play, Pause } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'input' | 'scroll' | 'navigate';
  expectedValue?: string;
  isOptional?: boolean;
  videoUrl?: string;
  imageUrl?: string;
  content?: React.ReactNode;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'ai-coaching' | 'wellness' | 'admin' | 'coach';
  estimatedTime: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  steps: TutorialStep[];
}

interface InteractiveTutorialProps {
  tutorial: Tutorial;
  onComplete: (tutorialId: string, completedSteps: string[]) => void;
  onClose: () => void;
  isVisible: boolean;
}

export function InteractiveTutorial({ 
  tutorial, 
  onComplete, 
  onClose, 
  isVisible 
}: InteractiveTutorialProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStep = tutorial.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / tutorial.steps.length) * 100;
  const isLastStep = currentStepIndex === tutorial.steps.length - 1;

  // Highlight target element
  useEffect(() => {
    if (!isVisible || !currentStep?.target) return;

    const element = document.querySelector(currentStep.target);
    if (element) {
      setHighlightedElement(element);
      
      // Scroll element into view
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });

      // Add highlight class
      element.classList.add('tutorial-highlight');
    }

    return () => {
      if (highlightedElement) {
        highlightedElement.classList.remove('tutorial-highlight');
      }
    };
  }, [currentStepIndex, isVisible, currentStep?.target]);

  // Auto-advance for certain actions
  useEffect(() => {
    if (!isPlaying || !currentStep?.action || !highlightedElement) return;

    const handleAutoAdvance = () => {
      if (currentStep.action === 'click') {
        const handleClick = () => {
          markStepCompleted();
          nextStep();
        };
        highlightedElement.addEventListener('click', handleClick, { once: true });
        return () => highlightedElement.removeEventListener('click', handleClick);
      }
    };

    return handleAutoAdvance();
  }, [highlightedElement, currentStep, isPlaying]);

  const markStepCompleted = () => {
    if (!completedSteps.includes(currentStep.id)) {
      setCompletedSteps(prev => [...prev, currentStep.id]);
    }
  };

  const nextStep = () => {
    if (isLastStep) {
      onComplete(tutorial.id, completedSteps);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const skipStep = () => {
    nextStep();
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Tutorial Overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-gray-900/60 z-50 backdrop-blur-sm"
        style={{ pointerEvents: highlightedElement ? 'none' : 'auto' }}
      >
        {/* Spotlight effect for highlighted element */}
        {highlightedElement && (
          <div
            className="absolute bg-white/10 border-2 border-blue-400 rounded-lg shadow-lg animate-pulse"
            style={{
              top: highlightedElement.getBoundingClientRect().top - 8,
              left: highlightedElement.getBoundingClientRect().left - 8,
              width: highlightedElement.getBoundingClientRect().width + 16,
              height: highlightedElement.getBoundingClientRect().height + 16,
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      {/* Tutorial Panel */}
      <Card className="fixed top-4 right-4 w-96 z-[51] shadow-2xl border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{tutorial.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {tutorial.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {tutorial.difficulty}
                </Badge>
                <span className="text-xs text-gray-500">
                  ~{tutorial.estimatedTime}min
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlayPause}
                className="h-6 w-6 p-0"
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Step {currentStepIndex + 1} of {tutorial.steps.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Step Content */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              {completedSteps.includes(currentStep.id) ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <Target className="h-4 w-4 text-blue-500 mr-2" />
              )}
              {currentStep.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {currentStep.description}
            </p>

            {/* Step Media */}
            {currentStep.imageUrl && (
              <img 
                src={currentStep.imageUrl} 
                alt={currentStep.title}
                className="w-full h-32 object-cover rounded-md mb-3"
              />
            )}

            {currentStep.videoUrl && (
              <video 
                src={currentStep.videoUrl}
                controls
                className="w-full h-32 rounded-md mb-3"
                autoPlay={isPlaying}
              />
            )}

            {/* Custom Content */}
            {currentStep.content && (
              <div className="mb-3">
                {currentStep.content}
              </div>
            )}

            {/* Action Hint */}
            {currentStep.action && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md text-xs">
                <strong>Action needed:</strong> {
                  currentStep.action === 'click' ? 'Click the highlighted element' :
                  currentStep.action === 'hover' ? 'Hover over the highlighted element' :
                  currentStep.action === 'input' ? 'Enter text in the highlighted field' :
                  currentStep.action === 'scroll' ? 'Scroll to see more content' :
                  currentStep.action === 'navigate' ? 'Navigate to the next page' :
                  'Follow the instruction above'
                }
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex space-x-2">
              {currentStep.isOptional && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipStep}
                  className="text-xs"
                >
                  Skip
                </Button>
              )}
              
              <Button
                size="sm"
                onClick={() => {
                  markStepCompleted();
                  nextStep();
                }}
                className="flex items-center"
              >
                {isLastStep ? 'Complete' : 'Next'}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>

          {/* Step List */}
          <div className="border-t pt-3">
            <div className="text-xs font-medium mb-2">Tutorial Steps:</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {tutorial.steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center text-xs p-1 rounded cursor-pointer ${
                    index === currentStepIndex 
                      ? 'bg-blue-100 dark:bg-blue-900/30' 
                      : completedSteps.includes(step.id)
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setCurrentStepIndex(index)}
                >
                  {completedSteps.includes(step.id) ? (
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                  ) : index === currentStepIndex ? (
                    <Target className="h-3 w-3 text-blue-500 mr-2" />
                  ) : (
                    <div className="h-3 w-3 border border-gray-300 rounded-full mr-2" />
                  )}
                  <span className="truncate">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tutorial Highlight Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .tutorial-highlight {
            position: relative;
            z-index: 1000;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5) !important;
            border-radius: 4px !important;
            pointer-events: auto !important;
          }
          
          .tutorial-highlight::after {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border: 2px solid #3b82f6;
            border-radius: 6px;
            pointer-events: none;
            animation: tutorialPulse 2s infinite;
          }
          
          @keyframes tutorialPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `
      }} />
    </>
  );
}

export default InteractiveTutorial;