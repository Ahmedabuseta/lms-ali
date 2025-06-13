'use client';

import { useState } from 'react';
import { FileUploadArabic } from './file-upload-arabic';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const UploadProgressDemo = () => {
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>({
    image: '',
    video: '',
    document: '',
  });

  const handleFileUpload = (type: string) => (url?: string) => {
    if (url) {
      setUploadedFiles(prev => ({ ...prev, [type]: url }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-arabic mb-2">
          عرض تطبيقي للرفع مع شريط التقدم الحقيقي
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-arabic">
          جرب رفع الملفات ولاحظ شريط التقدم الحقيقي أثناء الرفع
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="font-arabic text-center">رفع الصور</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploadArabic
              value={uploadedFiles.image}
              onChange={handleFileUpload('image')}
              folder="demo-images"
              acceptedFileTypes="image/*"
              maxFileSize={5 * 1024 * 1024} // 5MB
              description="جرب رفع صورة ولاحظ التقدم الحقيقي"
              showProgress={true}
            />
            {uploadedFiles.image && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
                <p className="text-sm text-green-700 dark:text-green-300 font-arabic">
                  ✅ تم رفع الصورة بنجاح!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Video Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="font-arabic text-center">رفع الفيديو</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploadArabic
              value={uploadedFiles.video}
              onChange={handleFileUpload('video')}
              folder="demo-videos"
              acceptedFileTypes="video/*"
              maxFileSize={50 * 1024 * 1024} // 50MB
              description="رفع فيديو كبير لرؤية التقدم التفصيلي"
              showProgress={true}
            />
            {uploadedFiles.video && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
                <p className="text-sm text-green-700 dark:text-green-300 font-arabic">
                  ✅ تم رفع الفيديو بنجاح!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="font-arabic text-center">رفع المستندات</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploadArabic
              value={uploadedFiles.document}
              onChange={handleFileUpload('document')}
              folder="demo-documents"
              acceptedFileTypes=".pdf,.doc,.docx,.ppt,.pptx"
              maxFileSize={20 * 1024 * 1024} // 20MB
              description="رفع مستند لرؤية التقدم المباشر"
              showProgress={true}
            />
            {uploadedFiles.document && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
                <p className="text-sm text-green-700 dark:text-green-300 font-arabic">
                  ✅ تم رفع المستند بنجاح!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-arabic">مميزات شريط التقدم الحقيقي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm font-arabic">تقدم حقيقي مباشر من الخادم</p>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm font-arabic">إمكانية إلغاء الرفع في أي وقت</p>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <p className="text-sm font-arabic">عرض النسبة المئوية الدقيقة</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <p className="text-sm font-arabic">معالجة أخطاء الشبكة بذكاء</p>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-sm font-arabic">رسائل خطأ واضحة بالعربية</p>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <p className="text-sm font-arabic">استجابة فورية للمستخدم</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-arabic">المعلومات التقنية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold mb-2 font-arabic">كيف يعمل التقدم الحقيقي:</h4>
            <ul className="space-y-2 text-sm font-arabic">
              <li>• استخدام XMLHttpRequest بدلاً من fetch() للحصول على أحداث التقدم</li>
              <li>• مراقبة xhr.upload.progress للحصول على البيانات المرسلة</li>
              <li>• حساب النسبة المئوية من (loaded / total) * 100</li>
              <li>• تحديث شريط التقدم في الوقت الفعلي</li>
              <li>• إمكانية إلغاء الرفع باستخدام xhr.abort()</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 