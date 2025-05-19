'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface TourState {
  hasCompletedTour: boolean;
  isTourOpen: boolean;
  openTour: () => void;
  closeTour: () => void;
  completeTour: () => void;
  resetTour: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      hasCompletedTour: false,
      isTourOpen: false,
      openTour: () => set({ isTourOpen: true }),
      closeTour: () => set({ isTourOpen: false }),
      completeTour: () => set({ hasCompletedTour: true, isTourOpen: false }),
      resetTour: () => set({ hasCompletedTour: false, isTourOpen: false }),
    }),
    {
      name: 'lms-tour-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);