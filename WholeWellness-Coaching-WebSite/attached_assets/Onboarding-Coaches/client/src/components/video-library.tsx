import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Play, Trash2, Edit } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Video } from "@shared/schema";

export default function VideoLibrary() {
  const [newTopic, setNewTopic] = useState("");
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const { toast } = useToast();

  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ['/api/coaches/1/videos'],
  });

  const createVideoMutation = useMutation({
    mutationFn: async (videoData: any) => {
      return apiRequest('POST', '/api/videos', videoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coaches/1/videos'] });
      setShowAddVideo(false);
      setNewTopic("");
      toast({
        title: "Video added",
        description: "Your video has been added to the library.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add video. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/videos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coaches/1/videos'] });
      toast({
        title: "Video deleted",
        description: "The video has been removed from your library.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete video. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddVideo = (formData: FormData) => {
    const videoData = {
      coachId: 1,
      topic: formData.get('topic') as string,
      title: formData.get('title') as string,
      videoUrl: formData.get('videoUrl') as string,
      description: formData.get('description') as string,
      duration: formData.get('duration') as string,
    };

    createVideoMutation.mutate(videoData);
  };

  // Group videos by topic
  const videosByTopic = videos?.reduce((acc, video) => {
    if (!acc[video.topic]) {
      acc[video.topic] = [];
    }
    acc[video.topic].push(video);
    return acc;
  }, {} as Record<string, Video[]>) || {};

  return (
    <Card className="wellness-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Video Library</CardTitle>
          <Dialog open={showAddVideo} onOpenChange={setShowAddVideo}>
            <DialogTrigger asChild>
              <Button className="btn-secondary">
                <Plus className="w-4 h-4 mr-2" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Video</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddVideo(new FormData(e.currentTarget));
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    name="topic"
                    placeholder="e.g., Goal Setting, Stress Management"
                    required
                    className="wellness-input"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Video Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., SMART Goals Framework"
                    required
                    className="wellness-input"
                  />
                </div>
                <div>
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    type="url"
                    placeholder="https://example.com/video.mp4"
                    required
                    className="wellness-input"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Brief description of the video content"
                    className="wellness-input"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    name="duration"
                    placeholder="e.g., 5:30"
                    className="wellness-input"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddVideo(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="btn-primary"
                    disabled={createVideoMutation.isPending}
                  >
                    {createVideoMutation.isPending ? "Adding..." : "Add Video"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--wellness-teal)]"></div>
          </div>
        ) : Object.keys(videosByTopic).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(videosByTopic).map(([topic, topicVideos]) => (
              <div key={topic} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-700">{topic}</h4>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topicVideos.map((video) => (
                    <div key={video.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="aspect-video bg-[var(--wellness-teal)] rounded mb-2 flex items-center justify-center relative group">
                        <Play className="w-8 h-8 text-white" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 text-white hover:bg-white/20"
                            onClick={() => window.open(video.videoUrl, '_blank')}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <h5 className="font-medium text-gray-700 text-sm mb-1">{video.title}</h5>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{video.duration}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteVideoMutation.mutate(video.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Video Button */}
                  <div
                    className="upload-zone p-3 rounded-lg text-center cursor-pointer"
                    onClick={() => setShowAddVideo(true)}
                  >
                    <Plus className="w-6 h-6 text-[var(--wellness-teal)] mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Add Video</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No videos in your library yet</p>
            <Button
              className="btn-primary"
              onClick={() => setShowAddVideo(true)}
            >
              Add First Video
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
