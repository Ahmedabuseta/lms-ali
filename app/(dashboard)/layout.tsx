import { Navbar } from './_components/navbar';
import Sidebar from './_components/sidebar';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative h-full bg-gradient-to-br from-indigo-50 via-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Light mode decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-blue-200/30 to-indigo-300/20 blur-3xl"></div>
        <div className="animation-delay-2000 absolute right-0 top-1/4 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-purple-200/30 to-pink-300/20 blur-3xl"></div>
        <div className="animation-delay-4000 absolute bottom-0 left-1/3 h-72 w-72 animate-pulse rounded-full bg-gradient-to-br from-cyan-200/30 to-blue-300/20 blur-3xl"></div>
      </div>

      {/* Navbar */}
      <div className="bg-white/85 fixed inset-y-0 z-50 h-[80px] w-full border-b border-gray-200/50 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80 md:pl-56">
        <Navbar />
      </div>

      {/* Sidebar */}
      <div className="fixed inset-y-0 z-50 hidden h-full w-56 flex-col border-r border-gray-200/50 bg-white/90 shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/90 md:flex">
        <Sidebar />
      </div>

      {/* Main content with improved light mode background */}
      <main className="relative h-full pt-[80px] md:pl-56">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-blue-50/30 to-indigo-50/50 dark:from-transparent dark:to-transparent"></div>
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
