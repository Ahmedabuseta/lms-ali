// User-related types for client-side components
// These mirror the Prisma schema but don't import the Prisma client

export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

export enum StudentAccessType {
  NO_ACCESS = 'NO_ACCESS',
  FREE_TRIAL = 'FREE_TRIAL',
  FULL_ACCESS = 'FULL_ACCESS',
  LIMITED_ACCESS = 'LIMITED_ACCESS',
}

export interface User {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  role: UserRole;
  accessType: StudentAccessType;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  isTrialUsed: boolean;
  accessGrantedBy: string | null;
  accessGrantedAt: Date | null;
  paymentReceived: boolean;
  paymentAmount: number | null;
  paymentNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
