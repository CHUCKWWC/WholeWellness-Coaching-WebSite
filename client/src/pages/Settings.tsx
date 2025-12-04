import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DigestPreferencesSettings from "@/components/DigestPreferencesSettings";
import { Bell, User, Shield, Palette, Camera, Save, Loader2, Moon, Sun, Monitor, Eye, EyeOff, Lock, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";

interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  profileImageUrl: string | null;
  coverPhotoUrl: string | null;
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");

  // Privacy settings state
  const [profileVisibility, setProfileVisibility] = useState<"public" | "members" | "private">("members");
  const [showAssessmentResults, setShowAssessmentResults] = useState(false);
  const [allowCoachMessages, setAllowCoachMessages] = useState(true);
  const [showActivityStatus, setShowActivityStatus] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  // Fetch user profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery<UserProfile>({
    queryKey: ['/api/user/profile'],
    enabled: !!user,
  });

  // Fetch privacy settings
  interface PrivacySettings {
    profileVisibility: "public" | "members" | "private";
    showAssessmentResults: boolean;
    allowCoachMessages: boolean;
    showActivityStatus: boolean;
    dataSharing: boolean;
  }

  const { data: privacySettings } = useQuery<PrivacySettings>({
    queryKey: ['/api/user/privacy-settings'],
    enabled: !!user,
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setBio(profile.bio || "");
      setPhone(profile.phone || "");
      setLocation(profile.location || "");
      setWebsite(profile.website || "");
    }
  }, [profile]);

  // Update privacy settings form when data loads
  useEffect(() => {
    if (privacySettings) {
      setProfileVisibility(privacySettings.profileVisibility || "members");
      setShowAssessmentResults(privacySettings.showAssessmentResults || false);
      setAllowCoachMessages(privacySettings.allowCoachMessages !== false);
      setShowActivityStatus(privacySettings.showActivityStatus !== false);
      setDataSharing(privacySettings.dataSharing || false);
    }
  }, [privacySettings]);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PUT', '/api/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating profile",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      firstName,
      lastName,
      bio,
      phone,
      location,
      websiteUrl: website,
    });
  };

  // Privacy settings mutation
  const updatePrivacyMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PUT', '/api/user/privacy-settings', data);
    },
    onSuccess: () => {
      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error saving privacy settings",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSavePrivacy = () => {
    updatePrivacyMutation.mutate({
      profileVisibility,
      showAssessmentResults,
      allowCoachMessages,
      showActivityStatus,
      dataSharing,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Please log in to access settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = () => {
    const first = firstName || user?.firstName || "";
    const last = lastName || user?.lastName || "";
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-4 sm:py-8">
      <div className="container max-w-6xl mx-auto px-3 sm:px-4">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Manage your account preferences, privacy, and appearance
          </p>
        </div>

        <Tabs defaultValue="notifications" className="w-full" data-testid="settings-tabs">
          <TabsList className="grid w-full grid-cols-4 gap-1 sm:gap-2 lg:w-auto lg:inline-grid" data-testid="tabs-list">
            <TabsTrigger value="notifications" className="flex items-center gap-2" data-testid="tab-notifications">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2" data-testid="tab-profile">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2" data-testid="tab-privacy">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2" data-testid="tab-appearance">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6" data-testid="content-notifications">
            <DigestPreferencesSettings />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6" data-testid="content-profile">
            <div className="space-y-6">
              {/* Profile Picture Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Picture</CardTitle>
                  <CardDescription>Your profile photo is visible to coaches and members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile?.profileImageUrl} alt={firstName} />
                      <AvatarFallback className="text-2xl bg-teal-100 text-teal-700">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        To update your profile picture, visit your{" "}
                        <a href="/user-profile" className="text-teal-600 hover:underline">
                          profile page
                        </a>
                      </p>
                      <Button variant="outline" size="sm" onClick={() => window.location.href = '/user-profile'}>
                        <Camera className="h-4 w-4 mr-2" />
                        Change Photo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                  <CardDescription>Update your basic profile information</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingProfile ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Your first name"
                            data-testid="input-firstname"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Your last name"
                            data-testid="input-lastname"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value.slice(0, 200))}
                          placeholder="Tell us a little about yourself..."
                          className="resize-none"
                          rows={3}
                          data-testid="input-bio"
                        />
                        <p className="text-xs text-muted-foreground text-right">{bio.length}/200</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(555) 123-4567"
                            data-testid="input-phone"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="City, State"
                            data-testid="input-location"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://yourwebsite.com"
                          data-testid="input-website"
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button 
                          onClick={handleSaveProfile} 
                          disabled={updateProfileMutation.isPending}
                          data-testid="button-save-profile"
                        >
                          {updateProfileMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="mt-6" data-testid="content-privacy">
            <div className="space-y-6">
              {/* Profile Visibility */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5 text-teal-600" />
                    Profile Visibility
                  </CardTitle>
                  <CardDescription>Control who can see your profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="visibility">Who can view your profile?</Label>
                    <Select value={profileVisibility} onValueChange={(v: "public" | "members" | "private") => setProfileVisibility(v)}>
                      <SelectTrigger id="visibility" data-testid="select-visibility">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Public - Anyone can view
                          </div>
                        </SelectItem>
                        <SelectItem value="members">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Members Only - Only registered users
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <EyeOff className="h-4 w-4" />
                            Private - Only you and your coaches
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Data & Communication */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5 text-teal-600" />
                    Data & Communication
                  </CardTitle>
                  <CardDescription>Manage your data sharing and communication preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Show Assessment Results</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow coaches to view your wellness assessment results
                      </p>
                    </div>
                    <Switch
                      checked={showAssessmentResults}
                      onCheckedChange={setShowAssessmentResults}
                      data-testid="switch-assessment-results"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Allow Coach Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Let coaches send you messages and session recommendations
                      </p>
                    </div>
                    <Switch
                      checked={allowCoachMessages}
                      onCheckedChange={setAllowCoachMessages}
                      data-testid="switch-coach-messages"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Show Activity Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Display when you're online to coaches and members
                      </p>
                    </div>
                    <Switch
                      checked={showActivityStatus}
                      onCheckedChange={setShowActivityStatus}
                      data-testid="switch-activity-status"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Anonymous Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">
                        Help improve our platform by sharing anonymized usage data
                      </p>
                    </div>
                    <Switch
                      checked={dataSharing}
                      onCheckedChange={setDataSharing}
                      data-testid="switch-data-sharing"
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button 
                      onClick={handleSavePrivacy} 
                      disabled={updatePrivacyMutation.isPending}
                      data-testid="button-save-privacy"
                    >
                      {updatePrivacyMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Privacy Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="mt-6" data-testid="content-appearance">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Theme</CardTitle>
                <CardDescription>Choose how Wholewellness looks for you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Light Theme */}
                  <button
                    onClick={() => setTheme("light")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === "light"
                        ? "border-teal-600 bg-teal-50 dark:bg-teal-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    data-testid="button-theme-light"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                        <Sun className="h-6 w-6 text-amber-500" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900 dark:text-white">Light</p>
                        <p className="text-xs text-muted-foreground">Always use light theme</p>
                      </div>
                    </div>
                  </button>

                  {/* Dark Theme */}
                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === "dark"
                        ? "border-teal-600 bg-teal-50 dark:bg-teal-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    data-testid="button-theme-dark"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                        <Moon className="h-6 w-6 text-slate-200" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900 dark:text-white">Dark</p>
                        <p className="text-xs text-muted-foreground">Always use dark theme</p>
                      </div>
                    </div>
                  </button>

                  {/* System Theme */}
                  <button
                    onClick={() => setTheme("system")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === "system"
                        ? "border-teal-600 bg-teal-50 dark:bg-teal-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    data-testid="button-theme-system"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-slate-800 flex items-center justify-center">
                        <Monitor className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900 dark:text-white">System</p>
                        <p className="text-xs text-muted-foreground">Match your device</p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <p className="text-sm text-muted-foreground">
                    <strong>Current theme:</strong>{" "}
                    {theme === "system" ? `System (${resolvedTheme})` : theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
