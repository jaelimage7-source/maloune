'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';

interface SearchResult {
  id: string; slug: string; name: string; price: number; image: string; category: string;
}

export default function SearchBar() {
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?locale=${locale}&search=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults((data.products || []).slice(0, 6));
      } catch { setResults([]); }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, locale]);

  const isUrl = (s: string) => s?.startsWith('http');

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2 w-48 lg:w-64 focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:bg-white focus-within:border-orange-300 border border-transparent transition-all">
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input type="text" value={query} onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Rechercher..." className="bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none w-full" />
        {query && <button onClick={() => { setQuery(''); setResults([]); setOpen(false); }}><X className="w-3.5 h-3.5 text-gray-400" /></button>}
      </div>
      {open && query.length >= 2 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 min-w-[300px]">
          {loading ? (
            <div className="p-6 text-center"><Loader2 className="w-5 h-5 animate-spin text-orange-500 mx-auto" /></div>
          ) : results.length > 0 ? (
            <div>
              {results.map(p => (
                <Link key={p.id} href={`/products/${p.slug}`} onClick={() => { setOpen(false); setQuery(''); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {isUrl(p.image) ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <span className="text-lg flex items-center justify-center h-full">{p.image || '📦'}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.category}</p>
                  </div>
                  <span className="text-sm font-semibold text-orange-600">{p.price.toFixed(2)} EUR</span>
                </Link>
              ))}
              <Link href={`/products?search=${encodeURIComponent(query)}`} onClick={() => setOpen(false)}
                className="block text-center text-sm text-orange-600 font-medium py-3 border-t border-gray-100 hover:bg-orange-50">
                Voir tous les résultats
              </Link>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-gray-500">Aucun résultat pour &quot;{query}&quot;</div>
          )}
        </div>
      )}
    </div>
  );
}

