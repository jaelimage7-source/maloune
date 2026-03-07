'use client';

import { useState } from 'react';
import { Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useLocale } from 'next-intl';

export default function MyPosCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const items = useCartStore((s) => s.items);
  const locale = useLocale();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError('');

    try {
      // Create a hidden form and submit it to our API
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/checkout';
      form.style.display = 'none';

      // Add items data as hidden field
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'data';
      input.value = JSON.stringify({
        items: items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
        })),
        locale,
      });
      form.appendChild(input);

      document.body.appendChild(form);
      form.submit();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erè pèman');
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleCheckout}
        disabled={loading || items.length === 0}
        className="w-full btn-primary py-4 flex items-center justify-center gap-3 text-lg font-semibold disabled:opacity-50"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Redireksyon sou pèman...</>
        ) : (
          <><CreditCard className="w-5 h-5" /> Peye ak Kat</>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
        <ShieldCheck className="w-4 h-4 text-green-500" />
        <span>Pèman sekirize pa myPOS — Visa, Mastercard</span>
      </div>

      {error && (
        <p className="mt-3 text-center text-red-500 text-sm">{error}</p>
      )}
    </>
  );
}
