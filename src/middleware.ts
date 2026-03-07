import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // V-07: Add Secure flag to cookies
  const cookieHeader = response.headers.get('set-cookie');
  if (cookieHeader && !cookieHeader.includes('Secure')) {
    response.headers.set('set-cookie', cookieHeader + '; Secure');
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
