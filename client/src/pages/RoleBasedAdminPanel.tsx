import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search, UserCheck, UserX, Crown, Shield, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { AdminOnlyContent, RoleBadge } from "@/components/RoleBasedAccess";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  membershipLevel: string;
  packageType?: string;
  coachingSpecialty?: string;
  approvalStatus: string;
  isActive: boolean;
  createdAt: string;
}

interface ContentResource {
  id: string;
  title: string;
  slug: string;
  contentType: string;
  visibility: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export default function RoleBasedAdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      return response.json();
    },
  });

  // Fetch content resources
  const { data: contentResources = [], isLoading: contentLoading } = useQuery({
    queryKey: ["/api/admin/content-resources"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/content-resources");
      return response.json();
    },
  });

  // User management mutations
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "User updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  // Content visibility mutations
  const updateContentMutation = useMutation({
    mutationFn: async ({ contentId, updates }: { contentId: string; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/content-resources/${contentId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Content updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content-resources"] });
    },
    onError: () => {
      toast({ title: "Failed to update content", variant: "destructive" });
    },
  });

  // Filter users
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    updateUserMutation.mutate({
      userId,
      updates: { role: newRole }
    });
  };

  const handleApprovalStatusChange = (userId: string, status: string) => {
    updateUserMutation.mutate({
      userId,
      updates: { approvalStatus: status }
    });
  };

  const handleUserActivation = (userId: string, isActive: boolean) => {
    updateUserMutation.mutate({
      userId,
      updates: { isActive }
    });
  };

  const handleContentVisibilityChange = (contentId: string, visibility: string) => {
    updateContentMutation.mutate({
      contentId,
      updates: { visibility }
    });
  };

  const handleContentActivation = (contentId: string, isActive: boolean) => {
    updateContentMutation.mutate({
      contentId,
      updates: { isActive }
    });
  };

  return (
    <AdminOnlyContent>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Role-Based Access Management</h1>
            <p className="text-gray-600 mt-2">
              Manage user roles, permissions, and content visibility across the platform.
            </p>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="content">Content Visibility</TabsTrigger>
              <TabsTrigger value="analytics">Role Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Manage user roles, approval status, and account access.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search and filter controls */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <Label htmlFor="search">Search Users</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="search"
                          placeholder="Search by name or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="role-filter">Filter by Role</Label>
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="client_free">Free Clients</SelectItem>
                          <SelectItem value="client_paid">Paid Clients</SelectItem>
                          <SelectItem value="coach">Coaches</SelectItem>
                          <SelectItem value="admin">Administrators</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Users table */}
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Package/Specialty</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user: User) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <RoleBadge role={user.role} />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Badge variant={user.isActive ? "default" : "secondary"}>
                                  {user.isActive ? "Active" : "Inactive"}
                                </Badge>
                                {user.role === "coach" && (
                                  <Badge 
                                    variant={
                                      user.approvalStatus === "approved" ? "default" :
                                      user.approvalStatus === "pending" ? "secondary" : "destructive"
                                    }
                                  >
                                    {user.approvalStatus}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {user.packageType && (
                                  <div>Package: {user.packageType}</div>
                                )}
                                {user.coachingSpecialty && (
                                  <div>Specialty: {user.coachingSpecialty}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-2">
                                <Select
                                  value={user.role}
                                  onValueChange={(value) => handleRoleChange(user.id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="client_free">Free Client</SelectItem>
                                    <SelectItem value="client_paid">Paid Client</SelectItem>
                                    <SelectItem value="coach">Coach</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                {user.role === "coach" && (
                                  <Select
                                    value={user.approvalStatus}
                                    onValueChange={(value) => handleApprovalStatusChange(user.id, value)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="approved">Approved</SelectItem>
                                      <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                                
                                <Switch
                                  checked={user.isActive}
                                  onCheckedChange={(checked) => handleUserActivation(user.id, checked)}
                                />
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

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Content Visibility Management
                  </CardTitle>
                  <CardDescription>
                    Control which content is visible to different user roles.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Content</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Current Visibility</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contentResources.map((content: ContentResource) => (
                          <TableRow key={content.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{content.title}</div>
                                <div className="text-sm text-gray-500">/{content.slug}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{content.contentType}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                content.visibility === "public" ? "default" :
                                content.visibility === "admin" ? "destructive" : "secondary"
                              }>
                                {content.visibility}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={content.isActive ? "default" : "secondary"}>
                                {content.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-2">
                                <Select
                                  value={content.visibility}
                                  onValueChange={(value) => handleContentVisibilityChange(content.id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="client_free">Free Clients</SelectItem>
                                    <SelectItem value="client_paid">Paid Clients</SelectItem>
                                    <SelectItem value="coach">Coaches</SelectItem>
                                    <SelectItem value="admin">Admin Only</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                <Switch
                                  checked={content.isActive}
                                  onCheckedChange={(checked) => handleContentActivation(content.id, checked)}
                                />
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

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Free Clients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {users.filter((u: User) => u.role === "client_free").length}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Paid Clients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {users.filter((u: User) => u.role === "client_paid").length}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Active Coaches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {users.filter((u: User) => u.role === "coach" && u.approvalStatus === "approved").length}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Pending Coaches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {users.filter((u: User) => u.role === "coach" && u.approvalStatus === "pending").length}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminOnlyContent>
  );
}