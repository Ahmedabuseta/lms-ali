import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  const { userId } = auth();

  // If user is authenticated, redirect to dashboard
  if (userId) {
    return redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
                LMS Ali
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              >
                لوحة التحكم
              </Link>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link href="/sign-in">تسجيل الدخول</Link>
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
              <h1 className="animate-slide-up mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-5xl font-bold text-transparent md:text-7xl">
                مستقبل التعلم
                <br />
                <span className="text-4xl md:text-6xl">يبدأ هنا</span>
              </h1>
            </div>

            <p className="animate-slide-up animation-delay-200 mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-300 md:text-2xl">
              منصة تعليمية شاملة تجمع بين التكنولوجيا المتقدمة والتعلم التفاعلي لتوفير تجربة تعليمية استثنائية
            </p>

            <div className="animate-slide-up animation-delay-400 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                asChild
                className="transform bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  ابدأ التعلم الآن
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="transform border-2 border-purple-600 text-purple-600 transition-all duration-300 hover:scale-105 hover:bg-purple-600 hover:text-white"
              >
                <Play className="mr-2 h-5 w-5" />
                شاهد العرض التوضيحي
              </Button>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="relative mt-16">
            <div className="animate-float absolute left-10 top-10 h-20 w-20 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20"></div>
            <div className="animate-float animation-delay-1000 absolute right-16 top-32 h-16 w-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20"></div>
            <div className="animate-float animation-delay-2000 absolute bottom-10 left-1/4 h-12 w-12 rounded-full bg-gradient-to-r from-indigo-400 to-blue-400 opacity-20"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              مميزات استثنائية
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
              اكتشف كيف يمكن لمنصتنا تحويل رحلة التعلم الخاصة بك إلى تجربة ممتعة وفعالة
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="group transform border-0 bg-gradient-to-br from-blue-50 to-indigo-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardContent className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 transition-transform duration-300 group-hover:scale-110">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">محتوى تفاعلي</h3>
                <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                  دروس تفاعلية مع دعم الرياضيات والمحتوى المرئي المتقدم لتجربة تعلم غامرة
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group transform border-0 bg-gradient-to-br from-purple-50 to-pink-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:from-purple-900/20 dark:to-pink-900/20">
              <CardContent className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 transition-transform duration-300 group-hover:scale-110">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">ذكاء اصطناعي</h3>
                <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                  مدرس ذكي يقدم المساعدة الفورية والإجابة على أسئلتك على مدار الساعة
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group transform border-0 bg-gradient-to-br from-green-50 to-emerald-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:from-green-900/20 dark:to-emerald-900/20">
              <CardContent className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 transition-transform duration-300 group-hover:scale-110">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">نظام اختبارات</h3>
                <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                  اختبارات شاملة مع تقييم فوري وتتبع مفصل للأداء والتقدم
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="group transform border-0 bg-gradient-to-br from-orange-50 to-red-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:from-orange-900/20 dark:to-red-900/20">
              <CardContent className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 transition-transform duration-300 group-hover:scale-110">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">بطاقات تعليمية</h3>
                <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                  نظام بطاقات ذكي يساعد على الحفظ والمراجعة بطريقة فعالة ومنظمة
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="group transform border-0 bg-gradient-to-br from-teal-50 to-cyan-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:from-teal-900/20 dark:to-cyan-900/20">
              <CardContent className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 transition-transform duration-300 group-hover:scale-110">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">تتبع التقدم</h3>
                <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                  لوحة تحكم شاملة لمتابعة التقدم والإحصائيات التفصيلية لرحلة التعلم
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="group transform border-0 bg-gradient-to-br from-indigo-50 to-blue-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:from-indigo-900/20 dark:to-blue-900/20">
              <CardContent className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 transition-transform duration-300 group-hover:scale-110">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">تعلم جماعي</h3>
                <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                  منصة تفاعلية تسمح بالتعلم الجماعي ومشاركة المعرفة بين الطلاب
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-20 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              شاهد العرض التوضيحي
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">
              اكتشف كيف تعمل منصتنا من خلال عرض تفاعلي يوضح جميع الميزات والوظائف
            </p>
          </div>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Video Demo */}
            <div className="group relative">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-1 shadow-2xl">
                <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-900">
                  <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
                    <Button
                      size="lg"
                      className="relative z-10 bg-white/90 text-blue-600 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white dark:bg-gray-800/90"
                    >
                      <Play className="mr-2 h-8 w-8" />
                      تشغيل العرض التوضيحي
                    </Button>

                    {/* Floating UI Elements */}
                    <div className="animate-float absolute left-4 top-4 rounded-lg bg-white/90 p-2 shadow-lg dark:bg-gray-800/90">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">متصل</span>
                      </div>
                    </div>

                    <div className="animate-float animation-delay-1000 absolute bottom-4 right-4 rounded-lg bg-white/90 p-3 shadow-lg dark:bg-gray-800/90">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">إنجاز جديد!</span>
                      </div>
                    </div>

                    <div className="animate-float animation-delay-2000 absolute right-8 top-1/2 rounded-lg bg-white/90 p-2 shadow-lg dark:bg-gray-800/90">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
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
                  <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">واجهة سهلة الاستخدام</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    تصميم بديهي وسهل التنقل يمكن أي شخص من استخدام المنصة بكفاءة
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">محتوى مرئي تفاعلي</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    فيديوهات عالية الجودة مع إمكانية التفاعل والمشاركة المباشرة
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">تتبع تفصيلي للتقدم</h3>
                  <p className="text-gray-600 dark:text-gray-300">رؤية شاملة لأدائك مع تحليلات مفصلة وتوصيات شخصية</p>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full transform bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700"
              >
                <Play className="mr-2 h-5 w-5" />
                ابدأ التجربة المجانية
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
              <div className="mb-2 text-4xl font-bold md:text-5xl">1000+</div>
              <div className="text-blue-100">طالب نشط</div>
            </div>
            <div className="text-white">
              <div className="mb-2 text-4xl font-bold md:text-5xl">50+</div>
              <div className="text-blue-100">دورة تدريبية</div>
            </div>
            <div className="text-white">
              <div className="mb-2 text-4xl font-bold md:text-5xl">95%</div>
              <div className="text-blue-100">معدل الرضا</div>
            </div>
            <div className="text-white">
              <div className="mb-2 text-4xl font-bold md:text-5xl">24/7</div>
              <div className="text-blue-100">دعم فني</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              آراء طلابنا
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">اكتشف كيف غيرت منصتنا حياة الآلاف من الطلاب</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800"
              >
                <CardContent className="p-8">
                  <div className="mb-4 flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-current text-yellow-400" />
                    ))}
                  </div>
                  <p className="mb-6 leading-relaxed text-gray-600 dark:text-gray-300">
                    "منصة رائعة ساعدتني في تطوير مهاراتي بشكل كبير. المحتوى عالي الجودة والواجهة سهلة الاستخدام."
                  </p>
                  <div className="flex items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 font-bold text-white">
                      أ
                    </div>
                    <div className="mr-4">
                      <div className="font-semibold text-gray-800 dark:text-white">أحمد محمد</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">طالب هندسة</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 px-4 py-20 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              الأسئلة الشائعة
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              إجابات على أكثر الأسئلة شيوعاً حول منصتنا التعليمية
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: 'هل المنصة مجانية؟',
                answer:
                  'نعم، نوفر خطة مجانية تتضمن الوصول إلى المحتوى الأساسي. كما نوفر خطط مدفوعة للحصول على ميزات متقدمة إضافية.',
              },
              {
                question: 'كيف يمكنني تتبع تقدمي في التعلم؟',
                answer:
                  'توفر منصتنا لوحة تحكم شاملة تعرض تقدمك في الدورات، نتائج الاختبارات، والإحصائيات التفصيلية لأدائك التعليمي.',
              },
              {
                question: 'هل يمكنني الوصول للمحتوى من الهاتف المحمول؟',
                answer:
                  'بالطبع! منصتنا متوافقة مع جميع الأجهزة ويمكن الوصول إليها من المتصفح على الهواتف الذكية والأجهزة اللوحية.',
              },
              {
                question: 'ما هو الذكاء الاصطناعي المدرس؟',
                answer:
                  'مدرسنا الذكي هو نظام متقدم يستخدم الذكاء الاصطناعي لتقديم المساعدة الفورية، الإجابة على الأسئلة، وتوفير توصيات شخصية للتعلم.',
              },
              {
                question: 'كيف أحصل على شهادة إتمام الدورة؟',
                answer:
                  'بعد إكمال جميع دروس الدورة واجتياز الاختبارات النهائية بنجاح، ستحصل على شهادة رقمية يمكن تحميلها ومشاركتها.',
              },
              {
                question: 'هل يمكنني إلغاء الاشتراك في أي وقت؟',
                answer:
                  'نعم، يمكنك إلغاء اشتراكك في أي وقت دون أي رسوم إضافية. ستستمر في الوصول للمحتوى حتى نهاية فترة الاشتراك المدفوعة.',
              },
            ].map((faq, index) => (
              <Card
                key={index}
                className="border-0 bg-white shadow-md transition-all duration-300 hover:shadow-lg dark:bg-gray-800"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                      <HelpCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-3 text-xl font-bold text-gray-800 dark:text-white">{faq.question}</h3>
                      <p className="leading-relaxed text-gray-600 dark:text-gray-300">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="mb-6 text-gray-600 dark:text-gray-300">لديك سؤال آخر؟ لا تتردد في التواصل معنا</p>
            <Button
              size="lg"
              variant="outline"
              className="transform border-2 border-blue-600 text-blue-600 transition-all duration-300 hover:scale-105 hover:bg-blue-600 hover:text-white"
            >
              <HelpCircle className="mr-2 h-5 w-5" />
              تواصل مع الدعم الفني
            </Button>
          </div>
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
              asChild
              className="transform bg-white text-gray-900 transition-all duration-300 hover:scale-105 hover:bg-gray-100"
            >
              <Link href="/sign-up" className="flex items-center gap-2">
                إنشاء حساب مجاني
                <Sparkles className="h-5 w-5" />
              </Link>
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
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 flex items-center space-x-2 md:mb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">LMS Ali</span>
            </div>
            <div className="text-center text-gray-400 md:text-right">© 2024 LMS Ali. جميع الحقوق محفوظة.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
