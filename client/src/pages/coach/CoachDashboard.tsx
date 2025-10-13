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
  Video
} from "lucide-react";
import StartVideoSessionDialog from "@/components/coach/StartVideoSessionDialog";

export default function CoachDashboard() {
  const { user } = useAuth();

  // Placeholder data - will be replaced with real data later
  const stats = [
    {
      title: "Active Clients",
      value: "12",
      change: "+2 this month",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Sessions This Week",
      value: "8",
      change: "2 upcoming",
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: "Hours Logged",
      value: "24.5",
      change: "This month",
      icon: Clock,
      color: "text-purple-600"
    },
    {
      title: "Earnings (MTD)",
      value: "$2,450",
      change: "+12% vs last month",
      icon: TrendingUp,
      color: "text-emerald-600"
    }
  ];

  const upcomingSessions = [
    {
      id: 1,
      clientName: "Sarah Johnson",
      time: "Today, 2:00 PM",
      type: "Individual Coaching",
      status: "confirmed"
    },
    {
      id: 2,
      clientName: "Michael Chen",
      time: "Today, 4:30 PM",
      type: "Follow-up Session",
      status: "confirmed"
    },
    {
      id: 3,
      clientName: "Emily Rodriguez",
      time: "Tomorrow, 10:00 AM",
      type: "Initial Consultation",
      status: "pending"
    }
  ];

  const recentClients = [
    {
      id: 1,
      name: "Sarah Johnson",
      lastSession: "2 days ago",
      progress: "On track",
      status: "active"
    },
    {
      id: 2,
      name: "Michael Chen",
      lastSession: "5 days ago",
      progress: "Good progress",
      status: "active"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      lastSession: "1 week ago",
      progress: "Needs attention",
      status: "attention"
    }
  ];

  // Format clients for video session dialog
  const clientsForSession = recentClients.map(client => ({
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
          trigger={
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
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
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  data-testid={`client-${client.id}`}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {client.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last session: {client.lastSession}
                    </p>
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
    </div>
  );
}
