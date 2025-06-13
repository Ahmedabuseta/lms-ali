'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserRole, StudentAccessType, Prisma } from '@prisma/client';
import { requireTeacher } from '@/lib/api-auth';

// Types for user management
export interface UserFilters {
  role?: UserRole;
  accessType?: StudentAccessType;
  paymentReceived?: boolean;
  banned?: boolean;
  emailVerified?: boolean;
  isTrialUsed?: boolean;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface UserSortOptions {
  field: 'name' | 'email' | 'createdAt' | 'updatedAt' | 'role' | 'accessType' | 'paymentAmount';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface UserWithRelations {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
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
  emailVerified: boolean;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  _count: {
    sessions: number;
    accounts: number;
  };
}

export interface UsersResponse {
  users: UserWithRelations[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Get all users with advanced filtering, sorting, and pagination
export async function getAllUsers(
  filters: UserFilters = {},
  sort: UserSortOptions = { field: 'createdAt', direction: 'desc' },
  pagination: PaginationOptions = { page: 1, limit: 10 }
): Promise<UsersResponse> {
  await requireTeacher();

  try {
    // Build where clause based on filters
    const where: Prisma.UserWhereInput = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.accessType) {
      where.accessType = filters.accessType;
    }

    if (filters.paymentReceived !== undefined) {
      where.paymentReceived = filters.paymentReceived;
    }

    if (filters.banned !== undefined) {
      where.banned = filters.banned;
    }

    if (filters.emailVerified !== undefined) {
      where.emailVerified = filters.emailVerified;
    }

    if (filters.isTrialUsed !== undefined) {
      where.isTrialUsed = filters.isTrialUsed;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    // Build orderBy clause
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sort.field]: sort.direction,
    };

    // Calculate pagination
    const skip = (pagination.page - 1) * pagination.limit;

    // Get total count and users in parallel
    const [totalCount, users] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        orderBy,
        skip,
        take: pagination.limit,
        include: {
          _count: {
            select: {
              sessions: true,
              accounts: true,
            },
          },
        },
      }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pagination.limit);
    const hasNextPage = pagination.page < totalPages;
    const hasPreviousPage = pagination.page > 1;

    return {
      users: users as UserWithRelations[],
      totalCount,
      totalPages,
      currentPage: pagination.page,
      hasNextPage,
      hasPreviousPage,
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

// Get user by ID with full details
export async function getUserById(userId: string): Promise<UserWithRelations | null> {
  await requireTeacher();

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            sessions: true,
            accounts: true,
          },
        },
      },
    });

    return user as UserWithRelations | null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }
}

// Update user role
export async function updateUserRole(userId: string, role: UserRole) {
  await requireTeacher();

  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { 
        role,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/users');
    revalidatePath('/teacher/users');
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}

// Update user access type
export async function updateUserAccess(
  userId: string, 
  accessType: StudentAccessType,
  paymentAmount?: number,
  paymentNotes?: string
) {
  const admin = await requireTeacher();

  try {
    const updateData: Prisma.UserUpdateInput = {
      accessType,
      accessGrantedBy: admin.id,
      accessGrantedAt: new Date(),
      paymentReceived: accessType !== 'NO_ACCESS',
      updatedAt: new Date(),
    };

    if (paymentAmount !== undefined) {
      updateData.paymentAmount = paymentAmount;
    }

    if (paymentNotes) {
      updateData.paymentNotes = paymentNotes;
    }

    // Handle trial logic
    if (accessType === 'FREE_TRIAL') {
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
      updateData.trialStartDate = now;
      updateData.trialEndDate = trialEnd;
      updateData.isTrialUsed = true;
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    revalidatePath('/admin/users');
    revalidatePath('/teacher/users');
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error updating user access:', error);
    return { success: false, error: 'Failed to update user access' };
  }
}

// Enhanced ban/unban user with comprehensive error handling
export async function banUser(
  userId: string, 
  banReason: string,
  banDuration?: number // hours
) {
  await requireTeacher();

  try {
    // Check if user exists and is not already banned
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, banned: true, role: true, email: true }
    });

    if (!existingUser) {
      return { success: false, error: 'User not found' };
    }

    if (existingUser.banned) {
      return { success: false, error: 'User is already banned' };
    }

    // Prevent banning other teachers
    if (existingUser.role === 'TEACHER') {
      return { success: false, error: 'Cannot ban other teachers' };
    }

    let banExpiresAt: Date | undefined;
    if (banDuration) {
      banExpiresAt = new Date(Date.now() + banDuration * 60 * 60 * 1000);
    }

    // Ban the user using Better Auth admin method
    const result = await auth.api.banUser({
      body: {
        userId,
        banReason: banReason || "No reason provided",
        banExpiresIn: banDuration ? banDuration * 60 * 60 : undefined, // Convert hours to seconds
      },
      headers: headers(),
    });

    // Also revoke all active sessions
    await revokeUserSessions(userId);

    revalidatePath('/admin/users');
    revalidatePath('/teacher/users');
    return { success: true, user: result };
  } catch (error) {
    console.error('Error banning user:', error);
    return { success: false, error: 'Failed to ban user' };
  }
}

// Enhanced unban user
export async function unbanUser(userId: string) {
  await requireTeacher();

  try {
    // Check if user exists and is banned
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, banned: true, email: true }
    });

    if (!existingUser) {
      return { success: false, error: 'User not found' };
    }

    if (!existingUser.banned) {
      return { success: false, error: 'User is not banned' };
    }

    // Unban the user using Better Auth admin method
    const result = await auth.api.unbanUser({
      body: {
        userId,
      },
      headers: headers(),
    });

    revalidatePath('/admin/users');
    revalidatePath('/teacher/users');
    return { success: true, user: result };
  } catch (error) {
    console.error('Error unbanning user:', error);
    return { success: false, error: 'Failed to unban user' };
  }
}

// Grant trial access to user
export async function grantTrialAccess(userId: string) {
  const admin = await requireTeacher();

  try {
    // Check if user already used trial
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, isTrialUsed: true, accessType: true, banned: true }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.banned) {
      return { success: false, error: 'Cannot grant access to banned user' };
    }

    if (user.isTrialUsed) {
      return { success: false, error: 'User has already used their trial' };
    }

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        accessType: 'FREE_TRIAL',
        trialStartDate: now,
        trialEndDate: trialEnd,
        isTrialUsed: true,
        accessGrantedBy: admin.id,
        accessGrantedAt: now,
        updatedAt: now,
      },
    });

    revalidatePath('/admin/users');
    revalidatePath('/teacher/users');
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error granting trial access:', error);
    return { success: false, error: 'Failed to grant trial access' };
  }
}

// List all sessions for a user with enhanced details
export async function listUserSessions(userId: string) {
  await requireTeacher();

  try {
    const sessions = await auth.api.listUserSessions({
      body: {
        userId,
      },
      headers: headers(),
    });

    return { success: true, sessions };
  } catch (error) {
    console.error('Error listing user sessions:', error);
    return { success: false, error: 'Failed to list user sessions' };
  }
}

// Revoke a specific session for a user
export async function revokeUserSession(sessionToken: string) {
  await requireTeacher();

  try {
    const result = await auth.api.revokeUserSession({
      body: {
        sessionToken,
      },
      headers: headers(),
    });

    revalidatePath('/admin/users');
    revalidatePath('/teacher/users');
    return { success: true, session: result };
  } catch (error) {
    console.error('Error revoking user session:', error);
    return { success: false, error: 'Failed to revoke user session' };
  }
}

// Revoke all sessions for a user
export async function revokeUserSessions(userId: string) {
  await requireTeacher();

  try {
    const result = await auth.api.revokeUserSessions({
      body: {
        userId,
      },
      headers: headers(),
    });

    revalidatePath('/admin/users');
    revalidatePath('/teacher/users');
    return { success: true, sessions: result };
  } catch (error) {
    console.error('Error revoking user sessions:', error);
    return { success: false, error: 'Failed to revoke user sessions' };
  }
}

// Create a new user
export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
  data?: Record<string, any>;
}) {
  await requireTeacher();

  try {
    const newUser = await auth.api.createUser({
      body: {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || "user",
        data: userData.data || {},
      },
      headers: headers(),
    });

    revalidatePath('/admin/users');
    revalidatePath('/teacher/users');
    return { success: true, user: newUser };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

// List users using Better Auth admin API
export async function listUsers(options: {
  searchField?: 'email' | 'name';
  searchOperator?: 'contains' | 'starts_with' | 'ends_with';
  searchValue?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filterField?: string;
  filterOperator?: 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte';
  filterValue?: string;
} = {}) {
  await requireTeacher();

  try {
    const users = await auth.api.listUsers({
      query: {
        searchField: options.searchField,
        searchOperator: options.searchOperator,
        searchValue: options.searchValue,
        limit: options.limit || 100,
        offset: options.offset || 0,
        sortBy: options.sortBy || 'createdAt',
        sortDirection: options.sortDirection || 'asc',
        filterField: options.filterField,
        filterOperator: options.filterOperator,
        filterValue: options.filterValue,
      },
      headers: headers(),
    });

    return { success: true, ...users };
  } catch (error) {
    console.error('Error listing users:', error);
    return { success: false, error: 'Failed to list users' };
  }
}

// Set user role
export async function setUserRole(userId: string, role: 'admin' | 'user') {
  await requireTeacher();

  try {
    const updatedUser = await auth.api.setRole({
      body: {
        userId,
        role,
      },
      headers: headers(),
    });

    revalidatePath('/admin/users');
    revalidatePath('/teacher/users');
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error setting user role:', error);
    return { success: false, error: 'Failed to set user role' };
  }
}

// Hard delete user from database
export async function removeUser(userId: string) {
  await requireTeacher();

  try {
    // Check if user exists and is not a teacher
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.role === 'TEACHER') {
      return { success: false, error: 'Cannot delete teacher accounts' };
    }

    const result = await auth.api.removeUser({
      body: {
        userId,
      },
      headers: headers(),
    });

    revalidatePath('/admin/users');
    revalidatePath('/teacher/users');
    return { success: true, user: result };
  } catch (error) {
    console.error('Error removing user:', error);
    return { success: false, error: 'Failed to remove user from database' };
  }
}

// Impersonate a user
export async function impersonateUser(userId: string) {
  await requireTeacher();

  try {
    const session = await auth.api.impersonateUser({
      body: {
        userId,
      },
      headers: headers(),
    });

    return { success: true, session };
  } catch (error) {
    console.error('Error impersonating user:', error);
    return { success: false, error: 'Failed to impersonate user' };
  }
}

// Stop impersonating a user
export async function stopImpersonating() {
  await requireTeacher();

  try {
    await auth.api.stopImpersonating({
      headers: headers(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error stopping impersonation:', error);
    return { success: false, error: 'Failed to stop impersonating' };
  }
}

// Bulk operations
export async function bulkUpdateUsers(
  userIds: string[],
  updates: {
    role?: UserRole;
    accessType?: StudentAccessType;
    banned?: boolean;
    banReason?: string;
  }
) {
  const admin = await requireTeacher();

  try {
    const updateData: Prisma.UserUpdateManyArgs['data'] = {
      updatedAt: new Date(),
    };

    if (updates.role) updateData.role = updates.role;
    if (updates.accessType) {
      updateData.accessType = updates.accessType;
      updateData.accessGrantedBy = admin.id;
      updateData.accessGrantedAt = new Date();
      updateData.paymentReceived = updates.accessType !== 'NO_ACCESS';
    }
    if (updates.banned !== undefined) {
      updateData.banned = updates.banned;
      updateData.banReason = updates.banned ? updates.banReason : null;
    }

    const result = await db.user.updateMany({
      where: { id: { in: userIds } },
      data: updateData,
    });

    revalidatePath('/admin/users');
    revalidatePath('/teacher/users');
    return { success: true, updatedCount: result.count };
  } catch (error) {
    console.error('Error bulk updating users:', error);
    return { success: false, error: 'Failed to bulk update users' };
  }
}

// Get user statistics for dashboard
export async function getUserStatistics() {
  await requireTeacher();

  try {
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      activeTrials,
      paidUsers,
      bannedUsers,
      recentUsers,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: 'STUDENT' } }),
      db.user.count({ where: { role: 'TEACHER' } }),
      db.user.count({ where: { accessType: 'FREE_TRIAL' } }),
      db.user.count({ where: { paymentReceived: true } }),
      db.user.count({ where: { banned: true } }),
      db.user.count({ 
        where: { 
          createdAt: { 
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          } 
        } 
      }),
    ]);

    // Get access type distribution
    const accessTypeStats = await db.user.groupBy({
      by: ['accessType'],
      _count: true,
    });

    return {
      totalUsers,
      totalStudents,
      totalTeachers,
      activeTrials,
      paidUsers,
      bannedUsers,
      recentUsers,
      accessTypeStats: accessTypeStats.reduce((acc, stat) => {
        acc[stat.accessType] = stat._count;
        return acc;
      }, {} as Record<string, number>),
    };
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    throw new Error('Failed to fetch user statistics');
  }
}

// Search users with advanced options
export async function searchUsers(
  query: string,
  filters: {
    role?: UserRole;
    accessType?: StudentAccessType;
    includeDeleted?: boolean;
  } = {}
) {
  await requireTeacher();

  try {
    const where: Prisma.UserWhereInput = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.accessType) {
      where.accessType = filters.accessType;
    }

    if (!filters.includeDeleted) {
      where.banned = { not: true };
    }

    const users = await db.user.findMany({
      where,
      take: 20, // Limit search results
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        accessType: true,
        banned: true,
        createdAt: true,
      },
    });

    return { success: true, users };
  } catch (error) {
    console.error('Error searching users:', error);
    return { success: false, error: 'Failed to search users' };
  }
}

// Export user data (for admin reports)
export async function exportUserData(filters: UserFilters = {}) {
  await requireTeacher();

  try {
    const where: Prisma.UserWhereInput = {};

    // Apply same filters as getAllUsers
    if (filters.role) where.role = filters.role;
    if (filters.accessType) where.accessType = filters.accessType;
    if (filters.paymentReceived !== undefined) where.paymentReceived = filters.paymentReceived;
    if (filters.banned !== undefined) where.banned = filters.banned;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        accessType: true,
        paymentReceived: true,
        paymentAmount: true,
        isTrialUsed: true,
        trialStartDate: true,
        trialEndDate: true,
        banned: true,
        banReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, users };
  } catch (error) {
    console.error('Error exporting user data:', error);
    return { success: false, error: 'Failed to export user data' };
  }
}
