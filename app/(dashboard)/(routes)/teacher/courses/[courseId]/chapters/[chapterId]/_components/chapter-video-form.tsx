'use client';

import * as z from 'zod';
import axios from 'axios';
import MuxPlayer from '@mux/mux-player-react';
import { Pencil, PlusCircle, Video, Play } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Chapter, MuxData } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { FileUploadArabic } from '@/components/file-upload-arabic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChapterVideoFormProps {
  initialData: Chapter & { muxData?: MuxData | null };
  courseId: string;
  chapterId: string;
}

const formSchema = z.object({
  videoUrl: z.string().min(1),
});

export const ChapterVideoForm = ({ initialData, courseId, chapterId }: ChapterVideoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);
      toast.success('تم تحديث الفصل بنجاح');
      toggleEdit();
      router.refresh();
    } catch {
      toast.error('حدث خطأ ما');
    }
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
        {!isEditing &&
          (!initialData.videoUrl ? (
            <div className="flex items-center justify-center h-60 bg-slate-100 dark:bg-slate-800 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-600">
              <div className="text-center">
                <Video className="h-10 w-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-arabic">لا يوجد فيديو للفصل</p>
              </div>
            </div>
          ) : (
            <div className="relative aspect-video mt-2 rounded-md overflow-hidden border">
              <MuxPlayer playbackId={initialData?.muxData?.playbackId || ''} />
            </div>
          ))}
        {isEditing && (
          <div>
            <FileUploadArabic
              onChange={(url) => {
                if (url) {
                  onSubmit({ videoUrl: url });
                }
              }}
              folder="chapter-videos"
              acceptedFileTypes="video/*"
              maxFileSize={500 * 1024 * 1024} // 500MB
              description="ارفع فيديو للفصل. قد يستغرق الأمر بضع دقائق للمعالجة"
            />
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
