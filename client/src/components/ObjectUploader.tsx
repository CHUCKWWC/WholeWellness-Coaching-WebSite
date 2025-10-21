import { useEffect, useRef, useState } from 'react';
import Uppy, { UppyFile } from '@uppy/core';
import { Dashboard } from '@uppy/react';
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ObjectUploaderProps {
  onUploadComplete: (uploadURL: string, file: UppyFile) => void;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxNumberOfFiles?: number;
  acceptedMimeTypes?: string[];
  note?: string;
  height?: number;
}

export function ObjectUploader({
  onUploadComplete,
  allowedFileTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx', '.txt'],
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  maxNumberOfFiles = 1,
  acceptedMimeTypes,
  note,
  height = 350,
}: ObjectUploaderProps) {
  const { toast } = useToast();
  const uppyRef = useRef<Uppy | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const uppy = new Uppy({
      restrictions: {
        maxFileSize,
        maxNumberOfFiles,
        allowedFileTypes: acceptedMimeTypes || allowedFileTypes,
      },
      autoProceed: false,
    });

    uppy.on('file-added', (file) => {
      console.log('File added:', file.name);
    });

    uppy.on('upload', () => {
      setUploading(true);
    });

    uppy.on('upload-success', async (file, response) => {
      if (!file) return;
      
      try {
        // The upload URL is the response from our custom uploader
        const uploadURL = response.uploadURL as string;
        onUploadComplete(uploadURL, file);
        
        toast({
          title: 'Upload successful',
          description: `${file.name} has been uploaded.`,
        });
      } catch (error) {
        console.error('Upload callback error:', error);
        toast({
          title: 'Error',
          description: 'Failed to process upload',
          variant: 'destructive',
        });
      } finally {
        setUploading(false);
      }
    });

    uppy.on('upload-error', (file, error) => {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
      setUploading(false);
    });

    uppy.on('complete', () => {
      setUploading(false);
    });

    uppyRef.current = uppy;

    return () => {
      uppy.close();
    };
  }, [allowedFileTypes, maxFileSize, maxNumberOfFiles, acceptedMimeTypes, onUploadComplete, toast]);

  // Custom uploader function
  useEffect(() => {
    if (!uppyRef.current) return;

    uppyRef.current.use(CustomUploader as any);
  }, []);

  return (
    <div className="object-uploader">
      <Dashboard
        uppy={uppyRef.current!}
        height={height}
        note={note}
        proudlyDisplayPoweredByUppy={false}
        showProgressDetails
        theme="light"
      />
    </div>
  );
}

// Custom Uppy uploader that uses our presigned URL flow
class CustomUploader {
  id = 'CustomUploader';
  type = 'uploader';
  uppy: Uppy;

  constructor(uppy: Uppy) {
    this.uppy = uppy;
    this.upload = this.upload.bind(this);
  }

  async upload(fileIDs: string[]) {
    const files = fileIDs.map((id) => this.uppy.getFile(id));

    const uploadPromises = files.map(async (file) => {
      try {
        // Step 1: Get presigned upload URL from our backend
        const { uploadURL } = await apiRequest('/api/objects/upload', {
          method: 'POST',
        });

        this.uppy.emit('upload-progress', file, {
          uploader: this,
          bytesUploaded: 0,
          bytesTotal: file.size,
        });

        // Step 2: Upload file directly to object storage
        const uploadResponse = await fetch(uploadURL, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
          body: file.data,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        this.uppy.emit('upload-progress', file, {
          uploader: this,
          bytesUploaded: file.size,
          bytesTotal: file.size,
        });

        // Return the upload URL for the success handler
        return {
          successful: [file],
          failed: [],
          uploadURL, // Pass the URL to the success handler
        };
      } catch (error) {
        console.error('Upload error for file:', file.name, error);
        return {
          successful: [],
          failed: [file],
        };
      }
    });

    const results = await Promise.all(uploadPromises);

    // Combine results
    const successful: UppyFile[] = [];
    const failed: UppyFile[] = [];

    results.forEach((result) => {
      successful.push(...result.successful);
      failed.push(...result.failed);
    });

    // Emit success for each successful upload
    results.forEach((result) => {
      if (result.successful.length > 0 && result.uploadURL) {
        result.successful.forEach((file) => {
          this.uppy.emit('upload-success', file, { uploadURL: result.uploadURL });
        });
      }
    });

    return { successful, failed };
  }

  install() {
    // CRITICAL: Register the uploader with Uppy
    this.uppy.addUploader(this.upload);
  }

  uninstall() {
    // Remove the uploader when plugin is uninstalled
    this.uppy.removeUploader(this.upload);
  }
}

// Simpler file input version for single file uploads
interface SimpleFileUploaderProps {
  onUploadComplete: (uploadURL: string, fileName: string, fileSize: number, mimeType: string) => void;
  accept?: string;
  maxSize?: number;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
}

export function SimpleFileUploader({
  onUploadComplete,
  accept = 'image/*,video/*',
  maxSize = 50 * 1024 * 1024,
  buttonText = 'Choose File',
  className = '',
  disabled = false,
}: SimpleFileUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: `Maximum file size is ${Math.round(maxSize / 1024 / 1024)}MB`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);

      // Get presigned upload URL
      const { uploadURL } = await apiRequest('/api/objects/upload', {
        method: 'POST',
      });

      // Upload file directly to object storage
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      onUploadComplete(uploadURL, file.name, file.size, file.type);

      toast({
        title: 'Upload successful',
        description: `${file.name} has been uploaded.`,
      });

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
        id="simple-file-upload"
        data-testid="input-file-upload"
      />
      <label
        htmlFor="simple-file-upload"
        className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer
          ${disabled || uploading 
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        data-testid="button-file-upload"
      >
        {uploading ? 'Uploading...' : buttonText}
      </label>
    </div>
  );
}
