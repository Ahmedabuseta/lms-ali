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
  fileInputRef
}: FileUploadAreaProps) => {
  return (
    <div 
      className={cn(
        "border-2 border-dashed rounded-lg p-6",
        isProcessingImage ? 'bg-muted opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/30 transition-colors',
        "flex flex-col items-center justify-center text-center"
      )}
      onClick={() => !isProcessingImage && fileInputRef.current?.click()}
    >
      {!imagePreview ? (
        <>
          <div className="rounded-full bg-primary/10 p-3 mb-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium mb-1">Click or drag and drop an image</p>
          <p className="text-xs text-muted-foreground">
            Supports JPG, PNG and GIF files
          </p>
        </>
      ) : (
        <div className="relative w-full">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="object-contain rounded-md mx-auto"
            style={{ maxHeight: "250px" }}
          />
          {isProcessingImage && (
            <div className="absolute inset-0 bg-background/50 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
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