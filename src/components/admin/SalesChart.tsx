'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

interface ChartData { date: string; revenue: number; orders: number; }

export default function SalesChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/stats/chart?days=${days}`)
      .then(r => r.json())
      .then(j => { if (j.success) setData(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [days]);

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const formatEuro = (v: number) => `${v.toFixed(0)}€`;

  if (loading) return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="h-48 bg-gray-100 rounded" />
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-gray-900">Évolution des ventes</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {[7, 14, 30].map(d => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${days === d ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {d}j
              </button>
            ))}
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setChartType('area')} className={`px-2 py-1 text-xs rounded-md transition ${chartType === 'area' ? 'bg-white shadow-sm' : ''}`}>Ligne</button>
            <button onClick={() => setChartType('bar')} className={`px-2 py-1 text-xs rounded-md transition ${chartType === 'bar' ? 'bg-white shadow-sm' : ''}`}>Barres</button>
          </div>
        </div>
      </div>

      <div className="flex gap-6 mb-4">
        <div>
          <p className="text-xs text-gray-400">Revenu ({days}j)</p>
          <p className="text-lg font-bold text-green-600">{totalRevenue.toFixed(2)}€</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Commandes ({days}j)</p>
          <p className="text-lg font-bold text-blue-600">{totalOrders}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Moy/jour</p>
          <p className="text-lg font-bold text-orange-600">{(totalRevenue / days).toFixed(2)}€</p>
        </div>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <YAxis tickFormatter={formatEuro} tick={{ fontSize: 10 }} stroke="#9ca3af" width={50} />
              <Tooltip formatter={((v: any) => [`${Number(v).toFixed(2)}€`, 'Revenu']) as any} labelFormatter={formatDate as any}
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fill="url(#colorRevenue)" />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <YAxis tickFormatter={formatEuro} tick={{ fontSize: 10 }} stroke="#9ca3af" width={50} />
              <Tooltip formatter={((v: any) => [`${Number(v).toFixed(2)}€`, 'Revenu']) as any} labelFormatter={formatDate as any}
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

