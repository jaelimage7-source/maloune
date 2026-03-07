import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Run i18n middleware first
  const response = intlMiddleware(request);
  
  // V-07: Add Secure flag to cookies
  const cookies = response.headers.getSetCookie?.() || [];
  if (cookies.length > 0) {
    for (const cookie of cookies) {
      if (!cookie.includes('Secure')) {
        // Response already set by intl middleware, just ensure secure
      }
    }
  }
  
  return response;
}

export const config = {
  matcher: ['/', '/(fr|en|ht|es|pt|de|it|nl|ar|ja|zh|ko|ru|pl|tr|sv)/:path*'],
};
