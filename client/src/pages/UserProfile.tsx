import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Activity, 
  Target, 
  Calendar, 
  TrendingUp, 
  Heart, 
  Brain, 
  Dumbbell,
  Users,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";

export default function UserProfile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's assessment completion status
  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ["/api/assessments/user", user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

  // Get coaching session history
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/coaching/sessions", user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

  // Get progress metrics
  const { data: progressMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/user/progress-metrics", user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access your profile and progress tracking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => window.location.href = '/api/login'}
            >
              Log In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Welcome back, {user?.firstName || 'Member'}!</CardTitle>
                  <CardDescription>
                    Track your wellness journey and view your progress across all coaching areas.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="coaching">Coaching History</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assessments Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assessments.length}</div>
                  <p className="text-xs text-muted-foreground">Profile insights available</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Coaching Sessions</CardTitle>
                  <Activity className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sessions.length}</div>
                  <p className="text-xs text-muted-foreground">AI & Human coaching</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                  <Target className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Streak Days</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">Days active</p>
                </CardContent>
              </Card>
            </div>

            {/* Wellness Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Wellness Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Overall Wellness</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">↗</div>
                        <div className="text-xs text-gray-600">Improving</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">7.8</div>
                        <div className="text-xs text-gray-600">Score /10</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="text-sm">
                        <span className="font-medium">Weight Loss Assessment</span>
                        <span className="text-gray-500 ml-2">2 days ago</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="text-sm">
                        <span className="font-medium">AI Coaching Session</span>
                        <span className="text-gray-500 ml-2">3 days ago</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="text-sm">
                        <span className="font-medium">Relationship Assessment</span>
                        <span className="text-gray-500 ml-2">1 week ago</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Assessment History</CardTitle>
                <CardDescription>
                  View your completed assessments and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assessmentsLoading ? (
                  <div className="text-center py-8">Loading assessments...</div>
                ) : assessments.length > 0 ? (
                  <div className="space-y-4">
                    {assessments.map((assessment: any) => (
                      <div key={assessment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{assessment.assessmentType?.displayName}</h4>
                            <p className="text-sm text-gray-600">
                              Completed {new Date(assessment.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No assessments completed yet. <a href="/assessments" className="text-primary hover:underline">Take your first assessment</a>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coaching History Tab */}
          <TabsContent value="coaching" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    AI Coaching Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Sessions</span>
                      <Badge variant="secondary">8 sessions</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Favorite Coach</span>
                      <span className="text-sm font-medium">Weight Loss Coach</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Session</span>
                      <span className="text-sm text-gray-600">2 days ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    Human Coaching Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Sessions</span>
                      <Badge variant="secondary">3 sessions</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Assigned Coach</span>
                      <span className="text-sm font-medium">Sarah Johnson</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Next Session</span>
                      <span className="text-sm text-green-600">Tomorrow 2PM</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Progress Tracking Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    Health Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Weight Goal</span>
                        <span>70%</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Fitness Level</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Nutrition</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-pink-500" />
                    Relationship Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Communication</span>
                        <span>80%</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Trust Building</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Conflict Resolution</span>
                        <span>55%</span>
                      </div>
                      <Progress value={55} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-green-500" />
                    Mental Wellness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Stress Management</span>
                        <span>72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Mindfulness</span>
                        <span>60%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Life Balance</span>
                        <span>78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Goals Section */}
            <Card>
              <CardHeader>
                <CardTitle>Active Goals</CardTitle>
                <CardDescription>Track your progress on current wellness goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Dumbbell className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-medium">Lose 15 pounds</h4>
                        <p className="text-sm text-gray-600">Target: March 2025</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">70% Complete</div>
                      <Progress value={70} className="w-20 h-2 mt-1" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-pink-600" />
                      <div>
                        <h4 className="font-medium">Improve relationship communication</h4>
                        <p className="text-sm text-gray-600">Target: Ongoing</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">45% Complete</div>
                      <Progress value={45} className="w-20 h-2 mt-1" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Daily mindfulness practice</h4>
                        <p className="text-sm text-gray-600">Target: Daily habit</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">60% Complete</div>
                      <Progress value={60} className="w-20 h-2 mt-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}