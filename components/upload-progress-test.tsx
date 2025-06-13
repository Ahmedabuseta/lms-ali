'use client';

import { FileUploadArabic } from './file-upload-arabic';
import { useState } from 'react';

export const UploadProgressTest = () => { const [imageUrl, setImageUrl] = useState<string>();
  const [videoUrl, setVideoUrl] = useState<string>();
  const [documentUrl, setDocumentUrl] = useState<string>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */ }
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white font-arabic">
            🚀 تحسين تجربة رفع الملفات
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-arabic">
            لا مزيد من شريط التقدم الوهمي - فقط تقدم حقيقي مع حالة التحضير
          </p>
        </div>

        {/* Upload Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Image Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 font-arabic flex items-center gap-2">
              🖼️ رفع الصور
            </h3>
            <FileUploadArabic
              onChange={setImageUrl}
              value={imageUrl}
              folder="test-images"
              acceptedFileTypes="image/*"
              maxFileSize={5 * 1024 * 1024} // 5MB
              description="يُفضل الصور عالية الجودة بتنسيق PNG أو JPG"
            />
            { imageUrl && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300 font-arabic">
                  ✅ تم رفع الصورة بنجاح!
                </p>
              </div>
            ) }
          </div>

          {/* Video Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 font-arabic flex items-center gap-2">
              🎥 رفع الفيديو
            </h3>
            <FileUploadArabic
              onChange={setVideoUrl}
              value={videoUrl}
              folder="test-videos"
              acceptedFileTypes="video/*"
              maxFileSize={100 * 1024 * 1024} // 100MB
              description="ملفات الفيديو بتنسيق MP4 أو MOV مع جودة HD"
            />
            { videoUrl && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300 font-arabic">
                  ✅ تم رفع الفيديو بنجاح!
                </p>
              </div>
            ) }
          </div>

          {/* Document Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 font-arabic flex items-center gap-2">
              📄 رفع المستندات
            </h3>
            <FileUploadArabic
              onChange={setDocumentUrl}
              value={documentUrl}
              folder="test-documents"
              acceptedFileTypes=".pdf,.doc,.docx,.txt"
              maxFileSize={10 * 1024 * 1024} // 10MB
              description="مستندات PDF أو Word للمواد التعليمية"
            />
            { documentUrl && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300 font-arabic">
                  ✅ تم رفع المستند بنجاح!
                </p>
              </div>
            ) }
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 font-arabic">
            🔥 الميزات المحسّنة
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 font-arabic">
                    حالة التحضير الذكية
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                    يظهر "جاري التحضير" قبل بدء الرفع الفعلي - لا مزيد من شريط التقدم الوهمي
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 font-arabic">
                    تقدم حقيقي فقط
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                    شريط التقدم يظهر فقط عند وجود بيانات رفع حقيقية
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 font-arabic">
                    إحصائيات مباشرة
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                    سرعة الرفع والوقت المتبقي محسوبة من البيانات الفعلية
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎨</span>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 font-arabic">
                    تجربة مستخدم محسّنة
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                    رسوم متحركة سلسة وتغذية راجعة بصرية واضحة
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 font-arabic">
                    حماية ضد التداخل
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                    منع التفاعل أثناء التحضير والرفع لتجنب الأخطاء
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌙</span>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 font-arabic">
                    الوضع المظلم
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                    دعم كامل للوضع المظلم مع تصميم عربي أنيق
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Information */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 font-arabic">
            💡 معلومات مهمة
          </h4>
          <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300 font-arabic">
            <p><strong>حالة التحضير:</strong> تظهر عند تحضير الملف (اختيار الملف، التحقق من الصحة)</p>
            <p><strong>حالة الرفع:</strong> تظهر فقط عند بدء نقل البيانات الفعلي</p>
            <p><strong>شريط التقدم:</strong> يظهر فقط عند وجود نسبة تقدم حقيقية أكبر من 0%</p>
            <p><strong>إلغاء الرفع:</strong> متاح فقط أثناء الرفع الفعلي</p>
          </div>
        </div>
      </div>
    </div>
  );
};
