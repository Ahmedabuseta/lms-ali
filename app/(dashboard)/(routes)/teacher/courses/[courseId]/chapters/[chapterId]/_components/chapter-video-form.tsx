'use client';

import * as z from 'zod';
import axios from 'axios';
import MuxPlayer from '@mux/mux-player-react';
import { Pencil, PlusCircle, Video, Play, Link, Upload, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Chapter, MuxData } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileUploadArabic } from '@/components/file-upload-arabic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChapterVideoFormProps {
  initialData: Chapter & { muxData?: MuxData | null };
  courseId: string;
  chapterId: string;
}

const formSchema = z.object({
  videoUrl: z.string().min(1, 'رابط الفيديو مطلوب'),
});

// Helper function to validate video URLs
const isValidVideoUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Support YouTube, Vimeo, and direct video URLs
    return (
      hostname.includes('youtube.com') ||
      hostname.includes('youtu.be') ||
      hostname.includes('vimeo.com') ||
      hostname.includes('dailymotion.com') ||
      url.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i) !== null
    );
  } catch {
    return false;
  }
};

export const ChapterVideoForm = ({ initialData, courseId, chapterId }: ChapterVideoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'url'>('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoUrl: initialData?.videoUrl || '',
    },
  });

  const toggleEdit = () => {
    setIsEditing((current) => !current);
    if (isEditing) {
      form.reset();
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Validate video URL if using URL method
      if (uploadMethod === 'url' && !isValidVideoUrl(values.videoUrl)) {
        toast.error('رابط الفيديو غير صحيح. يرجى إدخال رابط صحيح من YouTube، Vimeo أو رابط مباشر للفيديو');
        return;
      }

      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);
      toast.success('تم تحديث الفيديو بنجاح');
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث الفيديو');
      console.error('Video update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (url: string) => {
    if (url) {
      onSubmit({ videoUrl: url });
    }
  };

  // Extract video type for better display
  const getVideoType = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('vimeo.com')) return 'Vimeo';
    if (url.includes('dailymotion.com')) return 'Dailymotion';
    if (url.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) return 'ملف فيديو';
    return 'رابط خارجي';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Play className="h-5 w-5 text-purple-600" />
          <CardTitle className="font-arabic">فيديو الفصل</CardTitle>
        </div>
        <Button onClick={toggleEdit} variant="ghost" size="sm" className="font-arabic">
          {isEditing && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              إلغاء
            </>
          )}
          {!isEditing && !initialData.videoUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              إضافة فيديو
            </>
          )}
          {!isEditing && initialData.videoUrl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              تعديل الفيديو
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!isEditing && !initialData.videoUrl && (
            <div className="flex items-center justify-center h-60 bg-slate-100 dark:bg-slate-800 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-600">
              <div className="text-center">
                <Video className="h-10 w-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-arabic">لا يوجد فيديو للفصل</p>
              <p className="text-xs text-slate-400 font-arabic mt-1">
                يمكنك رفع ملف فيديو أو إضافة رابط من YouTube أو Vimeo
              </p>
            </div>
          </div>
        )}

        {!isEditing && initialData.videoUrl && (
          <div className="space-y-3">
            <div className="relative aspect-video mt-2 rounded-md overflow-hidden border">
              <MuxPlayer playbackId={initialData?.muxData?.playbackId || ''} />
            </div>
            
            {/* Video info */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-arabic text-slate-600 dark:text-slate-300">
                  نوع الفيديو: {getVideoType(initialData.videoUrl)}
                </span>
              </div>
              {initialData.videoUrl.startsWith('http') && (
                <a 
                  href={initialData.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 font-arabic"
                >
                  عرض الرابط الأصلي
                </a>
              )}
            </div>
          </div>
        )}

        {isEditing && (
          <div className="space-y-4">
            <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as 'upload' | 'url')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 font-arabic">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  رفع ملف
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  رابط فيديو
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 font-arabic mb-2">
                    رفع ملف فيديو
                  </h4>
                  <p className="text-xs text-blue-600 dark:text-blue-300 font-arabic">
                    ارفع ملف فيديو من جهازك. سيتم معالجته تلقائياً للعرض الأمثل.
                  </p>
                </div>
                
            <FileUploadArabic
                  onChange={handleFileUpload}
              folder="chapter-videos"
              acceptedFileTypes="video/*"
              maxFileSize={500 * 1024 * 1024} // 500MB
                  description="ارفع فيديو للفصل (MP4, WebM, MOV, AVI). الحد الأقصى: 500 ميجابايت"
                />
              </TabsContent>

              <TabsContent value="url" className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 font-arabic mb-2">
                    إضافة رابط فيديو
                  </h4>
                  <p className="text-xs text-green-600 dark:text-green-300 font-arabic">
                    أدخل رابط من YouTube، Vimeo، أو أي رابط مباشر لملف فيديو.
                  </p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="videoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-arabic">رابط الفيديو</FormLabel>
                          <FormControl>
                            <Input
                              disabled={isSubmitting}
                              placeholder="https://www.youtube.com/watch?v=... أو https://vimeo.com/..."
                              {...field}
                              className="font-arabic"
                              dir="ltr"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center gap-2">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="font-arabic"
                      >
                        {isSubmitting ? 'جاري الحفظ...' : 'حفظ الرابط'}
                      </Button>
                    </div>
                  </form>
                </Form>

                {/* Supported platforms info */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-arabic mb-2">
                    المنصات المدعومة:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 font-arabic">
                    <div>• YouTube</div>
                    <div>• Vimeo</div>
                    <div>• Dailymotion</div>
                    <div>• ملفات فيديو مباشرة (.mp4, .webm, .mov)</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {initialData.videoUrl && !isEditing && (
          <div className="text-xs text-muted-foreground mt-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <p className="font-arabic text-amber-700 dark:text-amber-300">
              قد تستغرق مقاطع الفيديو بضع دقائق للمعالجة. قم بتحديث الصفحة إذا لم يظهر الفيديو.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
