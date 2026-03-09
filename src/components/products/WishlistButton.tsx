'use client';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useWishlistStore, WishlistItem } from '@/lib/wishlist-store';

export default function WishlistButton({ product, size = 'sm' }: { product: Omit<WishlistItem, 'addedAt'>; size?: 'sm' | 'md' }) {
  const addItem = useWishlistStore((s) => s.addItem);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); setActive(isInWishlist(product.id)); }, [product.id, isInWishlist]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (active) { removeItem(product.id); setActive(false); }
    else { addItem(product); setActive(true); }
  };

  if (!mounted) return null;
  const s = size === 'md' ? 'w-10 h-10' : 'w-8 h-8';
  const i = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <button onClick={toggle} className={`${s} bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all`}
      aria-label={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
      <Heart className={`${i} transition-colors ${active ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`} />
    </button>
  );
}

