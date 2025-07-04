'use client';

import { usePathname } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useState, useEffect } from 'react';

import { SearchInput } from './search-input';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import { isAdmin, isTeacher } from '@/lib/teacher';
import { useSession, signOut } from '@/lib/auth-client';
import { DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';

export const NavbarRoutes = () => { 
  const { data: session } = useSession();
  const [imageError, setImageError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const pathname = usePathname();

  // Ensure client-side mounting to prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isTeacherPage = pathname?.startsWith('/teacher');
  const isCoursePage = pathname?.includes('/courses');
  const isSearchPage = pathname?.includes('/search');

  const handleSignOut = async () => { 
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/'; 
        },
      },
    });
  };

  const handleImageError = () => { 
    console.log('Image failed to load:', session?.user?.image);
    setImageError(true); 
  };

  const handleImageLoad = () => { 
    console.log('Image loaded successfully:', session?.user?.image);
    setImageError(false); 
  };

  // Check if we have a valid image URL
  const hasValidImage = session?.user?.image &&
    session.user.image.trim() !== '' &&
    !imageError &&
    (session.user.image.startsWith('http') || session.user.image.startsWith('data:'));

  // Don't render until mounted to prevent hydration errors
  if (!isMounted) {
    return (
      <div className="ml-auto flex items-center gap-x-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  return (
    <>
      { isSearchPage && (
        <div className="hidden md:block">
          <Suspense fallback={<div className="h-10 w-[300px] animate-pulse rounded-full bg-gray-200" /> }>
            <SearchInput />
          </Suspense>
        </div>
      )}
      <div className="ml-auto flex items-center gap-x-2">
        <ThemeToggle />
        { isTeacherPage || isCoursePage ? (
          <Link href="/">
            <Button size="sm" variant="ghost">
              <LogOut className="mr-2 h-4 w-4" />
              Exit
            </Button>
          </Link>
        ) : isTeacher(session?.user?.email) ? (
          <Link href="/teacher/">
            <Button size="sm" variant="ghost">
              Teacher mode
            </Button>
          </Link>
        ) : null }

        {session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 overflow-hidden">
                {hasValidImage ? (
                  <img
                    src={session.user?.image || ''}
                    alt={session.user.name || 'User avatar'}
                    className="h-full w-full rounded-full object-cover"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    style={ { display: 'block' }}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                    { session.user.name
                      ? session.user.name.charAt(0).toUpperCase()
                      : session.user.email?.charAt(0).toUpperCase()
                      || <User className="h-4 w-4" /> }
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {session.user.name && <p className="font-medium">{session.user.name}</p>}
                  {session.user.email && (
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {session.user.email}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </>
  );
};
