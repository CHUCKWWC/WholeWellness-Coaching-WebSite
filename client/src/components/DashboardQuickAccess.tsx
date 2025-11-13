import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  TrendingUp,
  Calendar,
  MessageCircle,
  ArrowRight
} from 'lucide-react';

export default function DashboardQuickAccess() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  // Determine dashboard link and description based on role
  const getDashboardInfo = () => {
    switch (user.role) {
      case 'coach':
        return {
          href: '/coach-dashboard',
          title: 'Coach Dashboard',
          description: 'Manage your clients, sessions, and schedule',
          icon: Users,
          stats: [
            { label: 'Upcoming Sessions', value: '—', href: '/coach/schedule' },
            { label: 'Active Clients', value: '—', href: '/coach/clients' },
          ],
          quickActions: [
            { label: 'Start Video Session', href: '/coach-dashboard', icon: MessageCircle },
            { label: 'View Schedule', href: '/coach/schedule', icon: Calendar },
          ]
        };
      case 'admin':
      case 'super_admin':
        return {
          href: '/admin-dashboard',
          title: 'Admin Dashboard',
          description: 'Platform management and oversight',
          icon: Shield,
          stats: [
            { label: 'Total Users', value: '—', href: '/admin-dashboard' },
            { label: 'Active Coaches', value: '—', href: '/admin-dashboard' },
          ],
          quickActions: [
            { label: 'User Management', href: '/admin-dashboard', icon: Users },
            { label: 'Security Settings', href: '/admin-security', icon: Shield },
          ]
        };
      default:
        return {
          href: '/member-dashboard',
          title: 'My Dashboard',
          description: 'Track your progress and access your wellness tools',
          icon: TrendingUp,
          stats: [
            { label: 'Active Journey', value: '—', href: '/wellness-journey' },
            { label: 'Upcoming Sessions', value: '—', href: '/booking' },
          ],
          quickActions: [
            { label: 'AI Coaching', href: '/ai-coaching', icon: MessageCircle },
            { label: 'Book Session', href: '/booking', icon: Calendar },
          ]
        };
    }
  };

  const dashboardInfo = getDashboardInfo();
  const Icon = dashboardInfo.icon;

  return (
    <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600 dark:bg-purple-500 rounded-lg">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{dashboardInfo.title}</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {dashboardInfo.description}
              </CardDescription>
            </div>
          </div>
          <Link href={dashboardInfo.href}>
            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
              data-testid="button-dashboard"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {dashboardInfo.stats.map((stat, index) => (
            <Link key={index} href={stat.href}>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors cursor-pointer">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 flex-wrap">
          {dashboardInfo.quickActions.map((action, index) => {
            const ActionIcon = action.icon;
            return (
              <Link key={index} href={action.href}>
                <Button 
                  variant="outline" 
                  className="border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  data-testid={`button-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <ActionIcon className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
