import { NextResponse } from 'next/server';
import { startFreeTrial } from '@/lib/user';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function POST() { 
  try {
    // Check if user is authenticated
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ 
        message: 'يجب تسجيل الدخول أولاً' 
      }, { status: 401 });
    }

    const updatedUser = await startFreeTrial();

    return NextResponse.json({
      message: 'تم تفعيل التجربة المجانية بنجاح',
      trialEndDate: updatedUser.trialEndDate,
      accessType: updatedUser.accessType,
    });
  } catch (error: any) { 
    console.error('[START_TRIAL]', error);

    let message = 'حدث خطأ أثناء تفعيل التجربة المجانية';
    let status = 400;

    if (error.message === 'Trial already used') {
      message = 'لقد استخدمت التجربة المجانية من قبل'; 
    } else if (error.message === 'User already has access') {
      message = 'لديك وصول للمنصة بالفعل';
    } else if (error.message === 'Unauthorized') {
      message = 'غير مصرح لك بالوصول';
      status = 401;
    } else if (error.message === 'User not found') {
      message = 'لم يتم العثور على المستخدم';
      status = 404;
    }

    return NextResponse.json({ message }, { status });
  }
}
