import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  collapsed?: boolean;
}

const Logo = ({ collapsed = false }: LogoProps) => {
  return (
    <Link href="/" className="group">
      <div className="flex items-center space-x-2 space-x-reverse">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transition-transform duration-300 group-hover:scale-110 shrink-0">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <span className={cn(
          'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent transition-all duration-300 group-hover:from-purple-600 group-hover:to-blue-600 font-arabic',
          collapsed && 'opacity-0 w-0 overflow-hidden'
        )}>
          LMS Ali
        </span>
      </div>
    </Link>
  );
};

export default Logo;
