'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
      <div className="container-shop">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-4">
              Maloune
            </h3>
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
              <li><a href="#" className="hover:text-orange-400 transition-colors">{t('refund')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm">
              <li>malou509@yahoo.fr</li>
              <li>maloune.com</li>
              <li className="pt-2">
                <span className="text-xs text-gray-500">Paiement sécurisé par</span>
                <div className="flex gap-2 mt-1">
                  <span className="bg-white/10 rounded px-2 py-1 text-xs">Stripe</span>
                  <span className="bg-white/10 rounded px-2 py-1 text-xs">PayPal</span>
                  <span className="bg-white/10 rounded px-2 py-1 text-xs">Visa</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>{t('copyright', { year: String(year) })}</p>
        </div>
      </div>
    </footer>
  );
}
