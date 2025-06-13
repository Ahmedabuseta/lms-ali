import { AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProcessingStatusProps { isProcessingImage: boolean;
  progress: number;
  imageError: string | null; }

export const ProcessingStatus = ({ isProcessingImage, progress, imageError }: ProcessingStatusProps) => {
  return (
    <>
      {/* Progress bar */}
      {isProcessingImage && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-xs text-muted-foreground">Extracting text... {progress}%</p>
        </div>
      )}

      {/* Error message */}
      {imageError && (
        <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-destructive">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{imageError}</p>
        </div>
      )}
    </>
  );
};
