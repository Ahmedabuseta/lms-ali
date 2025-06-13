import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireTeacher } from '@/lib/api-auth';
import { UserRole, StudentAccessType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    await requireTeacher();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const role = searchParams.get('role') as UserRole | null;
    const accessType = searchParams.get('accessType') as StudentAccessType | null;
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (accessType) {
      where.accessType = accessType;
    }

    if (search) { where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count and users
    const [totalCount, dbUsers] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({ where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          accessType: true,
          createdAt: true,
          updatedAt: true,
          trialStartDate: true,
          trialEndDate: true,
          isTrialUsed: true,
          paymentReceived: true,
          paymentAmount: true,
          paymentNotes: true,
          accessGrantedAt: true,
          accessGrantedBy: true,
          banned: true,
          banReason: true,
          banExpires: true, },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Transform to match User interface
    const users = dbUsers.map(user => ({ ...user,
      userId: user.id,
      paymentAmount: user.paymentAmount || null, }));

    return NextResponse.json({ users,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPreviousPage: page > 1, });

  } catch (error) { console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) { try {
    await requireTeacher();

    const body = await request.json();
    const { userId, action, data } = body;

    if (!userId || !action) { return NextResponse.json(
        { error: 'Missing userId or action' },
        { status: 400 }
      );
    }

    let result;

    switch (action) { case 'updateRole':
        result = await db.user.update({
          where: { id: userId },
          data: { role: data.role as UserRole },
        });
        break;

      case 'grantAccess':
        result = await db.user.update({ where: { id: userId },
          data: { accessType: data.accessType as StudentAccessType,
            paymentReceived: data.paymentReceived || false,
            paymentAmount: data.paymentAmount || null,
            paymentNotes: data.paymentNotes || null,
            accessGrantedAt: new Date(),
            accessGrantedBy: data.grantedBy || null, },
        });
        break;

      case 'revokeAccess':
        result = await db.user.update({ where: { id: userId },
          data: { accessType: StudentAccessType.NO_ACCESS,
            paymentReceived: false,
            paymentAmount: null,
            paymentNotes: null,
            accessGrantedAt: null,
            accessGrantedBy: null, },
        });
        break;

      case 'grantTrial':
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 3); // 3 days trial

        result = await db.user.update({ where: { id: userId },
          data: { accessType: StudentAccessType.FREE_TRIAL,
            trialStartDate: new Date(),
            trialEndDate: trialEndDate,
            isTrialUsed: true, },
        });
        break;

      case 'banUser':
        const banExpires = data.duration ? new Date(Date.now() + data.duration * 24 * 60 * 60 * 1000) : null;

        result = await db.user.update({ where: { id: userId },
          data: { banned: true,
            banReason: data.reason || 'No reason provided',
            banExpires: banExpires, },
        });
        break;

      case 'unbanUser':
        result = await db.user.update({ where: { id: userId },
          data: { banned: false,
            banReason: null,
            banExpires: null, },
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Transform result to match User interface
    const user = { ...result,
      userId: result.id,
      paymentAmount: result.paymentAmount || null, };

    return NextResponse.json({ user });

  } catch (error) { console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
