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

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
          })),
          locale,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erreur de paiement");
        setLoading(false);
      }
    } catch {
      alert("Erreur de connexion");
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
          <><Loader2 className="w-5 h-5 animate-spin" /> Traitement en cours...</>
        ) : (
          <><CreditCard className="w-5 h-5" /> Payer par carte</>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
        <ShieldCheck className="w-4 h-4 text-green-500" />
        <span>Paiement sécurisé — Visa, Mastercard, Apple Pay</span>
      </div>
    </>
  );
}
