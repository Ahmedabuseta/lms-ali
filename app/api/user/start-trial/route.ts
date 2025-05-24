import { NextResponse } from 'next/server';
import { startFreeTrial } from '@/lib/user';

export async function POST() {
  try {
    const user = await startFreeTrial();

    return NextResponse.json({
      message: 'تم تفعيل التجربة المجانية بنجاح',
      trialEndDate: user.trialEndDate,
    });
  } catch (error: any) {
    console.error('[START_TRIAL]', error);

    let message = 'حدث خطأ أثناء تفعيل التجربة المجانية';

    if (error.message === 'Trial already used') {
      message = 'لقد استخدمت التجربة المجانية من قبل';
    } else if (error.message === 'User already has access') {
      message = 'لديك وصول للمنصة بالفعل';
    } else if (error.message === 'Unauthorized') {
      message = 'غير مصرح لك بالوصول';
    }

    return NextResponse.json({ message }, { status: 400 });
  }
}
