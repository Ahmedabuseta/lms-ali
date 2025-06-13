import Tesseract from 'tesseract.js';

/**
 * Performs OCR on an image with optimized settings for text extraction.
 *
 * @param imageData - The image data to process (can be a URL, File, Blob, or base64 data URL)
 * @param onProgress - Optional callback for progress updates
 * @returns A promise that resolves to the extracted text
 */
export async function performOptimizedOCR(
  imageData: string | File | Blob,
  onProgress?: (progress: number) => void
): Promise<string> { try {
    const {
      data: { text },
    } = await Tesseract.recognize(
      imageData,
      'eng', // Language model (English)
      { logger: (m) => {
          console.log(m);
          // Extract progress from logger message if available
          if (onProgress && m.status === 'recognizing text' && m.progress) {
            onProgress(m.progress); }
        },
        // Optional configurations for better performance:
        // tessedit_pageseg_mode: '1', // Automatic page segmentation with OSD
        // tessedit_ocr_engine_mode: '3', // Default, based on what is available
      },
    );
    return text;
  } catch (error) { console.error('Error performing OCR:', error);
    throw error; }
}
