import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import SideBar from './sidebar';

export const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger className="rounded-lg p-2 pr-4 transition-all duration-300 hover:scale-110 hover:bg-blue-50/50 hover:text-blue-600 dark:hover:bg-gray-800/50 dark:hover:text-blue-400 md:hidden">
        <Menu className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="bg-white/98 border-r border-blue-200/50 p-0 shadow-2xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/95"
      >
        <SideBar />
      </SheetContent>
    </Sheet>
  );
};
