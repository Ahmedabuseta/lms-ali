'use client';

import { useState, useRef } from 'react';
import { Upload, X, File, Image, Video, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploadArabicProps { onChange: (url?: string) => void;
  value?: string;
  folder?: string;
  acceptedFileTypes?: string;
  maxFileSize?: number;
  className?: string;
  disabled?: boolean;
  description?: string;
  showProgress?: boolean; }

export const FileUploadArabic = ({ onChange,
  value,
  folder = 'uploads',
  acceptedFileTypes = '*/*',
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  className,
  disabled = false,
  description,
  showProgress = true, }: FileUploadArabicProps) => { const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'preparing' | 'uploading' | 'success' | 'error'>('idle');
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [uploadSpeed, setUploadSpeed] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const uploadStartTime = useRef<number>(0);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.startsWith('video/')) return Video;
    if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
    return File; };

  const formatFileSize = (bytes: number) => { if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]; };

  const getAcceptedTypesArabic = (types: string) => { if (types === '*/*') return 'جميع أنواع الملفات';
    if (types === 'image/*') return 'ملفات الصور (JPG, PNG, GIF)';
    if (types === 'video/*') return 'ملفات الفيديو (MP4, AVI, MOV)';
    if (types.includes('pdf')) return 'ملفات PDF والمستندات';
    return types.replace(/\./g, '').replace(/,/g, '، '); };

  const validateFile = (file: File) => {
    if (file.size > maxFileSize) {
      toast.error(`حجم الملف يتجاوز الحد المسموح ${formatFileSize(maxFileSize)}`);
      return false;
    }

    if (acceptedFileTypes !== '*/*') { const types = acceptedFileTypes.split(',').map(type => type.trim());
      const isValidType = types.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase()); }
        return file.type.includes(type.replace('*', ''));
      });

      if (!isValidType) {
        toast.error('نوع الملف غير مدعوم');
        return false;
      }
    }

    return true;
  };

  const calculateUploadStats = (loaded: number, total: number, startTime: number) => {
    const currentTime = Date.now();
    const elapsedTime = (currentTime - startTime) / 1000; // seconds
    const speed = loaded / elapsedTime; // bytes per second
    const remaining = (total - loaded) / speed; // seconds remaining

    const speedMB = speed / (1024 * 1024);
    const speedText = speedMB > 1
      ? `${speedMB.toFixed(1)} ميجابايت/ث`
      : `${(speed / 1024).toFixed(1)} كيلوبايت/ث`;

    const remainingText = remaining < 60
      ? `${Math.round(remaining)} ثانية`
      : `${Math.round(remaining / 60)} دقيقة`;

    return { speedText, remainingText };
  };

  const uploadFile = async (file: File) => { if (!validateFile(file)) return;

    // Step 1: Show preparing state
    setUploadStatus('preparing');
    setCurrentFileName(file.name);
    setUploadSpeed('');
    setTimeRemaining('');
    setUploadProgress(0);

    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr; // Store reference for potential cancellation

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Track upload progress with detailed feedback
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          // Step 2: Switch to uploading state only when real progress starts
          if (uploadStatus === 'preparing') {
            setUploadStatus('uploading');
            setIsUploading(true);
            uploadStartTime.current = Date.now(); }

          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);

          // Calculate upload speed and time remaining
          if (event.loaded > 0 && uploadStartTime.current > 0) { const stats = calculateUploadStats(event.loaded, event.total, uploadStartTime.current);
            setUploadSpeed(stats.speedText);
            setTimeRemaining(stats.remainingText); }
        }
      });

      // When upload starts, we can switch to uploading state
      xhr.upload.addEventListener('loadstart', () => {
        if (uploadStatus === 'preparing') {
          setUploadStatus('uploading');
          setIsUploading(true);
          uploadStartTime.current = Date.now();
        }
      });

      // Handle successful upload
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            setUploadProgress(100);

            setTimeout(() => {
              onChange(data.url);
              setUploadStatus('success');
              toast.success('تم رفع الملف بنجاح');

              // Reset after showing success
              setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
                setUploadStatus('idle');
                resolve();
              }, 1500);
            }, 300);
          } catch (error) { console.error('Parse error:', error);
            setUploadStatus('error');
            toast.error('خطأ في معالجة الاستجابة');
            setTimeout(() => {
              setIsUploading(false);
              setUploadProgress(0);
              setUploadStatus('idle');
              reject(error); }, 2000);
          }
        } else {
          // Handle HTTP errors
          let errorMessage = 'فشل في رفع الملف';
          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // Use default error message
          }

          console.error('Upload error:', xhr.status, xhr.statusText);
          setUploadStatus('error');
          toast.error(errorMessage);

          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
            setUploadStatus('idle');
            reject(new Error(errorMessage));
          }, 2000);
        }
      });

      // Handle network errors
      xhr.addEventListener('error', () => {
        console.error('Network error during upload');
        setUploadStatus('error');
        toast.error('خطأ في الشبكة أثناء الرفع');

        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setUploadStatus('idle');
          reject(new Error('Network error'));
        }, 2000);
      });

      // Handle upload cancellation
      xhr.addEventListener('abort', () => {
        console.log('Upload cancelled');
        setUploadStatus('error');
        toast.error('تم إلغاء رفع الملف');

        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setUploadStatus('idle');
          reject(new Error('Upload cancelled'));
        }, 1000);
      });

      // Start the upload
      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
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

    if (disabled || isUploading || uploadStatus === 'preparing') return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading && uploadStatus !== 'preparing') {
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
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(0);
    setUploadStatus('idle');
    setCurrentFileName('');
    setUploadSpeed('');
    setTimeRemaining('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (!disabled && !isUploading && uploadStatus !== 'preparing') {
      fileInputRef.current?.click();
    }
  };

  // Display uploaded file
  if (value && uploadStatus !== 'uploading') { const isImage = value.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(value);

    // Extract original filename from the URL (remove timestamp and random ID)
    const urlFileName = value.split('/').pop() || 'ملف مرفوع';
    const fileName = urlFileName.includes('_')
      ? urlFileName.split('_').slice(2).join('_') // Remove timestamp and random ID
      : urlFileName;

    return (
      <div className={cn('relative', className) }>
        { isImage ? (
          <div className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <img
              src={value }
              alt="الملف المرفوع"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <Button
                onClick={handleRemove}
                size="sm"
                variant="destructive"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-arabic"
                disabled={disabled}
              >
                <X className="h-4 w-4 ml-1" />
                إزالة
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="flex-shrink-0">
                <File className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 truncate font-arabic">
                  {fileName}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 font-arabic">
                  تم الرفع بنجاح
                </p>
              </div>
            </div>
            <Button
              onClick={handleRemove}
              size="sm"
              variant="ghost"
              disabled={disabled}
              className="text-blue-600 hover:text-blue-700 font-arabic"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={ cn('w-full', className) }>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes}
        onChange={handleFileChange}
        disabled={disabled || isUploading || uploadStatus === 'preparing'}
        className="hidden"
      />

      <div
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={ cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 relative overflow-hidden',
          dragActive && 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-[1.02] shadow-lg',
          !dragActive && uploadStatus === 'idle' && 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-md',
          (uploadStatus === 'uploading' || uploadStatus === 'preparing') && 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-md',
          uploadStatus === 'success' && 'border-green-500 bg-green-50 dark:bg-green-950/20 shadow-green-100 dark:shadow-green-950/20',
          uploadStatus === 'error' && 'border-red-500 bg-red-50 dark:bg-red-950/20 shadow-red-100 dark:shadow-red-950/20',
          (disabled || isUploading || uploadStatus === 'preparing') && 'cursor-not-allowed opacity-50'
        ) }
      >
        <div className="space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            {(uploadStatus === 'uploading' || uploadStatus === 'preparing') && (
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            )}
            {uploadStatus === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {uploadStatus === 'error' && (
              <AlertCircle className="h-12 w-12 text-red-500" />
            )}
            {uploadStatus === 'idle' && (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
          </div>

          {/* Text */}
          <div>
            { uploadStatus === 'preparing' && (
              <>
                <p className="text-lg font-medium text-blue-700 dark:text-blue-300 font-arabic">
                  جاري تحضير الملف...
                </p>
                {currentFileName && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-arabic truncate max-w-md">
                    📄 {currentFileName }
                  </p>
                )}
                <p className="text-xs text-blue-500 dark:text-blue-400 mt-2 font-arabic">
                  🔄 يتم تجهيز الملف للرفع، يرجى الانتظار...
                </p>
              </>
            )}
            { uploadStatus === 'uploading' && (
              <>
                <p className="text-lg font-medium text-blue-700 dark:text-blue-300 font-arabic">
                  جاري رفع الملف...
                </p>
                {currentFileName && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-arabic truncate max-w-md">
                    📄 {currentFileName }
                  </p>
                )}
                <div className="text-xs text-blue-500 dark:text-blue-400 mt-2 space-y-1">
                  { uploadSpeed && (
                    <p className="font-arabic">⚡ سرعة الرفع: {uploadSpeed }</p>
                  )}
                  { timeRemaining && uploadProgress < 95 && (
                    <p className="font-arabic">⏱️ الوقت المتبقي: {timeRemaining }</p>
                  )}
                </div>
              </>
            )}
            { uploadStatus === 'success' && (
              <>
                <p className="text-lg font-medium text-green-700 dark:text-green-300 font-arabic">
                  تم رفع الملف بنجاح!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 font-arabic">
                  يمكنك الآن استخدام الملف
                </p>
              </>
            ) }
            { uploadStatus === 'error' && (
              <>
                <p className="text-lg font-medium text-red-700 dark:text-red-300 font-arabic">
                  فشل في رفع الملف
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 font-arabic">
                  يرجى المحاولة مرة أخرى
                </p>
              </>
            ) }
            { uploadStatus === 'idle' && (
              <>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 font-arabic">
                  اسحب الملف هنا أو انقر للتصفح
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-center space-x-4 space-x-reverse text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <span className="text-blue-500">📎</span>
                      <span className="font-arabic">{getAcceptedTypesArabic(acceptedFileTypes) }</span>
                    </div>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <span className="text-green-500">📏</span>
                      <span className="font-arabic">{formatFileSize(maxFileSize)}</span>
                    </div>
                  </div>
                  { description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 font-arabic bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md">
                      💡 {description }
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Progress Bar - Only show during actual uploading with real progress */}
          {showProgress && uploadStatus === 'uploading' && uploadProgress > 0 && (
            <div className="w-full max-w-sm mx-auto space-y-3">
              <div className="space-y-2">
                <Progress
                  value={uploadProgress}
                  variant="default"
                  className="h-4 bg-gray-200 dark:bg-gray-700"
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-600 dark:text-blue-400 font-arabic font-semibold">
                    {Math.round(uploadProgress)}%
                  </span>
                  { uploadSpeed && (
                    <span className="text-gray-500 dark:text-gray-400 font-arabic">
                      {uploadSpeed }
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                { timeRemaining && uploadProgress < 95 ? (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-arabic">
                    ⏱️ {timeRemaining }
                  </span>
                ) : (
                  <span className="text-xs text-green-600 dark:text-green-400 font-arabic">
                    { uploadProgress >= 95 ? 'جاري الانتهاء...' : '' }
                  </span>
                )}

                <Button
                  onClick={handleCancelUpload}
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 font-arabic transition-colors"
                >
                  <X className="h-3 w-3 ml-1" />
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
