"use client";
// Admin Dashboard Component
import AdminGuard from "@/components/auth/AdminGuard";
import { useState, useEffect, useCallback } from "react";
import {
  BarChart3, Package, Users, ShoppingCart, TrendingUp, Clock, CheckCircle,
  Truck, XCircle, Search, ChevronRight, RefreshCw, Loader2, Plus, Eye,
  Upload, X, Image as ImageIcon, Edit, DollarSign, AlertCircle, Check, Send
} from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "Payée", color: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "Préparation", color: "bg-purple-100 text-purple-700" },
  SHIPPED: { label: "Expédiée", color: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "Livrée", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Annulée", color: "bg-red-100 text-red-700" },
  REFUNDED: { label: "Remboursée", color: "bg-gray-100 text-gray-700" },
};

function StatCard({ icon: Icon, label, value, sub, color, onClick }: { icon: any; label: string; value: string; sub?: string; color: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`bg-white rounded-xl border border-gray-100 p-4 ${onClick ? "cursor-pointer hover:shadow-md hover:border-orange-200 transition" : ""}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [tab, setTab] = useState<"dashboard" | "orders" | "customers" | "products">("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [customers, setCustomers] = useState<any[]>([]);
  const [orderEmails, setOrderEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editTracking, setEditTracking] = useState("");
  const [editCarrier, setEditCarrier] = useState("");
  const [editNote, setEditNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [cjOrdering, setCjOrdering] = useState(false);
  const [cjMsg, setCjMsg] = useState("");
  const [resendMsg, setResendMsg] = useState("");

  // Products state (keep existing)
  const [prodTab, setProdTab] = useState<"manual" | "cj">("manual");
  const [product, setProduct] = useState({ name: "", image: "", costPrice: 0, sellPrice: 0, category: "Maison & Déco", description: "" });
  const [prodLoading, setProdLoading] = useState(false);
  const [prodError, setProdError] = useState("");
  const [prodSuccess, setProdSuccess] = useState("");
  const [cjQuery, setCjQuery] = useState("");
  const [cjResults, setCjResults] = useState<any[]>([]);
  const [cjImported, setCjImported] = useState<string[]>([]);
  const [cjMargin, setCjMargin] = useState(2.5);

  const categories = ["Maison & Déco", "Beauté & Santé", "Tech & Gadgets", "Animaux", "Mode & Accessoires", "Sport & Loisirs", "Bébé & Enfants", "Auto & Moto"];

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) setStats(await res.json());
    } catch { /* */ }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("limit", "50");
      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setOrderTotal(data.total || 0);
      }
    } catch { /* */ }
    setLoading(false);
  }, [statusFilter, search]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/customers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        setOrderEmails(data.orderEmails || []);
      }
    } catch { /* */ }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (tab === "orders") fetchOrders(); }, [tab, fetchOrders]);
  useEffect(() => { if (tab === "customers") fetchCustomers(); }, [tab, fetchCustomers]);

  const updateOrder = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      const body: any = { orderId: selectedOrder.id };
      if (editStatus && editStatus !== selectedOrder.status) body.status = editStatus;
      if (editTracking) { body.trackingNumber = editTracking; body.carrierName = editCarrier; }
      if (editNote) body.internalNote = editNote;
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch { /* */ }
    setSaving(false);
  };

  const resendEmail = async (orderId: string) => {
    setResending(true);
    setResendMsg("");
    try {
      const res = await fetch("/api/admin/orders/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setResendMsg("Email envoye !");
      } else {
        setResendMsg("Ere: " + (data.error || "echwe"));
      }
    } catch {
      setResendMsg("Ere rezo");
    }
    setResending(false);
    setTimeout(() => setResendMsg(""), 4000);
  };

  const orderOnCJ = async (orderId: string) => {
    setCjOrdering(true);
    setCjMsg("");
    try {
      const res = await fetch("/api/admin/orders/cj-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setCjMsg("CJ commande kreye: " + (data.cjOrderNum || "OK"));
        fetchOrders();
      } else {
        setCjMsg(data.error || "Echwe");
      }
    } catch {
      setCjMsg("Ere rezo");
    }
    setCjOrdering(false);
    setTimeout(() => setCjMsg(""), 6000);
  };

  const saveProduct = async () => {
    if (!product.name || !product.sellPrice) { setProdError("Nom et prix requis"); return; }
    setProdLoading(true); setProdError(""); setProdSuccess("");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        setProdSuccess("Produit ajouté");
        setProduct({ name: "", image: "", costPrice: 0, sellPrice: 0, category: "Maison & Déco", description: "" });
      } else setProdError("Erreur");
    } catch { setProdError("Erreur réseau"); }
    setProdLoading(false);
  };

  const searchCj = async () => {
    if (!cjQuery) return;
    setProdLoading(true);
    try {
      const res = await fetch(`/api/cj/search?q=${encodeURIComponent(cjQuery)}`);
      if (res.ok) { const d = await res.json(); setCjResults(d.products || d.data || []); }
    } catch { /* */ }
    setProdLoading(false);
  };

  const importCj = async (p: any) => {
    setProdLoading(true);
    try {
      const res = await fetch("/api/cj/import", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": "" },
        body: JSON.stringify({ product: p, margin: cjMargin }),
      });
      if (res.ok) setCjImported(prev => [...prev, p.pid || p.id]);
    } catch { /* */ }
    setProdLoading(false);
  };

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

  const goToOrders = (status?: string) => {
    setStatusFilter(status || "ALL");
    setSearch("");
    setTab("orders");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Maloune Admin</h1>
            <button onClick={() => { fetchStats(); if (tab === "orders") fetchOrders(); if (tab === "customers") fetchCustomers(); }}
              className="text-gray-400 hover:text-gray-600 p-2"><RefreshCw className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-1 mt-2 overflow-x-auto">
            {([
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "orders", label: "Commandes", icon: ShoppingCart },
              { id: "customers", label: "Clients", icon: Users },
              { id: "products", label: "Produits", icon: Package },
            ] as const).map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setSearch(""); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${tab === t.id ? "bg-orange-100 text-orange-700" : "text-gray-500 hover:bg-gray-100"}`}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* DASHBOARD TAB */}
        {tab === "dashboard" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={ShoppingCart} label="Total commandes" value={String(stats.overview.totalOrders)} color="bg-blue-100 text-blue-600" onClick={() => goToOrders()} />
              <StatCard icon={DollarSign} label="Revenu total" value={fmt(stats.overview.totalRevenue)} color="bg-green-100 text-green-600" onClick={() => goToOrders("PAID")} />
              <StatCard icon={Users} label="Clients" value={String(stats.overview.totalCustomers)} color="bg-purple-100 text-purple-600" onClick={() => { setSearch(""); setTab("customers"); }} />
              <StatCard icon={Clock} label="En attente" value={String(stats.overview.pendingOrders)} color="bg-yellow-100 text-yellow-600" onClick={() => goToOrders("PENDING")} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div onClick={() => goToOrders()} className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer hover:shadow-md hover:border-orange-200 transition">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">{"Aujourd'hui"}</h3>
                <p className="text-2xl font-bold text-gray-900">{fmt(stats.today.revenue)}</p>
                <p className="text-sm text-gray-400">{stats.today.orders} commande{stats.today.orders !== 1 ? "s" : ""}</p>
              </div>
              <div onClick={() => goToOrders()} className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer hover:shadow-md hover:border-orange-200 transition">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Cette semaine</h3>
                <p className="text-2xl font-bold text-gray-900">{fmt(stats.week.revenue)}</p>
                <p className="text-sm text-gray-400">{stats.week.orders} commandes</p>
              </div>
              <div onClick={() => goToOrders()} className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer hover:shadow-md hover:border-orange-200 transition">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Ce mois</h3>
                <p className="text-2xl font-bold text-gray-900">{fmt(stats.month.revenue)}</p>
                <p className="text-sm text-gray-400">{stats.month.orders} commandes</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div onClick={() => goToOrders("PAID")} className="bg-blue-50 rounded-xl p-4 text-center cursor-pointer hover:shadow-md hover:bg-blue-100 transition">
                <p className="text-2xl font-bold text-blue-700">{stats.overview.paidOrders}</p>
                <p className="text-xs text-blue-600">Payées</p>
              </div>
              <div onClick={() => goToOrders("SHIPPED")} className="bg-indigo-50 rounded-xl p-4 text-center cursor-pointer hover:shadow-md hover:bg-indigo-100 transition">
                <p className="text-2xl font-bold text-indigo-700">{stats.overview.shippedOrders}</p>
                <p className="text-xs text-indigo-600">Expédiées</p>
              </div>
              <div onClick={() => goToOrders("PENDING")} className="bg-yellow-50 rounded-xl p-4 text-center cursor-pointer hover:shadow-md hover:bg-yellow-100 transition">
                <p className="text-2xl font-bold text-yellow-700">{stats.overview.pendingOrders}</p>
                <p className="text-xs text-yellow-600">En attente</p>
              </div>
            </div>

            {stats.recentOrders?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-between">Commandes récentes<button onClick={() => goToOrders()} className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">Voir tout <ChevronRight className="w-3 h-3" /></button></h3>
                <div className="space-y-2">
                  {stats.recentOrders.map((o: any) => (
                    <div key={o.orderNumber} onClick={() => goToOrders()} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2 transition">
                      <div>
                        <span className="font-medium text-gray-900 text-sm">{o.orderNumber}</span>
                        <span className="text-xs text-gray-400 ml-2">{o.customerEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_MAP[o.status]?.color || "bg-gray-100"}`}>
                          {STATUS_MAP[o.status]?.label || o.status}
                        </span>
                        <span className="font-bold text-sm">{fmt(Number(o.totalAmount))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {tab === "dashboard" && !stats && (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
        )}

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Rechercher..." value={search}
                  onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchOrders()}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="ALL">Tous</option>
                {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            <p className="text-sm text-gray-400 mb-3">{orderTotal} commande{orderTotal !== 1 ? "s" : ""}</p>

            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
            ) : (
              <div className="space-y-2">
                {orders.map((o: any) => (
                  <button key={o.id} onClick={() => { setSelectedOrder(o); setEditStatus(o.status); setEditTracking(""); setEditCarrier(""); setEditNote(o.internalNote || ""); }}
                    className="w-full bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-900 text-sm">{o.orderNumber}</span>
                        <span className="text-xs text-gray-400 ml-2">{o.customerEmail || "—"}</span>
                      </div>
                      <span className="font-bold text-gray-900">{fmt(Number(o.totalAmount))}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_MAP[o.status]?.color || "bg-gray-100"}`}>
                        {STATUS_MAP[o.status]?.label || o.status}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString("fr-FR")} {new Date(o.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{o.shippingCustomerName} — {o.items?.length || 0} article{(o.items?.length || 0) !== 1 ? "s" : ""}</div>
                  </button>
                ))}
                {orders.length === 0 && <p className="text-center text-gray-400 py-10">Aucune commande</p>}
              </div>
            )}

            {/* Order detail modal */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
                <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">{selectedOrder.orderNumber}</h2>
                    <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div><span className="text-gray-500">Client:</span> <span className="font-medium">{selectedOrder.shippingCustomerName}</span></div>
                    <div><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedOrder.customerEmail}</span></div>
                    <div><span className="text-gray-500">Adresse:</span> <span className="font-medium">{selectedOrder.shippingAddress}, {selectedOrder.shippingCity} {selectedOrder.shippingPostalCode}</span></div>
                    <div><span className="text-gray-500">Date:</span> <span className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString("fr-FR")}</span></div>

                    <div className="border-t border-gray-100 pt-3">
                      <h3 className="font-semibold mb-2">Articles</h3>
                      {selectedOrder.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between py-1">
                          <span>{item.productName} x{item.quantity}</span>
                          <span className="font-medium">{fmt(Number(item.totalPrice))}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span>{fmt(Number(selectedOrder.totalAmount))}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3">
                      <button onClick={() => resendEmail(selectedOrder.id)} disabled={resending}
                        className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                        {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Renvoyer email de confirmation
                      </button>
                      {resendMsg && (
                        <p className={`text-xs text-center mt-2 ${resendMsg.startsWith("Ere") ? "text-red-500" : "text-green-600"}`}>
                          {resendMsg}
                        </p>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-3">
                      <h3 className="font-semibold text-sm mb-2">Commander chez le fournisseur</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <a href="https://www.printful.com/dashboard/default/orders" target="_blank" rel="noopener noreferrer"
                          className="py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 flex items-center justify-center gap-1 text-xs">
                          <Package className="w-3.5 h-3.5" /> Printful
                        </a>
                        <a href="https://app.cjdropshipping.com/order" target="_blank" rel="noopener noreferrer"
                          className="py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 flex items-center justify-center gap-1 text-xs">
                          <Truck className="w-3.5 h-3.5" /> CJ Dropshipping
                        </a>
                      </div>
                      <button onClick={() => orderOnCJ(selectedOrder.id)} disabled={cjOrdering}
                        className="w-full mt-2 py-1.5 border border-green-300 text-green-700 rounded-lg text-xs hover:bg-green-50 disabled:opacity-50 flex items-center justify-center gap-1">
                        {cjOrdering ? <Loader2 className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3" />}
                        Auto CJ (API)
                      </button>
                      {cjMsg && (
                        <p className={`text-xs text-center mt-1 ${cjMsg.startsWith("Echwe") || cjMsg.startsWith("Ere") || cjMsg.startsWith("Pas") ? "text-red-500" : "text-green-600"}`}>
                          {cjMsg}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">Dad Hat \u2192 Printful | AirPods Case \u2192 CJ</p>
                    </div>

                    <div className="border-t border-gray-100 pt-3 space-y-2">
                      <h3 className="font-semibold">Modifier</h3>
                      <div>
                        <label className="text-xs text-gray-500">Statut</label>
                        <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm mt-1">
                          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Numéro de suivi</label>
                        <input type="text" value={editTracking} onChange={e => setEditTracking(e.target.value)}
                          placeholder="Tracking number" className="w-full px-3 py-2 border rounded-lg text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Transporteur</label>
                        <input type="text" value={editCarrier} onChange={e => setEditCarrier(e.target.value)}
                          placeholder="Colissimo, DPD, etc." className="w-full px-3 py-2 border rounded-lg text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Note interne</label>
                        <textarea value={editNote} onChange={e => setEditNote(e.target.value)}
                          placeholder="Note visible uniquement par l'admin" className="w-full px-3 py-2 border rounded-lg text-sm mt-1" rows={2} />
                      </div>
                      <button onClick={updateOrder} disabled={saving}
                        className="w-full py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Enregistrer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {tab === "customers" && (
          <div>
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Rechercher par email, nom..." value={search}
                onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchCustomers()}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>

            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
            ) : (
              <>
                {customers.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Clients inscrits ({customers.length})</h3>
                    <div className="space-y-2">
                      {customers.map((c: any) => (
                        <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-gray-900 text-sm">{c.firstName || ""} {c.lastName || ""}</span>
                              <span className="text-xs text-gray-400 ml-2">{c.email}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">{c._count.orders} cmd</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Inscrit {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                            {c.lastLoginAt && <> — Dernière connexion {new Date(c.lastLoginAt).toLocaleDateString("fr-FR")}</>}
                            {c.phone && <> — {c.phone}</>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {orderEmails.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Tous les acheteurs par email</h3>
                    <div className="space-y-2">
                      {orderEmails.map((e: any) => (
                        <div key={e.customerEmail} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{e.customerEmail}</span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900">{fmt(Number(e._sum?.totalAmount || 0))}</span>
                            <span className="text-xs text-gray-400 ml-2">{e._count.id} cmd</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {customers.length === 0 && orderEmails.length === 0 && (
                  <p className="text-center text-gray-400 py-10">Aucun client</p>
                )}
              </>
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab === "products" && (
          <div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setProdTab("manual")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${prodTab === "manual" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>
                <Plus className="w-4 h-4 inline mr-1" /> Ajouter
              </button>
              <button onClick={() => setProdTab("cj")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${prodTab === "cj" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>
                <Search className="w-4 h-4 inline mr-1" /> CJ Dropshipping
              </button>
            </div>

            {prodError && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-3">{prodError}</div>}
            {prodSuccess && <div className="bg-green-50 text-green-600 text-sm rounded-lg p-3 mb-3">{prodSuccess}</div>}

            {prodTab === "manual" && (
              <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
                <input type="text" placeholder="Nom du produit" value={product.name}
                  onChange={e => setProduct({ ...product, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-sm" />
                <input type="text" placeholder="URL image" value={product.image}
                  onChange={e => setProduct({ ...product, image: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Prix coûtant" value={product.costPrice || ""}
                    onChange={e => setProduct({ ...product, costPrice: parseFloat(e.target.value) || 0 })}
                    className="px-4 py-2 border rounded-lg text-sm" />
                  <input type="number" placeholder="Prix de vente" value={product.sellPrice || ""}
                    onChange={e => setProduct({ ...product, sellPrice: parseFloat(e.target.value) || 0 })}
                    className="px-4 py-2 border rounded-lg text-sm" />
                </div>
                <select value={product.category} onChange={e => setProduct({ ...product, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-sm">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <textarea placeholder="Description" value={product.description}
                  onChange={e => setProduct({ ...product, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-sm" rows={3} />
                <button onClick={saveProduct} disabled={prodLoading}
                  className="w-full py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50">
                  {prodLoading ? "Enregistrement..." : "Ajouter le produit"}
                </button>
              </div>
            )}

            {prodTab === "cj" && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input type="text" placeholder="Rechercher sur CJ..." value={cjQuery}
                    onChange={e => setCjQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && searchCj()}
                    className="flex-1 px-4 py-2 border rounded-lg text-sm" />
                  <button onClick={searchCj} disabled={prodLoading}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium">
                    {prodLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Chercher"}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Marge:</span>
                  <input type="number" value={cjMargin} onChange={e => setCjMargin(parseFloat(e.target.value) || 2)}
                    className="w-16 px-2 py-1 border rounded text-sm" step="0.5" />
                  <span className="text-gray-400">x</span>
                </div>
                {cjResults.map((p: any) => (
                  <div key={p.pid || p.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                    {p.productImage && <img src={p.productImage} alt="" className="w-14 h-14 rounded object-cover" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.productNameEn || p.name}</p>
                      <p className="text-xs text-gray-500">{fmt(Number(p.sellPrice || 0))} → {fmt(Number(p.sellPrice || 0) * cjMargin)}</p>
                    </div>
                    <button onClick={() => importCj(p)} disabled={cjImported.includes(p.pid || p.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${cjImported.includes(p.pid || p.id) ? "bg-green-100 text-green-600" : "bg-orange-500 text-white"}`}>
                      {cjImported.includes(p.pid || p.id) ? "Importé" : "Importer"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function AdminPage() {
  return <AdminGuard><AdminDashboard /></AdminGuard>;
}
