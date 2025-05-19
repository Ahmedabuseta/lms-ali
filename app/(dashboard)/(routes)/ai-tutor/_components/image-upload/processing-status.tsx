import { AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProcessingStatusProps {
  isProcessingImage: boolean;
  progress: number;
  imageError: string | null;
}

export const ProcessingStatus = ({
  isProcessingImage,
  progress,
  imageError
}: ProcessingStatusProps) => {
  return (
    <>
      {/* Progress bar */}
      {isProcessingImage && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            Extracting text... {progress}%
          </p>
        </div>
      )}
      
      {/* Error message */}
      {imageError && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{imageError}</p>
        </div>
      )}
    </>
  );
}; 