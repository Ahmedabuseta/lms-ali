import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';
import { PrismaClient } from '@prisma/client';
import { UserRole, StudentAccessType } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to calculate permissions
const calculateUserPermissions = (user: any) => {
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

  const isTeacherRole = user.role === 'TEACHER';

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

  // Calculate trial status
  const isTrialExpired = user.trialEndDate ? new Date() > new Date(user.trialEndDate) : false;
  const trialDaysLeft = user.trialEndDate ?
    Math.max(0, Math.ceil((new Date(user.trialEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

  // Students - check access type
  switch (user.accessType) {
    case 'NO_ACCESS':
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

    case 'FREE_TRIAL':
      const hasAccess = !isTrialExpired;
      return {
        canAccessVideos: false, // No video access during trial
        canAccessCourses: false, // No full course access during trial
        canAccessExams: hasAccess, // Only for free chapters
        canAccessFlashcards: hasAccess, // Only for free chapters
        canAccessPractice: hasAccess, // Only for free chapters
        canAccessAI: false, // No AI access during trial
        isTeacher: false,
        accessType: 'FREE_TRIAL',
        canStartTrial: false,
        trialDaysLeft,
        isTrialExpired: isTrialExpired,
      };

    case 'FULL_ACCESS':
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

    case 'LIMITED_ACCESS':
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

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'STUDENT',
      },
      accessType: {
        type: 'string',
        defaultValue: 'NO_ACCESS',
      },
      trialStartDate: {
        type: 'date',
        required: false,
      },
      trialEndDate: {
        type: 'date',
        required: false,
      },
      isTrialUsed: {
        type: 'boolean',
        defaultValue: false,
      },
      accessGrantedBy: {
        type: 'string',
        required: false,
      },
      accessGrantedAt: {
        type: 'date',
        required: false,
      },
      paymentReceived: {
        type: 'boolean',
        defaultValue: false,
      },
      paymentAmount: {
        type: 'number',
        required: false,
      },
      paymentNotes: {
        type: 'string',
        required: false,
      },
      banned: {
        type: 'boolean',
        required: false,
      },
      banReason: {
        type: 'string',
        required: false,
      },
      banExpires: {
        type: 'date',
        required: false,
      },
    },
  },
  callbacks: {
    session: {
      jwt: async ({ session, token }) => {
        if (session?.user) {
          // Add permissions to session
          const permissions = calculateUserPermissions(session.user);
          session.user.permissions = permissions;

          // Add last permissions update timestamp for cache invalidation
          session.user.permissionsUpdatedAt = new Date().toISOString();
        }
        return session;
      },
    },
  },
  plugins: [
    admin({
      defaultRole: 'STUDENT',
      adminEmails: process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL] : [],
      bannedUserMessage: "Your account has been banned from this learning management system. Please contact support if you believe this is an error.",
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
