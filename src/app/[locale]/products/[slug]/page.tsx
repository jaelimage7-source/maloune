'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Star, Minus, Plus, ShoppingBag, Truck, Shield, RotateCcw, Check, Loader2 } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import ProductCard from '@/components/products/ProductCard';

interface Variant {
  id: number;
  variantId: number;
  name: string;
  price: number;
  sku: string;
  image: string;
}

interface Product {
  id: string; slug: string; name: string; description: string;
  price: number; comparePrice?: number; image: string; images: string[];
  category: string; categorySlug: string; rating: number; reviewCount: number;
  inStock: boolean; tag?: string; isPrintful?: boolean;
  variants?: Variant[]; sizes?: string[]; colors?: string[];
}

export default function ProductDetailPage() {
  const t = useTranslations();
  const locale = useLocale();
  const params = useParams();
  const slug = params.slug as string;
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setActiveImage(0);
    setQuantity(1);
    setSelectedVariant(null);
    setSelectedSize('');
    setSelectedColor('');

    fetch(`/api/products/${slug}?locale=${locale}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => {
        if (data.product) {
          setProduct(data.product);
          setRelated(data.related || []);
          // Auto-select first variant
          if (data.product.variants?.length > 0) {
            setSelectedVariant(data.product.variants[0]);
          }
        } else {
          setNotFound(true);
        }
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug, locale]);

  // Parse variants to extract sizes and colors
  const { sizes, colors } = useMemo(() => {
    if (!product?.variants || product.variants.length <= 1) {
      return { sizes: [] as string[], colors: [] as string[] };
    }

    const sizeSet = new Set<string>();
    const colorSet = new Set<string>();

    product.variants.forEach(v => {
      // Parse "Product Name / Color / Size" or "Product Name / Size"
      const parts = v.name.split('/').map(p => p.trim());
      if (parts.length >= 3) {
        colorSet.add(parts[parts.length - 2]);
        sizeSet.add(parts[parts.length - 1]);
      } else if (parts.length === 2) {
        sizeSet.add(parts[parts.length - 1]);
      }
    });

    return {
      sizes: Array.from(sizeSet),
      colors: Array.from(colorSet),
    };
  }, [product?.variants]);

  // Find matching variant when size/color changes
  useEffect(() => {
    if (!product?.variants || product.variants.length <= 1) return;

    const match = product.variants.find(v => {
      const name = v.name.toLowerCase();
      const sizeMatch = !selectedSize || name.includes(selectedSize.toLowerCase());
      const colorMatch = !selectedColor || name.includes(selectedColor.toLowerCase());
      return sizeMatch && colorMatch;
    });

    if (match) {
      setSelectedVariant(match);
      if (match.image) {
        const imgIdx = allImages.findIndex(img => img === match.image);
        if (imgIdx >= 0) setActiveImage(imgIdx);
      }
    }
  }, [selectedSize, selectedColor]);

  // Auto-select first size/color
  useEffect(() => {
    if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0]);
    if (colors.length > 0 && !selectedColor) setSelectedColor(colors[0]);
  }, [sizes, colors]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </main>
    );
  }

  if (notFound || !product) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">😕</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit introuvable</h1>
          <Link href="/products" className="btn-primary">Voir tous les produits</Link>
        </div>
      </main>
    );
  }

  const currentPrice = selectedVariant?.price || product.price;
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - currentPrice) / product.comparePrice) * 100)
    : 0;

  // Collect all unique images
  const productImages = product.images?.length > 0 ? product.images : [product.image];
  const variantImages = (product.variants || [])
    .map(v => v.image)
    .filter(img => img && !productImages.includes(img));
  const allImages = [...productImages, ...variantImages].filter(Boolean);

  const handleAddToCart = () => {
    addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      productId: product.id,
      name: selectedVariant ? `${product.name} - ${selectedSize || ''} ${selectedColor || ''}`.trim() : product.name,
      price: currentPrice,
      comparePrice: product.comparePrice,
      image: selectedVariant?.image || product.image,
      maxQuantity: 10,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container-shop py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-500">{t('common.home')}</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-orange-500">{t('common.products')}</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container-shop py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl h-80 sm:h-[450px] flex items-center justify-center mb-4 overflow-hidden">
              {allImages[activeImage]?.startsWith('http') ? (
                <img src={allImages[activeImage]} alt={product.name} className="w-full h-full object-contain p-4" />
              ) : (
                <span className="text-[120px] sm:text-[160px]">{allImages[activeImage] || '📦'}</span>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden transition-all ${
                      activeImage === i ? 'ring-2 ring-orange-500 bg-orange-50' : 'bg-gray-50 hover:bg-orange-50'
                    }`}>
                    {img?.startsWith('http') ? (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">{img || '📦'}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.category && (
              <span className="inline-block bg-orange-100 text-orange-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
                {product.category}
              </span>
            )}
            {product.tag && (
              <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full mb-3 ml-2">
                {product.tag}
              </span>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className={`w-4 h-4 ${j < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500">{product.rating} ({product.reviewCount} {t('product.reviews')})</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">{currentPrice.toFixed(2)} €</span>
              {product.comparePrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">{product.comparePrice.toFixed(2)} €</span>
                  <span className="bg-red-100 text-red-600 text-sm font-medium px-2 py-0.5 rounded-full">-{discount}%</span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {/* ===== VARIANT SELECTORS ===== */}
            {colors.length > 0 && (
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Couleur : <span className="text-orange-500">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                        selectedColor === color
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Taille : <span className="text-orange-500">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                        selectedSize === size
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variant count info */}
            {product.variants && product.variants.length > 1 && (
              <p className="text-sm text-gray-500 mb-4">
                {product.variants.length} variantes disponibles
              </p>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-200 rounded-xl">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50 rounded-l-xl">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-semibold text-gray-900 min-w-[40px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="p-3 hover:bg-gray-50 rounded-r-xl">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button onClick={handleAddToCart} disabled={!product.inStock}
                className={`flex-1 btn-primary py-3.5 flex items-center justify-center gap-2 ${added ? 'bg-green-500 hover:bg-green-600' : ''}`}>
                {added ? (
                  <><Check className="w-5 h-5" /> {t('common.addToCart')} ✓</>
                ) : (
                  <><ShoppingBag className="w-5 h-5" /> {t('common.addToCart')}</>
                )}
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, text: t('home.guarantees.shipping') },
                { icon: Shield, text: t('home.guarantees.secure') },
                { icon: RotateCcw, text: t('home.guarantees.returns') },
              ].map((g, i) => (
                <div key={i} className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl">
                  <g.icon className="w-4 h-4 text-orange-500 mb-1" />
                  <span className="text-xs text-gray-600">{g.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('product.relatedProducts')}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
