import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';

const MAINTENANCE_MODE = false;

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow these paths even in maintenance
  const allowedPaths = [
    '/api/',
    '/mentions-legales',
    '/conditions-generales',
    '/politique-confidentialite',
    '/politique-remboursement',
    '/mentions-legales',
    '/conditions-generales',
    '/politique-confidentialite',
    '/politique-remboursement',
    '/_next/',
    '/favicon',
    '/android-chrome',
    '/apple-touch',
    '/site.webmanifest',
    '/sw.js',
  ];

  if (MAINTENANCE_MODE) {
    const isAllowed = allowedPaths.some(p => pathname.startsWith(p));
    const isMainPage = pathname === '/' || /^\/[a-z]{2}$/.test(pathname) || /^\/[a-z]{2}\/$/.test(pathname);

    if (!isAllowed && !isMainPage) {
      // Redirect everything to homepage (which shows maintenance)
      const locale = pathname.match(/^\/([a-z]{2})\//)?.[1] || 'fr';
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
