'use client';

import { useState } from 'react';
import { Video, VideoOff, CreditCard } from 'lucide-react';
import { User, StudentAccessType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface GrantAccessFormProps {
  user: User;
  onGrantAccess: (
    userId: string,
    accessType: StudentAccessType,
    paymentAmount?: number,
    paymentNotes?: string
  ) => void;
  isPending: boolean;
}

export const GrantAccessForm = ({ user, onGrantAccess, isPending }: GrantAccessFormProps) => {
  const [accessType, setAccessType] = useState<StudentAccessType>(StudentAccessType.FULL_ACCESS);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const handleGrantAccess = () => {
    onGrantAccess(
      user.id,
      accessType,
      paymentAmount ? parseFloat(paymentAmount) : undefined,
      paymentNotes || undefined,
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground font-arabic">
        منح وصول مدفوع للطالب: <strong>{user.name}</strong>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-foreground font-arabic">نوع الوصول</label>
          <Select value={accessType} onValueChange={(value: StudentAccessType) => setAccessType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={StudentAccessType.FULL_ACCESS}>
                <div className="flex items-center gap-2 font-arabic">
                  <Video className="h-4 w-4" />
                  وصول كامل (مع الفيديوهات)
                </div>
              </SelectItem>
              <SelectItem value={StudentAccessType.LIMITED_ACCESS}>
                <div className="flex items-center gap-2 font-arabic">
                  <VideoOff className="h-4 w-4" />
                  وصول محدود (بدون فيديوهات)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground font-arabic">المبلغ المدفوع (اختياري)</label>
          <Input
            type="number"
            placeholder="0.00"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground font-arabic">ملاحظات الدفع (اختياري)</label>
          <Textarea
            placeholder="تفاصيل الدفع أو محادثة واتساب..."
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={handleGrantAccess} disabled={isPending} className="w-full font-arabic">
          <CreditCard className="mr-2 h-4 w-4" />
          {isPending ? 'جاري المنح...' : 'منح الوصول'}
        </Button>
      </div>
    </div>
  );
}; 