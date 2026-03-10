import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { DM_Sans } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PWAInstall from '@/components/layout/PWAInstall';
import PromoBar from '@/components/layout/PromoBar';
import CookieBanner from '@/components/layout/CookieBanner';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import '@/styles/globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "Maloune — Boutique en ligne",
    template: "%s | Maloune",
  },
  description: "Boutique en ligne pour la diaspora — Mode, Accessoires, Tech",
  manifest: "/site.webmanifest",
  themeColor: "#B8860B",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Maloune",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Maloune",
    title: "Maloune — Boutique en ligne",
    description: "Boutique en ligne pour la diaspora — Mode, Accessoires, Tech",
    url: "https://maloune.fr",
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) notFound();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={dmSans.className} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <PromoBar />
          <Header />
          <div className="min-h-screen">{children}</div>
          <Footer />
            <PWAInstall />
          <WhatsAppButton />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

