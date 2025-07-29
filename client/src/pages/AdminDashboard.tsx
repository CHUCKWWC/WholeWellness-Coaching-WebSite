import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Heart, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  UserPlus,
  Settings,
  Bell,
  BookOpen,
  MessageSquare,
  Shield,
  Activity,
  ChevronRight,
  Download,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

interface AdminSession {
  id: string;
  userId: string;
  sessionToken: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalDonations: number;
  totalBookings: number;
  activeCoaches: number;
  monthlyRevenue: number;
  newUsersToday: number;
  pendingBookings: number;
  completedSessions: number;
  totalCourseEnrollments: number;
  activeCourseEnrollments: number;
  courseRevenue: number;
  totalCouponsUsed: number;
  averageCourseCompletion: number;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  membershipLevel: string;
  donationTotal: number;
  rewardPoints: number;
  isActive: boolean;
  joinDate: string;
  lastLogin: string;
}

interface Donation {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  donationType: string;
  status: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Booking {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  coachingArea: string;
  message: string;
  status: string;
  scheduledDate: string;
  createdAt: string;
}

interface Coach {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  specialties: string[];
  status: string;
  isVerified: boolean;
  hourlyRate: number;
  totalClients: number;
  createdAt: string;
}

interface ActivityLog {
  id: number;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  timestamp: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  enrollmentDate: string;
  paymentStatus: string;
  paymentAmount: number;
  couponUsed?: string;
  progress: number;
  completionDate?: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface PaymentTransaction {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentIntentId: string;
  status: string;
  couponCode?: string;
  discountAmount?: number;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Coupon {
  id: string;
  code: string;
  name: string;
  discountType: string;
  discountValue: number;
  currentUses: number;
  maxUses?: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch all donations
  const { data: donations, isLoading: donationsLoading } = useQuery<Donation[]>({
    queryKey: ["/api/admin/donations"],
  });

  // Fetch all bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings"],
  });

  // Fetch all coaches
  const { data: coaches, isLoading: coachesLoading } = useQuery<Coach[]>({
    queryKey: ["/api/admin/coaches"],
  });

  // Fetch activity logs
  const { data: activityLogs, isLoading: activityLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/admin/activity"],
  });

  // Fetch course enrollments
  const { data: courseEnrollments, isLoading: enrollmentsLoading } = useQuery<CourseEnrollment[]>({
    queryKey: ["/api/admin/course-enrollments"],
  });

  // Fetch payment transactions
  const { data: paymentTransactions, isLoading: paymentsLoading } = useQuery<PaymentTransaction[]>({
    queryKey: ["/api/admin/payments"],
  });

  // Fetch coupons
  const { data: coupons, isLoading: couponsLoading } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons"],
  });

  // Fetch admin sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery<AdminSession[]>({
    queryKey: ["/api/admin/sessions"],
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User updated successfully",
        description: "The user information has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/bookings/${bookingId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({
        title: "Booking updated successfully",
        description: "The booking status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating booking",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Approve coach mutation
  const approveCoachMutation = useMutation({
    mutationFn: async ({ coachId, approved }: { coachId: number; approved: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/coaches/${coachId}`, { 
        status: approved ? "approved" : "rejected" 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coaches"] });
      toast({
        title: "Coach status updated",
        description: "The coach application has been processed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating coach",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Terminate session mutation
  const terminateSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/sessions/${sessionId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sessions"] });
      toast({
        title: "Session terminated",
        description: "The admin session has been terminated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error terminating session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users?.filter(user => 
    (statusFilter === "all" || user.membershipLevel === statusFilter) &&
    (searchTerm === "" || 
     user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredBookings = bookings?.filter(booking => 
    (statusFilter === "all" || booking.status === statusFilter) &&
    (searchTerm === "" || 
     booking.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     booking.coachingArea.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const StatCard = ({ title, value, icon: Icon, description, trend }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-xs text-green-500">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your WholeWellness platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Users" 
            value={stats?.totalUsers || 0} 
            icon={Users}
            description="Registered platform users"
            trend="+12% from last month"
          />
          <StatCard 
            title="Course Revenue" 
            value={`$${stats?.courseRevenue || 0}`} 
            icon={DollarSign}
            description="Course enrollment revenue"
            trend="+25% from last month"
          />
          <StatCard 
            title="Active Enrollments" 
            value={stats?.activeCourseEnrollments || 0} 
            icon={BookOpen}
            description="Current course enrollments"
            trend="+18% from last month"
          />
          <StatCard 
            title="Course Completion" 
            value={`${stats?.averageCourseCompletion || 0}%`} 
            icon={CheckCircle}
            description="Average completion rate"
            trend="+5% from last month"
          />
          <StatCard 
            title="Total Donations" 
            value={`$${stats?.totalDonations || 0}`} 
            icon={Heart}
            description="All-time donations"
            trend="+8% from last month"
          />
          <StatCard 
            title="Active Coaches" 
            value={stats?.activeCoaches || 0} 
            icon={Users}
            description="Verified coaches"
            trend="+3 new this month"
          />
          <StatCard 
            title="Coupons Used" 
            value={stats?.totalCouponsUsed || 0} 
            icon={TrendingUp}
            description="Total coupon redemptions"
            trend="+15% from last month"
          />
          <StatCard 
            title="Pending Bookings" 
            value={stats?.pendingBookings || 0} 
            icon={Calendar}
            description="Awaiting confirmation"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="coaches">Coaches</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest platform activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityLogs?.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-gray-500">
                            {log.user?.firstName} {log.user?.lastName} • {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("courses")}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Manage Courses
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("coupons")}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Create Coupon
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("payments")}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      View Payments
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("content")}>
                      <Edit className="h-4 w-4 mr-2" />
                      Manage Content
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add New User
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Course Enrollment Management</CardTitle>
                <CardDescription>Monitor and manage course enrollments and progress</CardDescription>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search enrollments..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Enrollments</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Enrolled</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courseEnrollments?.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{enrollment.user.firstName} {enrollment.user.lastName}</div>
                              <div className="text-sm text-gray-500">{enrollment.user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{enrollment.courseName}</div>
                            {enrollment.couponUsed && (
                              <div className="text-xs text-green-600">Coupon: {enrollment.couponUsed}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{width: `${enrollment.progress}%`}}
                                ></div>
                              </div>
                              <span className="text-sm">{enrollment.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                enrollment.paymentStatus === "succeeded" ? "default" :
                                enrollment.paymentStatus === "pending" ? "secondary" :
                                "destructive"
                              }
                            >
                              {enrollment.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>${enrollment.paymentAmount}</TableCell>
                          <TableCell>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Management</CardTitle>
                <CardDescription>Monitor all payment transactions and revenue</CardDescription>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search payments..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="succeeded">Succeeded</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Coupon</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentTransactions?.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{payment.user.firstName} {payment.user.lastName}</div>
                              <div className="text-sm text-gray-500">{payment.user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>Course #{payment.courseId}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">${payment.amount} {payment.currency}</div>
                              {payment.discountAmount && (
                                <div className="text-xs text-green-600">-${payment.discountAmount} discount</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{payment.paymentMethod}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                payment.status === "succeeded" ? "default" :
                                payment.status === "pending" ? "secondary" :
                                payment.status === "failed" ? "destructive" :
                                "outline"
                              }
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {payment.couponCode ? (
                              <Badge variant="outline" className="text-green-600">{payment.couponCode}</Badge>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </TableCell>
                          <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coupons">
            <Card>
              <CardHeader>
                <CardTitle>Coupon Management</CardTitle>
                <CardDescription>Create and manage discount coupons</CardDescription>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Search coupons..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Coupons</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => window.location.href = '/admin-coupons'}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Coupon
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coupons?.map((coupon) => (
                        <TableRow key={coupon.id}>
                          <TableCell>
                            <div className="font-mono font-medium">{coupon.code}</div>
                          </TableCell>
                          <TableCell>{coupon.name}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                coupon.discountType === "percentage" ? "default" :
                                coupon.discountType === "fixed_amount" ? "secondary" :
                                "outline"
                              }
                            >
                              {coupon.discountType === "percentage" ? `${coupon.discountValue}%` :
                               coupon.discountType === "fixed_amount" ? `$${coupon.discountValue}` :
                               "FREE"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {coupon.currentUses}
                              {coupon.maxUses && ` / ${coupon.maxUses}`}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={coupon.isActive ? "default" : "secondary"}>
                              {coupon.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "No expiry"}
                          </TableCell>
                          <TableCell>{new Date(coupon.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Website Content Management</CardTitle>
                  <CardDescription>Manage pages, content blocks, and site settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Homepage Content</h4>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">Hero section, mission statement, featured content</p>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        Last updated: 2 days ago
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">About Page</h4>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">Company story, team information, values</p>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        Last updated: 1 week ago
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Services & Programs</h4>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">Service descriptions, pricing, program details</p>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <AlertTriangle className="h-3 w-3 mr-1 text-yellow-500" />
                        Needs update: 2 weeks ago
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Blog & Resources</h4>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">Blog posts, wellness resources, guides</p>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        Last updated: 3 days ago
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Site Configuration</CardTitle>
                  <CardDescription>Global settings and system configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Navigation Menu</h4>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">Main navigation, footer links, menu structure</p>
                      <Badge variant="default" className="mt-2">8 menu items</Badge>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Site Settings</h4>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">SEO settings, contact info, social media links</p>
                      <Badge variant="default" className="mt-2">Configured</Badge>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Email Templates</h4>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">Welcome emails, booking confirmations, notifications</p>
                      <Badge variant="secondary" className="mt-2">12 templates</Badge>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Payment Settings</h4>
                        <Button variant="outline" size="sm">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">Stripe configuration, pricing, payment methods</p>
                      <Badge variant="default" className="mt-2">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Live Mode
                      </Badge>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">AI & Automation</h4>
                        <Button variant="outline" size="sm">
                          <Activity className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">AI coach settings, automated responses, integrations</p>
                      <Badge variant="default" className="mt-2">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Content Actions</CardTitle>
                <CardDescription>Common content management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button className="h-20 flex-col" variant="outline">
                    <BookOpen className="h-6 w-6 mb-2" />
                    <span>Create Page</span>
                  </Button>
                  <Button className="h-20 flex-col" variant="outline">
                    <Edit className="h-6 w-6 mb-2" />
                    <span>Edit Content</span>
                  </Button>
                  <Button className="h-20 flex-col" variant="outline">
                    <MessageSquare className="h-6 w-6 mb-2" />
                    <span>Add Blog Post</span>
                  </Button>
                  <Button className="h-20 flex-col" variant="outline">
                    <Settings className="h-6 w-6 mb-2" />
                    <span>Site Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and their permissions</CardDescription>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search users..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="free">Free Members</SelectItem>
                      <SelectItem value="supporter">Supporters</SelectItem>
                      <SelectItem value="champion">Champions</SelectItem>
                      <SelectItem value="guardian">Guardians</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Membership</TableHead>
                        <TableHead>Donations</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.firstName} {user.lastName}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.membershipLevel === "free" ? "secondary" : "default"}>
                              {user.membershipLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>${user.donationTotal}</TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? "default" : "destructive"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>Manage coaching session bookings</CardDescription>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search bookings..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Bookings</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Coaching Area</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Scheduled</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings?.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{booking.fullName}</div>
                              <div className="text-sm text-gray-500">{booking.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{booking.coachingArea}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                booking.status === "confirmed" ? "default" :
                                booking.status === "pending" ? "secondary" :
                                booking.status === "completed" ? "default" :
                                "destructive"
                              }
                            >
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : "Not scheduled"}
                          </TableCell>
                          <TableCell>{new Date(booking.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateBookingMutation.mutate({ bookingId: booking.id, status: "confirmed" })}
                                disabled={booking.status === "confirmed"}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateBookingMutation.mutate({ bookingId: booking.id, status: "cancelled" })}
                                disabled={booking.status === "cancelled"}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <CardTitle>Donation Management</CardTitle>
                <CardDescription>Monitor and manage donations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Donor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donations?.map((donation) => (
                        <TableRow key={donation.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {donation.user?.firstName} {donation.user?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{donation.user?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>${donation.amount} {donation.currency}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{donation.donationType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                donation.status === "completed" ? "default" :
                                donation.status === "pending" ? "secondary" :
                                "destructive"
                              }
                            >
                              {donation.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(donation.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coaches">
            <Card>
              <CardHeader>
                <CardTitle>Coach Management</CardTitle>
                <CardDescription>Manage coach applications and approvals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Coach</TableHead>
                        <TableHead>Specialties</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Clients</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coaches?.map((coach) => (
                        <TableRow key={coach.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{coach.firstName} {coach.lastName}</div>
                              <div className="text-sm text-gray-500">{coach.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {coach.specialties.map((specialty, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                coach.status === "approved" ? "default" :
                                coach.status === "pending" ? "secondary" :
                                "destructive"
                              }
                            >
                              {coach.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{coach.totalClients}</TableCell>
                          <TableCell>${coach.hourlyRate}/hr</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => approveCoachMutation.mutate({ coachId: coach.id, approved: true })}
                                disabled={coach.status === "approved"}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => approveCoachMutation.mutate({ coachId: coach.id, approved: false })}
                                disabled={coach.status === "rejected"}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Monitor all platform activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityLogs?.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {log.user?.firstName} {log.user?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{log.user?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell>{log.resource}</TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate text-sm text-gray-500">
                              {JSON.stringify(log.details)}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log & Analytics</CardTitle>
                <CardDescription>Monitor all platform activities and generate insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {activityLogs?.slice(0, 10).map((log) => (
                          <div key={log.id} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{log.action}</Badge>
                                <span className="text-sm text-gray-500">{log.resource}</span>
                              </div>
                              <p className="text-sm font-medium mt-1">
                                {log.user?.firstName} {log.user?.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(log.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Database Status</span>
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Healthy
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Payment System</span>
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Operational
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Course Delivery</span>
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Coupon System</span>
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Running
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityLogs?.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {log.user?.firstName} {log.user?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{log.user?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell>{log.resource}</TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate text-sm text-gray-500">
                              {JSON.stringify(log.details)}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}