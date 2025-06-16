import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps { 
  collapsed?: boolean; 
}

const Logo = ({ collapsed = false }: LogoProps) => {
  return (
    <Link href="/" className="group">
      <div className="flex items-center space-x-2 space-x-reverse">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110 shrink-0 overflow-hidden">
          <Image
            src="/p2s-logo-compact.svg"
            alt="P2S Logo"
            width={40}
            height={40}
            className="h-full w-full object-contain"
          />
        </div>
        <span className={cn(
          'bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent transition-all duration-300 group-hover:from-indigo-600 group-hover:to-purple-600 font-arabic',
          collapsed && 'opacity-0 w-0 overflow-hidden'
        )}>
          P2S Learning
        </span>
      </div>
    </Link>
  );
};

export default Logo;
