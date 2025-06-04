 'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  Users,
  Trophy,
  Zap,
  Target,
  Sparkles,
  Play,
  CheckCircle,
  Star,
  GraduationCap,
  Brain,
  Clock,
  Award,
  Monitor,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Video,
  Facebook,
  MessageCircle,
  Send,
  Music,
  Youtube,
  PenTool,
  Lightbulb,
  BookOpenCheck,
  UserCheck,
  TrendingUp,
  Calendar,
  FileText,
  MessageSquare,
  Globe,
  Calculator,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FAQSection } from '@/components/faq-section';
import { CourseCard } from '@/components/landing/course-card';
import { FeatureCard } from '@/components/landing/feature-card';
import { StudyTips } from '@/components/landing/study-tips';
import { Testimonials } from '@/components/landing/testimonials';
import { VideoPlayer } from '@/components/landing/video-player';
import { EidModal } from '@/components/ui/eid-modal';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LandingPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Scroll to video section
  const scrollToVideo = () => {
    const videoSection = document.getElementById('demo-section');
    if (videoSection) {
      videoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle authentication redirect
  useEffect(() => {
    if (isLoaded && userId) {
      router.push('/dashboard');
    }
  }, [isLoaded, userId, router]);

  // Show loading state while auth is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-arabic">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is authenticated (will redirect)
  if (userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900" dir="rtl">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="hidden sm:block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-lg md:text-xl font-bold text-transparent font-arabic">
                LMS Ali
              </span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4 space-x-reverse">
              <ThemeToggle />
              <button
                onClick={openModal}
                className="hidden sm:block text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-arabic text-sm md:text-base"
              >
                لوحة التحكم
              </button>
              <Button
                onClick={openModal}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-arabic text-xs md:text-sm px-2 sm:px-3 md:px-4"
              >
                <span className="hidden sm:inline">تسجيل الدخول</span>
                <span className="sm:hidden">دخول</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="animate-fade-in">
              {/* New Arabic Slogan */}
              <div className="mb-4 inline-block rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-2 dark:from-blue-900/30 dark:to-purple-900/30">
                <p className="text-lg font-bold text-blue-800 dark:text-blue-200 font-arabic animate-typing-fast">
                   من P2S إلى كلية التجارة .. خطوة بثقة!
                </p>
              </div>
              
              <h1 className="animate-slide-up mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-5xl font-bold text-transparent md:text-7xl font-arabic leading-tight">
                مستقبل التعلم
                <br />
                <span className="text-4xl md:text-6xl">يبدأ هنا</span>
              </h1>
            </div>

            <p className="animate-slide-up animation-delay-200 mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-300 md:text-2xl font-arabic leading-relaxed">
              منصة تعليمية شاملة تجمع بين التكنولوجيا المتقدمة والتعلم التفاعلي لتوفير تجربة تعليمية استثنائية
            </p>

            <div className="animate-slide-up animation-delay-400 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                onClick={openModal}
                className="transform bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl font-arabic"
              >
                <span className="flex items-center gap-2">
                  ابدأ التعلم الآن
                  <ArrowRight className="h-5 w-5 rotate-180" />
                </span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToVideo}
                className="transform border-2 border-purple-600 text-purple-600 transition-all duration-300 hover:scale-105 hover:bg-purple-600 hover:text-white font-arabic"
              >
                <Play className="ml-2 h-5 w-5" />
                شاهد العرض التوضيحي
              </Button>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="relative mt-16">
            <div className="animate-float absolute right-10 top-10 h-20 w-20 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20"></div>
            <div className="animate-float animation-delay-1000 absolute left-16 top-32 h-16 w-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20"></div>
            <div className="animate-float animation-delay-2000 absolute bottom-10 right-1/4 h-12 w-12 rounded-full bg-gradient-to-r from-indigo-400 to-blue-400 opacity-20"></div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl font-arabic">
              دوراتنا التعليمية
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300 font-arabic leading-relaxed">
              اختر من بين دوراتنا المتخصصة المصممة لتطوير مهاراتك وتحقيق أهدافك التعليمية
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <CourseCard
              title="اللغة الفرنسية"
              description="تعلم أساسيات اللغة الفرنسية من خلال دروس تفاعلية ومحادثات عملية مع متحدثين أصليين"
              icon={Globe}
              gradientFrom="from-blue-50"
              gradientTo="to-indigo-100"
              iconGradientFrom="from-blue-500"
              iconGradientTo="to-purple-500"
              priceColor="text-blue-600"
              onStartClick={openModal}
            />
            
            <CourseCard
              title="الرياضيات"
              description="استكشف عالم الرياضيات من خلال حلول مبتكرة وتمارين تطبيقية تساعدك على فهم المفاهيم بسهولة"
              icon={Calculator}
              gradientFrom="from-green-50"
              gradientTo="to-emerald-100"
              iconGradientFrom="from-green-500"
              iconGradientTo="to-emerald-500"
              priceColor="text-green-600"
              onStartClick={openModal}
            />
            
            <CourseCard
              title="اللغة الإنجليزية"
              description="طور مهاراتك في اللغة الإنجليزية من خلال نصوص تفاعلية وتمارين شاملة ومحادثات عملية"
              icon={BookOpen}
              gradientFrom="from-purple-50"
              gradientTo="to-pink-100"
              iconGradientFrom="from-purple-500"
              iconGradientTo="to-pink-500"
              priceColor="text-purple-600"
              onStartClick={openModal}
            />
            
            <CourseCard
              title="الجغرافيا"
              description="رحلة استكشافية عبر العالم مع خرائط تفاعلية ومحتوى مرئي غني يجعل التعلم ممتعاً وشيقاً"
              icon={MapPin}
              gradientFrom="from-orange-50"
              gradientTo="to-red-100"
              iconGradientFrom="from-orange-500"
              iconGradientTo="to-red-500"
              priceColor="text-orange-600"
              onStartClick={openModal}
            />
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              onClick={openModal}
              className="transform bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 font-arabic"
            >
              <span className="flex items-center gap-2">
                استكشف جميع الدورات
                <ArrowRight className="h-5 w-5 rotate-180" />
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl font-arabic">
              مميزات استثنائية
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300 font-arabic leading-relaxed">
              اكتشف كيف يمكن لمنصتنا تحويل رحلة التعلم الخاصة بك إلى تجربة ممتعة وفعالة
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              title="محتوى تفاعلي"
              description="دروس تفاعلية مع دعم الرياضيات والمحتوى المرئي المتقدم لتجربة تعلم غامرة"
              icon={BookOpen}
              gradientFrom="from-blue-50"
              gradientTo="to-indigo-100"
              iconGradientFrom="from-blue-500"
              iconGradientTo="to-purple-500"
            />
            
            <FeatureCard
              title="ذكاء اصطناعي"
              description="مدرس ذكي يقدم المساعدة الفورية والإجابة على أسئلتك على مدار الساعة"
              icon={Brain}
              gradientFrom="from-purple-50"
              gradientTo="to-pink-100"
              iconGradientFrom="from-purple-500"
              iconGradientTo="to-pink-500"
            />
            
            <FeatureCard
              title="نظام اختبارات"
              description="اختبارات شاملة مع تقييم فوري وتتبع مفصل للأداء والتقدم"
              icon={Trophy}
              gradientFrom="from-green-50"
              gradientTo="to-emerald-100"
              iconGradientFrom="from-green-500"
              iconGradientTo="to-emerald-500"
            />
            
            <FeatureCard
              title="بطاقات تعليمية"
              description="نظام بطاقات ذكي يساعد على الحفظ والمراجعة بطريقة فعالة ومنظمة"
              icon={Zap}
              gradientFrom="from-orange-50"
              gradientTo="to-red-100"
              iconGradientFrom="from-orange-500"
              iconGradientTo="to-red-500"
            />
            
            <FeatureCard
              title="تتبع التقدم"
              description="لوحة تحكم شاملة لمتابعة التقدم والإحصائيات التفصيلية لرحلة التعلم"
              icon={Target}
              gradientFrom="from-teal-50"
              gradientTo="to-cyan-100"
              iconGradientFrom="from-teal-500"
              iconGradientTo="to-cyan-500"
            />
            
            <FeatureCard
              title="تعلم جماعي"
              description="منصة تفاعلية تسمح بالتعلم الجماعي ومشاركة المعرفة بين الطلاب"
              icon={Users}
              gradientFrom="from-indigo-50"
              gradientTo="to-blue-100"
              iconGradientFrom="from-indigo-500"
              iconGradientTo="to-blue-500"
            />
            
            <FeatureCard
              title="تمارين تطبيقية"
              description="تمارين متنوعة وتطبيقات عملية لترسيخ المفاهيم وتطوير المهارات العملية"
              icon={PenTool}
              gradientFrom="from-green-50"
              gradientTo="to-amber-100"
              iconGradientFrom="from-yellow-500"
              iconGradientTo="to-amber-500"
            />
            
            <FeatureCard
              title="أفكار إبداعية"
              description="تحفيز الإبداع والابتكار من خلال مشاريع تطبيقية وحلول مبتكرة للمشاكل"
              icon={Lightbulb}
              gradientFrom="from-orange-50"
              gradientTo="to-rose-100"
              iconGradientFrom="from-pink-500"
              iconGradientTo="to-rose-500"
            />
            
            <FeatureCard
              title="تمارين وممارسات"
              description="تمارين تفاعلية متنوعة وممارسات عملية لتطبيق المعرفة وتعزيز الفهم"
              icon={BookOpenCheck}
              gradientFrom="from-green-50"
              gradientTo="to-teal-100"
              iconGradientFrom="from-emerald-500"
              iconGradientTo="to-teal-500"
            />
            
            <FeatureCard
              title="اختبارات شاملة"
              description="نظام اختبارات متقدم مع تقييم فوري وتحليل مفصل للأداء والنتائج"
              icon={FileText}
              gradientFrom="from-indigo-50"
              gradientTo="to-purple-100"
              iconGradientFrom="from-indigo-500"
              iconGradientTo="to-purple-500"
            />
          </div>
        </div>
      </section>

      {/* Study Tips Section */}
      <StudyTips onStartClick={openModal} />

      {/* Demo Section */}
      <section id="demo-section" className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-20 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl font-arabic">
              شاهد الفيديو الترويجي
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300 font-arabic leading-relaxed">
              اكتشف كيف تعمل منصتنا من خلال الفيديو الترويجي الذي يوضح جميع الميزات والوظائف
            </p>
          </div>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Promo Video */}
            <div className="relative">
              <VideoPlayer 
                src="https://drive.google.com/file/d/1sKkn1hxG6WMA32LVXzYb6lnqYSgP4Cn9/view?usp=sharing"
                poster="/promo-poster.svg"
                title="عرض توضيحي للمنصة - من P2S إلى كلية التجارة .. خطوة بثقة!"
                description="اكتشف جميع الميزات والوظائف المتقدمة في منصة التعلم الذكية (جودة 480p - فيديو كامل)"
              />
              
              {/* Floating UI Elements */}
              <div className="animate-float absolute right-4 top-4 rounded-lg bg-white/90 p-2 shadow-lg dark:bg-gray-800/90 pointer-events-none">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-arabic">جودة عالية</span>
                </div>
              </div>

              <div className="animate-float animation-delay-1000 absolute bottom-4 left-4 rounded-lg bg-white/90 p-3 shadow-lg dark:bg-gray-800/90 pointer-events-none">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-arabic">محتوى مميز!</span>
                </div>
              </div>

              <div className="animate-float animation-delay-2000 absolute left-8 top-1/2 rounded-lg bg-white/90 p-2 shadow-lg dark:bg-gray-800/90 pointer-events-none">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Demo Features */}
            <div className="space-y-6">
              <div className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                  <Monitor className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white font-arabic">واجهة سهلة الاستخدام</h3>
                  <p className="text-gray-600 dark:text-gray-300 font-arabic">
                    تصميم بديهي وسهل التنقل يمكن أي شخص من استخدام المنصة بكفاءة
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white font-arabic">فيديوهات عالية الجودة</h3>
                  <p className="text-gray-600 dark:text-gray-300 font-arabic">
                    محتوى مرئي بجودة عالية مع دعم HLS للتشغيل السلس على جميع الأجهزة
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white font-arabic">تتبع تفصيلي للتقدم</h3>
                  <p className="text-gray-600 dark:text-gray-300 font-arabic">رؤية شاملة لأدائك مع تحليلات مفصلة وتوصيات شخصية</p>
                </div>
              </div>

              <Button
                size="lg"
                onClick={openModal}
                className="w-full transform bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 font-arabic"
              >
                <span className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  ابدأ التجربة المجانية الآن
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <div className="text-white">
              <div className="mb-2 text-4xl font-bold md:text-5xl numbers-ltr">500+</div>
              <div className="text-blue-100 font-arabic">طالب نشط</div>
            </div>
            <div className="text-white">
              <div className="mb-2 text-4xl font-bold md:text-5xl numbers-ltr">4+</div>
              <div className="text-blue-100 font-arabic">دورة تدريبية</div>
            </div>
            <div className="text-white">
              <div className="mb-2 text-4xl font-bold md:text-5xl numbers-ltr">95%</div>
              <div className="text-blue-100 font-arabic">معدل الرضا</div>
            </div>
            <div className="text-white">
              <div className="mb-2 text-4xl font-bold md:text-5xl numbers-ltr">24/7</div>
              <div className="text-blue-100 font-arabic">دعم فني</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ Section */}
      <section className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 px-2 md:px-4 py-20 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto">
          <FAQSection />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">ابدأ رحلتك التعليمية اليوم</h2>
          <p className="mb-8 text-xl text-gray-300">انضم إلى آلاف الطلاب الذين يحققون أهدافهم التعليمية معنا</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={openModal}
              className="transform bg-white text-gray-900 transition-all duration-300 hover:scale-105 hover:bg-gray-100"
            >
              <span className="flex items-center gap-2">
                إنشاء حساب مجاني
                <Sparkles className="h-5 w-5" />
              </span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="transform border-white text-white transition-all duration-300 hover:scale-105 hover:bg-white hover:text-gray-900"
            >
              تواصل معنا
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Brand Section */}
            <div className="text-center md:text-right">
              <div className="mb-4 flex items-center justify-center space-x-2 md:justify-start">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">LMS Ali</span>
            </div>
              <p className="text-gray-400">
                منصة تعليمية شاملة لمستقبل أفضل
              </p>
            </div>

            {/* Social Media Section */}
            <div className="text-center">
              <h3 className="mb-4 text-lg font-semibold">تواصل معنا</h3>
              <div className="flex justify-center space-x-4">
                <a
                  href="https://www.facebook.com/share/15yPDUE1KP/?mibextid=qi2Omg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-700">
                    <Facebook className="h-5 w-5 text-white" />
                  </div>
                </a>
                <a
                  href="https://whatsapp.com/channel/0029VagArxy42DcfmFVEJP1e"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-green-700">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                </a>
                <a
                  href="https://t.me/hdjdjfxnx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600">
                    <Send className="h-5 w-5 text-white" />
                  </div>
                </a>
                <a
                  href="https://www.tiktok.com/@ahmedali_447?_t=ZS-8vTtRf78KxT&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black transition-all duration-300 group-hover:scale-110 group-hover:bg-gray-800">
                    <Music className="h-5 w-5 text-white" />
                  </div>
                </a>
                <a
                  href="https://youtube.com/playlist?list=PLUdMHMUbDy9DyoA77SQJgxYQs7y6qUcrh&si=_fsbmuqaaOlgYJ1d"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-red-700">
                    <Youtube className="h-5 w-5 text-white" />
                  </div>
                </a>
              </div>
            </div>

            {/* Copyright Section */}
            <div className="text-center md:text-left">
              <div className="text-gray-400">
                © 2025 LMS Ali
                <br />
                جميع الحقوق محفوظة
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Eid Modal */}
      <EidModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
