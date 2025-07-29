import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Edit, Eye, Star, Play, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CoachProfileData {
  profilePic: string;
  name: string;
  title: string;
  bio: string;
  rating: number;
  specialties: string[];
  introVideoTitle: string;
  introVideoUrl?: string;
  ctaTitle: string;
  ctaText: string;
  videoLibraryTitle: string;
  videos: Array<{
    id: string;
    title: string;
    description: string;
    thumbnailUrl?: string;
    videoUrl?: string;
  }>;
}

const getDefaultProfileData = (user: any): CoachProfileData => ({
  profilePic: user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  name: user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.firstName || user?.email?.split('@')[0] || "Coach",
  title: "Certified Wellness & Life Coach",
  bio: `Hi, I'm ${user?.firstName || 'your coach'}! I help people find balance, reduce stress, and build fulfilling lives. I provide actionable strategies for sustainable well-being through a holistic approach that focuses on mind, body, and spirit to unlock your full potential.`,
  rating: 5,
  specialties: ["Wellness Coaching", "Life Balance", "Mindfulness & Stress Reduction", "Personal Development"],
  introVideoTitle: "A Little More About Me",
  ctaTitle: "Ready to Start Your Journey?",
  ctaText: "Schedule a complimentary discovery session with me to see how we can work together to achieve your goals.",
  videoLibraryTitle: "My Video Library",
  videos: [
    { id: "1", title: "Mindful Mornings", description: "Start your day with intention and clarity." },
    { id: "2", title: "Wellness Fundamentals", description: "Build a foundation for lasting wellness." },
    { id: "3", title: "Effective Communication", description: "Strengthen your personal and professional bonds." },
    { id: "4", title: "Work-Life Balance", description: "Strategies to avoid burnout and thrive." }
  ]
});

export default function CoachProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");

  // Get coach profile data from server
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["/api/coach/profile", user?.id],
    enabled: isAuthenticated && !!user?.id,
    initialData: () => user ? getDefaultProfileData(user) : getDefaultProfileData({}),
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<CoachProfileData>) => 
      apiRequest("PUT", "/api/coach/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/profile"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please log in to access your coach profile.
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Save profile data to server
  const saveProfile = () => {
    updateProfileMutation.mutate(profileData);
    setIsEditMode(false);
  };

  // Handle field editing
  const startEditing = (field: string, value: string) => {
    if (!isEditMode) return;
    setEditingField(field);
    setTempValue(value);
  };

  const saveField = (field: string) => {
    const updatedData = { ...profileData, [field]: tempValue };
    updateProfileMutation.mutate(updatedData);
    setEditingField(null);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValue("");
  };

  // Handle profile picture upload
  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, profilePic: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle specialties
  const addSpecialty = () => {
    const newSpecialty = prompt("Enter new specialty:");
    if (newSpecialty) {
      setProfileData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty]
      }));
    }
  };

  const removeSpecialty = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  // Handle videos
  const addVideo = () => {
    const title = prompt("Enter video title:");
    const description = prompt("Enter video description:");
    if (title && description) {
      const newVideo = {
        id: Date.now().toString(),
        title,
        description
      };
      setProfileData(prev => ({
        ...prev,
        videos: [...prev.videos, newVideo]
      }));
    }
  };

  const removeVideo = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      videos: prev.videos.filter(v => v.id !== id)
    }));
  };

  // Render editable text field
  const renderEditableField = (field: keyof CoachProfileData, className: string = "", multiline: boolean = false) => {
    const value = profileData[field] as string;
    const isEditing = editingField === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          {multiline ? (
            <Textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className={className}
              autoFocus
            />
          ) : (
            <Input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className={className}
              autoFocus
            />
          )}
          <Button size="sm" onClick={() => saveField(field)}>Save</Button>
          <Button size="sm" variant="outline" onClick={cancelEditing}>Cancel</Button>
        </div>
      );
    }

    return (
      <div
        className={`${className} ${isEditMode ? "cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors border-2 border-dashed border-transparent hover:border-primary" : ""}`}
        onClick={() => startEditing(field, value)}
      >
        {value}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Edit/Save Buttons */}
      <div className="fixed top-20 right-4 z-40 flex gap-2">
        {isEditMode ? (
          <>
            <Button onClick={() => setIsEditMode(false)} variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              View Profile
            </Button>
            <Button onClick={saveProfile}>
              Save Changes
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditMode(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-7xl mx-auto">
          <CardContent className="p-8">
            {/* Profile Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Profile Picture */}
              <div className="flex flex-col items-center md:items-start">
                <div className="relative group">
                  <img
                    src={profileData.profilePic}
                    alt={profileData.name}
                    className="w-40 h-40 rounded-full object-cover border-4 border-primary/20"
                  />
                  {isEditMode && (
                    <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-semibold flex items-center gap-1">
                        <Upload className="h-4 w-4" />
                        Change Photo
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleProfilePicUpload}
                      />
                    </label>
                  )}
                </div>
                {/* Rating */}
                <div className="flex items-center mt-4">
                  <span className="text-gray-700 font-semibold mr-2">Rating:</span>
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bio and Keywords */}
              <div className="md:col-span-2">
                <h1 className="text-4xl font-bold text-primary mb-2">
                  {renderEditableField("name", "text-4xl font-bold text-primary")}
                </h1>
                <p className="text-xl text-gray-600 mb-4">
                  {renderEditableField("title", "text-xl text-gray-600")}
                </p>
                <div className="mb-6">
                  {renderEditableField("bio", "text-gray-700 leading-relaxed", true)}
                </div>
                
                {/* Specialties */}
                <div>
                  <h3 className="font-semibold text-primary mb-3">Specialties:</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.specialties.map((specialty, index) => (
                      <div key={index} className="relative group">
                        <span className="bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full inline-block">
                          {specialty}
                        </span>
                        {isEditMode && (
                          <button
                            onClick={() => removeSpecialty(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditMode && (
                      <button
                        onClick={addSpecialty}
                        className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-full flex items-center gap-1 hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Intro Video Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-primary mb-6 text-center">
                {renderEditableField("introVideoTitle", "text-2xl font-bold text-primary text-center")}
              </h2>
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-md">
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <button className="text-white bg-primary rounded-full p-6 hover:bg-primary/90 transition-colors">
                    <Play className="h-12 w-12" />
                  </button>
                </div>
              </div>
            </section>

            {/* Schedule Session CTA */}
            <section className="mb-12 text-center bg-primary/5 p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-primary mb-4">
                {renderEditableField("ctaTitle", "text-2xl font-bold text-primary")}
              </h2>
              <div className="max-w-2xl mx-auto mb-6">
                {renderEditableField("ctaText", "text-gray-700", true)}
              </div>
              <Button
                size="lg"
                onClick={() => setLocation("/booking")}
                className="text-lg px-8 py-6"
              >
                Schedule a Session
              </Button>
            </section>

            {/* Video Library */}
            <section>
              <h2 className="text-3xl font-bold text-primary mb-8 text-center">
                {renderEditableField("videoLibraryTitle", "text-3xl font-bold text-primary text-center")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {profileData.videos.map((video) => (
                  <div key={video.id} className="relative group">
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-gray-200 relative">
                        <img
                          src={video.thumbnailUrl || `https://placehold.co/400x225/e5e7eb/6b7280?text=${encodeURIComponent(video.title)}`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg text-primary mb-1">{video.title}</h3>
                        <p className="text-gray-600 text-sm">{video.description}</p>
                      </CardContent>
                    </Card>
                    {isEditMode && (
                      <button
                        onClick={() => removeVideo(video.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {isEditMode && (
                  <Card 
                    className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center min-h-[200px]"
                    onClick={addVideo}
                  >
                    <div className="text-center p-4">
                      <Plus className="h-8 w-8 text-primary/50 mx-auto mb-2" />
                      <span className="text-primary/70 font-medium">Add Video</span>
                    </div>
                  </Card>
                )}
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}