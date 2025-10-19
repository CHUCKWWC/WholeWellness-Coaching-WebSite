import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Video,
  Eye
} from "lucide-react";
import StartVideoSessionDialog from "@/components/coach/StartVideoSessionDialog";
import ClientDetailView from "@/components/coach/ClientDetailView";
import { useQuery } from "@tanstack/react-query";
import type { Booking as SchemaBooking } from "@shared/schema";

interface CoachClient {
  id: string;
  userId?: string;
  name?: string;
  fullName?: string;
  email?: string;
  lastSession?: string;
  status?: string;
}

// Booking type expected by StartVideoSessionDialog component
interface ComponentBooking {
  id: number;
  fullName: string;
  email: string;
  coachingArea: string;
  serviceType?: string;
  scheduledDate?: string;
  preferredDate?: string;
  preferredTime?: string;
  status: string;
}

// Normalize schema Booking to component-expected Booking
// Note: API returns JSON where dates are already strings, so we safely handle both string and Date formats
const normalizeBooking = (booking: SchemaBooking): ComponentBooking => ({
  id: booking.id,
  fullName: booking.fullName,
  email: booking.email,
  coachingArea: booking.coachingArea,
  serviceType: booking.serviceType ?? undefined,
  scheduledDate: booking.scheduledDate 
    ? (typeof booking.scheduledDate === 'string' 
        ? booking.scheduledDate 
        : booking.scheduledDate.toISOString())
    : undefined,
  preferredDate: booking.preferredDate ?? undefined,
  preferredTime: booking.preferredTime ?? undefined,
  status: booking.status ?? 'pending',
});

export default function CoachDashboard() {
  const { user } = useAuth();
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string; email: string } | null>(null);

  // Fetch coach's bookings
  const { data: rawBookings = [] } = useQuery<SchemaBooking[]>({
    queryKey: ["/api/coach/bookings"],
    enabled: !!user,
  });

  // Normalize bookings to component-expected format
  const bookings: ComponentBooking[] = rawBookings.map(normalizeBooking);

  // Fetch coach's clients
  const { data: clients = [] } = useQuery<CoachClient[]>({
    queryKey: ["/api/coach/clients"],
    enabled: !!user,
  });

  // Calculate real stats from data
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Active clients (status: active)
  const activeClients = clients.filter(c => c.status === 'active').length;
  
  // Sessions this week (bookings with scheduledDate in the past week)
  const sessionsThisWeek = bookings.filter(b => {
    if (!b.scheduledDate) return false;
    const sessionDate = new Date(b.scheduledDate);
    return sessionDate >= oneWeekAgo && sessionDate <= now && b.status === 'confirmed';
  }).length;
  
  // Upcoming sessions count
  const upcomingCount = bookings.filter(b => {
    if (!b.scheduledDate) return false;
    const sessionDate = new Date(b.scheduledDate);
    return sessionDate > now && (b.status === 'confirmed' || b.status === 'pending');
  }).length;
  
  // Total sessions this month
  const sessionsThisMonth = bookings.filter(b => {
    if (!b.scheduledDate) return false;
    const sessionDate = new Date(b.scheduledDate);
    return sessionDate >= oneMonthAgo && sessionDate <= now && b.status === 'confirmed';
  }).length;
  
  // Estimated hours (assuming 1 hour per session)
  const hoursLogged = sessionsThisMonth;

  const stats = [
    {
      title: "Active Clients",
      value: activeClients.toString(),
      change: clients.length > 0 ? `${clients.length} total` : 'No clients yet',
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Sessions This Week",
      value: sessionsThisWeek.toString(),
      change: upcomingCount > 0 ? `${upcomingCount} upcoming` : 'No upcoming sessions',
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: "Hours Logged",
      value: hoursLogged.toString(),
      change: "This month",
      icon: Clock,
      color: "text-purple-600"
    },
    {
      title: "Total Sessions",
      value: bookings.filter(b => b.status === 'confirmed').length.toString(),
      change: "All time",
      icon: TrendingUp,
      color: "text-emerald-600"
    }
  ];

  // Get upcoming sessions from real bookings
  const upcomingSessions = bookings
    .filter(b => {
      if (!b.scheduledDate) return false;
      const sessionDate = new Date(b.scheduledDate);
      return sessionDate > now && (b.status === 'confirmed' || b.status === 'pending');
    })
    .sort((a, b) => {
      const dateA = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
      const dateB = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
      return dateA - dateB;
    })
    .slice(0, 5)
    .map(booking => {
      const sessionDate = booking.scheduledDate ? new Date(booking.scheduledDate) : new Date();
      const isToday = sessionDate.toDateString() === now.toDateString();
      const isTomorrow = sessionDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
      
      let timeDisplay = '';
      if (isToday) {
        timeDisplay = `Today, ${sessionDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else if (isTomorrow) {
        timeDisplay = `Tomorrow, ${sessionDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else {
        timeDisplay = sessionDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: 'numeric', 
          minute: '2-digit' 
        });
      }
      
      return {
        id: booking.id,
        clientName: booking.fullName,
        time: timeDisplay,
        type: booking.serviceType === 'intensive' ? 'Intensive Coaching' : 
              booking.serviceType === 'individual' ? 'Individual Coaching' : 'Consultation',
        status: booking.status
      };
    });

  // Get recent clients from real data
  const recentClients = clients
    .slice(0, 5)
    .map(client => {
      const lastSessionDate = client.lastSession ? new Date(client.lastSession) : null;
      let lastSessionDisplay = 'No sessions yet';
      
      if (lastSessionDate) {
        const daysDiff = Math.floor((now.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 0) {
          lastSessionDisplay = 'Today';
        } else if (daysDiff === 1) {
          lastSessionDisplay = '1 day ago';
        } else if (daysDiff < 7) {
          lastSessionDisplay = `${daysDiff} days ago`;
        } else if (daysDiff < 30) {
          const weeks = Math.floor(daysDiff / 7);
          lastSessionDisplay = `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        } else {
          lastSessionDisplay = lastSessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      }
      
      return {
        id: client.id || client.userId || '',
        name: client.fullName || client.name || 'Unknown',
        lastSession: lastSessionDisplay,
        progress: client.status === 'active' ? 'Active' : 'On track',
        status: client.status || 'active',
        totalSessions: (client as any).totalSessions || 0
      };
    });

  // Format clients for video session dialog - use real data if available
  const clientsForSession = clients.length > 0 
    ? clients.map((client) => ({
        id: client.id || client.userId || '',
        name: client.fullName || client.name || 'Unknown',
        email: client.email,
      }))
    : recentClients.map(client => ({
        id: client.id.toString(),
        name: client.name,
      }));

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Here's what's happening with your coaching practice today.
          </p>
        </div>
        <StartVideoSessionDialog 
          clients={clientsForSession}
          bookings={bookings}
          trigger={
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" data-testid="button-start-video-session-main">
              <Video className="h-5 w-5 mr-2" />
              Start Video Session
            </Button>
          }
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Upcoming Sessions
            </CardTitle>
            <CardDescription>Your scheduled coaching sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {session.clientName}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{session.type}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{session.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.status === 'confirmed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" data-testid="button-view-schedule">
              View Full Schedule
            </Button>
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Recent Clients
            </CardTitle>
            <CardDescription>Clients you've worked with recently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  data-testid={`client-${client.id}`}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {client.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last session: {client.lastSession}
                    </p>
                    {client.totalSessions > 0 && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {client.totalSessions} session{client.totalSessions !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        client.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}
                    >
                      {client.progress}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Find the corresponding full client data
                        const fullClient = clients.find(c => c.id === client.id || c.userId === client.id);
                        setSelectedClient({
                          id: fullClient?.userId || client.id,
                          name: fullClient?.fullName || fullClient?.name || client.name,
                          email: fullClient?.email || ''
                        });
                      }}
                      data-testid={`button-view-client-${client.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" data-testid="button-view-clients">
              View All Clients
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" data-testid="button-add-client">
            <Users className="h-5 w-5" />
            <span>Add New Client</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" data-testid="button-schedule-session">
            <Calendar className="h-5 w-5" />
            <span>Schedule Session</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" data-testid="button-view-assessments">
            <CheckCircle className="h-5 w-5" />
            <span>View Assessments</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" data-testid="button-client-notes">
            <Clock className="h-5 w-5" />
            <span>Client Notes</span>
          </Button>
        </div>
      </div>

      {/* Client Detail View Modal */}
      {selectedClient && (
        <ClientDetailView
          clientId={selectedClient.id}
          clientName={selectedClient.name}
          clientEmail={selectedClient.email}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
}
