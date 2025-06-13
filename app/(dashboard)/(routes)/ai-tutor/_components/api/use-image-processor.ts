import { useState, useCallback } from 'react';
import { performOptimizedOCR } from '../ocr';
import { showNotification } from '@/components/ui/notifications';

export const useImageProcessor = () => { const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageError, setImageError] = useState<string | null>(null);
  const [useClientSideOCR, setUseClientSideOCR] = useState(true);

  // Function to handle image upload
  const processImage = useCallback(
    async (file: File) => {
      try {
        setImageError(null);
        setIsProcessingImage(true);
        setProgress(10);

        // Create file preview
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImagePreview(e.target.result as string); }
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
            setImageError('Error processing image with client-side OCR. Please try server-side mode.');
            setIsProcessingImage(false);
            return { success: false };
          }
        } else { // Server-side OCR
          const formData = new FormData();
          formData.append('image', file);

          const response = await fetch('/api/image-processing/ocr', {
            method: 'POST',
            body: formData, });

          if (!response.ok) {
            throw new Error('Failed to process image on server');
          }

          setProgress(80);
          const data = await response.json();
          text = data.text;
        }

        setExtractedText(text);
        setProgress(100);
        showNotification.success('Image processed successfully', 'Text has been extracted from your image');
        return { success: true };
      } catch (error) { console.error('Image processing error:', error);
        setImageError('Failed to process image. Please try again or use a clearer image.');
        showNotification.error(
          'Image processing failed',
          'Unable to extract text from the image. Please try again with a clearer image.',
        );
        return { success: false };
      } finally {
        setIsProcessingImage(false);
      }
    },
    [useClientSideOCR],
  );

  // Reset image processing
  const resetImageProcessing = useCallback(() => {
    setImagePreview(null);
    setExtractedText('');
    setProgress(0);
    setImageError(null);
  }, []);

  return { imagePreview,
    extractedText,
    isProcessingImage,
    progress,
    imageError,
    useClientSideOCR,
    setUseClientSideOCR,
    processImage,
    resetImageProcessing,
    setExtractedText, };
};
