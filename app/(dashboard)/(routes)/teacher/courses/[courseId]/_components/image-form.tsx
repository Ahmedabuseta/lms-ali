'use client';

import * as z from 'zod';
import axios from 'axios';
import { Pencil, PlusCircle, ImageIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Course } from '@prisma/client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FileUploadArabic } from '@/components/file-upload-arabic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ImageFormProps {
  initialData: Course;
  courseId: string;
}

const formSchema = z.object({
  imageUrl: z.string().min(1, {
    message: 'صورة الدورة مطلوبة',
  }),
});

export const ImageForm = ({ initialData, courseId }: ImageFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success('تم تحديث الدورة بنجاح');
      toggleEdit();
      router.refresh();
    } catch {
      toast.error('حدث خطأ ما');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-arabic">صورة الدورة</CardTitle>
        <Button onClick={toggleEdit} variant="ghost" size="sm" className="font-arabic">
          {isEditing && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              إلغاء
            </>
          )}
          {!isEditing && !initialData.imageUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              إضافة صورة
            </>
          )}
          {!isEditing && initialData.imageUrl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              تعديل الصورة
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!isEditing &&
          (!initialData.imageUrl ? (
            <div className="flex items-center justify-center h-60 bg-slate-100 dark:bg-slate-800 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-600">
              <div className="text-center">
                <ImageIcon className="h-10 w-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-arabic">لا توجد صورة للدورة</p>
              </div>
            </div>
          ) : (
            <div className="relative aspect-video mt-2 rounded-md overflow-hidden border">
              <Image alt="صورة الدورة" fill className="object-cover" src={initialData.imageUrl} />
            </div>
          ))}
        {isEditing && (
          <div>
            <FileUploadArabic
              value={initialData.imageUrl || undefined}
              onChange={(url) => {
                if (url) {
                  onSubmit({ imageUrl: url });
                }
              }}
              folder="course-images"
              acceptedFileTypes="image/*"
              maxFileSize={4 * 1024 * 1024} // 4MB
              description="يُنصح بنسبة عرض إلى ارتفاع 16:9 للحصول على أفضل عرض"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
