import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Brain,
  Target,
  Calendar,
  TrendingUp,
  Heart,
  Lightbulb,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Activity,
  BookOpen,
  Zap,
  Award,
  Sparkles,
  BarChart3,
  MapPin,
  ArrowRight,
  RefreshCw,
  Download,
  Share2,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Play,
  Pause,
  SkipForward,
  Calendar as CalendarIcon,
  Bell,
  Settings,
  Filter,
  Search,
  Globe
} from 'lucide-react';

// Enhanced schemas for wellness journey
const wellnessGoalSchema = z.object({
  category: z.enum(['physical', 'mental', 'emotional', 'spiritual', 'social', 'career', 'financial']),
  specific_goal: z.string().min(5, 'Please describe your goal in detail'),
  priority: z.enum(['high', 'medium', 'low']),
  timeline: z.enum(['1_week', '1_month', '3_months', '6_months', '1_year', 'ongoing']),
  current_level: z.number().min(1).max(10),
  target_level: z.number().min(1).max(10),
  obstacles: z.array(z.string()).optional(),
  motivation: z.string().optional(),
});

const lifestyleAssessmentSchema = z.object({
  sleep_hours: z.number().min(0).max(24),
  exercise_frequency: z.enum(['none', 'rarely', 'weekly', 'several_times', 'daily']),
  stress_level: z.number().min(1).max(10),
  energy_level: z.number().min(1).max(10),
  social_connection: z.number().min(1).max(10),
  work_life_balance: z.number().min(1).max(10),
  diet_quality: z.enum(['poor', 'fair', 'good', 'excellent']),
  major_life_changes: z.array(z.string()).optional(),
  support_system: z.enum(['none', 'limited', 'moderate', 'strong']),
  previous_wellness_experience: z.string().optional(),
});

const preferencesSchema = z.object({
  learning_style: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']),
  session_duration: z.enum(['5_min', '15_min', '30_min', '60_min', '90_min']),
  frequency: z.enum(['daily', 'every_other_day', 'weekly', 'bi_weekly', 'monthly']),
  reminder_preferences: z.array(z.enum(['email', 'push', 'sms', 'none'])),
  preferred_times: z.array(z.enum(['morning', 'afternoon', 'evening', 'late_night'])),
  intensity_preference: z.enum(['gentle', 'moderate', 'intense']),
  group_vs_individual: z.enum(['individual', 'small_group', 'large_group', 'both']),
  technology_comfort: z.number().min(1).max(10),
});

type WellnessGoal = z.infer<typeof wellnessGoalSchema>;
type LifestyleAssessment = z.infer<typeof lifestyleAssessmentSchema>;
type Preferences = z.infer<typeof preferencesSchema>;

interface WellnessJourneyRecommendation {
  id: string;
  type: 'daily_practice' | 'weekly_goal' | 'monthly_challenge' | 'resource' | 'milestone' | 'adjustment';
  title: string;
  description: string;
  category: string;
  priority: number;
  estimated_time: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  ai_reasoning: string;
  action_steps: string[];
  success_metrics: string[];
  resources: Array<{
    type: 'article' | 'video' | 'audio' | 'exercise' | 'tool' | 'app';
    title: string;
    url: string;
    duration?: number;
  }>;
  prerequisites?: string[];
  follow_up_actions?: string[];
  personalization_factors: string[];
  expected_outcomes: string[];
  progress_tracking: {
    method: string;
    frequency: string;
    checkpoints: string[];
  };
  adaptation_triggers: string[];
  crisis_support?: boolean;
}

interface JourneyPhase {
  id: string;
  name: string;
  description: string;
  duration: string;
  goals: string[];
  milestones: string[];
  recommendations: WellnessJourneyRecommendation[];
  progress: number;
  is_current: boolean;
  is_completed: boolean;
}

interface WellnessJourney {
  id: string;
  user_id: string;
  journey_type: string;
  start_date: string;
  estimated_completion: string;
  current_phase: string;
  overall_progress: number;
  phases: JourneyPhase[];
  goals: WellnessGoal[];
  lifestyle_assessment: LifestyleAssessment;
  preferences: Preferences;
  adaptations: Array<{
    date: string;
    reason: string;
    changes: string[];
  }>;
  success_stories: Array<{
    date: string;
    achievement: string;
    impact: string;
  }>;
  created_at: string;
  updated_at: string;
}

export default function WellnessJourneyRecommender() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Forms for different steps
  const goalsForm = useForm<{ goals: WellnessGoal[] }>({
    resolver: zodResolver(z.object({ goals: z.array(wellnessGoalSchema) })),
    defaultValues: { goals: [] }
  });

  const lifestyleForm = useForm<LifestyleAssessment>({
    resolver: zodResolver(lifestyleAssessmentSchema),
    defaultValues: {
      sleep_hours: 7,
      exercise_frequency: 'weekly',
      stress_level: 5,
      energy_level: 5,
      social_connection: 5,
      work_life_balance: 5,
      diet_quality: 'fair',
      support_system: 'moderate',
    }
  });

  const preferencesForm = useForm<Preferences>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      learning_style: 'visual',
      session_duration: '30_min',
      frequency: 'daily',
      reminder_preferences: ['email'],
      preferred_times: ['morning'],
      intensity_preference: 'moderate',
      group_vs_individual: 'individual',
      technology_comfort: 7,
    }
  });

  // Fetch existing journey
  const { data: existingJourney, isLoading: journeyLoading } = useQuery({
    queryKey: ['/api/wellness-journey/current'],
    enabled: isAuthenticated,
    retry: false,
  });

  // Generate journey mutation
  const generateJourney = useMutation({
    mutationFn: async (data: {
      goals: WellnessGoal[];
      lifestyle: LifestyleAssessment;
      preferences: Preferences;
    }) => {
      const response = await apiRequest('POST', '/api/wellness-journey/generate', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Journey Created!",
        description: "Your personalized wellness journey has been generated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wellness-journey/current'] });
      setCurrentStep(5); // Move to journey view
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate journey",
        variant: "destructive",
      });
    },
  });

  // Update progress mutation
  const updateProgress = useMutation({
    mutationFn: async (data: { recommendation_id: string; progress: number; notes?: string }) => {
      const response = await apiRequest('POST', '/api/wellness-journey/progress', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wellness-journey/current'] });
      toast({
        title: "Progress Updated",
        description: "Your progress has been saved.",
      });
    },
  });

  const handleGenerateJourney = async () => {
    const goalsValid = await goalsForm.trigger();
    const lifestyleValid = await lifestyleForm.trigger();
    const preferencesValid = await preferencesForm.trigger();

    if (!goalsValid || !lifestyleValid || !preferencesValid) {
      toast({
        title: "Please Complete All Sections",
        description: "Make sure all forms are filled out correctly.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateJourney.mutateAsync({
        goals: goalsForm.getValues().goals,
        lifestyle: lifestyleForm.getValues(),
        preferences: preferencesForm.getValues(),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const GoalsSetup = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Define Your Wellness Goals
        </CardTitle>
        <CardDescription>
          Set specific, measurable goals across different areas of your life
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['physical', 'mental', 'emotional', 'social'].map((category) => (
            <Card key={category} className="p-4">
              <h4 className="font-semibold mb-3 capitalize">{category} Wellness</h4>
              <div className="space-y-3">
                <Input placeholder={`Describe your ${category} goal`} />
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm">Current Level</label>
                    <Slider defaultValue={[5]} max={10} step={1} />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm">Target Level</label>
                    <Slider defaultValue={[8]} max={10} step={1} />
                  </div>
                </div>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1_month">1 Month</SelectItem>
                    <SelectItem value="3_months">3 Months</SelectItem>
                    <SelectItem value="6_months">6 Months</SelectItem>
                    <SelectItem value="1_year">1 Year</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea placeholder="What motivates you to achieve this goal?" rows={2} />
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const LifestyleAssessment = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Current Lifestyle Assessment
        </CardTitle>
        <CardDescription>
          Help us understand your current habits and circumstances
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Sleep Hours per Night</label>
              <Slider defaultValue={[7]} max={12} min={3} step={0.5} className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Current Stress Level (1-10)</label>
              <Slider defaultValue={[5]} max={10} min={1} step={1} className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Energy Level (1-10)</label>
              <Slider defaultValue={[5]} max={10} min={1} step={1} className="mt-2" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Exercise Frequency</label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="rarely">Rarely</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="several_times">Several times a week</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Diet Quality</label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Rate your diet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Support System</label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Rate your support" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="strong">Strong</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PreferencesSetup = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Your Preferences
        </CardTitle>
        <CardDescription>
          Customize how you want to engage with your wellness journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Learning Style</label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="How do you learn best?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">Visual (images, charts)</SelectItem>
                  <SelectItem value="auditory">Auditory (podcasts, music)</SelectItem>
                  <SelectItem value="kinesthetic">Hands-on (activities)</SelectItem>
                  <SelectItem value="reading">Reading/Writing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Preferred Session Duration</label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="How long per session?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5_min">5 minutes</SelectItem>
                  <SelectItem value="15_min">15 minutes</SelectItem>
                  <SelectItem value="30_min">30 minutes</SelectItem>
                  <SelectItem value="60_min">60 minutes</SelectItem>
                  <SelectItem value="90_min">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Intensity Preference</label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Challenge level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gentle">Gentle pace</SelectItem>
                  <SelectItem value="moderate">Moderate challenge</SelectItem>
                  <SelectItem value="intense">High intensity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Preferred Times</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['morning', 'afternoon', 'evening', 'late_night'].map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox id={time} />
                    <label htmlFor={time} className="text-sm capitalize">{time.replace('_', ' ')}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Reminder Preferences</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['email', 'push', 'sms'].map((method) => (
                  <div key={method} className="flex items-center space-x-2">
                    <Checkbox id={method} />
                    <label htmlFor={method} className="text-sm uppercase">{method}</label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Technology Comfort Level (1-10)</label>
              <Slider defaultValue={[7]} max={10} min={1} step={1} className="mt-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const JourneyOverview = ({ journey }: { journey: WellnessJourney }) => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              Your Personalized Wellness Journey
            </div>
            <Badge variant="secondary">{journey.overall_progress}% Complete</Badge>
          </CardTitle>
          <CardDescription>
            AI-generated journey based on your goals, lifestyle, and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={journey.overall_progress} className="w-full" />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{journey.phases.filter(p => p.is_completed).length}</div>
              <div className="text-sm text-gray-600">Phases Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{journey.goals.length}</div>
              <div className="text-sm text-gray-600">Active Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{journey.success_stories.length}</div>
              <div className="text-sm text-gray-600">Achievements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Current Phase: {journey.phases.find(p => p.is_current)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {journey.phases.find(p => p.is_current)?.recommendations.slice(0, 3).map((rec) => (
              <div key={rec.id} className="mb-4 p-3 border rounded-lg">
                <h4 className="font-semibold">{rec.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{rec.estimated_time} min</Badge>
                  <Button size="sm" onClick={() => updateProgress.mutate({ recommendation_id: rec.id, progress: 100 })}>
                    Complete
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {journey.success_stories.slice(0, 3).map((story, index) => (
              <div key={index} className="mb-3 p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800">{story.achievement}</h4>
                <p className="text-sm text-green-600">{story.impact}</p>
                <span className="text-xs text-green-500">{new Date(story.date).toLocaleDateString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (journeyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your wellness journey...</p>
        </div>
      </div>
    );
  }

  if (existingJourney) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <JourneyOverview journey={existingJourney} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-blue-600" />
          AI-Powered Wellness Journey Recommender
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Get a personalized, adaptive wellness journey designed specifically for your goals, lifestyle, and preferences using advanced AI analysis.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
              </div>
              {step < 4 && <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-2">
          <span className="text-sm text-gray-600">
            Step {currentStep} of 4: {
              currentStep === 1 ? 'Define Goals' :
              currentStep === 2 ? 'Assess Lifestyle' :
              currentStep === 3 ? 'Set Preferences' :
              'Generate Journey'
            }
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {currentStep === 1 && <GoalsSetup />}
        {currentStep === 2 && <LifestyleAssessment />}
        {currentStep === 3 && <PreferencesSetup />}
        
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Ready to Generate Your Journey!
              </CardTitle>
              <CardDescription>
                Based on your inputs, we'll create a personalized wellness journey with AI-powered recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-4xl">🌟</div>
              <p>Your personalized journey will include:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Daily personalized recommendations
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Adaptive milestone tracking
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Progress-based adjustments
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Curated resources and tools
                </div>
              </div>
              <Button
                onClick={handleGenerateJourney}
                disabled={isGenerating}
                className="w-full md:w-auto"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Generating Your Journey...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Generate My Journey
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
            disabled={currentStep === 4}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}