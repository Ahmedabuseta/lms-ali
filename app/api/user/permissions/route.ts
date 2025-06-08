import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { getUserPermissions } from '@/lib/user';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('[USER_PERMISSIONS] Getting permissions for user:', user.id);

    const permissions = await getUserPermissions();

    return NextResponse.json(permissions);
  } catch (error) {
    console.log('[USER_PERMISSIONS]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
