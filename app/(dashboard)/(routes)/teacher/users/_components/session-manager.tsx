'use client';

import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, Globe, User, Clock, MapPin, Shield, ShieldOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface SessionData {
  id: string;
  userId: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  impersonatedBy?: string;
  user: {
    name?: string;
    email: string;
    role: string;
  };
}

interface SessionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const getDeviceIcon = (userAgent?: string) => {
  if (!userAgent) return <Monitor className="h-4 w-4" />;
  
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return <Smartphone className="h-4 w-4" />;
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    return <Tablet className="h-4 w-4" />;
  }
  return <Monitor className="h-4 w-4" />;
};

const getBrowserName = (userAgent?: string) => {
  if (!userAgent) return 'Unknown';
  
  const ua = userAgent.toLowerCase();
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari')) return 'Safari';
  if (ua.includes('edge')) return 'Edge';
  return 'Other';
};

const getLocationFromIP = (ip?: string) => {
  // In a real implementation, you would use a geolocation service
  if (!ip) return 'Unknown';
  if (ip.startsWith('192.168') || ip.startsWith('10.') || ip.startsWith('127.')) {
    return 'Local Network';
  }
  return 'External';
};

const SessionCard = ({ session, onRevoke, onImpersonate, isLoading }: {
  session: SessionData;
  onRevoke: (sessionId: string) => void;
  onImpersonate: (userId: string) => void;
  isLoading: boolean;
}) => {
  const isExpired = new Date(session.expiresAt) < new Date();
  const isImpersonated = !!session.impersonatedBy;
  
  return (
    <Card className={cn(
      "transition-all duration-200",
      isExpired && "opacity-60 border-destructive/20",
      isImpersonated && "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getDeviceIcon(session.userAgent)}
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">
                  {session.user.name || session.user.email}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getBrowserName(session.userAgent)}
                </div>
              </div>
            </div>
            
            <div className="flex gap-1">
              {isImpersonated && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Impersonated
                </Badge>
              )}
              {isExpired && (
                <Badge variant="destructive">منتهية</Badge>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Globe className="h-3 w-3" />
              <span>{session.ipAddress || 'Unknown IP'}</span>
              <span>({getLocationFromIP(session.ipAddress)})</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>نشط: {new Date(session.updatedAt).toLocaleString('ar-SA')}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              <span>{session.user.email}</span>
              <Badge variant="outline" className="text-xs">
                {session.user.role === 'TEACHER' ? 'مدرس' : 'طالب'}
              </Badge>
            </div>
            
            {isImpersonated && (
              <div className="text-orange-600 dark:text-orange-400 text-xs">
                تم التنكر بواسطة مدرس
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {!isExpired && !isImpersonated && session.user.role === 'STUDENT' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onImpersonate(session.userId)}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
              >
                <Shield className="h-3 w-3 mr-1" />
                تسجيل دخول كـ
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRevoke(session.id)}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              <ShieldOff className="h-3 w-3 mr-1" />
              إنهاء الجلسة
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const SessionManager = ({ isOpen, onClose }: SessionManagerProps) => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      toast.error('فشل في تحميل الجلسات');
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) throw new Error('Failed to revoke session');

      toast.success('تم إنهاء الجلسة بنجاح');
      await fetchSessions(); // Refresh the list
    } catch (error) {
      toast.error('فشل في إنهاء الجلسة');
      console.error('Error revoking session:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleImpersonate = async (userId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error('Failed to impersonate user');

      const data = await response.json();
      toast.success('تم تسجيل الدخول بنجاح');
      
      // Redirect to the impersonated user's dashboard
      window.open('/dashboard', '_blank');
    } catch (error) {
      toast.error('فشل في تسجيل الدخول كمستخدم');
      console.error('Error impersonating user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen]);

  const activeSessions = sessions.filter(s => new Date(s.expiresAt) > new Date());
  const expiredSessions = sessions.filter(s => new Date(s.expiresAt) <= new Date());
  const impersonatedSessions = sessions.filter(s => s.impersonatedBy);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            إدارة الجلسات والتحكم في المستخدمين
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{activeSessions.length}</div>
                <div className="text-xs text-muted-foreground">جلسات نشطة</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-red-600">{expiredSessions.length}</div>
                <div className="text-xs text-muted-foreground">جلسات منتهية</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-orange-600">{impersonatedSessions.length}</div>
                <div className="text-xs text-muted-foreground">جلسات متنكرة</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold">{sessions.length}</div>
                <div className="text-xs text-muted-foreground">إجمالي الجلسات</div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <Button onClick={fetchSessions} disabled={isLoading} variant="outline">
              {isLoading ? 'جاري التحديث...' : 'تحديث'}
            </Button>
          </div>

          {/* Sessions List */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد جلسات نشطة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active Sessions */}
              {activeSessions.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3 text-green-600">الجلسات النشطة ({activeSessions.length})</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {activeSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onRevoke={handleRevokeSession}
                        onImpersonate={handleImpersonate}
                        isLoading={actionLoading}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Impersonated Sessions */}
              {impersonatedSessions.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3 text-orange-600">الجلسات المتنكرة ({impersonatedSessions.length})</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {impersonatedSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onRevoke={handleRevokeSession}
                        onImpersonate={handleImpersonate}
                        isLoading={actionLoading}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Expired Sessions */}
              {expiredSessions.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3 text-red-600">الجلسات المنتهية ({expiredSessions.length})</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {expiredSessions.slice(0, 10).map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onRevoke={handleRevokeSession}
                        onImpersonate={handleImpersonate}
                        isLoading={actionLoading}
                      />
                    ))}
                  </div>
                  {expiredSessions.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      وإظهار {expiredSessions.length - 10} جلسة منتهية إضافية...
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
