import { UserRole } from '@prisma/client';

export function isTeacher(userRole?: UserRole | string | null, userEmail?: string | null) {
  // Check if user has teacher role OR is the admin email
  const isTeacherRole = userRole === 'TEACHER' || userRole === UserRole.TEACHER;
  const isAdminEmail = userEmail === process.env.ADMIN_EMAIL;

  return isTeacherRole || isAdminEmail;
}

// For checking against specific teacher ID (if still needed)
export function isSpecificTeacher(userId?: string | null) {
  return userId === process.env.NEXT_PUBLIC_TEACHER_ID;
}

// Check if user is admin
export function isAdmin(userEmail?: string | null) {
  return userEmail === process.env.ADMIN_EMAIL;
}
