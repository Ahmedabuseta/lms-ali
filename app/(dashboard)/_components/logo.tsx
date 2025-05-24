import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/" className="group">
      <div className="flex items-center space-x-2 space-x-reverse">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transition-transform duration-300 group-hover:scale-110">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent transition-all duration-300 group-hover:from-purple-600 group-hover:to-blue-600">
          LMS Ali
        </span>
      </div>
    </Link>
  );
};

export default Logo;
