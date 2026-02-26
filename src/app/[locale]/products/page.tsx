'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import { PRODUCTS, CATEGORIES } from '@/lib/products';
import { SlidersHorizontal, X } from 'lucide-react';

export default function ProductsPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('cat') || '';
  
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...PRODUCTS];
    if (selectedCategory) {
      result = result.filter((p) => p.categorySlug === selectedCategory);
    }
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.sort((a, b) => b.reviewCount - a.reviewCount); break;
      default: result.sort((a, b) => b.reviewCount - a.reviewCount);
    }
    return result;
  }, [selectedCategory, sortBy, priceRange]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-shop py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('common.products')}</h1>
          <p className="text-gray-500">{filtered.length} produits disponibles</p>
        </div>
      </div>

      <div className="container-shop py-8">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !selectedCategory ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
            }`}
          >
            Tous
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => setSelectedCategory(c.slug === selectedCategory ? '' : c.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                selectedCategory === c.slug ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
              }`}
            >
              <span>{c.emoji}</span> {c.name}
            </button>
          ))}
        </div>

        {/* Sort & filter bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtres
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          >
            <option value="popular">Plus populaires</option>
            <option value="newest">Nouveautés</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="rating">Meilleures notes</option>
          </select>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filtres</h3>
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Prix: {priceRange[0]}€ - {priceRange[1]}€</label>
              <input
                type="range"
                min={0}
                max={200}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-orange-500"
              />
            </div>
          </div>
        )}

        {/* Products grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔍</p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('common.noResults')}</h3>
            <p className="text-gray-500 mb-6">Essayez de modifier vos filtres</p>
            <button onClick={() => { setSelectedCategory(''); setPriceRange([0, 200]); }} className="btn-primary">
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
