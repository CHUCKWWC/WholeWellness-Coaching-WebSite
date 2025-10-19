import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Target, 
  Calendar, 
  MessageSquare, 
  Brain,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ChatSummary } from "@shared/schema";

type ActionItem = string | { item: string; priority?: string };

interface ClientGoal {
  id: string;
  clientId: string;
  coachId: string;
  title: string;
  description: string;
  category: string;
  targetDate: string;
  progress: number;
  status: string;
  priority: string;
  milestones: string[];
  notes: string;
  createdAt: string;
}

interface SessionNote {
  id: string;
  sessionDate: string;
  duration: number;
  notes: string;
  keyPoints: string[];
  nextSteps: string[];
  clientMood: string;
}

interface ClientDetailViewProps {
  clientId: string;
  clientName: string;
  clientEmail: string;
  onClose: () => void;
}

export default function ClientDetailView({ clientId, clientName, clientEmail, onClose }: ClientDetailViewProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [editingGoal, setEditingGoal] = useState<ClientGoal | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "wellness",
    targetDate: "",
    priority: "medium"
  });

  // Fetch client goals
  const { data: goals = [], isLoading: goalsLoading } = useQuery<ClientGoal[]>({
    queryKey: ["/api/coach/clients", clientId, "goals"],
    enabled: !!clientId,
  });

  // Fetch session notes
  const { data: sessionNotes = [], isLoading: notesLoading } = useQuery<SessionNote[]>({
    queryKey: ["/api/coach/session-notes", clientId],
    enabled: !!clientId,
  });

  // Fetch AI insights (chat summaries)
  const { data: aiInsights = [], isLoading: insightsLoading } = useQuery<ChatSummary[]>({
    queryKey: ["/api/coach/client-ai-insights", clientId],
    enabled: !!clientId,
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: typeof newGoal) => {
      return apiRequest(`/api/coach/clients/${clientId}/goals`, "POST", goalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/clients", clientId, "goals"] });
      toast({ title: "Goal created successfully" });
      setNewGoal({
        title: "",
        description: "",
        category: "wellness",
        targetDate: "",
        priority: "medium"
      });
    },
    onError: () => {
      toast({ title: "Failed to create goal", variant: "destructive" });
    }
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ goalId, data }: { goalId: string; data: Partial<ClientGoal> }) => {
      return apiRequest(`/api/coach/goals/${goalId}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/clients", clientId, "goals"] });
      toast({ title: "Goal updated successfully" });
      setEditingGoal(null);
    },
    onError: () => {
      toast({ title: "Failed to update goal", variant: "destructive" });
    }
  });

  // Update goal progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ goalId, progress }: { goalId: string; progress: number }) => {
      return apiRequest(`/api/coach/goals/${goalId}/progress`, "PATCH", { progress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/clients", clientId, "goals"] });
      toast({ title: "Progress updated" });
    }
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      return apiRequest(`/api/coach/goals/${goalId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/clients", clientId, "goals"] });
      toast({ title: "Goal deleted" });
    }
  });

  const handleCreateGoal = () => {
    if (!newGoal.title || !newGoal.targetDate) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    createGoalMutation.mutate(newGoal);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "not_started": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getEmotionalToneColor = (tone: string | null) => {
    if (!tone) return "bg-gray-100 text-gray-800";
    switch (tone.toLowerCase()) {
      case "positive": return "bg-green-100 text-green-800";
      case "neutral": return "bg-blue-100 text-blue-800";
      case "struggling": return "bg-yellow-100 text-yellow-800";
      case "crisis": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="client-detail-view">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl" data-testid="text-client-name">{clientName}</CardTitle>
              <CardDescription data-testid="text-client-email">{clientEmail}</CardDescription>
            </div>
            <Button variant="outline" onClick={onClose} data-testid="button-close">
              Close
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile" data-testid="tab-profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="goals" data-testid="tab-goals">
                <Target className="h-4 w-4 mr-2" />
                Goals
              </TabsTrigger>
              <TabsTrigger value="sessions" data-testid="tab-sessions">
                <Calendar className="h-4 w-4 mr-2" />
                Sessions
              </TabsTrigger>
              <TabsTrigger value="ai-insights" data-testid="tab-ai-insights">
                <Brain className="h-4 w-4 mr-2" />
                AI Insights
              </TabsTrigger>
              <TabsTrigger value="communication" data-testid="tab-communication">
                <MessageSquare className="h-4 w-4 mr-2" />
                Communication
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <p className="text-sm font-medium" data-testid="text-profile-name">{clientName}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm font-medium" data-testid="text-profile-email">{clientEmail}</p>
                    </div>
                    <div>
                      <Label>Total Goals</Label>
                      <p className="text-sm font-medium" data-testid="text-total-goals">{goals.length}</p>
                    </div>
                    <div>
                      <Label>Total Sessions</Label>
                      <p className="text-sm font-medium" data-testid="text-total-sessions">{sessionNotes.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Goals Tab */}
            <TabsContent value="goals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Goal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="goal-title">Goal Title *</Label>
                      <Input
                        id="goal-title"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                        placeholder="e.g., Improve sleep quality"
                        data-testid="input-goal-title"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="goal-description">Description</Label>
                      <Textarea
                        id="goal-description"
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                        placeholder="Describe the goal in detail..."
                        data-testid="input-goal-description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="goal-category">Category</Label>
                      <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                        <SelectTrigger id="goal-category" data-testid="select-goal-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wellness">Wellness</SelectItem>
                          <SelectItem value="nutrition">Nutrition</SelectItem>
                          <SelectItem value="fitness">Fitness</SelectItem>
                          <SelectItem value="mental-health">Mental Health</SelectItem>
                          <SelectItem value="career">Career</SelectItem>
                          <SelectItem value="relationships">Relationships</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="goal-priority">Priority</Label>
                      <Select value={newGoal.priority} onValueChange={(value) => setNewGoal({ ...newGoal, priority: value })}>
                        <SelectTrigger id="goal-priority" data-testid="select-goal-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="goal-target-date">Target Date *</Label>
                      <Input
                        id="goal-target-date"
                        type="date"
                        value={newGoal.targetDate}
                        onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                        data-testid="input-goal-target-date"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleCreateGoal} 
                    disabled={createGoalMutation.isPending}
                    data-testid="button-create-goal"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Goal
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Goals ({goals.filter(g => g.status !== 'completed').length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goalsLoading ? (
                    <p className="text-sm text-gray-500">Loading goals...</p>
                  ) : goals.length === 0 ? (
                    <p className="text-sm text-gray-500">No goals yet. Create one above!</p>
                  ) : (
                    goals.map((goal) => (
                      <Card key={goal.id} className="border-l-4 border-l-blue-500" data-testid={`goal-card-${goal.id}`}>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold" data-testid={`text-goal-title-${goal.id}`}>{goal.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingGoal(goal)}
                                  data-testid={`button-edit-goal-${goal.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteGoalMutation.mutate(goal.id)}
                                  data-testid={`button-delete-goal-${goal.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 flex-wrap">
                              <Badge className={getPriorityColor(goal.priority)}>
                                {goal.priority}
                              </Badge>
                              <Badge className={getStatusColor(goal.status)}>
                                {goal.status?.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline">
                                {goal.category}
                              </Badge>
                              <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                Due: {new Date(goal.targetDate).toLocaleDateString()}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium" data-testid={`text-goal-progress-${goal.id}`}>{goal.progress}%</span>
                              </div>
                              <Progress value={goal.progress} className="h-2" />
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateProgressMutation.mutate({ 
                                    goalId: goal.id, 
                                    progress: Math.min(100, goal.progress + 10) 
                                  })}
                                  data-testid={`button-increase-progress-${goal.id}`}
                                >
                                  +10%
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateProgressMutation.mutate({ 
                                    goalId: goal.id, 
                                    progress: Math.max(0, goal.progress - 10) 
                                  })}
                                  data-testid={`button-decrease-progress-${goal.id}`}
                                >
                                  -10%
                                </Button>
                                {goal.progress === 100 && (
                                  <Badge className="bg-green-100 text-green-800 ml-auto">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Complete!
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Session History ({sessionNotes.length})</CardTitle>
                  <CardDescription>Review past sessions and progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {notesLoading ? (
                    <p className="text-sm text-gray-500">Loading sessions...</p>
                  ) : sessionNotes.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500">No sessions recorded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sessionNotes.map((note) => (
                        <Card key={note.id} className="border-l-4 border-l-purple-500" data-testid={`session-card-${note.id}`}>
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Calendar className="h-5 w-5 text-purple-600" />
                                  <div>
                                    <p className="font-semibold">{new Date(note.sessionDate).toLocaleDateString('en-US', { 
                                      weekday: 'long', 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}</p>
                                    <p className="text-sm text-gray-500">{note.duration} minutes</p>
                                  </div>
                                </div>
                                {note.clientMood && (
                                  <Badge variant="outline">
                                    Mood: {note.clientMood}
                                  </Badge>
                                )}
                              </div>
                              
                              <div>
                                <Label className="text-xs text-gray-500">Session Notes</Label>
                                <p className="text-sm mt-1">{note.notes}</p>
                              </div>

                              {note.keyPoints && note.keyPoints.length > 0 && (
                                <div>
                                  <Label className="text-xs text-gray-500">Key Points</Label>
                                  <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                                    {note.keyPoints.map((point, idx) => (
                                      <li key={idx}>{point}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {note.nextSteps && note.nextSteps.length > 0 && (
                                <div>
                                  <Label className="text-xs text-gray-500">Next Steps</Label>
                                  <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                                    {note.nextSteps.map((step, idx) => (
                                      <li key={idx}>{step}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="ai-insights" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Conversation Insights ({aiInsights.length})</CardTitle>
                  <CardDescription>AI-generated summaries from client conversations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {insightsLoading ? (
                    <p className="text-sm text-gray-500">Loading insights...</p>
                  ) : aiInsights.length === 0 ? (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500">No AI conversations yet</p>
                      <p className="text-xs text-gray-400 mt-1">Insights will appear once the client uses AI coaching</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {aiInsights.map((insight) => (
                        <Card key={insight.id} className="border-l-4 border-l-indigo-500" data-testid={`insight-card-${insight.id}`}>
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Brain className="h-5 w-5 text-indigo-600" />
                                  <div>
                                    <p className="font-semibold">{new Date(insight.conversationDate).toLocaleDateString('en-US', { 
                                      month: 'long', 
                                      day: 'numeric', 
                                      year: 'numeric' 
                                    })}</p>
                                    <p className="text-sm text-gray-500">
                                      {insight.coachType} • {insight.messageCount} messages
                                    </p>
                                  </div>
                                </div>
                                {insight.emotionalTone && (
                                  <Badge className={getEmotionalToneColor(insight.emotionalTone)}>
                                    {insight.emotionalTone}
                                  </Badge>
                                )}
                              </div>

                              <div>
                                <Label className="text-xs text-gray-500">Summary</Label>
                                <p className="text-sm mt-1">{insight.summary}</p>
                              </div>

                              {insight.keyTopics && insight.keyTopics.length > 0 && (
                                <div>
                                  <Label className="text-xs text-gray-500">Key Topics</Label>
                                  <div className="flex gap-2 flex-wrap mt-1">
                                    {insight.keyTopics.map((topic, idx) => (
                                      <Badge key={idx} variant="outline">{topic}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {insight.insights && (
                                <div>
                                  <Label className="text-xs text-gray-500">AI Analysis</Label>
                                  <p className="text-sm mt-1 italic">{insight.insights}</p>
                                </div>
                              )}

                              {insight.actionItems && Array.isArray(insight.actionItems) && insight.actionItems.length > 0 && (
                                <div>
                                  <Label className="text-xs text-gray-500">Action Items</Label>
                                  <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                                    {(insight.actionItems as ActionItem[]).map((item, idx) => (
                                      <li key={idx}>
                                        {typeof item === 'string' ? item : item.item}
                                        {typeof item === 'object' && item.priority && (
                                          <Badge className="ml-2" variant="outline">{item.priority}</Badge>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Communication Tab */}
            <TabsContent value="communication" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Communication History</CardTitle>
                  <CardDescription>Messages and notes with {clientName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">Communication features coming soon</p>
                    <p className="text-xs text-gray-400 mt-1">You'll be able to send messages and view communication history here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
