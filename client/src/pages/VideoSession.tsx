import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { HMSPrebuilt } from "@100mslive/roomkit-react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, UserPlus } from "lucide-react";
import ShareSessionDialog from "@/components/video/ShareSessionDialog";
import "@100mslive/roomkit-react/index.css";

export default function VideoSession() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [hasLeft, setHasLeft] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

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

  // Clean up session storage on unmount
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('participantName');
    };
  }, []);

  const handleLeave = () => {
    console.log('[100ms] User left the session', { sessionId, user: user?.email });
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

  const handleError = (error: any, errorType: string) => {
    const errorData = {
      type: errorType,
      error: error,
      message: error?.message || 'Unknown error',
      code: error?.code,
      sessionId,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      deviceType: /iPhone|iPad|iPod/.test(navigator.userAgent) ? 'iOS' : /Android/.test(navigator.userAgent) ? 'Android' : 'Desktop',
      isIOS: /iPhone|iPad|iPod/.test(navigator.userAgent),
      timestamp: new Date().toISOString()
    };
    
    console.error('[100ms ERROR]', errorData);
    
    // Send to backend for persistent logging
    fetch('/api/video/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData)
    }).catch(err => console.error('Failed to log error to backend:', err));
  };

  const handleJoin = () => {
    console.log('[100ms] Successfully joined session', {
      sessionId,
      roomCode: session?.roomCode,
      user: user?.email || 'guest',
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      timestamp: new Date().toISOString()
    });
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
          <Button onClick={() => setLocation('/')}>
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
          <Button onClick={() => setLocation(user?.role === 'coach' ? '/coach-dashboard' : '/dashboard')}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (!session.roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            Invalid Session
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This session doesn't have a valid room code.
          </p>
          <Button onClick={() => setLocation('/')}>
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
          <Button onClick={() => setLocation(user?.role === 'coach' ? '/coach-dashboard' : '/dashboard')}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative" data-testid="video-session-container">
      <HMSPrebuilt
        roomCode={session.roomCode}
        options={{
          userName: participantName,
          userId: user?.id || `guest_${Date.now()}`,
          rememberDeviceSelection: true,
        }}
        onLeave={handleLeave}
        onJoin={handleJoin}
        onError={(error: any, errorType: string) => handleError(error, errorType)}
        logo="/logo.png"
        style={{ height: "100vh", width: "100%" }}
      />
      
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
