import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Search, 
  Folder, 
  ExternalLink,
  Video,
  Image,
  File,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface DriveFile {
  id: string;
  name: string;
  type: string;
  viewLink: string;
  downloadLink: string;
  thumbnail?: string;
  size?: string;
  modified: string;
}

interface DriveFolder {
  id: string;
  name: string;
  files: DriveFile[];
  subfolders: DriveFolder[];
}

interface GoogleDriveCourseFilesProps {
  courseId: string;
  courseName: string;
}

export default function GoogleDriveCourseFiles({ courseId, courseName }: GoogleDriveCourseFilesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch course files from Google Drive
  const { data: filesData, isLoading: filesLoading, error: filesError, refetch: refetchFiles } = useQuery({
    queryKey: [`/api/coach/course-files/${courseId}`],
    retry: 1
  });

  // Fetch folder structure
  const { data: folderData, isLoading: folderLoading } = useQuery({
    queryKey: [`/api/coach/course-folder/${courseId}`],
    retry: 1
  });

  // Search files
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: [`/api/coach/search-course-files/${courseId}`, searchQuery],
    enabled: searchQuery.length > 2,
    retry: 1
  });

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('video')) return <Video className="h-5 w-5 text-red-500" />;
    if (mimeType.includes('image')) return <Image className="h-5 w-5 text-green-500" />;
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-600" />;
    if (mimeType.includes('document')) return <FileText className="h-5 w-5 text-blue-500" />;
    if (mimeType.includes('spreadsheet')) return <FileText className="h-5 w-5 text-green-600" />;
    if (mimeType.includes('presentation')) return <FileText className="h-5 w-5 text-orange-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatBytes = (bytes: string | undefined) => {
    if (!bytes) return 'Unknown size';
    const size = parseInt(bytes);
    if (size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await apiRequest("GET", `/api/coach/drive-file/${fileId}/download`);
      if (response.downloadUrl) {
        window.open(response.downloadUrl, '_blank');
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderFiles = (files: DriveFile[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <Card key={file.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getFileIcon(file.type)}
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm font-medium truncate">
                    {file.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {formatBytes(file.size)} • {new Date(file.modified).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {file.thumbnail && (
              <div className="mb-3">
                <img 
                  src={file.thumbnail} 
                  alt={file.name}
                  className="w-full h-20 object-cover rounded"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => window.open(file.viewLink, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View
              </Button>
              {file.downloadLink && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(file.id, file.name)}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderFolderStructure = (folder: DriveFolder, level = 0) => (
    <div key={folder.id} className={`${level > 0 ? 'ml-4 border-l pl-4' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <Folder className="h-4 w-4 text-blue-500" />
        <span className="font-medium">{folder.name}</span>
        <Badge variant="outline" className="text-xs">
          {folder.files.length} files
        </Badge>
      </div>
      
      {folder.files.length > 0 && (
        <div className="mb-4">
          {renderFiles(folder.files)}
        </div>
      )}
      
      {folder.subfolders.map(subfolder => 
        renderFolderStructure(subfolder, level + 1)
      )}
    </div>
  );

  if (filesError || (filesData && !filesData.files)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Google Drive Integration
          </CardTitle>
          <CardDescription>
            Course files from Google Drive for {courseName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {filesData?.message || "No Google Drive folder configured for this course"}
            </p>
            <Button 
              variant="outline" 
              onClick={() => refetchFiles()}
              disabled={filesLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${filesLoading ? 'animate-spin' : ''}`} />
              Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-blue-500" />
            Course Materials - Google Drive
          </CardTitle>
          <CardDescription>
            Access course files, documents, and resources from Google Drive
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Interface */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search course files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => refetchFiles()}
              disabled={filesLoading}
            >
              <RefreshCw className={`h-4 w-4 ${filesLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Search Results */}
          {searchQuery.length > 2 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Search Results</h3>
              {searchLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full mb-3" />
                        <div className="flex gap-2">
                          <Skeleton className="h-8 flex-1" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searchResults?.files ? (
                renderFiles(searchResults.files)
              ) : (
                <p className="text-gray-500">No files found matching your search.</p>
              )}
            </div>
          )}

          {/* Folder Structure or File List */}
          {folderLoading || filesLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full mb-3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 flex-1" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : folderData?.folder ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Course Files</h3>
              {renderFolderStructure(folderData.folder)}
            </div>
          ) : filesData?.files && filesData.files.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Course Files</h3>
              {renderFiles(filesData.files)}
            </div>
          ) : (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No files found in this course.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}