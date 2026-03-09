'use client';
import { useState, useEffect } from 'react';
import { AlertTriangle, Package, XCircle, RefreshCw } from 'lucide-react';

interface Alert { id: number; variantName: string; productName: string; sku: string | null; stock: number; isOutOfStock: boolean; }

export default function StockAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, outOfStock: 0, lowStock: 0 });

  const fetchAlerts = () => {
    setLoading(true);
    fetch('/api/admin/stock?threshold=5')
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          setAlerts(j.alerts);
          setStats({ total: j.total, outOfStock: j.outOfStock, lowStock: j.lowStock });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAlerts(); }, []);

  if (loading) return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="space-y-2">
        <div className="h-10 bg-gray-100 rounded" />
        <div className="h-10 bg-gray-100 rounded" />
      </div>
    </div>
  );

  if (alerts.length === 0) return (
    <div className="bg-white rounded-xl border border-green-200 p-6">
      <div className="flex items-center gap-2 text-green-600">
        <Package className="w-5 h-5" />
        <h3 className="font-semibold">Stock OK</h3>
      </div>
      <p className="text-sm text-gray-500 mt-1">Tous les produits ont un stock suffisant.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-orange-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-gray-900">Alertes stock</h3>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">{stats.total}</span>
        </div>
        <button onClick={fetchAlerts} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {stats.outOfStock > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">{stats.outOfStock} produit{stats.outOfStock > 1 ? 's' : ''} en rupture de stock</p>
        </div>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {alerts.slice(0, 10).map(a => (
          <div key={a.id} className={`flex items-center justify-between p-2.5 rounded-lg ${a.isOutOfStock ? 'bg-red-50' : 'bg-yellow-50'}`}>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{a.productName}</p>
              <p className="text-xs text-gray-500">{a.variantName}{a.sku ? ` · ${a.sku}` : ''}</p>
            </div>
            <span className={`text-sm font-bold ml-3 ${a.isOutOfStock ? 'text-red-600' : 'text-yellow-600'}`}>
              {a.stock}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

