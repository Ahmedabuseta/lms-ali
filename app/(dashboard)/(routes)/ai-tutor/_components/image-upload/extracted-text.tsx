import { Textarea } from '@/components/ui/textarea';

interface ExtractedTextProps { text: string;
  onChange: (text: string) => void; }

export const ExtractedText = ({ text, onChange }: ExtractedTextProps) => { if (!text) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Extracted Text:</p>
      <div className="relative">
        <Textarea value={text } onChange={(e) => onChange(e.target.value)} className="min-h-[120px] font-mono text-sm" />
      </div>
    </div>
  );
};
