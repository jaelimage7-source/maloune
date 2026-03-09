'use client';
import { useState } from 'react';
import { Tag, Loader2, Check, X } from 'lucide-react';

interface CouponResult { valid: boolean; code?: string; discount?: number; description?: string; error?: string; }

export default function CouponInput({ subtotal, onApply }: { subtotal: number; onApply: (discount: number, code: string) => void }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [result, setResult] = useState<CouponResult | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/coupon', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, subtotal }) });
      const data: CouponResult = await res.json();
      setResult(data);
      if (data.valid && data.discount) {
        setStatus('valid');
        onApply(data.discount, data.code || code);
      } else {
        setStatus('invalid');
      }
    } catch {
      setStatus('invalid');
      setResult({ valid: false, error: 'Erreur de connexion' });
    }
  };

  const handleRemove = () => {
    setCode(''); setStatus('idle'); setResult(null); onApply(0, '');
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={code} onChange={e => { setCode(e.target.value.toUpperCase()); if (status !== 'idle') { setStatus('idle'); setResult(null); } }}
            placeholder="Code promo" disabled={status === 'valid'}
            className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm font-medium transition-colors ${status === 'valid' ? 'border-green-300 bg-green-50 text-green-700' : status === 'invalid' ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-orange-500/20`} />
        </div>
        {status === 'valid' ? (
          <button onClick={handleRemove} className="px-3 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleApply} disabled={!code.trim() || status === 'loading'}
            className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
            {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Appliquer'}
          </button>
        )}
      </div>
      {result && (
        <div className={`flex items-center gap-2 text-xs ${result.valid ? 'text-green-600' : 'text-red-500'}`}>
          {result.valid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          {result.valid ? result.description : result.error}
          {result.valid && result.discount ? ` (-${result.discount.toFixed(2)} EUR)` : ''}
        </div>
      )}
    </div>
  );
}

