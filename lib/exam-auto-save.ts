'use client';

import axios from 'axios';
import { toast } from 'react-hot-toast';

export interface ExamAnswer { questionId: string;
  optionId: string;
  answeredAt: Date;
  timeSpent?: number; }

export interface ExamAutoSaveState { attemptId: string;
  answers: Record<string, ExamAnswer>;
  lastSaved?: Date;
  hasUnsavedChanges: boolean;
  isOnline: boolean;
  retryQueue: ExamAnswer[]; }

export class ExamAutoSaveService { private static instance: ExamAutoSaveService;
  private state: ExamAutoSaveState;
  private saveTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private maxRetries = 3;
  private debounceMs = 1000;
  private retryDelayMs = 2000;

  private constructor(attemptId: string) {
    this.state = {
      attemptId,
      answers: { },
      hasUnsavedChanges: false,
      isOnline: navigator.onLine,
      retryQueue: []
    };

    this.initializeFromStorage();
    this.setupEventListeners();
  }

  public static getInstance(attemptId: string): ExamAutoSaveService {
    if (!ExamAutoSaveService.instance || ExamAutoSaveService.instance.state.attemptId !== attemptId) {
      ExamAutoSaveService.instance = new ExamAutoSaveService(attemptId);
    }
    return ExamAutoSaveService.instance;
  }

  private initializeFromStorage(): void {
    if (typeof window === 'undefined') return;

    const storageKey = `exam_answers_${this.state.attemptId}`;
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        this.state.answers = parsed.answers || {};
        this.state.lastSaved = parsed.lastSaved ? new Date(parsed.lastSaved) : undefined;
        this.state.hasUnsavedChanges = parsed.hasUnsavedChanges || false;
        this.state.retryQueue = parsed.retryQueue || [];
      } catch (error) { console.error('Error parsing saved exam data:', error);
        localStorage.removeItem(storageKey); }
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    const storageKey = `exam_answers_${this.state.attemptId}`;
    const dataToSave = { answers: this.state.answers,
      lastSaved: this.state.lastSaved,
      hasUnsavedChanges: this.state.hasUnsavedChanges,
      retryQueue: this.state.retryQueue };

    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
  }

  private setupEventListeners(): void { if (typeof window === 'undefined') return;

    // Online/offline detection
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Page unload warning for unsaved changes
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));

    // Periodic sync when online
    setInterval(() => {
      if (this.state.isOnline && this.state.retryQueue.length > 0) {
        this.processRetryQueue(); }
    }, 30000); // Check every 30 seconds
  }

  private handleOnline(): void { this.state.isOnline = true;
    console.log('Connection restored, processing retry queue...');
    this.processRetryQueue(); }

  private handleOffline(): void { this.state.isOnline = false;
    console.log('Connection lost, answers will be saved locally');
    toast.error('فقدان الاتصال - سيتم حفظ الإجابات محلياً'); }

  private handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.state.hasUnsavedChanges) {
      const message = 'لديك تغييرات غير محفوظة. هل أنت متأكد من أنك تريد المغادرة؟';
      event.returnValue = message;
    }
  }

  private async processRetryQueue(): Promise<void> {
    if (!this.state.isOnline || this.state.retryQueue.length === 0) return;

    const answersToRetry = [...this.state.retryQueue];
    this.state.retryQueue = [];

    for (const answer of answersToRetry) {
      try {
        await this.saveAnswerToServer(answer);
        console.log(`Successfully saved queued answer for question ${answer.questionId}`);
      } catch (error) {
        console.error(`Failed to save queued answer for question ${answer.questionId}:`, error);
        this.state.retryQueue.push(answer);
      }
    }

    this.saveToStorage();
  }

  private async saveAnswerToServer(answer: ExamAnswer): Promise<void> { const response = await axios.post('/api/exam/answer', {
      attemptId: this.state.attemptId,
      questionId: answer.questionId,
      optionId: answer.optionId,
      timeSpent: answer.timeSpent });

    if (response.status !== 200) {
      throw new Error(`Server responded with status ${response.status}`);
    }
  }

  public async saveAnswer(
    questionId: string,
    optionId: string,
    timeSpent?: number,
    immediate = false
  ): Promise<void> { const answer: ExamAnswer = {
      questionId,
      optionId,
      answeredAt: new Date(),
      timeSpent };

    // Update local state immediately
    this.state.answers[questionId] = answer;
    this.state.hasUnsavedChanges = true;
    this.saveToStorage();

    // Clear existing timeout for this question
    const existingTimeout = this.saveTimeouts.get(questionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    if (immediate) {
      await this.performSave(answer);
    } else {
      // Debounced save
      const timeout = setTimeout(() => {
        this.performSave(answer);
      }, this.debounceMs);

      this.saveTimeouts.set(questionId, timeout);
    }
  }

  private async performSave(answer: ExamAnswer, retryCount = 0): Promise<void> {
    if (!this.state.isOnline) {
      // Add to retry queue when offline
      const existingIndex = this.state.retryQueue.findIndex(a => a.questionId === answer.questionId);
      if (existingIndex >= 0) {
        this.state.retryQueue[existingIndex] = answer;
      } else {
        this.state.retryQueue.push(answer);
      }
      this.saveToStorage();
      return;
    }

    try {
      await this.saveAnswerToServer(answer);

      // Success - update state
      this.state.lastSaved = new Date();
      this.state.hasUnsavedChanges = this.state.retryQueue.length > 0;
      this.saveToStorage();

      console.log(`Successfully saved answer for question ${answer.questionId}`);

    } catch (error: any) {
      console.error(`Failed to save answer for question ${answer.questionId}:`, error);

      const isNetworkError = !error.response || error.code === 'NETWORK_ERROR';
      const shouldRetry = isNetworkError && retryCount < this.maxRetries;

      if (shouldRetry) { // Exponential backoff retry
        const retryDelay = Math.pow(2, retryCount + 1) * this.retryDelayMs;

        const retryTimeout = setTimeout(() => {
          this.performSave(answer, retryCount + 1); }, retryDelay);

        this.retryTimeouts.set(answer.questionId, retryTimeout);

        toast.error(`فشل في حفظ الإجابة، سيتم المحاولة مرة أخرى خلال ${retryDelay / 1000} ثانية`);
      } else {
        // Max retries reached or non-network error
        this.state.retryQueue.push(answer);
        this.saveToStorage();

        if (error.response?.status === 400) {
          toast.error('خطأ في البيانات المرسلة');
        } else if (error.response?.status === 403) {
          toast.error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
        } else if (error.response?.status === 404) {
          toast.error('الامتحان أو السؤال غير موجود');
        } else {
          toast.error('فشل في حفظ الإجابة، تم حفظها محلياً وسيتم المحاولة لاحقاً');
        }
      }
    }
  }

  public getAnswer(questionId: string): ExamAnswer | undefined {
    return this.state.answers[questionId];
  }

  public getAllAnswers(): Record<string, ExamAnswer> {
    return { ...this.state.answers };
  }

  public getState(): ExamAutoSaveState {
    return { ...this.state };
  }

  public hasUnsavedChanges(): boolean {
    return this.state.hasUnsavedChanges || this.state.retryQueue.length > 0;
  }

  public async saveAllPending(): Promise<void> {
    // Save all pending answers immediately
    const pendingAnswers = Object.values(this.state.answers).filter(answer =>
      this.state.retryQueue.some(retry => retry.questionId === answer.questionId)
    );

    for (const answer of pendingAnswers) {
      await this.performSave(answer);
    }
  }

  public clearSavedData(): void {
    if (typeof window === 'undefined') return;

    const storageKey = `exam_answers_${this.state.attemptId}`;
    localStorage.removeItem(storageKey);

    this.state.answers = {};
    this.state.hasUnsavedChanges = false;
    this.state.retryQueue = [];
    this.state.lastSaved = undefined;
  }

  public cleanup(): void { // Clear all timeouts
    this.saveTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.saveTimeouts.clear();
    this.retryTimeouts.clear();

    // Remove event listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
      window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this)); }
  }

  // Static method to get recovery data for debugging
  public static getRecoveryData(attemptId: string): any {
    if (typeof window === 'undefined') return null;

    const storageKey = `exam_answers_${attemptId}`;
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) { console.error('Error parsing recovery data:', error);
        return null; }
    }

    return null;
  }
}
