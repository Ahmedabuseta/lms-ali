import { Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  { name: 'أحمد محمد', role: 'طالب تجارة', initial: 'أ', review: 'والله يا جدعان انتو ساعدتوني كتير في دخول تجارة، المحتوى بتاعكم والشرح الجامد خلاني افهم كل حاجة. ربنا يكرمكم!' },
  { name: 'فاطمة أحمد', role: 'طالبة تجارة', initial: 'ف', review: 'بجد مش عارفة اشكركم ازاي، بفضلكم قدرت احقق حلمي وادخل تجارة. الشرح كان واضح جداً والدعم مكنش بيتأخر عليا!' },
  { name: 'محمد علي', role: 'طالب تجارة', initial: 'م', review: 'يا جماعة انتو زي العسل، ساعدتوني اوي في التحضير لتجارة. الامتحانات التجريبية دي كانت جامدة جداً!' },
  { name: 'نور الهدى', role: 'طالبة تجارة', initial: 'ن', review: 'الله يخليكم ليا يارب، من غيركم مكنتش هعرف ادخل تجارة. المنصة بتاعتكم سهلت عليا المذاكرة اوي!' },
  { name: 'عمر حسن', role: 'طالب تجارة', initial: 'ع', review: 'تسلم ايديكم يا احلى ناس، خليتو حلم دخول تجارة سهل. كل حاجة كانت واضحة وبسيطة، ربنا يباركلكم!' },
  { name: 'مريم سالم', role: 'طالبة تجارة', initial: 'م', review: 'بجد مفيش اجدع منكم، ساعدتوني اوصل لحلمي في تجارة. المنصة كانت فيها كل اللي محتاجاه، تسلم ايديكم!' }
];

export const Testimonials = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoScroll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const scrollContainer = scrollRef.current;
      if (!scrollContainer || !isAutoScrolling) return;

      const cardWidth = 320; // Approximate card width including gap
      const currentScroll = scrollContainer.scrollLeft;
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

      if (currentScroll >= maxScroll - 10) {
        // Reset to start for infinite loop
        scrollContainer.style.scrollBehavior = 'auto';
        scrollContainer.scrollLeft = 0;
        setTimeout(() => {
          scrollContainer.style.scrollBehavior = 'smooth';
        }, 50);
      } else {
        scrollContainer.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 3000); // Move every 3 seconds
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Touch and mouse event handlers for swipe functionality
  const handleStart = (clientX: number) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setIsAutoScrolling(false);
    stopAutoScroll();
    setStartX(clientX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !scrollRef.current) return;
    const x = clientX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleEnd = () => {
    setIsDragging(false);
    setTimeout(() => {
      setIsAutoScrolling(true);
      startAutoScroll();
    }, 2000); // Resume auto-scroll after 2 seconds
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.pageX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    handleMove(e.pageX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleEnd();
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [isAutoScrolling]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleEnd();
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.pageX);
      }
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousemove', handleGlobalMouseMove);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging, startX, scrollLeft]);

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
          {/* Swipable Auto-scrolling Testimonials Container */}
          <div
            ref={scrollRef}
            className={`flex overflow-x-hidden gap-6 pb-4 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {[...testimonials, ...testimonials, ...testimonials].map((testimonial, i) => (
              <Card
                key={i}
                className="flex-shrink-0 w-[300px] md:w-[350px] border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800 rounded-2xl     pointer-events-none"
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

          {/* Scroll Indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            <div className="h-2 w-8 bg-blue-200 rounded-full animate-pulse dark:bg-blue-800" />
            <div className="h-2 w-2 bg-gray-300 rounded-full dark:bg-gray-600" />
            <div className="h-2 w-2 bg-gray-300 rounded-full dark:bg-gray-600" />
          </div>

          {/* Instructions */}
          <p className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400 font-arabic">
            اسحب للتنقل أو انتظر للتمرير التلقائي
          </p>
        </div>
      </div>
    </section>
  );
};
