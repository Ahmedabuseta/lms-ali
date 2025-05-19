import { Cpu } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface OCRModeToggleProps {
  useClientSideOCR: boolean;
  onToggle: (value: boolean) => void;
  disabled: boolean;
}

export const OCRModeToggle = ({
  useClientSideOCR,
  onToggle,
  disabled
}: OCRModeToggleProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Label htmlFor="client-side-ocr">Process locally</Label>
          <div className="flex items-center h-5">
            <Cpu className="h-3.5 w-3.5 text-slate-500" />
          </div>
        </div>
        <Switch
          id="client-side-ocr"
          checked={useClientSideOCR}
          onCheckedChange={onToggle}
          disabled={disabled}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {useClientSideOCR 
          ? "Process images in your browser (faster, works offline)" 
          : "Process images on the server (more accurate)"
        }
      </p>
    </div>
  );
}; 