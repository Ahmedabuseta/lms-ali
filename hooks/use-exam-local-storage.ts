import { useState, useEffect } from 'react';

interface ExamAnswer {
  questionId: string;
  optionId: string;
  answeredAt: number; // timestamp
}

interface ExamProgress {
  attemptId: string;
  examId: string;
  answers: ExamAnswer[];
  lastVisitedQuestion: number;
  lastSyncedTime?: number; // timestamp of last server sync
}

export const useExamLocalStorage = (attemptId: string, examId: string) => {
  const storageKey = `exam_progress_${attemptId}`;
  
  const [examProgress, setExamProgress] = useState<ExamProgress>(() => {
    // Initialize with data from localStorage if available
    if (typeof window !== 'undefined') {
      const savedProgress = localStorage.getItem(storageKey);
      if (savedProgress) {
        try {
          return JSON.parse(savedProgress);
        } catch (e) {
          console.error('Failed to parse saved exam progress', e);
        }
      }
    }
    
    // Default initial state
    return {
      attemptId,
      examId,
      answers: [],
      lastVisitedQuestion: 0
    };
  });
  
  // Update local storage whenever the state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(examProgress));
    }
  }, [examProgress, storageKey]);
  
  // Save an answer to local storage
  const saveAnswer = (questionId: string, optionId: string) => {
    setExamProgress(prev => {
      // Remove any existing answer for this question
      const filteredAnswers = prev.answers.filter(a => a.questionId !== questionId);
      
      // Add the new answer
      return {
        ...prev,
        answers: [
          ...filteredAnswers,
          {
            questionId,
            optionId,
            answeredAt: Date.now()
          }
        ]
      };
    });
  };
  
  // Update the last visited question
  const updateLastVisitedQuestion = (index: number) => {
    setExamProgress(prev => ({
      ...prev,
      lastVisitedQuestion: index
    }));
  };
  
  // Mark data as synced with server
  const markSynced = () => {
    setExamProgress(prev => ({
      ...prev,
      lastSyncedTime: Date.now()
    }));
  };
  
  // Get an answer by question ID
  const getAnswer = (questionId: string) => {
    return examProgress.answers.find(a => a.questionId === questionId);
  };
  
  // Check if there are unsynced answers
  const hasUnsyncedAnswers = () => {
    if (!examProgress.lastSyncedTime) return examProgress.answers.length > 0;
    
    // Check if there are answers saved after the last sync
    return examProgress.answers.some(answer => 
      answer.answeredAt > (examProgress.lastSyncedTime || 0)
    );
  };
  
  // Get all answers
  const getAllAnswers = () => examProgress.answers;
  
  // Get total answered questions count
  const getAnsweredCount = () => examProgress.answers.length;
  
  // Clear the exam progress from local storage
  const clearExamProgress = () => {
    localStorage.removeItem(storageKey);
    setExamProgress({
      attemptId,
      examId,
      answers: [],
      lastVisitedQuestion: 0
    });
  };
  
  return {
    saveAnswer,
    getAnswer,
    updateLastVisitedQuestion,
    markSynced,
    hasUnsyncedAnswers,
    getAllAnswers,
    getAnsweredCount,
    clearExamProgress,
    lastVisitedQuestion: examProgress.lastVisitedQuestion
  };
};