'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useCartStore } from '@/lib/store';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CreditCard, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const totalItems = useCartStore((s) => s.totalItems);

  const handleCheckout = () => {
    // Go to checkout page to collect shipping address FIRST
    router.push(`/${locale}/checkout`);
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('cart.empty')}</h2>
          <p className="text-gray-500 mb-6">{t('cart.emptyDesc')}</p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            {t('common.continueShopping')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container-shop py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('cart.title')} ({totalItems()})</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-4 flex gap-4 shadow-sm">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.image?.startsWith('http') ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl flex items-center justify-center h-full">{item.image || '📦'}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-gray-900">{item.price.toFixed(2)} €</span>
                    {item.comparePrice && (
                      <span className="text-sm text-gray-400 line-through">{item.comparePrice.toFixed(2)} €</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-50"><Minus className="w-4 h-4" /></button>
                      <span className="px-3 font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-600 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm h-fit sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">{t('cart.summary')}</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>{t('common.subtotal')}</span>
                <span>{totalPrice().toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t('common.shipping')}</span>
                <span className="text-green-600 font-medium">{t('common.freeShipping')}</span>
              </div>
              <hr />
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>{t('common.total')}</span>
                <span>{totalPrice().toFixed(2)} €</span>
              </div>
            </div>
            <button onClick={handleCheckout}
              className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" />
              {t('common.checkout')}
            </button>
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Paiement sécurisé par myPOS</span>
            </div>
            <Link href="/products" className="block text-center text-orange-500 text-sm mt-4 hover:text-orange-600">
              {t('common.continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
