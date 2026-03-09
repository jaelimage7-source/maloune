'use client';
import { useState } from 'react';
import { X, Truck, Percent, Sparkles } from 'lucide-react';

const promos = [
  { icon: 'truck', text: 'Livraison GRATUITE dès 50€ d\'achat', color: 'from-orange-500 to-amber-500' },
  { icon: 'percent', text: '-10% sur votre première commande avec le code BIENVENUE10', color: 'from-rose-500 to-pink-500' },
  { icon: 'sparkles', text: 'Nouveautés chaque semaine — Découvrez nos derniers arrivages', color: 'from-violet-500 to-purple-500' },
];

export default function PromoBar() {
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);

  if (!visible) return null;

  const promo = promos[index % promos.length];
  const IconComp = promo.icon === 'truck' ? Truck : promo.icon === 'percent' ? Percent : Sparkles;

  return (
    <div className={`relative bg-gradient-to-r ${promo.color} text-white text-center py-2.5 px-4 text-sm font-medium z-[60]`}>
      <button onClick={() => setIndex(i => (i + 1) % promos.length)} className="flex items-center justify-center gap-2 w-full">
        <IconComp className="w-4 h-4 flex-shrink-0" />
        <span>{promo.text}</span>
      </button>
      <button onClick={() => setVisible(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors" aria-label="Fermer">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

