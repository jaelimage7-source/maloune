import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { DM_Sans } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Maloune — Boutique en ligne',
    template: '%s | Maloune',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  description: 'Découvrez les meilleurs produits livrés chez vous. Paiement sécurisé, livraison rapide.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://maloune.fr'),
  openGraph: {
    type: 'website',
    siteName: 'Maloune',
    locale: 'fr_FR',
    alternateLocale: ['ht_HT', 'en_US'],
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={dmSans.className} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <div className="min-h-screen">{children}</div>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
