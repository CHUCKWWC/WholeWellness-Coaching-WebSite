import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Loader2,
  Video,
  Unlink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CalendarStatus {
  connected: boolean;
  email?: string;
  calendarId?: string;
}

export default function GoogleCalendarIntegrationCard() {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: status, isLoading } = useQuery<CalendarStatus>({
    queryKey: ['/api/video/google/calendar/status'],
    refetchInterval: isConnecting ? 2000 : false,
  });

  const disconnectMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/video/google/calendar/disconnect'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/video/google/calendar/status'] });
      toast({
        title: 'Calendar Disconnected',
        description: 'Your Google Calendar has been disconnected.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Disconnect Failed',
        description: error.message || 'Failed to disconnect calendar',
        variant: 'destructive',
      });
    },
  });

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const response = await fetch('/api/video/google/calendar/auth');
      const data = await response.json();
      
      if (data.authUrl) {
        const popup = window.open(
          data.authUrl,
          'google-calendar-auth',
          'width=600,height=700,left=200,top=100'
        );

        const checkPopupClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkPopupClosed);
            setIsConnecting(false);
            queryClient.invalidateQueries({ queryKey: ['/api/video/google/calendar/status'] });
          }
        }, 500);

        setTimeout(() => {
          clearInterval(checkPopupClosed);
          setIsConnecting(false);
        }, 120000);
      }
    } catch (error) {
      setIsConnecting(false);
      toast({
        title: 'Connection Failed',
        description: 'Failed to start Google Calendar connection',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status?.connected) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-green-600" />
              Google Calendar
            </CardTitle>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </div>
          <CardDescription className="text-green-700 dark:text-green-400">
            Video sessions will automatically create Google Meet links
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Video className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{status.email}</span>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-red-600"
                  data-testid="button-disconnect-calendar"
                >
                  <Unlink className="h-4 w-4 mr-1" />
                  Disconnect
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disconnect Google Calendar?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will prevent automatic Google Meet link creation for new video sessions. 
                    Existing sessions with Meet links will continue to work.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => disconnectMutation.mutate()}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={disconnectMutation.isPending}
                  >
                    {disconnectMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Disconnect
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-amber-600" />
            Google Calendar
          </CardTitle>
          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not Connected
          </Badge>
        </div>
        <CardDescription className="text-amber-700 dark:text-amber-400">
          Connect to create video sessions with Google Meet
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p className="font-medium">Benefits of connecting:</p>
          <ul className="list-disc list-inside space-y-1 text-xs ml-2">
            <li>Automatic Google Meet links for video sessions</li>
            <li>Calendar invites sent to clients</li>
            <li>Sync with your Google Calendar</li>
            <li>No additional video conferencing setup needed</li>
          </ul>
        </div>
        
        <Button 
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full bg-blue-600 hover:bg-blue-700"
          data-testid="button-connect-google-calendar"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Connecting...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect Google Calendar
            </>
          )}
        </Button>
        
        <p className="text-xs text-center text-gray-500 dark:text-gray-500">
          You'll be redirected to Google to authorize access
        </p>
      </CardContent>
    </Card>
  );
}
