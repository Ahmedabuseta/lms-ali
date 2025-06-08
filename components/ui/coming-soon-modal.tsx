'use client';

import { useState } from 'react';
import { X, Calendar, Sparkles, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComingSoonModal = ({ isOpen, onClose }: ComingSoonModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-2xl transition-all dark:bg-gray-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
            <Calendar className="h-8 w-8 text-white" />
          </div>

          {/* Title */}
          <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white font-arabic">
            قريباً جداً! 🚀
          </h3>

          {/* Message */}
          <div className="mb-6 space-y-3">
            <p className="text-gray-600 dark:text-gray-300 font-arabic leading-relaxed">
              منصة التعلم ستكون متاحة قريباً بإذن الله
            </p>
            
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-600 dark:text-blue-400 font-arabic">
                  تاريخ الإطلاق
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-200 font-arabic mb-2">
                20/6/2025
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-arabic leading-relaxed">
                ستكون المنصة جاهزة بكامل مميزاتها لمساعدتكم في الوصول لكلية التجارة
              </p>
            </div>

            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3].map((star) => (
                <Star key={star} className="h-4 w-4 fill-current text-yellow-400" />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-arabic"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              فهمت، في انتظار الإطلاق
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 