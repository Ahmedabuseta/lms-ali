'use client';

import { useState } from 'react';
import { ShieldOff } from 'lucide-react';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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

interface BanUserFormProps {
  user: User;
  onBanUser: (userId: string, reason: string, duration?: number) => void;
  isPending: boolean;
}

export const BanUserForm = ({ user, onBanUser, isPending }: BanUserFormProps) => {
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('');

  const handleBan = () => {
    if (!banReason.trim()) {
      return;
    }
    
    const duration = banDuration ? parseInt(banDuration) : undefined;
    onBanUser(user.id, banReason, duration);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground font-arabic">
        حظر المستخدم: <strong>{user.name}</strong>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium text-foreground font-arabic">سبب الحظر *</Label>
          <Textarea
            placeholder="انتهاك الشروط والأحكام، سلوك غير لائق، إلخ..."
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-foreground font-arabic">مدة الحظر (بالساعات) - اختياري</Label>
          <Input
            type="number"
            placeholder="24 (اتركه فارغاً للحظر الدائم)"
            value={banDuration}
            onChange={(e) => setBanDuration(e.target.value)}
          />
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full font-arabic"
              disabled={!banReason.trim() || isPending}
            >
              <ShieldOff className="mr-2 h-4 w-4" />
              {isPending ? 'جاري الحظر...' : 'تأكيد الحظر'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-arabic">تأكيد حظر المستخدم</AlertDialogTitle>
              <AlertDialogDescription className="font-arabic">
                هل أنت متأكد من حظر هذا المستخدم؟ سيتم إلغاء جميع جلساته النشطة فوراً.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-arabic">إلغاء</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleBan}
                className="font-arabic bg-red-600 hover:bg-red-700"
                disabled={isPending}
              >
                حظر المستخدم
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}; 