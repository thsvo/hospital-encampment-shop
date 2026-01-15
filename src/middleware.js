import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check if the user is accessing the admin path
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token');

    // If no token exists, redirect to login page
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
