import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Download, Eye, FileText, Image as ImageIcon, Video, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserMedia {
  id: string;
  userId: string;
  mediaType: 'image' | 'video' | 'document' | 'audio';
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  title?: string;
  description?: string;
  isPublic: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface MediaGalleryProps {
  editable?: boolean;
  showAddButton?: boolean;
  onAddMedia?: () => void;
}

export function MediaGallery({ editable = false, showAddButton = false, onAddMedia }: MediaGalleryProps) {
  const { toast } = useToast();
  const [selectedMedia, setSelectedMedia] = useState<UserMedia | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<UserMedia | null>(null);

  const { data: mediaFiles = [], isLoading } = useQuery<UserMedia[]>({
    queryKey: ['/api/user/media'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      return apiRequest(`/api/user/media/${mediaId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/media'] });
      toast({
        title: 'Media deleted',
        description: 'The file has been removed from your gallery.',
      });
      setDeleteDialogOpen(false);
      setMediaToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete file',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (media: UserMedia) => {
    setMediaToDelete(media);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (mediaToDelete) {
      deleteMutation.mutate(mediaToDelete.id);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'audio':
        return <Music className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const filterByType = (type: string) => {
    if (type === 'all') return mediaFiles;
    return mediaFiles.filter((media) => media.mediaType === type);
  };

  const MediaCard = ({ media }: { media: UserMedia }) => (
    <Card
      className="group relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => setSelectedMedia(media)}
      data-testid={`card-media-${media.id}`}
    >
      <CardContent className="p-0">
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden">
          {media.mediaType === 'image' ? (
            <img
              src={media.filePath}
              alt={media.title || media.fileName}
              className="w-full h-full object-cover"
            />
          ) : media.mediaType === 'video' ? (
            <video
              src={media.filePath}
              className="w-full h-full object-cover"
              preload="metadata"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              {getMediaIcon(media.mediaType)}
              <span className="text-xs mt-2">{media.fileName}</span>
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMedia(media);
              }}
              data-testid={`button-view-${media.id}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {editable && (
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(media);
                }}
                data-testid={`button-delete-${media.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="p-3">
          <p className="font-medium text-sm truncate" data-testid={`text-filename-${media.id}`}>
            {media.title || media.fileName}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(media.fileSize)}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">
              All ({mediaFiles.length})
            </TabsTrigger>
            <TabsTrigger value="image" data-testid="tab-images">
              Images ({filterByType('image').length})
            </TabsTrigger>
            <TabsTrigger value="video" data-testid="tab-videos">
              Videos ({filterByType('video').length})
            </TabsTrigger>
            <TabsTrigger value="document" data-testid="tab-documents">
              Documents ({filterByType('document').length})
            </TabsTrigger>
            <TabsTrigger value="audio" data-testid="tab-audio">
              Audio ({filterByType('audio').length})
            </TabsTrigger>
          </TabsList>
          
          {showAddButton && onAddMedia && (
            <Button onClick={onAddMedia} data-testid="button-add-media">
              Add Media
            </Button>
          )}
        </div>

        <TabsContent value="all" className="mt-0">
          {mediaFiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No media files uploaded yet.</p>
              {showAddButton && onAddMedia && (
                <Button onClick={onAddMedia} className="mt-4" data-testid="button-upload-first">
                  Upload Your First File
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaFiles.map((media) => (
                <MediaCard key={media.id} media={media} />
              ))}
            </div>
          )}
        </TabsContent>

        {['image', 'video', 'document', 'audio'].map((type) => (
          <TabsContent key={type} value={type} className="mt-0">
            {filterByType(type).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No {type}s uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filterByType(type).map((media) => (
                  <MediaCard key={media.id} media={media} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Media Preview Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={(open) => !open && setSelectedMedia(null)}>
        <DialogContent className="max-w-3xl" data-testid="dialog-media-preview">
          {selectedMedia && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMedia.title || selectedMedia.fileName}</DialogTitle>
                <DialogDescription>
                  {selectedMedia.description || 'No description provided'}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4">
                {selectedMedia.mediaType === 'image' && (
                  <img
                    src={selectedMedia.filePath}
                    alt={selectedMedia.title || selectedMedia.fileName}
                    className="w-full rounded-lg"
                    data-testid="img-preview"
                  />
                )}
                {selectedMedia.mediaType === 'video' && (
                  <video
                    src={selectedMedia.filePath}
                    controls
                    className="w-full rounded-lg"
                    data-testid="video-preview"
                  />
                )}
                {selectedMedia.mediaType === 'audio' && (
                  <audio
                    src={selectedMedia.filePath}
                    controls
                    className="w-full"
                    data-testid="audio-preview"
                  />
                )}
                {selectedMedia.mediaType === 'document' && (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 mx-auto text-gray-400" />
                    <p className="mt-4">{selectedMedia.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedMedia.fileSize)}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  asChild
                  data-testid="button-download"
                >
                  <a
                    href={selectedMedia.filePath}
                    download={selectedMedia.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
                {editable && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDelete(selectedMedia);
                      setSelectedMedia(null);
                    }}
                    data-testid="button-delete-preview"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete media file?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{mediaToDelete?.title || mediaToDelete?.fileName}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
