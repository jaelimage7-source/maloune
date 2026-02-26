import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['fr', 'ht', 'en'],
  defaultLocale: 'fr',
});

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation(routing);
