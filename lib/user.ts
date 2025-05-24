import { auth } from '@clerk/nextjs';
import { db } from './db';
import { UserRole, StudentAccessType } from '@prisma/client';

export const getCurrentUser = async () => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: {
      userId: userId,
    },
  });

  return user;
};

export const ensureUserExists = async () => {
  const { userId } = auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Check if user exists in our database
  let user = await db.user.findUnique({
    where: {
      userId: userId,
    },
  });

  // If user doesn't exist, create them with NO_ACCESS by default
  if (!user) {
    const clerkUser = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    }).then((res) => res.json());

    user = await db.user.create({
      data: {
        userId: userId,
        email: clerkUser.email_addresses[0]?.email_address || '',
        name: `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() || null,
        role: UserRole.STUDENT,
        accessType: StudentAccessType.NO_ACCESS,
      },
    });
  }

  return user;
};

export const isTeacher = async () => {
  const user = await getCurrentUser();
  return user?.role === UserRole.TEACHER;
};

export const startFreeTrial = async () => {
  const { userId } = auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const user = await db.user.findUnique({
    where: { userId },
  });

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

  return await db.user.update({
    where: { userId },
    data: {
      accessType: StudentAccessType.FREE_TRIAL,
      trialStartDate,
      trialEndDate,
      isTrialUsed: true,
    },
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

export const getUserPermissions = async () => {
  const user = await getCurrentUser();

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
      isTrialExpired: false,
    };
  }

  const isTeacherRole = user.role === UserRole.TEACHER;

  // Teachers have access to everything
  if (isTeacherRole) {
    return {
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
      isTrialExpired: false,
    };
  }

  // Students - check access type
  const trialExpired = isTrialExpired(user);
  const trialDaysLeft = getTrialDaysLeft(user);

  switch (user.accessType) {
    case StudentAccessType.NO_ACCESS:
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
        isTrialExpired: false,
      };

    case StudentAccessType.FREE_TRIAL:
      const hasAccess = !trialExpired;
      return {
        canAccessVideos: hasAccess,
        canAccessCourses: hasAccess,
        canAccessExams: hasAccess,
        canAccessFlashcards: hasAccess,
        canAccessPractice: hasAccess,
        canAccessAI: hasAccess,
        isTeacher: false,
        accessType: 'FREE_TRIAL',
        canStartTrial: false,
        trialDaysLeft,
        isTrialExpired: trialExpired,
      };

    case StudentAccessType.FULL_ACCESS:
      return {
        canAccessVideos: true,
        canAccessCourses: true,
        canAccessExams: true,
        canAccessFlashcards: true,
        canAccessPractice: true,
        canAccessAI: true,
        isTeacher: false,
        accessType: 'FULL_ACCESS',
        canStartTrial: false,
        trialDaysLeft: 0,
        isTrialExpired: false,
      };

    case StudentAccessType.LIMITED_ACCESS:
      return {
        canAccessVideos: false, // Limited access excludes videos
        canAccessCourses: true,
        canAccessExams: true,
        canAccessFlashcards: true,
        canAccessPractice: true,
        canAccessAI: true,
        isTeacher: false,
        accessType: 'LIMITED_ACCESS',
        canStartTrial: false,
        trialDaysLeft: 0,
        isTrialExpired: false,
      };

    default:
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
        isTrialExpired: false,
      };
  }
};
