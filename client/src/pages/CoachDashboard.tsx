import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  FileText, 
  DollarSign, 
  TrendingUp,
  Clock,
  Award,
  Settings,
  Upload,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Video,
  Plus,
  Edit,
  Send,
  BarChart3,
  Brain,
  Smartphone,
  GraduationCap,
  UsersIcon as GroupIcon
} from "lucide-react";
import VideoSession from '@/components/VideoSession';
import GroupSessionManager from '@/components/GroupSessionManager';
import AIInsightsDashboard from '@/components/AIInsightsDashboard';
import ProfessionalDevelopment from '@/components/ProfessionalDevelopment';
import MobileCoachApp from '@/components/MobileCoachApp';
import GoogleMeetIntegration from '@/components/GoogleMeetIntegration';
import { motion } from "framer-motion";

interface CoachProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  bio?: string;
  specialties: string[];
  experience: number;
  status: string;
  isVerified: boolean;
  hourlyRate: string;
  timezone: string;
  languages: string[];
}

interface CoachClient {
  id: number;
  clientId: string;
  clientName: string;
  assignmentDate: string;
  status: string;
  specialtyArea: string;
  totalSessions: number;
  lastContactDate?: string;
  nextScheduledSession?: string;
}

interface SessionNote {
  id: number;
  clientId: string;
  clientName: string;
  sessionDate: string;
  sessionType: string;
  duration: number;
  notes: string;
  goals: string[];
  outcomes: string;
  clientProgress: number;
  riskAssessment: string;
}

interface MessageTemplate {
  id: number;
  templateName: string;
  messageType: string;
  messageContent: string;
  usageCount: number;
}

export default function CoachDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sample data - replace with actual API calls
  const coachProfile: CoachProfile = {
    id: 1,
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@wholewellness.org",
    bio: "Licensed clinical social worker specializing in trauma recovery and domestic violence support. 8+ years helping women rebuild their lives.",
    specialties: ["Trauma Recovery", "Domestic Violence", "Financial Planning", "Crisis Intervention"],
    experience: 8,
    status: "active",
    isVerified: true,
    hourlyRate: "125.00",
    timezone: "America/New_York",
    languages: ["English", "Spanish"],
  };

  const clients: CoachClient[] = [
    {
      id: 1,
      clientId: "client_001",
      clientName: "Maria S.",
      assignmentDate: "2024-01-15",
      status: "active",
      specialtyArea: "Domestic Violence Recovery",
      totalSessions: 12,
      lastContactDate: "2024-01-10",
      nextScheduledSession: "2024-01-15T14:00:00",
    },
    {
      id: 2,
      clientId: "client_002",
      clientName: "Jennifer L.",
      assignmentDate: "2024-01-20",
      status: "active",
      specialtyArea: "Financial Planning",
      totalSessions: 8,
      lastContactDate: "2024-01-12",
      nextScheduledSession: "2024-01-16T10:00:00",
    },
  ];

  const recentSessions: SessionNote[] = [
    {
      id: 1,
      clientId: "client_001",
      clientName: "Maria S.",
      sessionDate: "2024-01-10",
      sessionType: "individual",
      duration: 60,
      notes: "Client showed significant progress in establishing safety boundaries. Discussed emergency contact plan and local resources.",
      goals: ["Complete safety plan", "Establish support network"],
      outcomes: "Client feeling more confident about next steps",
      clientProgress: 7,
      riskAssessment: "medium",
    },
  ];

  const messageTemplates: MessageTemplate[] = [
    {
      id: 1,
      templateName: "Session Reminder",
      messageType: "reminder",
      messageContent: "Hi {clientName}, this is a reminder about your coaching session tomorrow at {time}. Reply CONFIRM to confirm or RESCHEDULE if you need to change the time.",
      usageCount: 45,
    },
    {
      id: 2,
      templateName: "Check-in Message",
      messageType: "check-in",
      messageContent: "Hi {clientName}, just checking in to see how you're doing with the goals we discussed. Remember, progress isn't always linear - every small step counts!",
      usageCount: 32,
    },
  ];

  const dashboardStats = {
    totalClients: 15,
    activeClients: 12,
    sessionsThisWeek: 8,
    sessionsThisMonth: 34,
    averageRating: 4.8,
    responseTime: 18, // minutes
    completionRate: 87,
    revenueThisMonth: 4250,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
              <p className="text-gray-600">Welcome back, {coachProfile.firstName}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={coachProfile.isVerified ? "default" : "secondary"} className="px-3 py-1">
                {coachProfile.isVerified ? "Verified Coach" : "Pending Verification"}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                {coachProfile.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Clients</p>
                    <p className="text-3xl font-bold text-blue-600">{dashboardStats.activeClients}</p>
                    <p className="text-xs text-gray-500">of {dashboardStats.totalClients} total</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-3xl font-bold text-green-600">{dashboardStats.sessionsThisWeek}</p>
                    <p className="text-xs text-gray-500">sessions completed</p>
                  </div>
                  <CalendarIcon className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response</p>
                    <p className="text-3xl font-bold text-purple-600">{dashboardStats.responseTime}m</p>
                    <p className="text-xs text-gray-500">response time</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-3xl font-bold text-orange-600">${dashboardStats.revenueThisMonth.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">revenue earned</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Dashboard */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-11">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="google-meet">Google Meet</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="development">Development</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentSessions.map((session) => (
                      <div key={session.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            Session with {session.clientName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(session.sessionDate).toLocaleDateString()} • {session.duration} minutes
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Progress: {session.clientProgress}/10 • Risk: {session.riskAssessment}
                          </p>
                        </div>
                        <Badge variant={session.riskAssessment === 'high' ? 'destructive' : 
                                     session.riskAssessment === 'medium' ? 'secondary' : 'default'}>
                          {session.riskAssessment}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    New Session Note
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Schedule Session
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Client Satisfaction</span>
                      <span className="text-sm text-gray-600">{dashboardStats.averageRating}/5.0</span>
                    </div>
                    <Progress value={dashboardStats.averageRating * 20} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Goal Completion Rate</span>
                      <span className="text-sm text-gray-600">{dashboardStats.completionRate}%</span>
                    </div>
                    <Progress value={dashboardStats.completionRate} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Monthly Sessions</span>
                      <span className="text-sm text-gray-600">{dashboardStats.sessionsThisMonth}/40</span>
                    </div>
                    <Progress value={(dashboardStats.sessionsThisMonth / 40) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Client Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Client
              </Button>
            </div>

            <div className="grid gap-6">
              {clients.map((client) => (
                <Card key={client.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{client.clientName}</h3>
                        <p className="text-sm text-gray-600">{client.specialtyArea}</p>
                        <div className="flex space-x-4 text-sm text-gray-500">
                          <span>Started: {new Date(client.assignmentDate).toLocaleDateString()}</span>
                          <span>Sessions: {client.totalSessions}</span>
                          <span>Status: {client.status}</span>
                        </div>
                        {client.nextScheduledSession && (
                          <p className="text-sm font-medium text-blue-600">
                            Next session: {new Date(client.nextScheduledSession).toLocaleDateString()} at{" "}
                            {new Date(client.nextScheduledSession).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          Notes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Weekly Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Availability Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Working Hours</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="09:00" />
                      <Input placeholder="17:00" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select defaultValue={coachProfile.timezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Session Types</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="individual" defaultChecked />
                        <label htmlFor="individual" className="text-sm">Individual Sessions</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="group" />
                        <label htmlFor="group" className="text-sm">Group Sessions</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="crisis" defaultChecked />
                        <label htmlFor="crisis" className="text-sm">Crisis Support</label>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full">Update Availability</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Session Notes</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Session Note
              </Button>
            </div>

            <div className="space-y-4">
              {recentSessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{session.clientName}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(session.sessionDate).toLocaleDateString()} • {session.sessionType} • {session.duration} minutes
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={session.riskAssessment === 'high' ? 'destructive' : 
                                     session.riskAssessment === 'medium' ? 'secondary' : 'default'}>
                          Risk: {session.riskAssessment}
                        </Badge>
                        <Badge variant="outline">
                          Progress: {session.clientProgress}/10
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Session Notes</h4>
                        <p className="text-sm text-gray-600">{session.notes}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Goals</h4>
                        <div className="flex flex-wrap gap-1">
                          {session.goals.map((goal, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {goal}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Outcomes</h4>
                        <p className="text-sm text-gray-600">{session.outcomes}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Message Templates</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </div>

            <div className="grid gap-4">
              {messageTemplates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{template.templateName}</h3>
                        <Badge variant="outline" className="mt-1">
                          {template.messageType}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Used {template.usageCount} times</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-700">{template.messageContent}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Send className="h-4 w-4 mr-1" />
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Communication Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">SMS to Maria S.</p>
                        <p className="text-xs text-gray-500">Today at 2:30 PM</p>
                      </div>
                    </div>
                    <Badge variant="outline">Delivered</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Email to Jennifer L.</p>
                        <p className="text-xs text-gray-500">Yesterday at 4:15 PM</p>
                      </div>
                    </div>
                    <Badge variant="outline">Read</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input defaultValue={coachProfile.firstName} />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input defaultValue={coachProfile.lastName} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input defaultValue={coachProfile.email} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea defaultValue={coachProfile.bio} rows={4} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Specialties</Label>
                    <div className="flex flex-wrap gap-2">
                      {coachProfile.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Hourly Rate ($)</Label>
                      <Input defaultValue={coachProfile.hourlyRate} />
                    </div>
                    <div className="space-y-2">
                      <Label>Experience (years)</Label>
                      <Input defaultValue={coachProfile.experience} type="number" />
                    </div>
                  </div>
                  
                  <Button className="w-full">Update Profile</Button>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Photo</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Credentials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">LCSW License</p>
                        <p className="text-xs text-gray-500">Expires: 03/2025</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Credential
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Banking Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm">QuickBooks Connected</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Update Banking
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-6">
            <VideoSession 
              sessionId="demo-session"
              coachId={coachProfile.id}
              clientId="demo-client"
              sessionType="individual"
              isCoach={true}
            />
          </TabsContent>

          <TabsContent value="google-meet" className="space-y-6">
            <GoogleMeetIntegration 
              coachId={coachProfile.id}
              isCoach={true}
            />
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <GroupSessionManager 
              coachId={coachProfile.id}
              isCoach={true}
            />
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6">
            <AIInsightsDashboard 
              coachId={coachProfile.id}
            />
          </TabsContent>

          <TabsContent value="development" className="space-y-6">
            <ProfessionalDevelopment 
              coachId={coachProfile.id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}