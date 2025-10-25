import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Video, Users, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

export default function JoinSession() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [roomCode, setRoomCode] = useState(params.code?.toUpperCase() || '');
  const [name, setName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && user) {
      const displayName = user.firstName 
        ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
        : user.email?.split('@')[0] || '';
      setName(displayName);
    }
  }, [user, isAuthenticated]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomCode.trim() || !name.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter both your name and the room code',
        variant: 'destructive'
      });
      return;
    }

    setIsJoining(true);
    try {
      const response = await apiRequest('POST', '/api/video/sessions/join-public', {
        roomCode: roomCode.toUpperCase(),
        name: name.trim()
      });

      if (response.success) {
        // Store session info for video component
        sessionStorage.setItem('videoSession', JSON.stringify({
          authToken: response.authToken,
          roomId: response.roomId,
          sessionId: response.sessionId,
          userName: name,
          role: 'participant'
        }));

        // Redirect to video session page
        setLocation(`/session/${response.sessionId}/join`);
      }
    } catch (error: any) {
      console.error('Failed to join session:', error);
      toast({
        title: 'Failed to join',
        description: error.message || 'Invalid room code or session has ended',
        variant: 'destructive'
      });
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Video className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Join Video Session</CardTitle>
          <CardDescription>
            {roomCode ? 'Enter your name to join' : 'Enter your name and room code to join the video call'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-testid="input-participant-name"
              />
            </div>
            
            {params.code ? (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                  Room Code
                </div>
                <div className="text-center text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                  {roomCode}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="roomCode">Room Code</Label>
                <Input
                  id="roomCode"
                  type="text"
                  placeholder="Enter room code (e.g., abc-xyz-def)"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toLowerCase())}
                  required
                  className="text-center text-lg font-mono tracking-wider"
                  data-testid="input-room-code"
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isJoining}
              data-testid="button-join-session"
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Join Session
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                  Camera & Microphone Required
                </p>
                <p className="text-blue-800 dark:text-blue-300">
                  You'll need to allow camera and microphone access when joining the video session. 
                  Your browser will ask for permission after you click "Join Session".
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Don't have a room code?</p>
            <p className="mt-1">Ask your coach or host for the session code</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}