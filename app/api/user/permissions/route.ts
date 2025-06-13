import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserWithPermissions } from '@/lib/auth-helpers';
import { getUserPermissions } from '@/lib/user';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) { try {
    // Try to get cached permissions first
    const userWithPermissions = await getCurrentUserWithPermissions();

    if (!userWithPermissions) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('[USER_PERMISSIONS] Getting permissions for user:', userWithPermissions.id);

    // If we have cached permissions, use them
    if ('permissions' in userWithPermissions && userWithPermissions.permissions) {
      console.log('[USER_PERMISSIONS] Using cached permissions');
      return NextResponse.json(userWithPermissions.permissions);
    }

    // Otherwise, calculate fresh permissions
    console.log('[USER_PERMISSIONS] Calculating fresh permissions');
    const permissions = await getUserPermissions();

    return NextResponse.json(permissions);
  } catch (error) { console.log('[USER_PERMISSIONS]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
