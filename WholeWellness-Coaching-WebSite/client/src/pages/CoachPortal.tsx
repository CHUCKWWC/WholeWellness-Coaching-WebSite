import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  Calendar, 
  MessageSquare, 
  DollarSign, 
  Star,
  Clock,
  Users,
  BookOpen,
  Award,
  FileText,
  Phone,
  Video,
  Mail,
  TrendingUp,
  Target,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Eye,
  Send,
  Download,
  Upload,
  Settings,
  Bell,
  Activity
} from "lucide-react";

interface CoachProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  specialties: string[];
  experience: number;
  status: string;
  isVerified: boolean;
  hourlyRate: number;
  timezone: string;
  languages: string[];
  totalClients: number;
  averageRating: number;
  totalSessions: number;
  createdAt: string;
}

interface CoachClient {
  id: number;
  clientId: string;
  assignmentDate: string;
  status: string;
  specialtyArea: string;
  notes: string;
  lastContactDate: string;
  nextScheduledSession: string;
  totalSessions: number;
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

interface SessionNote {
  id: number;
  clientId: string;
  sessionDate: string;
  sessionType: string;
  duration: number;
  notes: string;
  goals: string[];
  outcomes: string;
  nextSteps: string;
  clientProgress: number;
  riskAssessment: string;
  followUpNeeded: boolean;
  followUpDate: string;
  client: {
    firstName: string;
    lastName: string;
  };
}

interface MessageTemplate {
  id: number;
  templateName: string;
  messageType: string;
  messageContent: string;
  isActive: boolean;
  usageCount: number;
}

interface CoachAvailability {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  sessionType: string;
  maxClients: number;
}

interface CoachMetric {
  id: number;
  periodStart: string;
  periodEnd: string;
  totalSessions: number;
  totalClients: number;
  averageSessionRating: number;
  clientRetentionRate: number;
  responseTime: number;
  completedGoals: number;
  clientSatisfactionScore: number;
  hoursWorked: number;
  revenue: number;
}

export default function CoachPortal() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState<CoachClient | null>(null);
  const [newSessionNote, setNewSessionNote] = useState({
    clientId: "",
    sessionDate: "",
    sessionType: "individual",
    duration: 60,
    notes: "",
    goals: [],
    outcomes: "",
    nextSteps: "",
    clientProgress: 5,
    riskAssessment: "low",
    followUpNeeded: false,
    followUpDate: "",
  });
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch coach profile
  const { data: profile, isLoading: profileLoading } = useQuery<CoachProfile>({
    queryKey: ["/api/coach/profile"],
    enabled: isAuthenticated,
  });

  // Fetch coach clients
  const { data: clients, isLoading: clientsLoading } = useQuery<CoachClient[]>({
    queryKey: ["/api/coach/clients"],
    enabled: isAuthenticated,
  });

  // Fetch session notes
  const { data: sessionNotes, isLoading: notesLoading } = useQuery<SessionNote[]>({
    queryKey: ["/api/coach/session-notes"],
    enabled: isAuthenticated,
  });

  // Fetch message templates
  const { data: templates, isLoading: templatesLoading } = useQuery<MessageTemplate[]>({
    queryKey: ["/api/coach/message-templates"],
    enabled: isAuthenticated,
  });

  // Fetch availability
  const { data: availability, isLoading: availabilityLoading } = useQuery<CoachAvailability[]>({
    queryKey: ["/api/coach/availability"],
    enabled: isAuthenticated,
  });

  // Fetch metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<CoachMetric>({
    queryKey: ["/api/coach/metrics"],
    enabled: isAuthenticated,
  });

  // Create session note mutation
  const createSessionNoteMutation = useMutation({
    mutationFn: async (noteData: any) => {
      const response = await apiRequest("POST", "/api/coach/session-notes", noteData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/session-notes"] });
      toast({
        title: "Session note created",
        description: "Your session note has been saved successfully.",
      });
      setNewSessionNote({
        clientId: "",
        sessionDate: "",
        sessionType: "individual",
        duration: 60,
        notes: "",
        goals: [],
        outcomes: "",
        nextSteps: "",
        clientProgress: 5,
        riskAssessment: "low",
        followUpNeeded: false,
        followUpDate: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating session note",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (availabilityData: any) => {
      const response = await apiRequest("PUT", "/api/coach/availability", availabilityData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/availability"] });
      toast({
        title: "Availability updated",
        description: "Your availability has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating availability",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      case "crisis": return "bg-red-200 text-red-900";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 8) return "text-green-600";
    if (progress >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-500">
              Please log in with your coach credentials to access the portal.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Coach Portal</h1>
          <p className="text-gray-600">
            Welcome back, {profile?.firstName}! Manage your clients and track your impact.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.totalClients || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sessions This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.totalSessions || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics?.averageSessionRating?.toFixed(1) || "N/A"}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${metrics?.revenue || 0}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest coaching activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sessionNotes?.slice(0, 5).map((note) => (
                      <div key={note.id} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Session with {note.client.firstName} {note.client.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(note.sessionDate).toLocaleDateString()} • {note.duration} minutes
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {note.sessionType}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${getRiskColor(note.riskAssessment)}`}>
                              {note.riskAssessment} risk
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <CardDescription>Your scheduled coaching sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clients?.filter(client => client.nextScheduledSession).map((client) => (
                      <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{client.client.firstName} {client.client.lastName}</div>
                          <div className="text-sm text-gray-500">{client.specialtyArea}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(client.nextScheduledSession).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Video className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clients">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Client Management</CardTitle>
                  <CardDescription>Manage your assigned clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clients?.map((client) => (
                      <Card key={client.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-medium">{client.client.firstName} {client.client.lastName}</h3>
                              <p className="text-sm text-gray-500">{client.specialtyArea}</p>
                            </div>
                            <Badge variant={client.status === "active" ? "default" : "secondary"}>
                              {client.status}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total Sessions:</span>
                              <span className="font-medium">{client.totalSessions}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Last Contact:</span>
                              <span className="text-gray-500">
                                {client.lastContactDate ? new Date(client.lastContactDate).toLocaleDateString() : "Never"}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <Button variant="outline" size="sm" className="flex-1">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <FileText className="h-4 w-4 mr-1" />
                              Notes
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Session Notes</CardTitle>
                  <CardDescription>Document your coaching sessions</CardDescription>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Session Note
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create Session Note</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="client">Client</Label>
                            <Select value={newSessionNote.clientId} onValueChange={(value) => setNewSessionNote({...newSessionNote, clientId: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select client" />
                              </SelectTrigger>
                              <SelectContent>
                                {clients?.map((client) => (
                                  <SelectItem key={client.id} value={client.clientId}>
                                    {client.client.firstName} {client.client.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="sessionDate">Session Date</Label>
                            <Input
                              id="sessionDate"
                              type="datetime-local"
                              value={newSessionNote.sessionDate}
                              onChange={(e) => setNewSessionNote({...newSessionNote, sessionDate: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="sessionType">Session Type</Label>
                            <Select value={newSessionNote.sessionType} onValueChange={(value) => setNewSessionNote({...newSessionNote, sessionType: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="individual">Individual</SelectItem>
                                <SelectItem value="group">Group</SelectItem>
                                <SelectItem value="crisis">Crisis</SelectItem>
                                <SelectItem value="follow-up">Follow-up</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                              id="duration"
                              type="number"
                              value={newSessionNote.duration}
                              onChange={(e) => setNewSessionNote({...newSessionNote, duration: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="notes">Session Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Document what was discussed..."
                            value={newSessionNote.notes}
                            onChange={(e) => setNewSessionNote({...newSessionNote, notes: e.target.value})}
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="outcomes">Outcomes</Label>
                          <Textarea
                            id="outcomes"
                            placeholder="What was achieved in this session..."
                            value={newSessionNote.outcomes}
                            onChange={(e) => setNewSessionNote({...newSessionNote, outcomes: e.target.value})}
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="nextSteps">Next Steps</Label>
                          <Textarea
                            id="nextSteps"
                            placeholder="Actions for the client to take..."
                            value={newSessionNote.nextSteps}
                            onChange={(e) => setNewSessionNote({...newSessionNote, nextSteps: e.target.value})}
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="clientProgress">Client Progress (1-10)</Label>
                            <Input
                              id="clientProgress"
                              type="number"
                              min="1"
                              max="10"
                              value={newSessionNote.clientProgress}
                              onChange={(e) => setNewSessionNote({...newSessionNote, clientProgress: parseInt(e.target.value)})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="riskAssessment">Risk Assessment</Label>
                            <Select value={newSessionNote.riskAssessment} onValueChange={(value) => setNewSessionNote({...newSessionNote, riskAssessment: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="crisis">Crisis</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button 
                          onClick={() => createSessionNoteMutation.mutate(newSessionNote)}
                          disabled={createSessionNoteMutation.isPending}
                          className="w-full"
                        >
                          {createSessionNoteMutation.isPending ? "Saving..." : "Save Session Note"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sessionNotes?.map((note) => (
                      <Card key={note.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium">{note.client.firstName} {note.client.lastName}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(note.sessionDate).toLocaleDateString()} • {note.duration} minutes
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge variant="outline">{note.sessionType}</Badge>
                            <Badge variant="outline" className={getRiskColor(note.riskAssessment)}>
                              {note.riskAssessment}
                            </Badge>
                            <div className={`font-medium ${getProgressColor(note.clientProgress)}`}>
                              {note.clientProgress}/10
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Notes:</span> {note.notes}
                          </div>
                          {note.outcomes && (
                            <div>
                              <span className="font-medium">Outcomes:</span> {note.outcomes}
                            </div>
                          )}
                          {note.nextSteps && (
                            <div>
                              <span className="font-medium">Next Steps:</span> {note.nextSteps}
                            </div>
                          )}
                        </div>
                        {note.followUpNeeded && (
                          <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                            <div className="flex items-center text-yellow-800 text-sm">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Follow-up needed by {new Date(note.followUpDate).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Availability</CardTitle>
                <CardDescription>Set your coaching availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dayNames.map((day, index) => {
                    const dayAvailability = availability?.find(a => a.dayOfWeek === index);
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-24 font-medium">{day}</div>
                          {dayAvailability ? (
                            <div className="flex items-center space-x-2">
                              <Badge variant="default">Available</Badge>
                              <span className="text-sm text-gray-600">
                                {dayAvailability.startTime} - {dayAvailability.endTime}
                              </span>
                            </div>
                          ) : (
                            <Badge variant="secondary">Unavailable</Badge>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Message Templates</CardTitle>
                <CardDescription>Pre-written messages for common situations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates?.map((template) => (
                    <Card key={template.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{template.templateName}</h3>
                          <p className="text-sm text-gray-500">{template.messageType}</p>
                        </div>
                        <Badge variant="outline">Used {template.usageCount} times</Badge>
                      </div>
                      <div className="text-sm text-gray-700 mb-3 line-clamp-3">
                        {template.messageContent}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Use
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Coach Profile</CardTitle>
                <CardDescription>Manage your professional profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" value={profile?.firstName || ""} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" value={profile?.lastName || ""} readOnly />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={profile?.email || ""} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={profile?.phone || ""} readOnly />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" value={profile?.bio || ""} readOnly rows={4} />
                  </div>
                  <div>
                    <Label>Specialties</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile?.specialties?.map((specialty, index) => (
                        <Badge key={index} variant="outline">{specialty}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="experience">Experience (years)</Label>
                      <Input id="experience" value={profile?.experience || ""} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="hourlyRate">Hourly Rate</Label>
                      <Input id="hourlyRate" value={`$${profile?.hourlyRate || 0}`} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input id="timezone" value={profile?.timezone || ""} readOnly />
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