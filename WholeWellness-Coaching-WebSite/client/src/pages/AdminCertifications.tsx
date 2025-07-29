import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Search, 
  Filter, 
  Download,
  UserCheck,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  FileText
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CertificationEnrollment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'expired' | 'suspended';
  progress: number;
  completedModules: number;
  totalModules: number;
  certificateIssued: boolean;
  certificateId?: string;
}

interface CertificationCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: number;
  creditHours: string;
  price: string;
  isActive: boolean;
  enrollmentCount: number;
  completionRate: number;
}

export default function AdminCertifications() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch certification data
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['/api/admin/certifications/enrollments'],
    queryFn: () => apiRequest('GET', '/api/admin/certifications/enrollments')
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/admin/certifications/courses'],
    queryFn: () => apiRequest('GET', '/api/admin/certifications/courses')
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/certifications/analytics'],
    queryFn: () => apiRequest('GET', '/api/admin/certifications/analytics')
  });

  // Mutations
  const enrollUserMutation = useMutation({
    mutationFn: ({ userId, courseId }: { userId: string; courseId: string }) =>
      apiRequest('POST', '/api/admin/certifications/enroll', { userId, courseId }),
    onSuccess: () => {
      toast({ title: "Success", description: "User enrolled successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/certifications/enrollments'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to enroll user", variant: "destructive" });
    }
  });

  const updateEnrollmentMutation = useMutation({
    mutationFn: ({ enrollmentId, status }: { enrollmentId: string; status: string }) =>
      apiRequest('PATCH', `/api/admin/certifications/enrollments/${enrollmentId}`, { status }),
    onSuccess: () => {
      toast({ title: "Success", description: "Enrollment updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/certifications/enrollments'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update enrollment", variant: "destructive" });
    }
  });

  const issueCertificateMutation = useMutation({
    mutationFn: (enrollmentId: string) =>
      apiRequest('POST', `/api/admin/certifications/issue-certificate/${enrollmentId}`),
    onSuccess: () => {
      toast({ title: "Success", description: "Certificate issued successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/certifications/enrollments'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to issue certificate", variant: "destructive" });
    }
  });

  // Filter enrollments
  const filteredEnrollments = enrollments.filter((enrollment: CertificationEnrollment) => {
    const matchesSearch = enrollment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || enrollment.courseId === courseFilter;
    
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, color: 'bg-blue-500' },
      completed: { variant: 'default' as const, color: 'bg-green-500' },
      expired: { variant: 'destructive' as const, color: 'bg-red-500' },
      suspended: { variant: 'secondary' as const, color: 'bg-gray-500' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <Badge variant={config.variant} className="capitalize">
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (enrollmentsLoading || coursesLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        <span className="ml-2">Loading certifications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certification Management</h1>
          <p className="text-muted-foreground">
            Manage coach certifications, enrollments, and track progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.open('/api/admin/certifications/export', '_blank')}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalEnrollments || 0}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.activeCourses || 0}</div>
            <p className="text-xs text-muted-foreground">Professional programs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.certificatesIssued || 0}</div>
            <p className="text-xs text-muted-foreground">+8% completion rate</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.averageProgress || 0}%</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="enrollments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name, email, or course..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="course">Course</Label>
                  <Select value={courseFilter} onValueChange={setCourseFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses.map((course: CertificationCourse) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enrollments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Details</CardTitle>
              <CardDescription>
                Manage individual coach certifications and track progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coach</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Certificate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.map((enrollment: CertificationEnrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{enrollment.userName}</div>
                          <div className="text-sm text-muted-foreground">{enrollment.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{enrollment.courseTitle}</TableCell>
                      <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getProgressColor(enrollment.progress)}`}
                                style={{ width: `${enrollment.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{enrollment.progress}%</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {enrollment.completedModules}/{enrollment.totalModules} modules
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {enrollment.certificateIssued ? (
                          <Badge variant="default" className="bg-green-500">
                            <Award className="h-3 w-3 mr-1" />
                            Issued
                          </Badge>
                        ) : enrollment.progress >= 100 ? (
                          <Button
                            size="sm"
                            onClick={() => issueCertificateMutation.mutate(enrollment.id)}
                            disabled={issueCertificateMutation.isPending}
                          >
                            Issue Certificate
                          </Button>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {/* View details */}}
                          >
                            <FileText className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {/* Send reminder */}}
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course: CertificationCourse) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge variant={course.isActive ? "default" : "secondary"}>
                      {course.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Level:</span>
                      <span className="capitalize">{course.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{course.duration} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Credit Hours:</span>
                      <span>{course.creditHours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Enrollments:</span>
                      <span>{course.enrollmentCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completion Rate:</span>
                      <span>{course.completionRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Management</CardTitle>
              <CardDescription>
                Manage issued certificates and generate new ones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Certificate System</h3>
                <p className="text-muted-foreground mb-4">
                  Digital certificates are automatically generated upon course completion
                </p>
                <Button>Configure Certificate Templates</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}