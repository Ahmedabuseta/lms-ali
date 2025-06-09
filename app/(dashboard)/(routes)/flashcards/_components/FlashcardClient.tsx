'use client';

import { useState, useEffect, useRef } from 'react';
import { Rotate3D, ChevronUp, ChevronDown } from 'lucide-react';
import { useSpring, animated, to } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Button } from '@/components/ui/button';
import { MathRenderer } from '@/components/math-renderer';

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

  const loadingRef = useRef(false);
  const currentBatchOffset = useRef(20);
  const initialized = useRef(false);

  // Initialize cards from props after component mounts to avoid hydration issues
  useEffect(() => {
    if (!initialized.current && initialCards.length > 0) {
      setCards(initialCards);
      initialized.current = true;
    }
  }, [initialCards]);

  // Load more cards when reaching near the end of current batch
  const loadMoreCards = async (offset: number): Promise<FlashcardProps[]> => {
    try {
      // Build the URL with proper query parameters
      let url = '/api/flashcards?';
      const params = new URLSearchParams();

      if (courseId) params.append('courseId', courseId);
      if (chapterId) params.append('chapterId', chapterId);
      params.append('offset', offset.toString());

      url += params.toString();

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Failed to load more cards: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error loading more cards:', error);
      return [];
    }
  };

  // Load more cards when reaching near the end of current batch
  const loadNextBatch = async () => {
    if (loadingRef.current || noMoreCards) return;

    if (currentIndex >= cards.length - 5) {
      try {
        loadingRef.current = true;
        setLoading(true);

        const newCards = await loadMoreCards(currentBatchOffset.current);

        if (newCards.length === 0) {
          setNoMoreCards(true);
        } else {
          setCards((prevCards) => [...prevCards, ...newCards]);
          currentBatchOffset.current += newCards.length;
        }
      } catch (error) {
        console.error('Failed to load more cards:', error);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    }
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

            // Load more cards if needed and approaching the end
            if (isSwipeUp && currentIndex >= cards.length - 5) {
              loadNextBatch();
            }

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
    <div className="relative mx-auto h-96 w-full max-w-lg" dir="rtl">
      {/* Card counter */}
      <div className="absolute right-0 top-0 z-10 rounded-bl-md rounded-tr-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        {currentIndex + 1} / {cards.length}
        {noMoreCards ? '' : '+'}
      </div>

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
          جاري تحميل المزيد من البطاقات...
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
  );
}
