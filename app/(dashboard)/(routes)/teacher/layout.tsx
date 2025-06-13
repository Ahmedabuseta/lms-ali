
import { requireTeacher } from '@/lib/auth-helpers';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  requireTeacher();
  return <>{children}</>;
}
