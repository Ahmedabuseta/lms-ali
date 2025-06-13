'use client';

import { useState, useEffect } from 'react';
import { Monitor, LogOut } from 'lucide-react';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SessionsManagerProps {
  user: User;
  userSessions: any[];
  onLoadSessions: (userId: string) => void;
  onRevokeSession: (sessionToken: string) => void;
  onRevokeAllSessions: (userId: string) => void;
  isPending: boolean;
}

export const SessionsManager = ({
  user,
  userSessions,
  onLoadSessions,
  onRevokeSession,
  onRevokeAllSessions,
  isPending
}: SessionsManagerProps) => {
  useEffect(() => {
    onLoadSessions(user.id);
  }, [user.id, onLoadSessions]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground font-arabic">
          جلسات المستخدم: <strong>{user.name}</strong>
        </div>
        
        {userSessions.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="font-arabic" disabled={isPending}>
                <LogOut className="mr-2 h-3 w-3" />
                إلغاء جميع الجلسات
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-arabic">تأكيد إلغاء الجلسات</AlertDialogTitle>
                <AlertDialogDescription className="font-arabic">
                  هل أنت متأكد من إلغاء جميع جلسات هذا المستخدم؟ سيتم تسجيل خروجه من جميع الأجهزة.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="font-arabic">إلغاء</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onRevokeAllSessions(user.id)}
                  className="font-arabic"
                  disabled={isPending}
                >
                  إلغاء الجلسات
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {isPending ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2 font-arabic">جاري تحميل الجلسات...</p>
          </div>
        ) : userSessions.length === 0 ? (
          <div className="text-center py-8">
            <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground font-arabic">لا توجد جلسات نشطة</p>
          </div>
        ) : (
          userSessions.map((session, index) => (
            <div 
              key={session.id || session.token || index} 
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Monitor className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium font-arabic">الجلسة {index + 1}</span>
                </div>
                
                {session.ipAddress && (
                  <div className="text-xs text-muted-foreground">
                    IP: {session.ipAddress}
                  </div>
                )}
                
                {session.userAgent && (
                  <div className="text-xs text-muted-foreground max-w-xs truncate">
                    {session.userAgent}
                  </div>
                )}
                
                {session.createdAt && (
                  <div className="text-xs text-muted-foreground font-arabic">
                    تم الإنشاء: {new Date(session.createdAt).toLocaleString('ar-SA')}
                  </div>
                )}

                {session.expiresAt && (
                  <div className="text-xs text-muted-foreground font-arabic">
                    ينتهي في: {new Date(session.expiresAt).toLocaleString('ar-SA')}
                  </div>
                )}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onRevokeSession(session.token)}
                className="font-arabic text-red-600 border-red-600 hover:bg-red-50"
                disabled={isPending}
              >
                <LogOut className="mr-1 h-3 w-3" />
                إلغاء
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 