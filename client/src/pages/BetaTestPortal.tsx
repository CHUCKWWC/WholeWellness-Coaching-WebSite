import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AICoachingSession from "@/components/AICoachingSession";
import { 
  Brain,
  Heart,
  Target,
  Users,
  Clock,
  Star,
  MessageSquare,
  CheckCircle,
  Play,
  BarChart3,
  Calendar,
  Award,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

interface AISession {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: React.ReactNode;
  features: string[];
  testingFocus: string[];
}

interface BetaFeedback {
  sessionId: string;
  rating: number;
  experience: string;
  usability: number;
  effectiveness: number;
  wouldRecommend: boolean;
  additionalComments: string;
  technicalIssues: string;
  suggestions: string;
}

const aiCoachingSessions: AISession[] = [
  {
    id: "finance",
    title: "AI Finance Coach",
    description: "Expert financial guidance for budgeting, saving, debt management, and investment planning",
    category: "Finance",
    duration: "15-25 min",
    difficulty: "Beginner",
    icon: <Brain className="h-6 w-6 text-green-600" />,
    features: ["Budget Creation", "Debt Strategies", "Savings Plans", "Investment Guidance"],
    testingFocus: ["Financial advice accuracy", "Budget practicality", "Goal-setting effectiveness"]
  },
  {
    id: "relationship",
    title: "AI Relationship Coach",
    description: "Communication skills, conflict resolution, and emotional support for healthier relationships",
    category: "Relationships",
    duration: "20-30 min",
    difficulty: "Intermediate",
    icon: <Heart className="h-6 w-6 text-red-600" />,
    features: ["Communication Skills", "Conflict Resolution", "Emotional Support", "Relationship Building"],
    testingFocus: ["Empathy in responses", "Practical relationship advice", "Emotional intelligence"]
  },
  {
    id: "career",
    title: "AI Career Coach",
    description: "Professional development, job search strategies, and career advancement planning",
    category: "Career",
    duration: "18-28 min",
    difficulty: "Intermediate",
    icon: <Target className="h-6 w-6 text-blue-600" />,
    features: ["Resume Guidance", "Interview Prep", "Skill Development", "Career Planning"],
    testingFocus: ["Professional advice quality", "Industry relevance", "Goal achievement planning"]
  },
  {
    id: "health",
    title: "AI Health Coach",
    description: "Wellness, nutrition, fitness, and healthy lifestyle guidance for overall well-being",
    category: "Health & Wellness",
    duration: "15-25 min",
    difficulty: "Beginner",
    icon: <Award className="h-6 w-6 text-purple-600" />,
    features: ["Nutrition Planning", "Fitness Routines", "Wellness Tracking", "Healthy Habits"],
    testingFocus: ["Health advice safety", "Personalization accuracy", "Sustainable recommendations"]
  },
  {
    id: "general",
    title: "AI General Coach",
    description: "Comprehensive life coaching, personal development, and general guidance for all life areas",
    category: "General Life Coaching",
    duration: "20-30 min",
    difficulty: "Beginner",
    icon: <Users className="h-6 w-6 text-teal-600" />,
    features: ["Goal Setting", "Life Planning", "Personal Growth", "General Guidance"],
    testingFocus: ["Versatility in topics", "Adaptive responses", "Comprehensive support"]
  }
];

export default function BetaTestPortal() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/beta-test/:sessionId?");
  const [selectedSession, setSelectedSession] = useState<string | null>(params?.sessionId || null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [betaUser, setBetaUser] = useState({
    name: "",
    email: "",
    experience: "",
    goals: ""
  });
  const [feedback, setFeedback] = useState<Partial<BetaFeedback>>({
    rating: 5,
    usability: 5,
    effectiveness: 5,
    wouldRecommend: true
  });
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get beta testing stats
  const { data: betaStats } = useQuery({
    queryKey: ['/api/beta-test/stats'],
    retry: false,
  });

  // Register beta tester
  const registerMutation = useMutation({
    mutationFn: async (userData: typeof betaUser) => {
      return await apiRequest("POST", "/api/beta-test/register", userData);
    },
    onSuccess: () => {
      toast({
        title: "Welcome to Beta Testing!",
        description: "You're now registered. Choose a session to test.",
      });
    },
  });

  // Start AI session
  const startSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return await apiRequest("POST", "/api/beta-test/start-session", {
        sessionId,
        userInfo: betaUser
      });
    },
    onSuccess: () => {
      setSessionStarted(true);
      toast({
        title: "Session Started",
        description: "Your AI coaching session is now active. The system is tracking your experience.",
      });
    },
  });

  // Submit feedback
  const feedbackMutation = useMutation({
    mutationFn: async (feedbackData: BetaFeedback) => {
      return await apiRequest("POST", "/api/beta-test/feedback", feedbackData);
    },
    onSuccess: () => {
      setShowFeedback(false);
      setSessionCompleted(true);
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your valuable feedback! You can test another session or review results.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/beta-test/stats'] });
    },
  });

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSession(sessionId);
    setLocation(`/beta-test/${sessionId}`);
  };

  const handleStartSession = () => {
    if (!betaUser.name || !betaUser.email) {
      toast({
        title: "Registration Required",
        description: "Please provide your name and email to start testing.",
        variant: "destructive",
      });
      return;
    }
    startSessionMutation.mutate(selectedSession!);
  };

  const handleCompleteSession = () => {
    setShowFeedback(true);
    setSessionStarted(false);
  };

  const handleSubmitFeedback = () => {
    if (!feedback.experience || !feedback.additionalComments) {
      toast({
        title: "Feedback Required",
        description: "Please fill in all required feedback fields.",
        variant: "destructive",
      });
      return;
    }

    feedbackMutation.mutate({
      sessionId: selectedSession!,
      rating: feedback.rating!,
      experience: feedback.experience!,
      usability: feedback.usability!,
      effectiveness: feedback.effectiveness!,
      wouldRecommend: feedback.wouldRecommend!,
      additionalComments: feedback.additionalComments!,
      technicalIssues: feedback.technicalIssues || "",
      suggestions: feedback.suggestions || ""
    });
  };

  const selectedSessionData = aiCoachingSessions.find(s => s.id === selectedSession);

  if (showFeedback && selectedSessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Beta Testing Feedback - {selectedSessionData.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Overall Rating (1-5 stars)</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedback({...feedback, rating: star})}
                          className={`p-1 ${star <= (feedback.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}
                        >
                          <Star className="h-6 w-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Usability (1-5)</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          onClick={() => setFeedback({...feedback, usability: score})}
                          className={`w-8 h-8 rounded ${score <= (feedback.usability || 0) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Effectiveness (1-5)</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          onClick={() => setFeedback({...feedback, effectiveness: score})}
                          className={`w-8 h-8 rounded ${score <= (feedback.effectiveness || 0) ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Describe Your Experience *</Label>
                  <Textarea
                    placeholder="How was your overall experience with this AI coaching session?"
                    value={feedback.experience || ""}
                    onChange={(e) => setFeedback({...feedback, experience: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Additional Comments *</Label>
                  <Textarea
                    placeholder="What did you like most? What could be improved? Any specific feedback on the AI responses?"
                    value={feedback.additionalComments || ""}
                    onChange={(e) => setFeedback({...feedback, additionalComments: e.target.value})}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Technical Issues (Optional)</Label>
                  <Textarea
                    placeholder="Did you encounter any technical problems or bugs?"
                    value={feedback.technicalIssues || ""}
                    onChange={(e) => setFeedback({...feedback, technicalIssues: e.target.value})}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Suggestions for Improvement (Optional)</Label>
                  <Textarea
                    placeholder="What features or improvements would you like to see?"
                    value={feedback.suggestions || ""}
                    onChange={(e) => setFeedback({...feedback, suggestions: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="recommend"
                    checked={feedback.wouldRecommend}
                    onChange={(e) => setFeedback({...feedback, wouldRecommend: e.target.checked})}
                  />
                  <Label htmlFor="recommend">I would recommend this AI coaching session to others</Label>
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={handleSubmitFeedback}
                    disabled={feedbackMutation.isPending}
                    className="flex-1"
                  >
                    {feedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowFeedback(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Weight Loss Coach - Beta Testing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Welcome to our exclusive beta testing program! Test our AI-powered weight loss coaching sessions 
            and help us improve the experience for everyone.
          </p>
          
          {betaStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{betaStats.totalTesters}</div>
                  <div className="text-sm text-gray-600">Beta Testers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{betaStats.sessionsCompleted}</div>
                  <div className="text-sm text-gray-600">Sessions Tested</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{betaStats.averageRating}</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{betaStats.feedbackCount}</div>
                  <div className="text-sm text-gray-600">Feedback Reports</div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>

        {/* Registration Form */}
        {!sessionStarted && !sessionCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Beta Tester Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      placeholder="Your name"
                      value={betaUser.name}
                      onChange={(e) => setBetaUser({...betaUser, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={betaUser.email}
                      onChange={(e) => setBetaUser({...betaUser, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Experience with AI/Coaching</Label>
                    <Input
                      placeholder="Beginner, Intermediate, Advanced"
                      value={betaUser.experience}
                      onChange={(e) => setBetaUser({...betaUser, experience: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Areas of Interest</Label>
                    <Input
                      placeholder="Finance, Relationships, Career, Health, General Life Coaching"
                      value={betaUser.goals}
                      onChange={(e) => setBetaUser({...betaUser, goals: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Session Selection */}
        {!sessionStarted && !sessionCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose an AI Coach to Test</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiCoachingSessions.map((session) => (
                <motion.div
                  key={session.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all ${
                      selectedSession === session.id 
                        ? 'ring-2 ring-blue-500 shadow-lg' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleSessionSelect(session.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {session.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{session.title}</CardTitle>
                            <Badge variant="outline">{session.category}</Badge>
                          </div>
                        </div>
                        <Badge variant={
                          session.difficulty === 'Beginner' ? 'default' :
                          session.difficulty === 'Intermediate' ? 'secondary' : 'destructive'
                        }>
                          {session.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{session.description}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{session.duration}</span>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Key Features:</h4>
                        <div className="flex flex-wrap gap-1">
                          {session.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 mt-3">
                        <h4 className="font-medium text-sm">Testing Focus:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {session.testingFocus.map((focus, idx) => (
                            <li key={idx}>• {focus}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {selectedSession && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center"
              >
                <Button 
                  onClick={handleStartSession}
                  disabled={startSessionMutation.isPending}
                  size="lg"
                  className="px-8"
                >
                  <Play className="h-5 w-5 mr-2" />
                  {startSessionMutation.isPending ? "Starting..." : `Start ${selectedSessionData?.title} Session`}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Active Session */}
        {sessionStarted && selectedSessionData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {selectedSessionData.title} - Real AI Implementation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">Live AI Coaching System - Powered by OpenAI</span>
                  </div>
                  <p className="text-green-700 text-sm mt-2">
                    You're now testing the real AI coaching implementation with actual personalized responses.
                  </p>
                </div>
                
                <AICoachingSession 
                  sessionType={selectedSession!} 
                  onComplete={handleCompleteSession}
                  betaMode={true}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Completion Message */}
        {sessionCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <Card>
              <CardContent className="p-8">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-green-600 mb-4">Thank You for Beta Testing!</h2>
                <p className="text-gray-600 mb-6">
                  Your feedback has been recorded and will help us improve the AI coaching experience.
                </p>
                
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => {
                      setSelectedSession(null);
                      setSessionCompleted(false);
                      setLocation('/beta-test');
                    }}
                  >
                    Test Another Session
                  </Button>
                  <Button variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Results Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}