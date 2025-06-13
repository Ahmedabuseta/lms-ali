import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getCurrentUser } from './auth-helpers';

export async function getAuthenticatedUser() {
  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new NextResponse('Unauthorized', { status: 401 });
  }
  return user;
}

export async function requireTeacher() {
  const user = await requireAuth();
  if (user.role !== 'TEACHER') {
    throw new NextResponse('Forbidden - Teacher access required', { status: 403 });
  }
  return user;
}
