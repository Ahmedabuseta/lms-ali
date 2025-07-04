'use client';

import React from 'react';
import { LogOut, User } from 'lucide-react';
import { MobileSidebar } from './mobile-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSession, signOut } from '@/lib/auth-client';
import { NavbarRoutes } from '@/components/navbar-routes';

const NavbarComponent = () => {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/';
        },
      },
    });
  };

  return (
    <div className="flex h-full w-full items-center bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-800 px-4">
      <div className="flex items-center w-full    gap-x-4">
        <MobileSidebar />
        <NavbarRoutes />
      </div>
    </div>

  );
};

export const Navbar = React.memo(NavbarComponent);
