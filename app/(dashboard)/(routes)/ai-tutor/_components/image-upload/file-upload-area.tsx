import { Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadAreaProps {
  imagePreview: string | null;
  isProcessingImage: boolean;
  onFileSelect: (file: File) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const FileUploadArea = ({
  imagePreview,
  isProcessingImage,
  onFileSelect,
  fileInputRef,
}: FileUploadAreaProps) => {
  return (
    <div
      className={cn(
        'rounded-lg border-2 border-dashed p-6',
        isProcessingImage
          ? 'cursor-not-allowed bg-muted opacity-50'
          : 'cursor-pointer transition-colors hover:bg-muted/30',
        'flex flex-col items-center justify-center text-center',
      )}
      onClick={() => !isProcessingImage && fileInputRef.current?.click()}
    >
      {!imagePreview ? (
        <>
          <div className="mb-3 rounded-full bg-primary/10 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <p className="mb-1 text-sm font-medium">Click or drag and drop an image</p>
          <p className="text-xs text-muted-foreground">Supports JPG, PNG and GIF files</p>
        </>
      ) : (
        <div className="relative w-full">
          <img
            src={imagePreview}
            alt="Preview"
            className="mx-auto rounded-md object-contain"
            style={{ maxHeight: '250px' }}
          />
          {isProcessingImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50">
              <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Processing image...</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        hidden
      />
    </div>
  );
};
