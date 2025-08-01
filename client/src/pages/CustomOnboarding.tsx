import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OnboardingExperience from '@/components/OnboardingExperience';
import InteractiveTutorial from '@/components/InteractiveTutorial';
import useOnboarding from '@/hooks/useOnboarding';
import { 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  User, 
  Brain, 
  Heart, 
  Users,
  RotateCcw,
  Settings,
  BookOpen,
  Target,
  Sparkles
} from 'lucide-react';

// Sample tutorials data (would come from API in real app)
const allTutorials = {
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
        target: 'nav'
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
  },
  'ai-coaching-intro': {
    id: 'ai-coaching-intro',
    title: 'AI Coaching Introduction',
    description: 'Meet your AI wellness coaches and learn how to interact with them',
    category: 'ai-coaching' as const,
    estimatedTime: 8,
    difficulty: 'beginner' as const,
    steps: [
      {
        id: 'coach-selection',
        title: 'Choose Your Coach',
        description: 'Select an AI coach that matches your wellness goals.',
        content: (
          <div className="space-y-2">
            <p className="text-sm">Our AI coaches specialize in different areas:</p>
            <ul className="text-sm space-y-1">
              <li>• <strong>Charlene:</strong> Mindfulness & Meditation</li>
              <li>• <strong>Lisa:</strong> Behavior Change & Habits</li>
              <li>• <strong>Dasha:</strong> Holistic Wellness</li>
              <li>• <strong>Charles:</strong> Relationships</li>
              <li>• <strong>Bobby:</strong> Mental Health</li>
              <li>• <strong>Aria:</strong> Weight Loss & Nutrition</li>
            </ul>
          </div>
        )
      },
      {
        id: 'first-conversation',
        title: 'Start a Conversation',
        description: 'Begin your first conversation with your chosen AI coach.',
        target: '.chat-input',
        action: 'input' as const,
        expectedValue: 'Hello'
      }
    ]
  },
  'wellness-tracking': {
    id: 'wellness-tracking',
    title: 'Wellness Tracking',
    description: 'Learn how to track your wellness journey and progress',
    category: 'wellness' as const,
    estimatedTime: 6,
    difficulty: 'beginner' as const,
    steps: [
      {
        id: 'dashboard-overview',
        title: 'Your Wellness Dashboard',
        description: 'Explore your personalized wellness dashboard and metrics.'
      },
      {
        id: 'goal-setting',
        title: 'Set Your Goals',
        description: 'Learn how to set and track your wellness goals.'
      }
    ]
  },
  'coach-dashboard': {
    id: 'coach-dashboard',
    title: 'Coach Dashboard',
    description: 'Navigate your coach dashboard and manage clients',
    category: 'coach' as const,
    estimatedTime: 10,
    difficulty: 'intermediate' as const,
    steps: [
      {
        id: 'dashboard-overview',
        title: 'Dashboard Overview',
        description: 'Get familiar with your coach dashboard layout and features.'
      },
      {
        id: 'client-list',
        title: 'Manage Clients',
        description: 'Learn how to view and manage your client list.'
      }
    ]
  }
};

export default function CustomOnboarding() {
  const {
    isOnboardingVisible,
    progress,
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    markTutorialCompleted,
    resetOnboarding,
    getRecommendedTutorials,
    getOnboardingStats,
    setIsOnboardingVisible
  } = useOnboarding();

  const [activeTutorial, setActiveTutorial] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const stats = getOnboardingStats();
  const userRole = localStorage.getItem('userRole') as string;
  const userInterests = progress.preferences?.interests || [];
  const recommendedTutorials = getRecommendedTutorials(userRole, userInterests);

  const tutorialCategories = [
    { id: 'all', label: 'All Tutorials', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'basics', label: 'Platform Basics', icon: <User className="h-4 w-4" /> },
    { id: 'ai-coaching', label: 'AI Coaching', icon: <Brain className="h-4 w-4" /> },
    { id: 'wellness', label: 'Wellness', icon: <Heart className="h-4 w-4" /> },
    { id: 'coach', label: 'Coach Tools', icon: <Users className="h-4 w-4" /> }
  ];

  const filteredTutorials = Object.values(allTutorials).filter(tutorial => 
    selectedCategory === 'all' || tutorial.category === selectedCategory
  );

  const startTutorial = (tutorialId: string) => {
    setActiveTutorial(tutorialId);
  };

  const handleTutorialComplete = (tutorialId: string, completedSteps: string[]) => {
    markTutorialCompleted(tutorialId);
    setActiveTutorial('');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold flex items-center justify-center">
          <Sparkles className="h-8 w-8 mr-3 text-purple-500" />
          Personalized Onboarding
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Get the most out of WholeWellness with our customizable onboarding experience
        </p>
      </div>

      {/* Onboarding Progress */}
      {progress.isCompleted ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              Onboarding Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300">
                  Welcome to WholeWellness! You've completed the onboarding process.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Completed {stats.completedTutorials} tutorials
                </p>
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsOnboardingVisible(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Review Setup
                </Button>
                <Button variant="outline" onClick={resetOnboarding}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-6 w-6 text-blue-500 mr-2" />
              Continue Your Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300">
                  Complete your personalized onboarding to get the most out of the platform.
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <Progress value={stats.completionPercentage} className="w-48" />
                  <span className="text-sm text-gray-500">
                    {Math.round(stats.completionPercentage)}% complete
                  </span>
                </div>
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={skipOnboarding}>
                  Skip Setup
                </Button>
                <Button onClick={startOnboarding}>
                  Continue Setup
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Tutorials */}
      {recommendedTutorials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-6 w-6 text-purple-500 mr-2" />
              Recommended for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedTutorials.slice(0, 6).map((tutorialId) => {
                const tutorial = allTutorials[tutorialId as keyof typeof allTutorials];
                if (!tutorial) return null;
                
                const isCompleted = progress.completedTutorials.includes(tutorialId);
                
                return (
                  <Card key={tutorialId} className="relative">
                    {isCompleted && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {tutorial.category}
                        </Badge>
                        <Badge className={`text-xs ${getDifficultyColor(tutorial.difficulty)}`}>
                          {tutorial.difficulty}
                        </Badge>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {tutorial.estimatedTime}m
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {tutorial.description}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => startTutorial(tutorialId)}
                        disabled={isCompleted}
                        className="w-full"
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Start Tutorial
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Tutorials */}
      <Card>
        <CardHeader>
          <CardTitle>All Interactive Tutorials</CardTitle>
          <p className="text-gray-600 dark:text-gray-300">
            Explore all available tutorials to master the platform
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid grid-cols-5 mb-6">
              {tutorialCategories.map(category => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center">
                  {category.icon}
                  <span className="ml-1 hidden sm:inline">{category.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTutorials.map((tutorial) => {
                  const isCompleted = progress.completedTutorials.includes(tutorial.id);
                  const isRecommended = recommendedTutorials.includes(tutorial.id);
                  
                  return (
                    <Card key={tutorial.id} className="relative">
                      {isRecommended && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="default" className="text-xs">
                            Recommended
                          </Badge>
                        </div>
                      )}
                      {isCompleted && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                      
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg pr-8">{tutorial.title}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {tutorial.category}
                          </Badge>
                          <Badge className={`text-xs ${getDifficultyColor(tutorial.difficulty)}`}>
                            {tutorial.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          {tutorial.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {tutorial.estimatedTime} minutes
                          </div>
                          <div className="text-sm text-gray-500">
                            {tutorial.steps.length} steps
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => startTutorial(tutorial.id)}
                          disabled={isCompleted}
                          className="w-full"
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Completed
                            </>
                          ) : (
                            <>
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Start Tutorial
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Onboarding Experience Modal */}
      <OnboardingExperience
        isVisible={isOnboardingVisible}
        onComplete={completeOnboarding}
        onClose={() => setIsOnboardingVisible(false)}
      />

      {/* Active Tutorial */}
      {activeTutorial && allTutorials[activeTutorial as keyof typeof allTutorials] && (
        <InteractiveTutorial
          tutorial={allTutorials[activeTutorial as keyof typeof allTutorials]}
          onComplete={handleTutorialComplete}
          onClose={() => setActiveTutorial('')}
          isVisible={true}
        />
      )}
    </div>
  );
}