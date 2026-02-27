'use client';

import { Star, ShoppingBag } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useCartStore } from '@/lib/store';

interface ProductCardProps {
  product: {
    id: string; slug: string; name: string; price: number;
    comparePrice?: number; image: string; rating: number;
    reviewCount: number; tag?: string; inStock: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const isUrl = product.image?.startsWith('http');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addItem({
      id: product.id, productId: product.id, name: product.name,
      price: product.price, comparePrice: product.comparePrice,
      image: product.image, maxQuantity: 10,
    });
  };

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="card overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 h-56 sm:h-64 flex items-center justify-center overflow-hidden">
          {isUrl ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <span className="text-7xl group-hover:scale-110 transition-transform duration-500">{product.image || '📦'}</span>
          )}

          {product.tag && <span className="absolute top-3 left-3 badge-brand">{product.tag}</span>}
          {discount > 0 && <span className="absolute top-3 right-3 badge bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">-{discount}%</span>}

          {!product.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium text-sm">Rupture de stock</span>
            </div>
          )}

          <button onClick={handleAddToCart} disabled={!product.inStock}
            className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-orange-500 hover:text-white disabled:opacity-50">
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, j) => (
              <Star key={j} className={`w-3.5 h-3.5 ${j < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
            ))}
            <span className="text-xs text-gray-400 ml-1">({product.reviewCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">{product.price.toFixed(2)} €</span>
            {product.comparePrice && <span className="text-sm text-gray-400 line-through">{product.comparePrice.toFixed(2)} €</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
