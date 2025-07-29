import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Trash2, FileText, File } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/file-upload";
import type { Resource } from "@shared/schema";

export default function ResourceLibrary() {
  const [showUpload, setShowUpload] = useState(false);
  const { toast } = useToast();

  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ['/api/coaches/1/resources'],
  });

  const uploadResourceMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resource', file);
      formData.append('coachId', '1');
      
      const response = await fetch('/api/upload/resource', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coaches/1/resources'] });
      setShowUpload(false);
      toast({
        title: "Resource uploaded",
        description: "Your resource has been successfully uploaded.",
      });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload resource. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/resources/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coaches/1/resources'] });
      toast({
        title: "Resource deleted",
        description: "The resource has been deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete resource. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (fileType.includes('word')) return <FileText className="w-5 h-5 text-blue-500" />;
    if (fileType.includes('image')) return <File className="w-5 h-5 text-green-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="wellness-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Resource Library</CardTitle>
          <Button
            className="btn-secondary"
            onClick={() => setShowUpload(!showUpload)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showUpload && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="text-lg font-medium text-gray-700 mb-4">Upload New Resource</h4>
            <FileUpload
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              onUpload={(file) => uploadResourceMutation.mutate(file as File)}
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--wellness-teal)]"></div>
          </div>
        ) : resources && resources.length > 0 ? (
          <div className="space-y-3">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(resource.fileType)}
                  <div>
                    <p className="font-medium text-gray-700">{resource.name}</p>
                    <p className="text-sm text-gray-500">
                      {resource.fileSize ? formatFileSize(resource.fileSize) : 'Unknown size'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(resource.fileUrl, '_blank')}
                    className="text-[var(--wellness-teal)] hover:text-[var(--wellness-dark)]"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteResourceMutation.mutate(resource.id)}
                    className="text-red-500 hover:text-red-700"
                    disabled={deleteResourceMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No resources uploaded yet</p>
            <Button
              className="btn-primary"
              onClick={() => setShowUpload(true)}
            >
              Upload First Resource
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
