import { useRef, useState } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onUpload: (file: File | File[]) => void;
  children?: React.ReactNode;
  className?: string;
}

export default function FileUpload({
  accept = "*/*",
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  onUpload,
  children,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      if (multiple) {
        onUpload(validFiles);
      } else {
        onUpload(validFiles[0]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  if (children) {
    return (
      <div className={className}>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />
        <div onClick={handleClick}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "upload-zone p-8 rounded-lg text-center cursor-pointer transition-all",
          isDragging && "border-[var(--wellness-green)] bg-[var(--wellness-light)]"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <Upload className="w-12 h-12 text-[var(--wellness-teal)] mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-700 mb-2">
          {isDragging ? "Drop files here" : "Upload Files"}
        </h4>
        <p className="text-gray-500 text-sm mb-4">
          Drag & drop files here or click to browse
        </p>
        <Button type="button" className="btn-primary">
          Choose Files
        </Button>
      </div>

      {uploadProgress !== null && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium text-gray-700">Selected Files:</h5>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-700 text-sm">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
