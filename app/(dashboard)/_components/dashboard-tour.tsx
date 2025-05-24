'use client';

import { useEffect } from 'react';
import { GuidedTour, TourButton } from '@/components/ui/guided-tour';
import { useTourStore } from '@/hooks/use-tour';

export const DashboardTour = () => {
  const { isTourOpen, hasCompletedTour, openTour, closeTour, completeTour } = useTourStore();

  // Auto-show tour for first-time users
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasCompletedTour) {
        openTour();
      }
    }, 1500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tourSteps = [
    {
      target: '[data-tour="sidebar"]',
      title: 'Main Navigation',
      content: 'Use this sidebar to navigate between different sections of the learning platform.',
      placement: 'right' as const,
    },
    {
      target: '[data-tour="theme-toggle"]',
      title: 'Customize Your Experience',
      content: 'Switch between light and dark mode for comfortable learning at any time of day.',
      placement: 'bottom' as const,
    },
    {
      target: '[data-tour="course-cards"]',
      title: 'Your Courses',
      content: 'Find all your enrolled courses here. Click on any course to continue your learning journey.',
      placement: 'top' as const,
    },
    {
      target: '[data-tour="ai-tutor"]',
      title: 'AI Tutor',
      content: 'Get instant help with your studies using our AI tutor that can answer questions about your courses.',
      placement: 'bottom' as const,
    },
    {
      target: '[data-tour="practice"]',
      title: 'Practice Questions',
      content: 'Test your knowledge with practice questions related to your course material.',
      placement: 'bottom' as const,
    },
    {
      target: '[data-tour="exams"]',
      title: 'Exams',
      content: 'Access course exams and assessments to evaluate your progress.',
      placement: 'left' as const,
    },
  ];

  return (
    <>
      <TourButton onClick={openTour} />
      <GuidedTour steps={tourSteps} isOpen={isTourOpen} onClose={closeTour} onComplete={completeTour} />
    </>
  );
};
