import { UserRole, StudentAccessType } from '@prisma/client';
import { db } from './db';
import { getCurrentUser as getAuthUser } from '@/lib/auth-helpers';

export const getCurrentUser = async () => {
  return await getAuthUser();
};

export const ensureUserExists = async () => {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
};

export const isTeacher = async () => {
  const user = await getCurrentUser();
  return user?.role === UserRole.TEACHER;
};

export const startFreeTrial = async () => {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!user) {
    throw new Error('User not found');
  }

  if (user.isTrialUsed) {
    throw new Error('Trial already used');
  }

  if (user.accessType !== StudentAccessType.NO_ACCESS) {
    throw new Error('User already has access');
  }

  const trialStartDate = new Date();
  const trialEndDate = new Date(trialStartDate.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

  return await db.user.update({ where: { id: user.id },
    data: { accessType: StudentAccessType.FREE_TRIAL,
      trialStartDate,
      trialEndDate,
      isTrialUsed: true, },
  });
};

export const isTrialExpired = (user: any) => {
  if (!user || user.accessType !== StudentAccessType.FREE_TRIAL) {
    return false;
  }

  if (!user.trialEndDate) {
    return false;
  }

  return new Date() > user.trialEndDate;
};

export const getTrialDaysLeft = (user: any) => {
  if (!user || user.accessType !== StudentAccessType.FREE_TRIAL || !user.trialEndDate) {
    return 0;
  }

  const now = new Date();
  const endDate = new Date(user.trialEndDate);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
};

export const getUserPermissions = async () => { const user = await getCurrentUser();

  if (!user) {
    return {
      canAccessVideos: false,
      canAccessCourses: false,
      canAccessExams: false,
      canAccessFlashcards: false,
      canAccessPractice: false,
      canAccessAI: false,
      isTeacher: false,
      accessType: 'NO_ACCESS',
      canStartTrial: false,
      trialDaysLeft: 0,
      isTrialExpired: false, };
  }

  const isTeacherRole = user.role === UserRole.TEACHER;

  // Teachers have access to everything
  if (isTeacherRole) { return {
      canAccessVideos: true,
      canAccessCourses: true,
      canAccessExams: true,
      canAccessFlashcards: true,
      canAccessPractice: true,
      canAccessAI: true,
      isTeacher: true,
      accessType: 'TEACHER',
      canStartTrial: false,
      trialDaysLeft: 0,
      isTrialExpired: false, };
  }

  // Students - check access type
  const trialExpired = isTrialExpired(user);
  const trialDaysLeft = getTrialDaysLeft(user);

  switch (user.accessType) { case StudentAccessType.NO_ACCESS:
      return {
        canAccessVideos: false,
        canAccessCourses: false,
        canAccessExams: false,
        canAccessFlashcards: false,
        canAccessPractice: false,
        canAccessAI: false,
        isTeacher: false,
        accessType: 'NO_ACCESS',
        canStartTrial: !user.isTrialUsed,
        trialDaysLeft: 0,
        isTrialExpired: false, };

    case StudentAccessType.FREE_TRIAL:
      const hasAccess = !trialExpired;
      return { canAccessVideos: false, // No video access during trial
        canAccessCourses: false, // No full course access during trial
        canAccessExams: hasAccess, // Only for free chapters
        canAccessFlashcards: hasAccess, // Only for free chapters
        canAccessPractice: hasAccess, // Only for free chapters
        canAccessAI: false, // No AI access during trial
        isTeacher: false,
        accessType: 'FREE_TRIAL',
        canStartTrial: false,
        trialDaysLeft,
        isTrialExpired: trialExpired, };

    case StudentAccessType.FULL_ACCESS:
      return { canAccessVideos: true,
        canAccessCourses: true,
        canAccessExams: true,
        canAccessFlashcards: true,
        canAccessPractice: true,
        canAccessAI: true,
        isTeacher: false,
        accessType: 'FULL_ACCESS',
        canStartTrial: false,
        trialDaysLeft: 0,
        isTrialExpired: false, };

    case StudentAccessType.LIMITED_ACCESS:
      return { canAccessVideos: false, // Limited access excludes videos
        canAccessCourses: true,
        canAccessExams: true,
        canAccessFlashcards: true,
        canAccessPractice: true,
        canAccessAI: true,
        isTeacher: false,
        accessType: 'LIMITED_ACCESS',
        canStartTrial: false,
        trialDaysLeft: 0,
        isTrialExpired: false, };

    default:
      return { canAccessVideos: false,
        canAccessCourses: false,
        canAccessExams: false,
        canAccessFlashcards: false,
        canAccessPractice: false,
        canAccessAI: false,
        isTeacher: false,
        accessType: 'NO_ACCESS',
        canStartTrial: false,
        trialDaysLeft: 0,
        isTrialExpired: false, };
  }
};

// Check if a chapter is free (position 1 or marked as free)
export const isChapterFree = async (chapterId: string) => { const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
    select: { position: true, isFree: true }
  });

  return chapter?.position === 1 || chapter?.isFree || false;
};

// Check if user can access specific chapter content
export const canAccessChapterContent = async (user: any, chapterId: string) => { if (!user) return false;

  // Teachers have access to everything
  if (user.role === UserRole.TEACHER) return true;

  // Check access type
  switch (user.accessType) {
    case StudentAccessType.FULL_ACCESS:
    case StudentAccessType.LIMITED_ACCESS:
      return true; // Paid users can access all chapters

    case StudentAccessType.FREE_TRIAL:
      // Trial users can only access free chapters
      const trialExpired = isTrialExpired(user);
      if (trialExpired) return false;
      return await isChapterFree(chapterId);

    case StudentAccessType.NO_ACCESS:
    default:
      // No access users can only see free chapters
      return await isChapterFree(chapterId); }
};

// Check if user can access chapter services (exams, flashcards, practice)
export const canAccessChapterServices = async (user: any, chapterId: string) => { if (!user) return false;

  // Teachers have access to everything
  if (user.role === UserRole.TEACHER) return true;

  // Check access type
  switch (user.accessType) {
    case StudentAccessType.FULL_ACCESS:
    case StudentAccessType.LIMITED_ACCESS:
      return true; // Paid users can access all services

    case StudentAccessType.FREE_TRIAL:
      // Trial users can access services only for free chapters
      const trialExpired = isTrialExpired(user);
      if (trialExpired) return false;
      return await isChapterFree(chapterId);

    case StudentAccessType.NO_ACCESS:
    default:
      // No access users cannot use services
      return false; }
};
