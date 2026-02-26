'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { User, Package, MapPin, Settings, LogIn } from 'lucide-react';

export default function AccountPage() {
  const t = useTranslations();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container-shop py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('account.title')}</h1>

        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center mb-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('common.login')}</h2>
            <p className="text-gray-500 mb-6">Connectez-vous pour suivre vos commandes</p>

            <div className="space-y-3">
              <input type="email" placeholder="Email" className="input" />
              <input type="password" placeholder="Mot de passe" className="input" />
              <button className="btn-primary w-full py-3">
                <LogIn className="w-4 h-4 mr-2" /> {t('common.login')}
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Pas encore de compte ? <button className="text-orange-500 font-medium hover:underline">{t('common.register')}</button>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Package, label: t('account.orders'), desc: 'Suivre vos commandes' },
              { icon: MapPin, label: t('account.addresses'), desc: 'Gérer vos adresses' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer">
                <item.icon className="w-6 h-6 text-orange-500 mb-2" />
                <h3 className="font-semibold text-gray-900 text-sm">{item.label}</h3>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
