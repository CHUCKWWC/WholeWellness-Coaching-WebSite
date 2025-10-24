import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Video, Calendar, User, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function SessionJoin() {
  const { sessionId } = useParams();
  const { user, isAuthenticated } = useAuth();

  const { data: sessionData, isLoading } = useQuery({
    queryKey: ['/api/video/sessions', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/video/sessions/${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch session');
      return response.json();
    },
    enabled: !!sessionId,
  });

  const handleJoinSession = () => {
    // Check if there's session info from JoinSession page for guest users
    const videoSessionData = sessionStorage.getItem('videoSession');
    if (videoSessionData) {
      // For guest users who already have the auth token from JoinSession
      window.location.href = `/session/${sessionId}`;
    } else {
      // For authenticated users, go directly to the video room
      window.location.href = `/session/${sessionId}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Session Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The session you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { session } = sessionData;
  const sessionTime = new Date(session.scheduledStartTime);
  const isUpcoming = sessionTime > new Date();
  const canJoin = !isUpcoming || (new Date().getTime() > sessionTime.getTime() - 15 * 60 * 1000); // 15 min before

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          {/* Session Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-full">
              <Video className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {session.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {session.sessionType === "one-on-one" ? "One-on-One Session" : 
                 session.sessionType === "workshop" ? "Workshop" : "Group Session"}
              </p>
            </div>
          </div>

          {/* Session Details */}
          <div className="space-y-4 mb-6">
            {session.description && (
              <p className="text-gray-700 dark:text-gray-300">
                {session.description}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {sessionTime.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-xs text-gray-500">Date</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Clock className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {sessionTime.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  <p className="text-xs text-gray-500">Time</p>
                </div>
              </div>
            </div>

            {session.roomCode && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Session Code
                </p>
                <p className="text-2xl font-mono font-bold text-teal-600 dark:text-teal-400">
                  {session.roomCode}
                </p>
              </div>
            )}
          </div>

          {/* Status Banner */}
          {session.status === "completed" && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                This session has ended. Transcript and summary have been sent to participants.
              </p>
            </div>
          )}

          {isUpcoming && !canJoin && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-blue-800 dark:text-blue-200">
                This session will be available 15 minutes before the scheduled start time.
              </p>
            </div>
          )}

          {/* Join Button */}
          {!isAuthenticated && session.sessionType !== "instant" ? (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please log in to join this session
              </p>
              <Button 
                onClick={() => window.location.href = '/login'}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                Log In
              </Button>
            </div>
          ) : session.status === "completed" ? (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = `/session/${sessionId}/transcript`}
              data-testid="button-view-transcript"
            >
              View Transcript
            </Button>
          ) : canJoin ? (
            <Button 
              onClick={handleJoinSession}
              className="w-full bg-teal-600 hover:bg-teal-700 text-lg py-6"
              data-testid="button-join-session"
            >
              <Video className="w-5 h-5 mr-2" />
              Join Session
            </Button>
          ) : (
            <Button 
              disabled
              className="w-full text-lg py-6"
            >
              Session Not Yet Available
            </Button>
          )}

          {/* Participants */}
          {sessionData.participants && sessionData.participants.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Participants ({sessionData.participants.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {sessionData.participants.map((participant: any) => (
                  <div 
                    key={participant.id}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1"
                  >
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {participant.userId === session.coachId ? "(Host)" : "Participant"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
