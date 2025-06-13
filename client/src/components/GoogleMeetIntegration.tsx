import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Video, 
  Calendar,
  Users,
  Clock,
  Link,
  Copy,
  ExternalLink,
  Plus,
  Settings,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface GoogleMeetSession {
  id: string;
  meetingId: string;
  meetingUrl: string;
  clientId: string;
  clientName: string;
  scheduledTime: string;
  duration: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  sessionType: 'individual' | 'group' | 'consultation';
  attendees?: string[];
  description?: string;
  createdAt: string;
}

interface GoogleMeetIntegrationProps {
  coachId: number;
  isCoach?: boolean;
}

export default function GoogleMeetIntegration({ coachId, isCoach = false }: GoogleMeetIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [newSessionDialog, setNewSessionDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [sessionDetails, setSessionDetails] = useState({
    clientId: "",
    scheduledTime: "",
    duration: 60,
    sessionType: "individual" as const,
    description: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check Google Meet connection status
  const { data: connectionStatus } = useQuery({
    queryKey: ['/api/coaches/google-meet-status', coachId],
    retry: false,
  });

  // Fetch upcoming Google Meet sessions
  const { data: meetSessions = [], isLoading } = useQuery({
    queryKey: ['/api/coaches/google-meet-sessions', coachId],
    retry: false,
  });

  // Fetch coach clients for session scheduling
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/coaches/clients', coachId],
    retry: false,
  });

  useEffect(() => {
    setIsConnected(connectionStatus?.connected || false);
  }, [connectionStatus]);

  // Connect to Google Meet API
  const connectMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/coaches/${coachId}/connect-google-meet`);
    },
    onSuccess: () => {
      setIsConnected(true);
      toast({
        title: "Google Meet Connected",
        description: "Successfully connected to Google Meet services",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/coaches/google-meet-status'] });
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Meet. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create new Google Meet session
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: typeof sessionDetails) => {
      return await apiRequest("POST", `/api/coaches/${coachId}/google-meet-sessions`, sessionData);
    },
    onSuccess: (data) => {
      toast({
        title: "Meeting Scheduled",
        description: `Google Meet session created successfully`,
      });
      setNewSessionDialog(false);
      setSessionDetails({
        clientId: "",
        scheduledTime: "",
        duration: 60,
        sessionType: "individual",
        description: ""
      });
      queryClient.invalidateQueries({ queryKey: ['/api/coaches/google-meet-sessions'] });
    },
    onError: () => {
      toast({
        title: "Scheduling Failed",
        description: "Failed to create Google Meet session",
        variant: "destructive",
      });
    },
  });

  // Join Google Meet session
  const joinSession = (meetingUrl: string, sessionId: string) => {
    // Update session status to active
    apiRequest("PATCH", `/api/coaches/google-meet-sessions/${sessionId}`, {
      status: 'active'
    });
    
    // Open Google Meet in new tab
    window.open(meetingUrl, '_blank');
    
    toast({
      title: "Joining Meeting",
      description: "Opening Google Meet in new tab",
    });
  };

  // Copy meeting link to clipboard
  const copyMeetingLink = async (meetingUrl: string) => {
    try {
      await navigator.clipboard.writeText(meetingUrl);
      toast({
        title: "Link Copied",
        description: "Meeting link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy meeting link",
        variant: "destructive",
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Google Meet Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <Video className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Connect Google Meet</h3>
              <p className="text-gray-600 mb-6">
                Connect your Google account to schedule and host professional video sessions with clients.
              </p>
              <Button 
                onClick={() => connectMutation.mutate()}
                disabled={connectMutation.isPending}
                size="lg"
              >
                {connectMutation.isPending ? "Connecting..." : "Connect Google Meet"}
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Benefits of Google Meet Integration:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Professional video conferencing platform</li>
                <li>• Automatic calendar integration</li>
                <li>• Recording capabilities for session review</li>
                <li>• Screen sharing and collaboration tools</li>
                <li>• Enterprise-grade security and reliability</li>
                <li>• Mobile and desktop app support</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Google Meet Integration
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Google Meet is connected and ready for video sessions
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              {isCoach && (
                <Dialog open={newSessionDialog} onOpenChange={setNewSessionDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Schedule Google Meet Session</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Client</Label>
                        <select 
                          className="w-full p-2 border rounded-lg"
                          value={sessionDetails.clientId}
                          onChange={(e) => setSessionDetails({...sessionDetails, clientId: e.target.value})}
                        >
                          <option value="">Select a client</option>
                          {clients.map((client: any) => (
                            <option key={client.id} value={client.id}>
                              {client.firstName} {client.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Scheduled Time</Label>
                        <Input
                          type="datetime-local"
                          value={sessionDetails.scheduledTime}
                          onChange={(e) => setSessionDetails({...sessionDetails, scheduledTime: e.target.value})}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Duration (minutes)</Label>
                          <Input
                            type="number"
                            value={sessionDetails.duration}
                            onChange={(e) => setSessionDetails({...sessionDetails, duration: parseInt(e.target.value)})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Session Type</Label>
                          <select 
                            className="w-full p-2 border rounded-lg"
                            value={sessionDetails.sessionType}
                            onChange={(e) => setSessionDetails({...sessionDetails, sessionType: e.target.value as any})}
                          >
                            <option value="individual">Individual</option>
                            <option value="group">Group</option>
                            <option value="consultation">Consultation</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Input
                          placeholder="Session description or agenda"
                          value={sessionDetails.description}
                          onChange={(e) => setSessionDetails({...sessionDetails, description: e.target.value})}
                        />
                      </div>
                      
                      <Button 
                        onClick={() => createSessionMutation.mutate(sessionDetails)}
                        disabled={createSessionMutation.isPending || !sessionDetails.clientId || !sessionDetails.scheduledTime}
                        className="w-full"
                      >
                        {createSessionMutation.isPending ? "Creating..." : "Schedule Meeting"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Google Meet Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : meetSessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">No upcoming Google Meet sessions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meetSessions.map((session: GoogleMeetSession) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{session.clientName}</h4>
                        <Badge variant={
                          session.status === 'scheduled' ? 'secondary' :
                          session.status === 'active' ? 'default' :
                          session.status === 'completed' ? 'outline' : 'destructive'
                        }>
                          {session.status}
                        </Badge>
                        <Badge variant="outline">
                          {session.sessionType}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(session.scheduledTime).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {session.duration} minutes
                        </div>
                      </div>
                      
                      {session.description && (
                        <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => joinSession(session.meetingUrl, session.id)}
                          disabled={session.status === 'completed' || session.status === 'cancelled'}
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Join Meeting
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyMeetingLink(session.meetingUrl)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Link
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(session.meetingUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Video className="h-6 w-6 mb-2" />
              <span className="text-sm">Start Instant Meeting</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              <span className="text-sm">View Calendar</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              <span className="text-sm">Meeting Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}