import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Calendar, Clock, Target, MessageSquare, TrendingUp, AlertTriangle, CheckCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface GroupSession {
  id: string;
  title: string;
  description: string;
  sessionType: 'support_group' | 'skill_building' | 'peer_mentorship' | 'crisis_intervention';
  maxParticipants: number;
  currentParticipants: number;
  scheduledDate: Date;
  duration: number;
  facilitatorId: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  recurringPattern?: 'weekly' | 'biweekly' | 'monthly';
  tags: string[];
  participants: GroupParticipant[];
  outcomes?: SessionOutcome[];
}

interface GroupParticipant {
  id: string;
  clientId: string;
  name: string;
  email: string;
  joinDate: Date;
  attendanceRate: number;
  riskLevel: 'low' | 'medium' | 'high' | 'crisis';
  goals: string[];
  progressNotes: string;
  lastAttended?: Date;
  status: 'active' | 'inactive' | 'graduated' | 'referred';
}

interface SessionOutcome {
  id: string;
  sessionId: string;
  participantId: string;
  goalProgress: number;
  engagementLevel: number;
  keyInsights: string;
  actionItems: string[];
  nextSessionGoals: string[];
  riskAssessment: 'improved' | 'stable' | 'declined' | 'crisis';
}

interface GroupSessionManagerProps {
  coachId: number;
  isCoach: boolean;
}

export default function GroupSessionManager({ coachId, isCoach }: GroupSessionManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<GroupSession | null>(null);
  const [newSessionDialogOpen, setNewSessionDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('sessions');

  const { data: groupSessions = [], isLoading } = useQuery({
    queryKey: ['/api/coach/group-sessions', coachId],
    enabled: !!coachId,
  });

  const { data: availableClients = [] } = useQuery({
    queryKey: ['/api/coach/available-clients', coachId],
    enabled: !!coachId && isCoach,
  });

  const createSessionMutation = useMutation({
    mutationFn: (sessionData: Partial<GroupSession>) =>
      apiRequest('POST', '/api/coach/group-sessions', sessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/group-sessions'] });
      setNewSessionDialogOpen(false);
      toast({
        title: "Group Session Created",
        description: "New group session has been scheduled successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create group session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateParticipantMutation = useMutation({
    mutationFn: ({ sessionId, participantId, updates }: { 
      sessionId: string; 
      participantId: string; 
      updates: Partial<GroupParticipant> 
    }) =>
      apiRequest('PATCH', `/api/coach/group-sessions/${sessionId}/participants/${participantId}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/group-sessions'] });
      toast({
        title: "Participant Updated",
        description: "Participant information has been updated successfully.",
      });
    },
  });

  const recordOutcomeMutation = useMutation({
    mutationFn: (outcomeData: Partial<SessionOutcome>) =>
      apiRequest('POST', '/api/coach/session-outcomes', outcomeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/group-sessions'] });
      toast({
        title: "Outcome Recorded",
        description: "Session outcome has been recorded successfully.",
      });
    },
  });

  const SessionCreationForm = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      sessionType: 'support_group',
      maxParticipants: 8,
      scheduledDate: '',
      duration: 60,
      recurringPattern: '',
      tags: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createSessionMutation.mutate({
        ...formData,
        facilitatorId: coachId,
        scheduledDate: new Date(formData.scheduledDate),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        status: 'scheduled',
        currentParticipants: 0,
        participants: [],
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Session Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Weekly Support Group"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the session purpose and activities..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sessionType">Session Type</Label>
            <Select
              value={formData.sessionType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, sessionType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="support_group">Support Group</SelectItem>
                <SelectItem value="skill_building">Skill Building</SelectItem>
                <SelectItem value="peer_mentorship">Peer Mentorship</SelectItem>
                <SelectItem value="crisis_intervention">Crisis Intervention</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="maxParticipants">Max Participants</Label>
            <Input
              id="maxParticipants"
              type="number"
              min="2"
              max="20"
              value={formData.maxParticipants}
              onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="scheduledDate">Date & Time</Label>
            <Input
              id="scheduledDate"
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="30"
              max="180"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="recurringPattern">Recurring Pattern (Optional)</Label>
          <Select
            value={formData.recurringPattern}
            onValueChange={(value) => setFormData(prev => ({ ...prev, recurringPattern: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select pattern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">One-time session</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="e.g., trauma-informed, grief, empowerment"
          />
        </div>

        <Button type="submit" disabled={createSessionMutation.isPending} className="w-full">
          {createSessionMutation.isPending ? 'Creating...' : 'Create Session'}
        </Button>
      </form>
    );
  };

  const ParticipantManagement = ({ session }: { session: GroupSession }) => {
    const [selectedParticipant, setSelectedParticipant] = useState<GroupParticipant | null>(null);
    const [outcomeForm, setOutcomeForm] = useState({
      goalProgress: 50,
      engagementLevel: 50,
      keyInsights: '',
      actionItems: '',
      nextSessionGoals: '',
      riskAssessment: 'stable',
    });

    const addParticipant = async (clientId: string) => {
      try {
        await apiRequest('POST', `/api/coach/group-sessions/${session.id}/participants`, { clientId });
        queryClient.invalidateQueries({ queryKey: ['/api/coach/group-sessions'] });
        toast({
          title: "Participant Added",
          description: "Client has been added to the group session.",
        });
      } catch (error) {
        toast({
          title: "Failed to Add",
          description: "Could not add participant to session.",
          variant: "destructive",
        });
      }
    };

    const recordOutcome = () => {
      if (!selectedParticipant) return;

      recordOutcomeMutation.mutate({
        sessionId: session.id,
        participantId: selectedParticipant.id,
        goalProgress: outcomeForm.goalProgress,
        engagementLevel: outcomeForm.engagementLevel,
        keyInsights: outcomeForm.keyInsights,
        actionItems: outcomeForm.actionItems.split(',').map(item => item.trim()).filter(Boolean),
        nextSessionGoals: outcomeForm.nextSessionGoals.split(',').map(goal => goal.trim()).filter(Boolean),
        riskAssessment: outcomeForm.riskAssessment as any,
      });
      setSelectedParticipant(null);
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Participants ({session.currentParticipants}/{session.maxParticipants})</h3>
          {isCoach && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Participant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Participant</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {availableClients.map((client: any) => (
                    <div key={client.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-600">{client.email}</div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addParticipant(client.id)}
                        disabled={session.currentParticipants >= session.maxParticipants}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid gap-4">
          {session.participants.map((participant) => (
            <Card key={participant.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{participant.name}</h4>
                      <Badge variant={
                        participant.riskLevel === 'crisis' ? 'destructive' :
                        participant.riskLevel === 'high' ? 'destructive' :
                        participant.riskLevel === 'medium' ? 'secondary' : 'default'
                      }>
                        {participant.riskLevel}
                      </Badge>
                      <Badge variant="outline">{participant.status}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Attendance: {participant.attendanceRate}% | 
                      Last attended: {participant.lastAttended ? new Date(participant.lastAttended).toLocaleDateString() : 'Never'}
                    </div>
                    <div className="text-sm">
                      <strong>Goals:</strong> {participant.goals.join(', ')}
                    </div>
                    {participant.progressNotes && (
                      <div className="text-sm">
                        <strong>Notes:</strong> {participant.progressNotes}
                      </div>
                    )}
                  </div>
                  {isCoach && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedParticipant(participant)}
                      >
                        Record Outcome
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Open edit participant dialog
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Outcome Recording Dialog */}
        <Dialog open={!!selectedParticipant} onOpenChange={() => setSelectedParticipant(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Session Outcome - {selectedParticipant?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="goalProgress">Goal Progress (%)</Label>
                  <Input
                    id="goalProgress"
                    type="range"
                    min="0"
                    max="100"
                    value={outcomeForm.goalProgress}
                    onChange={(e) => setOutcomeForm(prev => ({ ...prev, goalProgress: parseInt(e.target.value) }))}
                  />
                  <div className="text-center text-sm">{outcomeForm.goalProgress}%</div>
                </div>
                <div>
                  <Label htmlFor="engagementLevel">Engagement Level (%)</Label>
                  <Input
                    id="engagementLevel"
                    type="range"
                    min="0"
                    max="100"
                    value={outcomeForm.engagementLevel}
                    onChange={(e) => setOutcomeForm(prev => ({ ...prev, engagementLevel: parseInt(e.target.value) }))}
                  />
                  <div className="text-center text-sm">{outcomeForm.engagementLevel}%</div>
                </div>
              </div>

              <div>
                <Label htmlFor="keyInsights">Key Insights</Label>
                <Textarea
                  id="keyInsights"
                  value={outcomeForm.keyInsights}
                  onChange={(e) => setOutcomeForm(prev => ({ ...prev, keyInsights: e.target.value }))}
                  placeholder="Observations about participant's progress, breakthroughs, or challenges..."
                />
              </div>

              <div>
                <Label htmlFor="actionItems">Action Items (comma-separated)</Label>
                <Input
                  id="actionItems"
                  value={outcomeForm.actionItems}
                  onChange={(e) => setOutcomeForm(prev => ({ ...prev, actionItems: e.target.value }))}
                  placeholder="Follow-up tasks, homework, referrals..."
                />
              </div>

              <div>
                <Label htmlFor="nextSessionGoals">Next Session Goals (comma-separated)</Label>
                <Input
                  id="nextSessionGoals"
                  value={outcomeForm.nextSessionGoals}
                  onChange={(e) => setOutcomeForm(prev => ({ ...prev, nextSessionGoals: e.target.value }))}
                  placeholder="Objectives for upcoming sessions..."
                />
              </div>

              <div>
                <Label htmlFor="riskAssessment">Risk Assessment</Label>
                <Select
                  value={outcomeForm.riskAssessment}
                  onValueChange={(value) => setOutcomeForm(prev => ({ ...prev, riskAssessment: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="improved">Improved</SelectItem>
                    <SelectItem value="stable">Stable</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="crisis">Crisis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedParticipant(null)}>
                  Cancel
                </Button>
                <Button onClick={recordOutcome} disabled={recordOutcomeMutation.isPending}>
                  {recordOutcomeMutation.isPending ? 'Recording...' : 'Record Outcome'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const SessionAnalytics = () => {
    const completedSessions = groupSessions.filter((s: GroupSession) => s.status === 'completed');
    const totalParticipants = groupSessions.reduce((sum: number, s: GroupSession) => sum + s.currentParticipants, 0);
    const averageAttendance = completedSessions.length > 0 
      ? completedSessions.reduce((sum: number, s: GroupSession) => {
          const avgRate = s.participants.reduce((pSum, p) => pSum + p.attendanceRate, 0) / s.participants.length;
          return sum + avgRate;
        }, 0) / completedSessions.length
      : 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{groupSessions.length}</div>
                  <div className="text-sm text-gray-600">Total Sessions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{totalParticipants}</div>
                  <div className="text-sm text-gray-600">Total Participants</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{averageAttendance.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Avg Attendance</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-2xl font-bold">{completedSessions.length}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Session Outcomes Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedSessions.map((session: GroupSession) => (
                <div key={session.id} className="border rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{session.title}</h4>
                    <Badge>{new Date(session.scheduledDate).toLocaleDateString()}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Participants:</span> {session.currentParticipants}
                    </div>
                    <div>
                      <span className="font-medium">Avg Engagement:</span> 
                      {session.outcomes ? 
                        (session.outcomes.reduce((sum, o) => sum + o.engagementLevel, 0) / session.outcomes.length).toFixed(1) + '%'
                        : 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Avg Progress:</span>
                      {session.outcomes ? 
                        (session.outcomes.reduce((sum, o) => sum + o.goalProgress, 0) / session.outcomes.length).toFixed(1) + '%'
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Group Session Management</h2>
        {isCoach && (
          <Dialog open={newSessionDialogOpen} onOpenChange={setNewSessionDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Group Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Group Session</DialogTitle>
              </DialogHeader>
              <SessionCreationForm />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <div className="space-y-4">
            {groupSessions.map((session: GroupSession) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{session.title}</span>
                        <Badge variant={
                          session.status === 'active' ? 'default' :
                          session.status === 'completed' ? 'secondary' :
                          session.status === 'cancelled' ? 'destructive' : 'outline'
                        }>
                          {session.status}
                        </Badge>
                      </CardTitle>
                      <div className="text-sm text-gray-600 mt-1">
                        {session.description}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(session.scheduledDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>{session.duration} min</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {session.tags.map((tag) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                    
                    <ParticipantManagement session={session} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <SessionAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}