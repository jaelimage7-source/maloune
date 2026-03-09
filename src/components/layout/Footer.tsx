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
                className="h-16 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Maloune — Votre boutique en ligne de confiance. Produits tendance livrés chez vous.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors text-sm">f</a>
              <a href="#" className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors text-sm">ig</a>
              <a href="#" className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors text-sm">tt</a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Liens utiles</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products" className="hover:text-orange-400 transition-colors">Tous les produits</Link></li>
              <li><Link href="/products" className="hover:text-orange-400 transition-colors">Nouveautés</Link></li>
              <li><Link href="/products" className="hover:text-orange-400 transition-colors">Meilleures ventes</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Informations</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/mentions-legales" className="hover:text-orange-400 transition-colors">Mentions légales</Link></li>
              <li><Link href="/politique-confidentialite" className="hover:text-orange-400 transition-colors">Politique de confidentialité</Link></li>
              <li><Link href="/conditions-generales" className="hover:text-orange-400 transition-colors">Conditions générales</Link></li>
              <li><Link href="/politique-remboursement" className="hover:text-orange-400 transition-colors">Politique de remboursement</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="mailto:contact@maloune.fr" className="hover:text-orange-400 transition-colors">
                  contact@maloune.fr
                </a>
              </li>
              <li>
                <a href="https://maloune.fr" className="hover:text-orange-400 transition-colors">
                  maloune.fr
                </a>
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">Paiement sécurisé par</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs bg-gray-800 px-2 py-1 rounded">myPOS</span>
              <span className="text-xs bg-gray-800 px-2 py-1 rounded">Visa</span>
              <span className="text-xs bg-gray-800 px-2 py-1 rounded">Mastercard</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {year} MALOUNE Boutique. Tous droits réservés.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">🔒 Paiement sécurisé</span>
            <span className="flex items-center gap-1">🚚 Livraison mondiale</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
