import { NavbarRoutes } from '@/components/navbar-routes';
import { MobileSidebar } from './mobile-sidebar';

export const Navbar = () => {
  return (
    <div className="border-gradient-to-r relative flex h-full items-center border-b bg-white/90 from-blue-200/30 via-indigo-200/30 to-purple-200/30 p-4 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80">
      {/* Light mode subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/40 via-white/60 to-indigo-50/40 dark:from-transparent dark:to-transparent"></div>
      <div className="relative z-10 flex w-full items-center">
        <MobileSidebar />
        <NavbarRoutes />
      </div>
    </div>
  );
};
