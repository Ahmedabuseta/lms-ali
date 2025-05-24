import { NextResponse } from 'next/server';
import { ensureUserExists, getUserPermissions } from '@/lib/user';

export async function GET() {
  try {
    // Ensure user exists in our database
    await ensureUserExists();

    // Get user permissions
    const permissions = await getUserPermissions();

    return NextResponse.json(permissions);
  } catch (error) {
    console.error('[USER_PERMISSIONS]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
