import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Calendar, Clock } from "lucide-react";

interface Booking {
  id: number;
  fullName: string;
  email: string;
  scheduledDate?: string;
  status: string;
}

interface Client {
  id?: string;
  userId?: string;
  fullName?: string;
  name?: string;
  status?: string;
  email: string;
  lastSession?: string;
  totalSessions?: number;
}

interface PerformanceChartsProps {
  bookings: Booking[];
  clients: Client[];
}

export default function PerformanceCharts({ bookings, clients }: PerformanceChartsProps) {
  // Prepare data for charts
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  // Monthly session data (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
    const monthSessions = bookings.filter(b => {
      if (!b.scheduledDate) return false;
      const sessionDate = new Date(b.scheduledDate);
      return sessionDate.getMonth() === monthDate.getMonth() && 
             sessionDate.getFullYear() === monthDate.getFullYear() &&
             b.status === 'confirmed';
    }).length;

    monthlyData.push({
      month: monthName,
      sessions: monthSessions,
      hours: monthSessions, // Assuming 1 hour per session
      clients: clients.filter(c => {
        if (!c.lastSession) return false;
        const lastSession = new Date(c.lastSession);
        return lastSession.getMonth() === monthDate.getMonth() && 
               lastSession.getFullYear() === monthDate.getFullYear();
      }).length
    });
  }

  // Session status distribution
  const statusData = [
    { name: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: '#10b981' },
    { name: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: '#f59e0b' },
    { name: 'Completed', value: bookings.filter(b => b.status === 'completed').length, color: '#3b82f6' },
    { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Client activity levels
  const clientActivityData = [
    { 
      name: 'Highly Active', 
      value: clients.filter(c => (c as any).totalSessions >= 10).length,
      color: '#10b981'
    },
    { 
      name: 'Active', 
      value: clients.filter(c => (c as any).totalSessions >= 5 && (c as any).totalSessions < 10).length,
      color: '#3b82f6'
    },
    { 
      name: 'Moderate', 
      value: clients.filter(c => (c as any).totalSessions >= 1 && (c as any).totalSessions < 5).length,
      color: '#f59e0b'
    },
    { 
      name: 'New', 
      value: clients.filter(c => !(c as any).totalSessions || (c as any).totalSessions === 0).length,
      color: '#6b7280'
    },
  ].filter(item => item.value > 0);

  // Weekly breakdown (last 4 weeks)
  const weeklyData = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
    const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000));
    const weekSessions = bookings.filter(b => {
      if (!b.scheduledDate) return false;
      const sessionDate = new Date(b.scheduledDate);
      return sessionDate >= weekStart && sessionDate < weekEnd && b.status === 'confirmed';
    }).length;

    weeklyData.push({
      week: `Week ${4 - i}`,
      sessions: weekSessions,
      avgDuration: weekSessions > 0 ? 60 : 0, // Assuming 60 min average
    });
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Session Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Session Trends (Last 6 Months)
          </CardTitle>
          <CardDescription>Track your coaching session volume over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="sessions" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorSessions)" 
                name="Sessions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Monthly Performance
            </CardTitle>
            <CardDescription>Sessions and active clients by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sessions" fill="#3b82f6" name="Sessions" />
                <Bar dataKey="clients" fill="#10b981" name="Active Clients" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Session Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Session Status
            </CardTitle>
            <CardDescription>Distribution of session statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                No session data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Weekly Activity
            </CardTitle>
            <CardDescription>Session count for the last 4 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Sessions"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Client Activity Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Client Activity Levels
            </CardTitle>
            <CardDescription>Client engagement distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {clientActivityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={clientActivityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" name="Clients">
                    {clientActivityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                No client data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>Key metrics at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
              <p className="text-2xl font-bold text-blue-600">{bookings.filter(b => b.status === 'confirmed').length}</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Clients</p>
              <p className="text-2xl font-bold text-green-600">{clients.filter(c => c.status === 'active').length}</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Sessions/Month</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(monthlyData.reduce((sum, m) => sum + m.sessions, 0) / 6)}
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
              <p className="text-2xl font-bold text-orange-600">
                {bookings.filter(b => b.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
