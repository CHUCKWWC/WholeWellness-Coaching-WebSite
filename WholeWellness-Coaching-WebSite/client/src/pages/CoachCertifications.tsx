import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Award as Certificate, 
  Clock, 
  Users, 
  Star, 
  Play, 
  Search,
  Filter,
  Award,
  CheckCircle,
  Lock,
  DollarSign,
  Calendar,
  Download,
  ExternalLink
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import GoogleDriveCourseFiles from "@/components/GoogleDriveCourseFiles";
import CouponEnrollmentFlow from "@/components/CouponEnrollmentFlow";

export default function CoachCertifications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [showEnrollmentFlow, setShowEnrollmentFlow] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available certification courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/coach/certification-courses"],
    enabled: isAuthenticated
  });

  // Fetch user's current enrollments
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/coach/my-enrollments"],
    enabled: isAuthenticated
  });

  // Fetch user's earned certificates
  const { data: certificates = [], isLoading: certificatesLoading } = useQuery({
    queryKey: ["/api/coach/my-certificates"],
    enabled: isAuthenticated
  });

  // Handle enrollment flow
  const handleEnrollClick = (course: any) => {
    setSelectedCourse(course);
    setShowEnrollmentFlow(true);
  };

  const handleEnrollmentSuccess = (enrollment: any) => {
    // Refresh enrollments data
    queryClient.invalidateQueries({ queryKey: ["/api/coach/my-enrollments"] });
    setShowEnrollmentFlow(false);
    setSelectedCourse(null);
  };

  const handleEnrollmentCancel = () => {
    setShowEnrollmentFlow(false);
    setSelectedCourse(null);
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "wellness", label: "Wellness Coaching" },
    { value: "nutrition", label: "Nutrition & Diet" },
    { value: "relationship", label: "Relationship Counseling" },
    { value: "behavior", label: "Behavior Modification" },
    { value: "mental-health", label: "Mental Health" },
    { value: "fitness", label: "Fitness & Exercise" },
    { value: "ethics", label: "Professional Ethics" },
  ];

  const levels = [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
    { value: "master", label: "Master" },
  ];

  const filteredCourses = courses.filter((course: any) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getEnrollmentStatus = (courseId: string) => {
    return enrollments.find((enrollment: any) => enrollment.courseId === courseId);
  };

  const getCertificate = (courseId: string) => {
    return certificates.find((cert: any) => cert.courseId === courseId);
  };

  const CourseCard = ({ course }: { course: any }) => {
    const enrollment = getEnrollmentStatus(course.id);
    const certificate = getCertificate(course.id);
    
    return (
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <Badge 
              variant="outline" 
              className="mb-2"
              style={{ 
                borderColor: "#0D7377", 
                color: "#0D7377",
                backgroundColor: "#0D737710" 
              }}
            >
              {course.category}
            </Badge>
            <Badge variant="secondary">{course.level}</Badge>
          </div>
          
          {course.courseImageUrl && (
            <img 
              src={course.courseImageUrl} 
              alt={course.title}
              className="w-full h-40 object-cover rounded-md mb-3"
            />
          )}
          
          <CardTitle className="text-lg">{course.title}</CardTitle>
          <CardDescription className="line-clamp-3">
            {course.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration}h</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              <span>{course.creditHours} CE Credits</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>${course.price}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            <span>Instructor: {course.instructorName}</span>
          </div>

          {enrollment && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{enrollment.progress}%</span>
              </div>
              <Progress value={enrollment.progress} className="h-2" />
              <Badge 
                variant={enrollment.status === "completed" ? "default" : "secondary"}
                className="capitalize"
              >
                {enrollment.status.replace("_", " ")}
              </Badge>
            </div>
          )}

          {certificate && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-800 dark:text-green-200">
                  Certified
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Issued: {new Date(certificate.issuedDate).toLocaleDateString()}
                </p>
              </div>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            {!enrollment && !certificate && (
              <Button 
                onClick={() => handleEnrollClick(course)}
                className="flex-1"
                style={{ backgroundColor: "#0D7377" }}
              >
                Enroll - ${course.price}
              </Button>
            )}
            
            {enrollment && enrollment.status !== "completed" && (
              <Button 
                className="flex-1"
                style={{ backgroundColor: "#5E9A62" }}
                onClick={() => {
                  const url = `/module-learning?courseId=${course.id}&enrollmentId=${enrollment.id}`;
                  window.location.href = url;
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                Continue Learning
              </Button>
            )}
            
            {certificate && (
              <Button 
                variant="outline" 
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Certificate
              </Button>
            )}
            
            <Button variant="outline" size="sm">
              Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access certification courses.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show enrollment flow if selected
  if (showEnrollmentFlow && selectedCourse) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Enroll in Course
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Complete your enrollment with payment or coupon code.
            </p>
          </div>
          
          <CouponEnrollmentFlow
            course={selectedCourse}
            onEnrollmentSuccess={handleEnrollmentSuccess}
            onCancel={handleEnrollmentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Certification Courses
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Enhance your skills with professional development courses and earn continuing education credits.
          </p>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse Courses</TabsTrigger>
            <TabsTrigger value="enrolled">My Enrollments</TabsTrigger>  
            <TabsTrigger value="certificates">My Certificates</TabsTrigger>
            <TabsTrigger value="files">Course Files</TabsTrigger>
          </TabsList>

          {/* Browse Courses Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursesLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="h-96 animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-32 bg-gray-200 rounded mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </CardHeader>
                  </Card>
                ))
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No courses found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* My Enrollments Tab */}
          <TabsContent value="enrolled" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollmentsLoading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : enrollments.length > 0 ? (
                enrollments.map((enrollment: any) => {
                  const course = courses.find((c: any) => c.id === enrollment.courseId);
                  return course ? <CourseCard key={enrollment.id} course={course} /> : null;
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No active enrollments
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Browse and enroll in certification courses to get started.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="completed" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificatesLoading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : certificates.length > 0 ? (
                certificates.map((certificate: any) => (
                  <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge 
                          variant="default" 
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          Certified
                        </Badge>
                        <Certificate className="h-6 w-6 text-green-600" />
                      </div>
                      <CardTitle className="text-lg">{certificate.courseTitle}</CardTitle>
                      <CardDescription>
                        Certificate #{certificate.certificateNumber}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Issued:</span>
                          <span>{new Date(certificate.issuedDate).toLocaleDateString()}</span>
                        </div>
                        {certificate.expirationDate && (
                          <div className="flex justify-between">
                            <span>Expires:</span>
                            <span>{new Date(certificate.expirationDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>CE Credits:</span>
                          <span>{certificate.creditHours}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="h-4 w-4 mr-1" />
                          Download PDF
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Certificate className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No certificates earned yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Complete certification courses to earn digital certificates.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* CE Credits Tab */}
          <TabsContent value="credits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Continuing Education Credits Summary</CardTitle>
                <CardDescription>
                  Track your professional development and maintain your certifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {certificates.reduce((sum: number, cert: any) => sum + (cert.creditHours || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total CE Credits Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {new Date().getFullYear()}
                    </div>
                    <div className="text-sm text-gray-600">Current Year</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {certificates.filter((cert: any) => cert.status === "active").length}
                    </div>
                    <div className="text-sm text-gray-600">Active Certifications</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download CE Transcript
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Google Drive Course Files Tab */}
          <TabsContent value="files" className="space-y-6">
            {enrollments.length > 0 ? (
              <div className="space-y-6">
                {enrollments.map((enrollment: any) => {
                  const course = courses.find((c: any) => c.id === enrollment.courseId);
                  return course ? (
                    <GoogleDriveCourseFiles 
                      key={enrollment.courseId}
                      courseId={enrollment.courseId}
                      courseName={course.title}
                    />
                  ) : null;
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No enrolled courses
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Enroll in courses to access Google Drive course materials and files.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}