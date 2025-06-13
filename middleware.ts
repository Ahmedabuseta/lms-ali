import { NextRequest, NextResponse } from 'next/server';
import { auth } from './lib/auth';

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/api/webhook',
    '/api/auth',
    '/sign-in',
    '/sign-up',
    '/api/auth/callback/google',
    '/banned', // Allow access to banned page
  ];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route) || pathname === route
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  try { const session = await auth.api.getSession({
      headers: request.headers, });

    if (!session) { return NextResponse.redirect(new URL('/sign-in', request.url)); }

    // Check if user is banned
    if (session.user?.banned) { // Don't redirect if already on banned page
      if (pathname !== '/banned') {
        return NextResponse.redirect(new URL('/banned', request.url)); }
    } else { // If user is not banned but trying to access banned page, redirect to dashboard
      if (pathname === '/banned') {
        return NextResponse.redirect(new URL('/dashboard', request.url)); }
    }

    return NextResponse.next();
  } catch (error) { console.error('Middleware auth error:', error);
    return NextResponse.redirect(new URL('/sign-in', request.url)); }
}

export const config = { matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'], };
