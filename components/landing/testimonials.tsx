import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useRef } from 'react';

const testimonials = [
  { name: "أحمد محمد", role: "طالب تجارة", initial: "أ", review: "والله يا جدعان انتو ساعدتوني كتير في دخول تجارة، المحتوى بتاعكم والشرح الجامد خلاني افهم كل حاجة. ربنا يكرمكم!" },
  { name: "فاطمة أحمد", role: "طالبة تجارة", initial: "ف", review: "بجد مش عارفة اشكركم ازاي، بفضلكم قدرت احقق حلمي وادخل تجارة. الشرح كان واضح جداً والدعم مكنش بيتأخر عليا!" },
  { name: "محمد علي", role: "طالب تجارة", initial: "م", review: "يا جماعة انتو زي العسل، ساعدتوني اوي في التحضير لتجارة. الامتحانات التجريبية دي كانت جامدة جداً!" },
  { name: "نور الهدى", role: "طالبة تجارة", initial: "ن", review: "الله يخليكم ليا يارب، من غيركم مكنتش هعرف ادخل تجارة. المنصة بتاعتكم سهلت عليا المذاكرة اوي!" },
  { name: "عمر حسن", role: "طالب تجارة", initial: "ع", review: "تسلم ايديكم يا احلى ناس، خليتو حلم دخول تجارة سهل. كل حاجة كانت واضحة وبسيطة، ربنا يباركلكم!" },
  { name: "مريم سالم", role: "طالبة تجارة", initial: "م", review: "بجد مفيش اجدع منكم، ساعدتوني اوصل لحلمي في تجارة. المنصة كانت فيها كل اللي محتاجاه، تسلم ايديكم!" }
];

export const Testimonials = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scroll = () => {
      if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth) {
        // Reset scroll position with a smooth transition
        scrollContainer.style.scrollBehavior = 'auto';
        scrollContainer.scrollLeft = 0;
        setTimeout(() => {
          scrollContainer.style.scrollBehavior = 'smooth';
        }, 50);
      } else {
        scrollContainer.scrollLeft += 2; // Increased scroll speed
      }
    };

    const intervalId = setInterval(scroll, 20); // Decreased interval for smoother animation

    const handleMouseEnter = () => clearInterval(intervalId);
    const handleMouseLeave = () => setInterval(scroll, 20);

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearInterval(intervalId);
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl font-arabic">
            آراء طلابنا
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-arabic">اكتشف كيف غيرت منصتنا حياة الآلاف من الطلاب</p>
        </div>

        <div className="relative">
          {/* Auto-scrolling Testimonials Container */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-hidden gap-6 pb-4"
            style={{ scrollBehavior: 'smooth' }}
          >
            {[...testimonials, ...testimonials, ...testimonials].map((testimonial, i) => (
              <Card
                key={i}
                className="flex-shrink-0 w-[300px] md:w-[350px] border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800 rounded-2xl hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-current text-yellow-400" />
                    ))}
                  </div>
                  <p className="mb-6 leading-relaxed text-gray-600 dark:text-gray-300 font-arabic text-sm">
                    "{testimonial.review}"
                  </p>
                  <div className="flex items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 font-bold text-white">
                      {testimonial.initial}
                    </div>
                    <div className="mr-4">
                      <div className="font-semibold text-gray-800 dark:text-white font-arabic">{testimonial.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-arabic">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};