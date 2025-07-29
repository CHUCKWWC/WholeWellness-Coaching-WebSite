import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Settings, Users, MessageSquare, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoSessionProps {
  sessionId: string;
  coachId: number;
  clientId: string;
  sessionType: 'individual' | 'group';
  isCoach: boolean;
}

interface SessionParticipant {
  id: string;
  name: string;
  isCoach: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

export default function VideoSession({ sessionId, coachId, clientId, sessionType, isCoach }: VideoSessionProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [sessionNotes, setSessionNotes] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{id: string; sender: string; message: string; timestamp: Date}>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionDuration, setSessionDuration] = useState(0);
  const [recordingEnabled, setRecordingEnabled] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  useEffect(() => {
    // Initialize video session
    initializeVideoSession();
    return () => {
      // Cleanup video session
      cleanupVideoSession();
    };
  }, []);

  const initializeVideoSession = async () => {
    try {
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: isVideoEnabled, 
        audio: isAudioEnabled 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize participants
      const initialParticipants: SessionParticipant[] = [
        {
          id: isCoach ? `coach-${coachId}` : `client-${clientId}`,
          name: isCoach ? 'Coach (You)' : 'Client (You)',
          isCoach,
          videoEnabled: isVideoEnabled,
          audioEnabled: isAudioEnabled,
          connectionStatus: 'connected'
        }
      ];

      if (sessionType === 'group') {
        // Add additional group participants (mock data for demo)
        initialParticipants.push(
          {
            id: 'client-2',
            name: 'Sarah M.',
            isCoach: false,
            videoEnabled: true,
            audioEnabled: true,
            connectionStatus: 'connected'
          },
          {
            id: 'client-3',
            name: 'Jennifer K.',
            isCoach: false,
            videoEnabled: false,
            audioEnabled: true,
            connectionStatus: 'connecting'
          }
        );
      }

      setParticipants(initialParticipants);
      
      toast({
        title: "Video Session Ready",
        description: "Camera and microphone access granted. Ready to start session.",
      });
    } catch (error) {
      toast({
        title: "Media Access Error",
        description: "Unable to access camera or microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const cleanupVideoSession = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
      }
    }
  };

  const startSession = () => {
    setIsSessionActive(true);
    setSessionDuration(0);
    toast({
      title: "Session Started",
      description: `${sessionType === 'group' ? 'Group' : 'Individual'} session is now active.`,
    });
  };

  const endSession = async () => {
    setIsSessionActive(false);
    
    if (isCoach && sessionNotes.trim()) {
      // Save session notes
      try {
        const response = await fetch('/api/coach/session-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coachId,
            clientId,
            sessionId,
            sessionType,
            duration: sessionDuration,
            notes: sessionNotes,
            participantCount: participants.length,
            wasRecorded: recordingEnabled
          }),
        });

        if (response.ok) {
          toast({
            title: "Session Ended",
            description: "Session notes saved successfully.",
          });
        }
      } catch (error) {
        toast({
          title: "Save Error",
          description: "Failed to save session notes.",
          variant: "destructive",
        });
      }
    }

    cleanupVideoSession();
  };

  const sendChatMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: isCoach ? 'Coach' : 'Client',
        message: newMessage,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = screenStream;
      }
      toast({
        title: "Screen Sharing",
        description: "Screen sharing started successfully.",
      });
    } catch (error) {
      toast({
        title: "Screen Share Error",
        description: "Unable to start screen sharing.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">
            {sessionType === 'group' ? 'Group Session' : 'Individual Session'}
          </h1>
          <Badge variant={isSessionActive ? "default" : "secondary"}>
            {isSessionActive ? 'Active' : 'Inactive'}
          </Badge>
          {isSessionActive && (
            <div className="text-sm text-gray-300">
              Duration: {formatDuration(sessionDuration)}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-white border-white">
            <Users className="w-4 h-4 mr-1" />
            {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Grid */}
          <div className="flex-1 p-4">
            <div className={`grid gap-4 h-full ${sessionType === 'group' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {/* Main Video */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                  You ({isCoach ? 'Coach' : 'Client'})
                </div>
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                    <VideoOff className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Additional participant videos for group sessions */}
              {sessionType === 'group' && participants.slice(1).map((participant) => (
                <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    {participant.videoEnabled ? (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <div className="text-2xl font-bold">{participant.name.split(' ')[0][0]}</div>
                      </div>
                    ) : (
                      <VideoOff className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                    {participant.name}
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant={participant.connectionStatus === 'connected' ? 'default' : 'destructive'}>
                      {participant.connectionStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Control Bar */}
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant={isAudioEnabled ? "default" : "destructive"}
                size="lg"
                onClick={toggleAudio}
                className="rounded-full"
              >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              
              <Button
                variant={isVideoEnabled ? "default" : "destructive"}
                size="lg"
                onClick={toggleVideo}
                className="rounded-full"
              >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={shareScreen}
                className="rounded-full"
              >
                <Share2 className="w-5 h-5" />
              </Button>

              {!isSessionActive ? (
                <Button
                  size="lg"
                  onClick={startSession}
                  className="bg-green-600 hover:bg-green-700 rounded-full px-8"
                >
                  Start Session
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={endSession}
                  className="rounded-full px-8"
                >
                  <PhoneOff className="w-5 h-5 mr-2" />
                  End Session
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                onClick={() => setRecordingEnabled(!recordingEnabled)}
                className={`rounded-full ${recordingEnabled ? 'bg-red-600 text-white' : ''}`}
              >
                <div className={`w-3 h-3 rounded-full ${recordingEnabled ? 'bg-white' : 'bg-red-600'} mr-2`} />
                {recordingEnabled ? 'Recording' : 'Record'}
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Session Chat
              </h3>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="text-sm">
                  <div className="font-semibold text-blue-400">{msg.sender}</div>
                  <div className="text-gray-300">{msg.message}</div>
                  <div className="text-xs text-gray-500">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                />
                <Button onClick={sendChatMessage} size="sm">
                  Send
                </Button>
              </div>
            </div>
          </div>

          {/* Session Notes (Coach Only) */}
          {isCoach && (
            <div className="border-t border-gray-700">
              <div className="p-4">
                <Label className="text-white font-semibold">Session Notes</Label>
                <Textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Add session notes, observations, and action items..."
                  className="mt-2 bg-gray-700 border-gray-600 text-white min-h-[120px]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}