'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useCartStore } from '@/lib/store';

export default function CheckoutSuccessPage() {
  const t = useTranslations();
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => { clearCart(); }, [clearCart]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('common.orderConfirmed')}</h1>
        <p className="text-gray-500 mb-8">Merci pour votre commande ! Vous recevrez un email de confirmation.</p>
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-3 text-left">
            <Package className="w-8 h-8 text-orange-500" />
            <div>
              <p className="font-semibold text-gray-900">{t('home.guarantees.shipping')}</p>
              <p className="text-sm text-gray-500">{t('home.guarantees.shippingDesc')}</p>
            </div>
          </div>
        </div>
        <Link href="/products" className="btn-primary inline-flex items-center gap-2">
          {t('common.continueShopping')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}
