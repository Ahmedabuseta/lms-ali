import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from './auth';
import { db } from './db';

// Enhanced user type with permissions
interface UserWithPermissions {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  accessType: string;
  banned?: boolean;
  trialEndDate?: Date | null;
  trialStartDate?: Date | null;
  isTrialUsed?: boolean;
  paymentReceived?: boolean;
  permissions: {
    canAccessVideos: boolean;
    canAccessCourses: boolean;
    canAccessExams: boolean;
    canAccessFlashcards: boolean;
    canAccessPractice: boolean;
    canAccessAI: boolean;
    isTeacher: boolean;
    accessType: string;
    canStartTrial: boolean;
    trialDaysLeft: number;
    isTrialExpired: boolean;
  };
  permissionsCalculatedAt: Date;
}

// Calculate permissions based on user data
function calculatePermissions(user: any): UserWithPermissions['permissions'] {
  const now = new Date();
  const isTeacher = user.role === 'TEACHER';
  
  // Calculate trial status
  const trialExpired = user.trialEndDate ? now > new Date(user.trialEndDate) : true;
  const trialDaysLeft = user.trialEndDate ? 
    Math.max(0, Math.ceil((new Date(user.trialEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  
  // Teachers have full access
  if (isTeacher) {
    return {
      canAccessVideos: true,
      canAccessCourses: true,
      canAccessExams: true,
      canAccessFlashcards: true,
      canAccessPractice: true,
      canAccessAI: true,
      isTeacher: true,
      accessType: user.accessType,
      canStartTrial: false,
      trialDaysLeft: 0,
      isTrialExpired: false,
    };
  }

  // Students access based on accessType
  switch (user.accessType) {
    case 'FULL_ACCESS':
      return {
        canAccessVideos: true,
        canAccessCourses: true,
        canAccessExams: true,
        canAccessFlashcards: true,
        canAccessPractice: true,
        canAccessAI: true,
        isTeacher: false,
        accessType: user.accessType,
        canStartTrial: false,
        trialDaysLeft: 0,
        isTrialExpired: false,
      };

    case 'LIMITED_ACCESS':
      return {
        canAccessVideos: true,
        canAccessCourses: true,
        canAccessExams: false,
        canAccessFlashcards: true,
        canAccessPractice: false,
        canAccessAI: false,
        isTeacher: false,
        accessType: user.accessType,
        canStartTrial: false,
        trialDaysLeft: 0,
        isTrialExpired: false,
      };

    case 'FREE_TRIAL':
      return {
        canAccessVideos: !trialExpired,
        canAccessCourses: !trialExpired,
        canAccessExams: !trialExpired,
        canAccessFlashcards: !trialExpired,
        canAccessPractice: !trialExpired,
        canAccessAI: false,
        isTeacher: false,
        accessType: user.accessType,
        canStartTrial: false,
        trialDaysLeft,
        isTrialExpired: trialExpired,
      };

    case 'NO_ACCESS':
    default:
      return {
        canAccessVideos: false,
        canAccessCourses: false,
        canAccessExams: false,
        canAccessFlashcards: false,
        canAccessPractice: false,
        canAccessAI: false,
        isTeacher: false,
        accessType: user.accessType || 'NO_ACCESS',
        canStartTrial: !user.isTrialUsed,
        trialDaysLeft: 0,
        isTrialExpired: false,
      };
  }
}

export async function getSession() {
  return auth.api.getSession({
    headers: headers(),
  });
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  let user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  // Auto-promote admin to teacher if needed
  if (user && process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL && user.role !== 'TEACHER') {
    try {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          role: 'TEACHER',
          accessType: 'FULL_ACCESS',
          paymentReceived: true,
          accessGrantedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error promoting admin user:', error);
    }
  }

  return user;
}

export async function getCurrentUserWithPermissions(): Promise<UserWithPermissions | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  // Calculate fresh permissions
  const permissions = calculatePermissions(user);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    accessType: user.accessType,
    banned: user.banned ?? undefined,
    trialEndDate: user.trialEndDate,
    trialStartDate: user.trialStartDate,
    isTrialUsed: user.isTrialUsed,
    paymentReceived: user.paymentReceived,
    permissions,
    permissionsCalculatedAt: new Date(),
  };
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect('/sign-in');
  }
  return session;
}

export async function requireTeacher() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'TEACHER') {
    redirect('/dashboard');
  }
  return user;
}

// Enhanced protection functions
export async function requirePermission(permission: keyof UserWithPermissions['permissions']) {
  const user = await getCurrentUserWithPermissions();
  if (!user) {
    redirect('/sign-in');
  }

  // Check if user is banned
  if (user.banned) {
    redirect('/banned');
  }

  // Check permission
  if (!user.permissions[permission]) {
    redirect('/dashboard?error=access-denied');
  }

  return user;
}

export async function requireCourseAccess() {
  return requirePermission('canAccessCourses');
}

export async function requireExamAccess() {
  return requirePermission('canAccessExams');
}

export async function requireFlashcardAccess() {
  return requirePermission('canAccessFlashcards');
}

export async function requirePracticeAccess() {
  return requirePermission('canAccessPractice');
}

export async function requireAIAccess() {
  return requirePermission('canAccessAI');
}

export async function requireVideoAccess() {
  return requirePermission('canAccessVideos');
}

// Check specific chapter access
export async function requireChapterAccess(chapterId: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Check if user is banned
  if (user.banned) {
    redirect('/banned');
  }

  // Teachers have access to everything
  if (user.role === 'TEACHER') return user;

  // Check if chapter is free
  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
    select: { position: true, isFree: true }
  });

  const isChapterFree = chapter?.position === 1 || chapter?.isFree || false;

  // Check access based on user type
  switch (user.accessType) {
    case 'FULL_ACCESS':
    case 'LIMITED_ACCESS':
      return user; // Paid users can access all chapters

    case 'FREE_TRIAL':
      // Trial users can only access free chapters if trial is not expired
      const trialExpired = user.trialEndDate ? new Date() > new Date(user.trialEndDate) : false;
      if (trialExpired || !isChapterFree) {
        redirect('/dashboard?error=trial-expired-or-premium-content');
      }
      return user;

    case 'NO_ACCESS':
    default:
      // No access users can only see free chapters for preview
      if (!isChapterFree) {
        redirect('/dashboard?error=premium-content');
      }
      return user;
  }
}

// Middleware helper for API routes
export async function getAuthenticatedUser() {
  try {
    const session = await auth.api.getSession({
      headers: headers(),
    });

    return session?.user ?? null;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

export async function requireAuthAPI() {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireTeacherAPI() {
  const user = await requireAuthAPI();
  if (user.role !== 'TEACHER') {
    throw new Error('Forbidden - Teacher access required');
  }
  return user;
}
