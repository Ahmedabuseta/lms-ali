'use client';

import { useState } from 'react';
import { Video, VideoOff, CreditCard } from 'lucide-react';
import { User, StudentAccessType } from '@/lib/types';
import { useUserManagement } from '../_hooks/use-user-management-simplified';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface GrantAccessFormProps {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}

export const GrantAccessForm = ({ user, onSuccess, onCancel }: GrantAccessFormProps) => {
  const [accessType, setAccessType] = useState<StudentAccessType>(StudentAccessType.FULL_ACCESS);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const { grantAccess, isLoading } = useUserManagement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await grantAccess(
      user.id,
      accessType,
      paymentAmount ? parseFloat(paymentAmount) : undefined,
      paymentNotes || undefined
    );
    
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-sm text-muted-foreground">
        منح صلاحية الوصول للطالب: <strong>{user.name || user.email}</strong>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="accessType">نوع الوصول</Label>
          <Select value={accessType} onValueChange={(value: StudentAccessType) => setAccessType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={StudentAccessType.FULL_ACCESS}>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  وصول كامل (مع الفيديوهات)
                </div>
              </SelectItem>
              <SelectItem value={StudentAccessType.LIMITED_ACCESS}>
                <div className="flex items-center gap-2">
                  <VideoOff className="h-4 w-4" />
                  وصول محدود (بدون فيديوهات)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentAmount">مبلغ الدفع (ر.س) - اختياري</Label>
          <Input
            id="paymentAmount"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="أدخل المبلغ المدفوع"
            min="0"
            step="0.01"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentNotes">ملاحظات الدفع - اختياري</Label>
          <Textarea
            id="paymentNotes"
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            placeholder="أضف أي ملاحظات حول الدفع أو الاتفاق..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'جاري المعالجة...' : 'منح الصلاحية'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          إلغاء
        </Button>
      </div>
    </form>
  );
};
