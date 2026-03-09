'use client';
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import ProductCard from './ProductCard';

interface Product {
  id: string; slug: string; name: string; price: number;
  comparePrice?: number; image: string; rating: number;
  reviewCount: number; tag?: string; inStock: boolean;
}

export default function RecentlyViewed({ currentSlug }: { currentSlug?: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem('maloune_recently_viewed') || '[]');
      const filtered = currentSlug ? stored.filter((p: Product) => p.slug !== currentSlug) : stored;
      setProducts(filtered.slice(0, 4));
    } catch { /* ignore */ }
  }, [currentSlug]);

  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container-shop">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">Récemment consultés</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}

