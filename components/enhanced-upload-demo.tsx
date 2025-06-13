'use client';

import { useState } from 'react';
import { FileUploadArabic } from './file-upload-arabic';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export const EnhancedUploadDemo = () => { const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>({});
  const [uploadHistory, setUploadHistory] = useState<Array<{ type: string;
    fileName: string;
    url: string;
    timestamp: Date; }>>([]);

  const handleFileUpload = (type: string, typeLabel: string) => (url?: string) => { if (url) {
      setUploadedFiles(prev => ({ ...prev, [type]: url }));

      // Extract original filename from URL
      const urlFileName = url.split('/').pop() || 'ملف مرفوع';
      const fileName = urlFileName.includes('_')
        ? urlFileName.split('_').slice(2).join('_')
        : urlFileName;

      setUploadHistory(prev => [
        { type: typeLabel,
          fileName,
          url,
          timestamp: new Date() },
        ...prev
      ].slice(0, 10)); // Keep only last 10 uploads
    }
  };

  const clearFile = (type: string) => { setUploadedFiles(prev => ({ ...prev, [type]: '' }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold font-arabic mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          نظام الرفع المحسن مع شريط التقدم الحقيقي
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 font-arabic">
          جرب رفع الملفات مع الاحتفاظ بالأسماء الأصلية وشريط التقدم الفعلي
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Badge variant="secondary" className="font-arabic">📄 أسماء الملفات الأصلية</Badge>
          <Badge variant="secondary" className="font-arabic">⚡ شريط تقدم حقيقي</Badge>
          <Badge variant="secondary" className="font-arabic">🎨 تجربة مستخدم محسنة</Badge>
        </div>
      </div>

      {/* Upload Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Course Image Upload */}
        <Card className="border-2 hover:border-blue-300 transition-colors">
          <CardHeader>
            <CardTitle className="font-arabic text-center flex items-center justify-center gap-2">
              🖼️ صورة الدورة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploadArabic
              value={uploadedFiles.courseImage}
              onChange={ handleFileUpload('courseImage', 'صورة دورة') }
              folder="demo-course-images"
              acceptedFileTypes="image/*"
              maxFileSize={5 * 1024 * 1024} // 5MB
              description="صورة واضحة للدورة بنسبة 16:9"
              showProgress={true}
            />
            {uploadedFiles.courseImage && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-arabic text-green-600">✅ تم الرفع بنجاح</span>
                  <button
                    onClick={() => clearFile('courseImage')}
                    className="text-xs text-red-500 hover:text-red-700 font-arabic"
                  >
                    مسح
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chapter Video Upload */}
        <Card className="border-2 hover:border-purple-300 transition-colors">
          <CardHeader>
            <CardTitle className="font-arabic text-center flex items-center justify-center gap-2">
              🎥 فيديو الفصل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploadArabic
              value={uploadedFiles.chapterVideo}
              onChange={ handleFileUpload('chapterVideo', 'فيديو فصل') }
              folder="demo-chapter-videos"
              acceptedFileTypes="video/*"
              maxFileSize={100 * 1024 * 1024} // 100MB
              description="فيديو تعليمي عالي الجودة"
              showProgress={true}
            />
            {uploadedFiles.chapterVideo && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-arabic text-green-600">✅ تم الرفع بنجاح</span>
                  <button
                    onClick={() => clearFile('chapterVideo')}
                    className="text-xs text-red-500 hover:text-red-700 font-arabic"
                  >
                    مسح
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card className="border-2 hover:border-green-300 transition-colors">
          <CardHeader>
            <CardTitle className="font-arabic text-center flex items-center justify-center gap-2">
              📚 مرفق الدورة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploadArabic
              value={uploadedFiles.courseAttachment}
              onChange={ handleFileUpload('courseAttachment', 'مرفق دورة') }
              folder="demo-course-attachments"
              acceptedFileTypes=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              maxFileSize={25 * 1024 * 1024} // 25MB
              description="مستندات ومواد تعليمية إضافية"
              showProgress={true}
            />
            {uploadedFiles.courseAttachment && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-arabic text-green-600">✅ تم الرفع بنجاح</span>
                  <button
                    onClick={() => clearFile('courseAttachment')}
                    className="text-xs text-red-500 hover:text-red-700 font-arabic"
                  >
                    مسح
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload History */}
      { uploadHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-arabic flex items-center gap-2">
              📋 سجل الرفع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadHistory.map((item, index) => (
                <div key={index } className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Badge variant="outline" className="font-arabic">
                      {item.type}
                    </Badge>
                    <span className="text-sm font-arabic font-medium">
                      {item.fileName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-xs text-gray-500 font-arabic">
                      {item.timestamp.toLocaleTimeString('ar-EG')}
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 text-sm font-arabic"
                    >
                      عرض
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="font-arabic">🚀 المميزات الجديدة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-3xl mb-2">📄</div>
              <h3 className="font-semibold font-arabic mb-2">أسماء الملفات الأصلية</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                الاحتفاظ بأسماء الملفات الأصلية مع ضمان التفرد
              </p>
            </div>

            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold font-arabic mb-2">شريط تقدم حقيقي</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                تتبع دقيق للتقدم مع عرض السرعة والوقت المتبقي
              </p>
            </div>

            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <div className="text-3xl mb-2">🎨</div>
              <h3 className="font-semibold font-arabic mb-2">تجربة مستخدم محسنة</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                واجهة عربية جميلة مع تأثيرات بصرية متقدمة
              </p>
            </div>

            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <div className="text-3xl mb-2">🛡️</div>
              <h3 className="font-semibold font-arabic mb-2">التحقق من الملفات</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                فحص نوع وحجم الملفات مع رسائل خطأ واضحة
              </p>
            </div>

            <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="text-3xl mb-2">❌</div>
              <h3 className="font-semibold font-arabic mb-2">إلغاء الرفع</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                إمكانية إلغاء الرفع في أي وقت بسهولة
              </p>
            </div>

            <div className="text-center p-4 bg-teal-50 dark:bg-teal-950/20 rounded-lg">
              <div className="text-3xl mb-2">🌙</div>
              <h3 className="font-semibold font-arabic mb-2">الوضع الليلي</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                دعم كامل للوضع الليلي مع تصميم متسق
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-arabic">🔧 المعلومات التقنية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h4 className="font-semibold mb-4 font-arabic">كيف يعمل النظام المحسن:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium mb-2 font-arabic text-blue-600">📄 معالجة أسماء الملفات:</h5>
                <ul className="space-y-1 text-sm font-arabic text-gray-600 dark:text-gray-400">
                  <li>• الاحتفاظ بالاسم الأصلي للملف</li>
                  <li>• إضافة طابع زمني للتفرد</li>
                  <li>• دعم الأحرف العربية في الأسماء</li>
                  <li>• تنظيف الأحرف الخاصة تلقائياً</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2 font-arabic text-green-600">⚡ شريط التقدم الحقيقي:</h5>
                <ul className="space-y-1 text-sm font-arabic text-gray-600 dark:text-gray-400">
                  <li>• استخدام XMLHttpRequest للتتبع</li>
                  <li>• حساب السرعة في الوقت الفعلي</li>
                  <li>• عرض الوقت المتبقي المتوقع</li>
                  <li>• إمكانية الإلغاء في أي وقت</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
