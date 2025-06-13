'use client';

import { useState, useEffect, useRef } from 'react';
import { Rotate3D, ChevronUp, ChevronDown, Plus, Shuffle, RefreshCw } from 'lucide-react';
import { useSpring, animated, to } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Button } from '@/components/ui/button';
import { MathRenderer } from '@/components/math-renderer';
import toast from 'react-hot-toast';

interface FlashcardProps {
  id: string;
  question: string;
  answer: string;
}

interface FlashcardClientProps {
  initialCards: FlashcardProps[];
  courseId?: string;
  chapterId?: string;
}

export default function FlashcardClient({ initialCards, courseId, chapterId }: FlashcardClientProps) {
  // Using state initialized from props to avoid hydration mismatches
  const [cards, setCards] = useState<FlashcardProps[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [noMoreCards, setNoMoreCards] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [totalLoaded, setTotalLoaded] = useState(0);
  const [randomize, setRandomize] = useState(true);

  const loadingRef = useRef(false);
  const currentBatchOffset = useRef(25);
  const initialized = useRef(false);

  // Initialize cards from props after component mounts to avoid hydration issues
  useEffect(() => {
    if (!initialized.current && initialCards.length > 0) {
      setCards(initialCards);
      setTotalLoaded(initialCards.length);
      // Show Load More button if we have exactly 25 cards (full batch)
      setShowLoadMore(initialCards.length >= 25);
      initialized.current = true;
    }
  }, [initialCards]);

  // Check if we should show Load More button based on current progress
  useEffect(() => {
    if (cards.length > 0) {
      // Show Load More when user has seen most of current batch (after 20 out of 25 cards)
      const shouldShow = currentIndex >= Math.min(cards.length - 5, 20) && !noMoreCards;
      setShowLoadMore(shouldShow);
    }
  }, [currentIndex, cards.length, noMoreCards]);

  // Load more cards with enhanced pagination and randomization
  const loadMoreCards = async (page: number = 1): Promise<{ flashcards: FlashcardProps[], hasNextPage: boolean, totalCount: number }> => {
    try {
      // Build the URL with proper query parameters
      let url = '/api/flashcards?';
      const params = new URLSearchParams();

      if (courseId) params.append('courseId', courseId);
      if (chapterId) params.append('chapterId', chapterId);
      params.append('page', page.toString());
      params.append('limit', '25'); // Always load 25 cards per batch

      url += params.toString();

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Failed to load more cards: ${res.status}`);
      }

      const data = await res.json();
      return {
        flashcards: data.flashcards || [],
        hasNextPage: data.pagination?.hasNextPage || false,
        totalCount: data.pagination?.totalCount || 0
      };
    } catch (error) {
      console.error('Error loading more cards:', error);
      toast.error('فشل في تحميل المزيد من البطاقات');
      return { flashcards: [], hasNextPage: false, totalCount: 0 };
    }
  };

  // Manual Load More function triggered by button
  const handleLoadMore = async () => {
    if (loadingRef.current || noMoreCards) return;

    try {
      loadingRef.current = true;
      setLoading(true);

      const currentPage = Math.ceil(totalLoaded / 25) + 1;
      const result = await loadMoreCards(currentPage);

      if (result.flashcards.length === 0 || !result.hasNextPage) {
        setNoMoreCards(true);
        toast.success('تم تحميل جميع البطاقات المتاحة!');
      } else {
        setCards((prevCards) => [...prevCards, ...result.flashcards]);
        setTotalLoaded(prev => prev + result.flashcards.length);
        toast.success(`تم تحميل ${result.flashcards.length} بطاقة جديدة!`);
      }
      
      setShowLoadMore(false); // Hide button temporarily
    } catch (error) {
      console.error('Failed to load more cards:', error);
      toast.error('حدث خطأ أثناء تحميل البطاقات');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  // Randomize current cards
  const handleRandomize = () => {
    if (cards.length <= 1) return;
    
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    toast.success('تم خلط البطاقات عشوائياً!');
  };

  // Reset to first card
  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    toast.success('تم العودة للبطاقة الأولى!');
  };

  // Spring animation configuration
  const [props, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    config: { tension: 300, friction: 20 },
  }));

  const bind = useDrag(({ down, movement: [_mx, my], direction: [_dx, dy], velocity, cancel }) => {
    // Reset isFlipped when starting a new drag
    if (down && my !== 0) {
      setIsFlipped(false);
    }

    // Card swipe logic
    if (down) {
      api.start({
        y: my,
        rotation: my / 20,
        scale: 1.02,
        immediate: true,
      });
    } else {
      // Swipe threshold - if velocity is high enough or movement is great enough
      const swipeThreshold = velocity[1] > 0.3 || Math.abs(my) > 100;

      if (swipeThreshold) {
        const isSwipeUp = dy < 0;

        api.start({
          y: isSwipeUp ? -800 : 800,
          rotation: isSwipeUp ? -20 : 20,
          immediate: false,
          onRest: () => {
            // Go to next card or previous card based on swipe direction with cycling
            setCurrentIndex((current) => {
              if (isSwipeUp) {
                // When swiping up (next card)
                return current === cards.length - 1 ? 0 : current + 1;
              } else {
                // When swiping down (previous card)
                return current === 0 ? cards.length - 1 : current - 1;
              }
            });

            // Note: Load More is now manual via button, not automatic

            // Reset card position
            api.start({
              x: 0,
              y: 0,
              rotation: 0,
              scale: 1,
              immediate: true,
            });
          },
        });
      } else {
        // Return card to original position if not swiped enough
        api.start({
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          immediate: false,
        });
      }
    }
  });

  // Check if we have a card to display
  const hasCard = cards.length > 0 && currentIndex < cards.length;
  const currentCard = hasCard ? cards[currentIndex] : null;

  // If we're still waiting for the initial cards to be set after hydration
  if (cards.length === 0 && initialCards.length > 0) {
    return (
      <div className="flex h-80 flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-slate-500 dark:text-slate-400">جاري تحميل البطاقات التعليمية...</p>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="flex h-80 flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-slate-500 dark:text-slate-400">لا توجد بطاقات تعليمية متاحة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-white/80 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
            البطاقة {currentIndex + 1} من {cards.length}
            {!noMoreCards && totalLoaded > cards.length && <span className="text-blue-600"> ({totalLoaded} محمّلة)</span>}
          </div>
          {!noMoreCards && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {showLoadMore ? '⭐ جاهز لتحميل المزيد' : '📚 استمر في المراجعة'}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={currentIndex === 0}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 ml-1" />
            البداية
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRandomize}
            disabled={cards.length <= 1}
            className="text-xs"
          >
            <Shuffle className="h-3 w-3 ml-1" />
            خلط
          </Button>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="relative mx-auto h-96 w-full max-w-lg">

      {/* Swipe indicators */}
      <div className="absolute left-1/2 top-2 z-10 -translate-x-1/2 transform animate-bounce text-slate-400 dark:text-slate-600">
        <ChevronUp className="h-6 w-6" />
      </div>
      <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 transform animate-bounce text-slate-400 dark:text-slate-600">
        <ChevronDown className="h-6 w-6" />
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2 transform text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 shadow-lg dark:bg-slate-800/90">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            جاري تحميل المزيد من البطاقات...
          </div>
        </div>
      )}

      {/* Card */}
      <animated.div
        {...bind()}
        style={{
          transform: to(
            [props.x, props.y, props.rotation, props.scale],
            (x, y, rot, s) => `translate3d(${x}px,${y}px,0) rotate(${rot}deg) scale(${s})`,
          ),
          touchAction: 'none',
        }}
        className="flex h-80 w-full cursor-grab flex-col justify-between rounded-xl border border-slate-200 bg-white p-8 shadow-lg active:cursor-grabbing dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-900/50"
        onClick={(e) => {
          // Don't flip when dragging, only on direct click
          if (Math.abs(props.y.get()) < 5) {
            setIsFlipped(!isFlipped);
          }
        }}
      >
        <div className="flex flex-1 flex-col">
          <h3 className="mb-3 text-lg font-semibold text-slate-700 dark:text-slate-300">
            {isFlipped ? 'الإجابة:' : 'السؤال:'}
          </h3>
          <div className="flex-1 text-lg text-slate-900 dark:text-slate-100">
            <MathRenderer content={isFlipped ? currentCard.answer : currentCard.question} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            اسحب للأعلى للبطاقة التالية، وللأسفل للبطاقة السابقة
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(!isFlipped);
            }}
            className="text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Rotate3D className="h-4 w-4" />
            <span className="mr-1">قلب البطاقة</span>
          </Button>
        </div>
      </animated.div>

      {/* Background stack effect */}
      {hasCard && currentIndex + 1 < cards.length && (
        <div className="absolute left-0 right-0 top-2 -z-10">
          <div className="h-80 w-full translate-y-2 scale-[0.98] transform rounded-xl border border-slate-200 bg-white opacity-70 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-900/30" />
          {currentIndex + 2 < cards.length && (
            <div className="absolute left-0 right-0 top-0 h-80 w-full translate-y-4 scale-[0.96] transform rounded-xl border border-slate-200 bg-white opacity-40 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-900/20" />
          )}
        </div>
      )}
      </div>

      {/* Load More Section */}
      {showLoadMore && !loading && !noMoreCards && (
        <div className="text-center">
          <div className="mb-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 p-4 dark:from-orange-950/20 dark:to-red-950/20">
            <h3 className="mb-2 text-lg font-bold text-orange-800 dark:text-orange-200">
              🎉 أحسنت! لقد راجعت {Math.min(currentIndex + 1, 20)} بطاقة
            </h3>
            <p className="text-sm text-orange-600 dark:text-orange-300">
              هل تريد تحميل 25 بطاقة إضافية لمواصلة المراجعة؟
            </p>
          </div>
          
          <Button
            onClick={handleLoadMore}
            disabled={loading}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-white hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-5 w-5 ml-2" />
            تحميل 25 بطاقة إضافية
          </Button>
          
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            💡 سيتم خلط البطاقات الجديدة عشوائياً لتجربة تعلم أفضل
          </p>
        </div>
      )}

      {/* No More Cards Message */}
      {noMoreCards && (
        <div className="text-center">
          <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-6 dark:from-green-950/20 dark:to-emerald-950/20">
            <div className="mb-4 text-4xl">🎊</div>
            <h3 className="mb-2 text-xl font-bold text-green-800 dark:text-green-200">
              تهانينا! أكملت جميع البطاقات
            </h3>
            <p className="text-sm text-green-600 dark:text-green-300">
              لقد راجعت جميع البطاقات المتاحة في هذا {chapterId ? 'الفصل' : 'الدورة'}
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <RefreshCw className="h-4 w-4 ml-1" />
                إعادة المراجعة
              </Button>
              <Button
                onClick={handleRandomize}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <Shuffle className="h-4 w-4 ml-1" />
                خلط وإعادة البدء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
