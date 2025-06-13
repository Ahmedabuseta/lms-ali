'use client';

import { useState } from 'react';
import { FileUploadArabic } from '@/components/file-upload-arabic';

// Example 1: Course Image Upload
export const CourseImageUploadExample = () => { const [imageUrl, setImageUrl] = useState<string>('');

  return (
    <FileUploadArabic
      value={imageUrl }
      onChange={(url) => setImageUrl(url || '')}
      folder="course-images"
      acceptedFileTypes="image/*"
      maxFileSize={4 * 1024 * 1024} // 4MB
      description="يُنصح بنسبة عرض إلى ارتفاع 16:9 للحصول على أفضل عرض"
    />
  );
};

// Example 2: Chapter Video Upload
export const ChapterVideoUploadExample = () => { const [videoUrl, setVideoUrl] = useState<string>('');

  return (
    <FileUploadArabic
      value={videoUrl }
      onChange={(url) => setVideoUrl(url || '')}
      folder="chapter-videos"
      acceptedFileTypes="video/*"
      maxFileSize={500 * 1024 * 1024} // 500MB
      description="ارفع فيديو للفصل. قد يستغرق الأمر بضع دقائق للمعالجة"
    />
  );
};

// Example 3: Course Attachment Upload
export const CourseAttachmentUploadExample = () => { const [attachmentUrl, setAttachmentUrl] = useState<string>('');

  return (
    <FileUploadArabic
      value={attachmentUrl }
      onChange={(url) => setAttachmentUrl(url || '')}
      folder="course-attachments"
      acceptedFileTypes=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
      maxFileSize={50 * 1024 * 1024} // 50MB
      description="أضف أي ملفات قد يحتاجها الطلاب لإكمال الدورة"
    />
  );
};

// Example 4: Profile Picture Upload
export const ProfilePictureUploadExample = () => { const [profileUrl, setProfileUrl] = useState<string>('');

  return (
    <FileUploadArabic
      value={profileUrl }
      onChange={(url) => setProfileUrl(url || '')}
      folder="profile-pictures"
      acceptedFileTypes="image/*"
      maxFileSize={2 * 1024 * 1024} // 2MB
      description="ارفع صورة شخصية واضحة بحجم مربع"
      className="max-w-xs mx-auto"
    />
  );
};

// Example 5: Quiz Attachment Upload
export const QuizAttachmentUploadExample = () => { const [quizAttachmentUrl, setQuizAttachmentUrl] = useState<string>('');

  return (
    <FileUploadArabic
      value={quizAttachmentUrl }
      onChange={(url) => setQuizAttachmentUrl(url || '')}
      folder="quiz-attachments"
      acceptedFileTypes="image/*,.pdf"
      maxFileSize={10 * 1024 * 1024} // 10MB
      description="ارفع صورة أو ملف PDF للسؤال"
    />
  );
};

// Example 6: General File Upload with Progress
export const GeneralFileUploadExample = () => { const [fileUrl, setFileUrl] = useState<string>('');

  return (
    <FileUploadArabic
      value={fileUrl }
      onChange={(url) => setFileUrl(url || '')}
      folder="general-uploads"
      acceptedFileTypes="*/*"
      maxFileSize={100 * 1024 * 1024} // 100MB
      description="ارفع أي نوع من الملفات"
      showProgress={true}
    />
  );
};

// Example Usage in Forms
export const FormUploadExample = () => { const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    videoUrl: '',
    attachmentUrl: '', });

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault();

    // Submit form data
    console.log('Form Data:', formData);

    // Example: Send to API
    /*
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('تم حفظ البيانات بنجاح');
      } else {
        toast.error('حدث خطأ في حفظ البيانات');
      }
    } catch (error) { console.error('Error:', error);
      toast.error('حدث خطأ غير متوقع'); }
    */
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-arabic">
          عنوان الدورة
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={ (e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
          placeholder="أدخل عنوان الدورة"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-arabic">
          وصف الدورة
        </label>
        <textarea
          value={formData.description}
          onChange={ (e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
          rows={3}
          placeholder="أدخل وصف الدورة"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-arabic">
          صورة الدورة
        </label>
        <FileUploadArabic
          value={formData.imageUrl}
          onChange={ (url) => setFormData({ ...formData, imageUrl: url || '' })}
          folder="course-images"
          acceptedFileTypes="image/*"
          maxFileSize={4 * 1024 * 1024}
          description="ارفع صورة واضحة للدورة"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-arabic">
          فيديو تعريفي
        </label>
        <FileUploadArabic
          value={formData.videoUrl}
          onChange={ (url) => setFormData({ ...formData, videoUrl: url || '' })}
          folder="course-videos"
          acceptedFileTypes="video/*"
          maxFileSize={100 * 1024 * 1024}
          description="ارفع فيديو تعريفي للدورة (اختياري)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-arabic">
          مرفق إضافي
        </label>
        <FileUploadArabic
          value={formData.attachmentUrl}
          onChange={ (url) => setFormData({ ...formData, attachmentUrl: url || '' })}
          folder="course-attachments"
          acceptedFileTypes=".pdf,.doc,.docx,.ppt,.pptx"
          maxFileSize={20 * 1024 * 1024}
          description="ارفع ملف إضافي للدورة (اختياري)"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors font-arabic"
      >
        حفظ الدورة
      </button>
    </form>
  );
};
