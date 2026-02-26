'use client';

import { useState } from 'react';
import { Search, Package, RefreshCw, Check, AlertCircle, Loader2, Plus, Eye } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface CJProduct {
  pid: string;
  productName: string;
  productImage: string;
  sellPrice: number;
  categoryName: string;
  productWeight: number;
}

export default function AdminPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CJProduct[]>([]);
  const [imported, setImported] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [margin, setMargin] = useState(2.5);

  const searchProducts = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(''); setResults([]);
    try {
      const res = await fetch('/api/cj/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, page: 1, limit: 20 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.products || []);
      if (!data.products?.length) setError('Aucun produit trouvé.');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const importProduct = async (product: CJProduct) => {
    try {
      const res = await fetch('/api/cj/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cjProductId: product.pid,
          name: product.productName,
          image: product.productImage,
          costPrice: product.sellPrice,
          sellPrice: Math.ceil(product.sellPrice * margin * 100) / 100,
          category: product.categoryName,
          weight: product.productWeight,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setImported(prev => [...prev, product.pid]);
      setSuccess(`"${product.productName}" importé !`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); setTimeout(() => setError(''), 3000); }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container-shop py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin — Produits CJ</h1>
            <p className="text-sm text-gray-500 mt-1">Recherchez et importez des produits</p>
          </div>
          <Link href="/" className="btn-outline text-sm"><Eye className="w-4 h-4 mr-1" /> Boutique</Link>
        </div>
      </div>
      <div className="container-shop py-6">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2"><Check className="w-4 h-4" />{success}</div>}

        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchProducts()} placeholder="Rechercher (ex: sunset lamp, earbuds, pet tracker...)" className="input pl-12 py-3.5" />
          </div>
          <button onClick={searchProducts} disabled={loading} className="btn-primary px-6">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Rechercher'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {['sunset lamp','galaxy projector','bluetooth earbuds','pet GPS tracker','LED mask','posture corrector','wireless straightener','phone projector'].map(s => (
            <button key={s} onClick={() => setQuery(s)} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-orange-300 hover:text-orange-600">{s}</button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center justify-between">
          <div><p className="font-medium text-gray-900 text-sm">Marge: x{margin.toFixed(1)}</p><p className="text-xs text-gray-500">Multiplicateur prix CJ</p></div>
          <input type="range" min={1.5} max={5} step={0.1} value={margin} onChange={e => setMargin(Number(e.target.value))} className="w-40 accent-orange-500" />
        </div>

        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map(product => {
              const isImported = imported.includes(product.pid);
              const sell = Math.ceil(product.sellPrice * margin * 100) / 100;
              return (
                <div key={product.pid} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {product.productImage ? <img src={product.productImage} alt="" className="h-full w-full object-contain" /> : <Package className="w-12 h-12 text-gray-300" />}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">{product.productName}</h3>
                    <p className="text-xs text-gray-500 mb-3">{product.categoryName}</p>
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div className="bg-gray-50 rounded-lg p-2"><p className="text-[10px] text-gray-500">Coût</p><p className="font-bold text-sm">{product.sellPrice?.toFixed(2)}$</p></div>
                      <div className="bg-orange-50 rounded-lg p-2"><p className="text-[10px] text-orange-600">Vente</p><p className="font-bold text-orange-600 text-sm">{sell.toFixed(2)}€</p></div>
                      <div className="bg-green-50 rounded-lg p-2"><p className="text-[10px] text-green-600">Profit</p><p className="font-bold text-green-600 text-sm">+{(sell - product.sellPrice).toFixed(2)}€</p></div>
                    </div>
                    <button onClick={() => importProduct(product)} disabled={isImported} className={`w-full py-2.5 rounded-lg text-sm font-medium ${isImported ? 'bg-green-100 text-green-700' : 'bg-orange-500 text-white hover:bg-orange-600'}`}>
                      {isImported ? <><Check className="w-4 h-4 inline mr-1" />Importé</> : <><Plus className="w-4 h-4 inline mr-1" />Importer</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!loading && results.length === 0 && !error && (
          <div className="text-center py-16"><Search className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">Recherchez des produits CJ</h3><p className="text-gray-500">Tapez un mot-clé ci-dessus</p></div>
        )}
      </div>
    </main>
  );
}
