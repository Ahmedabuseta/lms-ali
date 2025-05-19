'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, Image, Copy, Check, Loader2, AlertCircle, RefreshCw, RotateCw, Maximize2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createWorker } from 'tesseract.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const LANGUAGE_OPTIONS = [
  { value: 'eng', label: 'English' },
  { value: 'spa', label: 'Spanish' },
  { value: 'fra', label: 'French' },
  { value: 'deu', label: 'German' },
  { value: 'ara', label: 'Arabic' },
  { value: 'chi_sim', label: 'Chinese (Simplified)' },
  { value: 'jpn', label: 'Japanese' },
];

// Types
interface ImageToTextProps {
  onTextExtracted?: (text: string) => void;
  maxHeight?: string;
  showPreview?: boolean;
  clientSideProcessing?: boolean;
}

// Helper functions
const performOptimizedOCR = async (
  imageData: string, 
  language: string, 
  enhancedMode: boolean,
  progressCallback: (status: string, progress?: number) => void
) => {
  const worker = await createWorker(language, enhancedMode ? 1 : undefined, {
    logger: m => {
      if (m.status === 'recognizing text') {
        progressCallback(`Processing: ${Math.round(m.progress * 100)}%`, m.progress * 100);
      } else {
        progressCallback(`${m.status}...`);
      }
    },
  });

  try {
    if (enhancedMode) {
      await worker.setParameters({
        tessedit_pageseg_mode: "6", // Assume a single uniform block of text
        tessedit_ocr_engine_mode: "2", // Legacy + LSTM mode for better accuracy
        preserve_interword_spaces: "1", // Preserve spaces
      });
    }

    const { data } = await worker.recognize(imageData);
    return data;
  } finally {
    await worker.terminate();
  }
};

export const ImageToText = ({
  onTextExtracted,
  maxHeight = "300px",
  showPreview = true,
  clientSideProcessing = false
}: ImageToTextProps) => {
  // State management
  const [state, setState] = useState({
    imagePreview: null as string | null,
    extractedText: '',
    isProcessing: false,
    progress: 0,
    error: null as string | null,
    copied: false,
    selectedImage: null as string | null,
    ocrStatus: '',
    language: 'eng',
    confidence: null as number | null,
    fullscreenPreview: false,
  });
  
  // Image adjustment state
  const [imageAdjustments, setImageAdjustments] = useState({
    rotation: 0,
    contrastLevel: [0] as number[],
    brightLevel: [0] as number[],
    enhancedProcessing: false,
  });
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Reset image processing settings when a new image is selected
  useEffect(() => {
    if (state.selectedImage === null) {
      setImageAdjustments({
        rotation: 0,
        contrastLevel: [0],
        brightLevel: [0],
        enhancedProcessing: imageAdjustments.enhancedProcessing,
      });
    }
  }, [state.selectedImage]);

  // Apply image transformations when adjustments change
  useEffect(() => {
    if (state.selectedImage && canvasRef.current) {
      applyImageTransformations();
    }
  }, [imageAdjustments.rotation, imageAdjustments.contrastLevel, imageAdjustments.brightLevel, state.selectedImage]);
  
  // Image transformation functions
  const applyImageTransformations = () => {
    if (!state.selectedImage || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      // Handle rotation
      const { rotation, contrastLevel, brightLevel } = imageAdjustments;
      const isVerticalRotation = rotation === 90 || rotation === 270;
      canvas.width = isVerticalRotation ? img.height : img.width;
      canvas.height = isVerticalRotation ? img.width : img.height;
      
      // Clear and rotate
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
      ctx.restore();
      
      // Apply contrast and brightness if needed
      if (contrastLevel[0] !== 0 || brightLevel[0] !== 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const contrast = (contrastLevel[0] / 50) * 2.5 + 1;
        const brightness = brightLevel[0];
        
        for (let i = 0; i < data.length; i += 4) {
          // Apply brightness
          data[i] = Math.min(255, Math.max(0, data[i] + brightness));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightness));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightness));
          
          // Apply contrast
          data[i] = Math.min(255, Math.max(0, ((data[i] - 128) * contrast) + 128));
          data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - 128) * contrast) + 128));
          data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - 128) * contrast) + 128));
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
      
      // Update preview
      setState(prev => ({
        ...prev,
        imagePreview: canvas.toDataURL('image/png')
      }));
    };
    img.src = state.selectedImage;
  };
  
  // Animation for progress
  const startProgressAnimation = () => {
    setState(prev => ({ ...prev, progress: 0 }));
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        progress: prev.progress >= 95 ? 95 : prev.progress + 5
      }));
    }, 300);
    
    return () => clearInterval(interval);
  };
  
  // Image handling
  const rotateImage = () => {
    setImageAdjustments(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  };
  
  // OCR Processing
  const processImage = async () => {
    if (!state.imagePreview) return;
    
    // Update state to show processing
    setState(prev => ({
      ...prev, 
      isProcessing: true, 
      ocrStatus: 'Processing...',
      error: null
    }));
    
    try {
      // Start progress animation
      const cleanupProgress = startProgressAnimation();
      
      if (clientSideProcessing) {
        // Client-side processing with Tesseract
        const { text, confidence } = await performOptimizedOCR(
          state.imagePreview, 
          state.language, 
          imageAdjustments.enhancedProcessing,
          (status, progress) => {
            setState(prev => ({ 
              ...prev, 
              ocrStatus: status,
              progress: progress ? progress * 100 : prev.progress
            }));
          }
        );
        
        // Update state with results
        setState(prev => ({
          ...prev,
          extractedText: text,
          confidence: confidence,
          progress: 100,
          isProcessing: false,
        }));
        
        // Notify callback if provided
        if (onTextExtracted) {
          onTextExtracted(text);
        }
        
        toast.success(`Text extracted with ${Math.round(confidence)}% confidence`, { 
          position: 'bottom-center' 
        });
      } else {
        // Server-side processing
        await serverSideProcessing();
      }
      
      // Cleanup
      return () => cleanupProgress();
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 0,
        error: `Failed to extract text: ${error.message || 'Unknown error'}`,
        ocrStatus: 'Error occurred during processing.'
      }));
      
      toast.error('Failed to extract text from image');
      console.error(error);
    }
  };
  
  // Server-side OCR processing
  const serverSideProcessing = async () => {
    if (!state.selectedImage) return;
    
    // Create a blob from the data URL
    const fetchBlob = async (dataUrl: string) => {
      const response = await fetch(dataUrl);
      return await response.blob();
    };
    
    try {
      const blob = await fetchBlob(state.imagePreview!);
      const file = new File([blob], "image.png", { type: "image/png" });
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('language', state.language);
      
      // Set timeout to prevent indefinite loading
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 30000);
      });
      
      // Send to API
      const fetchPromise = fetch('/api/image-processing', {
        method: 'POST',
        body: formData,
      });
      
      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to process image');
      }
      
      const data = await response.json();
      
      // Complete progress animation
      setState(prev => ({
        ...prev,
        progress: 100,
        confidence: data.confidence || null
      }));
      
      setTimeout(() => {
        setState(prev => ({ ...prev, isProcessing: false }));
        
        if (data.text && data.text.trim()) {
          setState(prev => ({ ...prev, extractedText: data.text }));
          toast.success(
            `Text extracted with ${Math.round(data.confidence)}% confidence`,
            { position: 'bottom-center' }
          );
        } else {
          setState(prev => ({ 
            ...prev, 
            extractedText: "No text was detected in this image." 
          }));
          
          toast.warning("No text could be detected in the image", {
            position: 'bottom-center'
          });
        }
      }, 500);
      
    } catch (err: any) {
      // Handle specific error cases
      if (err.message && err.message.includes('timed out')) {
        setState(prev => ({
          ...prev,
          error: 'The request timed out. The image may be too large or complex.',
          isProcessing: false,
          progress: 0
        }));
        
        toast.error('Image processing timed out');
      } else {
        setState(prev => ({
          ...prev,
          error: err.message || 'An error occurred while processing the image',
          isProcessing: false,
          progress: 0
        }));
        
        toast.error('Failed to extract text from image');
      }
      console.error(err);
    }
  };
  
  // File handling
  const handleFileChange = async (file: File) => {
    if (!file) return;
    
    try {
      // Reset states
      setState(prev => ({
        ...prev,
        error: null,
        extractedText: '',
        copied: false,
        ocrStatus: '',
        confidence: null,
      }));
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setState(prev => ({ 
          ...prev, 
          error: 'Please select an image file' 
        }));
        return;
      }
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setState(prev => ({ 
          ...prev, 
          error: `Image size exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` 
        }));
        return;
      }
      
      // Display image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setState(prev => ({ 
          ...prev, 
          imagePreview: result,
          selectedImage: result,
          isProcessing: true
        }));
        
        // Start processing after a short delay to allow image preview to render
        setTimeout(() => processImage(), 500);
      };
      reader.readAsDataURL(file);
      
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 0,
        error: err.message || 'An error occurred while processing the image'
      }));
      console.error(err);
    }
  };
  
  // File drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (state.isProcessing) return;
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  // Copy to clipboard
  const copyToClipboard = () => {
    if (!state.extractedText) return;
    
    navigator.clipboard.writeText(state.extractedText)
      .then(() => {
        setState(prev => ({ ...prev, copied: true }));
        toast.success('Text copied to clipboard');
        setTimeout(() => setState(prev => ({ ...prev, copied: false })), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text:', err);
        toast.error('Failed to copy text');
      });
  };
  
  // Reset component
  const handleReset = () => {
    setState({
      imagePreview: null,
      selectedImage: null,
      extractedText: '',
      error: null,
      copied: false,
      progress: 0,
      ocrStatus: '',
      isProcessing: false,
      language: 'eng',
      confidence: null,
      fullscreenPreview: false,
    });
    
    setImageAdjustments({
      rotation: 0,
      contrastLevel: [0],
      brightLevel: [0],
      enhancedProcessing: false,
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Component rendering
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Image to Text
          </CardTitle>
          <CardDescription>
            Extract text from images with OCR technology {clientSideProcessing ? "(Client-side)" : "(Server-side)"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* File upload area */}
          <div
            ref={dropAreaRef}
            className={`
              border-2 border-dashed rounded-lg p-6 
              ${state.isProcessing ? 'bg-muted opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/30 transition-colors'}
              flex flex-col items-center justify-center text-center
            `}
            onClick={() => !state.isProcessing && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            role="button"
            tabIndex={0}
            aria-label="Upload image"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                !state.isProcessing && fileInputRef.current?.click();
              }
            }}
          >
            {!state.imagePreview ? (
              <>
                <div className="rounded-full bg-primary/10 p-3 mb-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium mb-1">Click or drag and drop an image</p>
                <p className="text-xs text-muted-foreground">
                  Supports JPG, PNG and GIF files (max 5MB)
                </p>
              </>
            ) : showPreview ? (
              <div className="relative w-full">
                <img 
                  src={state.imagePreview} 
                  alt="Preview" 
                  className="object-contain rounded-md mx-auto"
                  style={{ maxHeight }}
                  onError={() => {
                    setState(prev => ({ 
                      ...prev, 
                      error: "Failed to load image preview",
                      imagePreview: null 
                    }));
                  }}
                />
                {/* Image controls */}
                {!state.isProcessing && state.imagePreview && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setState(prev => ({ ...prev, fullscreenPreview: true }));
                      }}
                      className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                      title="View full size"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        rotateImage();
                      }}
                      className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                      title="Rotate image"
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {/* Processing overlay */}
                {state.isProcessing && (
                  <div className="absolute inset-0 bg-background/50 flex flex-col items-center justify-center backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm font-medium">
                      {state.ocrStatus || "Processing image..."}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 py-2">
                <Image className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium">Image selected</p>
                {state.isProcessing && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              hidden
              aria-hidden="true"
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
          
          {/* Image adjustments */}
          {state.imagePreview && !state.isProcessing && (
            <div className="space-y-3 p-3 border rounded-lg">
              {/* Language selection */}
              <div className="flex items-center justify-between">
                <Label htmlFor="language" className="text-sm">OCR Language</Label>
                <Select
                  value={state.language}
                  onValueChange={(value) => setState(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger id="language" className="w-[180px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Enhanced processing toggle (client-side only) */}
              {clientSideProcessing && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="enhanced-processing" className="text-sm">
                      Enhanced Processing
                    </Label>
                    <p className="text-xs text-muted-foreground">(Slower but more accurate)</p>
                  </div>
                  <Switch
                    id="enhanced-processing"
                    checked={imageAdjustments.enhancedProcessing}
                    onCheckedChange={(checked) => setImageAdjustments(prev => ({ 
                      ...prev, 
                      enhancedProcessing: checked 
                    }))}
                  />
                </div>
              )}
              
              {/* Image adjustments */}
              <div className="space-y-1">
                <Label className="text-sm">Brightness</Label>
                <Slider
                  value={imageAdjustments.brightLevel}
                  onValueChange={(value) => setImageAdjustments(prev => ({ 
                    ...prev, 
                    brightLevel: value 
                  }))}
                  min={-50}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm">Contrast</Label>
                <Slider
                  value={imageAdjustments.contrastLevel}
                  onValueChange={(value) => setImageAdjustments(prev => ({ 
                    ...prev, 
                    contrastLevel: value 
                  }))}
                  min={-50}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          )}
          
          {/* Progress indicator */}
          {state.isProcessing && (
            <div className="space-y-2">
              <Progress value={state.progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                Extracting text... {Math.round(state.progress)}%
              </p>
            </div>
          )}
          
          {/* Error message */}
          {state.error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{state.error}</p>
            </div>
          )}
          
          {/* Extracted text */}
          {state.extractedText && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Extracted Text</p>
                  {state.confidence !== null && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                      {Math.round(state.confidence)}% confidence
                    </span>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={copyToClipboard} 
                  className="h-8 w-8"
                  title="Copy to clipboard"
                >
                  {state.copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Textarea 
                value={state.extractedText}
                onChange={(e) => setState(prev => ({ ...prev, extractedText: e.target.value }))}
                className="min-h-[120px] font-mono text-sm"
                aria-label="Extracted text"
              />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between gap-2">
          <Button
            variant="outline"
            disabled={state.isProcessing || !state.imagePreview}
            onClick={processImage}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-process
          </Button>
          <Button
            variant="outline"
            disabled={state.isProcessing}
            onClick={handleReset}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            New Image
          </Button>
        </CardFooter>
      </Card>
      
      {/* Fullscreen preview dialog */}
      <Dialog 
        open={state.fullscreenPreview} 
        onOpenChange={(open) => setState(prev => ({ ...prev, fullscreenPreview: open }))}
      >
        <DialogContent className="max-w-screen-lg w-[90vw] h-[90vh] p-0 flex items-center justify-center">
          {state.imagePreview && (
            <img 
              src={state.imagePreview} 
              alt="Full size preview" 
              className="max-w-full max-h-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};