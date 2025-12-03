import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Video, ExternalLink, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VideoSession() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

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

  // Auto-redirect to Google Meet if available
  useEffect(() => {
    if (sessionData?.session?.meetUrl) {
      // Small delay to show the redirect message
      const timer = setTimeout(() => {
        window.open(sessionData.session.meetUrl, '_blank');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [sessionData?.session?.meetUrl]);

  const handleJoinMeet = () => {
    if (sessionData?.session?.meetUrl) {
      window.open(sessionData.session.meetUrl, '_blank');
    }
  };

  const handleCopyLink = async () => {
    const link = sessionData?.session?.meetUrl;
    if (link) {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Google Meet link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReturn = () => {
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
            onClick={handleReturn}
            data-testid="button-return-dashboard"
          >
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // If session has Google Meet URL
  if (session.meetUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="p-8 text-center max-w-lg shadow-xl" data-testid="video-session-container">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Video className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            {session.title}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Welcome, {participantName}! Your video session is ready.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
              This session uses <strong>Google Meet</strong> for video conferencing.
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              A new tab will open automatically, or click the button below.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleJoinMeet}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
              data-testid="button-join-meet"
            >
              <Video className="w-5 h-5 mr-2" />
              Join Google Meet
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>

            <Button 
              variant="outline"
              onClick={handleCopyLink}
              className="w-full"
              data-testid="button-copy-link"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Meet Link
                </>
              )}
            </Button>

            <Button 
              variant="ghost"
              onClick={handleReturn}
              className="w-full text-gray-500"
              data-testid="button-return-dashboard-meet"
            >
              Return to Dashboard
            </Button>
          </div>

          {session.description && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {session.description}
              </p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Fallback: No Google Meet URL (coach hasn't connected calendar)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="p-8 text-center max-w-lg shadow-xl" data-testid="video-session-container">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          {session.title}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Welcome, {participantName}!
        </p>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <strong>Google Meet link not available</strong>
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            The coach needs to connect their Google Calendar to create video sessions with Google Meet.
          </p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Room Code:</p>
          <p className="text-2xl font-mono font-bold text-purple-600 dark:text-purple-400 tracking-wider">
            {session.roomCode}
          </p>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Please contact your coach to obtain the meeting link or ask them to connect their Google Calendar.
        </p>

        <Button 
          onClick={handleReturn}
          className="w-full"
          data-testid="button-return-dashboard-fallback"
        >
          Return to Dashboard
        </Button>
      </Card>
    </div>
  );
}
