import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(fr|en|ht|es|pt|de|it|nl|ar|ja|zh|ko|ru|pl|tr|sv)/:path*'],
};
