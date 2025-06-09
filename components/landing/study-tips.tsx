import Link from 'next/link';
import {
  Calendar,
  MessageSquare,
  Brain,
  Target,
  BookOpen,
  Trophy,
  Users,
  Zap,
  ArrowRight,
  Monitor,
  Clock,
  BarChart3,
  Bookmark,
  PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudyTipsProps {
  onStartClick?: () => void;
}

export const StudyTips = ({ onStartClick }: StudyTipsProps) => {
  return (
    <section className="bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 px-4 py-20 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl font-arabic">
            ازاي تستفيد من المنصة بأقصى شكل
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300 font-arabic leading-relaxed">
            دليل شامل عشان تستخدم كل مميزات المنصة بكفاءة وتحقق أحسن نتايج في رحلة تعليمك
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column - Platform Features Usage */}
          <div className="space-y-6">
            <h3 className="mb-8 text-2xl font-bold text-gray-800 dark:text-white font-arabic">استخدام مميزات المنصة بشطارة</h3>

            {/* Feature 1 - Interactive Content */}
            <div className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="mb-2 text-lg font-bold text-gray-800 dark:text-white font-arabic">المحتوى التفاعلي والملاحظات</h4>
                <p className="text-gray-600 dark:text-gray-300 font-arabic text-sm leading-relaxed">
                  استخدم أدوات الملاحظات والبوكماركس وانت بتتفرج على الدروس. اكتب ملاحظاتك الشخصية وارجعلها بعدين للمراجعة السريعة.
                </p>
              </div>
            </div>

            {/* Feature 2 - AI Teacher */}
            <div className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="mb-2 text-lg font-bold text-gray-800 dark:text-white font-arabic">المدرس الذكي والمساعدة الفورية</h4>
                <p className="text-gray-600 dark:text-gray-300 font-arabic text-sm leading-relaxed">
                  متترددش تسأل المدرس الذكي عن أي حاجة مش فاهمها. هيقدر يشرحلك بطريقة سهلة ويديك أمثلة إضافية وحلول للمسائل الصعبة.
                </p>
              </div>
            </div>

            {/* Feature 3 - Progress Tracking */}
            <div className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="mb-2 text-lg font-bold text-gray-800 dark:text-white font-arabic">متابعة التقدم والإحصائيات</h4>
                <p className="text-gray-600 dark:text-gray-300 font-arabic text-sm leading-relaxed">
                  شوف لوحة التحكم كل يوم عشان تتابع تقدمك. حلل نقط قوتك وضعفك من الإحصائيات المفصلة وركز على المواضيع اللي محتاجة تحسين.
                </p>
              </div>
            </div>

            {/* Feature 4 - Flashcards */}
            <div className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="mb-2 text-lg font-bold text-gray-800 dark:text-white font-arabic">البطاقات التعليمية الذكية</h4>
                <p className="text-gray-600 dark:text-gray-300 font-arabic text-sm leading-relaxed">
                  اعمل بطاقات تعليمية للمفاهيم المهمة والمصطلحات. استخدم نظام المراجعة المتباعدة عشان تذاكر بشكل فعال وتقوي ذاكرتك.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Advanced Study Strategies */}
          <div className="space-y-6">
            <h3 className="mb-8 text-2xl font-bold text-gray-800 dark:text-white font-arabic">استراتيجيات المذاكرة المتقدمة</h3>

            {/* Strategy 1 - Time Management */}
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 p-6 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="mb-4 flex items-center gap-3">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h4 className="text-lg font-bold text-gray-800 dark:text-white font-arabic">تنظيم الوقت بذكاء</h4>
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-arabic text-sm leading-relaxed">
                استخدم طريقة البومودورو: 25 دقيقة مذاكرة وبعدين 5 دقايق راحة. تابع وقت مذاكرتك من المنصة وحط أهداف يومية واقعية.
              </p>
            </div>

            {/* Strategy 2 - Active Learning */}
            <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 p-6 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="mb-4 flex items-center gap-3">
                <PlayCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                <h4 className="text-lg font-bold text-gray-800 dark:text-white font-arabic">التعلم النشط والتطبيق</h4>
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-arabic text-sm leading-relaxed">
                مش كفاية تتفرج على الفيديوهات وبس. حل التمارين على طول بعد كل درس، وطبق اللي اتعلمته على أمثلة جديدة، واستخدم الاختبارات.
              </p>
            </div>

            {/* Strategy 3 - Community Learning */}
            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-100 p-6 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="mb-4 flex items-center gap-3">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <h4 className="text-lg font-bold text-gray-800 dark:text-white font-arabic">التعلم الجماعي والمناقشات</h4>
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-arabic text-sm leading-relaxed">
                شارك في المناقشات مع زمايلك، اسأل في المنتديات، وساعد غيرك. لما تشرح لغيرك بتفهم أحسن وبتكتشف الثغرات في معلوماتك.
              </p>
            </div>

            {/* Strategy 4 - Regular Assessment */}
            <div className="rounded-xl bg-gradient-to-br from-orange-50 to-amber-100 p-6 dark:from-orange-900/20 dark:to-amber-900/20">
              <div className="mb-4 flex items-center gap-3">
                <Trophy className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                <h4 className="text-lg font-bold text-gray-800 dark:text-white font-arabic">التقييم المستمر والمراجعة</h4>
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-arabic text-sm leading-relaxed">
                اختبر نفسك على طول بالكويزات. راجع أخطاءك واتعلم منها. استخدم نظام المراجعة المتباعدة للمواد المهمة.
              </p>
            </div>

            {/* Strategy 5 - Goal Setting */}
            <div className="rounded-xl bg-gradient-to-br from-teal-50 to-cyan-100 p-6 dark:from-teal-900/20 dark:to-cyan-900/20">
              <div className="mb-4 flex items-center gap-3">
                <Target className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                <h4 className="text-lg font-bold text-gray-800 dark:text-white font-arabic">تحديد الأهداف والتحفيز</h4>
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-arabic text-sm leading-relaxed">
                حط أهداف قصيرة وطويلة المدى. احتفل بإنجازاتك الصغيرة، وتابع الشارات والإنجازات بتاعتك على المنصة عشان تحافظ على حماسك.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
