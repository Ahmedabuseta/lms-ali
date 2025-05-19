import { useState, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { performOptimizedOCR } from './ocr';
import { showNotification } from '@/components/ui/notifications';
import { OCRModeToggle } from './image-upload/ocr-mode-toggle';
import { FileUploadArea } from './image-upload/file-upload-area';
import { ProcessingStatus } from './image-upload/processing-status';
import { ExtractedText } from './image-upload/extracted-text';

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTextExtracted: (text: string) => void;
}

export const ImageUploadDialog = ({
  open,
  onOpenChange,
  onTextExtracted,
}: ImageUploadDialogProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageError, setImageError] = useState<string | null>(null);
  const [useClientSideOCR, setUseClientSideOCR] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to handle image upload
  const handleFileChange = async (file: File) => {
    try {
      setImageError(null);
      setIsProcessingImage(true);
      setProgress(10);

      // Create file preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      setProgress(20);

      let text = '';

      if (useClientSideOCR) {
        // Client-side OCR
        try {
          text = await performOptimizedOCR(file, (progress: number) => {
            setProgress(20 + Math.round(progress * 60)); // Scale to 20%-80%
          });
          setProgress(90);
        } catch (error) {
          setImageError("Error processing image with client-side OCR. Please try server-side mode.");
          setIsProcessingImage(false);
          return;
        }
      } else {
        // Server-side OCR
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/image-processing/ocr', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to process image on server');
        }
        
        setProgress(80);
        const data = await response.json();
        text = data.text;
      }

      setExtractedText(text);
      setProgress(100);
      showNotification.success("Image processed successfully", "Text has been extracted from your image");
    } catch (error) {
      console.error('Image processing error:', error);
      setImageError('Failed to process image. Please try again or use a clearer image.');
      showNotification.error("Image processing failed", "Unable to extract text from the image. Please try again with a clearer image.");
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Reset image processing
  const resetImageProcessing = () => {
    setImagePreview(null);
    setExtractedText('');
    setProgress(0);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add extracted text to chat input
  const handleAddToChat = () => {
    if (extractedText) {
      onTextExtracted(extractedText);
      onOpenChange(false);
      resetImageProcessing();
      showNotification.success('Text added to chat input');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Extract Text from Image</DialogTitle>
          <DialogDescription>
            Upload an image containing text to extract and add to your message.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <OCRModeToggle
            useClientSideOCR={useClientSideOCR}
            onToggle={setUseClientSideOCR}
            disabled={isProcessingImage}
          />
          
          <FileUploadArea
            imagePreview={imagePreview}
            isProcessingImage={isProcessingImage}
            onFileSelect={handleFileChange}
            fileInputRef={fileInputRef}
          />
          
          <ProcessingStatus
            isProcessingImage={isProcessingImage}
            progress={progress}
            imageError={imageError}
          />
          
          <ExtractedText
            text={extractedText}
            onChange={setExtractedText}
          />
          
          <div className="flex justify-between gap-2 mt-4">
            <Button
              variant="outline"
              disabled={isProcessingImage}
              onClick={() => {
                resetImageProcessing();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={isProcessingImage || !imagePreview}
                onClick={resetImageProcessing}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                disabled={isProcessingImage || !extractedText}
                onClick={handleAddToChat}
              >
                Add to Chat
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 