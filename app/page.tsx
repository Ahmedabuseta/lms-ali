'use client';

import { useSession } from '@/lib/auth-client';
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
  GraduationCap,
  Brain,
  Monitor,
  Video,
  Facebook,
  MessageCircle,
  Send,
  Music,
  Youtube,
  PenTool,
  FileText,
  Globe,
  Calculator,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FAQSection } from '@/components/faq-section';
import { CourseCard } from '@/components/landing/course-card';
import { FeatureCard } from '@/components/landing/feature-card';
import { StudyTips } from '@/components/landing/study-tips';
import { Testimonials } from '@/components/landing/testimonials';
import { VideoPlayer } from '@/components/landing/video-player';
// import { EidModal } from '@/components/ui/eid-modal'; // Will be used later
import { ComingSoonModal } from '@/components/ui/coming-soon-modal';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LandingPage() {
  const { data: session, isPending } = useSession();
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
    if (!isPending && session?.user) {
      router.push('/dashboard');
    }
  }, [isPending, session, router]);

  // Show loading state while auth is loading
  if (isPending) {
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
  if (session?.user) {
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
              <a
                href="https://whatsapp.com/channel/0029VagArxy42DcfmFVEJP1e"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-arabic text-sm md:text-base"
              >
                <MessageCircle className="h-4 w-4" />
                تواصل معانا
              </a>
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
                <span className="hidden sm:inline">سجل دخولك</span>
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
                  من P2S لكلية التجارة .. معانا هتوصل بثقة!
                </p>
              </div>
              
              <h1 className="animate-slide-up mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-5xl font-bold text-transparent md:text-7xl font-arabic leading-tight">
                طريقك لكلية التجارة
                <br />
                <span className="text-4xl md:text-6xl">يبدأ من هنا</span>
              </h1>
            </div>

            <p className="animate-slide-up animation-delay-200 mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-300 md:text-2xl font-arabic leading-relaxed">
              هنساعدك تحقق حلمك وتدخل كلية التجارة بأحسن الدرجات من خلال دروس تفاعلية ومتابعة شخصية
            </p>

                      <div className="animate-slide-up animation-delay-400 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={openModal}
              className="transform bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl font-arabic"
            >
              <span className="flex items-center gap-2">
                ابدأ رحلتك دلوقتي
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
              شوف إزاي بنشتغل
            </Button>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="relative mt-16">
          <div className="animate-float absolute right-10 top-10 h-20 w-20 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20" />
          <div className="animate-float animation-delay-1000 absolute left-16 top-32 h-16 w-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20" />
          <div className="animate-float animation-delay-2000 absolute bottom-10 right-1/4 h-12 w-12 rounded-full bg-gradient-to-r from-indigo-400 to-blue-400 opacity-20" />
        </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl font-arabic">
              مواد كلية التجارة
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300 font-arabic leading-relaxed">
              اختار المادة اللي عايز تتقنها وابدأ رحلتك لكلية التجارة معانا
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <CourseCard
              title="فرنساوي"
              description="هنساعدك تجيب أعلى الدرجات في الفرنساوي وتوصل لكلية التجارة من خلال شرح مبسط وتدريبات مكثفة"
              icon={Globe}
              gradientFrom="from-blue-50"
              gradientTo="to-indigo-100"
              iconGradientFrom="from-blue-500"
              iconGradientTo="to-purple-500"
              priceColor="text-blue-600"
              onStartClick={openModal}
            />

            <CourseCard
              title="رياضة"
              description="هنساعدك تحقق أعلى الدرجات في الرياضة وتضمن مكانك في كلية التجارة من خلال شرح تفصيلي وتمارين شاملة"
              icon={Calculator}
              gradientFrom="from-green-50"
              gradientTo="to-emerald-100"
              iconGradientFrom="from-green-500"
              iconGradientTo="to-emerald-500"
              priceColor="text-green-600"
              onStartClick={openModal}
            />

            <CourseCard
              title="إنجليزي"
              description="هنساعدك توصل لأعلى الدرجات في الإنجليزي وتحقق حلمك في كلية التجارة من خلال منهج متكامل وتدريبات عملية"
              icon={BookOpen}
              gradientFrom="from-purple-50"
              gradientTo="to-pink-100"
              iconGradientFrom="from-purple-500"
              iconGradientTo="to-pink-500"
              priceColor="text-purple-600"
              onStartClick={openModal}
            />

            <CourseCard
              title="جغرافيا"
              description="هنساعدك تجيب الدرجة النهائية في الجغرافيا وتدخل كلية التجارة من خلال شرح مبسط وخرائط تفاعلية"
              icon={MapPin}
              gradientFrom="from-orange-50"
              gradientTo="to-red-100"
              iconGradientFrom="from-orange-500"
              iconGradientTo="to-red-500"
              priceColor="text-orange-600"
              onStartClick={openModal}
            />
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl font-arabic">
              إيه اللي يميزنا؟
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300 font-arabic leading-relaxed">
              شوف إزاي منصتنا هتساعدك توصل لكلية التجارة بأسهل الطرق وأحدث الأساليب
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              title="دروس تفاعلية"
              description="دروس حية ومتفاعلة مع فيديوهات شرح مفصلة عشان تفهم كل حاجة صح"
              icon={BookOpen}
              gradientFrom="from-blue-50"
              gradientTo="to-indigo-100"
              iconGradientFrom="from-blue-500"
              iconGradientTo="to-purple-500"
            />

            <FeatureCard
              title="مساعد ذكي"
              description="مدرس ذكي جاهز يساعدك ويجاوب على أسئلتك في أي وقت تحتاجه"
              icon={Brain}
              gradientFrom="from-purple-50"
              gradientTo="to-pink-100"
              iconGradientFrom="from-purple-500"
              iconGradientTo="to-pink-500"
            />

            <FeatureCard
              title="كروت مراجعة"
              description="نظام كروت سهل وذكي يساعدك تحفظ وتراجع المعلومات بطريقة منظمة"
              icon={Zap}
              gradientFrom="from-orange-50"
              gradientTo="to-red-100"
              iconGradientFrom="from-orange-500"
              iconGradientTo="to-red-500"
            />

            <FeatureCard
              title="متابعة درجاتك"
              description="تقدر تشوف درجاتك وتطورك في كل مادة عشان تعرف إيه اللي محتاج تحسنه"
              icon={Target}
              gradientFrom="from-teal-50"
              gradientTo="to-cyan-100"
              iconGradientFrom="from-teal-500"
              iconGradientTo="to-cyan-500"
            />

            <FeatureCard
              title="مجموعات دراسة"
              description="ادرس مع زمايلك وشارك المعلومات عشان تستفيدوا من بعض"
              icon={Users}
              gradientFrom="from-indigo-50"
              gradientTo="to-blue-100"
              iconGradientFrom="from-indigo-500"
              iconGradientTo="to-blue-500"
            />

            <FeatureCard
              title="تمارين كتيرة"
              description="تمارين متنوعة وحلول مفصلة عشان تتدرب على كل أنواع الأسئلة"
              icon={PenTool}
              gradientFrom="from-green-50"
              gradientTo="to-amber-100"
              iconGradientFrom="from-yellow-500"
              iconGradientTo="to-amber-500"
            />

            <FeatureCard
              title="اختبارات شاملة"
              description="اختبارات زي الحقيقية بالظبط عشان تتعود على شكل الامتحان"
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
              شوف الفيديو ده
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300 font-arabic leading-relaxed">
              اتفرج على الفيديو ده عشان تشوف إزاي منصتنا بتشتغل وإيه اللي هتستفيده منها
            </p>
          </div>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Promo Video */}
            <div className="relative">
              <VideoPlayer
                src="/video-proxy/https://fra1.digitaloceanspaces.com/lms-ali-p2s/promo1/480p.m3u8"
                poster="/thumbnail.jpg"
                title="من P2S لكلية التجارة .. معانا هتوصل بثقة!"
                description=" "
              />

              {/* Floating UI Elements */}
              <div className="animate-float absolute right-4 top-4 rounded-lg bg-white/90 p-2 shadow-lg dark:bg-gray-800/90 pointer-events-none">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
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
                  <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white font-arabic">سهل الاستخدام</h3>
                  <p className="text-gray-600 dark:text-gray-300 font-arabic">
                    تصميم بسيط وسهل أي حد يقدر يستخدمه من غير مشاكل
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white font-arabic">فيديوهات واضحة</h3>
                  <p className="text-gray-600 dark:text-gray-300 font-arabic">
                    فيديوهات بجودة عالية تشتغل على كل الأجهزة من غير مشاكل
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white font-arabic">متابعة مستواك</h3>
                  <p className="text-gray-600 dark:text-gray-300 font-arabic">شوف تطورك ومستواك في كل مادة ونصايح تساعدك تتحسن</p>
                </div>
              </div>

              <Button
                size="lg"
                onClick={openModal}
                className="w-full transform bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 font-arabic"
              >
                <span className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  جرب مجاناً دلوقتي
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
              <div className="text-blue-100 font-arabic">طالب معانا</div>
            </div>
            <div className="text-white">
              <div className="mb-2 text-4xl font-bold md:text-5xl numbers-ltr">4+</div>
              <div className="text-blue-100 font-arabic">مادة دراسية</div>
            </div>
            <div className="text-white">
              <div className="mb-2 text-4xl font-bold md:text-5xl numbers-ltr">95%</div>
              <div className="text-blue-100 font-arabic">نسبة نجاح</div>
            </div>
            <div className="text-white">
              <div className="mb-2 text-4xl font-bold md:text-5xl numbers-ltr">24/7</div>
              <div className="text-blue-100 font-arabic">دعم مستمر</div>
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
          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl font-arabic">ابدأ رحلتك لكلية التجارة النهاردة</h2>
          <p className="mb-8 text-xl text-gray-300 font-arabic">انضم لآلاف الطلبة اللي حققوا حلمهم ودخلوا كلية التجارة معانا</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={openModal}
              className="transform bg-white text-gray-900 transition-all duration-300 hover:scale-105 hover:bg-gray-100 font-arabic"
            >
              <span className="flex items-center gap-2">
                إنشاء حساب مجاني
                <Sparkles className="h-5 w-5" />
              </span>
            </Button>
            <a
              href="https://whatsapp.com/channel/0029VagArxy42DcfmFVEJP1e"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="transform border-white text-white transition-all duration-300 hover:scale-105 hover:bg-white hover:text-gray-900 font-arabic"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  تواصل معانا
                </span>
              </Button>
            </a>
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
                <span className="text-xl font-bold font-arabic">LMS Ali</span>
              </div>
              <p className="text-gray-400 font-arabic">
                طريقك لكلية التجارة يبدأ من هنا
              </p>
            </div>

            {/* Social Media Section */}
            <div className="text-center">
              <h3 className="mb-4 text-lg font-semibold font-arabic">تواصل معانا</h3>
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
              <div className="text-gray-400 font-arabic">
                © 2025 LMS Ali
                <br />
                جميع الحقوق محفوظة
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Coming Soon Modal */}
      <ComingSoonModal isOpen={isModalOpen} onClose={closeModal} />
      
      {/* Eid Modal - Will be used later */}
      {/* <EidModal isOpen={isModalOpen} onClose={closeModal} /> */}
      
      {/* Floating WhatsApp Button */}
      <a
        href="https://whatsapp.com/channel/0029VagArxy42DcfmFVEJP1e"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 group"
        aria-label="تواصل معانا على واتساب"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group-hover:from-green-600 group-hover:to-green-700">
          <MessageCircle className="h-7 w-7 text-white" />
        </div>
        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 mb-2 hidden min-w-max rounded-lg bg-gray-800 px-3 py-2 text-sm text-white shadow-lg group-hover:block dark:bg-gray-700">
          <span className="font-arabic">تواصل معانا</span>
          <div className="absolute -bottom-1 right-4 h-2 w-2 rotate-45 bg-gray-800 dark:bg-gray-700"></div>
        </div>
      </a>
    </div>
  );
}
