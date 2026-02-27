'use client';
import { useState } from 'react';
import { Search, Package, Check, AlertCircle, Loader2, Plus, Eye, Upload, X, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface Product {
  name: string;
  image: string;
  costPrice: number;
  sellPrice: number;
  category: string;
  description: string;
}

export default function AdminPage() {
  const [tab, setTab] = useState<'manual' | 'cj'>('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Manual add state
  const [product, setProduct] = useState<Product>({
    name: '',
    image: '',
    costPrice: 0,
    sellPrice: 0,
    category: 'Maison & Déco',
    description: '',
  });

  // CJ search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [imported, setImported] = useState<string[]>([]);
  const [margin, setMargin] = useState(2.5);

  const categories = [
    'Maison & Déco',
    'Beauté & Santé',
    'Tech & Gadgets',
    'Animaux',
    'Mode & Accessoires',
    'Sport & Loisirs',
    'Bébé & Enfants',
    'Auto & Moto',
  ];

  const saveProduct = async () => {
    if (!product.name || !product.sellPrice) {
      setError('Nom et prix de vente sont requis');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cj/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cjProductId: null,
          name: product.name,
          image: product.image,
          costPrice: product.costPrice,
          sellPrice: product.sellPrice,
          category: product.category,
          weight: 0,
          description: product.description,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSuccess(product.name + ' ajouté avec succès !');
      setProduct({ name: '', image: '', costPrice: 0, sellPrice: 0, category: 'Maison & Déco', description: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchCJ = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const res = await fetch('/api/cj/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.products || []);
      if (!data.products?.length) setError('Aucun produit trouvé');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const importCJ = async (p: any) => {
    try {
      const res = await fetch('/api/cj/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cjProductId: p.pid,
          name: p.productName,
          image: p.productImage,
          costPrice: p.sellPrice,
          sellPrice: Math.ceil(p.sellPrice * margin * 100) / 100,
          category: p.categoryName,
          weight: p.productWeight,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setImported((prev) => [...prev, p.pid]);
      setSuccess(p.productName + ' importé !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🛍️ Admin — Gestion Produits</h1>
            <p className="text-sm text-gray-500 mt-1">Ajoutez des produits à votre boutique</p>
          </div>
          <Link
            href="/fr/products"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" /> Voir la boutique
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('manual')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === 'manual'
                ? 'bg-orange-500 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-1" /> Ajouter manuellement
          </button>
          <button
            onClick={() => setTab('cj')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === 'cj'
                ? 'bg-orange-500 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Search className="w-4 h-4 inline mr-1" /> Recherche CJ API
          </button>
        </div>

        {/* Manual Add Tab */}
        {tab === 'manual' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Ajouter un produit</h2>
            <p className="text-sm text-gray-500 mb-6">
              Trouvez un produit sur{' '}
              <a href="https://cjdropshipping.com" target="_blank" className="text-orange-500 underline">
                cjdropshipping.com
              </a>
              , puis copiez les infos ici.
            </p>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
                <input
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  placeholder="Ex: Lampe Sunset Projection LED"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de l&apos;image</label>
                <div className="flex gap-3">
                  <input
                    value={product.image}
                    onChange={(e) => setProduct({ ...product, image: e.target.value })}
                    placeholder="Collez le lien de l'image du produit CJ"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {product.image && (
                    <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                      <img src={product.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Clic droit sur l&apos;image CJ → &quot;Copier l&apos;adresse de l&apos;image&quot;
                </p>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix coût CJ ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={product.costPrice || ''}
                    onChange={(e) => setProduct({ ...product, costPrice: Number(e.target.value) })}
                    placeholder="Ex: 8.50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix de vente (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={product.sellPrice || ''}
                    onChange={(e) => setProduct({ ...product, sellPrice: Number(e.target.value) })}
                    placeholder="Ex: 24.99"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Profit preview */}
              {product.costPrice > 0 && product.sellPrice > 0 && (
                <div className="bg-green-50 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm text-green-700">Profit estimé par vente :</span>
                  <span className="font-bold text-green-700">
                    +{(product.sellPrice - product.costPrice).toFixed(2)} € ({((product.sellPrice / product.costPrice - 1) * 100).toFixed(0)}% marge)
                  </span>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  value={product.category}
                  onChange={(e) => setProduct({ ...product, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={product.description}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  placeholder="Description courte du produit..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Submit */}
              <button
                onClick={saveProduct}
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" /> Ajouter le produit
                  </>
                )}
              </button>
            </div>

            {/* Help section */}
            <div className="mt-8 bg-orange-50 rounded-xl p-5">
              <h3 className="font-semibold text-orange-900 mb-2">💡 Comment trouver des produits ?</h3>
              <ol className="text-sm text-orange-800 space-y-2">
                <li>1. Allez sur <a href="https://cjdropshipping.com" target="_blank" className="underline font-medium">cjdropshipping.com</a></li>
                <li>2. Cherchez un produit (ex: &quot;sunset lamp&quot;, &quot;galaxy projector&quot;)</li>
                <li>3. Notez le prix CJ (coût) et choisissez votre prix de vente (2-3x le coût)</li>
                <li>4. Clic droit sur l&apos;image → &quot;Copier l&apos;adresse de l&apos;image&quot;</li>
                <li>5. Collez tout ici et cliquez &quot;Ajouter&quot;</li>
              </ol>
            </div>
          </div>
        )}

        {/* CJ API Tab */}
        {tab === 'cj' && (
          <div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note :</strong> La recherche CJ nécessite une API Key. Si vous n&apos;avez pas encore de clé,
                utilisez l&apos;onglet &quot;Ajouter manuellement&quot; ci-dessus.
              </p>
            </div>

            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchCJ()}
                  placeholder="Rechercher un produit CJ..."
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button
                onClick={searchCJ}
                disabled={loading}
                className="bg-orange-500 text-white px-6 py-3.5 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Rechercher'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {['sunset lamp', 'galaxy projector', 'bluetooth earbuds', 'LED face mask', 'posture corrector', 'ring light'].map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-orange-300 hover:text-orange-600"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 text-sm">Marge : <span className="text-orange-600">x{margin.toFixed(1)}</span></p>
              </div>
              <input type="range" min={1.5} max={5} step={0.1} value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-48 accent-orange-500" />
            </div>

            {results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((p) => {
                  const sell = Math.ceil(p.sellPrice * margin * 100) / 100;
                  const done = imported.includes(p.pid);
                  return (
                    <div key={p.pid} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md">
                      <div className="h-48 bg-gray-100 flex items-center justify-center">
                        {p.productImage ? <img src={p.productImage} alt="" className="h-full w-full object-contain" /> : <Package className="w-12 h-12 text-gray-300" />}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-3">{p.productName}</h3>
                        <div className="grid grid-cols-3 gap-2 text-center mb-3">
                          <div className="bg-gray-50 rounded-lg p-2"><p className="text-[10px] text-gray-500">Coût</p><p className="font-bold text-sm">${p.sellPrice?.toFixed(2)}</p></div>
                          <div className="bg-orange-50 rounded-lg p-2"><p className="text-[10px] text-orange-600">Vente</p><p className="font-bold text-orange-600 text-sm">{sell.toFixed(2)}€</p></div>
                          <div className="bg-green-50 rounded-lg p-2"><p className="text-[10px] text-green-600">Profit</p><p className="font-bold text-green-600 text-sm">+{(sell - p.sellPrice).toFixed(2)}€</p></div>
                        </div>
                        <button
                          onClick={() => importCJ(p)}
                          disabled={done}
                          className={`w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${done ? 'bg-green-100 text-green-700' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                        >
                          {done ? <><Check className="w-4 h-4" /> Importé</> : <><Plus className="w-4 h-4" /> Importer</>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">Recherchez des produits CJ</h3>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
