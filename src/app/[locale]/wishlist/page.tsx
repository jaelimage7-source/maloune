'use client';
import { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useWishlistStore } from '@/lib/wishlist-store';
import { useCartStore } from '@/lib/store';
import ProductCard from '@/components/products/ProductCard';

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const addToCart = useCartStore((s) => s.addItem);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);
  if (!hydrated) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container-shop py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500 fill-red-500" /> Ma liste d&apos;envies
              </h1>
              <p className="text-gray-500 mt-1">{items.length} article{items.length !== 1 ? 's' : ''}</p>
            </div>
            {items.length > 0 && (
              <button onClick={clearWishlist} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
                <Trash2 className="w-4 h-4" /> Tout supprimer
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="container-shop py-8">
        {items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map(item => (
              <div key={item.id} className="relative group">
                <ProductCard product={{ ...item, rating: 4.5, reviewCount: 0, inStock: true, category: '', categorySlug: '' } as any} />
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                  <button onClick={() => removeItem(item.id)} className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                  <button onClick={() => addToCart({ id: item.id, productId: item.id, name: item.name, price: item.price, image: item.image, maxQuantity: 10 })}
                    className="w-8 h-8 bg-orange-500 rounded-full shadow-md flex items-center justify-center hover:bg-orange-600 transition-colors">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Votre liste est vide</h2>
            <p className="text-gray-500 mb-6">Ajoutez des produits à votre liste d&apos;envies pour les retrouver facilement.</p>
            <Link href="/products" className="btn-primary text-sm">Découvrir nos produits</Link>
          </div>
        )}
      </div>
    </main>
  );
}

