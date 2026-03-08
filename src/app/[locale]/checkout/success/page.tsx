'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useCartStore } from '@/lib/store';
import { Check, Package, Mail, ArrowRight } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || '';
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    // Clear cart after successful payment
    clearCart();
  }, [clearCart]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Commande confirmée !</h1>
          <p className="text-gray-600 mb-6">Merci pour votre achat chez Maloune</p>

          {orderNumber && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
              <p className="text-sm text-orange-600 font-medium">Numéro de commande</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{orderNumber}</p>
            </div>
          )}

          <div className="space-y-3 text-left mb-8">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <Mail className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email de confirmation</p>
                <p className="text-xs text-gray-500">Un email avec les détails de votre commande vous a été envoyé.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <Package className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Suivi de livraison</p>
                <p className="text-xs text-gray-500">Vous recevrez un email avec le numéro de suivi dès que votre commande sera expédiée.</p>
              </div>
            </div>
          </div>

          <Link href="/products"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transition">
            Continuer vos achats <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
