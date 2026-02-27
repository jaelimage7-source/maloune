import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['fr', 'en', 'ht', 'es', 'pt', 'de', 'it', 'nl', 'ar', 'ja', 'zh', 'ko', 'ru', 'pl', 'tr', 'sv'],
  defaultLocale: 'fr',
});

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation(routing);
