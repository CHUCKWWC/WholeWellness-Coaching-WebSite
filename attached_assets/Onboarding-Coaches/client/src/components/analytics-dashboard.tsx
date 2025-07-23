import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Users, Star } from "lucide-react";

export default function AnalyticsDashboard() {
  const { data: analytics } = useQuery({
    queryKey: ['/api/coaches/1/analytics'],
  });

  const { data: sessions } = useQuery({
    queryKey: ['/api/coaches/1/sessions'],
  });

  const { data: clients } = useQuery({
    queryKey: ['/api/coaches/1/clients'],
  });

  // Mock data for demonstration - in production this would come from the API
  const clientProgress = [
    { initials: "JD", name: "John Doe", goal: "Stress Management", progress: 75 },
    { initials: "MS", name: "Maria Silva", goal: "Career Transition", progress: 50 },
    { initials: "RJ", name: "Robert Johnson", goal: "Work-Life Balance", progress: 90 },
  ];

  const upcomingSessions = sessions?.filter((session: any) => 
    new Date(session.scheduledAt) > new Date()
  ).slice(0, 3) || [];

  const recentMetrics = {
    thisMonth: {
      sessions: analytics?.monthlyStats?.sessions || 0,
      newClients: analytics?.monthlyStats?.newClients || 0,
      revenue: analytics?.monthlyStats?.revenue || 0,
    },
    lastMonth: {
      sessions: analytics?.previousMonth?.sessions || 0,
      newClients: analytics?.previousMonth?.newClients || 0,
      revenue: analytics?.previousMonth?.revenue || 0,
    }
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return (
    <Card className="wellness-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>Analytics & Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Client Progress Tracking */}
          <div>
            <h4 className="text-lg font-medium text-gray-700 mb-4">Client Progress</h4>
            {clientProgress.length > 0 ? (
              <div className="space-y-4">
                {clientProgress.map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[var(--wellness-teal)] rounded-full flex items-center justify-center text-white font-medium">
                        {client.initials}
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">{client.name}</p>
                        <p className="text-sm text-gray-500">{client.goal}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Progress value={client.progress} className="w-20" />
                      <span className="text-sm font-medium text-gray-600 min-w-[3rem]">
                        {client.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No active clients to track</p>
              </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div>
            <h4 className="text-lg font-medium text-gray-700 mb-4">Upcoming Sessions</h4>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-700">{session.clientName || "Client"}</p>
                      <p className="text-sm text-gray-500">{session.sessionType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--wellness-teal)]">
                        {new Date(session.scheduledAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">{session.duration} minutes</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No upcoming sessions</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8 pt-6 border-t">
          <h4 className="text-lg font-medium text-gray-700 mb-6">Monthly Performance</h4>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Sessions Growth */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{recentMetrics.thisMonth.sessions}</p>
              <p className="text-sm text-gray-600 mb-2">Sessions This Month</p>
              {recentMetrics.lastMonth.sessions > 0 && (
                <Badge 
                  variant={calculateGrowth(recentMetrics.thisMonth.sessions, recentMetrics.lastMonth.sessions) >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {calculateGrowth(recentMetrics.thisMonth.sessions, recentMetrics.lastMonth.sessions) >= 0 ? "+" : ""}
                  {calculateGrowth(recentMetrics.thisMonth.sessions, recentMetrics.lastMonth.sessions)}%
                </Badge>
              )}
            </div>

            {/* New Clients */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{recentMetrics.thisMonth.newClients}</p>
              <p className="text-sm text-gray-600 mb-2">New Clients</p>
              {recentMetrics.lastMonth.newClients > 0 && (
                <Badge 
                  variant={calculateGrowth(recentMetrics.thisMonth.newClients, recentMetrics.lastMonth.newClients) >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {calculateGrowth(recentMetrics.thisMonth.newClients, recentMetrics.lastMonth.newClients) >= 0 ? "+" : ""}
                  {calculateGrowth(recentMetrics.thisMonth.newClients, recentMetrics.lastMonth.newClients)}%
                </Badge>
              )}
            </div>

            {/* Client Satisfaction */}
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{analytics?.avgRating || "4.9"}</p>
              <p className="text-sm text-gray-600 mb-2">Average Rating</p>
              <Badge variant="default" className="text-xs">
                {analytics?.numReviews || 47} reviews
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
