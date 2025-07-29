import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Smartphone, 
  MessageSquare, 
  Calendar, 
  Users, 
  AlertTriangle, 
  Phone, 
  Video, 
  Clock,
  MapPin,
  Camera,
  Mic,
  Bell,
  Wifi,
  WifiOff,
  Download,
  Upload,
  CheckCircle,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface MobileSession {
  id: string;
  clientName: string;
  clientId: string;
  type: 'individual' | 'group' | 'crisis' | 'check_in';
  status: 'scheduled' | 'active' | 'completed' | 'missed';
  scheduledTime: Date;
  duration: number;
  location: 'office' | 'home_visit' | 'virtual' | 'community';
  notes?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'crisis';
  requiresFollowUp: boolean;
  gpsCoordinates?: { lat: number; lng: number };
}

interface QuickNote {
  id: string;
  clientId: string;
  content: string;
  type: 'observation' | 'concern' | 'progress' | 'goal_update';
  timestamp: Date;
  syncStatus: 'synced' | 'pending' | 'offline';
  audioRecording?: string;
  photo?: string;
}

interface OfflineData {
  sessions: MobileSession[];
  notes: QuickNote[];
  clientProfiles: any[];
  lastSync: Date;
}

interface MobileCoachAppProps {
  coachId: number;
}

export default function MobileCoachApp({ coachId }: MobileCoachAppProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [activeSession, setActiveSession] = useState<MobileSession | null>(null);
  const [quickNoteDialog, setQuickNoteDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState('today');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
      toast({
        title: "Connection Restored",
        description: "Syncing offline data...",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "Data will be saved locally and synced when connection returns.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Request location permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data: todaySessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/coach/mobile-sessions', coachId, 'today'],
    enabled: !!coachId && isOnline,
  });

  const { data: clientProfiles = [] } = useQuery({
    queryKey: ['/api/coach/mobile-clients', coachId],
    enabled: !!coachId && isOnline,
  });

  const startSessionMutation = useMutation({
    mutationFn: (sessionData: { sessionId: string; location?: { lat: number; lng: number } }) =>
      apiRequest('POST', `/api/coach/sessions/${sessionData.sessionId}/start`, sessionData),
    onSuccess: (data, variables) => {
      const session = todaySessions.find((s: MobileSession) => s.id === variables.sessionId);
      setActiveSession({ ...session, status: 'active' });
      toast({
        title: "Session Started",
        description: "Session timer is now active.",
      });
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: (sessionData: { sessionId: string; notes: string; outcome: string }) =>
      apiRequest('POST', `/api/coach/sessions/${sessionData.sessionId}/complete`, sessionData),
    onSuccess: () => {
      setActiveSession(null);
      queryClient.invalidateQueries({ queryKey: ['/api/coach/mobile-sessions'] });
      toast({
        title: "Session Completed",
        description: "Session notes saved successfully.",
      });
    },
  });

  const saveQuickNoteMutation = useMutation({
    mutationFn: (noteData: Partial<QuickNote>) =>
      isOnline 
        ? apiRequest('POST', '/api/coach/quick-notes', noteData)
        : saveOfflineNote(noteData),
    onSuccess: () => {
      setQuickNoteDialog(false);
      toast({
        title: "Note Saved",
        description: isOnline ? "Note synced to server." : "Note saved locally.",
      });
    },
  });

  const saveOfflineNote = async (noteData: Partial<QuickNote>) => {
    const note: QuickNote = {
      id: Date.now().toString(),
      clientId: noteData.clientId || '',
      content: noteData.content || '',
      type: noteData.type || 'observation',
      timestamp: new Date(),
      syncStatus: 'offline',
      ...noteData
    };

    const existingData = localStorage.getItem('offlineCoachData');
    const offlineData: OfflineData = existingData 
      ? JSON.parse(existingData)
      : { sessions: [], notes: [], clientProfiles: [], lastSync: new Date() };

    offlineData.notes.push(note);
    localStorage.setItem('offlineCoachData', JSON.stringify(offlineData));
    setOfflineData(offlineData);
  };

  const syncOfflineData = async () => {
    const offlineDataStr = localStorage.getItem('offlineCoachData');
    if (!offlineDataStr) return;

    const offlineData: OfflineData = JSON.parse(offlineDataStr);
    const pendingNotes = offlineData.notes.filter(note => note.syncStatus === 'offline');

    for (const note of pendingNotes) {
      try {
        await apiRequest('POST', '/api/coach/quick-notes', note);
        note.syncStatus = 'synced';
      } catch (error) {
        console.error('Failed to sync note:', error);
      }
    }

    localStorage.setItem('offlineCoachData', JSON.stringify(offlineData));
    queryClient.invalidateQueries({ queryKey: ['/api/coach/mobile-sessions'] });
  };

  const TodaySchedule = () => {
    const todaySessionsList = isOnline ? todaySessions : (offlineData?.sessions || []);
    const upcomingSessions = todaySessionsList.filter((session: MobileSession) => 
      new Date(session.scheduledTime) > new Date() && session.status === 'scheduled'
    );
    const activeSessions = todaySessionsList.filter((session: MobileSession) => 
      session.status === 'active'
    );

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Today's Schedule</h3>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Badge variant="default" className="flex items-center">
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>
        </div>

        {activeSessions.length > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-800 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Active Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeSessions.map((session: MobileSession) => (
                <div key={session.id} className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{session.clientName}</h4>
                      <div className="text-sm text-gray-600">
                        {session.type} session • {session.duration} min
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={session.riskLevel === 'crisis' ? 'destructive' : 'outline'}>
                          {session.riskLevel}
                        </Badge>
                        <Badge variant="outline">{session.location}</Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => setActiveSession(session)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      View Session
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {upcomingSessions.map((session: MobileSession) => (
            <Card key={session.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{session.clientName}</h4>
                      <Badge variant={session.riskLevel === 'crisis' ? 'destructive' : 'outline'}>
                        {session.riskLevel}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(session.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
                      {session.type} • {session.duration} min
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{session.location}</span>
                      {session.location === 'home_visit' && currentLocation && (
                        <Button variant="outline" size="sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          Navigate
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startSessionMutation.mutate({ 
                        sessionId: session.id, 
                        location: currentLocation || undefined 
                      })}
                    >
                      Start
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const QuickActions = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2"
            onClick={() => setQuickNoteDialog(true)}
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-sm">Quick Note</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2"
          >
            <AlertTriangle className="w-6 h-6" />
            <span className="text-sm">Crisis Alert</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2"
          >
            <Camera className="w-6 h-6" />
            <span className="text-sm">Photo Note</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2"
          >
            <Mic className="w-6 h-6" />
            <span className="text-sm">Voice Note</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sync Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Last sync:</span>
                <span>{isOnline ? 'Just now' : 'Offline'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Pending items:</span>
                <span>{offlineData?.notes.filter(n => n.syncStatus === 'offline').length || 0}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                disabled={!isOnline}
                onClick={syncOfflineData}
              >
                <Upload className="w-4 h-4 mr-2" />
                Sync Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const ClientList = () => {
    const clients = isOnline ? clientProfiles : (offlineData?.clientProfiles || []);

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Clients</h3>
        
        <div className="space-y-3">
          {clients.map((client: any) => (
            <Card key={client.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{client.name}</h4>
                      <Badge variant={client.riskLevel === 'crisis' ? 'destructive' : 'outline'}>
                        {client.riskLevel}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Last session: {client.lastSession ? new Date(client.lastSession).toLocaleDateString() : 'None'}
                    </div>
                    <div className="text-sm">
                      Next: {client.nextSession ? new Date(client.nextSession).toLocaleDateString() : 'Not scheduled'}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const ActiveSessionModal = () => {
    const [sessionNotes, setSessionNotes] = useState('');
    const [sessionOutcome, setSessionOutcome] = useState('');

    if (!activeSession) return null;

    return (
      <Dialog open={!!activeSession} onOpenChange={() => setActiveSession(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Active Session - {activeSession.clientName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {/* Session timer would go here */}
                00:45:32
              </div>
              <div className="text-sm text-gray-600">Session duration</div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm">
                <Camera className="w-4 h-4 mr-1" />
                Photo
              </Button>
              <Button variant="outline" size="sm">
                <Mic className="w-4 h-4 mr-1" />
                Voice
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-1" />
                Note
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium">Session Notes</label>
              <Textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Add session observations and notes..."
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Session Outcome</label>
              <Input
                value={sessionOutcome}
                onChange={(e) => setSessionOutcome(e.target.value)}
                placeholder="Brief outcome summary..."
                className="mt-1"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setActiveSession(null)}
                className="flex-1"
              >
                Pause
              </Button>
              <Button
                onClick={() => completeSessionMutation.mutate({
                  sessionId: activeSession.id,
                  notes: sessionNotes,
                  outcome: sessionOutcome
                })}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={completeSessionMutation.isPending}
              >
                Complete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const QuickNoteModal = () => {
    const [noteContent, setNoteContent] = useState('');
    const [noteType, setNoteType] = useState<'observation' | 'concern' | 'progress' | 'goal_update'>('observation');
    const [selectedClient, setSelectedClient] = useState('');

    return (
      <Dialog open={quickNoteDialog} onOpenChange={setQuickNoteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Note</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Client</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="">Select client...</option>
                {clientProfiles.map((client: any) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Note Type</label>
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as any)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="observation">Observation</option>
                <option value="concern">Concern</option>
                <option value="progress">Progress</option>
                <option value="goal_update">Goal Update</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Note</label>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add your note..."
                className="mt-1"
              />
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Camera className="w-4 h-4 mr-1" />
                Add Photo
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Mic className="w-4 h-4 mr-1" />
                Record Audio
              </Button>
            </div>

            <Button
              onClick={() => saveQuickNoteMutation.mutate({
                clientId: selectedClient,
                content: noteContent,
                type: noteType
              })}
              disabled={!selectedClient || !noteContent || saveQuickNoteMutation.isPending}
              className="w-full"
            >
              {saveQuickNoteMutation.isPending ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Mobile Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">Coach Mobile</h1>
          <div className="text-sm opacity-90">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          {isOnline ? (
            <Wifi className="w-5 h-5" />
          ) : (
            <WifiOff className="w-5 h-5" />
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sticky top-0 bg-white z-10">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <div className="p-4">
          <TabsContent value="today" className="mt-0">
            <TodaySchedule />
          </TabsContent>

          <TabsContent value="actions" className="mt-0">
            <QuickActions />
          </TabsContent>

          <TabsContent value="clients" className="mt-0">
            <ClientList />
          </TabsContent>
        </div>
      </Tabs>

      {/* Modals */}
      <ActiveSessionModal />
      <QuickNoteModal />

      {/* Bottom Navigation/Quick Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 max-w-md mx-auto">
        <div className="flex justify-around">
          <Button variant="ghost" size="sm" className="flex flex-col items-center">
            <Phone className="w-5 h-5" />
            <span className="text-xs">Call</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center">
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs">Message</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center"
            onClick={() => setQuickNoteDialog(true)}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs">Note</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-xs">Crisis</span>
          </Button>
        </div>
      </div>
    </div>
  );
}