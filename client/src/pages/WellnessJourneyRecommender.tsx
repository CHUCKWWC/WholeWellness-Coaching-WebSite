import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Heart, 
  Brain, 
  Activity, 
  Star,
  Clock,
  CheckCircle,
  BookOpen,
  Users,
  Award,
  Lightbulb,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface WellnessJourney {
  id: string;
  title: string;
  description: string;
  journey_type: string;
  current_phase: string;
  overall_progress: number;
  estimated_completion: string;
  is_active: boolean;
  wellness_goals: WellnessGoal[];
  journey_phases: JourneyPhase[];
  wellness_recommendations: WellnessRecommendation[];
  journey_milestones: JourneyMilestone[];
  ai_insights: AiInsight[];
}

interface WellnessGoal {
  id: string;
  category: string;
  specific_goal: string;
  priority: string;
  timeline: string;
  current_level: number;
  target_level: number;
  is_achieved: boolean;
}

interface JourneyPhase {
  id: string;
  phase_name: string;
  phase_description: string;
  phase_order: number;
  estimated_duration: string;
  is_current: boolean;
  wellness_recommendations: WellnessRecommendation[];
}

interface WellnessRecommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  estimated_time: string;
  difficulty_level: string;
  user_progress: number;
  ai_reasoning: string;
  action_steps: string[];
  expected_outcomes: string[];
  resources: any[];
}

interface JourneyMilestone {
  id: string;
  title: string;
  description: string;
  milestone_order: number;
  is_achieved: boolean;
  target_date: string;
}

interface AiInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  confidence: number;
  impact_level: string;
  suggested_actions: string[];
}

interface JourneyAnalytics {
  journey: WellnessJourney;
  analytics: {
    totalGoals: number;
    achievedGoals: number;
    goalCompletionRate: number;
    totalRecommendations: number;
    completedRecommendations: number;
    recommendationCompletionRate: number;
    overallProgress: number;
    totalInsights: number;
    totalProgressEntries: number;
  };
}

export default function WellnessJourneyRecommender() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current wellness journey
  const { data: journeyData, isLoading: loadingJourney, error } = useQuery<JourneyAnalytics>({
    queryKey: ["/api/wellness-journey/current"],
    retry: false,
  });

  // Create new wellness journey mutation
  const createJourneyMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/wellness-journey/create", {
        journeyType: "comprehensive_wellness",
        title: "Your Personalized Wellness Journey",
        description: "A comprehensive wellness journey tailored to your unique needs and goals",
        estimatedCompletion: "12 weeks"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wellness-journey/current"] });
      toast({
        title: "Journey Created",
        description: "Your personalized wellness journey has been created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create wellness journey",
        variant: "destructive",
      });
    },
  });

  // Update recommendation progress
  const updateProgressMutation = useMutation({
    mutationFn: async ({ recommendationId, progress }: { recommendationId: string; progress: number }) => {
      return await apiRequest("PUT", `/api/wellness-journey/recommendations/${recommendationId}/progress`, {
        progress
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wellness-journey/current"] });
      toast({
        title: "Progress Updated",
        description: "Your progress has been recorded successfully!",
      });
    },
  });

  // Complete milestone mutation
  const completeMilestoneMutation = useMutation({
    mutationFn: async ({ milestoneId, reflection, difficultyRating, satisfactionRating }: {
      milestoneId: string;
      reflection?: string;
      difficultyRating?: number;
      satisfactionRating?: number;
    }) => {
      return await apiRequest("POST", `/api/wellness-journey/milestones/${milestoneId}/complete`, {
        reflection,
        difficultyRating,
        satisfactionRating
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wellness-journey/current"] });
      toast({
        title: "Milestone Completed!",
        description: "Congratulations on achieving this milestone!",
      });
    },
  });

  const handleStartJourney = () => {
    createJourneyMutation.mutate();
  };

  const handleUpdateProgress = (recommendationId: string, progress: number) => {
    updateProgressMutation.mutate({ recommendationId, progress });
  };

  const handleCompleteMilestone = (milestoneId: string) => {
    completeMilestoneMutation.mutate({ 
      milestoneId,
      satisfactionRating: 5,
      difficultyRating: 3
    });
  };

  if (loadingJourney) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading your wellness journey...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !journeyData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <Heart className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Wellness Journey Recommender
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Create a personalized wellness journey tailored specifically to your unique needs, goals, and lifestyle
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Start Your Wellness Journey
              </CardTitle>
              <CardDescription>
                Our AI will analyze your preferences and create a comprehensive wellness plan with personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleStartJourney}
                disabled={createJourneyMutation.isPending}
                className="w-full"
                size="lg"
              >
                {createJourneyMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating Your Journey...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Begin My Wellness Journey
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold mb-2">Personalized Goals</h3>
                  <p className="text-sm text-gray-600">AI-generated goals based on your unique situation and aspirations</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold mb-2">Progress Tracking</h3>
                  <p className="text-sm text-gray-600">Real-time monitoring of your wellness journey with actionable insights</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Brain className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-semibold mb-2">AI Insights</h3>
                  <p className="text-sm text-gray-600">Intelligent recommendations that adapt to your progress and feedback</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const journey = journeyData?.journey;
  const analytics = journeyData?.analytics;

  if (!journey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Unable to load your wellness journey. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {journey.title}
        </h1>
        <p className="text-xl text-gray-600 mb-4">{journey.description}</p>
        <div className="flex items-center gap-4 mb-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {journey.estimated_completion}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {journey.current_phase}
          </Badge>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-600">{journey.overall_progress}%</span>
          </div>
          <Progress value={journey.overall_progress} className="w-full" />
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{analytics?.totalGoals || 0}</p>
                    <p className="text-sm text-gray-600">Total Goals</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{analytics?.totalRecommendations || 0}</p>
                    <p className="text-sm text-gray-600">Recommendations</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{analytics?.totalInsights || 0}</p>
                    <p className="text-sm text-gray-600">AI Insights</p>
                  </div>
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{Math.round(analytics?.goalCompletionRate || 0)}%</p>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Journey Phases */}
          <Card>
            <CardHeader>
              <CardTitle>Your Journey Phases</CardTitle>
              <CardDescription>Progress through your personalized wellness phases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {journey.journey_phases?.map((phase, index) => (
                  <div key={phase.id} className={`p-4 rounded-lg border ${phase.is_current ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${phase.is_current ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                            {index + 1}
                          </span>
                          {phase.phase_name}
                          {phase.is_current && <Badge variant="secondary">Current</Badge>}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{phase.phase_description}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{phase.estimated_duration}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {journey.wellness_recommendations?.map((recommendation) => (
              <Card key={recommendation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                      <CardDescription>{recommendation.description}</CardDescription>
                    </div>
                    <Badge 
                      variant={recommendation.priority === 'high' ? 'destructive' : 
                              recommendation.priority === 'medium' ? 'default' : 'secondary'}
                    >
                      {recommendation.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-gray-600">{recommendation.user_progress}%</span>
                      </div>
                      <Progress value={recommendation.user_progress} />
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {recommendation.estimated_time}
                      </div>
                      <Badge variant="outline">{recommendation.difficulty_level}</Badge>
                      <Badge variant="outline">{recommendation.category}</Badge>
                    </div>

                    {recommendation.action_steps && recommendation.action_steps.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm mb-2">Action Steps:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {recommendation.action_steps.slice(0, 3).map((step, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-600 mt-1">•</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateProgress(recommendation.id, Math.min(100, recommendation.user_progress + 25))}
                        disabled={recommendation.user_progress >= 100 || updateProgressMutation.isPending}
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Update Progress
                      </Button>
                      {recommendation.user_progress >= 100 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {journey.wellness_goals?.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        {goal.specific_goal}
                      </CardTitle>
                      <CardDescription>Category: {goal.category}</CardDescription>
                    </div>
                    {goal.is_achieved && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Achieved
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-gray-600">{goal.current_level}/{goal.target_level}</span>
                      </div>
                      <Progress value={(goal.current_level / goal.target_level) * 100} />
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="outline">{goal.priority} priority</Badge>
                      <Badge variant="outline">{goal.timeline}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-6">
          <div className="space-y-4">
            {journey.journey_milestones?.map((milestone, index) => (
              <Card key={milestone.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${milestone.is_achieved ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                      {milestone.is_achieved ? <CheckCircle className="h-4 w-4" /> : index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        {milestone.title}
                        {milestone.is_achieved && (
                          <Badge variant="secondary">Completed</Badge>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(milestone.target_date).toLocaleDateString()}
                        </Badge>
                        {!milestone.is_achieved && (
                          <Button
                            size="sm"
                            onClick={() => handleCompleteMilestone(milestone.id)}
                            disabled={completeMilestoneMutation.isPending}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="space-y-4">
            {journey.ai_insights?.map((insight) => (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-600" />
                        {insight.title}
                      </CardTitle>
                      <CardDescription>{insight.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={insight.impact_level === 'high' ? 'destructive' : 
                                insight.impact_level === 'medium' ? 'default' : 'secondary'}
                      >
                        {insight.impact_level} impact
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs">{Math.round(insight.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {insight.suggested_actions && insight.suggested_actions.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2">Suggested Actions:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {insight.suggested_actions.map((action, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}