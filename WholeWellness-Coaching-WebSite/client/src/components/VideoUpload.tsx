import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Video, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface VideoUploadProps {
  onVideoUploaded?: (videoUrl: string) => void;
  existingVideoUrl?: string;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
  title?: string;
  description?: string;
}

export default function VideoUpload({
  onVideoUploaded,
  existingVideoUrl,
  maxSize = 50,
  acceptedFormats = ['.mp4', '.mov', '.avi', '.webm'],
  title = "Upload Video",
  description = "Add an introduction video"
}: VideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingVideoUrl || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('video', file);
      
      // Simulate upload progress
      const response = await apiRequest('POST', '/api/upload/video', formData, {
        onUploadProgress: (progressEvent: any) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Video uploaded successfully",
        description: "Your video has been uploaded and processed.",
      });
      setPreviewUrl(data.videoUrl);
      onVideoUploaded?.(data.videoUrl);
      setUploadProgress(0);
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: `Please upload a video file: ${acceptedFormats.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Please upload a video smaller than ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, [acceptedFormats, maxSize, toast]);

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadMutation.mutate(selectedFile);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    // Reset file input
    const fileInput = document.getElementById('video-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Video className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!previewUrl ? (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="text-center space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <Label htmlFor="video-upload" className="cursor-pointer">
                  <span className="text-primary hover:underline">Click to upload</span>
                  {' '}or drag and drop
                </Label>
                <Input
                  id="video-upload"
                  type="file"
                  accept={acceptedFormats.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: {acceptedFormats.join(', ')} • Max size: {maxSize}MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video
                src={previewUrl}
                controls
                className="w-full h-48 object-cover rounded-lg bg-black"
                poster="/api/placeholder/400/200"
              >
                Your browser does not support the video tag.
              </video>
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {selectedFile && !uploadMutation.isSuccess && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{selectedFile.name}</span>
                  <span>{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
                
                {uploadMutation.isPending && (
                  <div className="space-y-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
                
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="w-full"
                >
                  {uploadMutation.isPending ? (
                    "Uploading..."
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Video
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {uploadMutation.isSuccess && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Video uploaded successfully!</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}