import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import InteractiveTutorial from './InteractiveTutorial';
import { 
  User, 
  Target, 
  BookOpen, 
  Users, 
  Heart, 
  Brain, 
  Dumbbell,
  CheckCircle,
  Play,
  Clock,
  Star,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface UserPreferences {
  role: 'member' | 'coach' | 'admin' | 'visitor';
  interests: string[];
  experience: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  communicationStyle: 'supportive' | 'direct' | 'analytical' | 'motivational';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  availableTime: string;
  triggers?: string;
  preferences: {
    notifications: boolean;
    publicProfile: boolean;
    dataSharing: boolean;
  };
}

interface OnboardingPath {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime: number;
  tutorials: string[];
  requiredRole?: string;
}

const interestOptions = [
  { id: 'weight-loss', label: 'Weight Loss', icon: '⚖️' },
  { id: 'mental-health', label: 'Mental Health', icon: '🧠' },
  { id: 'relationships', label: 'Relationships', icon: '💕' },
  { id: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
  { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
  { id: 'career', label: 'Career Growth', icon: '📈' },
  { id: 'stress', label: 'Stress Management', icon: '😌' }
];

const goalOptions = [
  'Lose weight and feel confident',
  'Improve mental wellbeing',
  'Build healthier relationships',
  'Develop mindfulness practices',
  'Create work-life balance',
  'Overcome anxiety and depression',
  'Build self-esteem',
  'Learn coping strategies'
];

const onboardingPaths: OnboardingPath[] = [
  {
    id: 'member-basic',
    title: 'Member Essentials',
    description: 'Learn the basics of using our wellness platform',
    icon: <User className="h-6 w-6" />,
    estimatedTime: 10,
    tutorials: ['platform-basics', 'ai-coaching-intro', 'wellness-tracking']
  },
  {
    id: 'ai-coaching-deep',
    title: 'AI Coaching Mastery',
    description: 'Master our AI coaching features and personalization',
    icon: <Brain className="h-6 w-6" />,
    estimatedTime: 15,
    tutorials: ['ai-coaches-overview', 'conversation-tips', 'progress-tracking']
  },
  {
    id: 'wellness-journey',
    title: 'Complete Wellness Journey',
    description: 'Comprehensive guide to your wellness transformation',
    icon: <Heart className="h-6 w-6" />,
    estimatedTime: 25,
    tutorials: ['goal-setting', 'assessment-taking', 'resource-library', 'community-features']
  },
  {
    id: 'coach-onboarding',
    title: 'Coach Platform Training',
    description: 'Everything you need to know as a wellness coach',
    icon: <Users className="h-6 w-6" />,
    estimatedTime: 30,
    tutorials: ['coach-dashboard', 'client-management', 'session-booking', 'certification-system'],
    requiredRole: 'coach'
  }
];

// Sample tutorials data
const tutorialsData = {
  'platform-basics': {
    id: 'platform-basics',
    title: 'Platform Basics',
    description: 'Learn to navigate the WholeWellness platform',
    category: 'basics' as const,
    estimatedTime: 5,
    difficulty: 'beginner' as const,
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to WholeWellness',
        description: 'Your journey to wellness starts here. Let\'s explore the main navigation.',
        target: 'nav',
        action: 'hover' as const
      },
      {
        id: 'ai-coaching-nav',
        title: 'Find AI Coaching',
        description: 'Click on AI Coaching to access your personal wellness coaches.',
        target: 'a[href="/ai-coaching"]',
        action: 'click' as const
      },
      {
        id: 'member-portal',
        title: 'Access Your Dashboard',
        description: 'Your member portal contains all your personalized content.',
        target: 'a[href="/member-portal"]',
        action: 'click' as const
      }
    ]
  }
};

interface OnboardingExperienceProps {
  isVisible: boolean;
  onComplete: (preferences: UserPreferences) => void;
  onClose: () => void;
}

export function OnboardingExperience({ 
  isVisible, 
  onComplete, 
  onClose 
}: OnboardingExperienceProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    interests: [],
    goals: [],
    preferences: {
      notifications: true,
      publicProfile: false,
      dataSharing: false
    }
  });
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [activeTutorial, setActiveTutorial] = useState<string>('');
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);

  const steps = [
    'Welcome',
    'Role Selection',
    'Interests & Goals',
    'Communication Style',
    'Learning Path',
    'Tutorial Experience',
    'Final Setup'
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleTutorialComplete = (tutorialId: string, completedSteps: string[]) => {
    setCompletedTutorials(prev => [...prev, tutorialId]);
    setActiveTutorial('');
  };

  const startTutorial = (tutorialId: string) => {
    setActiveTutorial(tutorialId);
  };

  const completeOnboarding = () => {
    onComplete(preferences as UserPreferences);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/60 z-40 backdrop-blur-sm" />
      
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center">
                    <Sparkles className="h-6 w-6 mr-2 text-purple-500" />
                    Welcome to WholeWellness
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Let's personalize your wellness journey
                  </p>
                </div>
                <Badge variant="outline">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
              </div>
              <Progress value={progress} className="h-2 mt-4" />
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 0: Welcome */}
              {currentStep === 0 && (
                <div className="text-center space-y-6">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Heart className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-4">
                      Your Wellness Journey Starts Here
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                      WholeWellness is designed to support your unique path to mental, 
                      physical, and emotional wellbeing. Let's create a personalized 
                      experience just for you.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="p-4 border rounded-lg">
                      <Brain className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <h3 className="font-semibold">AI Coaching</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Personalized guidance from specialized AI coaches
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <h3 className="font-semibold">Goal Tracking</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Set and achieve your wellness objectives
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <h3 className="font-semibold">Community</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Connect with others on similar journeys
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Role Selection */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">What brings you here?</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Help us understand your role so we can customize your experience.
                  </p>
                  
                  <RadioGroup 
                    value={preferences.role} 
                    onValueChange={(value) => updatePreferences({ role: value as any })}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <RadioGroupItem value="member" />
                        <div className="flex items-center space-x-3">
                          <User className="h-6 w-6 text-blue-500" />
                          <div>
                            <div className="font-semibold">Member</div>
                            <div className="text-sm text-gray-500">
                              I'm here for personal wellness and growth
                            </div>
                          </div>
                        </div>
                      </Label>
                      
                      <Label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <RadioGroupItem value="coach" />
                        <div className="flex items-center space-x-3">
                          <Users className="h-6 w-6 text-green-500" />
                          <div>
                            <div className="font-semibold">Wellness Coach</div>
                            <div className="text-sm text-gray-500">
                              I'm here to help others on their wellness journey
                            </div>
                          </div>
                        </div>
                      </Label>
                      
                      <Label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <RadioGroupItem value="admin" />
                        <div className="flex items-center space-x-3">
                          <Target className="h-6 w-6 text-purple-500" />
                          <div>
                            <div className="font-semibold">Administrator</div>
                            <div className="text-sm text-gray-500">
                              I manage the platform and support services
                            </div>
                          </div>
                        </div>
                      </Label>
                      
                      <Label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <RadioGroupItem value="visitor" />
                        <div className="flex items-center space-x-3">
                          <BookOpen className="h-6 w-6 text-orange-500" />
                          <div>
                            <div className="font-semibold">Just Exploring</div>
                            <div className="text-sm text-gray-500">
                              I'm learning about wellness services
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Step 2: Interests & Goals */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">What interests you most?</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Select all areas where you'd like support (you can change these later).
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {interestOptions.map((interest) => (
                      <Label
                        key={interest.id}
                        className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Checkbox
                          checked={preferences.interests?.includes(interest.id)}
                          onCheckedChange={(checked) => {
                            const newInterests = checked
                              ? [...(preferences.interests || []), interest.id]
                              : (preferences.interests || []).filter(i => i !== interest.id);
                            updatePreferences({ interests: newInterests });
                          }}
                        />
                        <span className="text-lg">{interest.icon}</span>
                        <span className="text-sm font-medium">{interest.label}</span>
                      </Label>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">What are your main goals?</h3>
                    <div className="space-y-2">
                      {goalOptions.map((goal) => (
                        <Label
                          key={goal}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                        >
                          <Checkbox
                            checked={preferences.goals?.includes(goal)}
                            onCheckedChange={(checked) => {
                              const newGoals = checked
                                ? [...(preferences.goals || []), goal]
                                : (preferences.goals || []).filter(g => g !== goal);
                              updatePreferences({ goals: newGoals });
                            }}
                          />
                          <span className="text-sm">{goal}</span>
                        </Label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Communication Style */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">How do you prefer to communicate?</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      This helps our AI coaches adapt their communication style to you.
                    </p>
                  </div>

                  <RadioGroup 
                    value={preferences.communicationStyle} 
                    onValueChange={(value) => updatePreferences({ communicationStyle: value as any })}
                  >
                    <div className="space-y-3">
                      <Label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <RadioGroupItem value="supportive" />
                        <div>
                          <div className="font-semibold">Supportive & Gentle</div>
                          <div className="text-sm text-gray-500">
                            I prefer encouragement and emotional support
                          </div>
                        </div>
                      </Label>
                      
                      <Label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <RadioGroupItem value="motivational" />
                        <div>
                          <div className="font-semibold">Motivational & Energetic</div>
                          <div className="text-sm text-gray-500">
                            I like enthusiasm and positive energy
                          </div>
                        </div>
                      </Label>
                      
                      <Label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <RadioGroupItem value="direct" />
                        <div>
                          <div className="font-semibold">Direct & Practical</div>
                          <div className="text-sm text-gray-500">
                            I want clear, actionable advice
                          </div>
                        </div>
                      </Label>
                      
                      <Label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <RadioGroupItem value="analytical" />
                        <div>
                          <div className="font-semibold">Analytical & Detailed</div>
                          <div className="text-sm text-gray-500">
                            I like data-driven insights and explanations
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="space-y-3">
                    <Label htmlFor="availability">How much time can you dedicate to wellness activities per week?</Label>
                    <Input
                      id="availability"
                      placeholder="e.g., 2-3 hours, 30 minutes daily, weekends only"
                      value={preferences.availableTime || ''}
                      onChange={(e) => updatePreferences({ availableTime: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="triggers">Are there any topics or situations we should be sensitive about?</Label>
                    <Textarea
                      id="triggers"
                      placeholder="Optional: Let us know about any triggers, sensitive topics, or areas where you need extra care"
                      value={preferences.triggers || ''}
                      onChange={(e) => updatePreferences({ triggers: e.target.value })}
                      className="min-h-20"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Learning Path Selection */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Choose Your Learning Path</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Select a guided tutorial path to get started with the platform.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {onboardingPaths
                      .filter(path => !path.requiredRole || path.requiredRole === preferences.role)
                      .map((path) => (
                        <Card
                          key={path.id}
                          className={`cursor-pointer transition-all ${
                            selectedPath === path.id 
                              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'hover:shadow-md'
                          }`}
                          onClick={() => setSelectedPath(path.id)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center space-x-3">
                              {path.icon}
                              <div>
                                <CardTitle className="text-lg">{path.title}</CardTitle>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span>~{path.estimatedTime} min</span>
                                  <span>•</span>
                                  <span>{path.tutorials.length} tutorials</span>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {path.description}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}

              {/* Step 5: Tutorial Experience */}
              {currentStep === 5 && selectedPath && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Interactive Tutorial Experience</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Let's walk through the platform together. You can start tutorials now or skip to complete setup.
                    </p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        {onboardingPaths.find(p => p.id === selectedPath)?.icon}
                        <span className="ml-2">
                          {onboardingPaths.find(p => p.id === selectedPath)?.title}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {onboardingPaths
                          .find(p => p.id === selectedPath)
                          ?.tutorials.map((tutorialId) => (
                            <div key={tutorialId} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                {completedTutorials.includes(tutorialId) ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <Play className="h-5 w-5 text-blue-500" />
                                )}
                                <div>
                                  <div className="font-medium capitalize">
                                    {tutorialId.replace(/-/g, ' ')}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Interactive tutorial • ~5 min
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant={completedTutorials.includes(tutorialId) ? "outline" : "default"}
                                onClick={() => startTutorial(tutorialId)}
                                disabled={completedTutorials.includes(tutorialId)}
                              >
                                {completedTutorials.includes(tutorialId) ? 'Completed' : 'Start'}
                              </Button>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 6: Final Setup */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Final Setup</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Almost done! Configure your privacy preferences and we'll create your personalized experience.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">Email Notifications</Label>
                        <p className="text-sm text-gray-500">
                          Receive wellness tips, reminders, and progress updates
                        </p>
                      </div>
                      <Checkbox
                        checked={preferences.preferences?.notifications}
                        onCheckedChange={(checked) => 
                          updatePreferences({ 
                            preferences: { 
                              ...preferences.preferences!, 
                              notifications: Boolean(checked) 
                            } 
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">Public Profile</Label>
                        <p className="text-sm text-gray-500">
                          Allow others in the community to see your profile
                        </p>
                      </div>
                      <Checkbox
                        checked={preferences.preferences?.publicProfile}
                        onCheckedChange={(checked) => 
                          updatePreferences({ 
                            preferences: { 
                              ...preferences.preferences!, 
                              publicProfile: Boolean(checked) 
                            } 
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label className="font-medium">Anonymous Data Sharing</Label>
                        <p className="text-sm text-gray-500">
                          Help improve our services with anonymized usage data
                        </p>
                      </div>
                      <Checkbox
                        checked={preferences.preferences?.dataSharing}
                        onCheckedChange={(checked) => 
                          updatePreferences({ 
                            preferences: { 
                              ...preferences.preferences!, 
                              dataSharing: Boolean(checked) 
                            } 
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      🎉 You're All Set!
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Based on your preferences, we've personalized your dashboard and 
                      recommended the perfect AI coaches for your journey. You can always 
                      update these settings later in your profile.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>

                <div className="flex space-x-2">
                  {currentStep < steps.length - 1 && (
                    <Button variant="ghost" onClick={onClose}>
                      Skip Setup
                    </Button>
                  )}
                  
                  <Button
                    onClick={currentStep === steps.length - 1 ? completeOnboarding : nextStep}
                    disabled={
                      (currentStep === 1 && !preferences.role) ||
                      (currentStep === 4 && !selectedPath)
                    }
                  >
                    {currentStep === steps.length - 1 ? (
                      'Complete Setup'
                    ) : (
                      <>
                        Next <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Active Tutorial */}
      {activeTutorial && tutorialsData[activeTutorial as keyof typeof tutorialsData] && (
        <InteractiveTutorial
          tutorial={tutorialsData[activeTutorial as keyof typeof tutorialsData]}
          onComplete={handleTutorialComplete}
          onClose={() => setActiveTutorial('')}
          isVisible={true}
        />
      )}
    </>
  );
}

export default OnboardingExperience;