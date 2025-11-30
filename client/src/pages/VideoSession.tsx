import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, UserPlus } from "lucide-react";
import ShareSessionDialog from "@/components/video/ShareSessionDialog";

export default function VideoSession() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [hasLeft, setHasLeft] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [jitsiError, setJitsiError] = useState<string | null>(null);
  const jitsiApiRef = useRef<any>(null);

  // Get participant name from sessionStorage (set by JoinSession page for guests)
  const storedSession = sessionStorage.getItem('videoSession');
  const parsedSession = storedSession ? JSON.parse(storedSession) : null;
  const participantName = parsedSession?.userName
    || sessionStorage.getItem('participantName')
    || user?.firstName
    || 'Guest';

  // Get session details
  const { data: sessionData, isLoading, error } = useQuery({
    queryKey: ['/api/video/sessions', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/video/sessions/${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch session');
      return response.json();
    },
    enabled: !!sessionId,
  });

  // Get Jitsi room configuration
  const { data: jitsiConfig } = useQuery({
    queryKey: ['/api/video/sessions', sessionId, 'jitsi-config'],
    queryFn: async () => {
      const response = await fetch(`/api/video/sessions/${sessionId}/jitsi-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: participantName,
          userId: user?.id || `guest_${Date.now()}`,
        }),
      });
      if (!response.ok) throw new Error('Failed to get Jitsi config');
      return response.json();
    },
    enabled: !!sessionId && !!sessionData?.session,
  });

  // Clean up session storage on unmount
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('participantName');
    };
  }, []);

  const handleLeave = () => {
    console.log('[Jitsi] User left the session', { sessionId, user: user?.email });
    setHasLeft(true);
    
    // Redirect based on user type
    if (user?.role === 'coach') {
      setLocation('/coach-dashboard');
    } else if (isAuthenticated) {
      setLocation('/dashboard');
    } else {
      setLocation('/');
    }
  };

  const handleError = (error: any) => {
    console.error('[Jitsi ERROR]', error);
    setJitsiError(error?.message || 'An error occurred with the video call');
    
    // Log error to backend
    fetch('/api/video/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'JITSI_ERROR',
        error: JSON.stringify(error),
        message: error?.message || 'Unknown error',
        sessionId,
        roomCode: sessionData?.session?.roomCode,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        deviceType: /iPhone|iPad|iPod/.test(navigator.userAgent) ? 'iOS' : /Android/.test(navigator.userAgent) ? 'Android' : 'Desktop',
        isIOS: /iPhone|iPad|iPod/.test(navigator.userAgent),
        timestamp: new Date().toISOString(),
        participantName,
        userId: user?.id || 'guest',
      })
    }).catch(err => console.error('Failed to log error to backend:', err));
  };

  const handleJitsiIFrameRef = (iframeRef: HTMLDivElement) => {
    if (iframeRef) {
      iframeRef.style.height = '100%';
      iframeRef.style.width = '100%';
    }
  };

  const handleApiReady = (api: any) => {
    console.log('[Jitsi] API ready', { sessionId });
    jitsiApiRef.current = api;
    
    // Listen for participant left event
    api.addListener('videoConferenceLeft', () => {
      handleLeave();
    });
    
    // Listen for errors
    api.addListener('errorOccurred', (error: any) => {
      handleError(error);
    });
  };

  const handleReadyToClose = () => {
    console.log('[Jitsi] Ready to close');
    handleLeave();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600 dark:text-gray-300">Loading session...</p>
        </Card>
      </div>
    );
  }

  if (error || !sessionData?.session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            Session Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This session could not be found or you don't have permission to access it.
          </p>
          <Button onClick={() => setLocation('/')} data-testid="button-return-home">
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  const session = sessionData.session;

  // Check if session is still valid
  if (session.status === 'completed' || session.status === 'cancelled') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            Session Ended
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This session has already ended.
          </p>
          <Button 
            onClick={() => setLocation(user?.role === 'coach' ? '/coach-dashboard' : '/dashboard')}
            data-testid="button-return-dashboard"
          >
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (!session.roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            Invalid Session
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This session doesn't have a valid room configuration.
          </p>
          <Button onClick={() => setLocation('/')} data-testid="button-return-home-invalid">
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  if (hasLeft) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            You've left the session
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Thanks for joining!
          </p>
          <Button 
            onClick={() => setLocation(user?.role === 'coach' ? '/coach-dashboard' : '/dashboard')}
            data-testid="button-return-dashboard-left"
          >
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (jitsiError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            Connection Error
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {jitsiError}
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => setJitsiError(null)} 
              variant="outline"
              data-testid="button-try-again"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => setLocation('/')}
              data-testid="button-return-home-error"
            >
              Return Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Wait for Jitsi config to be loaded
  if (!jitsiConfig && sessionData?.session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600 dark:text-gray-300">Preparing video conference...</p>
        </Card>
      </div>
    );
  }

  const isCoachOrAdmin = user?.role === 'coach' || user?.role === 'admin';
  const domain = jitsiConfig?.domain || 'meet.jit.si';
  const roomName = jitsiConfig?.roomName || session.roomId;

  console.log('[Jitsi] Preparing to join with:', {
    domain,
    roomName,
    userName: participantName,
    userId: user?.id || 'guest',
    isAuthenticated,
    userRole: user?.role,
    isModerator: isCoachOrAdmin,
    jaasEnabled: jitsiConfig?.isJaasEnabled,
    hasJwt: !!jitsiConfig?.jwt,
  });

  // Build JitsiMeeting props - only include jwt if it exists and is non-empty
  const jitsiProps: any = {
    domain,
    roomName,
    configOverwrite: jitsiConfig?.configOverwrite || {
      startWithAudioMuted: true,
      startWithVideoMuted: false,
      disableDeepLinking: true,
      prejoinPageEnabled: true,
      enableWelcomePage: false,
      enableClosePage: false,
      disableInviteFunctions: false,
      enableNoisyMicDetection: true,
      enableNoAudioDetection: true,
      toolbarButtons: [
        'camera',
        'chat',
        'closedcaptions',
        'desktop',
        'filmstrip',
        'fullscreen',
        'hangup',
        'microphone',
        'participants-pane',
        'raisehand',
        'select-background',
        'settings',
        'tileview',
        'toggle-camera',
        'videoquality',
      ],
    },
    interfaceConfigOverwrite: jitsiConfig?.interfaceConfigOverwrite || {
      SHOW_JITSI_WATERMARK: true,
      SHOW_WATERMARK_FOR_GUESTS: false,
      SHOW_BRAND_WATERMARK: false,
      SHOW_POWERED_BY: false,
      SHOW_PROMOTIONAL_CLOSE_PAGE: false,
      MOBILE_APP_PROMO: false,
      HIDE_INVITE_MORE_HEADER: false,
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
      TOOLBAR_ALWAYS_VISIBLE: false,
      TOOLBAR_TIMEOUT: 4000,
    },
    userInfo: {
      displayName: participantName,
      email: user?.email || '',
    },
    onApiReady: handleApiReady,
    onReadyToClose: handleReadyToClose,
    getIFrameRef: handleJitsiIFrameRef,
    spinner: () => (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-white">Connecting to video session...</p>
        </div>
      </div>
    ),
  };

  // Only add jwt prop if it exists and is non-empty (for JaaS)
  if (jitsiConfig?.jwt) {
    jitsiProps.jwt = jitsiConfig.jwt;
  }

  return (
    <div className="h-screen w-full relative" data-testid="video-session-container">
      <JitsiMeeting {...jitsiProps} />
      
      {/* Floating Invite Button - Only show for coaches */}
      {user?.role === 'coach' && (
        <div className="absolute top-4 right-4 z-50">
          <Button
            onClick={() => setShowShareDialog(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
            size="sm"
            data-testid="button-invite-participants"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite
          </Button>
        </div>
      )}

      {/* Share Session Dialog */}
      <ShareSessionDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        roomCode={session.roomCode}
        sessionId={session.id}
        sessionTitle={session.title}
      />
    </div>
  );
}
