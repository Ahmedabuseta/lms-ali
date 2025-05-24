import Logo from './logo';
import { SidebarRoutes } from './sidebar-routes';

const Sidebar = () => {
  return (
    <div className="custom-scrollbar-sidebar border-gradient-to-b relative flex h-full flex-col overflow-y-auto border-r bg-white/95 from-blue-200/30 via-indigo-200/30 to-purple-200/30 shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/90">
      {/* Light mode decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-white/50 to-indigo-50/30 dark:from-transparent dark:to-transparent"></div>

      <div className="relative z-10">
        <div className="border-b border-blue-100/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-6 dark:border-gray-700/30 dark:from-transparent dark:to-transparent">
          <Logo />
        </div>
        <div className="flex w-full flex-col p-3">
          <SidebarRoutes />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
