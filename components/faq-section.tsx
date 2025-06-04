'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconBadge } from '@/components/icon-badge';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

// FAQ Dropdown Component
const FAQDropdown = ({ question, answer }: { question: string; answer: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="group border border-blue-200/50 rounded-xl overflow-hidden bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 dark:border-blue-800/30 dark:bg-gray-800/80 w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 md:p-6 text-right flex items-center justify-between hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300"
      >
        <span className="font-bold text-base md:text-lg text-gray-800 dark:text-white leading-relaxed flex-1 text-right pr-2 md:pr-0">{question}</span>
        <div className="flex-shrink-0 ml-2 md:ml-4">
          {isOpen ? (
            <ChevronUp className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400 transition-transform duration-300" />
          ) : (
            <ChevronDown className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400 transition-transform duration-300" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-blue-100 dark:border-blue-800/50 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/10">
          <div className="p-4 md:p-6 pt-4 md:pt-5">
            <div className="text-gray-700 dark:text-gray-200 leading-relaxed text-sm md:text-base">{answer}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export const FAQSection = () => {
  return (
    <div className="relative w-full">
      <Card className="border-0 bg-gradient-to-br from-white/90 via-blue-50/50 to-indigo-50/50 backdrop-blur-md shadow-2xl dark:from-gray-800/90 dark:via-blue-900/20 dark:to-indigo-900/20 w-full">
        <CardHeader className="text-center pb-8 px-4 md:px-8">
          <CardTitle className="flex flex-col md:flex-row items-center justify-center gap-3 text-2xl md:text-3xl font-bold mb-4">
            <IconBadge icon={HelpCircle} variant="info" size="lg" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
              الأسئلة الشائعة حول معادلة كلية التجارة
            </span>
          </CardTitle>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-2">
            دليل شامل يحتوي على جميع المعلومات المهمة حول امتحان معادلة كلية التجارة ومتطلباته
          </p>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6 px-4 md:px-8 pb-6 md:pb-8 w-full">
          <FAQDropdown 
            question="ما هي معادلة كلية التجارة؟"
            answer={
              <div className="space-y-4">
                <p className="text-base leading-relaxed">مسابقة يعقدها المجلس الأعلى للجامعات كل عام للالتحاق بكلية التجارة للدبلومات والمعاهد الفنية التالية:</p>
                <ul className="list-disc list-inside space-y-2 text-sm bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <li className="text-gray-700 dark:text-gray-200">دبلوم الثانوي الصناعي نظام 3 سنوات</li>
                  <li className="text-gray-700 dark:text-gray-200">دبلوم الثانوي الصناعي نظام 5 سنوات</li>
                  <li className="text-gray-700 dark:text-gray-200">دبلوم المعاهد الفنية التجارية نظام السنتين عقب الثانوية العامة</li>
                  <li className="text-gray-700 dark:text-gray-200">دبلوم معاهد السكرتارية الخاصة والمتوسطة</li>
                  <li className="text-gray-700 dark:text-gray-200">دبلوم الحاسب الآلي</li>
                  <li className="text-gray-700 dark:text-gray-200">دبلوم العلاقات الصناعية من الجامعة العمالية</li>
                </ul>
              </div>
            }
          />
          
          <FAQDropdown 
            question="ما هي شروط التقديم للامتحان معادلة كلية التجارة؟"
            answer={
              <div className="space-y-4">
                <ol className="list-decimal list-inside space-y-3 bg-green-50/50 dark:bg-green-900/20 p-4 rounded-lg">
                  <li className="text-gray-700 dark:text-gray-200 font-medium">الحصول على 70% في حال دبلوم نظام 3 سنوات، أو 50% للدبلوم نظام 5 سنوات</li>
                  <li className="text-gray-700 dark:text-gray-200 font-medium">أن تكون خريج دفعة حديثة آخر ثلاث سنوات من سنة تخرجك "2021, 2022, 2023"</li>
                </ol>
              </div>
            }
          />
          
          <FAQDropdown 
            question="ما هي عدد مرات دخول الامتحان؟"
            answer={
              <div className="bg-amber-50/50 dark:bg-amber-900/20 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-200 font-medium">يسمح لك بدخول امتحان المعادلة مرتين منذ سنة تخرجك.</p>
              </div>
            }
          />
          
          <FAQDropdown 
            question="ما هي المواد المطلوبة في الامتحان؟"
            answer={
              <div className="space-y-6">
                <div className="bg-purple-50/50 dark:bg-purple-900/20 p-5 rounded-lg">
                  <h4 className="font-bold text-lg mb-3 text-purple-800 dark:text-purple-300">مواد الصف الثالث الثانوي العام لخريجي:</h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li className="text-gray-700 dark:text-gray-200 font-medium">الرياضة</li>
                    <li className="text-gray-700 dark:text-gray-200 font-medium">اللغة الإنجليزية</li>
                    <li className="text-gray-700 dark:text-gray-200 font-medium">اللغة الفرنسية</li>
                    <li className="text-gray-700 dark:text-gray-200 font-medium">الجغرافيا</li>
                  </ul>
                </div>
                <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-5 rounded-lg">
                  <h4 className="font-bold text-lg mb-3 text-indigo-800 dark:text-indigo-300">مواد خريجي المعاهد ودبلوم 5 سنوات:</h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li className="text-gray-700 dark:text-gray-200 font-medium">الرياضة</li>
                    <li className="text-gray-700 dark:text-gray-200 font-medium">دراسات تجارية باللغة الإنجليزية</li>
                    <li className="text-gray-700 dark:text-gray-200 font-medium">إدارة الأعمال</li>
                    <li className="text-gray-700 dark:text-gray-200 font-medium">محاسبة</li>
                  </ul>
                </div>
              </div>
            }
          />
          
          <FAQDropdown 
            question="ما هي درجات النجاح في الامتحان؟"
            answer={
              <div className="bg-emerald-50/50 dark:bg-emerald-900/20 p-5 rounded-lg">
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                  درجة كل مادة 20 درجة، يطلب من الطالب أن يحقق 10 درجات ويحصل على الإجمالي 40 من 80 يدخل كلية تجارة انتساب. 
                  وفي حال حصول الطالب على 65% يدخل كلية تجارة انتظام، أما طلاب نظام خمس سنوات فيحتاجون إلى تحقيق 50% للنجاح.
                </p>
              </div>
            }
          />
          
          <FAQDropdown 
            question="ما هي الأوراق المطلوبة وخطوات التقديم لمعادلة كلية التجارة؟"
            answer={
              <div className="space-y-4">
                <ol className="list-decimal list-inside space-y-3 bg-rose-50/50 dark:bg-rose-900/20 p-5 rounded-lg">
                  <li className="text-gray-700 dark:text-gray-200 leading-relaxed">الدخول على الموقع الإلكتروني واختيار نوع الامتحان وإدخال بيانات المتقدم الأساسية</li>
                  <li className="text-gray-700 dark:text-gray-200 leading-relaxed">طباعة إذن الدفع والذي يشتمل على القيمة المطلوب دفعها وطريقة الدفع الذي يوضح البنك ورقم الحساب المطلوب الدفع فيه</li>
                  <li className="text-gray-700 dark:text-gray-200 leading-relaxed">دفع رسوم الامتحان (500 جنيه مصري) أو باستخدام الخدمة الموضحة بإذن الدفع والحصول على إيصال الدفع</li>
                  <li className="text-gray-700 dark:text-gray-200 leading-relaxed">عمل مسح Scan لإيصال الدفع مع المستندات المطلوبة وتحويلها إلى ملف PDF بحيث لا يزيد حجمه على 3 ميجابايت</li>
                  <li className="text-gray-700 dark:text-gray-200 leading-relaxed">تحميل الملف PDF الناتج على نظام التقدم بالدخول إلى رابط استكمال الطلب</li>
                  <li className="text-gray-700 dark:text-gray-200 leading-relaxed">طباعة استمارة التقديم بعد إدخال بيانات المتقدم الأساسية واستكمال الطلب</li>
                  <li className="text-gray-700 dark:text-gray-200 leading-relaxed">متابعة الموقع بعد يومين عمل لمعرفة حالة الطلب ومراجعة ملف المستندات</li>
                  <li className="text-gray-700 dark:text-gray-200 leading-relaxed">في حالة قبول الطلب، طباعة رقم الجلوس الخاص بك للاحتفاظ به</li>
                </ol>
              </div>
            }
          />

          <FAQDropdown 
            question="ما هي مواقع الامتحانات وأماكن انعقادها؟"
            answer={
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-5 rounded-xl">
                    <h4 className="font-bold text-lg mb-4 text-blue-800 dark:text-blue-300">مكان التقدم بالمستندات وانعقاد الامتحان</h4>
                    <ul className="space-y-3">
                      <li className="border border-blue-200 dark:border-blue-700 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 font-medium">كلية التجارة - جامعة القاهرة بالجيزة</li>
                      <li className="border border-blue-200 dark:border-blue-700 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 font-medium">كلية التجارة - جامعة أسيوط</li>
                      <li className="border border-blue-200 dark:border-blue-700 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 font-medium">كلية التجارة - جامعة الإسكندرية</li>
                      <li className="border border-blue-200 dark:border-blue-700 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 font-medium">كلية التجارة - جامعة طنطا</li>
                      <li className="border border-blue-200 dark:border-blue-700 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 font-medium">كلية التجارة - جامعة الزقازيق</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-5 rounded-xl">
                    <h4 className="font-bold text-lg mb-4 text-green-800 dark:text-green-300">المحافظات</h4>
                    <ul className="space-y-3">
                      <li className="border border-green-200 dark:border-green-700 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 text-sm leading-relaxed">القاهرة - الجيزة - القليوبية - الفيوم - بني سويف - حلوان</li>
                      <li className="border border-green-200 dark:border-green-700 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 text-sm leading-relaxed">المنيا - سوهاج - أسيوط - قنا - أسوان - الوادي الجديد - الأقصر - البحر الأحمر</li>
                      <li className="border border-green-200 dark:border-green-700 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 text-sm leading-relaxed">الإسكندرية - البحيرة - مطروح</li>
                      <li className="border border-green-200 dark:border-green-700 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 text-sm leading-relaxed">كفر الشيخ - الغربية - الدقهلية</li>
                      <li className="border border-green-200 dark:border-green-700 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 text-sm leading-relaxed">الشرقية - الدقهلية - المنوفية - الإسماعيلية - السويس - دمياط - بورسعيد - شمال سيناء - جنوب سيناء</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-5 rounded-xl">
                    <h4 className="font-bold text-lg mb-4 text-purple-800 dark:text-purple-300">القطاع الجغرافي</h4>
                    <ul className="space-y-3">
                      <li className="border border-purple-200 dark:border-purple-700 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 font-medium">قطاع القاهرة الكبرى</li>
                      <li className="border border-purple-200 dark:border-purple-700 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 font-medium">قطاع وجه قبلي</li>
                      <li className="border border-purple-200 dark:border-purple-700 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 font-medium">قطاع وجه بحري</li>
                      <li className="border border-purple-200 dark:border-purple-700 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 font-medium">قطاع الدلتا</li>
                      <li className="border border-purple-200 dark:border-purple-700 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 font-medium">قطاع شرق الدلتا والقناة</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-5 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
                  <p className="text-blue-800 dark:text-blue-200 font-medium leading-relaxed">
                    <strong>ملاحظة مهمة:</strong> يتم توزيع الطلاب على مراكز الامتحانات حسب محافظة الإقامة والقطاع الجغرافي المحدد لكل منطقة.
                  </p>
                </div>
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}; 