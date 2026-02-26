'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useCartStore } from '@/lib/store';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useState } from 'react';

export default function CartPage() {
  const t = useTranslations();
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const shipping = totalPrice() > 50 ? 0 : 4.99;
  const discount = promoApplied ? totalPrice() * 0.1 : 0;
  const total = totalPrice() - discount + shipping;

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('cart.empty')}</h1>
          <p className="text-gray-500 mb-8">{t('cart.emptyDesc')}</p>
          <Link href="/products" className="btn-primary px-8 py-3">
            {t('common.continueShopping')}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container-shop py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('cart.title')}</h1>
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
            <Trash2 className="w-4 h-4" /> Vider le panier
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 flex gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl sm:text-5xl">{item.image}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-gray-900">{item.price.toFixed(2)} €</span>
                    {item.comparePrice && (
                      <span className="text-sm text-gray-400 line-through">{item.comparePrice.toFixed(2)} €</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-gray-50">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-gray-50">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-bold text-gray-900">{(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
              <h2 className="font-bold text-gray-900 text-lg mb-4">{t('cart.summary')}</h2>
              
              {/* Promo code */}
              <div className="flex gap-2 mb-6">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder={t('cart.promoCode')}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <button
                  onClick={() => { if (promoCode === 'MALOUNE10') setPromoApplied(true); }}
                  className="btn-outline text-xs px-3"
                >
                  {t('cart.apply')}
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('common.subtotal')}</span>
                  <span className="font-medium">{totalPrice().toFixed(2)} €</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction (10%)</span>
                    <span>-{discount.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('common.shipping')}</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                    {shipping === 0 ? 'Gratuit' : `${shipping.toFixed(2)} €`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-orange-600 bg-orange-50 rounded-lg p-2">
                    Plus que {(50 - totalPrice()).toFixed(2)} € pour la livraison gratuite !
                  </p>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">{t('common.total')}</span>
                  <span className="font-bold text-xl text-gray-900">{total.toFixed(2)} €</span>
                </div>
              </div>

              <Link href="/checkout" className="btn-primary w-full py-3.5 mt-6 flex items-center justify-center">
                {t('common.checkout')} <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              
              <Link href="/products" className="block text-center text-sm text-gray-500 hover:text-orange-500 mt-3">
                {t('common.continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
