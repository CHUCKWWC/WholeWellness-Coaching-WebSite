import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { HMSPrebuilt } from "@100mslive/roomkit-react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import "@100mslive/roomkit-react/dist/index.css";

export default function VideoSession() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [hasLeft, setHasLeft] = useState(false);

  // Get participant name from sessionStorage (set by JoinSession page for guests)
  const participantName = sessionStorage.getItem('participantName') || user?.firstName || 'Guest';

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
    <div className="h-screen w-full" data-testid="video-session-container">
      <HMSPrebuilt
        roomCode={session.roomCode}
        options={{
          userName: participantName,
          userId: user?.id || `guest_${Date.now()}`,
          rememberDeviceSelection: true,
        }}
        onLeave={handleLeave}
        logo="/logo.png"
        style={{ height: "100vh", width: "100%" }}
      />
    </div>
  );
}
