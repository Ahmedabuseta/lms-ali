'use client';

import { useState, useRef } from 'react';
import { Upload, X, File, Image, Video, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadSpacesProps {
  onChange: (url?: string) => void;
  value?: string;
  folder?: string;
  acceptedFileTypes?: string;
  maxFileSize?: number;
  className?: string;
  disabled?: boolean;
}

export const FileUploadSpaces = ({
  onChange,
  value,
  folder = 'uploads',
  acceptedFileTypes = '*/*',
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  className,
  disabled = false,
}: FileUploadSpacesProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.startsWith('video/')) return Video;
    if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File) => {
    if (file.size > maxFileSize) {
      toast.error(`File size exceeds ${formatFileSize(maxFileSize)} limit`);
      return false;
    }

    if (acceptedFileTypes !== '*/*') {
      const types = acceptedFileTypes.split(',').map(type => type.trim());
      const isValidType = types.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.includes(type.replace('*', ''));
      });

      if (!isValidType) {
        toast.error('File type not supported');
        return false;
      }
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      onChange(data.url);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleRemove = () => {
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  if (value) {
    const isImage = value.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(value);
    const fileName = value.split('/').pop() || 'Uploaded File';

    return (
      <div className={cn('relative', className)}>
        {isImage ? (
          <div className="relative group">
            <img
              src={value}
              alt="Uploaded file"
              className="w-full h-48 object-cover rounded-lg border"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
              <Button
                onClick={handleRemove}
                size="sm"
                variant="destructive"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                disabled={disabled}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <div className="flex items-center space-x-3">
              <File className="h-8 w-8 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                {fileName}
              </span>
            </div>
            <Button
              onClick={handleRemove}
              size="sm"
              variant="ghost"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      <div
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
          dragActive && 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
          !dragActive && 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
          (disabled || isUploading) && 'cursor-not-allowed opacity-50',
          isUploading && 'bg-gray-50 dark:bg-gray-800'
        )}
      >
        <div className="space-y-4">
          {isUploading ? (
            <>
              <Loader2 className="h-12 w-12 mx-auto text-blue-500 animate-spin" />
              <div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Uploading...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please wait while your file is being uploaded
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Drop your file here, or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {acceptedFileTypes === '*/*'
                    ? 'All file types supported'
                    : `Supported formats: ${acceptedFileTypes}`}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Maximum file size: {formatFileSize(maxFileSize)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
