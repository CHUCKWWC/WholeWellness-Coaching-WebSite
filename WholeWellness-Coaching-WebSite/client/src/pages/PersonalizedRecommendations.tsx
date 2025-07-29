import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Heart, 
  Shield, 
  TrendingUp, 
  Clock, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  AlertTriangle,
  Target,
  Activity,
  Users,
  Calendar,
  BarChart3,
  CheckCircle,
  XCircle,
  Lightbulb,
  Phone,
  Globe,
  Smartphone
} from 'lucide-react';

interface UserProfile {
  demographics?: {
    age?: number;
    gender?: string;
    location?: string;
  };
  preferences?: {
    communicationStyle?: string;
    sessionTiming?: string;
    specialtyAreas?: string[];
  };
  mentalHealthProfile?: {
    primaryConcerns?: string[];
    currentChallenges?: string[];
    previousExperiences?: string[];
    riskFactors?: string[];
  };
  behaviorPatterns?: {
    resourceUsage?: any[];
    engagementLevel?: string;
    preferredResourceTypes?: string[];
  };
}

interface RecommendationContext {
  currentMood?: string;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'crisis';
  sessionGoals?: string[];
  timeAvailable?: number;
  environment?: 'private' | 'public';
}

interface WellnessRecommendation {
  id: string;
  type: 'resource' | 'activity' | 'coaching' | 'crisis_support';
  title: string;
  description: string;
  reasoning: string;
  priority: number;
  estimatedTime: number;
  resourceId?: number;
  actionSteps: string[];
  followUpSuggestions?: string[];
  crisisLevel?: boolean;
  personalizedScore?: number;
}

export default function PersonalizedRecommendations() {
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [context, setContext] = useState<RecommendationContext>({});
  const [activeTab, setActiveTab] = useState('profile');
  const [recommendations, setRecommendations] = useState<WellnessRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch recommendation history
  const { data: history } = useQuery({
    queryKey: ['/api/recommendations/history'],
    retry: false,
  });

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ['/api/recommendations/analytics'],
    retry: false,
  });

  // Generate recommendations mutation
  const generateRecommendations = useMutation({
    mutationFn: async (data: { userProfile: UserProfile; context: RecommendationContext }) => {
      const response = await apiRequest('/api/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: (data) => {
      setRecommendations(data.recommendations);
      setActiveTab('recommendations');
      toast({
        title: "Recommendations Generated",
        description: `Generated ${data.recommendations.length} personalized recommendations for you.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate recommendations",
        variant: "destructive",
      });
    },
  });

  // Track recommendation usage
  const trackUsage = useMutation({
    mutationFn: async (data: { recommendationId: string; action: string }) => {
      await apiRequest('/api/recommendations/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations/analytics'] });
    },
  });

  // Submit feedback mutation
  const submitFeedback = useMutation({
    mutationFn: async (data: { recommendationId: string; feedback: string; wasHelpful: boolean }) => {
      await apiRequest('/api/recommendations/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! This helps us improve our recommendations.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations/analytics'] });
    },
  });

  const handleGenerateRecommendations = async () => {
    if (!userProfile.mentalHealthProfile?.primaryConcerns?.length) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your mental health profile to generate personalized recommendations.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateRecommendations.mutateAsync({ userProfile, context });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRecommendationAction = (recommendation: WellnessRecommendation, action: string) => {
    trackUsage.mutate({
      recommendationId: recommendation.id,
      action,
    });

    if (action === 'accessed' && recommendation.resourceId) {
      // Handle resource access
      if (recommendation.type === 'crisis_support') {
        window.open(`tel:${recommendation.actionSteps[0]?.replace('Call ', '')}`);
      } else {
        // Navigate to resource or external link
        toast({
          title: "Resource Accessed",
          description: `Opening ${recommendation.title}`,
        });
      }
    }
  };

  const RecommendationCard = ({ recommendation }: { recommendation: WellnessRecommendation }) => (
    <Card className={`${recommendation.crisisLevel ? 'border-red-500 bg-red-50' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {recommendation.type === 'crisis_support' && <AlertTriangle className="w-5 h-5 text-red-500" />}
            {recommendation.type === 'resource' && <Globe className="w-5 h-5 text-blue-500" />}
            {recommendation.type === 'activity' && <Activity className="w-5 h-5 text-green-500" />}
            {recommendation.type === 'coaching' && <Users className="w-5 h-5 text-purple-500" />}
            <CardTitle className="text-lg">{recommendation.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={recommendation.crisisLevel ? "destructive" : "secondary"}>
              Priority {recommendation.priority}
            </Badge>
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              {recommendation.estimatedTime}min
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{recommendation.description}</p>
        
        <div className="mb-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Why this is recommended
          </h4>
          <p className="text-sm text-gray-600">{recommendation.reasoning}</p>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Action Steps
          </h4>
          <ul className="space-y-1">
            {recommendation.actionSteps.map((step, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                {step}
              </li>
            ))}
          </ul>
        </div>

        {recommendation.followUpSuggestions && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Follow-up Suggestions</h4>
            <ul className="space-y-1">
              {recommendation.followUpSuggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-gray-600">• {suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => handleRecommendationAction(recommendation, 'accessed')}
            className={recommendation.crisisLevel ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {recommendation.crisisLevel ? (
              <>
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </>
            ) : (
              'Access Resource'
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleRecommendationAction(recommendation, 'helpful')}
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            Helpful
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleRecommendationAction(recommendation, 'not_helpful')}
          >
            <ThumbsDown className="w-4 h-4 mr-2" />
            Not Helpful
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-blue-600" />
          Personalized Wellness Recommendations
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Get AI-powered, personalized wellness recommendations tailored to your unique needs, 
          preferences, and current situation.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile Setup</TabsTrigger>
          <TabsTrigger value="context">Current Context</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Personal Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={userProfile.demographics?.age || ''}
                    onChange={(e) => setUserProfile({
                      ...userProfile,
                      demographics: {
                        ...userProfile.demographics,
                        age: parseInt(e.target.value) || undefined
                      }
                    })}
                    placeholder="Enter your age"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={userProfile.demographics?.gender || ''}
                    onValueChange={(value) => setUserProfile({
                      ...userProfile,
                      demographics: { ...userProfile.demographics, gender: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Primary Mental Health Concerns</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {['Anxiety', 'Depression', 'Stress', 'Trauma', 'Relationship Issues', 'Self-Esteem', 'Sleep Issues', 'Grief', 'Anger Management'].map((concern) => (
                    <div key={concern} className="flex items-center space-x-2">
                      <Checkbox
                        id={concern}
                        checked={userProfile.mentalHealthProfile?.primaryConcerns?.includes(concern) || false}
                        onCheckedChange={(checked) => {
                          const concerns = userProfile.mentalHealthProfile?.primaryConcerns || [];
                          const updated = checked 
                            ? [...concerns, concern]
                            : concerns.filter(c => c !== concern);
                          setUserProfile({
                            ...userProfile,
                            mentalHealthProfile: {
                              ...userProfile.mentalHealthProfile,
                              primaryConcerns: updated
                            }
                          });
                        }}
                      />
                      <Label htmlFor={concern} className="text-sm">{concern}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Preferred Resource Types</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {['hotline', 'website', 'app', 'program'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={userProfile.behaviorPatterns?.preferredResourceTypes?.includes(type) || false}
                        onCheckedChange={(checked) => {
                          const types = userProfile.behaviorPatterns?.preferredResourceTypes || [];
                          const updated = checked 
                            ? [...types, type]
                            : types.filter(t => t !== type);
                          setUserProfile({
                            ...userProfile,
                            behaviorPatterns: {
                              ...userProfile.behaviorPatterns,
                              preferredResourceTypes: updated
                            }
                          });
                        }}
                      />
                      <Label htmlFor={type} className="text-sm capitalize">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="engagementLevel">Engagement Level</Label>
                <Select
                  value={userProfile.behaviorPatterns?.engagementLevel || ''}
                  onValueChange={(value) => setUserProfile({
                    ...userProfile,
                    behaviorPatterns: { ...userProfile.behaviorPatterns, engagementLevel: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select engagement level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Occasional use</SelectItem>
                    <SelectItem value="medium">Medium - Regular use</SelectItem>
                    <SelectItem value="high">High - Daily use</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="context" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Current Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentMood">Current Mood</Label>
                  <Select
                    value={context.currentMood || ''}
                    onValueChange={(value) => setContext({ ...context, currentMood: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How are you feeling?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="great">Great</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="okay">Okay</SelectItem>
                      <SelectItem value="stressed">Stressed</SelectItem>
                      <SelectItem value="anxious">Anxious</SelectItem>
                      <SelectItem value="sad">Sad</SelectItem>
                      <SelectItem value="overwhelmed">Overwhelmed</SelectItem>
                      <SelectItem value="crisis">In Crisis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="urgencyLevel">Urgency Level</Label>
                  <Select
                    value={context.urgencyLevel || ''}
                    onValueChange={(value) => setContext({ ...context, urgencyLevel: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How urgent is your need?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - General wellness</SelectItem>
                      <SelectItem value="medium">Medium - Some support needed</SelectItem>
                      <SelectItem value="high">High - Immediate attention</SelectItem>
                      <SelectItem value="crisis">Crisis - Emergency help needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="timeAvailable">Time Available (minutes)</Label>
                <div className="mt-2">
                  <Slider
                    value={[context.timeAvailable || 30]}
                    onValueChange={(value) => setContext({ ...context, timeAvailable: value[0] })}
                    max={120}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>5 min</span>
                    <span>{context.timeAvailable || 30} minutes</span>
                    <span>2 hours</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="environment">Environment</Label>
                <Select
                  value={context.environment || ''}
                  onValueChange={(value) => setContext({ ...context, environment: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Where are you?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private space</SelectItem>
                    <SelectItem value="public">Public space</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sessionGoals">Session Goals</Label>
                <Textarea
                  id="sessionGoals"
                  placeholder="What would you like to accomplish in this session?"
                  value={context.sessionGoals?.join(', ') || ''}
                  onChange={(e) => setContext({
                    ...context,
                    sessionGoals: e.target.value.split(',').map(g => g.trim()).filter(g => g)
                  })}
                />
              </div>

              <Button 
                onClick={handleGenerateRecommendations}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    Generating Recommendations...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Personalized Recommendations
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Recommendations Yet</h3>
                <p className="text-gray-600 mb-4">
                  Complete your profile and generate personalized recommendations to get started.
                </p>
                <Button onClick={() => setActiveTab('profile')}>
                  Complete Profile
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Personalized Recommendations</h2>
                <Badge variant="outline">
                  {recommendations.length} recommendations
                </Badge>
              </div>
              
              {recommendations.map((recommendation) => (
                <RecommendationCard key={recommendation.id} recommendation={recommendation} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.analytics?.totalRecommendations || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Accessed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.analytics?.accessedRecommendations || 0}</div>
                <div className="text-sm text-gray-500">
                  {analytics?.analytics?.accessRate?.toFixed(1) || 0}% access rate
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Helpful</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{analytics?.analytics?.helpfulRecommendations || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Helpfulness Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {analytics?.analytics?.helpfulnessRate?.toFixed(1) || 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommendation History</CardTitle>
            </CardHeader>
            <CardContent>
              {history?.recommendations?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recommendation history available.</p>
              ) : (
                <div className="space-y-4">
                  {history?.recommendations?.slice(0, 10).map((rec: any) => (
                    <div key={rec.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{rec.mental_wellness_resources?.title || 'Recommendation'}</h4>
                        <p className="text-sm text-gray-600">{rec.mental_wellness_resources?.description}</p>
                        <p className="text-xs text-gray-500">
                          Generated: {new Date(rec.generated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {rec.was_accessed && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {rec.was_helpful === true && <ThumbsUp className="w-4 h-4 text-green-500" />}
                        {rec.was_helpful === false && <ThumbsDown className="w-4 h-4 text-red-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}