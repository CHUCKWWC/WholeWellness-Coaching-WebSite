import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  selectIsConnectedToRoom,
  useHMSActions,
  useHMSStore,
  selectPeers,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  HMSRoomProvider
} from "@100mslive/react-sdk";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff,
  MessageSquare,
  Users,
  FileText
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function VideoRoom() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const peers = useHMSStore(selectPeers);
  const isLocalAudioEnabled = useHMSStore(selectIsLocalAudioEnabled);
  const isLocalVideoEnabled = useHMSStore(selectIsLocalVideoEnabled);
  const [transcript, setTranscript] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);

  // Get session details and join token
  const { data: sessionData } = useQuery({
    queryKey: ['/api/video/sessions', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/video/sessions/${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch session');
      return response.json();
    },
    enabled: !!sessionId,
  });

  const joinTokenMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/video/sessions/${sessionId}/join-token`, {});
    },
  });

  const startSessionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/video/sessions/${sessionId}/start`, {});
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/video/sessions/${sessionId}/end`, { transcript });
    },
    onSuccess: () => {
      toast({
        title: "Session Ended",
        description: "The session has been ended and transcript will be sent to participants.",
      });
      hmsActions.leave();
      setLocation('/coach-dashboard');
    },
  });

  // Join the room on mount
  useEffect(() => {
    if (sessionId && !isConnected) {
      joinTokenMutation.mutate(undefined, {
        onSuccess: async (data: any) => {
          try {
            await hmsActions.join({
              userName: "User",
              authToken: data.authToken,
            });
            await startSessionMutation.mutateAsync();
          } catch (error) {
            console.error("Failed to join room:", error);
            toast({
              title: "Connection Error",
              description: "Failed to join the session. Please try again.",
              variant: "destructive",
            });
          }
        },
      });
    }
  }, [sessionId]);

  // Handle audio toggle
  const toggleAudio = async () => {
    await hmsActions.setLocalAudioEnabled(!isLocalAudioEnabled);
  };

  // Handle video toggle
  const toggleVideo = async () => {
    await hmsActions.setLocalVideoEnabled(!isLocalVideoEnabled);
  };

  // Handle end call
  const endCall = () => {
    endSessionMutation.mutate();
  };

  if (!sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{sessionData.session.title}</h1>
            <p className="text-sm text-gray-400">{sessionData.session.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-gray-400 hover:text-white"
              data-testid="button-toggle-transcript"
            >
              <FileText className="w-4 h-4 mr-2" />
              Transcript
            </Button>
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-4 h-4" />
              <span className="text-sm">{peers.length} participant{peers.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {peers.map((peer) => (
            <Card key={peer.id} className="bg-gray-800 border-gray-700 overflow-hidden relative">
              {peer.videoTrack ? (
                <video
                  ref={(videoElement) => {
                    if (videoElement && peer.videoTrack) {
                      hmsActions.attachVideo(peer.videoTrack, videoElement);
                    }
                  }}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted={peer.isLocal}
                  playsInline
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-600 to-teal-800">
                  <div className="text-6xl font-bold text-white">
                    {peer.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-sm font-medium">{peer.name}</span>
              </div>
              {!peer.audioEnabled && (
                <div className="absolute top-4 right-4 bg-red-500 p-2 rounded-full">
                  <MicOff className="w-4 h-4 text-white" />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Transcript Panel */}
      {showTranscript && (
        <div className="fixed right-0 top-0 h-full w-96 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Live Transcript</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTranscript(false)}
              className="text-gray-400 hover:text-white"
            >
              Close
            </Button>
          </div>
          <div className="space-y-2">
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full h-96 bg-gray-900 text-white p-3 rounded-lg border border-gray-700 focus:border-teal-500 focus:outline-none"
              placeholder="Transcript will appear here during the session..."
              data-testid="textarea-transcript"
            />
            <p className="text-xs text-gray-500">
              Note: Automatic transcription requires 100ms credentials. You can manually enter notes here.
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isLocalAudioEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-14 h-14"
            data-testid="button-toggle-audio"
          >
            {isLocalAudioEnabled ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </Button>

          <Button
            variant={isLocalVideoEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-14 h-14"
            data-testid="button-toggle-video"
          >
            {isLocalVideoEnabled ? (
              <Video className="w-6 h-6" />
            ) : (
              <VideoOff className="w-6 h-6" />
            )}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={endCall}
            className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
            data-testid="button-end-call"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-14 h-14 border-gray-600 text-gray-400 hover:text-white"
            data-testid="button-toggle-chat"
          >
            <MessageSquare className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function VideoSession() {
  return (
    <HMSRoomProvider>
      <VideoRoom />
    </HMSRoomProvider>
  );
}
