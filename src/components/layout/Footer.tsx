'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

export default function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
      <div className="container-shop">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/logo-footer.png"
                alt="MALOUNE Boutique"
                width={200}
                height={75}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed mb-4">{t('aboutText')}</p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors text-sm">f</a>
              <a href="#" className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors text-sm">ig</a>
              <a href="#" className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors text-sm">tt</a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">{t('links')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products" className="hover:text-orange-400 transition-colors">Tous les produits</Link></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Nouveautés</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Meilleures ventes</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Promotions</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Informations</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-orange-400 transition-colors">{t('legal')}</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">{t('privacy')}</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">{t('terms')}</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">{t('contact')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">{t('contact')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li>contact@maloune.fr</li>
              <li>maloune.fr</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {year} MALOUNE Boutique. {t('rights')}</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">🔒 Paiement sécurisé</span>
            <span className="flex items-center gap-1">🚚 Livraison mondiale</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
