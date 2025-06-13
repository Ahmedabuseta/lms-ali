'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, BookOpen, Target, Users, Plus, Shuffle, RefreshCw, ArrowRight } from 'lucide-react';

export const FlashcardDemo = () => { const [demoStep, setDemoStep] = useState(0);

  const demoSteps = [
    {
      title: "البطاقات الأولى (25 بطاقة)",
      description: "يتم تحميل 25 بطاقة مع خلط عشوائي",
      cards: "1-25",
      color: "blue" },
    { title: "بعد 20 بطاقة - ظهور زر التحميل",
      description: "يظهر زر 'تحميل المزيد' بعد مراجعة 20 بطاقة",
      cards: "20/25",
      color: "orange" },
    { title: "تحميل المجموعة الثانية",
      description: "تحميل 25 بطاقة إضافية مع خلط جديد",
      cards: "26-50",
      color: "purple" },
    { title: "استمرار التحميل",
      description: "يمكن تحميل المزيد حتى انتهاء جميع البطاقات",
      cards: "51-75",
      color: "green" }
  ];

  const currentStep = demoSteps[demoStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-800 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white font-arabic">
            🎴 نظام البطاقات التعليمية المحسّن
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-arabic">
            تحميل 25 بطاقة في كل مرة مع خلط عشوائي وزر "تحميل المزيد"
          </p>
        </div>

        {/* Demo Flow */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Demo Controls */}
          <div className="space-y-6">
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-arabic">
                  <Target className="h-6 w-6 text-blue-600" />
                  تجربة تفاعلية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                { demoSteps.map((step, index) => (
                  <div
                    key={index }
                    className={ `p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                      index === demoStep
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300' }`}
                    onClick={() => setDemoStep(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={ `font-semibold font-arabic ${
                          index === demoStep ? 'text-blue-800 dark:text-blue-200' : 'text-gray-800 dark:text-gray-200' }`}>
                          {step.title}
                        </h3>
                        <p className={ `text-sm font-arabic ${
                          index === demoStep ? 'text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400' }`}>
                          {step.description}
                        </p>
                      </div>
                      <div className={ `px-3 py-1 rounded-full text-xs font-medium ${
                        index === demoStep
                          ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400' }`}>
                        {step.cards}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={ () => setDemoStep(Math.max(0, demoStep - 1)) }
                disabled={demoStep === 0}
              >
                <ArrowRight className="h-4 w-4 ml-1 rotate-180" />
                السابق
              </Button>
              <Button
                onClick={ () => setDemoStep(Math.min(demoSteps.length - 1, demoStep + 1)) }
                disabled={demoStep === demoSteps.length - 1}
              >
                التالي
                <ArrowRight className="h-4 w-4 mr-1" />
              </Button>
            </div>
          </div>

          {/* Visual Demo */}
          <div className="space-y-6">
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 text-xl font-arabic text-${currentStep.color}-600`}>
                  <Zap className="h-6 w-6" />
                  {currentStep.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Step Visualization */}
                { demoStep === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 25 }, (_, i) => (
                        <div
                          key={i}
                          className="aspect-square bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-xs font-medium text-blue-800 dark:text-blue-200"
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-arabic">
                        ✨ تم تحميل 25 بطاقة مع ترتيب عشوائي
                      </p>
                    </div>
                  </div>
                )}

                { demoStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 25 }, (_, i) => (
                        <div
                          key={i}
                          className={ `aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                            i < 20
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' }`}
                        >
                          { i < 20 ? '✓' : i + 1 }
                        </div>
                      ))}
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <p className="text-sm text-orange-700 dark:text-orange-300 font-arabic mb-3">
                        🎉 راجعت 20 بطاقة - حان وقت تحميل المزيد!
                      </p>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <Plus className="h-4 w-4 ml-1" />
                        تحميل 25 بطاقة إضافية
                      </Button>
                    </div>
                  </div>
                )}

                { demoStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 50 }, (_, i) => (
                        <div
                          key={i}
                          className={ `aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                            i < 25
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                              : 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200' }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <p className="text-sm text-purple-700 dark:text-purple-300 font-arabic">
                        🎯 تم تحميل 25 بطاقة جديدة - المجموع: 50 بطاقة
                      </p>
                    </div>
                  </div>
                )}

                { demoStep === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 75 }, (_, i) => (
                        <div
                          key={i}
                          className={ `aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                            i < 25
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                              : i < 50
                              ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200'
                              : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' }`}
                        >
                          { i + 1 > 75 ? '...' : i + 1 }
                        </div>
                      ))}
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-300 font-arabic">
                        🚀 يمكنك الاستمرار في تحميل المزيد حتى انتهاء جميع البطاقات
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-arabic">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  الميزات الجديدة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="text-lg">📦</div>
                    <div>
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 font-arabic">تحميل 25 بطاقة</h4>
                      <p className="text-xs text-blue-600 dark:text-blue-300 font-arabic">بدلاً من 20 بطاقة سابقاً</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                    <div className="text-lg">🎯</div>
                    <div>
                      <h4 className="font-semibold text-orange-800 dark:text-orange-200 font-arabic">زر تحميل صريح</h4>
                      <p className="text-xs text-orange-600 dark:text-orange-300 font-arabic">بدلاً من التحميل التلقائي</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <div className="text-lg">🎲</div>
                    <div>
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 font-arabic">خلط عشوائي</h4>
                      <p className="text-xs text-purple-600 dark:text-purple-300 font-arabic">خلط كل مجموعة جديدة</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="text-lg">🔄</div>
                    <div>
                      <h4 className="font-semibold text-green-800 dark:text-green-200 font-arabic">أزرار تحكم</h4>
                      <p className="text-xs text-green-600 dark:text-green-300 font-arabic">إعادة تعيين وخلط يدوي</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technical Implementation */}
        <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-arabic">
              <Users className="h-6 w-6 text-indigo-600" />
              التنفيذ التقني
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 font-arabic">📡 API المحسّن</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 font-arabic">
                  <li>• تحميل 25 بطاقة بدلاً من 20</li>
                  <li>• عشوائية على مستوى قاعدة البيانات</li>
                  <li>• تتبع أفضل للصفحات</li>
                  <li>• فلترة متقدمة للدورات والفصول</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 font-arabic">🎨 واجهة المستخدم</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 font-arabic">
                  <li>• شريط تحكم علوي منظم</li>
                  <li>• زر "تحميل المزيد" واضح</li>
                  <li>• أزرار خلط وإعادة تعيين</li>
                  <li>• رسائل تهنئة تفاعلية</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 font-arabic">⚡ الأداء</h3>
                <ul className="text-sm text-gray-600 dark-gray-400 space-y-1 font-arabic">
                  <li>• تحميل حسب الطلب</li>
                  <li>• ذاكرة محسّنة</li>
                  <li>• تحديثات سلسة</li>
                  <li>• تتبع حالة متقدم</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
