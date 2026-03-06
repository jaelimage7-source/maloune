'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useLocale } from 'next-intl';

export default function MyPosCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState<{ url: string; fields: Record<string, string> } | null>(null);
  const items = useCartStore((s) => s.items);
  const locale = useLocale();

  useEffect(() => {
    if (formData && formRef.current) {
      formRef.current.submit();
    }
  }, [formData]);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            image: item.image,
          })),
          locale,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Set form data to trigger submit
      setFormData({ url: data.url, fields: data.fields });
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
        <span>Pèman sekirize pa myPOS — Visa, Mastercard, JCB</span>
      </div>

      {error && (
        <p className="mt-3 text-center text-red-500 text-sm">{error}</p>
      )}

      {/* Hidden form for myPOS redirect */}
      {formData && (
        <form ref={formRef} method="POST" action={formData.url} style={{ display: 'none' }}>
          {Object.entries(formData.fields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        </form>
      )}
    </>
  );
}
