import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  Activity, 
  Settings, 
  Shield, 
  LogOut,
  Eye,
  Edit,
  Trash2,
  Download,
  UserPlus,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profileImageUrl?: string;
  lastLogin?: string;
}

interface DashboardMetrics {
  totalUsers: number;
  newUsersThisMonth: number;
  usersByRole: Record<string, number>;
  totalDonations: number;
  donationCount: number;
  pendingDonations: number;
  monthlyRevenue: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
}

interface AdminPermissions {
  hasPermission: boolean;
  userRole: string;
  userPermissions: string[];
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  // Get current admin user
  const { data: adminAuth, isLoading: authLoading } = useQuery({
    queryKey: ['/api/admin/auth/me'],
    retry: false,
  });

  // Get dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ['/api/admin/dashboard/overview'],
    enabled: !!adminAuth?.user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get users data
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: !!adminAuth?.user && activeTab === 'users',
  });

  // Get activity logs
  const { data: activityData } = useQuery({
    queryKey: ['/api/admin/activity'],
    enabled: !!adminAuth?.user && activeTab === 'activity',
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/auth/logout', 'POST'),
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/admin-login';
    },
  });

  // Check permissions
  const checkPermission = (permission: string): boolean => {
    return adminAuth?.permissions?.includes(permission) || false;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!adminAuth?.user) {
    window.location.href = '/admin-login';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  src={adminAuth.user.profileImageUrl || `https://ui-avatars.com/api/?name=${adminAuth.user.firstName}+${adminAuth.user.lastName}`}
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {adminAuth.user.firstName} {adminAuth.user.lastName}
                  </p>
                  <p className="text-gray-500 capitalize">{adminAuth.user.role}</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users" disabled={!checkPermission('view_users')}>
              Users
            </TabsTrigger>
            <TabsTrigger value="donations" disabled={!checkPermission('view_donations')}>
              Donations
            </TabsTrigger>
            <TabsTrigger value="activity" disabled={!checkPermission('view_logs')}>
              Activity
            </TabsTrigger>
            <TabsTrigger value="settings" disabled={!checkPermission('system_settings')}>
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {metricsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {checkPermission('view_users') && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        +{metrics?.newUsersThisMonth || 0} this month
                      </p>
                    </CardContent>
                  </Card>
                )}

                {checkPermission('view_donations') && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(metrics?.totalDonations || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {metrics?.donationCount || 0} donations
                      </p>
                    </CardContent>
                  </Card>
                )}

                {checkPermission('view_bookings') && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Bookings</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics?.totalBookings || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {metrics?.pendingBookings || 0} pending
                      </p>
                    </CardContent>
                  </Card>
                )}

                {checkPermission('view_donations') && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(metrics?.monthlyRevenue || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {metrics?.pendingDonations || 0} pending donations
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {checkPermission('export_users') && (
                    <Button variant="outline" className="justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Users
                    </Button>
                  )}
                  
                  {checkPermission('process_donations') && (
                    <Button variant="outline" className="justify-start">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Process Donations
                    </Button>
                  )}
                  
                  {checkPermission('assign_coaches') && (
                    <Button variant="outline" className="justify-start">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Coaches
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            {(metrics?.pendingDonations || 0) > 5 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-800">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Attention Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-700">
                    You have {metrics?.pendingDonations} pending donations that require processing.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage platform users and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {usersData?.users?.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img
                            src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`}
                            alt="Profile"
                            className="h-10 w-10 rounded-full"
                          />
                          <div>
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant={user.role === 'admin' || user.role === 'super_admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                          
                          <Badge variant={user.isActive ? 'default' : 'destructive'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {checkPermission('edit_users') && (
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Activity Log</CardTitle>
                <CardDescription>
                  Track all administrative actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityData?.logs?.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-gray-500">
                          {log.resource} • {formatDate(log.timestamp)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{log.userId}</p>
                        <p className="text-xs text-gray-500">{log.ipAddress}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure platform settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}