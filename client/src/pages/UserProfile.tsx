import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  User, 
  Activity, 
  Target, 
  Calendar, 
  TrendingUp, 
  Heart, 
  Brain, 
  Dumbbell,
  Users,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  LineChart,
  Edit,
  Camera,
  Video as VideoIcon,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Globe
} from "lucide-react";
import { SimpleFileUploader } from "@/components/ObjectUploader";
import { MediaGallery } from "@/components/MediaGallery";

export default function UserProfile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'profile' | 'cover' | 'video'>('profile');
  
  // Form state for profile editing
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: user?.location || '',
    websiteUrl: user?.websiteUrl || '',
    facebookUrl: user?.facebookUrl || '',
    twitterUrl: user?.twitterUrl || '',
    instagramUrl: user?.instagramUrl || '',
    linkedinUrl: user?.linkedinUrl || '',
  });

  // Get user's assessment completion status
  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ["/api/assessments/user", user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

  // Get coaching session history
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/coaching/sessions", user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

  // Get progress metrics
  const { data: progressMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/user/progress-metrics", user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      return apiRequest('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      setIsEditMode(false);
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });

  // Profile image mutation
  const updateProfileImageMutation = useMutation({
    mutationFn: async (imageURL: string) => {
      return apiRequest('/api/profile/image', {
        method: 'PUT',
        body: JSON.stringify({ imageURL }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: 'Profile image updated',
        description: 'Your profile image has been updated successfully.',
      });
      setUploadDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to update profile image',
        variant: 'destructive',
      });
    },
  });

  // Cover photo mutation
  const updateCoverPhotoMutation = useMutation({
    mutationFn: async (imageURL: string) => {
      return apiRequest('/api/profile/cover', {
        method: 'PUT',
        body: JSON.stringify({ imageURL }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: 'Cover photo updated',
        description: 'Your cover photo has been updated successfully.',
      });
      setUploadDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to update cover photo',
        variant: 'destructive',
      });
    },
  });

  // Intro video mutation
  const updateIntroVideoMutation = useMutation({
    mutationFn: async (videoURL: string) => {
      return apiRequest('/api/profile/video', {
        method: 'PUT',
        body: JSON.stringify({ videoURL }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: 'Intro video updated',
        description: 'Your intro video has been updated successfully.',
      });
      setUploadDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to update intro video',
        variant: 'destructive',
      });
    },
  });

  // Handle file upload completion
  const handleUploadComplete = (uploadURL: string, fileName: string, fileSize: number, mimeType: string) => {
    switch (uploadType) {
      case 'profile':
        updateProfileImageMutation.mutate(uploadURL);
        break;
      case 'cover':
        updateCoverPhotoMutation.mutate(uploadURL);
        break;
      case 'video':
        updateIntroVideoMutation.mutate(uploadURL);
        break;
    }
  };

  // Handle profile save
  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  // Open upload dialog
  const openUpload = (type: 'profile' | 'cover' | 'video') => {
    setUploadType(type);
    setUploadDialogOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access your profile and progress tracking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => window.location.href = '/api/login'}
            >
              Log In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt={`${user.firstName || ''} ${user.lastName || ''}`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-2xl">
                    Welcome back, {user?.firstName ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}` : user?.email?.split('@')[0] || 'Member'}!
                  </CardTitle>
                  <CardDescription>
                    Track your wellness journey and view your progress across all coaching areas.
                  </CardDescription>
                  {user?.email && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {user.email}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
            <TabsTrigger value="assessments" data-testid="tab-assessments">Assessments</TabsTrigger>
            <TabsTrigger value="coaching" data-testid="tab-coaching">Coaching History</TabsTrigger>
            <TabsTrigger value="progress" data-testid="tab-progress">Progress Tracking</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assessments Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assessments.length}</div>
                  <p className="text-xs text-muted-foreground">Profile insights available</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Coaching Sessions</CardTitle>
                  <Activity className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sessions.length}</div>
                  <p className="text-xs text-muted-foreground">AI & Human coaching</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                  <Target className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Streak Days</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">Days active</p>
                </CardContent>
              </Card>
            </div>

            {/* Wellness Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Wellness Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Overall Wellness</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">↗</div>
                        <div className="text-xs text-gray-600">Improving</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">7.8</div>
                        <div className="text-xs text-gray-600">Score /10</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="text-sm">
                        <span className="font-medium">Weight Loss Assessment</span>
                        <span className="text-gray-500 ml-2">2 days ago</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="text-sm">
                        <span className="font-medium">AI Coaching Session</span>
                        <span className="text-gray-500 ml-2">3 days ago</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="text-sm">
                        <span className="font-medium">Relationship Assessment</span>
                        <span className="text-gray-500 ml-2">1 week ago</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Edit Mode Toggle */}
            <div className="flex justify-end gap-2">
              {isEditMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditMode(false)}
                    data-testid="button-cancel-edit"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditMode(true)} data-testid="button-edit-profile">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Cover Photo */}
            <Card>
              <div className="relative h-48 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg overflow-hidden">
                {user?.coverPhotoUrl && (
                  <img
                    src={user.coverPhotoUrl}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                )}
                {isEditMode && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      onClick={() => openUpload('cover')}
                      data-testid="button-upload-cover"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Change Cover Photo
                    </Button>
                  </div>
                )}
              </div>
              <CardContent className="pt-16">
                <div className="flex flex-col md:flex-row gap-6 -mt-24">
                  {/* Profile Picture */}
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden">
                      {user?.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt={`${user.firstName || ''} ${user.lastName || ''}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary flex items-center justify-center">
                          <User className="w-16 h-16 text-white" />
                        </div>
                      )}
                    </div>
                    {isEditMode && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-0 right-0"
                        onClick={() => openUpload('profile')}
                        data-testid="button-upload-profile"
                      >
                        <Camera className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    {isEditMode ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              data-testid="input-first-name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              data-testid="input-last-name"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                            rows={4}
                            data-testid="input-bio"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              data-testid="input-phone"
                            />
                          </div>
                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                              placeholder="City, State"
                              data-testid="input-location"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-2xl font-bold">
                          {user?.firstName ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}` : user?.email?.split('@')[0] || 'Member'}
                        </h2>
                        <p className="text-muted-foreground">{user?.email}</p>
                        {user?.bio && (
                          <p className="mt-4 text-gray-700">{user.bio}</p>
                        )}
                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {user?.phone && (
                            <span>📞 {user.phone}</span>
                          )}
                          {user?.location && (
                            <span>📍 {user.location}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Intro Video */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <VideoIcon className="h-5 w-5" />
                    Intro Video
                  </span>
                  {isEditMode && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openUpload('video')}
                      data-testid="button-upload-video"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Video
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Share a short video introducing yourself
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user?.introVideoUrl ? (
                  <video
                    src={user.introVideoUrl}
                    controls
                    className="w-full rounded-lg"
                    data-testid="video-intro"
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <VideoIcon className="h-12 w-12 mx-auto mb-2" />
                      <p>No intro video uploaded yet</p>
                      {isEditMode && (
                        <Button
                          className="mt-4"
                          onClick={() => openUpload('video')}
                          data-testid="button-add-video"
                        >
                          Add Intro Video
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>
                  Connect your social media profiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditMode ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <Input
                        placeholder="Website URL"
                        value={formData.websiteUrl}
                        onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                        data-testid="input-website"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Facebook className="h-5 w-5 text-blue-600" />
                      <Input
                        placeholder="Facebook URL"
                        value={formData.facebookUrl}
                        onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                        data-testid="input-facebook"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Twitter className="h-5 w-5 text-sky-500" />
                      <Input
                        placeholder="Twitter URL"
                        value={formData.twitterUrl}
                        onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                        data-testid="input-twitter"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Instagram className="h-5 w-5 text-pink-600" />
                      <Input
                        placeholder="Instagram URL"
                        value={formData.instagramUrl}
                        onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                        data-testid="input-instagram"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-5 w-5 text-blue-700" />
                      <Input
                        placeholder="LinkedIn URL"
                        value={formData.linkedinUrl}
                        onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                        data-testid="input-linkedin"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {user?.websiteUrl && (
                      <a
                        href={user.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                        data-testid="link-website"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                    {user?.facebookUrl && (
                      <a
                        href={user.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                        data-testid="link-facebook"
                      >
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </a>
                    )}
                    {user?.twitterUrl && (
                      <a
                        href={user.twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sky-500 hover:underline"
                        data-testid="link-twitter"
                      >
                        <Twitter className="h-4 w-4" />
                        Twitter
                      </a>
                    )}
                    {user?.instagramUrl && (
                      <a
                        href={user.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-pink-600 hover:underline"
                        data-testid="link-instagram"
                      >
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </a>
                    )}
                    {user?.linkedinUrl && (
                      <a
                        href={user.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-700 hover:underline"
                        data-testid="link-linkedin"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </a>
                    )}
                    {!user?.websiteUrl && !user?.facebookUrl && !user?.twitterUrl && !user?.instagramUrl && !user?.linkedinUrl && (
                      <p className="text-muted-foreground">No social links added yet</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Media Gallery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  My Media
                </CardTitle>
                <CardDescription>
                  Your uploaded photos, videos, and documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MediaGallery editable={isEditMode} showAddButton={isEditMode} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Assessment History</CardTitle>
                <CardDescription>
                  View your completed assessments and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assessmentsLoading ? (
                  <div className="text-center py-8">Loading assessments...</div>
                ) : assessments.length > 0 ? (
                  <div className="space-y-4">
                    {assessments.map((assessment: any) => (
                      <div key={assessment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{assessment.assessmentType?.displayName}</h4>
                            <p className="text-sm text-gray-600">
                              Completed {new Date(assessment.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No assessments completed yet. <a href="/assessments" className="text-primary hover:underline">Take your first assessment</a>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coaching History Tab */}
          <TabsContent value="coaching" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    AI Coaching Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Sessions</span>
                      <Badge variant="secondary">8 sessions</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Favorite Coach</span>
                      <span className="text-sm font-medium">Weight Loss Coach</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Session</span>
                      <span className="text-sm text-gray-600">2 days ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    Human Coaching Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Sessions</span>
                      <Badge variant="secondary">3 sessions</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Assigned Coach</span>
                      <span className="text-sm font-medium">Sarah Johnson</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Next Session</span>
                      <span className="text-sm text-green-600">Tomorrow 2PM</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Progress Tracking Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    Health Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Weight Goal</span>
                        <span>70%</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Fitness Level</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Nutrition</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-pink-500" />
                    Relationship Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Communication</span>
                        <span>80%</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Trust Building</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Conflict Resolution</span>
                        <span>55%</span>
                      </div>
                      <Progress value={55} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-green-500" />
                    Mental Wellness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Stress Management</span>
                        <span>72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Mindfulness</span>
                        <span>60%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Life Balance</span>
                        <span>78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Goals Section */}
            <Card>
              <CardHeader>
                <CardTitle>Active Goals</CardTitle>
                <CardDescription>Track your progress on current wellness goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Dumbbell className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-medium">Lose 15 pounds</h4>
                        <p className="text-sm text-gray-600">Target: March 2025</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">70% Complete</div>
                      <Progress value={70} className="w-20 h-2 mt-1" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-pink-600" />
                      <div>
                        <h4 className="font-medium">Improve relationship communication</h4>
                        <p className="text-sm text-gray-600">Target: Ongoing</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">45% Complete</div>
                      <Progress value={45} className="w-20 h-2 mt-1" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Daily mindfulness practice</h4>
                        <p className="text-sm text-gray-600">Target: Daily habit</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">60% Complete</div>
                      <Progress value={60} className="w-20 h-2 mt-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent data-testid="dialog-upload">
            <DialogHeader>
              <DialogTitle>
                Upload {uploadType === 'profile' ? 'Profile Image' : uploadType === 'cover' ? 'Cover Photo' : 'Intro Video'}
              </DialogTitle>
              <DialogDescription>
                Select a file to upload. Maximum file size: 50MB.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <SimpleFileUploader
                onUploadComplete={handleUploadComplete}
                accept={uploadType === 'video' ? 'video/*' : 'image/*'}
                buttonText="Choose File"
                disabled={
                  updateProfileImageMutation.isPending ||
                  updateCoverPhotoMutation.isPending ||
                  updateIntroVideoMutation.isPending
                }
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
                data-testid="button-cancel-upload"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}