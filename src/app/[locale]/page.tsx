'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Star, Truck, Shield, Headphones, RotateCcw, Sparkles, ChevronLeft, ChevronRight, Loader2, ShoppingBag } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';

interface Product {
  id: string; slug: string; name: string; description: string;
  price: number; comparePrice?: number; image: string; images: string[];
  category: string; categorySlug: string; rating: number; reviewCount: number;
  inStock: boolean; tag?: string;
}
interface Category { name: string; slug: string; }

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroTransition, setHeroTransition] = useState(true);

  useEffect(() => {
    fetch(`/api/products?locale=${locale}`)
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setCategories(d.categories || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [locale]);

  // Auto-rotate hero products
  const heroProducts = products.slice(0, 6);
  const nextHero = useCallback(() => {
    if (heroProducts.length === 0) return;
    setHeroTransition(false);
    setTimeout(() => {
      setHeroIndex(i => (i + 1) % heroProducts.length);
      setHeroTransition(true);
    }, 150);
  }, [heroProducts.length]);

  const prevHero = useCallback(() => {
    if (heroProducts.length === 0) return;
    setHeroTransition(false);
    setTimeout(() => {
      setHeroIndex(i => (i - 1 + heroProducts.length) % heroProducts.length);
      setHeroTransition(true);
    }, 150);
  }, [heroProducts.length]);

  useEffect(() => {
    if (heroProducts.length === 0) return;
    const interval = setInterval(nextHero, 4000);
    return () => clearInterval(interval);
  }, [heroProducts.length, nextHero]);

  const currentHero = heroProducts[heroIndex];

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">{t('common.loading')}</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* ========== HERO WITH ANIMATED PRODUCTS ========== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 min-h-[85vh] flex items-center">
        {/* Background decorations */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-100/20 rounded-full blur-3xl" />

        <div className="container-shop relative z-10 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Text */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-full px-4 py-2 mb-6 shadow-sm">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">{t('home.hero.title')}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-5">
                {t('home.hero.subtitle')}
                <span className="block mt-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                  Maloune
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
                {t('home.guarantees.shippingDesc')} • {t('home.guarantees.secureDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/products"
                  className="btn-primary text-base px-8 py-4 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all inline-flex items-center justify-center">
                  {t('home.hero.cta')} <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>

              {/* Mini stats */}
              <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{products.length}+</p>
                  <p className="text-xs text-gray-500">{t('common.products')}</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">16</p>
                  <p className="text-xs text-gray-500">Langues</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-2xl font-bold text-gray-900">4.8</span>
                  </div>
                  <p className="text-xs text-gray-500">{t('product.reviews')}</p>
                </div>
              </div>
            </div>

            {/* Right: Animated Product Showcase */}
            <div className="relative order-1 lg:order-2 flex justify-center">
              {currentHero && (
                <div className="relative w-full max-w-md">
                  {/* Main product card */}
                  <div className={`relative bg-white rounded-3xl shadow-2xl shadow-orange-200/50 overflow-hidden transition-all duration-500 ${heroTransition ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
                    {/* Product image */}
                    <div className="relative h-72 sm:h-80 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center overflow-hidden">
                      {currentHero.image?.startsWith('http') ? (
                        <img src={currentHero.image} alt={currentHero.name}
                          className="w-full h-full object-contain p-6 hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <span className="text-8xl">{currentHero.image || '📦'}</span>
                      )}
                      {currentHero.comparePrice && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                          -{Math.round(((currentHero.comparePrice - currentHero.price) / currentHero.comparePrice) * 100)}%
                        </div>
                      )}
                    </div>

                    {/* Product info */}
                    <div className="p-5">
                      <p className="text-xs font-medium text-orange-500 uppercase tracking-wider mb-1">{currentHero.category}</p>
                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{currentHero.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-900">{currentHero.price.toFixed(2)} €</span>
                          {currentHero.comparePrice && (
                            <span className="text-sm text-gray-400 line-through">{currentHero.comparePrice.toFixed(2)} €</span>
                          )}
                        </div>
                        <Link href={`/products/${currentHero.slug}`}
                          className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-xl transition-colors shadow-lg shadow-orange-500/25">
                          <ShoppingBag className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Navigation arrows */}
                  {heroProducts.length > 1 && (
                    <>
                      <button onClick={prevHero}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-50 transition-colors z-10">
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                      </button>
                      <button onClick={nextHero}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-50 transition-colors z-10">
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                      </button>
                    </>
                  )}

                  {/* Dots indicator */}
                  {heroProducts.length > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-5">
                      {heroProducts.map((_, i) => (
                        <button key={i} onClick={() => { setHeroTransition(false); setTimeout(() => { setHeroIndex(i); setHeroTransition(true); }, 150); }}
                          className={`transition-all duration-300 rounded-full ${i === heroIndex ? 'w-8 h-2.5 bg-orange-500' : 'w-2.5 h-2.5 bg-gray-300 hover:bg-orange-300'}`} />
                      ))}
                    </div>
                  )}

                  {/* Floating mini cards (background decoration) */}
                  {heroProducts.length > 2 && (
                    <>
                      <div className="hidden lg:block absolute -left-16 top-8 w-20 h-20 bg-white rounded-2xl shadow-lg p-2 opacity-60 -rotate-6 animate-bounce" style={{ animationDuration: '3s' }}>
                        {heroProducts[(heroIndex + 1) % heroProducts.length]?.image?.startsWith('http') ? (
                          <img src={heroProducts[(heroIndex + 1) % heroProducts.length].image} alt="" className="w-full h-full object-contain rounded-xl" />
                        ) : <span className="text-3xl flex items-center justify-center h-full">📦</span>}
                      </div>
                      <div className="hidden lg:block absolute -right-12 bottom-24 w-16 h-16 bg-white rounded-2xl shadow-lg p-2 opacity-40 rotate-12 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                        {heroProducts[(heroIndex + 2) % heroProducts.length]?.image?.startsWith('http') ? (
                          <img src={heroProducts[(heroIndex + 2) % heroProducts.length].image} alt="" className="w-full h-full object-contain rounded-xl" />
                        ) : <span className="text-2xl flex items-center justify-center h-full">📦</span>}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========== GUARANTEES ========== */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container-shop">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Truck, title: t('home.guarantees.shipping'), desc: t('home.guarantees.shippingDesc'), color: 'bg-blue-50 text-blue-600' },
              { icon: Shield, title: t('home.guarantees.secure'), desc: t('home.guarantees.secureDesc'), color: 'bg-green-50 text-green-600' },
              { icon: Headphones, title: t('home.guarantees.support'), desc: t('home.guarantees.supportDesc'), color: 'bg-purple-50 text-purple-600' },
              { icon: RotateCcw, title: t('home.guarantees.returns'), desc: t('home.guarantees.returnsDesc'), color: 'bg-amber-50 text-amber-600' },
            ].map((g, i) => (
              <div key={i} className="flex flex-col items-center text-center p-5 rounded-2xl hover:bg-gray-50 transition-colors group">
                <div className={`w-12 h-12 rounded-xl ${g.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <g.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{g.title}</h3>
                <p className="text-xs text-gray-500">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURED PRODUCTS ========== */}
      {products.length > 0 && (
        <section className="py-16 bg-gray-50/50">
          <div className="container-shop">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">{t('home.featured.title')}</h2>
                <p className="text-gray-500">{t('home.featured.subtitle')}</p>
              </div>
              <Link href="/products" className="text-orange-500 font-medium text-sm hover:text-orange-600 flex items-center gap-1">
                {t('common.seeAll')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {products.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== CATEGORIES ========== */}
      {categories.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-shop">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">{t('home.categories.title')}</h2>
              <p className="text-gray-500">{t('home.categories.subtitle')}</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {categories.slice(0, 8).map((c, i) => {
                const colors = [
                  'from-orange-400 to-amber-500', 'from-blue-400 to-indigo-500',
                  'from-emerald-400 to-teal-500', 'from-purple-400 to-violet-500',
                  'from-rose-400 to-pink-500', 'from-cyan-400 to-blue-500',
                  'from-amber-400 to-orange-500', 'from-indigo-400 to-purple-500',
                ];
                const emojis = ['🏷️', '💡', '🎨', '🏠', '⚡', '🎯', '✨', '🌟'];
                return (
                  <Link key={i} href={`/products?cat=${c.slug}`}>
                    <div className="group relative overflow-hidden rounded-2xl cursor-pointer h-40 shadow-sm hover:shadow-xl transition-all duration-300">
                      <div className={`absolute inset-0 bg-gradient-to-br ${colors[i % colors.length]} opacity-90 group-hover:opacity-100 transition-opacity`} />
                      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-6">
                        <span className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">{emojis[i % emojis.length]}</span>
                        <h3 className="font-bold text-base text-center">{c.name}</h3>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ========== ALL PRODUCTS ========== */}
      {products.length > 4 && (
        <section className="py-16 bg-gray-50/50">
          <div className="container-shop">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold text-gray-900">{t('common.products')}</h2>
              <Link href="/products" className="text-orange-500 font-medium text-sm hover:text-orange-600 flex items-center gap-1">
                {t('common.seeAll')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.slice(4, 12).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== NEWSLETTER ========== */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="container-shop relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">{t('home.newsletter.title')}</h2>
            <p className="text-gray-400 text-lg mb-8">{t('home.newsletter.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input type="email" placeholder={t('home.newsletter.placeholder')}
                className="flex-1 rounded-xl bg-white/10 border border-white/20 px-5 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
              <button className="btn-primary px-6 py-3.5 whitespace-nowrap">{t('home.newsletter.cta')}</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
