'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Star, Truck, Shield, Headphones, RotateCcw, Sparkles } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { PRODUCTS, CATEGORIES } from '@/lib/products';

export default function HomePage() {
  const t = useTranslations();
  const featuredProducts = PRODUCTS.filter((p) => p.tag).slice(0, 4);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 min-h-[80vh] flex items-center">
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
        <div className="container-shop relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-full px-4 py-2 mb-8 shadow-sm">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700">Nouvelle collection disponible</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6">
              {t('home.hero.title')}
              <span className="block mt-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                Maloune
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-xl mx-auto leading-relaxed">
              {t('home.hero.subtitle')}
            </p>
            <Link
              href="/products"
              className="btn-primary text-base px-8 py-4 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all inline-flex items-center"
            >
              {t('home.hero.cta')}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="container-shop">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: t('home.guarantees.shipping'), desc: t('home.guarantees.shippingDesc'), color: 'bg-blue-50 text-blue-600' },
              { icon: Shield, title: t('home.guarantees.secure'), desc: t('home.guarantees.secureDesc'), color: 'bg-green-50 text-green-600' },
              { icon: Headphones, title: t('home.guarantees.support'), desc: t('home.guarantees.supportDesc'), color: 'bg-purple-50 text-purple-600' },
              { icon: RotateCcw, title: t('home.guarantees.returns'), desc: t('home.guarantees.returnsDesc'), color: 'bg-amber-50 text-amber-600' },
            ].map((g, i) => (
              <div key={i} className="flex flex-col items-center text-center p-5 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className={`w-12 h-12 rounded-xl ${g.color} flex items-center justify-center mb-3`}>
                  <g.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{g.title}</h3>
                <p className="text-xs text-gray-500">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
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
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container-shop">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">{t('home.categories.title')}</h2>
            <p className="text-gray-500">{t('home.categories.subtitle')}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map((c, i) => (
              <Link key={i} href={`/products?cat=${c.slug}`}>
                <div className="group relative overflow-hidden rounded-2xl cursor-pointer h-48 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-6">
                    <span className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">{c.emoji}</span>
                    <h3 className="font-bold text-lg">{c.name}</h3>
                    <p className="text-white/70 text-sm mt-1">{c.count} produits</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Products Preview */}
      <section className="py-16 bg-gray-50/50">
        <div className="container-shop">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Tous nos produits</h2>
            <Link href="/products" className="text-orange-500 font-medium text-sm hover:text-orange-600 flex items-center gap-1">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {PRODUCTS.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="container-shop relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">{t('home.newsletter.title')}</h2>
            <p className="text-gray-400 text-lg mb-8">{t('home.newsletter.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                placeholder={t('home.newsletter.placeholder')}
                className="flex-1 rounded-xl bg-white/10 border border-white/20 px-5 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
              <button className="btn-primary px-6 py-3.5 whitespace-nowrap">{t('home.newsletter.cta')}</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
