import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCoachSchema, type Coach } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Edit, Camera, Star, Plus, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/file-upload";
import VideoUpload from "@/components/video-upload";

export default function CoachProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const { toast } = useToast();

  const { data: coach, isLoading } = useQuery<Coach>({
    queryKey: ['/api/coaches/1'],
  });

  const form = useForm({
    resolver: zodResolver(insertCoachSchema.partial()),
    defaultValues: {
      name: coach?.name || "",
      email: coach?.email || "",
      credentials: coach?.credentials || "",
      bio: coach?.bio || "",
      keywords: coach?.keywords || [],
      scheduleUrl: coach?.scheduleUrl || "",
    },
  });

  const updateCoachMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PUT', '/api/coaches/1', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coaches/1'] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await fetch('/api/upload/photo', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: (data) => {
      updateCoachMutation.mutate({ photoUrl: data.url });
    },
  });

  const onSubmit = (data: any) => {
    updateCoachMutation.mutate(data);
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      const currentKeywords = form.getValues('keywords') || [];
      form.setValue('keywords', [...currentKeywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    const currentKeywords = form.getValues('keywords') || [];
    form.setValue('keywords', currentKeywords.filter(k => k !== keyword));
  };

  if (isLoading) {
    return (
      <Card className="wellness-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--wellness-teal)]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Basic Profile */}
      <Card className="wellness-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Coach Profile</CardTitle>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="text-[var(--wellness-teal)] border-[var(--wellness-teal)] hover:bg-[var(--wellness-light)]"
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Profile Photo */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="w-32 h-32 mx-auto">
                      <AvatarImage src={coach?.photoUrl} alt={coach?.name} />
                      <AvatarFallback className="text-lg">
                        {coach?.name?.split(' ').map(n => n[0]).join('') || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <FileUpload
                        accept="image/*"
                        onUpload={(file) => uploadPhotoMutation.mutate(file)}
                        className="absolute bottom-0 right-0"
                      >
                        <Button
                          type="button"
                          size="sm"
                          className="btn-secondary rounded-full p-2"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      </FileUpload>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="mt-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="flex text-yellow-400 mr-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4"
                              fill={i < Math.floor(Number(coach?.rating) || 0) ? "currentColor" : "none"}
                            />
                          ))}
                        </div>
                        <span className="text-gray-600">{coach?.rating || "0.0"}</span>
                      </div>
                      <span className="text-gray-500 text-sm">({coach?.numReviews || 0} reviews)</span>
                    </div>
                  )}
                </div>

                {/* Profile Information */}
                <div className="md:col-span-2 space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-gray-50" : "wellness-input"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            disabled={!isEditing}
                            className={!isEditing ? "bg-gray-50" : "wellness-input"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="credentials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credentials</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., PhD, LCSW, CPC"
                            disabled={!isEditing}
                            className={!isEditing ? "bg-gray-50" : "wellness-input"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={4}
                            placeholder="Tell clients about your experience and approach..."
                            disabled={!isEditing}
                            className={!isEditing ? "bg-gray-50" : "wellness-input"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Keywords/Specialties */}
                  <div>
                    <Label>Specialties</Label>
                    <div className="flex flex-wrap gap-2 mt-2 mb-2">
                      {(form.watch('keywords') || []).map((keyword: string) => (
                        <Badge
                          key={keyword}
                          variant="secondary"
                          className="bg-[var(--wellness-light)] text-[var(--wellness-teal)]"
                        >
                          {keyword}
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeKeyword(keyword)}
                              className="ml-2 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Input
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          placeholder="Add specialty"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                          className="wellness-input"
                        />
                        <Button type="button" onClick={addKeyword} variant="outline">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="btn-primary"
                    disabled={updateCoachMutation.isPending}
                  >
                    {updateCoachMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Introduction Video */}
      <Card className="wellness-card">
        <CardHeader>
          <CardTitle>Introduction Video</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoUpload
            currentVideoUrl={coach?.introVideoUrl}
            onUpload={(url) => updateCoachMutation.mutate({ introVideoUrl: url })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
