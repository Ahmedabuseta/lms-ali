'use client';

import * as z from 'zod';
import axios from 'axios';
import { PlusCircle, File, Loader2, X, Download, Paperclip } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Attachment, Course } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { FileUploadArabic } from '@/components/file-upload-arabic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AttachmentFormProps {
  initialData: Course & { attachments: Attachment[] };
  courseId: string;
}

const formSchema = z.object({
  url: z.string().min(1),
});

export const AttachmentForm = ({ initialData, courseId }: AttachmentFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/courses/${courseId}/attachments`, values);
      toast.success('تم إضافة المرفق بنجاح');
      toggleEdit();
      router.refresh();
    } catch {
      toast.error('حدث خطأ ما');
    }
  };

  const onDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
      toast.success('تم حذف المرفق بنجاح');
      router.refresh();
    } catch {
      toast.error('حدث خطأ ما');
    } finally {
      setDeletingId(null);
    }
  };

  const downloadAttachment = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Paperclip className="h-5 w-5 text-blue-600" />
          <CardTitle className="font-arabic">مرفقات الدورة</CardTitle>
        </div>
        <Button onClick={toggleEdit} variant="ghost" size="sm" className="font-arabic">
          {isEditing && (
            <>
              <X className="h-4 w-4 mr-2" />
              إلغاء
            </>
          )}
          {!isEditing && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              إضافة مرفق
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!isEditing && (
          <>
            {initialData.attachments.length === 0 && (
              <div className="flex items-center justify-center h-32 bg-slate-100 dark:bg-slate-800 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-600">
                <div className="text-center">
                  <Paperclip className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 font-arabic">لا توجد مرفقات بعد</p>
                </div>
              </div>
            )}
            {initialData.attachments.length > 0 && (
              <div className="space-y-2">
                {initialData.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center p-3 w-full bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-md">
                    <File className="h-4 w-4 mr-2 flex-shrink-0" />
                    <p className="text-xs line-clamp-1 flex-grow font-arabic">{attachment.name}</p>
                    <div className="flex items-center mr-auto space-x-2 space-x-reverse">
                      <Button
                        onClick={() => downloadAttachment(attachment.url, attachment.name)}
                        size="sm"
                        variant="ghost"
                        className="p-1 h-auto text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {deletingId === attachment.id && (
                        <div>
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                      {deletingId !== attachment.id && (
                        <button
                          onClick={() => onDelete(attachment.id)}
                          className="p-1 text-blue-700 hover:text-red-600 dark:text-blue-300 dark:hover:text-red-400 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {isEditing && (
          <div>
            <FileUploadArabic
              onChange={(url) => {
                if (url) {
                  onSubmit({ url });
                }
              }}
              folder="course-attachments"
              acceptedFileTypes=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
              maxFileSize={50 * 1024 * 1024} // 50MB
              description="أضف أي ملفات قد يحتاجها الطلاب لإكمال الدورة"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
