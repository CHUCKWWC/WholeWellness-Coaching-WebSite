import { useState } from "react";
import { Play, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FileUpload from "@/components/file-upload";

interface VideoUploadProps {
  currentVideoUrl?: string;
  onUpload: (url: string) => void;
}

export default function VideoUpload({ currentVideoUrl, onUpload }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleVideoUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onUpload(data.url);
    } catch (error) {
      console.error('Video upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Video Player */}
      <div>
        {currentVideoUrl ? (
          <div className="video-player rounded-lg overflow-hidden shadow-lg">
            <video
              src={currentVideoUrl}
              controls
              className="w-full h-full object-cover"
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%231B9AAA'/%3E%3Ctext x='200' y='100' text-anchor='middle' dy='.3em' fill='white' font-size='16'%3EIntroduction Video%3C/text%3E%3C/svg%3E"
            />
          </div>
        ) : (
          <div className="video-player rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
            <div className="text-center text-white">
              <Play className="w-12 h-12 mx-auto mb-4 opacity-75" />
              <p className="text-lg font-medium">No video uploaded</p>
              <p className="text-sm opacity-75">Upload an introduction video</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Area */}
      <div>
        {!uploading ? (
          <FileUpload
            accept="video/*"
            onUpload={handleVideoUpload}
            maxSize={50 * 1024 * 1024} // 50MB for videos
          >
            <div className="upload-zone p-8 rounded-lg text-center cursor-pointer">
              <Upload className="w-8 h-8 text-[var(--wellness-teal)] mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-700 mb-2">Upload Introduction Video</h4>
              <p className="text-gray-500 text-sm mb-4">Max 5 minutes, MP4 format preferred</p>
              <Button type="button" className="btn-primary">
                Choose Video
              </Button>
            </div>
          </FileUpload>
        ) : (
          <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <Upload className="w-8 h-8 text-[var(--wellness-teal)] mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-700 mb-4">Uploading Video...</h4>
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-600">{uploadProgress}% complete</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
