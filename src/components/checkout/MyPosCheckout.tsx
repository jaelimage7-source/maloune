'use client';

import { useState, useRef } from 'react';
import { Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useLocale } from 'next-intl';

export default function MyPosCheckout() {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const items = useCartStore((s) => s.items);
  const locale = useLocale();

  const handleCheckout = () => {
    if (items.length === 0) return;
    setLoading(true);
    // Submit the hidden form - API returns HTML that auto-submits to myPOS
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  return (
    <>
      <form ref={formRef} method="POST" action="/api/checkout" style={{ display: 'none' }}>
        <input type="hidden" name="data" value={JSON.stringify({
          items: items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
          })),
          locale,
        })} />
      </form>

      <button
        onClick={handleCheckout}
        disabled={loading || items.length === 0}
        className="w-full btn-primary py-4 flex items-center justify-center gap-3 text-lg font-semibold disabled:opacity-50"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Traitement en cours...</>
        ) : (
          <><CreditCard className="w-5 h-5" /> Payer par carte</>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
        <ShieldCheck className="w-4 h-4 text-green-500" />
        <span>Paiement sécurisé par myPOS — Visa, Mastercard</span>
      </div>
    </>
  );
}
