'use client';

import { useState } from 'react';
import { User } from '@/lib/types';
import { useUserManagement } from '../_hooks/use-user-management-simplified';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

interface BanUserFormProps {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BanUserForm = ({ user, onSuccess, onCancel }: BanUserFormProps) => {
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState<string>('permanent');

  const { banUser, isLoading } = useUserManagement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!banReason.trim()) {
      return;
    }
    
    const duration = banDuration === 'permanent' ? undefined : parseInt(banDuration);
    
    await banUser(user.id, banReason, duration);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-medium">تحذير: حظر المستخدم</span>
      </div>
      
      <div className="text-sm text-muted-foreground">
        سيتم حظر المستخدم: <strong>{user.name || user.email}</strong>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="banDuration">مدة الحظر</Label>
          <Select value={banDuration} onValueChange={setBanDuration}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">يوم واحد</SelectItem>
              <SelectItem value="7">أسبوع واحد</SelectItem>
              <SelectItem value="30">شهر واحد</SelectItem>
              <SelectItem value="permanent">حظر دائم</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="banReason">سبب الحظر *</Label>
          <Textarea
            id="banReason"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="أدخل سبب الحظر..."
            rows={3}
            required
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          variant="destructive" 
          disabled={isLoading || !banReason.trim()} 
          className="flex-1"
        >
          {isLoading ? 'جاري المعالجة...' : 'حظر المستخدم'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          إلغاء
        </Button>
      </div>
    </form>
  );
};
