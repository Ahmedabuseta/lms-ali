import { Menu } from 'lucide-react';
import SideBar from './sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger className="rounded-lg p-2 pr-4 transition-all duration-300 hover:scale-110 hover:bg-blue-50/50 hover:text-blue-600 dark:hover:bg-gray-800/50 dark:hover:text-blue-400 md:hidden">
        <Menu className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="p-0 bg-white/90 backdrop-blur-lg border-r border-white/30 dark:bg-gray-900/90 dark:border-white/10"
      >
        <SideBar />
      </SheetContent>
    </Sheet>
  );
};
