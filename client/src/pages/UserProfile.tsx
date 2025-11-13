import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  User, 
  Camera,
  Video as VideoIcon,
  Save,
  X,
  Upload,
  CheckCircle,
  Loader2,
  AlertCircle
} from "lucide-react";
import { SimpleFileUploader } from "@/components/ObjectUploader";
import { Link } from "wouter";

// Profile form schema matching backend validation
const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  bio: z.string().max(200, "Bio must be 200 characters or less").optional(),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits").optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  websiteUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
  facebookUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
  twitterUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
  instagramUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
  linkedinUrl: z.string().url("Invalid URL").optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function UserProfile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'profile' | 'cover' | 'video'>('profile');
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('basic');

  // Initialize form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      phone: user?.phone || '',
      location: user?.location || '',
      websiteUrl: (user as any)?.website || '',
      facebookUrl: (user as any)?.socialLinks?.facebook || '',
      twitterUrl: (user as any)?.socialLinks?.twitter || '',
      instagramUrl: (user as any)?.socialLinks?.instagram || '',
      linkedinUrl: (user as any)?.socialLinks?.linkedin || '',
    },
  });

  // Sync form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || '',
        websiteUrl: (user as any).website || '',
        facebookUrl: (user as any).socialLinks?.facebook || '',
        twitterUrl: (user as any).socialLinks?.twitter || '',
        instagramUrl: (user as any).socialLinks?.instagram || '',
        linkedinUrl: (user as any).socialLinks?.linkedin || '',
      });
    }
  }, [user, form]);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ProfileFormValues>) => {
      return apiRequest('PUT', '/api/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      form.reset(form.getValues()); // Reset dirty state
      toast({
        title: 'Success!',
        description: 'Your profile has been updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Profile image mutation
  const updateProfileImageMutation = useMutation({
    mutationFn: async (imageURL: string) => {
      return apiRequest('PUT', '/api/profile/image', { imageURL });
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
      return apiRequest('PUT', '/api/profile/cover', { imageURL });
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
      return apiRequest('PUT', '/api/profile/video', { videoURL });
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
  const handleUploadComplete = (uploadURL: string) => {
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

  // Handle tab change with unsaved check
  const handleTabChange = (value: string) => {
    if (form.formState.isDirty) {
      setPendingTab(value);
      setShowUnsavedDialog(true);
    } else {
      setActiveTab(value);
    }
  };

  // Confirm tab change (discard changes)
  const confirmTabChange = () => {
    form.reset();
    setShowUnsavedDialog(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  };

  // Submit handler for the form
  const onSubmit = (data: ProfileFormValues) => {
    console.log('[Profile Update] Form data being submitted:', data);
    updateProfileMutation.mutate(data);
  };

  // Open upload dialog
  const openUpload = (type: 'profile' | 'cover' | 'video') => {
    setUploadType(type);
    setUploadDialogOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full" data-testid="button-login">
                Log In to Continue
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header Card */}
        <Card className="mb-8">
          <div className="relative">
            {/* Cover Photo */}
            <div className="relative h-48 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg overflow-hidden">
              {user?.coverPhotoUrl && (
                <img
                  src={user.coverPhotoUrl}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
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
            </div>

            {/* Profile Picture */}
            <CardContent className="pt-16 -mt-20">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-end">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 overflow-hidden shadow-lg">
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
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={() => openUpload('profile')}
                    data-testid="button-upload-profile"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold">
                    {user?.firstName ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}` : user?.email?.split('@')[0] || 'Member'}
                  </h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                  {user?.bio && (
                    <p className="mt-2 text-gray-700 dark:text-gray-300">{user.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Profile Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic" data-testid="tab-basic">Basic Info</TabsTrigger>
                <TabsTrigger value="contact" data-testid="tab-contact">Contact</TabsTrigger>
                <TabsTrigger value="social" data-testid="tab-social">Social Media</TabsTrigger>
                <TabsTrigger value="media" data-testid="tab-media">Media</TabsTrigger>
              </TabsList>

              {/* Basic Info Section */}
              <TabsContent value="basic" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} data-testid="input-first-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} data-testid="input-last-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about yourself..."
                              className="resize-none"
                              rows={4}
                              {...field}
                              data-testid="input-bio"
                            />
                          </FormControl>
                          <FormDescription>
                            {field.value?.length || 0}/200 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      {form.formState.isDirty && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => form.reset()}
                          data-testid="button-cancel"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={!form.formState.isDirty || updateProfileMutation.isPending}
                        data-testid="button-save-basic"
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Section */}
              <TabsContent value="contact" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>Manage your contact details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="1234567890"
                              {...field}
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormDescription>10-digit phone number</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="City, State"
                              {...field}
                              data-testid="input-location"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="websiteUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://example.com"
                              {...field}
                              data-testid="input-website"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      {form.formState.isDirty && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => form.reset()}
                          data-testid="button-cancel"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={!form.formState.isDirty || updateProfileMutation.isPending}
                        data-testid="button-save-contact"
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Social Media Section */}
              <TabsContent value="social" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media Links</CardTitle>
                    <CardDescription>Connect your social profiles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="facebookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://facebook.com/yourprofile"
                              {...field}
                              data-testid="input-facebook"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="twitterUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter / X</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://twitter.com/yourhandle"
                              {...field}
                              data-testid="input-twitter"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="instagramUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://instagram.com/yourhandle"
                              {...field}
                              data-testid="input-instagram"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="linkedinUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://linkedin.com/in/yourprofile"
                              {...field}
                              data-testid="input-linkedin"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      {form.formState.isDirty && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => form.reset()}
                          data-testid="button-cancel"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={!form.formState.isDirty || updateProfileMutation.isPending}
                        data-testid="button-save-social"
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Media Section */}
              <TabsContent value="media" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Media & Assets</CardTitle>
                    <CardDescription>Upload profile images and intro video</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Profile Image</Label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                          {user?.profileImageUrl ? (
                            <img
                              src={user.profileImageUrl}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <User className="w-10 h-10 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openUpload('profile')}
                          data-testid="button-change-profile-image"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload New Image
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Cover Photo</Label>
                      <div className="space-y-4">
                        <div className="h-40 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                          {user?.coverPhotoUrl ? (
                            <img
                              src={user.coverPhotoUrl}
                              alt="Cover"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-600" />
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openUpload('cover')}
                          data-testid="button-change-cover-photo"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload New Cover
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Intro Video</Label>
                      <div className="space-y-4">
                        {user?.introVideoUrl ? (
                          <video
                            src={user.introVideoUrl}
                            controls
                            className="w-full h-48 rounded-lg bg-black"
                            data-testid="video-intro"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <div className="text-center text-gray-500">
                              <VideoIcon className="w-12 h-12 mx-auto mb-2" />
                              <p>No intro video uploaded</p>
                            </div>
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openUpload('video')}
                          data-testid="button-upload-intro-video"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Intro Video
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Upload {uploadType === 'profile' ? 'Profile Image' : uploadType === 'cover' ? 'Cover Photo' : 'Intro Video'}
              </DialogTitle>
              <DialogDescription>
                {uploadType === 'video' 
                  ? 'Upload a video file (MP4, WebM, or MOV, max 50MB)'
                  : 'Upload an image file (JPG, PNG, or WebP, max 5MB)'
                }
              </DialogDescription>
            </DialogHeader>
            <SimpleFileUploader
              accept={uploadType === 'video' ? 'video/*' : 'image/*'}
              maxSize={uploadType === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024}
              onUploadComplete={handleUploadComplete}
            />
          </DialogContent>
        </Dialog>

        {/* Unsaved Changes Dialog */}
        <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setShowUnsavedDialog(false);
                setPendingTab(null);
              }}>
                Stay and Save
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmTabChange}>
                Discard Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
