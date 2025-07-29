import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Gift,
  Percent,
  Tag,
  BarChart3,
  AlertCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_access';
  discountValue: number | null;
  maxUses: number | null;
  currentUses: number;
  applicableCourses: string[] | null;
  minimumOrderAmount: number;
  startsAt: string;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

interface CouponStats {
  couponId: string;
  totalRedemptions: number;
  totalDiscountGiven: number;
  averageDiscountPerRedemption: number;
  topCourses: Array<{
    courseId: string;
    title: string;
    redemptions: number;
  }>;
  recentRedemptions: Array<{
    id: string;
    userId: string;
    courseId: string;
    discountAmount: number;
    redeemedAt: string;
  }>;
}

export default function AdminCoupons() {
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [selectedStats, setSelectedStats] = useState<CouponStats | null>(null);
  const [grantAccessDialog, setGrantAccessDialog] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage' as const,
    discountValue: 0,
    maxUses: null as number | null,
    applicableCourses: null as string[] | null,
    minimumOrderAmount: 0,
    startsAt: new Date().toISOString().split('T')[0],
    expiresAt: ''
  });

  const [grantAccess, setGrantAccess] = useState({
    userId: '',
    courseId: '',
    reason: ''
  });

  // Fetch coupons
  const { data: coupons = [], isLoading: couponsLoading } = useQuery({
    queryKey: ['/api/admin/coupons'],
    enabled: isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin')
  });

  // Create coupon mutation
  const createCouponMutation = useMutation({
    mutationFn: (couponData: any) => apiRequest("POST", "/api/admin/coupons", couponData),
    onSuccess: () => {
      toast({
        title: "Coupon Created",
        description: "New coupon has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
      setShowCreateDialog(false);
      setNewCoupon({
        code: '',
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        maxUses: null,
        applicableCourses: null,
        minimumOrderAmount: 0,
        startsAt: new Date().toISOString().split('T')[0],
        expiresAt: ''
      });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create coupon. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete coupon mutation
  const deleteCouponMutation = useMutation({
    mutationFn: (couponId: string) => apiRequest("DELETE", `/api/admin/coupons/${couponId}`),
    onSuccess: () => {
      toast({
        title: "Coupon Deleted",
        description: "Coupon has been deactivated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
    },
    onError: () => {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete coupon. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Grant free access mutation
  const grantAccessMutation = useMutation({
    mutationFn: (grantData: any) => apiRequest("POST", "/api/admin/grant-free-access", grantData),
    onSuccess: () => {
      toast({
        title: "Access Granted",
        description: "Free access has been granted to the user.",
      });
      setGrantAccessDialog(false);
      setGrantAccess({ userId: '', courseId: '', reason: '' });
    },
    onError: () => {
      toast({
        title: "Grant Failed",
        description: "Failed to grant free access. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Fetch coupon stats
  const fetchCouponStats = async (couponId: string) => {
    try {
      const stats = await apiRequest("GET", `/api/admin/coupons/${couponId}/stats`);
      setSelectedStats(stats);
      setShowStatsDialog(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch coupon statistics.",
        variant: "destructive",
      });
    }
  };

  const handleCreateCoupon = () => {
    const couponData = {
      ...newCoupon,
      expiresAt: newCoupon.expiresAt ? new Date(newCoupon.expiresAt).toISOString() : null,
      startsAt: new Date(newCoupon.startsAt).toISOString()
    };
    createCouponMutation.mutate(couponData);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Coupon code copied to clipboard.",
    });
  };

  const getDiscountBadge = (coupon: Coupon) => {
    switch (coupon.discountType) {
      case 'percentage':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Percent className="h-3 w-3 mr-1" />
            {coupon.discountValue}% OFF
          </Badge>
        );
      case 'fixed_amount':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <DollarSign className="h-3 w-3 mr-1" />
            ${coupon.discountValue} OFF
          </Badge>
        );
      case 'free_access':
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Gift className="h-3 w-3 mr-1" />
            FREE ACCESS
          </Badge>
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Admin privileges required to access coupon management.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Coupon Management
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Create and manage discount coupons and free access grants for certification courses.
          </p>
        </div>

        <Tabs defaultValue="coupons" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="coupons">Active Coupons</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="grants">Free Access</TabsTrigger>
          </TabsList>

          {/* Active Coupons Tab */}
          <TabsContent value="coupons" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Coupon
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Coupon</DialogTitle>
                      <DialogDescription>
                        Create a new discount coupon for certification courses.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="code">Coupon Code</Label>
                        <Input
                          id="code"
                          placeholder="e.g., SAVE25"
                          value={newCoupon.code}
                          onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input
                          id="name"
                          placeholder="e.g., 25% Off Spring Sale"
                          value={newCoupon.name}
                          onChange={(e) => setNewCoupon({...newCoupon, name: e.target.value})}
                        />
                      </div>
                      
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe the coupon and its terms"
                          value={newCoupon.description}
                          onChange={(e) => setNewCoupon({...newCoupon, description: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="discountType">Discount Type</Label>
                        <Select 
                          value={newCoupon.discountType} 
                          onValueChange={(value: any) => setNewCoupon({...newCoupon, discountType: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage Off</SelectItem>
                            <SelectItem value="fixed_amount">Fixed Amount Off</SelectItem>
                            <SelectItem value="free_access">Free Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {newCoupon.discountType !== 'free_access' && (
                        <div className="space-y-2">
                          <Label htmlFor="discountValue">
                            {newCoupon.discountType === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                          </Label>
                          <Input
                            id="discountValue"
                            type="number"
                            min="0"
                            max={newCoupon.discountType === 'percentage' ? "100" : undefined}
                            value={newCoupon.discountValue}
                            onChange={(e) => setNewCoupon({...newCoupon, discountValue: parseFloat(e.target.value)})}
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="maxUses">Max Uses (Optional)</Label>
                        <Input
                          id="maxUses"
                          type="number"
                          min="1"
                          placeholder="Unlimited"
                          value={newCoupon.maxUses || ''}
                          onChange={(e) => setNewCoupon({...newCoupon, maxUses: e.target.value ? parseInt(e.target.value) : null})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="minimumOrderAmount">Minimum Order Amount ($)</Label>
                        <Input
                          id="minimumOrderAmount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newCoupon.minimumOrderAmount}
                          onChange={(e) => setNewCoupon({...newCoupon, minimumOrderAmount: parseFloat(e.target.value)})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="startsAt">Start Date</Label>
                        <Input
                          id="startsAt"
                          type="date"
                          value={newCoupon.startsAt}
                          onChange={(e) => setNewCoupon({...newCoupon, startsAt: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
                        <Input
                          id="expiresAt"
                          type="date"
                          value={newCoupon.expiresAt}
                          onChange={(e) => setNewCoupon({...newCoupon, expiresAt: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateCoupon} disabled={createCouponMutation.isPending}>
                        {createCouponMutation.isPending ? "Creating..." : "Create Coupon"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {couponsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : coupons.length > 0 ? (
                coupons.map((coupon: Coupon) => (
                  <Card key={coupon.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                            {coupon.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(coupon.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        {getDiscountBadge(coupon)}
                      </div>
                      
                      <CardTitle className="text-lg">{coupon.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {coupon.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Uses:</span>
                          <div className="font-medium">
                            {coupon.currentUses} / {coupon.maxUses || "∞"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <Badge variant={coupon.isActive ? "default" : "secondary"} className="ml-1">
                            {coupon.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Expires:</span>
                          <div className="font-medium">
                            {coupon.expiresAt 
                              ? new Date(coupon.expiresAt).toLocaleDateString()
                              : "Never"
                            }
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchCouponStats(coupon.id)}
                          className="flex-1"
                        >
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Stats
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCoupon(coupon)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCouponMutation.mutate(coupon.id)}
                          disabled={deleteCouponMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Tag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No coupons created yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Create your first coupon to start offering discounts.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{coupons.length}</div>
                  <p className="text-xs text-muted-foreground">Active coupons</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {coupons.reduce((sum: number, coupon: Coupon) => sum + coupon.currentUses, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Coupon uses</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Estimated Savings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$12,450</div>
                  <p className="text-xs text-muted-foreground">Customer savings</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {coupons.length > 0 
                      ? Math.round((coupons.filter((c: Coupon) => c.isActive).length / coupons.length) * 100)
                      : 0
                    }%
                  </div>
                  <p className="text-xs text-muted-foreground">Coupons active</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Free Access Grants Tab */}
          <TabsContent value="grants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grant Free Access</CardTitle>
                <CardDescription>
                  Manually grant free access to specific users for certification courses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grantUserId">User ID or Email</Label>
                    <Input
                      id="grantUserId"
                      placeholder="user@example.com"
                      value={grantAccess.userId}
                      onChange={(e) => setGrantAccess({...grantAccess, userId: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="grantCourseId">Course</Label>
                    <Select 
                      value={grantAccess.courseId} 
                      onValueChange={(value) => setGrantAccess({...grantAccess, courseId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="course-1">Advanced Wellness Coaching ($799)</SelectItem>
                        <SelectItem value="course-2">Nutrition Coaching ($599)</SelectItem>
                        <SelectItem value="course-3">Relationship Counseling ($1299)</SelectItem>
                        <SelectItem value="course-4">Behavior Modification ($699)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="grantReason">Reason</Label>
                    <Input
                      id="grantReason"
                      placeholder="e.g., Scholarship recipient"
                      value={grantAccess.reason}
                      onChange={(e) => setGrantAccess({...grantAccess, reason: e.target.value})}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={() => grantAccessMutation.mutate(grantAccess)}
                  disabled={!grantAccess.userId || !grantAccess.courseId || grantAccessMutation.isPending}
                  className="w-full"
                >
                  {grantAccessMutation.isPending ? "Granting Access..." : "Grant Free Access"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Coupon Stats Dialog */}
        <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Coupon Statistics</DialogTitle>
              <DialogDescription>
                Detailed analytics for coupon performance and usage.
              </DialogDescription>
            </DialogHeader>
            
            {selectedStats && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Redemptions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedStats.totalRedemptions}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Discount Given</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${selectedStats.totalDiscountGiven}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Average Discount</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${selectedStats.averageDiscountPerRedemption}</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Top Courses</h3>
                  <div className="space-y-2">
                    {selectedStats.topCourses.map((course, index) => (
                      <div key={course.courseId} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <span>{course.title}</span>
                        <Badge>{course.redemptions} redemptions</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}