import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Mail } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';

export default async function BannedPage() { const user = await getCurrentUser();

  // If user is not banned or not logged in, redirect
  if (!user || !user.banned) {
    redirect('/dashboard'); }

  const banExpires = user.banExpires ? new Date(user.banExpires) : null;
  const isBanTemporary = banExpires && banExpires > new Date();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950 dark:via-orange-950 dark:to-yellow-950 p-4">
      <Card className="w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-red-200 dark:border-red-800 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
            <Shield className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="font-arabic text-2xl text-red-800 dark:text-red-300">
            تم حظر حسابك
          </CardTitle>
          <CardDescription className="font-arabic text-lg text-red-600 dark:text-red-400">
            { isBanTemporary ? 'حظر مؤقت' : 'حظر دائم' }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Ban reason */}
          { user.banReason && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-300 font-arabic mb-1">
                    سبب الحظر:
                  </h4>
                  <p className="text-red-700 dark:text-red-400 font-arabic">
                    {user.banReason }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ban duration */}
          { isBanTemporary && banExpires && (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="font-medium text-orange-800 dark:text-orange-300 font-arabic mb-2">
                ينتهي الحظر في:
              </h4>
              <p className="text-orange-700 dark:text-orange-400 font-arabic">
                {banExpires.toLocaleDateString('ar-SA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit' })}
              </p>
            </div>
          )}

          {/* Contact support */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-300 font-arabic mb-2">
                  تحتاج مساعدة؟
                </h4>
                <p className="text-blue-700 dark:text-blue-400 font-arabic text-sm mb-3">
                  إذا كنت تعتقد أن هذا الحظر خطأ أو تريد استئناف القرار، يمكنك التواصل مع الدعم الفني.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full font-arabic border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <a href="mailto:support@example.com">
                    <Mail className="mr-2 h-4 w-4" />
                    التواصل مع الدعم
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Logout button */}
          <form action="/api/auth/logout" method="POST" className="w-full">
            <Button
              type="submit"
              variant="ghost"
              className="w-full font-arabic text-gray-600 hover:text-gray-800"
            >
              تسجيل الخروج
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
